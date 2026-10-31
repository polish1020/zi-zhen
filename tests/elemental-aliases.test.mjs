import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,getWord,matchWord,enemyPosition,towerStats} from '../dist/engine.mjs';
import {SKILL_TEMPLATES} from '../dist/lexicon.mjs';
import {aliasSkills} from '../scripts/elemental-aliases.mjs';
import {auditAliases} from '../scripts/audit-elemental-aliases.mjs';
function stock(g,word){g.hand=[...word.padEnd(16,'麒')].map(ch=>({id:++g.handSerial,ch,used:false}));}
test('all 8304 alias/root combinations are explicit valid skills and all 112468 published profiles stay unchanged',()=>{
 const audit=auditAliases();assert.equal(audit.added,8304);assert.equal(audit.total,120772);
 for(const[word,rule]of aliasSkills){assert.equal(matchWord([...word]).word,word);assert.equal(SKILL_TEMPLATES[word].canonicalPrefix,rule.canonical);assert.ok(word.length<=4);}
 for(const word of ['桌子之力','桌子锤','桌子符咒','之力毒素','锤冻冰','冰锥之力术','冰锥剑','毒素麒麟'])assert.equal(matchWord([...word]),null,word);
});
test('ice hammers chill while breaking armor; frost-fire arrows burn and slow at the real ranged distance',()=>{
 for(const word of ['冰冻锤','霜火箭']){const g=new Game(0,42);g.ink=1000;stock(g,word);assert.ok(g.build(word,2));g.phase='battle';g.wave=1;const t=g.towers[0],target=g.spawn('armor',330);target.hp=target.maxHp=100000;
  g.attack(t,.01);assert.ok(target.hp<100000,word);assert.ok(target.slowUntil>g.time,word);
  if(word==='冰冻锤'){assert.equal(getWord(word).type,'heavy');assert.equal(getWord(word).trait,'impact');assert.ok(Math.abs(100000-target.hp-towerStats(t).damage)<1e-7);}
  else{assert.ok(getWord(word).range>=263);assert.ok(target.burnDps>0);assert.ok(g.effects.some(e=>e.kind==='bolt'&&e.attackType==='arrow'));}
 }
});
test('all user examples build in exact order and survive reload with paid cost and consumed cards intact',()=>{
 for(const word of ['冰冻锤','霜火箭','霜冻斩','冰雪剑','玄冰箭','炽焰枪','奔雷剑','冰锥之力','毒素之力','冰锥符咒','毒箭术']){
  const g=new Game(0,42);g.ink=1000;stock(g,word);const before=g.ink,ids=g.tilesFor(word);assert.equal(g.build(word,2,ids.slice().reverse()),false);assert.ok(g.build(word,2));assert.equal(g.ink,before-getWord(word).cost);assert.equal(g.hand.filter(t=>t.used).length,word.length);const restored=Game.restore(g.export());assert.deepEqual(restored.towers,g.towers);assert.deepEqual(restored.hand,g.hand);assert.equal(restored.ink,g.ink);
 }
});
test('poison and ice-cone powers really apply poison/chill and three long words remain valid around a cached hint',()=>{
 for(const[word,status]of[['毒素之力','poisonUntil'],['冰锥之力','slowUntil']]){const g=new Game(0,42);g.ink=1000;stock(g,word);assert.ok(g.build(word,2));g.phase='battle';g.wave=1;const e=g.spawn('normal',330);e.hp=e.maxHp=100000;g.attack(g.towers[0],.01);assert.ok(e[status]>g.time,word);}
 const g=new Game(5,42);g.ink=1000;stock(g,'毒素冰锥暗之力');g.hintWord='暗冰之力';g.hintUses=1;
 const restored=Game.restore(g.export());assert.equal(restored.requestHint().word,'暗冰之力');assert.equal(restored.requestHint().cost,0);assert.equal(restored.ink,1000);
 for(const word of ['毒素之力','冰锥之力','暗冰之力'])assert.ok(restored.canBuild(word),word);
 restored.hintWord=null;assert.equal(restored.requestHint().word,'冰锥之力');assert.equal(restored.ink,800);assert.equal(restored.hintUses,2);
});
