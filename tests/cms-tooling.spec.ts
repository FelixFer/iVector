import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";

test("CMS image downloads require exact size and checksum", () => {
  const result = spawnSync(process.execPath, ["--input-type=module"], { encoding: "utf8", timeout: 15_000, input: `
    import assert from 'node:assert/strict';
    import { createHash } from 'node:crypto';
    import { checkAssetBytes, downloadAsset } from './scripts/cms-common.mjs';
    const bytes = Buffer.from('test-only image bytes');
    const asset = { id: 'test', key: 'images/test.webp', mime: 'image/webp', width: 1, height: 1, size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
    checkAssetBytes(asset, bytes);
    assert.throws(() => checkAssetBytes({ ...asset, size: 1 }, bytes), /size/);
    assert.throws(() => checkAssetBytes({ ...asset, sha256: '0'.repeat(64) }, bytes), /checksum/);
    const downloaded = await downloadAsset({ send: async () => ({ ContentLength: bytes.length, Body: { transformToByteArray: async () => bytes } }) }, 'private-test', asset);
    assert.deepEqual(downloaded, bytes);
    await assert.rejects(downloadAsset({ send: async () => ({ ContentLength: 11 * 1024 * 1024 }) }, 'private-test', asset), /oversized/);
  ` });
  expect(result.status, result.stderr).toBe(0);
});

test("CMS commands fail safely without credentials or explicit restore target", () => {
  const environment = { ...Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("CMS_"))), NODE_ENV: process.env.NODE_ENV };
  for (const [script, message] of [["cms-check.mjs", "Set CMS_READ_DATABASE_URL privately"], ["cms-setup.mjs", "Set CMS_SETUP_DATABASE_URL privately"], ["cms-backup.mjs", "Set CMS_BACKUP_DATABASE_URL privately"], ["cms-restore.mjs", "--confirm-empty-test-target"]]) {
    const result = spawnSync(process.execPath, [`scripts/${script}`], { encoding: "utf8", env: environment, timeout: 15_000 });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(message);
    expect(result.stdout).not.toContain("postgresql://");
  }
});
