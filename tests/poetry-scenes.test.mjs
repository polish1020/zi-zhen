import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game,POEM_LINES,ENEMIES,getWord,towerStats,towerDefense,enemyLength,enemyPosition,isAir,nativeAir,getMap} from '../dist/engine.mjs';
import {SCENE_KINDS,SCENE_RULES,SCENE_LIFE,signatureKey} from '../dist/poetry-scene-rules.mjs';
import {recordPoetryDeath,clearPoetryScenes,poetryThreat} from '../dist/poetry-scenes.mjs';

import {add,arena,enemy,cast,isolate,exerciseRule,pulse} from './poetry-scene-fixtures.mjs';

test('all 483 complete sentences have hand-authored, nonnumeric distinct scene programs; all 90 rules are used',()=>{
 const rows=readFileSync(new URL('../data/poetry-signatures.txt',import.meta.url),'utf8').split('\n').filter(x=>x&&!x.startsWith('#'));
 assert.equal(rows.length,483);const keys=new Set(),names=new Set(),rules=new Set();
 for(const l of POEM_LINES){assert.ok(l.signature.name);assert.ok(l.signature.program.length>=2&&l.signature.program.length<=3);const key=signatureKey(l.signature.program);assert.ok(!keys.has(key),l.word);keys.add(key);assert.ok(!names.has(l.signature.name));names.add(l.signature.name);for(const id of l.signature.program){assert.ok(SCENE_RULES[id]);rules.add(id);}}
 assert.equal(keys.size,483);assert.deepEqual([...rules].sort(),SCENE_KINDS.slice().sort());
});
test('every new chapter starts with enough real ink to build a seven-character poem; restoring a played wallet never grants extra ink',()=>{
 const word='飞流直下三千尺',cost=getWord(word).cost;assert.equal(cost,400);
 for(let chapter=0;chapter<10;chapter++){const g=new Game(chapter,42),wallet=g.ink;assert.ok(wallet>=cost);assert.equal(wallet,chapter===8?410:chapter===9?440:400);g.hand=[...word.padEnd(32,'月')].map(ch=>({ch,id:++g.handSerial,used:false}));assert.ok(g.build(word,2));assert.equal(g.ink,wallet-cost);assert.equal(Game.restore(g.export()).ink,wallet-cost);const old=g.export();old.version=10;old.ink=7;assert.equal(Game.restore(old).ink,7);}
});

// Isolate each real rule after a genuine cast. Supply moving enemies, changing
// shields, real tower injuries, deaths, mixed allies and a ruin. These are
// conditional fixtures, not a claim that every rule activates in every fight.
for(const rule of SCENE_KINDS)test('interactive rule actually changes battle state: '+rule,()=>assert.ok(exerciseRule(rule).activity>0,rule));

test('deep pool progressively slows ground enemies, resets on exit and respects native air, bosses and ice shells',()=>{
 const{g,s}=isolate('deep_pool'),e=g.enemies[0];e.d=300;s.x=enemyPosition(e).x;s.y=enemyPosition(e).y;
 g.updatePoetryScenes(.1);assert.equal(e.verseMove,.85);pulse(g,.8);assert.equal(e.verseMove,.7);pulse(g,.8);assert.ok(Math.abs(e.verseMove-.55)<1e-8);
 const air=enemy(g,'flying',300),boss=enemy(g,'boss',300),ice=enemy(g,'frostbeast',300);g.updatePoetryScenes(.1);assert.equal(air.verseMove,undefined);assert.equal(ice.verseMove,undefined);assert.equal(boss.verseMove,.95);
 e.d=850;pulse(g,.1);assert.equal(e.verseMove,1);e.d=300;pulse(g,.1);assert.equal(e.verseMove,.85);
});
test('grounding changes actual ground-only targeting without changing native flight geometry, then expires',()=>{
 const{g,t,s}=isolate('grounding');g.enemies=[];const e=enemy(g,'flying',300),heavy=add(g,'石山',1);s.target=e.id;const pos=enemyPosition(e),len=enemyLength(e);t.cooldown=100;heavy.cooldown=0;
 const before=e.hp;g.attack(heavy,.1);assert.equal(e.hp,before,'ground-only tower cannot hit normal flight');
 g.updatePoetryScenes(.1);assert.equal(isAir(e),false);assert.equal(nativeAir(e),true);assert.deepEqual(enemyPosition(e),pos);assert.equal(enemyLength(e),len);
 heavy.cooldown=0;const grounded=e.hp;g.attack(heavy,.1);assert.ok(e.hp<grounded,'real ground attack now hits');assert.ok(e.verseGroundReady>g.time);
 pulse(g,3.1);assert.equal(isAir(e),true);assert.deepEqual(enemyPosition(e),pos);
});
test('waterfall persists, follows the actual route, hits on later ticks and shares displacement immunity',()=>{
 const{g,s}=isolate('waterfall'),e=g.enemies[0];const before=e.hp;g.updatePoetryScenes(.1);const first=e.hp,initial={x:s.x,y:s.y};assert.ok(first<before);assert.equal(e.recoilReady,g.time+3);const d=e.d;pulse(g,.5);assert.ok(e.hp<first);assert.equal(e.d,d,'cannot push every pulse');assert.notDeepEqual({x:s.x,y:s.y},initial);e.d=s.d+60;const moved=e.d;pulse(g,3);assert.ok(e.d<moved);
});
test('actual shields, not armour mitigation, feed pearls; reflection never recursively reflects',()=>{
 const{g,t,s}=isolate('pearl'),e=g.enemies[0];g.updatePoetryScenes(.1);t.verseShield=0;t.lessonShield=0;g.damageTower(t,10,e);pulse(g,.5);assert.equal(s.a,0);
 for(let i=0;i<3;i++){t.verseShield=15;t.verseShieldUntil=g.time+2;g.damageTower(t,10,e);pulse(g,.5);}
 assert.equal(s.a,0);assert.ok(s.activity>0);assert.ok(g.effects.some(f=>f.kind==='poem-scene-hit'&&f.rule==='pearl'));
});
test('real earned kills collect once and respect field/round caps without healing hearts',()=>{
 const{g,s}=isolate('harvest'),e=g.enemies[0];const ink=g.ink,hearts=g.hp;recordPoetryDeath(g,e,0,enemyPosition);assert.equal(g.ink,ink);recordPoetryDeath(g,e,1,enemyPosition);recordPoetryDeath(g,e,1,enemyPosition);assert.equal(g.ink,ink+1);
 for(let i=0;i<8;i++){const a=enemy(g,'normal');recordPoetryDeath(g,a,1,enemyPosition);}assert.equal(g.ink,ink+3);assert.equal(s.a,3);assert.equal(g.hp,hearts);
});
test('lotus waits for an existing stronger shield, then migrates to another hurt ally when its own shield breaks',()=>{
 const{g,t,s}=isolate('lotus'),friend=add(g,'火球',1);t.hp*=.5;friend.hp*=.4;t.verseShield=0;friend.verseShield=towerDefense(friend).maxHp*.2;friend.verseShieldUntil=g.time+4;
 g.updatePoetryScenes(.1);assert.equal(s.targets.length,0);pulse(g,4.1);assert.equal(s.targets[0],friend.id);assert.ok(friend.verseShield>0);
 friend.verseShield=0;pulse(g,.5);assert.equal(s.targets[0],t.id);assert.ok(t.verseShield>0);
});
test('a delayed bloom waits for a later arrival instead of spending itself on an empty landing point',()=>{
 const{g,s}=isolate('spring_back'),e=g.enemies[0];e.d=900;pulse(g,3);assert.equal(s.a,0);e.d=300;pulse(g,.5);assert.equal(s.a,1);assert.ok(s.activity>0);
});
test('horizon allows a real ordinary attack beyond range, while elevation grows only during uninterrupted standing',()=>{
 const{g,t}=isolate('horizon'),e=g.enemies[0];e.d=1200;g.updatePoetryScenes(.1);t.cooldown=0;const before=e.hp;assert.ok(Math.hypot(enemyPosition(e).x-g.pads[t.pad].x,enemyPosition(e).y-g.pads[t.pad].y)>towerStats(t).range);g.attack(t,.1);assert.ok(e.hp<before);
 const a=isolate('ascend'),range=towerStats(a.t).range;pulse(a.g,1.3);assert.equal(towerStats(a.t).range,range+18);a.g.damageTower(a.t,20,a.g.enemies[0]);pulse(a.g,.1);assert.equal(towerStats(a.t).range,range);pulse(a.g,3.7);assert.equal(towerStats(a.t).range,range+54);
});
test('grounding resists bosses and ice shells and does not refresh an existing landing lockout',()=>{
 const{g,s}=isolate('grounding');g.enemies=[];const boss=enemy(g,'cloudwhale',300),ice=enemy(g,'flying',300);ice.kind='icephoenix';ice.shellHits=0;g.updatePoetryScenes(.1);assert.equal(boss.verseGroundUntil-g.time,.75);assert.equal(ice.verseGrounded,undefined);const until=boss.verseGroundUntil;pulse(g,.5);assert.equal(boss.verseGroundUntil,until);pulse(g,.5);assert.equal(isAir(boss),true);assert.ok(s.activity>0);
});
test('umbrellas reduce exactly three hits and stop protecting when the owner is disabled',()=>{
 const{g,t,s}=isolate('umbrella'),e=g.enemies[0];t.verseShield=0;t.verseGuardUntil=0;e.markUntil=0;e.siegeWeakUntil=0;e.weakenUntil=0;
 const damages=[];for(let i=0;i<4;i++){const hp=t.hp;g.damageTower(t,10,e);damages.push(hp-t.hp);}assert.ok(Math.abs(damages[0]/damages[3]-.65)<1e-8);assert.equal(s.a,3);
 s.a=0;t.disruptedUntil=g.time+3;const hp=t.hp;g.damageTower(t,10,e);assert.ok(Math.abs(hp-t.hp-damages[3])<1e-8);assert.equal(s.a,0);
});
test('renewal sends a temporary actor from a real ruin without spending ink, rebuilding or restoring gate hearts',()=>{
 const{g,t,s}=isolate('renewal'),ruin=add(g,'火球',1);ruin.hp=0;g.hp=3;const wallet=g.ink,enemyHP=g.enemies[0].hp;g.updatePoetryScenes(.1);assert.equal(ruin.hp,0);assert.equal(g.towers.length,2);assert.equal(g.ink,wallet);assert.equal(g.hp,3);assert.ok(g.enemies[0].hp<enemyHP);assert.deepEqual(s.points[0],{...g.pads[ruin.pad],used:false});
});
test('actual minion and boss target choice respects hiding and danger decoys',()=>{
 const{g,t}=arena('云深不知处'),friend=add(g,'火球',1),e=enemy(g,'normal',300);t.verseVeilUntil=g.time+2;e.towerAttackAt=0;g.updateTowerAttacks();assert.equal(e.towerTarget,friend.id);delete e.towerTarget;delete e.towerStrikeAt;e.towerAttackAt=0;t.verseVeilUntil=0;t.verseDecoyUntil=g.time+2;g.updateTowerAttacks();assert.equal(e.towerTarget,t.id);
 const boss=enemy(g,'boss',300);boss.bossReadyAt=0;g.updateBossPower(boss);assert.equal(boss.bossTargets[0],t.id);
});
test('scene snapshots reject forged rules, budgets, routes, clocks and transient states; cloned history is detached',()=>{
 const{g}=isolate('waterfall');g.updatePoetryScenes(.1);const good=g.export();
 for(const patch of[{rule:'fake'},{power:1e9},{budget:1e9},{aid:1e9},{until:1e9},{route:30},{id:good.towers[0].id},{activity:-1},{records:[{id:1}]},{points:[{x:Infinity,y:0,used:false}]}]){const bad=structuredClone(good);Object.assign(bad.poetryScenes[0],patch);assert.throws(()=>Game.restore(bad),JSON.stringify(patch));}
 for(const patch of[{verseGrounded:'yes'},{verseMove:.1},{verseGrounded:true,verseGroundUntil:NaN}]){const bad=structuredClone(good);Object.assign(bad.enemies[0],patch);assert.throws(()=>Game.restore(bad));}
 const copy=Game.restore(good);good.poetryScenes[0].events.push({fake:true});assert.equal(copy.poetryScenes[0].events.length,0);assert.throws(()=>Game.restore({...good,version:10}));
});
test('expiry, owner destruction and round cleanup remove scene targeting and persistent actors',()=>{
 const{g,t}=isolate('horizon');g.updatePoetryScenes(.1);assert.ok(t.verseHorizonTarget);pulse(g,SCENE_LIFE+.1);assert.equal(g.poetryScenes.length,0);assert.equal(t.verseHorizonTarget,0);
 const a=isolate('renewal');a.t.hp=0;a.g.updatePoetryScenes(.1);assert.equal(a.g.poetryScenes.length,0);t.verseElevation=3;t.verseVeilUntil=100;t.verseDecoyUntil=100;clearPoetryScenes(g);assert.equal(t.verseElevation,0);assert.equal(poetryThreat(t,g.time),0);
});
test('v10 saves retain wallet, hand, towers and RNG; new scene states only begin on a new cast',()=>{
 const{g}=arena('飞流直下三千尺');const old=g.export();old.version=10;delete old.poetryScenes;delete old.poetryBonusEarned;const restored=Game.restore(old);for(const k of['ink','hand','rngState','hp','towers'])assert.deepEqual(restored[k],old[k]);assert.deepEqual(restored.poetryScenes,[]);assert.equal(restored.export().version,11);
});
test('all 483 signatures run in the real battle loop, save mid-field and remain finite across ten maps and all entries',()=>{
 for(const[lidx,l]of POEM_LINES.entries()){
  const{g,t}=arena(l.word,lidx%10),hearts=g.hp;add(g,'火球',0);add(g,'冰霜',1);for(const a of g.activeTowers)a.hp*=.5;
  for(let r=0;r<getMap(g.chapter).routes.length;r++)for(const[k,d]of[['normal',245],['armor',300],['flying',280],['swift',340]])enemy(g,k,d,r);
  cast(g,t);assert.deepEqual(g.poetryScenes.map(s=>s.rule),l.signature.program,l.word);
  for(let i=0;i<65;i++){g.step(.1);if(i===15||i===35)assert.deepEqual(Game.restore(g.export()).export(),g.export(),l.word);assert.ok(g.enemies.every(e=>Number.isFinite(e.hp)&&Number.isFinite(e.d)),l.word);}
  assert.equal(g.hp,hearts,l.word);
 }
});
