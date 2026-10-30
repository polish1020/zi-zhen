import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,ENEMIES,WORDS,TOWER_DEFENSES,towerDefense,towerStats,towerActive,getWord,enemyWeapon,enemyPosition} from '../dist/engine.mjs';
function build(g,word,pad=0){const chars=[...word];while(chars.length<16)chars.push('文');g.hand=chars.map(ch=>({id:++g.handSerial,ch,used:false}));assert.ok(g.build(word,pad));return g.towers.at(-1);}
function arena(word='文',kind='normal'){const g=new Game(0,42);g.ink=5000;const t=build(g,word);t.cooldown=1e6;g.phase='battle';g.wave=12;g.pendingWaves=[12];const e=g.spawn(kind,110);e.hp=e.maxHp=10000;e.speed=1;e.towerAttackAt=0;return{g,t,e};}
function advance(g,seconds){for(let i=0;i<Math.round(seconds*10);i++)g.step(.1);}
function close(a,b){assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);}
function pair(g,range=120){for(let d=50;d<1200;d+=5){const e={kind:'normal',map:g.chapter,route:0,d};const p=enemyPosition(e),pads=g.pads.map((v,i)=>({i,d:Math.hypot(v.x-p.x,v.y-p.y)})).filter(x=>x.i<12&&x.d<range*.8).sort((a,b)=>a.d-b.d);if(pads.length>=2)return{d,pads};}throw Error('no near pair');}
function supportPads(g){const pairs=[];for(let i=0;i<12;i++)for(let j=i+1;j<12;j++)pairs.push({i,j,d:Math.hypot(g.pads[i].x-g.pads[j].x,g.pads[i].y-g.pads[j].y)});const p=pairs.sort((a,b)=>a.d-b.d)[0];assert.ok(p.d<getWord('光').range);return{pads:[{i:p.i},{i:p.j}],d:110};}


test('every word has valid grade/level defense and all 94 monsters have an explicit siege profile',()=>{
 assert.equal(Object.keys(TOWER_DEFENSES).length,14);
 for(const w of WORDS){const a=towerDefense({word:w.word,level:w.tier}),b=towerDefense({word:w.word,level:w.maxLevel});assert.ok(a.maxHp>100&&b.maxHp>a.maxHp,w.word);assert.ok(a.armor>=0&&a.armor<=.32);assert.ok(a.role);}
 for(const [kind]of Object.entries(ENEMIES)){const w=enemyWeapon(kind);assert.ok(w.name&&w.range>0&&w.damage>0&&w.interval>w.windup&&w.windup>0,kind);}
 assert.ok(towerDefense({word:'石',level:1}).maxHp>towerDefense({word:'弓',level:1}).maxHp);
});
test('a passing monster telegraphs, hits, recovers and continues on its original route',()=>{
 const {g,t,e}=arena(),hp=t.hp,start=e.d;g.updateTowerAttacks();assert.equal(e.towerTarget,t.id);assert.ok(e.towerStrikeAt>g.time);
 advance(g,.4);assert.equal(t.hp,hp);advance(g,.3);assert.ok(t.hp<hp);assert.ok(e.d>start);assert.equal(e.route,0);
 const after=t.hp;advance(g,1);assert.equal(t.hp,after);assert.ok(e.towerAttackAt>g.time);
});
test('two siege slots include recovery; other monsters move on until a slot opens',()=>{
 const {g,t,e}=arena();const second=g.spawn('normal',110),third=g.spawn('normal',110);
 for(const a of [second,third]){a.hp=10000;a.speed=1;a.towerAttackAt=0;}
 g.updateTowerAttacks();assert.equal(g.enemies.filter(x=>x.towerTarget===t.id).length,2);advance(g,.8);
 assert.equal(third.towerTarget,undefined);assert.equal(e.towerLastTarget,t.id);assert.equal(second.towerLastTarget,t.id);
 e.d=1000;g.updateTowerAttacks();assert.equal(third.towerTarget,t.id);
});
test('freeze interrupts a strike; range, death and tower removal prevent ghost hits',()=>{
 for(const cause of ['freeze','range','death','sell']){
  const {g,t,e}=arena();g.updateTowerAttacks();const hp=t.hp;
  if(cause==='freeze')e.freezeUntil=10;if(cause==='range')e.d=1000;if(cause==='death')e.hp=0;if(cause==='sell')g.sell(t.id);
  advance(g,.8);if(cause!=='sell')assert.equal(t.hp,hp,cause);else assert.equal(g.towers.length,0);
 }
});
test('silence interrupts spell bombardment while ordinary physical swings remain possible',()=>{
 for(const [kind,blocked]of [['ward',true],['normal',false]]){const {g,t,e}=arena('文',kind);e.silencedUntil=10;const hp=t.hp;advance(g,1);assert.equal(t.hp<hp,!blocked,kind);}
});
test('a heavy boss can actually cleave two legal neighboring map positions',()=>{
 let chosen;
 for(let ch=0;ch<10&&!chosen;ch++){const g=new Game(ch,42);for(let d=40;d<1600&&!chosen;d+=5){const p=enemyPosition({kind:'boss',map:ch,route:0,d});for(let i=0;i<12&&!chosen;i++)for(let j=i+1;j<12&&!chosen;j++)if(Math.hypot(g.pads[i].x-g.pads[j].x,g.pads[i].y-g.pads[j].y)<=110&&[i,j].every(k=>Math.hypot(g.pads[k].x-p.x,g.pads[k].y-p.y)<110))chosen={g,d,i,j};}}
 assert.ok(chosen);const {g,d,i,j}=chosen;g.ink=5000;const a=build(g,'文',i),b=build(g,'文',j);a.cooldown=b.cooldown=1e6;
 g.phase='battle';g.wave=12;g.pendingWaves=[12];const e=g.spawn('boss',d);e.hp=e.maxHp=10000;e.speed=.01;e.towerAttackAt=0;g.updateTowerAttacks();const primary=e.towerTarget;
 advance(g,1.1);assert.ok(a.hp<towerDefense(a).maxHp&&b.hp<towerDefense(b).maxHp);
 const primaryDamage=primary===a.id?towerDefense(a).maxHp-a.hp:towerDefense(b).maxHp-b.hp,secondary=primary===a.id?towerDefense(b).maxHp-b.hp:towerDefense(a).maxHp-a.hp;
 close(secondary,primaryDamage*.45);
});
test('nearby stone defenders draw siege pressure and stalkers favor exposed support towers',()=>{
 const g=new Game(0,42);g.ink=5000;const data=pair(g,125),a=build(g,'文',data.pads[0].i),b=build(g,'石',data.pads[1].i);
 g.phase='battle';g.wave=12;const e=g.spawn('ward',data.d);e.towerAttackAt=0;g.updateTowerAttacks();assert.equal(e.towerTarget,b.id);assert.notEqual(e.towerTarget,a.id);
});
test('ruins stop attacks, auras, income and gate protection but keep their word, level and position',()=>{
 const {g,t,e}=arena('守护');const gold=build(g,'招财进宝',2),light=build(g,'光',4);for(const a of g.towers)a.hp=0;
 assert.equal(g.activeTowers.length,0);assert.equal(g.barrierRemaining(),0);const hp=e.hp;t.cooldown=0;g.attack(t,.1);assert.equal(e.hp,hp);
 g.enemies=[];g.queue=[];g.step(.1);const clear=g.events.find(x=>x.roundEnd);assert.equal(clear.income,0);assert.equal(clear.extraIncome,0);
 assert.ok(g.towers.every(a=>a.hp===0));assert.equal(g.towers[0].word,'守护');assert.equal(g.towers[1].id,gold.id);assert.equal(g.towers[2].id,light.id);
 assert.equal(g.upgrade(t.id),false);
});
test('repair charges a real condition-based cost, preserves capital and has a paused combat cooldown',()=>{
 const {g,t,e}=arena('火球');g.damageTower(t,80,e);const cost=g.repairCost(t),before=g.ink,spent=t.spent,hand=JSON.stringify(g.hand);
 assert.ok(g.repair(t.id));assert.equal(g.ink,before-cost);assert.equal(t.hp,towerDefense(t).maxHp);assert.equal(t.spent,spent);assert.equal(JSON.stringify(g.hand),hand);
 g.damageTower(t,20,e);const state=g.export();assert.equal(g.repair(t.id),false);assert.deepEqual(g.export(),state);
 g.phase='prepare';const time=g.time;g.step(.1);assert.equal(g.time,time);assert.equal(g.repair(t.id),false);
 g.time+=8;assert.ok(g.repair(t.id));const ink=g.ink;assert.equal(g.repair(t.id),false);assert.equal(g.ink,ink);
});
test('rebuilding preserves quality and upgrades; rebuild/salvage cannot inflate capital',()=>{
 const {g,t,e}=arena('寒冰毒箭');g.upgrade(t.id);g.upgrade(t.id);const level=t.level,spent=t.spent;
 while(towerActive(t))g.damageTower(t,10000,e);
 assert.equal(g.events.filter(x=>x.type==='tower-down').length,1);const salvage=g.salvageValue(t),cost=g.repairCost(t);
 assert.ok(cost>=Math.floor(spent*.7)-salvage);assert.ok(g.repair(t.id));assert.equal(t.level,level);assert.equal(t.spent,spent);assert.equal(t.word,'寒冰毒箭');
 assert.equal(g.salvageValue(t),Math.floor(spent*.7));assert.equal(g.events.at(-1).rebuilt,true);
});
test('upgrades increase current and maximum durability by the same amount instead of erasing damage',()=>{
 const {g,t,e}=arena('文');g.damageTower(t,30,e);const missing=towerDefense(t).maxHp-t.hp;
 g.upgrade(t.id);close(towerDefense(t).maxHp-t.hp,missing);g.upgrade(t.id);close(towerDefense(t).maxHp-t.hp,missing);
});
test('round recovery helps living towers once, light improves it and ruins require payment',()=>{
 const g=new Game(0,42);g.ink=5000;const data=supportPads(g),t=build(g,'文',data.pads[0].i),light=build(g,'光',data.pads[1].i),ruin=build(g,'火',10);
 t.hp=1;ruin.hp=0;g.phase='battle';g.wave=12;g.pendingWaves=[12];g.step(.1);
 close(t.hp,1+towerDefense(t).maxHp*.45);assert.equal(ruin.hp,0);assert.ok(towerActive(light));
 const hp=t.hp;g.step(.1);assert.equal(t.hp,hp);
});
test('light protects, gold discounts repairs, and damaged supports cannot help after becoming ruins',()=>{
 const g=new Game(0,42);g.ink=5000;const data=supportPads(g),t=build(g,'寒冰毒箭',data.pads[0].i),light=build(g,'光',data.pads[1].i);const e=g.spawn('normal',data.d);g.upgrade(t.id);g.upgrade(t.id);const hp=t.hp;
 g.damageTower(t,20,e);close(hp-t.hp,20*.88);light.hp=0;const before=t.hp;g.damageTower(t,20,e);close(before-t.hp,20);
 g.sell(light.id);const gold=build(g,'金',light.pad),plainCost=g.repairCost(t);gold.hp=0;assert.ok(g.repairCost(t)>plainCost);
});
test('fire, poison, ice and sword have bounded reactive defenses',()=>{
 for(const word of ['火球','毒箭','寒冰','剑气']){
  const {g,t,e}=arena(word);g.damageTower(t,10,e);assert.ok(t.counterReady>g.time);
  if(word==='火球')assert.ok(e.burnUntil>g.time);if(word==='毒箭')assert.ok(e.poisonUntil>g.time);if(word==='寒冰')assert.ok(e.slowUntil>g.time);if(word==='剑气')assert.ok(e.hp<10000);
  const hp=e.hp,until=e.poisonUntil;g.damageTower(t,10,e);if(word==='剑气')assert.equal(e.hp,hp);if(word==='毒箭')assert.equal(e.poisonUntil,until);
 }
});
test('water unloads siege force, lightning staggers windups and illusions delay targeting',()=>{
 const water=arena('水波');water.t.cooldown=0;water.g.attack(water.t,.01);assert.ok(water.e.siegeWeakUntil>water.g.time);
 const hp=water.t.hp;water.g.damageTower(water.t,20,water.e);close(hp-water.t.hp,17);
 const chain=arena('雷电');chain.g.updateTowerAttacks();const deadline=chain.e.towerStrikeAt;chain.t.cooldown=0;chain.g.attack(chain.t,.01);close(chain.e.towerStrikeAt,deadline+.25);
 chain.t.cooldown=0;chain.g.attack(chain.t,.01);close(chain.e.towerStrikeAt,deadline+.25);
 const illusion=arena('幻影');illusion.g.updateTowerAttacks();close(illusion.e.towerStrikeAt,enemyWeapon('normal').windup+.18);
});
test('corrosion and ice hits apply finite debuffs and repair removes them',()=>{
 for(const [kind,key]of [['plaguebeetle','corrodedUntil'],['frostbeast','chillUntil']]){const {g,t,e}=arena('火球',kind);g.damageTower(t,20,e);assert.ok(t[key]>g.time);assert.ok(g.repair(t.id));assert.equal(t[key],0);}
});
test('durability, attack recovery slots and repairs survive reload and reject malformed combat state',()=>{
 const {g,t,e}=arena('学习');g.updateTowerAttacks();advance(g,.8);const h=Game.restore(JSON.parse(JSON.stringify(g.export())));
 for(let i=0;i<20;i++){g.step(.1);h.step(.1);}assert.deepEqual(h.export(),g.export());
 for(const key of ['hp','repairReadyAt','chillUntil','corrodedUntil']){const bad=g.export();bad.towers[0][key]=NaN;assert.throws(()=>Game.restore(bad));}
 const recapped=g.export();recapped.towers[0].hp=100000;const tuned=Game.restore(recapped);assert.equal(tuned.towers[0].hp,towerDefense(tuned.towers[0]).maxHp);
 const bad=g.export();bad.enemies[0].towerLastTarget=-1;assert.throws(()=>Game.restore(bad));
 const old=g.export();for(const a of old.towers){delete a.hp;delete a.repairReadyAt;}for(const a of old.enemies){delete a.towerAttackAt;delete a.towerStrikeAt;delete a.towerTarget;delete a.towerLastTarget;}
 const legacy=Game.restore(old);assert.equal(legacy.towers[0].hp,towerDefense(legacy.towers[0]).maxHp);assert.ok(legacy.enemies[0].towerAttackAt>=legacy.time);
});
