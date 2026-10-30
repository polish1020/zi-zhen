#!/usr/bin/env python3
"""Package local assets for a Capacitor WebView; no remote server required."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
target = root / 'mobile/www'
target.mkdir(parents=True, exist_ok=True)
for source in (root / 'dist').iterdir():
    if not source.is_file():
        continue
    name = source.name.replace('.mjs', '.js')
    content = source.read_text(encoding='utf-8')
    content = content.replace('./app.mjs', './app.js').replace('./engine.mjs', './engine.js').replace('./lexicon.mjs', './lexicon.js').replace('./specials.mjs', './specials.js')
    (target / name).write_text(content, encoding='utf-8')
print(f'Prepared bundled app assets: {target}')
