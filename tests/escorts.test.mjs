import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,CHAPTERS,ENEMIES,isAir,enemyHealthScale,enemyWeapon,towerDefense,enemyLength} from '../dist/engine.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
function arena(wave=24){const g=new Game(0,42);g.ink=5000;g.hand=[...'文文文文文文文文文文文文文文文文'].map(ch=>({id:++g.handSerial,ch,used:false}));g.build('文',0);g.towers[0].cooldown=1e6;g.phase='battle';g.wave=wave;g.pendingWaves=[wave];return g;}
test('boss waves keep their planned count while four matching-route guards join the leader',()=>{
 for(let ch=0;ch<10;ch++)for(let seed=1;seed<=5;seed++){
  const g=new Game(ch,seed);g.wave=8;g.startWave();const entry=g.queue.find(e=>ENEMIES[e.kind].boss),guards=g.queue.filter(e=>e.escort);assert.equal(guards.length,4);assert.equal(g.queue.length,g.plan(9).count);assert.ok(guards.every(e=>e.route===entry.route&&isAir(e)===isAir(entry)));
  const boss=g.spawnEntry(entry);for(const row of guards){const e=g.spawnEntry(row);assert.equal(e.escortBossId,boss.id);close(e.maxHp,ENEMIES[e.kind].hp*enemyHealthScale(ch,9,e.kind)*1.25);}
  const h=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.equal(h.queue.filter(e=>e.escort).length,4);assert.equal(h.enemies.filter(e=>e.escortBossId===boss.id).length,4);
 }
});
test('guards wait for the leader, catch up without ignoring control, and resume marching after its death',()=>{
 const g=arena(),boss=g.spawn('boss',400),e=g.bindEscort(g.spawn('armor',500),boss);boss.pulseAt=boss.abilityAt=boss.escortReadyAt=1e6;boss.speed=30;e.speed=20;g.updateEnemies(.1);close(e.d,500);
 e.d=200;const gap=boss.d-e.d;g.updateEnemies(.1);assert.ok(boss.d-e.d<gap);e.freezeUntil=100;const at=e.d;g.updateEnemies(.1);close(e.d,at);e.freezeUntil=0;e.slowUntil=100;e.slowFactor=.5;const before=e.d;g.updateEnemies(.1);assert.ok(e.d-before<2);
 e.slowUntil=0;e.d=boss.d+100;boss.hp=0;const prior=e.d;g.updateEnemies(.1);assert.ok(e.d>prior);
});
test('isolated bosses call at most two escort pairs with inherited wave, route and reduced rewards',()=>{
 for(const kind of ['boss','stormboss']){const g=arena(),boss=g.spawn(kind,0);boss.d=enemyLength(boss)*.5;boss.pulseAt=boss.abilityAt=1e6;boss.escortReadyAt=0;g.updateEnemies(.1);assert.equal(boss.escortCalls,1);let guards=g.enemies.filter(e=>e.escortBossId===boss.id);assert.equal(guards.length,2);assert.ok(guards.every(e=>e.wave===boss.wave&&e.route===boss.route&&isAir(e)===isAir(boss)&&e.reward===1));
  for(const e of guards)e.hp=0;g.time=boss.escortReadyAt;boss.d=enemyLength(boss)*.8;g.updateEnemies(.1);assert.equal(boss.escortCalls,2);guards=g.enemies.filter(e=>e.escortBossId===boss.id);assert.equal(guards.length,4);for(const e of guards)e.hp=0;g.time+=100;g.updateEnemies(.1);assert.equal(g.enemies.filter(e=>e.escortBossId===boss.id).length,4);
  const h=Game.restore(g.export());assert.equal(h.enemies[0].escortCalls,2);for(const n of [-1,3,1.5,'1']){const bad=g.export();bad.enemies[0].escortCalls=n;assert.throws(()=>Game.restore(bad));}
 }
});
test('army summons are delayed by silence/freeze and living nearby guards prevent redundant calls',()=>{
 const g=arena(),boss=g.spawn('boss',0);boss.d=enemyLength(boss)*.5;boss.escortReadyAt=0;boss.pulseAt=boss.abilityAt=1e6;boss.silencedUntil=100;g.updateEnemies(.1);assert.equal(boss.escortCalls,undefined);boss.silencedUntil=0;boss.freezeUntil=100;g.updateEnemies(.1);assert.equal(boss.escortCalls,undefined);boss.freezeUntil=0;for(let i=0;i<2;i++)g.bindEscort(g.spawn('armor',boss.d),boss);g.updateEnemies(.1);assert.equal(boss.escortCalls,undefined);assert.ok(boss.escortReadyAt>g.time);
});
test('repair costs 25 percent of missing investment with minimum five while rebuild progression remains separate',()=>{
 const g=arena(),t=g.towers[0],max=towerDefense(t).maxHp;t.hp=max/2;assert.equal(g.repairCost(t),Math.max(5,Math.ceil(t.spent*.25*.5)));t.hp=max-1;assert.equal(g.repairCost(t),5);t.hp=0;assert.equal(g.repairCost(t),Math.max(3,Math.ceil(t.spent*.5)));t.rebuilds=2;assert.equal(g.repairCost(t),Math.ceil(t.spent*.8));t.hp=max;assert.equal(g.repairCost(t),0);
});
test('ordinary troops gain faster late health, movement and real siege damage while early health stays intact',()=>{
 assert.equal(enemyWeapon('normal').damage,10);
 for(const round of [1,3,6,10,16]){const wave=round*3,oldGrowth=1+Math.max(0,round-3)*(.02+.006*Math.min(1,Math.max(0,round-3)/3)),newGrowth=1+Math.max(0,round-3)*(.045+.005*Math.min(1,Math.max(0,round-3)/3));if(round<=3)close(newGrowth,oldGrowth);else assert.ok(newGrowth>oldGrowth);
  const g=arena(wave),e=g.spawn('normal',110),t=g.towers[0];e.speed=10;e.towerAttackAt=0;const before=e.d;g.updateEnemies(.1);close(e.d-before,1+Math.min(.2,Math.max(0,round-6)*.0125));g.updateTowerAttacks();const hp=t.hp;g.time=e.towerStrikeAt;g.updateTowerAttacks();assert.ok(t.hp<hp);
 }
 function injury(wave){const g=arena(wave),e=g.spawn('normal',110);e.speed=.01;e.towerAttackAt=0;g.updateTowerAttacks();const hp=g.towers[0].hp;g.time=e.towerStrikeAt;g.updateTowerAttacks();return hp-g.towers[0].hp;}assert.ok(injury(36)>injury(9)*3);
});
test('late ordinary troops can destroy an unmaintained tower while the same early group remains buffered',()=>{
 for(const [wave,shouldFall]of [[9,false],[36,true]]){const g=arena(wave);for(let i=0;i<5;i++){const e=g.spawn('normal',110);e.speed=.01;e.hp=e.maxHp=1e6;e.towerAttackAt=0;}for(let i=0;i<400;i++)g.step(.1);assert.equal(g.towers[0].hp===0,shouldFall);if(shouldFall)assert.ok(g.events.some(e=>e.type==='tower-down'&&e.enemy==='normal'));}
});
test('bad escort references and queued flags are rejected and after gate passage guards are released',()=>{
 const g=arena(),boss=g.spawn('boss',400),guard=g.bindEscort(g.spawn('armor',500),boss);for(const v of [-1,1.2,'1']){const bad=g.export();bad.enemies[1].escortBossId=v;assert.throws(()=>Game.restore(bad));}const bad=g.export();bad.queue=[{kind:'normal',escort:'yes'}];assert.throws(()=>Game.restore(bad));boss.d=enemyLength(boss);const at=guard.d;g.updateEnemies(.1);assert.ok(guard.d>at);
});
test('sniper towers can pick the boss behind its guards while ordinary towers still attack the front line',()=>{
 const g=arena(),t=g.towers[0],boss=g.spawn('inkking',100),guard=g.spawn('normal',120);boss.hp=boss.maxHp=1e5;guard.hp=guard.maxHp=1e5;t.word='箭';t.level=1;t.cooldown=0;g.attack(t,.1);assert.ok(boss.hp<boss.maxHp);assert.equal(guard.hp,guard.maxHp);let hp=boss.hp;t.word='寒冰箭';t.level=3;t.cooldown=0;g.attack(t,.1);assert.ok(boss.hp<hp);hp=boss.hp;t.word='文';t.level=1;t.cooldown=0;g.attack(t,.1);assert.equal(boss.hp,hp);assert.ok(guard.hp<guard.maxHp);
});
test('late support guards threaten towers without ambushing the gate and retreat when their boss falls',()=>{
 const g=arena(24),boss=g.spawn('boss',0);boss.d=enemyLength(boss)*.8;boss.escortReadyAt=0;boss.pulseAt=boss.abilityAt=1e6;g.updateEnemies(.1);const guard=g.enemies.find(e=>e.escortSummoned);assert.ok(guard);assert.equal(guard.harm,0);guard.d=enemyLength(guard)+1;const hp=g.hp;g.step(.1);assert.equal(g.hp,hp);
 const regular=g.bindEscort(g.spawn('normal',boss.d-20),boss);boss.hp=0;g.step(.1);assert.ok(!g.enemies.some(e=>e.escortSummoned));assert.ok(g.enemies.some(e=>e.id===regular.id));assert.equal(g.kills,1);
});
test('frost chapter allows formation time before its late ice-shell pressure without weakening bosses',()=>{
 const chapter=6;for(const round of [1,3,4,6,7,12]){const wave=round*3,pressure=Math.max(0,round-3),ramp=Math.min(1,pressure/3);const raw=(1+(round-1)*.36+pressure*.065*ramp+.16+1.4)*1.25*(1+Math.max(0,round-5)*.02)*(1+pressure*(.045+.005*ramp));close(enemyHealthScale(chapter,wave,'normal'),raw*(round<=6?.8:1));assert.ok(enemyHealthScale(chapter,wave,'boss')>enemyHealthScale(chapter,wave,'normal'));}
});
test('visible upgrade durability scales against full siege damage and old saves retain their injury ratio',()=>{
 const g=arena(),t=g.towers[0],base=towerDefense(t).maxHp;t.hp=base/2;const missing=base-t.hp;g.upgrade(t.id);assert.ok(towerDefense(t).maxHp-base>=150);close(towerDefense(t).maxHp-t.hp,missing);
 const old=g.export();old.version=4;delete old.campaignRounds;const oldMax=towerDefense(t,true).maxHp;old.towers[0].hp=oldMax*.4;const h=Game.restore(old);close(h.towers[0].hp/towerDefense(h.towers[0]).maxHp,.4);
});
