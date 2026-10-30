import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,CHAPTERS} from '../dist/engine.mjs';

test('successful new hints cost 100, 200, 300, while viewing the same hint stays free',()=>{
 const g=new Game(0,42);g.ink=5000;
 for(const cost of [100,200,300]){
  const before=g.ink,hint=g.requestHint();assert.equal(hint.cost,cost);assert.equal(g.ink,before-cost);
  const count=g.hintUses;assert.equal(g.requestHint().cost,0);assert.equal(g.hintUses,count);
  assert.ok(g.refreshHand());assert.equal(g.ink,before-cost-50);assert.equal(g.hintCost(),cost+100);
 }
 assert.equal(g.hintUses,3);assert.equal(g.hintCost(),400);
});
test('no matching word and insufficient ink cannot consume money or raise the next quote',()=>{
 const g=new Game(0,42);g.ink=1000;g.requestHint();g.refreshHand();g.hand.forEach(t=>t.used=true);
 let before=g.export();assert.equal(g.requestHint(),false);assert.deepEqual(g.export(),before);
 g.drawHand();g.ink=199;before=g.export();assert.equal(g.requestHint(),false);assert.deepEqual(g.export(),before);
 assert.equal(g.hintCost(),200);
});
test('hint increases survive round settlement, reload and endless continuation but a new game resets them',()=>{
 const g=new Game(0,42);g.ink=1000;g.requestHint();g.refreshHand();g.requestHint();
 g.phase='battle';g.wave=3;g.pendingWaves=[3];g.step(.1);assert.equal(g.hintUses,2);
 const h=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.equal(h.hintUses,2);
 assert.equal(h.requestHint().cost,0);h.refreshHand();assert.equal(h.hintCost(),300);
 h.wave=CHAPTERS[0].waves;h.phase='won';assert.ok(h.continueEndless());assert.equal(h.hintCost(),300);
 assert.equal(new Game().hintCost(),100);assert.equal(new Game(1).hintCost(),100);
});
test('older saves retain an unlocked hint for free and malformed purchase counts are rejected',()=>{
 const g=new Game(0,42);g.requestHint();const old=JSON.parse(JSON.stringify(g.export()));delete old.hintUses;
 const h=Game.restore(old);assert.equal(h.requestHint().cost,0);h.refreshHand();assert.equal(h.hintCost(),100);
 for(const count of [-1,.5,NaN,Infinity,'2',Number.MAX_SAFE_INTEGER]){
  const bad=g.export();bad.hintUses=count;assert.throws(()=>Game.restore(bad));
 }
});
test('refreshing costs exactly 50 across repeated uses, round changes and old stored refresh counts',()=>{
 const g=new Game(0,42);g.ink=1000;
 for(let i=0;i<8;i++){const before=g.ink,ids=g.hand.map(t=>t.id);assert.ok(g.refreshHand());assert.equal(g.ink,before-50);assert.ok(g.hand.every(t=>!ids.includes(t.id)));}
 g.phase='battle';g.wave=3;g.pendingWaves=[3];g.step(.1);assert.equal(g.refreshCost(),50);
 const old=g.export();old.refreshes=99;const h=Game.restore(old);assert.equal(h.refreshCost(),50);
 h.ink=49;const before=h.export();assert.equal(h.refreshHand(),false);assert.deepEqual(h.export(),before);
});
