import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { root, database, storage, required, checkAssetBytes, reportFailure } from './cms-common.mjs';
import { validateDraft, toPublishedSnapshot } from '../cms/model.ts';

try {
  const backupPath = process.argv[2];
  if (!backupPath || !process.argv.includes('--confirm-empty-test-target')) throw new Error('Usage: npm run cms:restore -- <backup-directory> --confirm-empty-test-target');
  const directory = resolve(root, backupPath);
  const backup = JSON.parse(await readFile(resolve(directory, 'content.json'), 'utf8'));
  if (backup.version !== 1 || !Array.isArray(backup.entries) || !Array.isArray(backup.assets) || !backup.source) throw new Error('Invalid CMS backup');
  const target = new URL(required('CMS_RESTORE_DATABASE_URL'));
  if (target.hostname === backup.source.databaseHost) throw new Error('Restore requires a different test-branch endpoint from the backup source');
  if (backup.assets.length && required('CMS_RESTORE_STORAGE_ENDPOINT') === backup.source.storageEndpoint) throw new Error('Restore requires separate test-branch object storage');
  const entries = backup.entries.map(row => ({ id: row.id, kind: row.kind, draft: row.draft, published: row.published, order: row.sort_order, publishedOrder: row.published_order, revision: row.revision, sourceNote: row.source_note, updatedAt: row.updated_at }));
  const assets = backup.assets.map(row => ({ id: row.id, key: row.object_key, mime: row.mime, width: row.width, height: row.height, size: row.size, sha256: row.sha256 }));
  for (const entry of entries) validateDraft(entry.kind, entry.draft);
  // Empty draft-only backups are valid before the first publication.
  if (entries.some(entry => entry.published)) toPublishedSnapshot(entries, assets);
  for (let index = 0; index < assets.length; index++) {
    const bytes = await readFile(resolve(directory, 'files', String(index)));
    checkAssetBytes(assets[index], bytes);
  }
  const pool = database('CMS_RESTORE_DATABASE_URL');
  const client = await pool.connect();
  let objects;
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE cms.entries, cms.assets IN ACCESS EXCLUSIVE MODE');
    const { rows } = await client.query('SELECT (SELECT count(*) FROM cms.entries)::int AS entries, (SELECT count(*) FROM cms.assets)::int AS assets');
    if (rows[0].entries || rows[0].assets) throw new Error('Restore target must have empty CMS tables; existing content was not changed');
    if (assets.length) objects = storage('CMS_RESTORE_STORAGE_');
    for (let index = 0; index < assets.length; index++) {
      const bytes = await readFile(resolve(directory, 'files', String(index)));
      checkAssetBytes(assets[index], bytes);
      await objects.send(new PutObjectCommand({ Bucket: required('CMS_RESTORE_STORAGE_BUCKET'), Key: assets[index].key, Body: bytes, ContentType: assets[index].mime, IfNoneMatch: '*' }));
      const row = backup.assets[index];
      await client.query('INSERT INTO cms.assets(id,object_key,mime,width,height,size,sha256) VALUES($1,$2,$3,$4,$5,$6,$7)', [row.id,row.object_key,row.mime,row.width,row.height,row.size,row.sha256]);
    }
    for (const row of backup.entries) await client.query(`INSERT INTO cms.entries(id,kind,draft,published,sort_order,published_order,revision,source_note,updated_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [row.id,row.kind,JSON.stringify(row.draft),row.published === null ? null : JSON.stringify(row.published),row.sort_order,row.published_order,row.revision,row.source_note,row.updated_at]);
    const { rows: counts } = await client.query('SELECT (SELECT count(*) FROM cms.entries)::int AS entries, (SELECT count(*) FROM cms.assets)::int AS assets');
    if (counts[0].entries !== entries.length || counts[0].assets !== assets.length) throw new Error('Restored record count differs from backup');
    await client.query('COMMIT');
    console.log('Content/media restored into the empty test target. Check its published export; re-enroll an owner separately if needed.');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { objects?.destroy(); client.release(); await pool.end(); }
} catch (error) { reportFailure(error); }
