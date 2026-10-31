import test from 'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{Game,WORDS,getWord,towerStats,towerDefense,learningRank,traitEffect,wordLearning,enemyPosition}from'../dist/engine.mjs';
import{SPECIAL_EFFECTS,SPECIAL_PALETTES,SPECIAL_LESSONS,PREVIOUS_SPECIAL_WORDS}from'../dist/specials.mjs';
const ids=Object.keys(SPECIAL_PALETTES),wordFor=(id,n)=>WORDS.find(w=>w.special===id&&w.tier===n)?.word,near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function add(g,word,pad){g.hand=[...word.padEnd(16,'文')].map(ch=>({id:++g.handSerial,ch,used:false}));assert.ok(g.build(word,pad),word);return g.towers.at(-1);}
function enemy(g,kind='normal',d=320){const e=g.spawn(kind,d);e.hp=e.maxHp=100000;e.speed=.01;return e;}
function fire(g,t,shot=1){t.shots=shot-1;t.cooldown=0;g.attack(t,.01);}
function run(id,n,fn){const word=wordFor(id,n),w=getWord(word);assert.ok(w,id+' tier '+n);const saved=w.runes,move=w.idiomMove;w.runes=[];w.idiomMove=undefined;try{const g=new Game(0,42);g.ink=10000;const t=add(g,word,2);g.phase='battle';g.wave=1;g.pendingWaves=[1];g.time=10;return fn({g,t,w});}finally{w.runes=saved;w.idiomMove=move;}}
test('24 new families cover more than 2,000 additional complete words with a thousand four-character recipes',()=>{
 assert.equal(ids.length,24);assert.equal(Object.keys(SPECIAL_EFFECTS).length,80);const added=WORDS.filter(w=>w.special&&!PREVIOUS_SPECIAL_WORDS[w.word]);assert.ok(added.length>2000);assert.ok(added.filter(w=>w.tier===4).length>1000);assert.ok(added.filter(w=>w.tier===3).length>=50);
 for(const id of ids)for(const n of[2,3,4]){const w=getWord(wordFor(id,n));assert.equal(learningRank(w),n-1);assert.ok(traitEffect(w).length>25);assert.ok(!traitEffect(w).includes('／'),w.word);}
 for(const word of Object.keys(SPECIAL_LESSONS))assert.ok(getWord(word)?.special&&wordLearning(word).meaning,word);
 for(const word of['回旋镖','指南针','保护伞','指挥官','医疗队','田字格','游刃有余'])assert.equal(getWord(word).icon,'学');
 for(const [word,id]of [['一针见血','dawn'],['一语道破','dawn'],['不吭一声','silence'],['万籁无声','silence'],['游刃有余','mechanism'],['唇齿相依','rally']])assert.equal(getWord(word).special,id,word);
 assert.equal(getWord('文').icon,'普');assert.equal(getWord('三顾茅庐').special,'visit');
});
test('every new family attacks and emits its own animation identity at all three word-length tiers',()=>{
 for(const id of ids)for(const n of[2,3,4])run(id,n,({g,t,w})=>{for(let i=0;i<8;i++)enemy(g,'normal',320+i*4);fire(g,t,3);assert.ok(t.shots===3&&t.cooldown>0,id);assert.ok(g.enemies.some(e=>e.hp<e.maxHp),id);assert.ok(g.effects.some(f=>f.kind==='learning-art'&&f.special===id&&f.word===w.word),id);assert.ok(g.effects.length<65);});
});
test('longer words gain bounded target counts in crossing, piercing, beasts, geometry and routed relay attacks',()=>{
 for(const id of['cross','penetrate','beast','geometry','resonate','relay'])for(const n of[2,3,4])run(id,n,({g,t})=>{for(let i=0;i<8;i++)enemy(g,'normal',320+i*3);fire(g,t,3);assert.equal(g.enemies.filter(e=>e.hp<e.maxHp).length,n,id+' '+n);});
});
test('returning blades and repeaters budget their multi-hit damage and improve with word length',()=>{
 for(const n of[2,3,4]){run('orbit',n,({g,t,w})=>{const e=enemy(g);fire(g,t);near(e.maxHp-e.hp,w.damage*(.8+.2+(n-1)*.1));});run('mechanism',n,({g,t,w})=>{const e=enemy(g);fire(g,t,3);near(e.maxHp-e.hp,w.damage*n*(n===4?.35:.4));assert.equal(g.effects.filter(f=>f.kind==='bolt').length,n);});}
});
test('four-character command and triage serve two eligible allies while shorter forms serve one',()=>{
 for(const n of[2,3,4])for(const id of['rally','triage'])run(id,n,({g,t})=>{const a=add(g,'火球',4),b=add(g,'火球',1);a.hp=b.hp=50;enemy(g);fire(g,t,3);assert.equal([a,b].filter(a=>id==='rally'?a.lessonPowerUntil>g.time:a.hp>50).length,n===4?2:1);if(id==='triage'){const hp=[a.hp,b.hp],healed=[a,b].filter(a=>a.hp>50).map(a=>({a,hp:a.hp}));fire(g,t,6);for(const {a,hp}of healed)near(a.hp,hp);if(n===4)assert.deepEqual([a.hp,b.hp],hp);assert.ok([a,b].every(a=>a.hp<=towerDefense(a).maxHp));}});
 run('rally',4,({g,t})=>{const a=add(g,'火球',4);t.lessonPowerUntil=20;enemy(g);fire(g,t,3);assert.equal(a.lessonPowerUntil,undefined);});
});
test('repair cost thrift applies only to living towers and stronger long words receive larger explicit discounts',()=>{
 for(const n of[2,3,4])run('thrift',n,({g,t,w})=>{const max=towerDefense(t).maxHp;t.hp=max*.1;assert.equal(g.repairCost(t),Math.max(5,Math.ceil(t.spent*.25*.9*(1-[.08,.12,.18][n-2]))));t.hp=0;assert.equal(g.repairCost(t),Math.max(3,Math.ceil(t.spent*.5)));});
});
test('pillar health and armor, shelter protection and short-range self exclusion match their stated roles',()=>{
 for(const n of[2,3,4])run('pillar',n,({t})=>{const d=towerDefense(t);assert.equal(d.maxHp,Math.round((140+n*70)*1.1*(1.05+n*.05)));near(d.armor,n*.03);assert.equal(d.guard,true);});
 run('shelter',4,({g,t})=>{const a=add(g,'文',4),e=enemy(g);const d=g.damageTower(a,10,e);near(d,8.6);near(g.damageTower(t,10,e),10);t.hp=0;near(g.damageTower(a,10,e),10);});
});
test('blocking reflects a bounded amount, shields absorb it and reflection itself cannot re-trigger a counter',()=>run('counter',4,({g,t,w})=>{
 const e=enemy(g);const hp=e.hp,dealt=g.damageTower(t,20,e);near(dealt,16);near(hp-e.hp,Math.min(dealt*.4,w.damage*.25));const second=e.hp;g.damageTower(t,20,e);assert.equal(e.hp,second);g.time+=5;e.shield=100;g.damageTower(t,20,e);assert.ok(e.shield<100);assert.equal(e.hp,second);g.time+=5;g.damageTower(t,20,e,false);assert.equal(e.hp,second);
}));
test('nets persist, constrain late entrants without stacking and reject corruption or legacy net saves',()=>run('weave',4,({g,t})=>{
 enemy(g);fire(g,t,3);assert.equal(g.zones[0].kind,'net');const h=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.deepEqual(h.zones,g.zones);const late=enemy(g,'normal',325);g.updateZones();near(late.slowFactor,.75);fire(g,t,6);fire(g,t,9);assert.equal(g.zones.length,2);g.updateZones();near(late.slowFactor,.75);g.time=14;g.updateZones();assert.equal(g.zones.length,0);const bad=h.export();bad.zones[0].radius=Infinity;assert.throws(()=>Game.restore(bad));const legacy=h.export();legacy.version=6;assert.throws(()=>Game.restore(legacy));
}));
test('nectar shields, reversal recovery and support cooldowns never heal hearts or resurrect ruins',()=>{
 for(const id of['nectar','reversal'])run(id,4,({g,t})=>{g.hp=7;const max=towerDefense(t).maxHp;t.hp=max*.2;const a=add(g,'火球',4);a.hp=30;enemy(g);fire(g,t,4);assert.equal(g.hp,7);if(id==='nectar'){near(t.lessonShield,max*.07);assert.ok(a.hp>30);}else{near(t.hp,max*.25);near(towerDefense(t).armor,.12);}const hp=t.hp;fire(g,t,8);assert.equal(g.hp,7);if(id==='reversal')near(t.hp,hp);});
});
test('watch prioritizes an in-range air target and hunt rewards actual existing control or wounds',()=>{
 run('watch',4,({g,t,w})=>{const a=enemy(g,'flying',300),b=enemy(g);const p=enemyPosition(a);assert.ok(Math.hypot(p.x-g.pads[t.pad].x,p.y-g.pads[t.pad].y)<=towerStats(t).range);fire(g,t,3);assert.ok(a.hp<a.maxHp);assert.equal(b.hp,b.maxHp);assert.ok(a.lightUntil>g.time);});
 run('hunt',4,({g,t,w})=>{const e=enemy(g);fire(g,t);const first=e.maxHp-e.hp;e.slowUntil=20;const hp=e.hp;fire(g,t,3);near(hp-e.hp,first*1.24);assert.ok(e.bleedDps>0);});
});
test('weakness guidance, dispelling and rotating tactics affect real states with existing strongest-value rules',()=>{
 run('guide',4,({g,t})=>{const a=enemy(g),b=enemy(g,'normal',325);fire(g,t,3);assert.ok(a.markUntil>g.time&&b.markUntil>g.time);near(a.markPower,.15);});
 run('dawn',4,({g,t})=>{const e=enemy(g);e.guardUntil=20;e.guardPower=.2;fire(g,t,4);assert.equal(e.guardUntil,g.time);assert.equal(e.guardPower,0);assert.ok(e.lightUntil>g.time);});
 run('puzzle',4,({g,t,w})=>{const e=enemy(g,'armor');fire(g,t,1);near(e.maxHp-e.hp,w.damage*.85);fire(g,t,2);near(e.slowFactor,.8);for(let i=0;i<4;i++)enemy(g,'normal',325+i*3);for(const e of g.enemies)e.hp=e.maxHp;fire(g,t,3);assert.equal(g.enemies.filter(e=>e.hp<e.maxHp).length,4);});
});
test('rhythm accelerates only while focused; multitalent counts distinct nearby attributes with a hard cap',()=>{
 run('rhythm',4,({g,t,w})=>{enemy(g);fire(g,t,1);const rate=t.cooldown;fire(g,t,6);assert.ok(t.cooldown<rate);enemy(g,'normal',335);fire(g,t,7);near(t.cooldown,rate);});
 run('festival',4,({g,t,w})=>{add(g,'火球',4);add(g,'冰霜',1);const e=enemy(g);fire(g,t);near(e.maxHp-e.hp,w.damage*1.06);});
});
test('v6 golden saves preserve investment, level, random hand and damage ratio when ordinary words become learning',()=>{
 const fixtures=JSON.parse(readFileSync(new URL('./fixtures/learning-v6.json',import.meta.url)));for(const f of fixtures){const g=Game.restore(f.data),t=g.towers[0];near(t.hp/towerDefense(t).maxHp,.37);assert.equal(t.spent,f.data.towers[0].spent);assert.equal(t.level,f.data.towers[0].level);assert.equal(g.ink,f.data.ink);assert.deepEqual(g.hand,f.data.hand);assert.equal(g.export().version,9);const h=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.equal(h.towers[0].hp,t.hp);}
});
