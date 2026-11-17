import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { root, readPublished, stagePublished, reportFailure } from './cms-common.mjs';

try {
  await stagePublished(await readPublished());
  const child = spawn(process.execPath, [resolve(root, 'node_modules/next/dist/bin/next'), 'build'], {
    cwd: root, stdio: 'inherit', env: { ...process.env, CMS_CONTENT_SOURCE: 'neon' },
  });
  const exitCode = await new Promise((resolveExit, reject) => {
    child.once('error', reject);
    child.once('exit', code => resolveExit(code ?? 1));
  });
  if (exitCode) throw new Error('Private static build failed');
  console.log('Private export ready in out/. Publishing in the dashboard did not deploy it.');
} catch (error) { reportFailure(error); }
