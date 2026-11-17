import type { Pool, PoolClient, QueryResultRow } from "pg";
import { kinds, toPublishedSnapshot, validateDraft, validateId, validatePublish, type CmsAsset, type CmsEntry } from "../model";
import { CmsError, type CmsRepository, type EntryInput } from "./api";

const entryColumns = `id, kind, draft, published, sort_order AS "order", published_order AS "publishedOrder", revision, source_note AS "sourceNote", updated_at AS "updatedAt"`;
const assetColumns = `id, object_key AS key, mime, width, height, size, sha256`;
type Queryable = Pick<PoolClient, "query">;

function entry(row: QueryResultRow): CmsEntry {
  return { ...row, updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt } as CmsEntry;
}
async function list(db: Queryable) {
  const records = await db.query(`SELECT ${entryColumns} FROM cms.entries ORDER BY sort_order, id`);
  const images = await db.query(`SELECT ${assetColumns} FROM cms.assets ORDER BY created_at, id`);
  return { entries: records.rows.map(entry), assets: images.rows as CmsAsset[] };
}
function invalid<T>(operation: () => T): T {
  try { return operation(); }
  catch (error) { throw new CmsError(422, error instanceof Error ? error.message : "Invalid content."); }
}
function normalize(input: EntryInput): EntryInput {
  return invalid(() => {
    const id = validateId(input.id);
    if (!kinds.includes(input.kind)) throw new Error("Invalid content type.");
    if ((input.kind === "home" && id !== "home") || (input.kind === "about" && id !== "about") || (!['home', 'about'].includes(input.kind) && ['home', 'about'].includes(id))) throw new Error("Home and About use their reserved IDs.");
    if (!Number.isSafeInteger(input.order) || input.order < 0 || input.order > 100000) throw new Error("Order must be a whole number between 0 and 100000.");
    if (typeof input.sourceNote !== "string" || input.sourceNote.length > 20000) throw new Error("Invalid source note.");
    return { ...input, id, draft: validateDraft(input.kind, input.draft), sourceNote: input.sourceNote.trim() };
  });
}
function current(entries: CmsEntry[], id: string, revision: number) {
  const found = entries.find(record => record.id === id);
  if (!found) throw new CmsError(404, "Record not found.");
  if (!Number.isSafeInteger(revision) || revision < 1) throw new CmsError(400, "A valid record revision is required.");
  if (found.revision !== revision) throw new CmsError(409, "This record changed in another window. Reload it before saving; your unsaved text is still here.");
  return found;
}

export function createRepository(pool: Pool): CmsRepository {
  async function transaction<T>(work: (db: PoolClient) => Promise<T>): Promise<T> {
    const db = await pool.connect();
    try {
      await db.query("BEGIN");
      // Serialize small CMS mutations so publication and reference checks stay atomic.
      await db.query("SELECT pg_advisory_xact_lock(71388246)");
      const value = await work(db);
      await db.query("COMMIT");
      return value;
    } catch (error) {
      await db.query("ROLLBACK").catch(() => undefined);
      if ((error as { code?: string }).code === "23505") throw new CmsError(409, "A record with this ID already exists.");
      throw error;
    } finally { db.release(); }
  }
  return {
    list: () => list(pool),
    create: async (raw) => {
      const input = normalize(raw);
      return transaction(async db => {
        const result = await db.query(`INSERT INTO cms.entries(id, kind, draft, sort_order, source_note) VALUES ($1,$2,$3,$4,$5) RETURNING ${entryColumns}`, [input.id, input.kind, input.draft, input.order, input.sourceNote]);
        return entry(result.rows[0]);
      });
    },
    update: async (id, raw) => {
      const input = normalize(raw);
      if (input.id !== id) throw new CmsError(422, "Record IDs cannot change.");
      return transaction(async db => {
        const records = await list(db);
        const found = current(records.entries, id, input.revision!);
        if (found.kind !== input.kind) throw new CmsError(422, "Content types cannot change.");
        const result = await db.query(`UPDATE cms.entries SET draft=$1, sort_order=$2, source_note=$3, revision=revision+1, updated_at=now() WHERE id=$4 RETURNING ${entryColumns}`, [input.draft, input.order, input.sourceNote, id]);
        return entry(result.rows[0]);
      });
    },
    publish: (id, revision) => transaction(async db => {
      const records = await list(db);
      const found = current(records.entries, id, revision);
      invalid(() => validatePublish(found));
      const candidate = records.entries.map(record => record.id === id ? { ...record, published: record.draft, publishedOrder: record.order } : record);
      invalid(() => toPublishedSnapshot(candidate, records.assets));
      const result = await db.query(`UPDATE cms.entries SET published=draft, published_order=sort_order, revision=revision+1, updated_at=now() WHERE id=$1 RETURNING ${entryColumns}`, [id]);
      return entry(result.rows[0]);
    }),
    unpublish: (id, revision) => transaction(async db => {
      const records = await list(db);
      const found = current(records.entries, id, revision);
      if (found.kind === "home" || found.kind === "about") throw new CmsError(422, "Home and About must stay published.");
      invalid(() => toPublishedSnapshot(records.entries.map(record => record.id === id ? { ...record, published: null, publishedOrder: null } : record), records.assets));
      const result = await db.query(`UPDATE cms.entries SET published=NULL, published_order=NULL, revision=revision+1, updated_at=now() WHERE id=$1 RETURNING ${entryColumns}`, [id]);
      return entry(result.rows[0]);
    }),
    remove: (id, revision) => transaction(async db => {
      const records = await list(db);
      const found = current(records.entries, id, revision);
      if (found.kind === "home" || found.kind === "about" || found.published !== null) throw new CmsError(422, "Unpublish this record before deleting it. Home and About cannot be deleted.");
      if (records.entries.some(record => record.id !== id && (record.draft.relatedIds?.includes(id) || record.published?.relatedIds?.includes(id)))) throw new CmsError(422, "Remove references to this record before deleting it.");
      await db.query("DELETE FROM cms.entries WHERE id=$1", [id]);
    }),
    getAsset: async id => {
      const result = await pool.query(`SELECT ${assetColumns} FROM cms.assets WHERE id=$1`, [id]);
      if (!result.rows[0]) throw new CmsError(404, "Image not found.");
      return result.rows[0] as CmsAsset;
    },
    addAsset: asset => transaction(async db => {
      await db.query("INSERT INTO cms.assets(id,object_key,mime,width,height,size,sha256) VALUES ($1,$2,$3,$4,$5,$6,$7)", [asset.id, asset.key, asset.mime, asset.width, asset.height, asset.size, asset.sha256]);
    }),
  };
}
