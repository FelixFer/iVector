import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rm } from 'node:fs/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assetDirectory = resolve(root, 'public/cms-assets');
const reportFailure = () => { console.error('Local static build failed.'); process.exitCode = 1; };

try {
  if (assetDirectory !== resolve(root, 'public/cms-assets')) throw new Error('Unsafe generated asset path');
  await rm(assetDirectory, { recursive: true, force: true });
  const child = spawn(process.execPath, [resolve(root, 'node_modules/next/dist/bin/next'), 'build'], {
    cwd: root, stdio: 'inherit', env: { ...process.env, CMS_CONTENT_SOURCE: 'local' },
  });
  process.exitCode = await new Promise((resolveExit, reject) => {
    child.once('error', reject);
    child.once('exit', code => resolveExit(code ?? 1));
  });
} catch (error) { reportFailure(error); }
