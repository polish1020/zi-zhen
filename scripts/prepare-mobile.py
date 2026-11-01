#!/usr/bin/env python3
"""Package local assets for a Capacitor WebView; no remote server required."""
from pathlib import Path
import json, re

root = Path(__file__).resolve().parents[1]
target = root / 'mobile/www'
target.mkdir(parents=True, exist_ok=True)
for asset in json.loads((root / 'data/static-assets.json').read_text()):
    source = root / 'dist' / asset
    name = source.name.replace('.mjs', '.js')
    content = source.read_text(encoding='utf-8')
    if source.suffix in ('.mjs', '.html'):
        content = re.sub(r'''(['"]\./[^'"]+)\.mjs(?=['"])''', r'\1.js', content)
    (target / name).write_text(content, encoding='utf-8')
print(f'Prepared bundled app assets: {target}')
