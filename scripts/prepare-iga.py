#!/usr/bin/env python3
"""Stage tested static assets for IGA upload without its dist exclusion or mjs MIME issue."""
from pathlib import Path
import json, shutil
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
for name in ['index.html','style.css','responsive.css','icon.svg']:
 text=(root/'dist'/name).read_text()
 if name=='index.html':text=text.replace('./app.mjs','./app.js')
 (stage/name).write_text(text)
(stage/'app.js').write_text((root/'dist/app.mjs').read_text().replace("'./engine.mjs'","'./engine.js'"))
shutil.copy2(root/'dist/engine.mjs',stage/'engine.js')
shutil.copy2(identity,stage/'.iga/project.json')
(stage/'iga.json').write_text(json.dumps({'outputDirectory':'.'},indent=2)+'\n')
(stage/'.gitignore').write_text('.iga/\n')
assert './app.js' in (stage/'index.html').read_text()
assert "'./engine.js'" in (stage/'app.js').read_text()
print(f'Staged game for existing IGA project {project["projectId"]}: {stage}')
