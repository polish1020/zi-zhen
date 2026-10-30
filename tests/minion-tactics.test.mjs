import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,ENEMIES,getWord,towerStats,enemyPulse} from '../dist/engine.mjs';
function battle(wave=18){const g=new Game(0,42);g.ink=2000;g.wave=wave;g.phase='battle';g.pendingWaves=[wave];return g;}
function add(g,word){const chars=[...word];while(chars.length<16)chars.push('文');g.hand=chars.map(ch=>({id:++g.handSerial,ch,used:false}));assert.ok(g.build(word,0));return g.towers[0];}
function target(g,kind,d=130){const e=g.spawn(kind,d);e.hp=e.maxHp=10000;e.speed=1;return e;}

test('sixteen new minion casts unlock gradually and do not alter the first three rounds',()=>{
 const variants=Object.entries(ENEMIES).filter(([,e])=>!e.boss&&e.pulseFromRound);
 assert.equal(variants.length,16);
 for(const [kind,data]of variants){
  const early=battle(9),e=target(early,kind);assert.equal(enemyPulse(e),null,kind);
  e.pulseAt=0;early.step(.01);assert.equal(e.pulses,undefined,kind);
  const g=battle(data.pulseFromRound*3),m=target(g,kind);assert.ok(enemyPulse(m),kind);
  m.pulseAt=0;g.step(.01);assert.equal(m.pulses,1,kind);
  m.pulseAt=0;g.step(.01);assert.equal(m.pulses,1,kind);
 }
});

test('shield lines reduce actual direct damage, take the strongest protection and have counters',()=>{
 const g=battle(),t=add(g,'风刃'),armor=target(g,'armor'),e=target(g,'normal',140);armor.pulseAt=0;
 g.step(.01);assert.equal(e.guardPower,.12);assert.ok(e.guardUntil>g.time);
 const ward=target(g,'ward',130);ward.pulseAt=100;
 let before=e.hp;t.cooldown=0;g.attack(t,.01);
 assert.ok(Math.abs(before-e.hp-getWord('风刃').damage*.88)<1e-7,'guard and ward must not multiply');
 e.lightUntil=10;before=e.hp;t.cooldown=0;g.attack(t,.01);
 assert.ok(Math.abs(before-e.hp-getWord('风刃').damage)<1e-7,'illumination breaks both forms of protection');
 e.lightUntil=0;e.guardUntil=0;ward.hp=0;before=e.hp;t.cooldown=0;g.attack(t,.01);
 assert.ok(Math.abs(before-e.hp-getWord('风刃').damage)<1e-7,'expired protection cannot linger');
});

test('disruption delays real attacks, ends with its caster, and never multiplies frost aura',()=>{
 const g=battle(),t=add(g,'火球'),e=target(g,'ward');e.pulseAt=0;g.step(.01);
 assert.ok(e.jamUntil>g.time);t.cooldown=0;g.attack(t,.01);
 assert.ok(Math.abs(t.cooldown-towerStats(t).rate*1.2)<1e-7);
 const frost=target(g,'frostboss');frost.pulseAt=100;t.cooldown=0;g.attack(t,.01);
 assert.ok(Math.abs(t.cooldown-towerStats(t).rate*1.25)<1e-7);
 frost.hp=0;e.hp=0;target(g,'normal');t.cooldown=0;g.attack(t,.01);
 assert.ok(Math.abs(t.cooldown-towerStats(t).rate)<1e-7);
});

test('air leaders support flying neighbors only and slow can stop a new shadow step',()=>{
 const g=battle(12),leader=target(g,'cloudraptor'),air=target(g,'flying',140),ground=target(g,'normal',145);
 leader.abilityAt=100;leader.pulseAt=0;g.step(.01);
 assert.ok(leader.rallyUntil>g.time&&air.rallyUntil>g.time);assert.equal(ground.rallyUntil,undefined);
 const h=battle(12),stalker=target(h,'bamboostalker');stalker.pulseAt=0;stalker.slowUntil=10;
 const d=stalker.d;h.step(.1);assert.ok(stalker.d-d<1);assert.equal(stalker.pulses,1);
});

test('six late half-health reactions occur once and preserve their state through reload',()=>{
 const variants=Object.entries(ENEMIES).filter(([,e])=>!e.boss&&e.phaseFromRound);
 assert.equal(variants.length,6);
 for(const [kind]of variants){
  const early=battle(9),a=target(early,kind);a.hp=4900;early.step(.01);assert.equal(a.enraged,undefined,kind);
  const g=battle(),e=target(g,kind);e.hp=4900;g.step(.01);assert.equal(e.enraged,true,kind);
  assert.equal(g.events.filter(x=>x.type==='boss-phase').length,0);
  const h=Game.restore(JSON.parse(JSON.stringify(g.export()))),before=h.enemies[0].shield;h.step(.01);
  assert.equal(h.enemies[0].shield,before,kind);assert.equal(h.enemies[0].enraged,true);
 }
});

test('guard and disruption reload deterministically, reject invalid states and freeze while planning',()=>{
 const g=battle(),a=target(g,'armor'),w=target(g,'ward');a.pulseAt=w.pulseAt=0;g.step(.01);
 const h=Game.restore(JSON.parse(JSON.stringify(g.export())));for(let i=0;i<20;i++){g.step(.1);h.step(.1);}
 assert.deepEqual(h.export(),g.export());
 for(const field of ['guardUntil','guardPower','jamUntil']){const bad=g.export();bad.enemies[0][field]=NaN;assert.throws(()=>Game.restore(bad));}
 const bad=g.export();bad.enemies[0].guardPower=.99;assert.throws(()=>Game.restore(bad));
 const frozen=battle(),e=target(frozen,'ward');e.pulseAt=0;e.freezeUntil=1;frozen.step(.1);assert.equal(e.pulses,undefined);
 frozen.time=1;frozen.step(.1);assert.equal(e.pulses,1);
 const until=e.jamUntil,time=frozen.time;frozen.phase='prepare';frozen.step(.1);
 assert.equal(frozen.time,time);assert.equal(e.jamUntil,until);
});

test('triage rescues the three weakest eligible allies and cannot become endless group healing',()=>{
 const g=battle(),healer=target(g,'healer'),patients=[];
 for(let i=0;i<5;i++){const e=target(g,'normal',135+i);e.hp=1000+i*1000;patients.push(e);}
 patients[0].poisonUntil=10;patients[0].poisonDps=0;healer.abilityAt=0;g.step(.01);
 assert.equal(patients[0].hp,1000);assert.deepEqual(patients.slice(1).map(e=>e.hp),[2500,3500,4500,5000]);
 for(let i=0;i<6;i++){healer.abilityAt=0;g.step(.01);}
 assert.equal(healer.charges,4);const before=patients.map(e=>e.hp);
 const h=Game.restore(JSON.parse(JSON.stringify(g.export())));h.enemies[0].abilityAt=0;h.step(.01);
 assert.equal(h.enemies[0].charges,4);assert.deepEqual(h.enemies.slice(1).map(e=>e.hp),before);
});
