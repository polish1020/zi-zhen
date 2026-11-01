#!/usr/bin/env node
// Dependency-free Vercel build; keep module URLs portable for static hosting.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'public');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const files = JSON.parse(await readFile(resolve(root, 'data/static-assets.json'), 'utf8'));
for (const name of files) {
  let content = await readFile(resolve(root, 'dist', name), 'utf8');
  if (name.endsWith('.mjs') || name.endsWith('.html')) content = content.replace(/(['"]\.\/[^'"]+)\.mjs(?=['"])/g, '$1.js');
  await writeFile(resolve(output, name.replace(/\.mjs$/, '.js')), content);
}
console.log(`Built ${files.length} static assets in public/`);
