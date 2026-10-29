#!/usr/bin/env python3
"""Rebuild the bundled common-word list from a pinned MIT-licensed source."""
from pathlib import Path
import json
import urllib.request

COMMIT='67fa2e36e72f69d9134b8a1037b83fbb070b9775'
BASE=f'https://raw.githubusercontent.com/fxsjy/jieba/{COMMIT}/'
root=Path(__file__).resolve().parents[1]
with urllib.request.urlopen(BASE+'jieba/dict.txt',timeout=45) as response:
    dictionary=response.read().decode('utf-8')
with urllib.request.urlopen(BASE+'LICENSE',timeout=30) as response:
    license_text=response.read().decode('utf-8')
words=set()
for line in dictionary.splitlines():
    parts=line.split()
    if len(parts)!=3:
        continue
    word,frequency,tag=parts
    if 1<=len(word)<=4 and all('\u4e00'<=ch<='\u9fff' for ch in word) and (int(frequency)>=100 or (tag=='i' and int(frequency)>=10)):
        words.add(word)
words.update('雪球 守护者 治疗 治疗术 治愈 治愈术 魔法 法术 魔法箭 魔法盾 奥术 奥术飞弹 能量 能量弹 冲击波 防御 防御塔 炮塔 箭塔 箭楼 火炮 大炮 水流 水箭 水球 水龙 水墙 木箭 荆棘 藤蔓 花草 树木 树人 藤甲 天使 恶魔 骑士 牧师 精灵 妖精 魔法师 弓箭手 火枪手 魔法球 穿甲弹 寒冰弹 冰霜弹 火焰弹 连环箭 毒液弹 剧毒弹 法力护盾'.split())
(root/'dist/lexicon.mjs').write_text(f'// Common words from fxsjy/jieba, MIT, commit {COMMIT}.\n// See THIRD-PARTY-NOTICES.txt.\nexport const COMMON_WORDS='+json.dumps('|'.join(sorted(words)),ensure_ascii=False)+'.split("|");\n',encoding='utf-8')
(root/'dist/THIRD-PARTY-NOTICES.txt').write_text(f'Common-word data derived from fxsjy/jieba\nSource: https://github.com/fxsjy/jieba/tree/{COMMIT}\nIncluded Chinese words: length 1–4, frequency >=100; idioms frequency >=10. Additional game words are project-authored.\n\n'+license_text,encoding='utf-8')
print(f'Bundled {len(words):,} common words and idioms.')
