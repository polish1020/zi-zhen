import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,getWord,matchWord,wordCategory,towerStats} from '../dist/engine.mjs';
import {SKILL_TEMPLATES} from '../dist/lexicon.mjs';
import {rules,addedSkills,audit} from '../scripts/audit-elemental-skills.mjs';
function stock(g,word){g.hand=[...word.padEnd(16,'火')].map(ch=>({id:++g.handSerial,ch,used:false}));}
function arena(word){const g=new Game(0,42);g.ink=1000;stock(g,word);assert.ok(g.build(word,2));g.phase='battle';g.wave=1;return {g,t:g.towers[0]};}

test('all 4851 elemental recipes are bounded explicit skills; every original profile remains unchanged',()=>{
 const report=audit();assert.equal(report.added,4851);assert.ok(report.total>=112000);assert.equal(report.unchangedExistingProfiles,107617);
 for(const[word,{prefix,source}]of addedSkills){const w=getWord(word),template=SKILL_TEMPLATES[word];assert.ok(w.tier<=4&&w.tier>=2);assert.equal(template.prefix+template.suffix,word);assert.equal(matchWord([...word]).word,word);assert.equal(wordCategory(word),'skill');
  if(rules.mixedPrefixes[prefix]){assert.equal(w.type,rules.mixedPrefixes[prefix].school,word);assert.ok(w.runes.includes(rules.mixedPrefixes[prefix].rune),word);}
  if(source==='creature')assert.ok(w.runes.includes('brood'),word);
 }
 for(const word of ['桌子麒麟','桌子斩','冰雷斩击术','斩雷冰','麒麟火'])assert.equal(matchWord([...word]),null,word);
});

test('new examples forge in order using exact cards and costs, with save/reload preservation',()=>{
 for(const word of ['冰雷斩','火麒麟','冰火剑','寒冰麒麟','烈焰凤凰','雷霆白虎','冰火麒麟','雷冰剑阵','寒冰连斩','冰火符咒']){
  const g=new Game(0,42);g.ink=1000;stock(g,word);const ids=g.tilesFor(word),ink=g.ink;assert.equal(g.build(word,2,ids.slice().reverse()),false);assert.equal(g.ink,ink);
  assert.ok(g.build(word,2,ids),word);assert.equal(g.ink,ink-getWord(word).cost);assert.equal(g.hand.filter(t=>t.used).length,word.length);assert.equal(g.build(word,3),false);
  const h=Game.restore(g.export());assert.deepEqual(h.towers,g.towers);assert.deepEqual(h.hand,g.hand);assert.equal(h.ink,g.ink);
 }
});

test('ice-fire swords really chill and burn; ice-thunder slashes chain hits and chill their primary target',()=>{
 for(const word of ['冰火剑','冰雷斩']){const{g,t}=arena(word);for(const d of [330,334,338]){const e=g.spawn('normal',d);e.hp=e.maxHp=100000;}
  g.attack(t,.01);const primary=g.enemies.find(e=>e.slowUntil>g.time);assert.ok(primary,word);assert.ok(primary.hp<100000);
  if(word==='冰火剑'){assert.ok(primary.burnDps>0);assert.ok(primary.burnUntil>g.time);assert.equal(getWord(word).trait,'blade');}
  else{assert.ok(g.enemies.filter(e=>e.hp<100000).length>=2);assert.ok(g.enemies.filter(e=>e.slowUntil>g.time).length>=1);}
 }
});

test('fire qilin really gains the spirit follow-up on its third attack',()=>{
 const{g,t}=arena('火麒麟'),e=g.spawn('normal',330);e.hp=e.maxHp=100000;const hits=[];
 for(let i=0;i<3;i++){const hp=e.hp;t.cooldown=0;g.attack(t,.01);hits.push(hp-e.hp);}
 assert.equal(t.shots,3);assert.ok(Math.abs(hits[0]-hits[1])<1e-7);assert.ok(Math.abs(hits[2]-hits[0]*1.2)<1e-7);assert.equal(getWord(t.word).type,'splash');assert.ok(towerStats(t).damage>0);
});

test('new skills appear in natural hands while the six-word guarantees and deterministic refresh remain intact',()=>{
 const seen=new Set();for(let seed=1;seed<=1000;seed++){const g=new Game(0,seed),available=g.availableWords();for(const w of available)if(addedSkills.has(w.word))seen.add(w.word);
  for(const[tier,n]of[[2,3],[3,2],[4,1]])assert.ok(available.filter(w=>w.tier===tier).length>=n);
 }
 assert.ok(seen.size>100,`only ${seen.size} new words appeared`);
 const g=new Game(0,42),copy=Game.restore(g.export());g.refreshHand();copy.refreshHand();assert.deepEqual(copy.hand,g.hand);
});
