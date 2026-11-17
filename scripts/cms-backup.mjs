import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root, database, storage, required, downloadAsset, reportFailure } from './cms-common.mjs';

try {
  const pool = database('CMS_BACKUP_DATABASE_URL');
  const client = await pool.connect();
  let objects;
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const { rows: entries } = await client.query('SELECT * FROM cms.entries ORDER BY id');
    const { rows: rows } = await client.query('SELECT * FROM cms.assets ORDER BY id');
    const assets = rows.map(row => ({ ...row, key: row.object_key }));
    const directory = resolve(root, 'backups', `${new Date().toISOString().replaceAll(':', '-')}-${randomUUID().slice(0, 8)}`);
    await mkdir(resolve(directory, 'files'), { recursive: true, mode: 0o700 });
    if (assets.length) objects = storage();
    for (let index = 0; index < assets.length; index++) {
      const bytes = await downloadAsset(objects, required('CMS_STORAGE_BUCKET'), assets[index]);
      await writeFile(resolve(directory, 'files', String(index)), bytes, { mode: 0o600 });
    }
    const source = new URL(required('CMS_BACKUP_DATABASE_URL'));
    await writeFile(resolve(directory, 'content.json'), `${JSON.stringify({
      version: 1, createdAt: new Date().toISOString(),
      source: { databaseHost: source.hostname, databaseName: source.pathname, storageEndpoint: process.env.CMS_STORAGE_ENDPOINT || null, bucket: process.env.CMS_STORAGE_BUCKET || null },
      entries, assets: rows,
    }, null, 2)}\n`, { mode: 0o600 });
    await client.query('COMMIT');
    console.log(`Private content/media backup saved: ${directory}`);
    console.log('Authentication accounts, sessions, credentials, and schema ownership are not included.');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { objects?.destroy(); client.release(); await pool.end(); }
} catch (error) { reportFailure(error); }
