import { expect, test } from "@playwright/test";
import { generateKeyPair, SignJWT } from "jose";
import sharp from "sharp";
import type { Pool, PoolClient } from "pg";
import { seedEntries, type CmsAsset, type CmsEntry } from "../cms/model";
import { CmsError, createCmsHandler, type CmsRepository, type CmsStorage } from "../cms/server/api";
import { createTokenVerifier } from "../cms/server/auth";
import { createRepository } from "../cms/server/repository";
import { prepareImage } from "../cms/server/storage";

const origin = "https://cms.example.test";
const issuer = "https://auth.example.test";
const owner = "approved-owner-id";
const asset: CmsAsset = { id: "image", key: "images/image.webp", mime: "image/webp", width: 2, height: 2, size: 12, sha256: "a".repeat(64) };

async function fixture() {
  const { publicKey, privateKey } = await generateKeyPair("EdDSA");
  let calls = 0;
  const repository: CmsRepository = {
    list: async () => { calls++; return { entries: [], assets: [] }; },
    create: async input => ({ ...input, revision: 1, published: null, publishedOrder: null, updatedAt: new Date(0).toISOString() }),
    update: async () => { throw new CmsError(409, "This record changed in another window."); },
    publish: async () => { throw new CmsError(422, "Verified source note is required."); },
    unpublish: async () => { throw new CmsError(422, "Home and About must stay published."); },
    remove: async () => undefined,
    getAsset: async () => asset,
    addAsset: async () => { calls++; },
  };
  const storage: CmsStorage = {
    upload: async () => asset,
    preview: async () => "https://storage.example.test/short-lived",
    remove: async () => undefined,
  };
  const handler = createCmsHandler({ repository, storage, ownerId: owner, allowedOrigins: [origin], verifyToken: createTokenVerifier(async () => publicKey, issuer) });
  const token = (sub = owner, tokenIssuer = issuer, expired = false) => new SignJWT({}).setProtectedHeader({ alg: "EdDSA" }).setSubject(sub).setIssuer(tokenIssuer).setIssuedAt().setExpirationTime(expired ? Math.floor(Date.now() / 1000) - 1 : "5m").sign(privateKey);
  return { handler, repository, storage, token, calls: () => calls };
}

test("CMS verifies signed, unexpired owner tokens before any data access", async () => {
  const f = await fixture();
  for (const [token, status] of [[undefined, 401], ["forged", 401], [await f.token(owner, issuer, true), 401], [await f.token(owner, "https://other-auth.example.test"), 401], [await f.token("unapproved-user"), 403]] as const) {
    const response = await f.handler(new Request(`${origin}/entries`, { headers: token ? { Authorization: `Bearer ${token}`, Origin: origin } : { Origin: origin } }));
    expect(response.status).toBe(status);
    expect(response.headers.get("cache-control")).toBe("no-store");
  }
  expect(f.calls()).toBe(0);
  const response = await f.handler(new Request(`${origin}/entries`, { headers: { Authorization: `Bearer ${await f.token()}`, Origin: origin } }));
  expect(response.status).toBe(200);
  expect(f.calls()).toBe(1);
});

test("CMS CORS is an exact origin allowlist and preflight never reads content", async () => {
  const f = await fixture();
  const denied = await f.handler(new Request(`${origin}/entries`, { headers: { Authorization: `Bearer ${await f.token()}`, Origin: "https://cms.example.test.attacker.test" } }));
  expect(denied.status).toBe(403);
  expect(denied.headers.get("access-control-allow-origin")).toBeNull();
  const preflight = await f.handler(new Request(`${origin}/entries`, { method: "OPTIONS", headers: { Origin: origin } }));
  expect(preflight.status).toBe(204);
  expect(preflight.headers.get("access-control-allow-origin")).toBe(origin);
  expect(preflight.headers.get("access-control-allow-methods")).toContain("PUT");
  expect(f.calls()).toBe(0);
});

test("CMS handles malformed requests, edit conflicts, and safe backend errors", async () => {
  const f = await fixture();
  const headers = { Authorization: `Bearer ${await f.token()}`, "Content-Type": "application/json", Origin: origin };
  const malformed = await f.handler(new Request(`${origin}/entries`, { method: "POST", headers, body: "{" }));
  expect(malformed.status).toBe(400);
  const oversized = await f.handler(new Request(`${origin}/entries`, { method: "POST", headers, body: "x".repeat(262145) }));
  expect(oversized.status).toBe(413);
  const conflict = await f.handler(new Request(`${origin}/entries/home`, { method: "PUT", headers, body: "{}" }));
  expect(conflict.status).toBe(409);
  const validation = await f.handler(new Request(`${origin}/entries/home/publish`, { method: "POST", headers, body: JSON.stringify({ revision: 1 }) }));
  expect(validation.status).toBe(422);
  f.repository.list = async () => { throw new Error("postgres://private-password@private-host"); };
  const unavailable = await f.handler(new Request(`${origin}/entries`, { headers }));
  expect(unavailable.status).toBe(503);
  expect(await unavailable.text()).not.toMatch(/private-password|postgres:|private-host/);
});

test("CMS image uploads clean up storage when metadata cannot be saved", async () => {
  const f = await fixture();
  let removed = false;
  f.storage.remove = async value => { expect(value.id).toBe(asset.id); removed = true; };
  f.repository.addAsset = async () => { throw new Error("Database offline"); };
  const data = new FormData();
  data.set("file", new File([new Uint8Array([1, 2])], "ignored-name.png", { type: "image/png" }));
  const response = await f.handler(new Request(`${origin}/assets`, { method: "POST", headers: { Authorization: `Bearer ${await f.token()}`, Origin: origin }, body: data }));
  expect(response.status).toBe(503);
  expect(removed).toBe(true);
  const preview = await f.handler(new Request(`${origin}/assets/image/url`, { headers: { Authorization: `Bearer ${await f.token()}` } }));
  expect(await preview.json()).toEqual({ url: "https://storage.example.test/short-lived" });
});

test("CMS converts validated raster bytes to WebP and rejects scripts or oversized images", async () => {
  const png = await sharp({ create: { width: 2, height: 3, channels: 3, background: "#ddd" } }).png().toBuffer();
  const image = await prepareImage(png);
  expect(image.width).toBe(2); expect(image.height).toBe(3);
  expect(image.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect((await sharp(image.bytes).metadata()).format).toBe("webp");
  await expect(prepareImage(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>alert(1)</script></svg>'))).rejects.toThrow("valid, still PNG");
  await expect(prepareImage(new Uint8Array(5242881))).rejects.toThrow("5 MB");
  const huge = await sharp({ create: { width: 4097, height: 1, channels: 3, background: "#ddd" } }).png().toBuffer();
  await expect(prepareImage(huge)).rejects.toThrow("4096");
});

function fakePool(entries: CmsEntry[]) {
  const statements: string[] = [];
  const query = async (sql: string) => {
    statements.push(sql);
    if (sql.includes("FROM cms.entries")) return { rows: structuredClone(entries) };
    if (sql.includes("FROM cms.assets")) return { rows: [] };
    return { rows: [] };
  };
  const client = { query, release: () => undefined } as unknown as PoolClient;
  return { pool: { query, connect: async () => client } as unknown as Pool, statements };
}
const publishedSeeds = (): CmsEntry[] => seedEntries.map(value => ({ ...structuredClone(value), published: value.draft, publishedOrder: value.order }));

test("repository rejects stale edits, deleting published records, and referenced drafts atomically", async () => {
  const entries = publishedSeeds();
  const f = fakePool(entries);
  const repository = createRepository(f.pool);
  await expect(repository.update("home", { ...entries[0], revision: 99 })).rejects.toMatchObject({ status: 409 });
  await expect(repository.remove("home", 1)).rejects.toMatchObject({ status: 422 });
  entries[2].published = null; entries[2].publishedOrder = null;
  entries[3].draft.relatedIds = [entries[2].id];
  await expect(repository.remove(entries[2].id, 1)).rejects.toThrow("Remove references");
  expect(f.statements.some(sql => /^(UPDATE|DELETE|INSERT)/.test(sql))).toBe(false);
  expect(f.statements.filter(sql => sql === "ROLLBACK")).toHaveLength(3);
});

test("repository blocks publications with broken references and prevents dependent unpublishing", async () => {
  const entries = publishedSeeds();
  entries[2].draft.relatedIds = ["missing"];
  const f = fakePool(entries), repository = createRepository(f.pool);
  await expect(repository.publish(entries[2].id, 1)).rejects.toThrow("Unknown related ID");
  entries[2].draft.relatedIds = [];
  entries[3].published = { ...entries[3].published, relatedIds: [entries[2].id] };
  await expect(repository.unpublish(entries[2].id, 1)).rejects.toThrow("Unknown related ID");
  expect(f.statements.some(sql => /^UPDATE/.test(sql))).toBe(false);
  await expect(repository.create({ id: "home", kind: "person", order: 0, draft: {}, sourceNote: "" })).rejects.toThrow("reserved IDs");
});
