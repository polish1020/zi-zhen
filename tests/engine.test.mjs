import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,WORDS,PADS,CHAPTERS,LENGTH,position,getWord,towerStats,matchWord,HAND_SIZE} from '../dist/engine.mjs';

function stock(g,word){const chars=[...word];while(chars.length<HAND_SIZE)chars.push('光');g.hand=chars.map(ch=>({id:++g.handSerial,ch,used:false}));}
function build(g,word,pad){stock(g,word);assert.ok(g.build(word,pad));return g.towers.at(-1);}
function runWave(g){assert.ok(g.startWave());let steps=0;while(g.phase==='battle'&&steps++<5000)g.step(.1);assert.ok(steps<5000);}

test('99 distinct recipes, nine schools and four increasing starting tiers',()=>{
 assert.equal(WORDS.length,99);assert.equal(new Set(WORDS.map(w=>w.word)).size,99);assert.equal(new Set(WORDS.map(w=>w.type)).size,9);
 for(const w of WORDS){assert.equal(w.tier,[...w.word].length);assert.ok(w.tier>=1&&w.tier<=4);assert.equal(w.maxLevel,w.tier+2);assert.ok(w.cost>0);}
 for(const type of new Set(WORDS.map(w=>w.type))){const group=WORDS.filter(w=>w.type===type);for(let tier=2;tier<=4;tier++){const a=group.find(w=>w.tier===tier-1),b=group.find(w=>w.tier===tier);assert.ok(b.cost>a.cost);assert.ok(b.damage>a.damage||b.aura>a.aura||b.income>a.income);}}
 assert.equal(matchWord(['鸣','雷','闪','电']).word,'电闪雷鸣');assert.equal(matchWord(['火']).word,'火');assert.equal(matchWord(['假','词']),null);assert.equal(matchWord(['火','火','火','火','火']),null);
});
test('500 random hands have unique tiles, a usable attack word, a three-word and an idiom',()=>{
 const hands=new Set();for(let seed=1;seed<=500;seed++){const g=new Game(0,seed);assert.equal(g.hand.length,16);assert.equal(new Set(g.hand.map(t=>t.id)).size,16);assert.ok(g.availableWords().some(w=>w.tier===2&&w.damage&&w.cost<=g.ink));assert.ok(g.availableWords().some(w=>w.tier===1&&w.damage&&w.cost<=37));assert.ok(g.availableWords().some(w=>w.tier===3));assert.ok(g.availableWords().some(w=>w.tier===4));hands.add(g.hand.map(t=>t.ch).join(''));}assert.ok(hands.size>490);
});
test('path reaches the gate and clamps at both ends',()=>{assert.deepEqual(position(0),{x:-30,y:150});assert.deepEqual(position(LENGTH),{x:940,y:370});assert.deepEqual(position(-3),position(0));assert.deepEqual(position(LENGTH+10),position(LENGTH));});
test('tiles and ink are consumed together only on successful placement',()=>{
 const g=new Game(0,1);stock(g,'火球');const ids=g.tilesFor('火球'),before=g.export();assert.equal(g.build('火球',99,ids),false);assert.deepEqual(g.export(),before);assert.ok(g.build('火球',2,ids));assert.equal(g.ink,140);assert.ok(ids.every(id=>g.hand.find(t=>t.id===id).used));assert.equal(g.build('火球',3,ids),false);assert.equal(g.towers.length,1);stock(g,'冰霜');const state=g.export();assert.equal(g.build('冰霜',2),false);assert.deepEqual(g.export(),state);g.ink=0;const hand=JSON.stringify(g.hand);assert.equal(g.build('冰霜',3),false);assert.equal(JSON.stringify(g.hand),hand);
});
test('repeated characters need separate physical tiles; ids cannot be reused',()=>{
 const g=new Game();stock(g,'百发百中');const ids=g.tilesFor('百发百中');assert.equal(new Set(ids).size,4);assert.equal(g.build('百发百中',0,[ids[0],ids[1],ids[0],ids[3]]),false);assert.ok(g.build('百发百中',0,[...ids].reverse()));assert.equal(g.towers[0].level,4);assert.equal(g.hand.filter(t=>t.used).length,4);assert.equal(g.tilesFor('百发百中'),null);
});
test('refresh discards the old tray, increases price and cannot charge insufficient funds',()=>{
 const g=new Game(0,5),old=g.hand.map(t=>t.id);assert.equal(g.refreshCost(),15);assert.ok(g.refreshHand());assert.equal(g.ink,185);assert.equal(g.refreshCost(),20);assert.ok(g.hand.every(t=>!old.includes(t.id)&&!t.used));g.ink=1000;for(let i=0;i<10;i++)g.refreshHand();assert.equal(g.refreshCost(),40);g.ink=0;const before=g.export();assert.equal(g.refreshHand(),false);assert.deepEqual(g.export(),before);
});
test('each wave resets refresh price; clear and income rewards happen once',()=>{
 const g=new Game();g.refreshHand();g.phase='battle';g.wave=1;build(g,'生财',0);const ink=g.ink;g.step(.1);assert.equal(g.phase,'prepare');assert.equal(g.ink,ink+46+14);assert.equal(g.refreshCost(),15);const paid=g.ink;g.step(.1);assert.equal(g.ink,paid);
});
test('income is capped across towers and all tiers can be enhanced exactly twice',()=>{
 const g=new Game();g.ink=10000;for(let i=0;i<4;i++){const t=build(g,'招财进宝',i);assert.ok(g.upgrade(t.id));assert.ok(g.upgrade(t.id));assert.equal(g.upgrade(t.id),false);assert.equal(t.level,6);}g.phase='battle';g.wave=1;const before=g.ink;g.step(.1);assert.equal(g.ink-before,46+80);
 for(const word of ['火','火球','火焰山','火树银花']){const h=new Game();h.ink=1000;const t=build(h,word,0);assert.equal(t.level,getWord(word).tier);h.upgrade(t.id);h.upgrade(t.id);assert.equal(t.level,getWord(word).maxLevel);assert.equal(h.upgrade(t.id),false);}
});
test('selling refunds 70% of actual investment but never returns spent tiles',()=>{
 const g=new Game();g.ink=500;const t=build(g,'火球',0);g.upgrade(t.id);g.upgrade(t.id);assert.equal(t.spent,174);assert.equal(g.ink,326);const used=g.hand.filter(t=>t.used).map(t=>t.id);assert.ok(g.sell(t.id));assert.equal(g.ink,326+Math.floor(174*.7));assert.ok(used.every(id=>g.hand.find(t=>t.id===id).used));assert.equal(g.sell(t.id),false);
});
test('poison deals timed damage, expires correctly and pays kills only once',()=>{
 const g=new Game();build(g,'毒雾',0);g.phase='battle';g.spawn('boss');const e=g.enemies[0];e.d=130;e.hp=1000;e.maxHp=1000;g.step(.01);assert.equal(e.poisonDps,14*.6);const start=e.hp;g.towers=[];for(let i=0;i<40;i++)g.step(.1);assert.ok(Math.abs(start-e.hp-25.2)<.0001);e.hp=.1;e.poisonUntil=g.time+1;e.poisonDps=10;g.step(.1);assert.equal(g.kills,1);const ink=g.ink;g.step(.1);assert.equal(g.ink,ink);
});
test('strongest aura applies once across all aura recipes',()=>{
 function hit(words){const g=new Game();g.ink=5000;build(g,'风刃',6);words.forEach((w,i)=>build(g,w,[8,4][i]));g.phase='battle';g.spawn('boss');const e=g.enemies[0];e.d=935;e.hp=1000;g.step(.01);return 1000-e.hp;}
 assert.equal(hit([]),12);assert.ok(Math.abs(hit(['光环'])-16.2)<.001);assert.ok(Math.abs(hit(['光芒万丈'])-18.6)<.001);assert.equal(hit(['光芒万丈','光环']),hit(['光芒万丈']));
});
test('armor, slow, splash, chain and execute retain distinct combat effects',()=>{
 for(const word of ['冰霜','火球','巨石']){const g=new Game();g.ink=1000;build(g,word,0);g.phase='battle';g.spawn('armor');const e=g.enemies[0];e.d=130;const before=e.hp;g.step(.01);assert.ok(Math.abs(before-e.hp-getWord(word).damage*(word==='巨石'?1:.7))<.001);if(word==='冰霜')assert.ok(e.slowUntil>g.time);}
 for(const word of ['火球','雷电']){const g=new Game();g.ink=1000;build(g,word,0);g.phase='battle';for(let i=0;i<4;i++){g.spawn('normal');g.enemies[i].d=130+i*10;}g.step(.01);assert.equal(g.enemies.filter(e=>e.hp<e.maxHp).length,word==='火球'?4:3);}
 const g=new Game();build(g,'弓箭',0);g.phase='battle';g.spawn('boss');const e=g.enemies[0];e.d=130;e.hp=100;e.maxHp=1000;g.step(.01);assert.ok(Math.abs(e.hp-(100-46*1.8))<.001);
});
test('wave composition is seeded, changes between seeds, and retains scheduled bosses',()=>{
 const a=new Game(0,3),b=new Game(0,3),c=new Game(0,8);for(const g of [a,b,c]){g.wave=2;g.startWave();assert.equal(g.queue.at(-1).kind,'boss');assert.equal(g.startWave(),false);}assert.deepEqual(a.queue,b.queue);assert.notDeepEqual(a.queue,c.queue);
});
test('skill keeps costs, cooldown and single kill payment',()=>{const g=new Game();assert.equal(g.skill(),false);g.startWave();g.spawn('normal');assert.ok(g.skill());assert.equal(g.ink,170);assert.equal(g.skill(),false);g.step(.01);assert.equal(g.kills,1);const ink=g.ink;g.step(.01);assert.equal(g.ink,ink);g.skillReady=0;g.ink=29;assert.equal(g.skill(),false);});
test('save keeps tray, consumption, refresh prices and next random draw',()=>{
 const g=new Game(1,9);const w=g.availableWords().find(w=>w.tier===2&&w.damage);g.build(w.word,2);g.refreshHand();g.startWave();for(let i=0;i<90;i++)g.step(.1);const copy=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.deepEqual(copy.export(),g.export());for(let i=0;i<20;i++){g.step(.1);copy.step(.1);}assert.deepEqual(copy.export(),g.export());g.refreshHand();copy.refreshHand();assert.deepEqual(g.export(),copy.export());const snapshot=g.export();snapshot.hand[0].used=!snapshot.hand[0].used;assert.notDeepEqual(snapshot.hand,g.hand);
});
test('legacy saves migrate towers and preserve hp, currency and chapter',()=>{
 const g=new Game(1,1);g.ink=500;const t=build(g,'火球',2);g.upgrade(t.id);const old=g.export();old.version=1;old.towers[0].level=2;delete old.towers[0].spent;delete old.hand;delete old.rngState;delete old.refreshes;delete old.handSerial;const migrated=Game.restore(old);assert.equal(migrated.towers[0].level,3);assert.equal(migrated.towers[0].spent,105);assert.equal(migrated.ink,g.ink);assert.equal(migrated.hp,18);assert.equal(migrated.chapter,1);assert.equal(migrated.hand.length,16);assert.equal(migrated.export().version,2);
});
test('corrupt saves cannot duplicate tiles, bypass tiers or replace methods',()=>{
 const g=new Game();const data=g.export();assert.throws(()=>Game.restore({...data,version:3}));assert.throws(()=>Game.restore({...data,rngState:0}));assert.throws(()=>Game.restore({...data,refreshes:-1}));const duplicate=structuredClone(data);duplicate.hand[1].id=duplicate.hand[0].id;assert.throws(()=>Game.restore(duplicate));const bad=structuredClone(data);bad.hand[0].ch='假';assert.throws(()=>Game.restore(bad));assert.throws(()=>Game.restore({...data,towers:[{word:'火球',pad:0,level:1,spent:60,id:1,cooldown:0}]}));assert.equal(typeof Game.restore({...data,step:'bad'}).step,'function');
});
test('unprotected waves lose; terminal games cannot spend ink or tiles',()=>{
 const g=new Game(2);let n=0;while(g.phase!=='lost'&&n++<10)runWave(g);assert.equal(g.phase,'lost');const before=g.export();assert.equal(g.refreshHand(),false);assert.equal(g.build('火',0),false);assert.equal(g.startWave(),false);assert.deepEqual(g.export(),before);
});
