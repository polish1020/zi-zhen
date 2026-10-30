import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,ENEMIES,getWord,towerStats,campaignKillPercent,clearInk,roundInk} from '../dist/engine.mjs';

function battle(wave=18,endless=false){const g=new Game(0,42);g.phase='battle';g.wave=wave;g.pendingWaves=[wave];g.endless=endless;return g;}
function stock(g,word){const chars=[...word];while(chars.length<16)chars.push('文');g.hand=chars.map(ch=>({id:++g.handSerial,ch,used:false}));}

test('campaign income tightens after the opening while boss rewards and endless retain full drops',()=>{
 assert.deepEqual([1,2,3,4,5,6,12].map(r=>campaignKillPercent(r)),[100,100,100,95,90,90,90]);
 for(const r of [1,2,3,4,12,30]){assert.equal(campaignKillPercent(r,true),100);assert.equal(campaignKillPercent(r,false,true),100);}
 const g=battle(18),before=g.totalEarned;
 for(let i=0;i<10;i++){const e=g.spawn('normal');e.reward=3;e.hp=0;}
 g.step(.01);assert.equal(g.totalEarned-before,27);assert.equal(g.killInkRemainder,0);
 const h=battle(12,true);for(let i=0;i<10;i++){const e=h.spawn('normal');e.reward=3;e.hp=0;}
 h.step(.01);assert.equal(h.totalEarned,30);
});

test('fractional drop remainder is conserved across batches and saved without changing enemy rewards',()=>{
 const g=battle(),e=g.spawn('normal');e.reward=1;
 assert.equal(g.killInk(e),0);assert.equal(g.killInkRemainder,90);assert.equal(e.reward,1);
 const h=Game.restore(JSON.parse(JSON.stringify(g.export())));
 let paid=0;for(let i=0;i<9;i++)paid+=h.killInk(h.enemies[0]);
 assert.equal(paid,9);assert.equal(h.killInkRemainder,0);
 const old=g.export();delete old.killInkRemainder;assert.equal(Game.restore(old).killInkRemainder,0);
 for(const value of [-1,100,.5,NaN,'80']){const bad=g.export();bad.killInkRemainder=value;assert.throws(()=>Game.restore(bad));}
});

test('drops use the enemy wave, and a boss retains its entire drop without consuming the remainder',()=>{
 const g=battle(12),early=g.spawn('normal',0,0,3);early.reward=3;
 assert.equal(g.killInk(early),3);
 const late=g.spawn('normal');late.reward=1;g.killInk(late);const remainder=g.killInkRemainder;
 const boss=g.spawn('boss');assert.equal(g.killInk(boss),ENEMIES.boss.reward);assert.equal(g.killInkRemainder,remainder);
});

test('main wave and round bonuses stop growing, while endless keeps its existing bonuses',()=>{
 for(const round of [1,2,3,4,6,9,12,30]){
  assert.equal(clearInk(round),8+Math.min(6,round)*2);assert.equal(roundInk(round),20+Math.min(6,round)*3);
  assert.equal(clearInk(round,true),8+round*2);assert.equal(roundInk(round,true),20+round*3);
 }
 const g=new Game(9,42);g.phase='battle';g.wave=g.campaignWaves;g.pendingWaves=[g.wave];const before=g.ink;g.step(.01);
 assert.equal(g.ink-before,20+38);assert.equal(g.phase,'won');
 const won=g.events.find(x=>x.type==='won');assert.equal(won.baseReward,38);assert.equal(won.extraIncome,0);
 const ink=g.ink;g.step(.01);assert.equal(g.ink,ink);
 assert.ok(g.continueEndless());g.phase='battle';g.wave=g.campaignWaves+3;g.pendingWaves=[g.wave];const next=g.ink;g.step(.01);
 assert.equal(g.ink-next,clearInk(g.campaignRounds+1,true)+roundInk(g.campaignRounds+1,true));
});

test('gold production, prosperity and earned bounties remain available as economic choices',()=>{
 const g=battle(18);g.ink=2000;stock(g,'招财进宝');assert.ok(g.build('招财进宝',0));
 const t=g.towers[0];g.upgrade(t.id);g.upgrade(t.id);
 const production=Math.min(100,towerStats(t).income),extra=getWord(t.word).runes.includes('prosper')?4:0;
 const e=g.spawn('normal');e.reward=1;e.hp=0;e.bounty=3;e.bountyUntil=10;const before=g.ink;
 g.step(.01);assert.equal(g.totalEarned,3,'the fractional base drop is deferred; the earned bounty is paid fully');
 assert.equal(g.ink-before,3+clearInk(6)+roundInk(6)+production+extra);
 assert.equal(g.events.find(x=>x.roundEnd).income,production);
});

test('restoring an existing game preserves wallet and purchases and applies the curve only to future kills',()=>{
 const g=battle(12);g.ink=321;g.hintUses=3;g.refreshes=7;
 const e=g.spawn('normal');e.reward=5;e.hp=0;
 const h=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.equal(h.ink,321);assert.equal(h.hintUses,3);assert.equal(h.refreshCost(),50);
 h.step(.01);assert.equal(h.totalEarned,4);assert.equal(h.hintUses,3);
});
