import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,getWord,towerDefense} from '../dist/engine.mjs';
const stock=(g,word)=>g.hand=[...word.padEnd(32,'月')].map(ch=>({ch,id:++g.handSerial,used:false}));
const build=(g,word='飞流直下三千尺')=>{stock(g,word);assert.ok(g.build(word,2));return g.towers.at(-1);};

test('a zero-wallet debugging session can use every ink-spending action without altering its wallet',()=>{
 const g=new Game(0,42);g.ink=0;g.debugMode=true;const t=build(g);assert.equal(g.hand.filter(a=>a.used).length,7);assert.equal(g.ink,0);
 assert.ok(g.upgrade(t.id));assert.ok(g.upgrade(t.id));assert.equal(t.level,getWord(t.word).maxLevel);assert.equal(g.upgrade(t.id),false);assert.equal(g.ink,0);
 t.hp*=.4;assert.ok(g.repair(t.id));assert.equal(t.hp,towerDefense(t).maxHp);t.hp=0;assert.equal(g.repair(t.id),false,'repair cooldown still applies');g.time+=8;assert.ok(g.repair(t.id));assert.equal(t.rebuilds,1);assert.equal(g.ink,0);
 for(let pad=12;pad<16;pad++)assert.ok(g.unlockPad(pad));assert.equal(g.ink,0);
 let hint=g.requestHint();assert.ok(hint);assert.equal(hint.cost,0);assert.ok(g.refreshHand());assert.ok(g.requestHint());assert.ok(g.refreshHand());assert.equal(g.ink,0);
 assert.ok(g.startWave());assert.ok(g.skill());assert.equal(g.skill(),false,'skill cooldown still applies');g.time+=30;assert.ok(g.skill());assert.equal(g.ink,0);assert.equal(g.skillUses,2);
 assert.ok(g.events.filter(e=>['repair','hint','refresh','unlock','skill'].includes(e.type)).every(e=>e.cost===0));assert.deepEqual(Game.restore(g.export()).export(),g.export());
});

for(const action of['build','upgrade','repair','rebuild','unlock','refresh','hint','skill'])test('disabling debug immediately restores payment and zero-wallet rejection: '+action,()=>{
 const g=new Game(0,42);g.debugMode=true;g.ink=0;let t;
 if(['upgrade','repair','rebuild','skill'].includes(action))t=build(g,'火球');
 if(action==='repair')t.hp*=.5;if(action==='rebuild')t.hp=0;if(action==='build')stock(g,'飞流直下三千尺');if(action==='skill')g.startWave();
 const cost=action==='build'?400:action==='upgrade'?g.upgradeCost(t):['repair','rebuild'].includes(action)?g.repairCost(t):action==='unlock'?g.unlockCost():action==='refresh'?g.refreshCost():action==='hint'?g.hintCost():g.skillCost();
 const run=()=>action==='build'?g.build('飞流直下三千尺',2):action==='upgrade'?g.upgrade(t.id):['repair','rebuild'].includes(action)?g.repair(t.id):action==='unlock'?g.unlockPad(12):action==='refresh'?g.refreshHand():action==='hint'?g.requestHint():g.skill();
 g.debugMode=false;const before=g.export();assert.equal(run(),false);assert.deepEqual(g.export(),before);g.ink=cost+7;assert.ok(run());assert.equal(g.ink,7);
});

test('debug state survives a detached snapshot, defaults off for old saves and rejects malformed flags',()=>{
 const g=new Game(0,42);assert.equal(g.debugMode,false);assert.equal(Object.hasOwn(g.export(),'debugMode'),false);const old=g.export();assert.equal(Game.restore(old).debugMode,false);g.debugMode=true;const saved=g.export();assert.equal(saved.debugMode,true);assert.equal(Game.restore(saved).debugMode,true);
 for(const debugMode of[1,0,'on','false',null,{},[]])assert.throws(()=>Game.restore({...old,debugMode}));g.debugMode=false;assert.equal(Object.hasOwn(g.export(),'debugMode'),false);
});

test('debugging cannot bypass consumed cards, word order, occupied or locked pads, ruined towers or completed games',()=>{
 const g=new Game(0,42);g.debugMode=true;g.ink=0;stock(g,'火球');const ids=g.tilesFor('火球');assert.equal(g.build('火球',2,[...ids].reverse()),false);assert.equal(g.build('火球',12),false);assert.ok(g.build('火球',2,ids));assert.equal(g.build('火球',3,ids),false);stock(g,'火球');assert.equal(g.build('火球',2),false);const t=g.towers[0];t.hp=0;assert.equal(g.upgrade(t.id),false);g.phase='won';const before=g.export();for(const action of[()=>g.build('火球',3),()=>g.unlockPad(12),()=>g.refreshHand(),()=>g.requestHint(),()=>g.repair(t.id),()=>g.skill()])assert.equal(action(),false);assert.deepEqual(g.export(),before);
});
