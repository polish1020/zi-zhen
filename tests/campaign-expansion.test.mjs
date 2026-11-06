import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CAMPAIGN_ADDITIONS,CAMPAIGN_VOLUMES} from '../dist/campaign-expansion.mjs';
import {Game,CHAPTERS,MAPS,ENEMIES,MAP_MINION_POOLS,MAP_BOSS_POOLS,THEME_UNITS,COMMON_BOSSES,enemyWeapon,bossPower,bossAura,enemyHealthScale,wavePlan,chapterPressure,enemyPosition,enemyLength,getWord,towerDefense} from '../dist/engine.mjs';
const previous=JSON.parse(readFileSync(new URL('./fixtures/ten-chapter-baseline.json',import.meta.url)));
const distance=(p,a,b)=>{const vx=b.x-a.x,vy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*vx+(p.y-a.y)*vy)/(vx*vx+vy*vy)));return Math.hypot(p.x-a.x-t*vx,p.y-a.y-t*vy);};
test('first ten chapters, all 94 previous enemies and every old normal/endless wave plan stay identical',()=>{
 assert.deepEqual(CHAPTERS.slice(0,10),previous.chapters);assert.deepEqual(MAPS.slice(0,10),previous.maps);
 for(const [kind,profile]of Object.entries(previous.enemies))assert.deepEqual(ENEMIES[kind],profile,kind);
 for(let ch=0;ch<10;ch++)assert.deepEqual(previous.waves[ch],Array.from({length:CHAPTERS[ch].waves+3},(_,w)=>wavePlan(ch,w+1)));
});
test('three volumes cover thirty distinct chapters, valid roads and reachable separated tower pads',()=>{
 assert.equal(CHAPTERS.length,30);assert.deepEqual(CAMPAIGN_VOLUMES.flatMap(v=>Array.from({length:v.end-v.start},(_,i)=>v.start+i)),Array.from({length:30},(_,i)=>i));
 assert.equal(new Set(CHAPTERS.map(c=>c.name)).size,30);assert.equal(new Set(MAPS.map(m=>m.theme)).size,30);
 for(let ch=10;ch<30;ch++){
  const c=CHAPTERS[ch],m=MAPS[ch];assert.equal(c.waves,c.rounds*3);assert.ok(c.rounds>=15&&c.rounds<=20);assert.ok(c.ink>=getWord('飞流直下三千尺').cost);
  assert.ok(m.ground.every(r=>r.length>1000));assert.equal(m.pads.length,16);
  for(const [i,p]of m.pads.entries()){
   const gap=Math.min(...m.routes.flatMap(r=>r.slice(1).map((b,j)=>distance(p,r[j],b))));assert.ok(gap>=34&&gap<=140,`${ch+1} pad ${i}: ${gap}`);
   for(const q of m.pads.slice(i+1))assert.ok(Math.hypot(p.x-q.x,p.y-q.y)>=77);
  }
  assert.equal(m.night,['lantern','moon','abyss','summit'].includes(m.theme));
 }
});
test('new chapters have local combat rosters, full boss powers and actual timed wave schedules at every entrance',()=>{
 const newKeys=new Set();
 for(let ch=10;ch<30;ch++){
  const m=MAPS[ch],g=new Game(ch,42),pool=[...MAP_MINION_POOLS[ch],...MAP_BOSS_POOLS[ch]];
  assert.equal(pool.length,6);assert.ok(MAP_MINION_POOLS[ch].some(k=>ENEMIES[k].air));
  for(const kind of pool){assert.ok(!newKeys.has(kind));newKeys.add(kind);const data=ENEMIES[kind],weapon=enemyWeapon(kind),base=enemyWeapon(data.campaignBase);assert.ok(data.name&&data.desc&&data.campaignTheme===m.theme);assert.deepEqual({...weapon,color:base.color},base);assert.equal(weapon.color,m.accent);if(data.boss){assert.ok(bossPower(kind).targets>=2);assert.ok(bossAura(kind).radius>0);assert.ok(data.pulse&&data.pulse.limit<=3);assert.ok(COMMON_BOSSES.every(k=>wavePlan(ch,9).bossPool.includes(k)));}}
  g.startWave();const n=g.queue.length;g.step(.01);assert.equal(g.enemies.length,m.mode==='simultaneous'?m.routes.length:1);assert.equal(n,g.enemies.length+g.queue.length);assert.equal(g.autoWaveAt,30);
  for(let wave=4;wave<=cWaves(ch)+3;wave++){const plan=wavePlan(ch,wave);assert.ok(plan.pool.every(k=>ENEMIES[k]));assert.ok(plan.pool.includes(plan.signature));assert.ok(MAP_MINION_POOLS[ch].includes(plan.signature));assert.equal(plan.boss,wave>cWaves(ch)||plan.part===3&&([3,5,7].includes(plan.round)||plan.round>=8));}
 }
 assert.equal(newKeys.size,120);
});
function cWaves(ch){return CHAPTERS[ch].waves;}
test('new rosters restore in combat, preserve their route and resume deterministically',()=>{
 for(let ch=10;ch<30;ch++){
  const g=new Game(ch,42);g.wave=23;g.startWave();g.queue=[];const r=MAPS[ch].routes.length-1;
  for(const kind of [...MAP_MINION_POOLS[ch],...MAP_BOSS_POOLS[ch]])g.spawn(kind,200,r,24);
  g.step(.1);const h=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.deepEqual(h.export(),g.export());
  for(let i=0;i<40;i++){g.step(.1);h.step(.1);}assert.deepEqual(h.export(),g.export());
  for(const e of h.enemies){assert.equal(e.map,ch);assert.equal(e.route,r);assert.ok(Number.isFinite(enemyPosition(e).x));assert.ok(enemyLength(e)>0);}
 }
});
test('themed healer really heals, armored guard really resists, and renamed iron boss sheds armor at half health',()=>{
 const g=new Game(12,42);g.phase='battle';g.wave=1;g.pendingWaves=[1];const healer=g.spawn('rain_0',200),patient=g.spawn('normal',210);patient.hp=patient.maxHp*.5;healer.abilityAt=0;const hp=patient.hp;g.step(.01);assert.ok(patient.hp>hp);assert.equal(healer.charges,1);
 const h=new Game(0,42);h.ink=500;h.hand=[...'旋风'.padEnd(32,'月')].map(ch=>({ch,id:++h.handSerial,used:false}));assert.ok(h.build('旋风',0));h.phase='battle';h.wave=1;h.pendingWaves=[1];const tower=h.towers[0],damage=getWord('旋风').damage;
 const guard=h.spawn('palace_0',130);guard.hp=guard.maxHp=10000;h.attack(tower,.01);assert.ok(Math.abs(10000-guard.hp-damage*.7)<1e-7);h.enemies=[];
 const boss=h.spawn('palace_boss_0',130);boss.hp=boss.maxHp=10000;tower.cooldown=0;h.attack(tower,.01);assert.ok(Math.abs(10000-boss.hp-damage*.6)<1e-7);boss.hp=4900;tower.cooldown=100;h.step(.01);assert.equal(boss.enraged,true);assert.equal(h.events.filter(e=>e.type==='boss-phase').length,1);const before=boss.hp;tower.cooldown=0;h.attack(tower,.01);assert.ok(Math.abs(before-boss.hp-damage)<1e-7);
});
test('all new bosses activate real finite skills and keep them exhausted after reload',()=>{
 for(let ch=10;ch<30;ch++)for(const kind of MAP_BOSS_POOLS[ch]){
  const g=new Game(ch,42);g.phase='battle';g.wave=24;g.pendingWaves=[24];const e=g.spawn(kind,200);e.hp=e.maxHp*.7;
  for(let i=0;i<3;i++){const a=g.spawn(MAP_MINION_POOLS[ch][i],200+i*4);a.hp=a.maxHp*.5;}
  const limit=ENEMIES[kind].pulse.limit;
  for(let i=0;i<limit+2;i++){e.pulseAt=0;g.step(.01);}assert.equal(e.pulses,limit,kind);
  const h=Game.restore(JSON.parse(JSON.stringify(g.export())));h.enemies[0].pulseAt=0;h.step(.01);assert.equal(h.enemies[0].pulses,limit,kind);
 }
});
test('pressure stays bounded across added chapters, grows in endless and final victories continue correctly',()=>{
 assert.equal(chapterPressure(9),9);assert.ok(chapterPressure(29)<12);
 for(let ch=10;ch<30;ch++){
  assert.ok(wavePlan(ch,1).count<=34);assert.ok(enemyHealthScale(ch,61,'normal')>enemyHealthScale(ch,CHAPTERS[ch].waves,'normal'));
  const g=new Game(ch,42);g.wave=g.campaignWaves;g.phase='battle';g.pendingWaves=[g.wave];g.settleWaves();assert.equal(g.phase,'won');const restored=Game.restore(g.export());assert.ok(restored.continueEndless());assert.ok(restored.startWave());assert.ok(restored.plan(restored.wave).boss);
 }
});

test('new air corridors retain shortcuts while every entrance allows time to react',()=>{
 for(let ch=10;ch<30;ch++)for(let route=0;route<MAPS[ch].routes.length;route++){
  const map=MAPS[ch],g=new Game(ch,42);g.wave=1;g.phase='battle';g.pendingWaves=[1];const e=g.spawn(MAP_MINION_POOLS[ch].find(k=>ENEMIES[k].air),0,route,1);
  assert.ok(map.air[route].length>=600,`${ch+1}/${route}: instant air breach`);assert.ok(map.air[route].length<map.ground[route].length);
  e.d=map.air[route].length;assert.deepEqual(enemyPosition(e),map.routes[route].at(-1));
  const h=Game.restore(g.export());assert.deepEqual(enemyPosition(h.enemies[0]),enemyPosition(e));
 }
});
