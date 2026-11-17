import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root, readSnapshot, reportFailure } from './cms-common.mjs';

try {
  const snapshot = await readSnapshot();
  const pages = ['', 'about', 'research', 'projects', 'people', 'publications', 'virtual-lab', 'dashboard'];
  for (const page of pages) {
    const html = await readFile(resolve(root, 'out', page, 'index.html'), 'utf8');
    assert.match(html, /<main[\s>]/, `Missing main landmark: /${page}`);
  }
  await readFile(resolve(root, 'out/404.html'));
  const people = await readFile(resolve(root, 'out/people/index.html'), 'utf8');
  for (const person of snapshot.people) {
    const escaped = person.name.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;');
    assert.ok(people.includes(escaped), 'A published member is absent from the export');
  }
  const expected = new Set([snapshot.about.environmentPhoto, ...snapshot.people.map(person => person.photo)].filter(Boolean).map(photo => photo.src.split('/').at(-1)));
  let files = [];
  try { files = await readdir(resolve(root, 'out/cms-assets')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  assert.deepEqual([...files].sort(), [...expected].sort(), 'Export images differ from published references');
  const privateValues = Object.entries(process.env).filter(([name, value]) => value && value.length >= 12 && /^CMS_.*(?:DATABASE_URL|SECRET|ACCESS_KEY|OWNER_ID)/.test(name)).map(([, value]) => value);
  async function checkFiles(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await checkFiles(path);
      else if (/\.(?:html|js|json|txt|map)$/.test(entry.name)) {
        const text = await readFile(path, 'utf8');
        assert.ok(!privateValues.some(value => text.includes(value)), 'Private configuration found in export');
        if (/\.(?:html|json)$/.test(entry.name)) assert.ok(!/"(?:sourceNote|photoPermission|photoSource|draft)"\s*:/.test(text), 'Private CMS fields found in export');
      }
    }
  }
  await checkFiles(resolve(root, 'out'));
  console.log('Private export contains every route, published member, exactly referenced images, and no detected private CMS fields/configuration. Run browser checks before deployment.');
} catch (error) { reportFailure(error); }
