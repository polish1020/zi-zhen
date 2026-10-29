#!/usr/bin/env python3
"""Prepare static files and link metadata for the existing Vercel project."""
import argparse
import json
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, default=Path('/workspace/deploy/zi-zhen-vercel'))
stage = parser.parse_args().output.resolve()
root = Path(__file__).resolve().parents[1]
public = stage / 'public'
public.mkdir(parents=True, exist_ok=True)
for name in ['index.html', 'style.css', 'icon.svg']:
    content = (root / 'dist' / name).read_text(encoding='utf-8')
    if name == 'index.html':
        content = content.replace('./app.mjs', './app.js')
    (public / name).write_text(content, encoding='utf-8')
(public / 'app.js').write_text(
    (root / 'dist/app.mjs').read_text(encoding='utf-8').replace("'./engine.mjs'", "'./engine.js'"),
    encoding='utf-8',
)
(public / 'engine.js').write_bytes((root / 'dist/engine.mjs').read_bytes())
(stage / 'vercel.json').write_text(json.dumps({
    'version': 2, 'framework': None, 'outputDirectory': 'public',
}, indent=2) + '\n', encoding='utf-8')
(stage / '.vercel').mkdir(exist_ok=True)
(stage / '.vercel/project.json').write_text(json.dumps({
    'projectId': 'prj_knArbjGsckakBpEb06lLwiWsHlyb',
    'orgId': 'team_azaP3oGtfy4m7CDhqfxdNiLP',
    'projectName': 'zi-zhen',
}, indent=2) + '\n', encoding='utf-8')
(stage / '.gitignore').write_text('.vercel/\n', encoding='utf-8')
print(f'Prepared existing Vercel project zi-zhen: {stage}')
