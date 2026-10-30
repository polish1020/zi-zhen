#!/usr/bin/env node
// Dependency-free Vercel build; keep module URLs portable for static hosting.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'public');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const files = ['index.html', 'style.css', 'responsive.css', 'gameplay.css',
  'manifest.webmanifest', 'THIRD-PARTY-NOTICES.txt', 'icon.svg',
  'app.mjs', 'engine.mjs', 'lexicon.mjs'];
for (const name of files) {
  let content = await readFile(resolve(root, 'dist', name), 'utf8');
  if (name === 'index.html') content = content.replace('./app.mjs', './app.js');
  if (name === 'app.mjs') content = content.replace("'./engine.mjs'", "'./engine.js'");
  if (name === 'engine.mjs') content = content.replace('./lexicon.mjs', './lexicon.js');
  await writeFile(resolve(output, name.replace(/\.mjs$/, '.js')), content);
}
console.log(`Built ${files.length} static assets in public/`);
