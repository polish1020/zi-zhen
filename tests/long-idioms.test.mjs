import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,getWord,matchWord,wordLearning,wordCategory,towerStats,enemyLength} from '../dist/engine.mjs';
const word='百闻不如一见';
test('six-character idiom is a learned observation tower with its own explanation, exact order and finite prices',()=>{
 const w=getWord(word);assert.ok(w);assert.equal(w.type,'learning');assert.equal(w.poem,undefined);assert.equal(w.tier,6);assert.equal(w.maxLevel,8);assert.equal(w.special,'precision');assert.equal(w.idiomMove,'precision');assert.equal(wordCategory(word),'idiom');assert.match(wordLearning(word).meaning,/亲眼|观察/);assert.equal(matchWord([...word]),w);assert.equal(matchWord([...'百见不如一闻']),null);
 const g=new Game(0,42);g.ink=2000;g.hand=[...word.padEnd(32,'月')].map(ch=>({ch,id:++g.handSerial,used:false}));const before=g.ink;assert.ok(g.availableWords().some(w=>w.word===word));assert.ok(g.build(word,2));const t=g.towers[0];assert.equal(before-g.ink,330);assert.equal(g.hand.filter(t=>t.used).length,6);for(let i=0;i<2;i++){assert.ok(Number.isFinite(g.upgradeCost(t)));assert.ok(g.upgrade(t.id));}assert.equal(t.level,8);assert.ok(!g.upgrade(t.id));assert.ok(Object.values(towerStats(t)).every(Number.isFinite));assert.deepEqual(Game.restore(g.export()).export(),g.export());
});
test('seeing tower reveals enemies and releases its precision finisher in actual combat',()=>{
 const g=new Game(0,42);g.ink=2000;g.hand=[...word.padEnd(32,'月')].map(ch=>({ch,id:++g.handSerial,used:false}));g.build(word,2);const t=g.towers[0];g.phase='battle';g.wave=1;const e=g.spawn('normal',280);e.hp=e.maxHp=1e6;e.shield=0;
 for(let i=0;i<4;i++){g.time=10+i*2;t.cooldown=0;g.attack(t,.1);}
 assert.equal(t.idiomCasts,1);assert.ok(e.lightUntil>g.time);assert.ok(e.hp<e.maxHp-towerStats(t).damage*6);assert.ok(e.d<enemyLength(e));assert.deepEqual(Game.restore(g.export()).export(),g.export());
});
test('long idiom can be randomly drawn without displacing a complete poem or the five independent short recipes',()=>{
 let seen=0;for(let seed=1;seed<=600;seed++){const g=new Game(seed%10,seed);if(!g.tilesFor(word))continue;seen++;assert.equal(g.hand.length,32);const available=g.availableWords();assert.ok(available.some(w=>w.poem));for(const[n,min]of[[3,3],[4,2]])assert.ok(available.filter(w=>w.tier===n).length>=min);}
 assert.ok(seen>=5&&seen<=100,`${seen}/600 hands`);
});
