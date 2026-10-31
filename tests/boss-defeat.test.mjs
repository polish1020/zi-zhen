import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game,ENEMIES,enemyPosition,enemyLength,towerStats} from '../dist/engine.mjs';

test('all 42 bosses emit one detached defeat portrait at the actual death location',()=>{
 const bosses=Object.keys(ENEMIES).filter(k=>ENEMIES[k].boss);assert.equal(bosses.length,42);
 for(const [i,kind]of bosses.entries()){
  const g=new Game(i%10,42);g.phase='battle';g.wave=9;g.pendingWaves=[9];
  const keep=g.spawn('normal',0);keep.hp=keep.maxHp=1e6;keep.speed=.01;
  const e=g.spawn(kind,200);e.enraged=true;e.bossTargets=[123];e.bossStrikeAt=10;e.shield=100;e.hp=0;
  const position=enemyPosition(e),rng=g.rngState;g.events=[];g.step(.1);
  const events=g.events.filter(e=>e.type==='boss-defeated');assert.equal(events.length,1,kind);
  const event=events[0];assert.equal(event.enemy,kind);assert.equal(event.name,ENEMIES[kind].name);assert.deepEqual(event.to,position);
  assert.equal(event.portrait.kind,kind);assert.equal(event.portrait.fallen,true);assert.equal(event.portrait.shield,0);assert.equal(event.portrait.enraged,true);
  event.portrait.d+=100;event.portrait.bossTargets.push(456);assert.equal(e.d,200);assert.deepEqual(e.bossTargets,[123]);
  assert.equal(g.rngState,rng);const ink=g.ink;g.events=[];g.step(.1);assert.equal(g.ink,ink);assert.ok(!g.events.some(e=>e.type==='boss-defeated'));assert.ok(!g.enemies.includes(e));
  assert.ok(!JSON.stringify(g.export()).includes('portrait'));assert.equal(Game.restore(g.export()).kills,g.kills);
 }
});

test('boss leaks, dismissed escorts and ordinary kills never trigger a boss defeat portrait',()=>{
 const g=new Game(0,42);g.phase='battle';g.wave=9;g.pendingWaves=[9];
 const boss=g.spawn('boss');boss.d=enemyLength(boss)+1;
 const ordinary=g.spawn('normal',100);ordinary.hp=0;
 const escort=g.spawn('normal',100);escort.escortBossId=boss.id;escort.escortSummoned=true;escort.harm=0;
 g.events=[];g.step(.1);assert.ok(g.events.some(e=>e.type==='leak'&&e.boss));assert.ok(!g.events.some(e=>e.type==='boss-defeated'));
});

test('three simultaneous skill kills preserve exact prior-engine battle, resources and timing',()=>{
 const fixture=JSON.parse(readFileSync(new URL('./fixtures/boss-defeat-before.json',import.meta.url))),g=Game.restore(structuredClone(fixture.before));
 assert.ok(g.skill());g.step(.1);assert.deepEqual(g.export(),fixture.killed);
 assert.equal(g.events.filter(e=>e.type==='boss-defeated').length,3);g.events=[];
 for(let i=0;i<25;i++)g.step(.1);assert.deepEqual(g.export(),fixture.after26Steps);assert.ok(!g.events.some(e=>e.type==='boss-defeated'));
});

test('a final boss settles victory and rewards immediately; reload cannot replay its death',()=>{
 const g=new Game(0,42);g.phase='battle';g.wave=g.campaignWaves;g.pendingWaves=[g.wave];const e=g.spawn('boss',200);e.hp=0;g.events=[];
 g.step(.1);assert.equal(g.phase,'won');assert.equal(g.events.filter(e=>e.type==='boss-defeated').length,1);assert.equal(g.events.filter(e=>e.type==='won').length,1);
 const save=g.export(),copy=Game.restore(save);copy.step(.1);assert.equal(copy.ink,save.ink);assert.equal(copy.kills,save.kills);assert.equal(copy.hp,save.hp);assert.equal(copy.events.length,0);
});

test('real tower attacks and ongoing poison damage both produce a single defeat',()=>{
 for(const source of ['tower','poison']){
  const g=new Game(0,42);g.ink=500;g.phase='battle';g.wave=9;g.pendingWaves=[9];
  const e=g.spawn('ironboss',200);e.maxHp=200;e.hp=.1;
  if(source==='tower'){
   g.hand=[...'火球文文文文文文文文文文文文文文'].map(ch=>({id:++g.handSerial,ch,used:false}));assert.ok(g.build('火球',2));
   let nearest;for(let d=0;d<enemyLength(e);d+=5){e.d=d;const p=enemyPosition(e),pad=g.pads[2],distance=Math.hypot(p.x-pad.x,p.y-pad.y);if(!nearest||distance<nearest.distance)nearest={d,distance};}
   e.d=nearest.d;assert.ok(nearest.distance<towerStats(g.towers[0]).range);
  }else{e.poisonDps=100;e.poisonUntil=10;}
  g.events=[];g.step(.1);assert.equal(g.events.filter(e=>e.type==='boss-defeated').length,1,source);assert.equal(g.kills,1);assert.ok(!g.enemies.includes(e));
 }
});
