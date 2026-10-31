import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game,WORDS,getWord,towerDefense,towerStats,traitEffect} from '../dist/engine.mjs';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
function add(g,word,pad){g.hand=[...word.padEnd(16,'火')].map(ch=>({id:++g.handSerial,ch,used:false}));assert.ok(g.build(word,pad));return g.towers.at(-1);}
function arena(id,tier=4){
 const w=WORDS.find(w=>w.special===id&&w.tier===tier),g=new Game(0,42);assert.ok(w);
 g.ink=10000;const t=add(g,w.word,2);g.phase='battle';g.wave=1;g.pendingWaves=[1];g.time=10;
 // Isolate the core effect, retaining the production panel damage as its budget.
 const runes=w.runes;w.runes=[];
 return {g,t,w,done:()=>{w.runes=runes;}};
}
function enemy(g,d=330){const e=g.spawn('normal',d);e.hp=e.maxHp=100000;e.speed=.1;return e;}
function fire(g,t,shot){t.shots=shot-1;t.cooldown=0;g.attack(t,.01);}
function run(id,tier,fn){const a=arena(id,tier);try{fn(a);}finally{a.done();}}

test('all 67 learning cores gain damage and reach while cost, durability and non-learning profiles stay unchanged',()=>{
 // Frozen e3068e4 profiles keep this comparison independent of the new formulas.
 const before=JSON.parse(readFileSync(new URL('./fixtures/learning-preference-before.json',import.meta.url)));
 assert.equal(new Set(before.filter(x=>x.special).map(x=>x.special)).size,67);
 for(const old of before){
  const w=getWord(old.word);if(w.type!==old.type||w.special!==old.special&&!(w.special===undefined&&old.special===null)){assert.notEqual(w.type,'basic');assert.ok(w.idiomMove);continue;}assert.equal(w.cost,old.cost,old.word);assert.equal(w.rate,old.rate,old.word);
  assert.equal(towerDefense({word:w.word,level:w.tier}).maxHp,old.maxHp,old.word);assert.deepEqual(w.runes,old.runes);
  if(w.special){assert.ok(w.damage>=old.damage*1.15,w.word);assert.equal(w.range,old.range+10);}
  else for(const k of ['damage','range','type'])assert.equal(w[k],old[k],old.word+' '+k);
 }
});
test('stronger aid scales with source word length and shares a recipient cooldown across different healers',()=>{
 for(const tier of [2,3,4])for(const id of ['mend','triage','nectar'])run(id,tier,({g,t,w})=>{
  const a=add(g,'火球',4),max=towerDefense(a).maxHp;a.hp=max*.2;g.hp=7;enemy(g);
  fire(g,t,id==='triage'?3:4);near(a.hp,max*(.2+[.03,.04,.05][tier-2]));assert.equal(g.hp,7);
  const rival=add(g,'亡羊补牢',1),hp=a.hp;fire(g,rival,4);near(a.hp,hp);
  a.hp=0;g.time+=7;fire(g,t,12);assert.equal(a.hp,0);
  assert.match(traitEffect(w),new RegExp(`${tier+1}%`));
 });
});
test('larger support shields really absorb attacks, stay bounded and round-trip on a non-learning recipient',()=>{
 for(const tier of [2,3,4])run('bulwark',tier,({g,t})=>{
  const a=add(g,'火球',4),max=towerDefense(a).maxHp,e=enemy(g),hp=a.hp;
  fire(g,t,4);const shield=max*[.06,.08,.1][tier-2];near(a.lessonShield,shield);
  const h=Game.restore(JSON.parse(JSON.stringify(g.export())));near(h.towers.find(x=>x.id===a.id).lessonShield,shield);
  const bad=h.export();bad.towers.find(x=>x.id===a.id).lessonShield=max*.101;assert.throws(()=>Game.restore(bad));
  near(g.damageTower(a,shield*.5,e),0);near(a.hp,hp);near(a.lessonShield,shield*.5);
  fire(g,t,8);near(a.lessonShield,shield*.5);g.time+=7;fire(g,t,12);near(a.lessonShield,shield);
 });
});
test('learning empowers a real allied attack by 30 percent once, with no recursive command chain',()=>run('visit',4,({g,t})=>{
 const a=add(g,'文',1),e=enemy(g);fire(g,t,3);assert.equal(a.lessonPowerUntil,13);
 const hp=e.hp;fire(g,a,1);near(hp-e.hp,towerStats(a).damage*1.3);assert.equal(a.lessonPowerUntil,0);
 const next=e.hp;fire(g,a,1);near(next-e.hp,towerStats(a).damage);
}));
test('encouragement supplies 15 percent haste and expires instead of permanently accelerating the recipient',()=>run('inspire',4,({g,t})=>{
 const a=add(g,'文',1);enemy(g);fire(g,t,4);fire(g,a,1);near(a.cooldown,towerStats(a).rate/1.15);
 g.time=14;fire(g,a,1);near(a.cooldown,towerStats(a).rate);
}));
test('group learning retains target caps while side attacks become substantial',()=>{
 for(const [id,shot,sides,coefficient]of [['volley',1,2,.5],['sweep',1,3,.45],['insight',4,2,.5],['blast',1,2,.5],['storm',1,2,.5],['cross',1,3,.45],['beast',3,3,.4],['resonate',3,3,.5],['geometry',3,3,.55]])run(id,4,({g,t,w})=>{
  for(let i=0;i<6;i++)enemy(g,320+i*3);fire(g,t,shot);
  const side=g.enemies.filter(e=>e!==g.enemies.at(-1)&&e.hp<e.maxHp);assert.equal(side.length,sides,id);
  const bonus=id==='resonate'?1.1:1;for(const e of side)near(e.maxHp-e.hp,w.damage*coefficient*bonus);
 });
});
