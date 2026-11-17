import type { CmsAsset, CmsEntry, CmsFields, CmsKind } from "../model";

export class CmsError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}

export type EntryInput = { id: string; kind: CmsKind; order: number; draft: CmsFields; sourceNote: string; revision?: number };
export type CmsRepository = {
  list(): Promise<{ entries: CmsEntry[]; assets: CmsAsset[] }>;
  create(input: EntryInput): Promise<CmsEntry>;
  update(id: string, input: EntryInput): Promise<CmsEntry>;
  publish(id: string, revision: number): Promise<CmsEntry>;
  unpublish(id: string, revision: number): Promise<CmsEntry>;
  remove(id: string, revision: number): Promise<void>;
  getAsset(id: string): Promise<CmsAsset>;
  addAsset(asset: CmsAsset): Promise<void>;
};
export type CmsStorage = {
  upload(bytes: Uint8Array): Promise<CmsAsset>;
  preview(asset: CmsAsset): Promise<string>;
  remove(asset: CmsAsset): Promise<void>;
};
type Dependencies = {
  repository: CmsRepository;
  storage: CmsStorage;
  verifyToken(token: string): Promise<string>;
  ownerId: string;
  allowedOrigins: readonly string[];
};

async function readBody(request: Request, maxBytes: number): Promise<Uint8Array<ArrayBuffer>> {
  if (Number(request.headers.get("content-length")) > maxBytes) throw new CmsError(413, "Request is too large.");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new CmsError(413, "Request is too large."); }
      chunks.push(chunk.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

async function body(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new CmsError(415, "Send JSON content.");
  try {
    const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(await readBody(request, 262144)));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch (error) {
    if (error instanceof CmsError) throw error;
    throw new CmsError(400, "Invalid JSON request.");
  }
}

function revision(value: unknown): number {
  if (!Number.isSafeInteger(value) || Number(value) < 1) throw new CmsError(400, "A valid record revision is required.");
  return Number(value);
}

export function createCmsHandler({ repository, storage, verifyToken, ownerId, allowedOrigins }: Dependencies) {
  if (!ownerId || !allowedOrigins.length) throw new Error("Configure the CMS owner and allowed origins.");
  return async function handle(request: Request): Promise<Response> {
    const origin = request.headers.get("origin");
    const headers = new Headers({ "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", Vary: "Origin" });
    const respond = (value: unknown, status = 200) => Response.json(value, { status, headers });
    if (origin && !allowedOrigins.includes(origin)) return respond({ error: "This origin is not allowed." }, 403);
    if (origin) headers.set("Access-Control-Allow-Origin", origin);
    if (request.method === "OPTIONS") {
      if (!origin) return respond({ error: "An allowed origin is required." }, 403);
      headers.set("Access-Control-Allow-Headers", "authorization, content-type");
      headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      return new Response(null, { status: 204, headers });
    }
    try {
      const bearer = request.headers.get("authorization")?.match(/^Bearer ([^\s]+)$/i)?.[1];
      if (!bearer) throw new CmsError(401, "Sign in to continue.");
      let userId: string;
      try { userId = await verifyToken(bearer); }
      catch { throw new CmsError(401, "Your session expired. Sign in again."); }
      if (userId !== ownerId) throw new CmsError(403, "This account does not have dashboard access.");
      const path = new URL(request.url).pathname.replace(/\/$/, "");
      if (path === "/entries" && request.method === "GET") return respond(await repository.list());
      if (path === "/entries" && request.method === "POST") return respond({ entry: await repository.create(await body(request) as EntryInput) }, 201);
      const record = /^\/entries\/([^/]+)(?:\/(publish|unpublish))?$/.exec(path);
      if (record) {
        let id: string;
        try { id = decodeURIComponent(record[1]); } catch { throw new CmsError(400, "Invalid record ID."); }
        const input = await body(request);
        if (!record[2] && request.method === "PUT") return respond({ entry: await repository.update(id, input as EntryInput) });
        if (!record[2] && request.method === "DELETE") { await repository.remove(id, revision(input.revision)); return respond({ ok: true }); }
        if (record[2] === "publish" && request.method === "POST") return respond({ entry: await repository.publish(id, revision(input.revision)) });
        if (record[2] === "unpublish" && request.method === "POST") return respond({ entry: await repository.unpublish(id, revision(input.revision)) });
      }
      if (path === "/assets" && request.method === "POST") {
        const contentType = request.headers.get("content-type") ?? "";
        if (!contentType.startsWith("multipart/form-data;")) throw new CmsError(415, "Choose an image file.");
        const bytes = await readBody(request, 5242880 + 65536);
        let data: FormData;
        try { data = await new Response(bytes, { headers: { "Content-Type": contentType } }).formData(); }
        catch { throw new CmsError(400, "Invalid image upload."); }
        const file = data.get("file");
        if (!(file instanceof File) || file.size < 1 || file.size > 5242880) throw new CmsError(400, "Choose an image no larger than 5 MB.");
        const asset = await storage.upload(new Uint8Array(await file.arrayBuffer()));
        try { await repository.addAsset(asset); }
        catch (error) { await storage.remove(asset).catch(() => undefined); throw error; }
        return respond({ asset }, 201);
      }
      const preview = /^\/assets\/([^/]+)\/url$/.exec(path);
      if (preview && request.method === "GET") {
        const asset = await repository.getAsset(decodeURIComponent(preview[1]));
        return respond({ url: await storage.preview(asset) });
      }
      return respond({ error: "CMS route not found." }, 404);
    } catch (error) {
      if (error instanceof CmsError) return respond({ error: error.message }, error.status);
      // Database, storage, and token details must never enter client errors.
      return respond({ error: "The CMS is unavailable. Your changes were not saved. Try again." }, 503);
    }
  };
}
