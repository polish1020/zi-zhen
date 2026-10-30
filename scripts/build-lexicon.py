#!/usr/bin/env python3
"""Build the offline vocabulary from a pinned MIT source and reviewed game lists."""
import argparse
import json
from pathlib import Path
import urllib.request

COMMIT = '67fa2e36e72f69d9134b8a1037b83fbb070b9775'
BASE = f'https://raw.githubusercontent.com/fxsjy/jieba/{COMMIT}/'
ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--dictionary', type=Path, help='Local copy of the pinned jieba dictionary')
parser.add_argument('--license', type=Path, help='Local copy of the pinned MIT license')
parser.add_argument('--check', action='store_true', help='Verify generated files without writing')
args = parser.parse_args()

def read_source(path, remote):
    if path:
        return path.read_text(encoding='utf-8')
    with urllib.request.urlopen(BASE + remote, timeout=45) as response:
        return response.read().decode('utf-8')

def valid(word):
    return 1 <= len(word) <= 4 and all('\u4e00' <= ch <= '\u9fff' for ch in word)

dictionary = read_source(args.dictionary, 'jieba/dict.txt')
license_text = read_source(args.license, 'LICENSE')
supplements = json.loads((ROOT / 'data/vocabulary-supplements.json').read_text(encoding='utf-8'))
learning = json.loads((ROOT / 'data/learning-idioms.json').read_text(encoding='utf-8'))
culture = json.loads((ROOT / 'data/cultural-words.json').read_text(encoding='utf-8'))
for word, entry in culture.items():
    assert valid(word) and entry['meaning'] and entry['kind'] in ('idiom', 'phrase', 'word')
    learning[word] = {**learning.get(word, entry), 'culture': True}
templates = json.loads((ROOT / 'data/skill-templates.json').read_text(encoding='utf-8'))
skill_templates = {}
words, idioms = set(), set()
for line in dictionary.splitlines():
    parts = line.split()
    if len(parts) != 3:
        continue
    word, frequency, tag = parts
    if not valid(word):
        continue
    # Idioms often carry a synthetic frequency of 3: a common-word cutoff must
    # not decide whether an idiom exists. Common nouns use a broader threshold.
    idiom = tag == 'i' and len(word) == 4 and int(frequency) >= 3
    if int(frequency) >= 20 or idiom or tag == 'i' and int(frequency) >= 10:
        words.add(word)
    if idiom:
        idioms.add(word)

for category, entries in supplements['categories'].items():
    assert entries and all(valid(w) for w in entries), category
    words.update(entries)
skill_schools = {}
for school, entries in supplements['skills'].items():
    assert entries and all(valid(w) for w in entries), school
    for word in entries:
        assert word not in skill_schools, f'Duplicate skill school: {word}'
        skill_schools[word] = school
        words.add(word)

for prefix, rule in templates['prefixes'].items():
    assert 1 <= len(prefix) <= 3 and valid(prefix)
    for suffix, form in templates['suffixes'].items():
        word = prefix + suffix
        if len(word) > 4 or prefix == suffix or word == '力量之力' or len(prefix) == 1 and suffix.startswith(prefix):
            continue
        assert valid(word)
        school = form['school'] or rule['school']
        skill_schools[word] = school
        skill_templates[word] = {'prefix': prefix, 'suffix': suffix, 'rune': rule['rune'], 'trait': form['trait'], 'extra': form['extra'], 'suffixFirst': form['suffixFirst']}
        words.add(word)
        idioms.discard(word)

for word, entry in learning.items():
    assert valid(word) and entry['meaning'] and entry['group']
    assert entry['kind'] in ('idiom', 'phrase', 'word')
    assert entry['kind'] == 'word' or len(word) == 4
    words.add(word)
    if entry['kind'] == 'idiom':
        idioms.add(word)
    elif entry['kind'] == 'phrase':
        idioms.discard(word)

# Preserve the original authored additions when the dictionary is regenerated.
legacy = '雪球 守护者 治疗 治疗术 治愈 治愈术 魔法 法术 魔法箭 魔法盾 奥术 奥术飞弹 能量 能量弹 冲击波 防御 防御塔 炮塔 箭塔 箭楼 火炮 大炮 水流 水箭 水球 水龙 水墙 木箭 荆棘 藤蔓 花草 树木 树人 藤甲 天使 恶魔 骑士 牧师 精灵 妖精 魔法师 弓箭手 火枪手 魔法球 穿甲弹 寒冰弹 冰霜弹 火焰弹 连环箭 毒液弹 剧毒弹 法力护盾'.split()
words.update(legacy)
encode = lambda value: json.dumps(value, ensure_ascii=False, separators=(',', ':'))
module = f'// Common words from fxsjy/jieba, MIT, commit {COMMIT}.\n// See THIRD-PARTY-NOTICES.txt. Curated supplements: data/.\n'
module += 'export const COMMON_WORDS=' + encode('|'.join(sorted(words))) + '.split("|");\n'
module += 'export const IDIOM_WORDS=' + encode('|'.join(sorted(idioms))) + '.split("|");\n'
module += 'export const SKILL_SCHOOLS=' + encode(skill_schools) + ';\n'
module += 'export const SKILL_TEMPLATES=' + encode(skill_templates) + ';\n'
module += 'export const WORD_LEARNING=' + encode(learning) + ';\n'
notice = f'Common-word data derived from fxsjy/jieba\nSource: https://github.com/fxsjy/jieba/tree/{COMMIT}\nIncluded Chinese words: length 1–4, frequency >=20; four-character idioms tagged i, frequency >=3. Other tagged idioms preserve the prior >=10 rule. Additional game vocabulary and plain-language learning explanations are project-authored in data/.\n\n' + license_text
for path, content in [(ROOT / 'dist/lexicon.mjs', module), (ROOT / 'dist/THIRD-PARTY-NOTICES.txt', notice)]:
    if args.check:
        assert path.read_text(encoding='utf-8') == content, f'Outdated generated file: {path}'
    else:
        path.write_text(content, encoding='utf-8')
print(f'{"Verified" if args.check else "Bundled"} {len(words):,} common/game words, {len(idioms):,} idioms, {len(skill_schools)} skills, {len(learning)} learning explanations.')
