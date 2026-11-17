import { build } from 'esbuild';
// Windows Neon CLI cannot spawn npm.cmd for native-package staging.
await build({ entryPoints: ['functions/cms.ts'], outfile: '.cms/function/index.mjs', bundle: true, platform: 'node', target: 'node24', format: 'esm', external: ['sharp'], banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" } });
await build({ entryPoints: ['functions/game.ts'], outfile: '.cms/game-function/index.mjs', bundle: true, platform: 'node', target: 'node24', format: 'esm', banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" } });
