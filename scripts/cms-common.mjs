import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { decodePublished, assetPublicPath, validateSnapshot } from '../cms/model.ts';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const cacheDirectory = resolve(root, '.cms');
export const assetDirectory = resolve(root, 'public', 'cms-assets');
export const snapshotFile = resolve(cacheDirectory, 'snapshot.json');

export function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} privately before running this command`);
  return value;
}

export function database(name) {
  const connectionString = required(name);
  const url = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error(`Invalid ${name}`);
  if (!url.searchParams.has('sslmode') && !['localhost', '127.0.0.1'].includes(url.hostname)) url.searchParams.set('sslmode', 'verify-full');
  return new pg.Pool({ connectionString: url.toString(), max: 1, connectionTimeoutMillis: 15_000, idleTimeoutMillis: 1000 });
}

export function storage(prefix = 'CMS_STORAGE_') {
  const endpoint = required(`${prefix}ENDPOINT`);
  if (new URL(endpoint).protocol !== 'https:') throw new Error('Object storage endpoint must use HTTPS');
  return new S3Client({
    endpoint,
    region: process.env[`${prefix}REGION`] || 'us-east-1',
    forcePathStyle: true,
    credentials: { accessKeyId: required(`${prefix}ACCESS_KEY_ID`), secretAccessKey: required(`${prefix}SECRET_ACCESS_KEY`) },
  });
}

export function checkAssetBytes(asset, bytes) {
  if (bytes.length !== asset.size || bytes.length > 10 * 1024 * 1024) throw new Error('Image size does not match its published metadata');
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw new Error('Image checksum does not match its published metadata');
}

export async function downloadAsset(client, bucket, asset) {
  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: asset.key }));
  if (!response.Body || Number(response.ContentLength || 0) > 10 * 1024 * 1024) throw new Error('Missing or oversized image');
  const bytes = Buffer.from(await response.Body.transformToByteArray());
  checkAssetBytes(asset, bytes);
  return bytes;
}

export async function readPublished() {
  const pool = database('CMS_READ_DATABASE_URL');
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const { rows: records } = await client.query('SELECT * FROM cms.published_entries ORDER BY "order", id');
    const { rows: assets } = await client.query('SELECT * FROM cms.published_assets ORDER BY id');
    const content = decodePublished(records, assets);
    await client.query('COMMIT');
    return { content, records, assets };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

export async function stagePublished({ content, assets }) {
  await mkdir(cacheDirectory, { recursive: true });
  const temporary = resolve(cacheDirectory, `assets-${randomUUID()}`);
  await mkdir(temporary);
  let client;
  try {
    if (assets.length) client = storage();
    for (const asset of assets) {
      const file = assetPublicPath(asset).split('/').at(-1);
      if (!file || file.includes('..')) throw new Error('Invalid public image path');
      const bytes = await downloadAsset(client, required('CMS_STORAGE_BUCKET'), asset);
      await writeFile(resolve(temporary, file), bytes);
    }
    if (assetDirectory !== resolve(root, 'public', 'cms-assets') || !assetDirectory.startsWith(`${root}${sep}`)) throw new Error('Unsafe asset destination');
    await rm(assetDirectory, { recursive: true, force: true });
    await rename(temporary, assetDirectory);
    await writeFile(snapshotFile, `${JSON.stringify({ version: 1, content }, null, 2)}\n`, { mode: 0o600 });
  } finally {
    client?.destroy();
    await rm(temporary, { recursive: true, force: true });
  }
}

export async function readSnapshot() {
  const snapshot = JSON.parse(await readFile(snapshotFile, 'utf8'));
  if (snapshot.version !== 1 || !snapshot.content) throw new Error('Invalid private content snapshot');
  return validateSnapshot(snapshot.content);
}

export function reportFailure(error) {
  // Connection errors can contain credentials; print only our controlled messages.
  const message = error instanceof Error && !/postgres(?:ql)?:|secret|password|credential|access.key|token=/i.test(error.message) ? error.message : 'CMS command failed; check private configuration and service availability';
  console.error(message);
  process.exitCode = 1;
}
