import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,getWord,enemyLength,towerDefense} from '../dist/engine.mjs';
function add(g,word,pad){g.hand=[...word.padEnd(16,'文')].map(ch=>({id:++g.handSerial,ch,used:false}));assert.ok(g.build(word,pad));g.towers.at(-1).cooldown=1e6;}
function arena(){const g=new Game(0,42);g.ink=5000;add(g,'医生',0);add(g,'医生',1);g.wave=9;g.phase='battle';g.pendingWaves=[9];return g;}
test('boss gate damage cannot be immediately refunded by round healing and two mend towers',()=>{
 const g=arena(),boss=g.spawn('boss');boss.d=enemyLength(boss)+1;const hp=g.hp;g.step(.1);assert.equal(g.hp,hp-4);assert.equal(g.bossBreachedRound,3);const event=g.events.find(e=>e.type==='leak');assert.equal(event.boss,true);assert.equal(event.enemy,'boss');assert.equal(event.damage,4);assert.equal(event.blocked,0);assert.equal(g.phase,'prepare');
 const h=Game.restore(g.export());assert.equal(h.hp,hp-4);assert.equal(h.bossBreachedRound,3);h.step(.1);assert.equal(h.hp,hp-4);
});
test('barrier and weakening still reduce actual boss damage without restoring the remainder at settlement',()=>{
 const g=arena();add(g,'护盾',2);const boss=g.spawn('boss');boss.weakenUntil=10;boss.d=enemyLength(boss)+1;const hp=g.hp,blocked=Math.min(3,g.barrierRemaining());g.step(.1);assert.equal(g.hp,hp-3+blocked);const event=g.events.find(e=>e.type==='leak');assert.equal(event.blocked,blocked);assert.equal(event.damage,3-blocked);
});
test('ordinary leakage and later boss-free rounds never restore gate hearts',()=>{
 const g=arena(),enemy=g.spawn('normal');enemy.d=enemyLength(enemy)+1;g.hp=10;g.step(.1);assert.equal(g.hp,10-enemy.harm);assert.equal(g.bossBreachedRound,0);
 g.bossBreachedRound=3;g.wave=12;g.phase='battle';g.pendingWaves=[12];g.hp=10;g.step(.1);assert.equal(g.hp,10);
});
test('overlapping waves retain boss breach state through reload until the round settles exactly once',()=>{
 const g=arena();g.pendingWaves=[7,9];const blocker=g.spawn('normal',100,0,7),boss=g.spawn('boss',0,0,9);blocker.speed=.01;boss.d=enemyLength(boss)+1;g.step(.1);const hp=g.hp;assert.equal(g.phase,'battle');const copy=Game.restore(JSON.parse(JSON.stringify(g.export())));copy.enemies[0].hp=0;copy.step(.1);assert.equal(copy.phase,'prepare');assert.equal(copy.hp,hp);copy.step(.1);assert.equal(copy.hp,hp);
 for(const value of [-1,'3',NaN,10])assert.throws(()=>Game.restore({...g.export(),bossBreachedRound:value}));
});
test('round settlement repairs tower durability while leaving hearts unchanged, even with multiple mend towers',()=>{
 const g=arena();g.hp=7;const pair=[];for(let i=0;i<12;i++)for(let j=i+1;j<12;j++)pair.push({i,j,d:Math.hypot(g.pads[i].x-g.pads[j].x,g.pads[i].y-g.pads[j].y)});const near=pair.sort((a,b)=>a.d-b.d)[0];g.towers[0].pad=near.i;g.towers[1].pad=near.j;const t=g.towers[0],max=towerDefense(t).maxHp;t.hp=max*.2;g.wave=3;g.pendingWaves=[3];g.step(.1);assert.equal(g.hp,7);assert.ok(t.hp>max*.2);assert.ok(Math.abs(t.hp-max*.65)<1e-6);assert.equal(Game.restore(g.export()).hp,7);
});
