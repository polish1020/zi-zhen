import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,ENEMIES,enemyPosition,enemyLength,enemyWeapon,bossPower,bossAura,bossPowerText,bossAuraText,towerDefense,getWord} from '../dist/engine.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
function add(g,word,pad){g.hand=[...word.padEnd(16,'文')].map(ch=>({id:++g.handSerial,ch,used:false}));assert.ok(g.build(word,pad));const t=g.towers.at(-1);t.cooldown=1e6;return t;}
function arena(kind='boss',chapter=0){
 const g=new Game(chapter,42);g.ink=10000;const power=bossPower(kind);let best={pads:[]};
 for(let route=0;route<g.pads.length&&route<1;route++)for(let d=20;d<enemyLength({kind,map:chapter,route});d+=10){const p=enemyPosition({kind,map:chapter,route,d}),pads=g.pads.slice(0,12).map((a,i)=>({i,d:Math.hypot(a.x-p.x,a.y-p.y)})).filter(a=>a.d<power.range*.9).sort((a,b)=>a.d-b.d);if(pads.length>best.pads.length)best={d,route,pads};}
 for(const p of best.pads.sort((a,b)=>a.d-b.d).slice(0,4))add(g,'寒冰毒箭',p.i);
 g.wave=18;g.phase='battle';g.pendingWaves=[18];const e=g.spawn(kind,best.d,best.route,18);e.speed=.01;e.pulseAt=e.abilityAt=e.towerAttackAt=1e6;e.bossReadyAt=0;return{g,e};
}
test('boss enters with an escort instead of at the tail, exactly once per planned wave',()=>{
 for(let ch=0;ch<10;ch++){const g=new Game(ch,42);g.wave=8;g.startWave();const index=g.queue.findIndex(e=>ENEMIES[e.kind].boss);assert.equal(index,Math.floor(g.queue.length*.35));assert.ok(g.queue.length-index>g.queue.length*.5);assert.equal(g.events.filter(e=>e.type==='boss-arrive').length,0);const entry=g.queue[index];g.spawn(entry.kind,0,entry.route,entry.wave);assert.equal(g.events.filter(e=>e.type==='boss-arrive').length,1);}
});
test('all 42 bosses telegraph and actually damage multiple legal towers with their own themed power',()=>{
 const forms=new Set();for(const kind of Object.keys(ENEMIES).filter(k=>ENEMIES[k].boss)){
  const {g,e}=arena(kind),power=bossPower(kind);assert.ok(g.towers.length>=2,kind);forms.add(enemyWeapon(kind).visual);
  const before=g.towers.map(t=>t.hp);g.updateTowerAttacks();assert.ok(e.bossStrikeAt>g.time);assert.equal(e.bossTargets.length,Math.min(power.targets,g.towers.length));assert.deepEqual(g.towers.map(t=>t.hp),before);
  g.time=e.bossStrikeAt;g.updateTowerAttacks();assert.equal(e.bossCasts,1);assert.equal(e.bossStrikeAt,undefined);assert.equal(g.effects.filter(f=>f.power).length,Math.min(power.targets,g.towers.length));assert.equal(g.towers.filter((t,i)=>t.hp<before[i]).length,Math.min(power.targets,g.towers.length));
  for(const [i,t]of g.towers.entries())assert.ok(before[i]-t.hp<=towerDefense(t).maxHp*.22+1e-6);assert.equal(e.bossReadyAt-g.time,9);assert.ok(bossPowerText(kind)&&bossAuraText(kind));
 }assert.ok(forms.size>=12);
});
test('enraged area attacks can hit four towers and cast again sooner',()=>{const {g,e}=arena('stormboss');e.enraged=true;g.updateTowerAttacks();assert.equal(e.bossTargets.length,4);g.time=e.bossStrikeAt;g.updateTowerAttacks();assert.equal(g.towers.filter(t=>t.hp<towerDefense(t).maxHp).length,4);close(e.bossReadyAt-g.time,6.75);});
test('freeze and silence interrupt windups; target removal and leaving range prevent that hit',()=>{
 for(const control of ['freezeUntil','silencedUntil']){const {g,e}=arena();g.updateTowerAttacks();e[control]=g.time+4;g.time=.5;g.updateTowerAttacks();assert.equal(e.bossTargets,undefined);assert.equal(e.bossStrikeAt,undefined);assert.ok(g.towers.every(t=>t.hp===towerDefense(t).maxHp));}
 const {g,e}=arena();g.updateTowerAttacks();const targets=[...e.bossTargets];g.sell(targets[0]);e.d=enemyLength(e)-1;g.time=e.bossStrikeAt;g.updateTowerAttacks();assert.equal(e.bossCasts,undefined);assert.ok(g.towers.every(t=>t.hp===towerDefense(t).maxHp));
});
test('boss windup and cooldown survive reload without an extra cast, malformed targets are rejected',()=>{
 const {g,e}=arena('stormboss');g.updateTowerAttacks();const save=g.export(),copy=Game.restore(save),next=copy.enemies[0].bossStrikeAt;save.enemies[0].bossTargets[0]=999;assert.notEqual(copy.enemies[0].bossTargets[0],999);assert.notEqual(e.bossTargets[0],999);
 copy.time=next;copy.updateTowerAttacks();const restored=Game.restore(copy.export());restored.updateTowerAttacks();assert.equal(restored.enemies[0].bossCasts,1);assert.equal(restored.enemies[0].bossReadyAt,copy.enemies[0].bossReadyAt);
 for(const target of [[],[1,1],[1,2,3,4,5],['1'],null]){const bad=g.export();bad.enemies[0].bossTargets=target;assert.throws(()=>Game.restore(bad));}
});
test('army aura heals and reduces incoming direct damage, takes strongest value and stops on boss death or control',()=>{
 const {g,e}=arena('lifetree'),ally=g.spawn('normal',e.d+10,0,18);ally.hp=ally.maxHp=10000;const aura=bossAura(e.kind);ally.hp=5000;g.updateEnemies(.1);close(ally.hp,5000+10000*aura.regen*.1);
 const duplicate=g.spawn('lifetree',e.d,0,18);assert.equal(g.bossSupport(ally).guard,aura.guard);assert.equal(g.bossSupport(ally).regen,aura.regen);assert.equal(g.bossSupport(e).guard,0);
 ally.poisonUntil=g.time+10;ally.poisonDps=0;const hp=ally.hp;g.updateEnemies(.1);close(ally.hp,hp);delete ally.poisonUntil;
 e.silencedUntil=10;duplicate.freezeUntil=10;assert.equal(g.bossSupport(ally).guard,0);delete e.silencedUntil;delete duplicate.freezeUntil;e.hp=duplicate.hp=0;assert.equal(g.bossSupport(ally).regen,0);
 function hit(withBoss){const q=arena('lifetree'),m=q.g.spawn('normal',q.e.d+5,0,18),t=q.g.towers[0];m.hp=m.maxHp=10000;if(!withBoss)q.e.hp=0;t.word='文';t.level=1;t.cooldown=0;q.g.attack(t,.1);return 10000-m.hp;}
 close(hit(true)/hit(false),1-aura.guard);
});
test('war aura increases allied siege damage and swift aura increases allied movement without helping bosses',()=>{
 function strike(withBoss){const {g,e}=arena('emberhound'),ally=g.spawn('normal',e.d,0,18),t=g.towers[0];if(!withBoss)e.hp=0;const before=t.hp;g.damageTower(t,10,ally);return before-t.hp;}
 close(strike(true)/strike(false),1.2);
 const {g,e}=arena('mirrorqueen'),ally=g.spawn('normal',e.d,0,18);ally.speed=10;const before=ally.d;g.updateEnemies(.1);close(ally.d-before,1.12);assert.equal(g.bossSupport(e).haste,0);
});
test('shield powers protect nearby allies without stacking, seal stops attacks briefly and repair clears it',()=>{
 const {g,e}=arena('boss'),ally=g.spawn('normal',e.d,0,18);g.updateTowerAttacks();g.time=e.bossStrikeAt;g.updateTowerAttacks();assert.ok(e.shield>=e.maxHp*.06);close(ally.shield,ally.maxHp*.15);const before=ally.shield;e.bossReadyAt=0;g.updateTowerAttacks();g.time=e.bossStrikeAt;g.updateTowerAttacks();close(ally.shield,before);
 const q=arena('scrollboss');q.g.updateTowerAttacks();q.g.time=q.e.bossStrikeAt;q.g.updateTowerAttacks();const t=q.g.towers.find(t=>t.disruptedUntil>q.g.time);assert.ok(t);t.cooldown=0;const hp=q.e.hp;q.g.attack(t,.1);assert.equal(q.e.hp,hp);q.g.ink=1000;assert.ok(q.g.repair(t.id));assert.equal(t.disruptedUntil,0);
});
test('mirror army reflection causes real bounded tower damage, has a per-tower cooldown and no recursive loop',()=>{
 const {g,e}=arena('mirrorqueen'),t=g.towers[0],ally=g.spawn('normal',e.d+10,0,18);ally.hp=ally.maxHp=100000;t.word='文';t.level=1;t.hp=towerDefense(t).maxHp;t.cooldown=0;const before=t.hp;g.attack(t,.1);assert.ok(t.hp<before);assert.ok(before-t.hp<=towerDefense(t).maxHp*.03);assert.ok(g.effects.some(f=>f.kind==='reflected'));
 const hp=t.hp;t.cooldown=0;g.attack(t,.1);close(t.hp,hp);assert.ok(ally.hp<ally.maxHp);
 const war=g.spawn('emberhound',e.d,0,18);war.hp=1e6;t.cooldown=0;g.time=1;const prior=t.hp;g.attack(t,.1);assert.ok(prior-t.hp<=towerDefense(t).maxHp*.03,'war auras cannot amplify reflection beyond its cap');
 const stalker=g.spawn('bamboostalker',e.d,0,18),beforeStealth=t.hp;g.damageTower(t,towerDefense(t).maxHp*.03,stalker,false);assert.ok(beforeStealth-t.hp<=towerDefense(t).maxHp*.03+1e-6,'stealth bonuses cannot amplify reflection beyond its cap');
});
test('army protection covers damage over time while boss support shields use recipient-sized caps',()=>{
 const {g,e}=arena('boss'),ally=g.spawn('normal',e.d,0,18);ally.hp=5000;ally.maxHp=10000;for(const p of ['burn','bleed','poison']){ally[p+'Dps']=100;ally[p+'Until']=100;}g.updateEnemies(.1);close(ally.hp,5000-30*(1-bossAura(e.kind).guard));
 const q=arena('broodqueen'),m=q.g.spawn('normal',q.e.d,0,18);q.e.maxHp=q.e.hp=1000000;q.e.pulseAt=0;q.g.updateEnemies(.1);close(m.shield,m.maxHp*.35);assert.ok(q.e.shield>m.shield);
 const r=arena('tideboss'),a=r.g.spawn('normal',r.e.d,0,18);r.e.maxHp=r.e.hp=1000000;r.e.pulseAt=1e6;r.e.abilityAt=0;r.g.updateEnemies(.1);assert.ok(a.shield<=a.maxHp*.35);
});
