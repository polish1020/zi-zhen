import {WORD_REVIEW} from '../dist/lexicon.mjs';
import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{Game,WORDS,getWord,matchWord,wordCategory,wordLearning,towerDefense,IDIOM_MOVES}from'../dist/engine.mjs';import{SPECIAL_EFFECTS,V8_BASIC_FOUR_CORRECTIONS}from'../dist/specials.mjs';
const confirmedNow=new Set(JSON.parse(readFileSync(new URL('../data/idiom-review.json',import.meta.url))).confirmed.split(' '));
const fixture=name=>JSON.parse(readFileSync(new URL('./fixtures/'+name,import.meta.url))),review=JSON.parse(readFileSync(new URL('../data/basic-four-review.json',import.meta.url))),baseline=review.baselineWords.split(' '),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function stock(g,word){g.hand=[...word.padEnd(16,'火')].map(ch=>({id:++g.handSerial,ch,used:false}));}
test('all 4088 previously ordinary four-character words have an explicit disposition; semantic corrections cannot be lost on rebuild',()=>{
 assert.equal(baseline.length,4088);assert.equal(new Set(baseline).size,4088);assert.deepEqual(new Set(V8_BASIC_FOUR_CORRECTIONS),new Set(Object.keys(review.entries)));assert.equal(Object.keys(SPECIAL_EFFECTS).length,80);assert.equal(Object.keys(IDIOM_MOVES).length,39);
 for(const word of baseline){const w=getWord(word),p=review.entries[word];if(WORD_REVIEW[word]){assert.equal(w,undefined);continue;}assert.ok(w,word);if(p){assert.equal(w.type,p.type,word);assert.equal(w.special,p.special,word);assert.equal(w.idiomMove,p.move,word);assert.ok(IDIOM_MOVES[w.idiomMove]);if(p.kind==='idiom')assert.equal(wordCategory(word),confirmedNow.has(word)?'idiom':'phrase',word);}else assert.equal(w.type,'basic',word);}
 assert.equal(getWord('一下子把'),undefined);
 for(const word of['默认设置','操作系统','公共汽车','北京大学']){assert.equal(getWord(word).type,'basic');assert.equal(wordCategory(word),'phrase');}
});
test('missed familiar idioms use their whole meaning and original phrases are not mislabeled as idioms',()=>{
 for(const[word,core,move]of[['一专多能','festival','festival'],['与时俱进','growth','growth'],['不思进取','frustration','frustration'],['左膀右臂','cooperate','rally'],['屡败屡战','reversal','steadfast'],['形同虚设','silence','silence'],['半工半读','growth','growth']]){const w=getWord(word);assert.equal(w.type,'learning',word);assert.equal(w.special,core,word);assert.equal(w.idiomMove,move,word);assert.equal(wordCategory(word),'idiom');assert.ok(wordLearning(word)?.meaning);}
 assert.equal(wordCategory('木牛流马'),'phrase');assert.equal(wordCategory('科学技术'),'phrase');assert.equal(getWord('清澈见底').type,'pulse');assert.match(wordLearning('莘莘学子').meaning,/众多/);
});
test('true v8 saved games retain their investment, hand, wallet, injury and received shield proportions after reclassification',()=>{
 for(const f of fixture('basic-four-v8.json')){const g=Game.restore(f.data),t=g.towers[0],max=towerDefense(t).maxHp;near(t.hp/max,.37);near(t.lessonShield/max,.1);assert.equal(t.level,f.level);assert.equal(t.spent,f.data.towers[0].spent);assert.equal(g.ink,f.data.ink);assert.deepEqual(g.hand,f.data.hand);assert.equal(g.export().version,9);const h=Game.restore(g.export());near(h.towers[0].hp,t.hp);}
});
test('every reclassified word migrates all three tower levels using its frozen v8 durability, including growth and defensive shapes',()=>{
 const source=fixture('basic-four-v8.json')[0].data;
 for(const old of fixture('basic-four-panels-v8.json'))for(const{level,maxHp}of old.maxima){const save=structuredClone(source);Object.assign(save.towers[0],{word:old.word,level,hp:maxHp*.37,lessonShield:maxHp*.1});const g=Game.restore(save),t=g.towers[0],max=towerDefense(t).maxHp;near(t.hp/max,.37);near(t.lessonShield/max,.1);assert.equal(g.ink,save.ink);assert.equal(t.spent,save.towers[0].spent);}
 const bad=structuredClone(source);bad.towers[0].lessonShield=100000;assert.throws(()=>Game.restore(bad));assert.throws(()=>Game.restore({...source,version:10}));
});
test('all twelve earthly-branch zodiac pairs are playable learning words with correct cultural explanations and exact forging costs',()=>{
 for(const word of'子鼠 丑牛 寅虎 卯兔 辰龙 巳蛇 午马 未羊 申猴 酉鸡 戌狗 亥猪'.split(' ')){const w=getWord(word),g=new Game(0,42);g.ink=1000;stock(g,word);assert.equal(matchWord([...word]).word,word);assert.equal(w.type,'learning');assert.equal(w.special,'beast');assert.equal(w.idiomMove,undefined);assert.match(wordLearning(word).meaning,new RegExp(word[0]+'.*相配'));const before=g.ink;assert.ok(g.build(word,2));assert.equal(g.ink,before-w.cost);assert.equal(g.hand.filter(t=>t.used).length,2);assert.equal(Game.restore(g.export()).towers[0].word,word);}
 assert.equal(matchWord(['龙','辰']),null);
});
test('dragon suffixes keep their elemental school, cause real cone attacks and preserve existing dragon combat profiles',()=>{
 for(const old of fixture('existing-dragons-v8.json')){const w=getWord(old.word);for(const k of['type','trait','damage','rate','range','cost'])assert.equal(w[k],old[k],old.word+' '+k);assert.deepEqual(w.runes,old.runes);}
 for(const[word,type]of[['光明龙','aura'],['冰霜龙','slow'],['火焰龙','splash'],['雷霆龙','chain'],['暗影龙','echo']]){const w=getWord(word),g=new Game(0,42);assert.equal(w.type,type);assert.equal(w.trait,'dragon');assert.equal(wordCategory(word),'skill');g.ink=1000;stock(g,word);assert.ok(g.build(word,2));g.phase='battle';g.wave=1;for(const d of[330,333,336]){const e=g.spawn('normal',d);e.hp=e.maxHp=100000;}g.attack(g.towers[0],.01);assert.ok(g.effects.some(e=>e.kind==='breath'),word);assert.ok(g.enemies.filter(e=>e.hp<100000).length>=2,word);assert.equal(Game.restore(g.export()).towers[0].word,word);}
 assert.equal(matchWord([...'桌子龙']),null);
});
