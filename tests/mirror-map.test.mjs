import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game,getMap,enemyPosition,enemyLength} from '../dist/engine.mjs';
import {mapGeometry} from '../scripts/audit-mirror-map.mjs';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/mirror-layout-v9.json',import.meta.url)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);

test('mirror routes separate the wings until the final eighth without repeated ground segments or blocked pads',()=>{
 const old=mapGeometry(1),now=mapGeometry(2),map=getMap(7);
 assert.deepEqual(now.groundLengths,[1680,1680]);assert.equal(now.sharedTailFraction,.125);
 assert.ok(old.sharedTailFraction>.66);assert.ok(now.minimumPadRoadDistance>=50);
 assert.ok(now.range263.maximumMeanFraction<.65);assert.ok(now.range263.maximumMeanFraction<old.range263.maximumMeanFraction-.15);
 assert.deepEqual(now.airLengths,old.airLengths);assert.equal(map.mode,'simultaneous');
 for(const route of map.routes)for(let i=1;i<route.length;i++)for(let j=i+2;j<route.length;j++){
  const a=route[i-1],b=route[i],c=route[j-1],d=route[j];
  const horizontal=a.y===b.y&&c.y===d.y&&a.y===c.y,vertical=a.x===b.x&&c.x===d.x&&a.x===c.x;
  const overlap=(key)=>Math.min(Math.max(a[key],b[key]),Math.max(c[key],d[key]))-Math.max(Math.min(a[key],b[key]),Math.min(c[key],d[key]));
  if(horizontal)assert.ok(overlap('x')<=0);if(vertical)assert.ok(overlap('y')<=0);
 }
});

test('genuine previous-release mirror battle retains route, pad, enemy position, wallet, wounds and zones exactly',()=>{
 const data=structuredClone(fixture.data),g=Game.restore(data);assert.equal(g.mirrorLayout,1);
 assert.deepEqual(g.pads,fixture.pads);assert.deepEqual(g.enemies.map(enemyPosition),fixture.positions);assert.deepEqual(g.enemies.map(enemyLength),fixture.lengths);
 for(const key of ['towers','zones','queue','hand','ink','hp','wave','time','rngState','autoWaveAt','pendingWaves'])assert.deepEqual(g[key],data[key],key);
 const copy=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.deepEqual(copy.export(),g.export());
 for(let i=0;i<200;i++){g.step(.1);copy.step(.1);}assert.deepEqual(copy.export(),g.export());
 const comparable=g.export();delete comparable.mirrorLayout;for(const e of comparable.enemies)delete e.mirrorLayout;
 assert.deepEqual(comparable,fixture.after20Seconds,'the old route battle must reproduce the previous engine after twenty seconds');
 const child=g.spawn('mirrorling',600,1);assert.equal(child.mirrorLayout,1);assert.equal(enemyLength(child),1820);
 child.hp=child.maxHp*.4;g.updateEnemies(.01);assert.ok(g.enemies.filter(e=>e.isCopy).every(e=>e.mirrorLayout===1));
 assert.ok(g.enemies.some(e=>e.isCopy));assert.equal(g.continueEndless(),false);
});

test('new mirror campaigns persist the new geometry for queues, ground, air, splits and endless play',()=>{
 const g=new Game(7,42);assert.equal(g.mirrorLayout,2);g.startWave();g.step(.01);
 assert.deepEqual(g.enemies.map(e=>e.route),[0,1]);assert.ok(g.enemies.every(e=>e.mirrorLayout===2));
 for(const route of [0,1])for(const kind of ['normal','mirrorbird']){const e=g.spawn(kind,0,route);e.d=enemyLength(e);assert.deepEqual(enemyPosition(e),{x:450,y:550});}
 const parent=g.spawn('split',600,1);parent.hp=0;g.step(.1);assert.ok(g.enemies.filter(e=>e.kind==='small').every(e=>e.mirrorLayout===2&&e.route===1));
 const copy=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.deepEqual(copy.export(),g.export());
 g.phase='won';g.wave=g.campaignRounds*3;g.enemies=[];g.queue=[];g.pendingWaves=[];assert.ok(g.continueEndless());g.startWave();g.step(.01);
 assert.ok(g.enemies.every(e=>e.mirrorLayout===2));assert.equal(g.mirrorLayout,2);near(enemyLength(g.enemies[0]),1680);
 const restarted=new Game(g.chapter,42);assert.equal(restarted.mirrorLayout,2);assert.deepEqual(restarted.pads,getMap(7).pads);
});

test('mirror layout validation rejects unknown versions and inconsistent enemy geometry',()=>{
 const data=new Game(7,42).export();for(const mirrorLayout of [0,3,'2',null])assert.throws(()=>Game.restore({...data,mirrorLayout}));
 assert.throws(()=>Game.restore({...new Game(0,42).export(),mirrorLayout:2}));
 const g=new Game(7,42);g.spawn('normal');const bad=g.export();bad.enemies[0].mirrorLayout=1;assert.throws(()=>Game.restore(bad));
});
