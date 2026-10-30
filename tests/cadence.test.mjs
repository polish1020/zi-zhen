import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,CHAPTERS,ENEMIES,wavePlan} from '../dist/engine.mjs';
const oldRounds=[6,8,10,8,9,9,10,10,11,12];
function legacy(g){const save=JSON.parse(JSON.stringify(g.export()));save.version=4;delete save.campaignRounds;return save;}
test('all ten chapters gain two to four rounds and keep three waves per round',()=>{
 assert.deepEqual(CHAPTERS.map(c=>c.rounds),[8,10,12,10,11,12,13,14,15,16]);
 CHAPTERS.forEach((c,i)=>{assert.ok(c.rounds-oldRounds[i]>=2&&c.rounds-oldRounds[i]<=4);assert.equal(c.waves,c.rounds*3);const g=new Game(i);assert.equal(g.campaignRounds,c.rounds);assert.equal(g.campaignWaves,c.waves);});
});
test('first boss is round three, next are five and seven, then every round with no bosses in the earlier waves',()=>{
 for(let ch=0;ch<10;ch++){const rounds=[];for(let wave=1;wave<=CHAPTERS[ch].waves;wave++){const p=wavePlan(ch,wave);if(p.boss){assert.equal(p.part,3);rounds.push(p.round);}}assert.deepEqual(rounds,[3,5,7,...Array.from({length:CHAPTERS[ch].rounds-7},(_,i)=>i+8)]);}
});
test('legacy completed chapters keep their victory and enter dense endless immediately without losing investments',()=>{
 for(let ch=0;ch<10;ch++){const g=new Game(ch,42);g.wave=oldRounds[ch]*3;g.phase='won';g.ink=789;const save=legacy(g),h=Game.restore(save);assert.equal(h.phase,'won');assert.equal(h.campaignRounds,oldRounds[ch]);assert.equal(h.ink,789);const hand=JSON.stringify(h.hand);assert.ok(h.continueEndless());assert.equal(JSON.stringify(h.hand),hand);
  for(let part=1;part<=3;part++){h.phase='prepare';h.queue=[];h.pendingWaves=[];h.startWave();const p=h.plan(h.wave);assert.equal(p.endlessRound,1);assert.equal(p.boss,true);assert.equal(h.queue.filter(e=>ENEMIES[e.kind].boss).length,1);}
  const copy=Game.restore(JSON.parse(JSON.stringify(h.export())));assert.equal(copy.campaignRounds,oldRounds[ch]);assert.equal(copy.endless,true);
 }
});
test('existing early endless saves retain their old boundary and every following wave has a boss',()=>{
 for(let ch=0;ch<10;ch++){const g=new Game(ch,42);g.endless=true;g.wave=oldRounds[ch]*3+1;g.phase='battle';g.pendingWaves=[g.wave];g.spawn('ironboss',100,0,g.wave);const h=Game.restore(legacy(g));assert.equal(h.campaignRounds,oldRounds[ch]);assert.equal(h.plan(h.wave).endlessRound,1);assert.equal(h.plan(h.wave).boss,true);assert.equal(h.wavePreview().boss,true);assert.equal(h.enemies[0].hp,g.enemies[0].hp);assert.equal(h.ink,g.ink);}
});
test('ongoing legacy campaign expands its goal but keeps a previously queued boss, RNG and wallet',()=>{
 const g=new Game(0,42);g.wave=18;g.phase='battle';g.pendingWaves=[18];g.bossDraws=[{wave:18,kind:'boss'}];g.spawn('boss',120,0,18);const h=Game.restore(legacy(g));assert.equal(h.campaignRounds,8);assert.equal(h.plan(18).boss,true);assert.equal(h.plan(18).bossKind,'boss');assert.equal(h.ink,g.ink);assert.equal(h.rngState,g.rngState);assert.deepEqual(h.queue,g.queue);assert.deepEqual(h.enemies,g.enemies);assert.equal(h.plan(21).boss,true);
});
test('campaign length is validated and the actual stored final round settles only once',()=>{
 const g=new Game(0,42);for(const value of [undefined,NaN,Infinity,0,-1,1.5,'8',101])assert.throws(()=>Game.restore({...g.export(),campaignRounds:value}));assert.throws(()=>Game.restore({...g.export(),wave:g.campaignWaves+1}));
 g.wave=g.campaignWaves;g.phase='battle';g.pendingWaves=[g.wave];g.step(.1);assert.equal(g.phase,'won');const ink=g.ink;g.step(.1);assert.equal(g.ink,ink);assert.equal(g.events.filter(e=>e.type==='won').length,1);assert.equal(Game.restore(g.export()).campaignRounds,8);
});
