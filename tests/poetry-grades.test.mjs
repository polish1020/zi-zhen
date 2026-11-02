import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{createHash}from'node:crypto';
import{Game,drawHandWords,getWord,POEMS,POEM_LINES,POETRY_GRADES,poemWithinGrade,towerStats}from'../dist/engine.mjs';
const stock=(g,word)=>g.hand=[...word.padEnd(32,'月')].map(ch=>({ch,id:++g.handSerial,used:false}));
const level=p=>'一二三四五六'.indexOf(p.grade[0])+1;
test('each selected school grade includes every lower grade and excludes unknown extracurricular poems',()=>{
 assert.deepEqual(POETRY_GRADES.map(o=>o.value),[0,1,2,3,4,5,6]);for(let grade=0;grade<=6;grade++)for(const p of POEMS)assert.equal(poemWithinGrade(p.id,grade),grade===0||level(p)>0&&level(p)<=grade,p.title);
 assert.equal(POEMS.filter(p=>poemWithinGrade(p.id,2)).length,27);assert.equal(POEM_LINES.filter(l=>poemWithinGrade(l.poem,2)).length,111);assert.equal(POEMS.filter(p=>poemWithinGrade(p.id,6)).length,107);assert.equal(POEMS.filter(p=>poemWithinGrade(p.id,0)).length,109);
});
for(let grade=0;grade<=6;grade++)test(`grade ${grade}: 500 whole-word plans and paid refreshes keep every poem in range, retain all guarantees and use every card`,()=>{
 const lengths=new Set();for(let seed=1;seed<=500;seed++){
  const rng=Object.create(Game.prototype);rng.rngState=seed;const plan=drawHandWords(()=>rng.random(),grade);assert.equal(plan.join('').length,32);assert.equal(new Set(plan).size,plan.length);assert.ok(getWord(plan[0]).poem);assert.deepEqual(plan.slice(1,6).map(w=>w.length),[4,4,3,3,3]);
  for(const word of plan){assert.ok(word.length>=2);const w=getWord(word);if(w.poem){assert.ok(poemWithinGrade(w.poem,grade),word);lengths.add(word.length);}}
  const g=new Game(seed%10,seed,grade);g.ink=10000;assert.ok(g.availableWords().some(w=>w.poem));assert.ok(g.availableWords().every(w=>!w.poem||poemWithinGrade(w.poem,grade)));const before=g.ink;assert.ok(g.refreshHand());assert.equal(g.ink,before-50);assert.ok(g.availableWords().some(w=>w.poem));assert.ok(g.availableWords().every(w=>!w.poem||poemWithinGrade(w.poem,grade)));assert.deepEqual(Game.restore(g.export()).export(),g.export());
  if(seed<=10){g.hand=plan.join('').split('').map(ch=>({ch,id:++g.handSerial,used:false}));for(let i=0;i<plan.length;i++)assert.ok(g.build(plan[i],i),plan[i]);assert.ok(g.hand.every(t=>t.used));}
 }
 assert.deepEqual([...lengths].sort(),grade>0&&grade<4?[5,7]:[5,6,7]);
});
test('changing grade is free and preserves actual cards, spent resources, RNG and existing higher-grade towers',()=>{
 const g=new Game(0,42);g.ink=10000;stock(g,'随风潜入夜');assert.ok(g.build('随风潜入夜',2));const t=g.towers[0],before=g.export(),stats=towerStats(t);g.setPoetryGrade(2);assert.deepEqual(g.hand,before.hand);assert.equal(g.ink,before.ink);assert.equal(g.rngState,before.rngState);assert.deepEqual(g.towers,before.towers);assert.deepEqual(towerStats(t),stats);assert.ok(g.upgrade(t.id));assert.deepEqual(Game.restore(g.export()).export(),g.export());
});
test('range filters cross-combinations, build and hints immediately and invalidates cached candidates',()=>{
 const g=new Game(0,42);g.ink=10000;stock(g,'随风潜入夜');assert.ok(g.availableWords().some(w=>w.word==='随风潜入夜'));assert.equal(g.requestHint().word,'随风潜入夜');const ink=g.ink,uses=g.hintUses;g.setPoetryGrade(2);assert.equal(g.hintWord,null);assert.equal(g.hintUses,uses);assert.equal(g.ink,ink);assert.ok(g.availableWords().every(w=>!w.poem||poemWithinGrade(w.poem,2)));const before=g.export();assert.equal(g.build('随风潜入夜',2),false);assert.deepEqual(g.export(),before);g.debugMode=true;assert.equal(g.build('随风潜入夜',2),false);g.debugMode=false;
 g.setPoetryGrade(0);assert.ok(g.availableWords().some(w=>w.word==='随风潜入夜'));assert.ok(g.canBuild('随风潜入夜'));assert.equal(g.requestHint().word,'随风潜入夜');assert.equal(g.hintUses,uses+1);
});
test('valid learned long idioms and elementary poems remain playable in the smallest grade',()=>{
 const g=new Game(0,42,1);g.ink=10000;for(const[word,pad]of[['百闻不如一见',2],['床前明月光',4]]){stock(g,word);assert.ok(g.allowsWord(word));assert.ok(g.build(word,pad));}assert.equal(g.allowsWord('随风潜入夜'),false);assert.deepEqual(Game.restore(g.export()).export(),g.export());
});
test('grade is a strict detached save preference; legacy default snapshot and RNG bytes stay identical',()=>{
 const frozen=JSON.parse(readFileSync(new URL('./fixtures/pre-poetry-grade-hands.json',import.meta.url)));const rows=Array.from({length:frozen.count},(_,i)=>new Game(i%10,i+1).export());assert.equal(createHash('sha256').update(JSON.stringify(rows)).digest('hex'),frozen.hash);
 const g=new Game(0,42),old=g.export();assert.equal(g.poetryGrade,0);assert.equal(Object.hasOwn(old,'poetryGrade'),false);assert.equal(Game.restore(old).poetryGrade,0);
 for(const grade of[-1,7,1.5,'2',true,null,NaN,Infinity,{},[]]){assert.throws(()=>g.setPoetryGrade(grade));assert.throws(()=>new Game(0,42,grade));assert.throws(()=>drawHandWords(()=>.5,grade));assert.throws(()=>Game.restore({...old,poetryGrade:grade}));}
 g.setPoetryGrade(2);const saved=g.export(),copy=Game.restore(saved);saved.poetryGrade=5;assert.equal(copy.poetryGrade,2);g.setPoetryGrade(0);assert.equal(Object.hasOwn(g.export(),'poetryGrade'),false);
});
for(const value of[0,.149,.499,.85,.999999])test(`grade filtering handles repeated RNG ${value} without falling back to higher-grade poems`,()=>{
 for(let grade=1;grade<=6;grade++){const plan=drawHandWords(()=>value,grade);assert.equal(plan.join('').length,32);assert.equal(new Set(plan).size,plan.length);assert.ok(plan.every(word=>!getWord(word).poem||poemWithinGrade(getWord(word).poem,grade)));}
});
