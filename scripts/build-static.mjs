#!/usr/bin/env node
// Dependency-free Vercel build; keep module URLs portable for static hosting.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'public');
execFileSync(process.execPath, [resolve(root, 'scripts/build-poetry.mjs'), '--check'], {stdio:'inherit'});
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const files = JSON.parse(await readFile(resolve(root, 'data/static-assets.json'), 'utf8'));
for (const name of files) {
  let content = await readFile(resolve(root, 'dist', name));
  if (name.endsWith('.mjs') || name.endsWith('.html')) content = content.toString('utf8').replace(/(['"]\.\/[^'"]+)\.mjs(?=['"])/g, '$1.js');
  await writeFile(resolve(output, name.replace(/\.mjs$/, '.js')), content);
}
console.log(`Built ${files.length} static assets in public/`);
