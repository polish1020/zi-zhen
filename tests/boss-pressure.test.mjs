import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,ENEMIES,CHAPTERS,enemyHealthScale,wavePlan,bossSkillName,bossSkillText} from '../dist/engine.mjs';

function arena(kind,chapter=0){const g=new Game(chapter,42);g.phase='battle';g.wave=9;g.pendingWaves=[9];const e=g.spawn(kind,200,0,9);e.speed=1;return{g,e};}
function oldScale(ch,round,boss){return(1+(round-1)*.36+.16+CHAPTERS[ch].difficulty)*1.25*(1+Math.max(0,round-5)*.015)*(ch>=3&&round<=3&&!boss?.9:1)*(boss?1.65+round*.06:1+Math.max(0,round-3)*.02);}

test('bosses gain substantial health while early minions retain their previous curve',()=>{
 for(let ch=0;ch<10;ch++)for(const round of [1,3,6,12,30]){
  assert.ok(enemyHealthScale(ch,round*3,'boss')>oldScale(ch,round,true)*1.2);
  const n=enemyHealthScale(ch,round*3,'normal');
  if(round<=3)assert.equal(n,oldScale(ch,round,false));
  else assert.ok(n>oldScale(ch,round,false));
 }
 assert.ok(enemyHealthScale(0,36,'boss')>oldScale(0,12,true)*1.6);
 assert.ok(wavePlan(0,36).count>Math.min(80,8+12*3+4+Math.floor(8*1.2)));
});

test('all 42 bosses cast their distinct active skill at three seconds, with saved finite limits',()=>{
 const seen=new Set();
 for(const [kind,meta]of Object.entries(ENEMIES).filter(([,e])=>e.boss)){
  const {g,e}=arena(kind),p=meta.pulse;assert.ok(p,kind);seen.add(p.kind);
  assert.equal(e.pulseAt,3,kind);g.time=2.8;g.step(.1);assert.equal(e.pulses,undefined,kind);
  g.step(.1);g.step(.1);assert.equal(e.pulses,1,kind);
  for(let i=1;i<p.limit+2;i++){e.pulseAt=0;g.step(.01);}
  assert.equal(e.pulses,p.limit,kind);
  const h=Game.restore(JSON.parse(JSON.stringify(g.export())));h.enemies[0].pulseAt=0;h.step(.01);
  assert.equal(h.enemies[0].pulses,p.limit,kind);
  assert.ok(bossSkillName(kind));assert.match(bossSkillText(kind),/3 秒.*最多.*半血.*25%/);
 }
 assert.deepEqual([...seen].sort(),['blink','haste','heal','shield','summon']);
});

test('half-health accelerates pending and subsequent casts once, without resetting cast limits on reload',()=>{
 const {g,e}=arena('boss');e.hp=e.maxHp*.49;g.step(.1);
 assert.equal(e.pulseAt,g.time+2);assert.equal(g.events.filter(x=>x.type==='boss-phase').length,1);
 e.pulseAt=0;g.step(.1);assert.equal(e.pulses,1);assert.equal(e.pulseAt-g.time,5.4);
 const h=Game.restore(JSON.parse(JSON.stringify(g.export()))),next=h.enemies[0].pulseAt;
 h.step(.1);assert.equal(h.enemies[0].pulseAt,next);assert.equal(h.enemies[0].pulses,1);
 assert.equal(h.events.filter(x=>x.type==='boss-phase').length,0);
});

test('silence delays the new active skill and planning freezes the skill clock',()=>{
 const {g,e}=arena('boss');e.pulseAt=0;e.silencedUntil=1;g.step(.1);assert.equal(e.pulses,undefined);
 const time=g.time;g.phase='prepare';for(let i=0;i<100;i++)g.step(.1);assert.equal(g.time,time);
 g.phase='battle';g.time=1;g.step(.1);assert.equal(e.pulses,1);assert.ok(e.shield>0);
});

test('new shields do not stack, healing respects poison, and war cries actually hasten a boss',()=>{
 const shield=arena('boss');shield.e.pulseAt=0;shield.g.step(.1);const first=shield.e.shield;
 shield.e.pulseAt=0;shield.g.step(.1);assert.equal(shield.e.shield,first);
 for(const poisoned of [false,true]){
  const {g,e}=arena('tideboss');e.hp=e.maxHp*.6;e.pulseAt=0;
  if(poisoned){e.poisonUntil=10;e.poisonDps=0;}const before=e.hp;g.step(.1);
  assert.ok(Math.abs(e.hp-before-(poisoned?0:e.maxHp*.04))<1e-7);
 }
 const {g,e}=arena('stormboss'),at=e.d;e.pulseAt=0;g.step(.1);
 assert.ok(Math.abs(e.d-at-.13)<1e-7);assert.ok(e.rallyUntil>g.time);
});

test('summons retain wave and entrance and older bosses without active timers resume safely',()=>{
 const {g,e}=arena('gearboss',5);e.pulseAt=0;g.step(.1);
 const child=g.enemies.find(x=>x!==e);assert.equal(child.kind,'clockwork');assert.equal(child.wave,9);
 assert.equal(child.route,e.route);assert.equal(child.map,5);
 const old=arena('boss');old.g.time=10;const save=old.g.export();delete save.enemies[0].pulseAt;
 const h=Game.restore(JSON.parse(JSON.stringify(save)));h.step(.01);assert.equal(h.enemies[0].pulses,1);
 h.step(.01);assert.equal(h.enemies[0].pulses,1);
 const bad=h.export();bad.enemies[0].pulseAt=NaN;assert.throws(()=>Game.restore(bad));
});
