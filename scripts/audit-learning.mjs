#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {WORDS,getWord,wordLearning,wordCategory,traitEffect,runeLimit,WORD_RUNES,TOWER_DEFENSES} from '../dist/engine.mjs';
import {WORD_LEARNING} from '../dist/lexicon.mjs';
import {SPECIAL_WORDS,SPECIAL_EFFECTS,SPECIAL_GROUPS,SPECIAL_LESSONS,PREVIOUS_SPECIAL_WORDS,PREVIOUS_LEARNING_WORDS,IDIOM_LESSONS,IDIOM_PROFILES,IDIOM_MOVES,REVIEWED_IDIOMS,IDIOM_EXCLUSIONS} from '../dist/specials.mjs';
const review=JSON.parse(await readFile(new URL('../data/idiom-review.json',import.meta.url),'utf8'));
const learning=WORDS.filter(w=>w.special),lessons=[...new Set([...Object.keys(WORD_LEARNING),...Object.keys(SPECIAL_LESSONS),...Object.keys(IDIOM_LESSONS)])],spellings=Object.values(SPECIAL_GROUPS).flatMap(s=>s.split(/\s+/));
assert.equal(spellings.length,new Set(spellings).size);
for(const w of WORDS){assert.ok(w.tier>=1&&w.tier<=4&&TOWER_DEFENSES[w.type]);assert.ok(Number.isFinite(w.damage)&&w.damage>0&&w.rate>0&&w.range>0);assert.ok(w.runes.length<=runeLimit(w.tier)&&w.runes.every(id=>WORD_RUNES[id]));if(w.type==='basic')assert.equal(w.icon,'普');}
for(const word of lessons){const w=getWord(word);assert.ok(w&&w.type!=='basic'&&(w.special||w.idiomMove)&&wordLearning(word).meaning,word);}
for(const w of learning){assert.equal(w.type,'learning');assert.equal(w.icon,'学');assert.equal(w.trait,'balanced');assert.equal(w.special,SPECIAL_WORDS[w.word]);assert.ok(traitEffect(w).length>25);}
const confirmed=WORDS.filter(w=>w.tier===4&&wordCategory(w.word)==='idiom');
for(const w of confirmed){assert.notEqual(w.type,'basic',w.word);assert.ok(IDIOM_MOVES[w.idiomMove],w.word);}
const examples=['冰清玉洁','火上浇油','一丘之貉','七月流火','首当其冲','百发百中','冰天雪地','五雷轰顶','火树银花','毒蛇猛兽','三顾茅庐','一箭双雕','水滴石穿','薪火相传','从善如流','如雷贯耳','风土人情','默认设置'].map(word=>{const w=getWord(word);return{word,meaning:wordLearning(word)?.meaning||null,category:wordCategory(word),attribute:w.icon,effect:w.special?SPECIAL_EFFECTS[w.special].name:w.tag,chargedMove:IDIOM_MOVES[w.idiomMove]?.name||null,runes:w.runes};});
const engineHash=createHash('sha256').update(await readFile(new URL('../dist/engine.mjs',import.meta.url))).digest('hex');
const specialsHash=createHash('sha256').update(await readFile(new URL('../dist/specials.mjs',import.meta.url))).digest('hex');
const expansion=learning.filter(w=>!PREVIOUS_SPECIAL_WORDS[w.word]);
const summary={newLearningWords:expansion.length,newByLength:Object.fromEntries([1,2,3,4].map(n=>[n,expansion.filter(w=>w.tier===n).length])),specialsHash,totalWords:WORDS.length,learningWords:learning.length,lessonWords:lessons.length,lessonIdioms:lessons.filter(w=>wordLearning(w).kind==='idiom').length,learningWithoutLesson:learning.filter(w=>!wordLearning(w.word)).length,families:Object.keys(SPECIAL_EFFECTS).length,attributes:Object.fromEntries([...new Set(WORDS.map(w=>w.type))].map(type=>[type,WORDS.filter(w=>w.type===type).length])),engineHash,examples};
const reviewedSet=new Set(REVIEWED_IDIOMS);
Object.assign(summary,{basicFourReview:review.basicFourReview,previousReleaseLearningWords:Object.keys(PREVIOUS_LEARNING_WORDS).length,chargedMoves:Object.keys(IDIOM_MOVES).length,confirmedIdioms:confirmed.length,confirmedBasicIdioms:confirmed.filter(w=>w.type==='basic').length,reviewedHeadwords:reviewedSet.size,routedCandidates:Object.keys(IDIOM_PROFILES).length,unconfirmedRoutedPhrases:Object.keys(IDIOM_PROFILES).filter(w=>!reviewedSet.has(w)).length,excludedLabels:IDIOM_EXCLUSIONS.length,genericCanon:Object.values(IDIOM_PROFILES).filter(p=>p.special==='canon').length,confirmedGenericCanon:confirmed.filter(w=>w.special==='canon').length,lessonTypes:Object.fromEntries([...new Set(lessons.map(w=>getWord(w).type))].map(t=>[t,lessons.filter(w=>getWord(w).type===t).length]))});
if(process.argv.includes('--write')){
 await writeFile(new URL('../docs/reports/learning-summary.json',import.meta.url),JSON.stringify(summary,null,2)+'\n');
 await writeFile(new URL('../docs/reports/idiom-audit.json',import.meta.url),JSON.stringify({...summary,sources:review.sources,method:'Pinned reference meanings, retained earlier cores, whole-word overrides and meaning-pattern rules; complete structural scan plus focused semantic review, not manual review of every entry.',limitations:'Unconfirmed labels remain four-character phrases. Canon is shared formation fallback, not a unique semantic interpretation. Source explanations are not shipped.',routingRules:Object.fromEntries(Object.entries(review.reviewRules).map(([id,s])=>[id,{count:s.split(' ').length,words:s.split(' ')}])),wholeWordCorrections:review.wholeWordCorrections,excluded:review.rejected},null,2)+'\n');
 const lines=['# 学属性词语与战斗演绎目录','',`共 ${learning.length.toLocaleString()} 个学词、${summary.families} 类常驻招式，四字候选另配 ${summary.chargedMoves} 类蓄力绝技。${summary.confirmedIdioms.toLocaleString()} 个已核对成语中，普属性为 0。相近词共享招式。`,'',`${summary.lessonWords} 条项目释义分布在学及其他适合的属性；并非全库都有释义。${summary.confirmedGenericCanon.toLocaleString()} 个已确认成语暂用通用「成章回响」，尚未有更细的词义演绎。`,'','由 `node scripts/audit-learning.mjs --write` 按实际运行数据生成。完整方法和边界见 [IDIOMS.md](IDIOMS.md)。',''];
 for(const[id,f]of Object.entries(SPECIAL_EFFECTS)){const ws=learning.filter(w=>w.special===id);lines.push(`## ${f.name}（${ws.length} 词）`,'',f.desc,'',ws.map(w=>w.word).join('、'),'');}
 await writeFile(new URL('../docs/LEARNING-WORDS.md',import.meta.url),lines.join('\n'));
}
console.log(JSON.stringify(summary,null,2));
