import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game,WORDS,getWord,matchWord,wordCategory,wordLearning,isGameSkill} from '../dist/engine.mjs';
import {SKILL_TEMPLATES} from '../dist/lexicon.mjs';
const curated=JSON.parse(readFileSync(new URL('../data/vocabulary-supplements.json',import.meta.url)));
const lessons=JSON.parse(readFileSync(new URL('../data/learning-idioms.json',import.meta.url)));
function stock(g,word){const chars=[...word];while(chars.length<16)chars.push('火');g.hand=chars.map(ch=>({id:++g.handSerial,ch,used:false}));}

test('all reviewed everyday categories and skill lists are playable, including low-frequency blizzard',()=>{
 for(const words of Object.values(curated.categories))for(const word of words)assert.ok(getWord(word),word);
 for(const words of Object.values(curated.skills))for(const word of words){assert.ok(getWord(word),word);assert.ok(isGameSkill(word),word);}
 for(const word of ['暴雪','水蛇','雨雪','火鸟','寒冰符咒','雷霆之力','雷霆剑','暴风雪箭'])assert.equal(matchWord([...word])?.word,word);
 assert.ok(WORDS.length>90000);
});
test('templates accept known roots in order, retain four-character limits and reject arbitrary generated phrases',()=>{
 for(const [word,rule]of Object.entries(SKILL_TEMPLATES)){assert.ok(word.length<=4);assert.equal(matchWord([...word])?.word,word);assert.ok(isGameSkill(word));assert.ok(rule.prefix&&rule.suffix);}
 for(const word of ['桌子之力','桌子符咒','寒冰符咒之力','咒符冰寒','剑剑'])assert.equal(matchWord([...word]),null,word);
});
test('skill names produce elemental arrows, piercing swords, elemental curses and area snowstorms',()=>{
 for(const word of ['暴雪','冰风暴','冰霜新星']){assert.equal(getWord(word).type,'slow');assert.equal(getWord(word).trait,'spread');}
 assert.equal(getWord('寒冰箭').trait,'ranged');assert.equal(getWord('烈焰箭').trait,'ranged');
 assert.equal(getWord('雷霆剑').type,'pierce');assert.equal(getWord('雷霆剑').trait,'blade');assert.ok(getWord('雷霆剑').runes.includes('storm'));
 const curse=getWord('寒冰符咒');assert.equal(curse.type,'mark');assert.deepEqual(curse.runes,['frost','seal']);
 assert.ok(getWord('雷霆之力').runes.includes('inspire'));
});
test('cold talismans really mark, chill and suppress healing; forging debits exact tiles and survives reload',()=>{
 const g=new Game(0,42);g.ink=1000;stock(g,'寒冰符咒');const ids=g.tilesFor('寒冰符咒'),before=g.ink;
 assert.equal(g.build('寒冰符咒',0,[...ids].reverse()),false);assert.equal(g.ink,before);
 assert.ok(g.build('寒冰符咒',0,ids));assert.equal(g.ink,before-getWord('寒冰符咒').cost);assert.equal(g.hand.filter(t=>t.used).length,4);
 g.phase='battle';g.wave=1;const e=g.spawn('regen',130);e.hp=e.maxHp=10000;g.attack(g.towers[0],.01);
 assert.ok(e.markUntil>g.time);assert.ok(e.slowUntil>g.time);assert.ok(e.healBlockUntil>g.time);
 const restored=Game.restore(g.export());assert.equal(restored.towers[0].word,'寒冰符咒');assert.deepEqual(restored.hand,g.hand);
});
test('idioms, ordinary four-character phrases and game skills have distinct learning labels',()=>{
 assert.equal(wordCategory('一叶知秋'),'idiom');assert.equal(wordCategory('寒冰符咒'),'skill');assert.equal(wordCategory('冰霜之箭'),'skill');assert.equal(wordCategory('春风拂面'),'phrase');
 for(const [word,entry]of Object.entries(lessons)){assert.equal(getWord(word).tier,4);assert.equal(wordLearning(word).meaning,entry.meaning);assert.equal(wordCategory(word),entry.kind);assert.ok(entry.meaning.length>5);}
 assert.match(wordLearning('一叶知秋').meaning,/小迹象/);assert.match(wordLearning('聚沙成塔').meaning,/积累/);
});
test('new idioms reach actual random hands with an affordable attack opening and reproducible draws',()=>{
 const seen=new Set();for(let seed=1;seed<=500;seed++){const g=new Game(0,seed);assert.ok(g.availableWords().some(w=>w.tier===2&&w.damage>0&&w.cost<=g.ink));for(const word of Object.keys(lessons))if(lessons[word].kind==='idiom'&&g.tilesFor(word))seen.add(word);}
 assert.ok(seen.size>=100,`only ${seen.size} learning idioms appeared`);
 const g=new Game(0,109),copy=Game.restore(g.export());g.ink=copy.ink=1000;g.refreshHand();copy.refreshHand();assert.deepEqual(copy.hand,g.hand);
});
test('paid hints find the longest valid template and free repeat does not charge again',()=>{
 const g=new Game(0,42);g.ink=500;stock(g,'寒冰符咒');assert.ok(g.availableWords().some(w=>w.word==='寒冰符咒'));
 const hint=g.requestHint();assert.equal(getWord(hint.word).tier,4);assert.equal(hint.cost,100);assert.equal(g.ink,400);assert.equal(g.requestHint().cost,0);assert.equal(g.ink,400);
});

test('expanded suffix families deliver defense, area attacks, dragon breath and native culture lessons',()=>{
 for(const word of ['寒冰术','冰霜之术','烈焰护盾','雷霆法阵','寒冰新星','冰霜风暴','烈焰吐息','雷霆长矛','冰之盾']){
  assert.ok(getWord(word),word);assert.ok(isGameSkill(word));
 }
 assert.equal(getWord('烈焰护盾').trait,'ward');assert.equal(getWord('寒冰新星').trait,'spread');assert.equal(getWord('烈焰吐息').trait,'dragon');
 assert.match(wordLearning('文房四宝').meaning,/笔、墨、纸、砚/);assert.match(wordLearning('春分').meaning,/白昼和黑夜/);assert.equal(wordLearning('才高八斗').kind,'idiom');
});
