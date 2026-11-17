import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root, database, reportFailure } from './cms-common.mjs';
import { seedEntries } from '../cms/model.ts';

try {
  const pool = database('CMS_SETUP_DATABASE_URL');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(await readFile(resolve(root, 'cms/migrations/001_cms.sql'), 'utf8'));
    const { rows: counts } = await client.query('SELECT count(*)::int AS count FROM cms.entries');
    const schemaOnly = process.argv.includes('--schema-only');
    if (counts[0].count === 0 && !schemaOnly) {
      for (const entry of seedEntries) {
        await client.query(`INSERT INTO cms.entries (id, kind, draft, published, sort_order, published_order, source_note)
          VALUES ($1, $2, $3, $3, $4, $4, $5)`,
        [entry.id, entry.kind, JSON.stringify(entry.draft), entry.order, entry.sourceNote]);
      }
    } else if (!schemaOnly) {
      const { rows } = await client.query("SELECT kind FROM cms.entries WHERE kind IN ('home','about') AND published IS NOT NULL");
      if (!rows.some(row => row.kind === 'home') || !rows.some(row => row.kind === 'about')) throw new Error('Existing CMS needs published Home and About records; repair them before setup. No existing records were changed');
    }
    await client.query('COMMIT');
    console.log(schemaOnly ? 'CMS schema ready; no content seeded.' : counts[0].count === 0 ? 'CMS schema ready. Imported only the seven already-approved Home/About/member records as the initial published site.' : 'CMS schema ready. Existing records and drafts were preserved.');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); await pool.end(); }
} catch (error) { reportFailure(error); }
