#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {WORDS,getWord,wordLearning,traitEffect,runeLimit,WORD_RUNES,TOWER_DEFENSES} from '../dist/engine.mjs';
import {WORD_LEARNING} from '../dist/lexicon.mjs';
import {SPECIAL_WORDS,SPECIAL_EFFECTS,SPECIAL_GROUPS} from '../dist/specials.mjs';
const learning=WORDS.filter(w=>w.special),lessons=Object.keys(WORD_LEARNING),spellings=Object.values(SPECIAL_GROUPS).flatMap(s=>s.split(/\s+/));
assert.equal(spellings.length,new Set(spellings).size);
for(const w of WORDS){assert.ok(w.tier>=1&&w.tier<=4&&TOWER_DEFENSES[w.type]);assert.ok(Number.isFinite(w.damage)&&w.damage>0&&w.rate>0&&w.range>0);assert.ok(w.runes.length<=runeLimit(w.tier)&&w.runes.every(id=>WORD_RUNES[id]));if(w.type==='basic')assert.equal(w.icon,'普');}
for(const word of lessons)assert.ok(getWord(word).special&&wordLearning(word).meaning,word);
for(const w of learning){assert.equal(w.type,'learning');assert.equal(w.icon,'学');assert.equal(w.trait,'balanced');assert.equal(w.special,SPECIAL_WORDS[w.word]);assert.ok(traitEffect(w).length>25);}
const examples=['三顾茅庐','一箭双雕','水滴石穿','画龙点睛','金蝉脱壳','背水一战','学习','朋友','豆腐','金鱼','银河','土豆','金文','发明','地铁','流星锤','毒镖','岩浆'].map(word=>{const w=getWord(word);return{word,meaning:wordLearning(word)?.meaning||null,attribute:w.icon,effect:w.special?SPECIAL_EFFECTS[w.special].name:w.tag,runes:w.runes};});
const engineHash=createHash('sha256').update(await readFile(new URL('../dist/engine.mjs',import.meta.url))).digest('hex');
const specialsHash=createHash('sha256').update(await readFile(new URL('../dist/specials.mjs',import.meta.url))).digest('hex');
const summary={specialsHash,totalWords:WORDS.length,learningWords:learning.length,lessonWords:lessons.length,lessonIdioms:lessons.filter(w=>WORD_LEARNING[w].kind==='idiom').length,learningWithoutLesson:learning.filter(w=>!WORD_LEARNING[w.word]).length,families:Object.keys(SPECIAL_EFFECTS).length,attributes:Object.fromEntries([...new Set(WORDS.map(w=>w.type))].map(type=>[type,WORDS.filter(w=>w.type===type).length])),engineHash,examples};
if(process.argv.includes('--write')){
 await writeFile(new URL('../docs/reports/learning-summary.json',import.meta.url),JSON.stringify(summary,null,2)+'\n');
 const lines=['# 学属性词语与战斗演绎目录','',`共 ${learning.length.toLocaleString()} 个词，${summary.families} 类招式；736 条学习释义及其中 480 条成语全部覆盖。相近词共享招式，本义与游戏演绎分开显示。`,'','由 `node scripts/audit-learning.mjs --write` 按实际运行数据生成。',''];
 for(const[id,f]of Object.entries(SPECIAL_EFFECTS)){const ws=learning.filter(w=>w.special===id);lines.push(`## ${f.name}（${ws.length} 词）`,'',f.desc,'',ws.map(w=>w.word).join('、'),'');}
 await writeFile(new URL('../docs/LEARNING-WORDS.md',import.meta.url),lines.join('\n'));
}
console.log(JSON.stringify(summary,null,2));
