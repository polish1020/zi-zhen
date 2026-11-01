#!/usr/bin/env python3
"""Bundle original, pinned Hanzi Writer stroke records for the authored lessons."""
import argparse, concurrent.futures, hashlib, json, subprocess, tempfile, time
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT=Path(__file__).resolve().parents[1]
COMMIT='68d10a4b21150cae5e1ebbd223eed289cf32d90c'
BASE=f'https://raw.githubusercontent.com/chanind/hanzi-writer-data/{COMMIT}/'
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check',action='store_true')
args=parser.parse_args()
characters=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{GLYPHS}from'./dist/glyph-data.mjs';console.log(JSON.stringify(GLYPHS.map(g=>g.char)))"],cwd=ROOT,text=True))
cache=Path(tempfile.gettempdir())/('wordward-glyph-'+COMMIT)
cache.mkdir(exist_ok=True)
def download(name):
    file=cache/name
    file.parent.mkdir(parents=True,exist_ok=True)
    if not file.exists():
        for attempt in range(3):
            try:
                with urlopen(Request(BASE+quote(name),headers={'User-Agent':'wordward-offline-lessons'}),timeout=35) as response:
                    file.write_bytes(response.read())
                break
            except Exception:
                if attempt==2:raise
                time.sleep(1)
    return file.read_text(encoding='utf-8')
def record(char):
    raw=json.loads(download('data/'+char+'.json'))
    assert len(raw['strokes'])==len(raw['medians'])>0,char
    assert all(len(m)>=2 for m in raw['medians']),char
    return char,raw
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    entries=dict(pool.map(record,sorted(characters)))
data={'source':{'title':'Wordward offline tracing subset','modifiedAt':'2026-11-01','repository':'chanind/hanzi-writer-data','commit':COMMIT,'upstream':'Make Me a Hanzi; Arphic Technology fonts','copyright':'Copyright (C) 1999 Arphic Technology Co., Ltd.','license':'Arphic Public License; see ARPHICPL.TXT','note':'Selected 76 original character records and aggregated them for offline use on the stated date. Stroke paths and medians are unchanged. This data subset may be copied and modified under the Arphic Public License; it is provided without warranty.'},'characters':entries}
content=json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n'
license_text=download('ARPHICPL.TXT')
for target,text in [(ROOT/'dist/glyph-strokes.json',content),(ROOT/'dist/ARPHICPL.TXT',license_text)]:
    if args.check:assert target.read_text(encoding='utf-8')==text,str(target)
    else:target.write_text(text,encoding='utf-8')
print(json.dumps({'characters':len(entries),'strokes':sum(len(v['strokes']) for v in entries.values()),'bytes':len(content.encode()),'sha256':hashlib.sha256(content.encode()).hexdigest(),'sourceCommit':COMMIT}))
