import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,ENEMIES,CHAPTERS,enemyHealthScale,wavePlan,getMap} from '../dist/engine.mjs';
test('enemy counts grow within normal/boss formations, with explicit map escort budgets and cap 80',()=>{
 assert.deepEqual(Array.from({length:6},(_,i)=>wavePlan(0,i+1).count),[11,13,15,14,16,18]);
 for(let ch=0;ch<10;ch++){const last={boss:0,normal:0};for(let round=1;round<=60;round++){
  const plan=wavePlan(ch,round*3),key=plan.boss?'boss':'normal',budget=plan.boss?(getMap(ch).bossEscortBudget??1):1;
  assert.ok(plan.count>=last[key]&&plan.count<=80);last[key]=plan.count;
  const base=8+round*3+ch*2+4+Math.floor(Math.max(0,round-4)*1.4);assert.equal(plan.count,Math.min(80,Math.floor(base*budget)));
  if(round>4&&budget===1)assert.ok(plan.count>=Math.min(80,8+round*3+ch*2+4+1));
 }assert.equal(wavePlan(ch,180).count,80);}
});
test('boss health has a stronger growing multiplier than normal enemies at the same wave',()=>{for(let ch=0;ch<10;ch++){let normal=0,boss=0,lastRatio=0;for(let round=1;round<=35;round++){const n=enemyHealthScale(ch,round*3,'normal'),b=enemyHealthScale(ch,round*3,'boss');assert.ok(n>normal&&b>boss);const ratio=b/n*(ch>=3&&round<=3?.9:1);assert.ok(ratio>=lastRatio-1e-8);lastRatio=ratio;normal=n;boss=b;}}assert.ok(Math.abs(enemyHealthScale(0,9,'boss')/enemyHealthScale(0,9,'normal')-2.34*1.7)<1e-9);});
test('all 42 bosses have a single persistent half-health phase, including basic bosses',()=>{for(const [kind,data]of Object.entries(ENEMIES).filter(([,e])=>e.boss)){const g=new Game(0,42);g.phase='battle';g.wave=9;g.pendingWaves=[9];const e=g.spawn(kind,200);e.hp=e.maxHp*.49;g.step(.01);assert.equal(e.enraged,true,kind);assert.equal(g.events.filter(e=>e.type==='boss-phase').length,1,kind);const h=Game.restore(JSON.parse(JSON.stringify(g.export()))),count=h.enemies.length;h.step(.01);assert.equal(h.enemies.length,count,kind);assert.equal(h.events.filter(e=>e.type==='boss-phase').length,0,kind);}});
test('basic ground boss gains a real mid-fight shield and basic flying boss gains phase haste',()=>{const g=new Game();g.phase='battle';g.wave=9;g.pendingWaves=[9];const e=g.spawn('boss',200);e.hp=e.maxHp*.49;g.step(.1);assert.ok(Math.abs(e.shield-e.maxHp*.12)<1e-7);assert.equal(e.enraged,true);const h=new Game();h.phase='battle';h.wave=9;h.pendingWaves=[9];const fly=h.spawn('stormboss',200);fly.hp=fly.maxHp*.49;const d=fly.d;h.step(.1);assert.ok(Math.abs(fly.d-d-fly.speed*1.12*.1)<1e-7);});
test('saved active enemies keep existing health and newly spawned waves use the stronger curve',()=>{const g=new Game(0,42);g.startWave();g.step(.1);g.enemies[0].hp=17;g.enemies[0].maxHp=56.25;const h=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.equal(h.enemies[0].hp,17);assert.equal(h.enemies[0].maxHp,56.25);h.endless=true;h.wave=CHAPTERS[0].waves+9;const e=h.spawn('boss',0,0,h.wave);assert.equal(e.maxHp,ENEMIES.boss.hp*enemyHealthScale(0,h.wave,'boss'));});
