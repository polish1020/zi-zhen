#!/usr/bin/env python3
"""Stage tested static assets for IGA upload without its dist exclusion or mjs MIME issue."""
from pathlib import Path
import json, shutil, re
root=Path(__file__).resolve().parents[1]
stage=Path('/workspace/deploy/zi-zhen-iga')
identity=root/'.iga/project.json'
if not identity.exists():
 raise SystemExit('Missing IGA project identity. Link the existing project first; do not create a duplicate.')
project=json.loads(identity.read_text())
if project.get('projectId')!='ei9p7c5x8t':
 raise SystemExit('Unexpected project identity; check the intended deployment target.')
stage.mkdir(parents=True,exist_ok=True)
(stage/'.iga').mkdir(exist_ok=True)
for old in ['app.mjs','engine.mjs']:
 (stage/old).unlink(missing_ok=True)
for name in json.loads((root/'data/static-assets.json').read_text()):
 text=(root/'dist'/name).read_text()
 if name.endswith(('.mjs','.html')):text=re.sub(r'''(['"]\./[^'"]+)\.mjs(?=['"])''',r'\1.js',text)
 (stage/name.replace('.mjs','.js')).write_text(text)
shutil.copy2(identity,stage/'.iga/project.json')
(stage/'iga.json').write_text(json.dumps({'outputDirectory':'.'},indent=2)+'\n')
(stage/'.gitignore').write_text('.iga/\n')
assert './app.js' in (stage/'index.html').read_text()
assert "'./engine.js'" in (stage/'app.js').read_text()
print(f'Staged game for existing IGA project {project["projectId"]}: {stage}')
