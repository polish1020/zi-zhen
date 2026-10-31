#!/usr/bin/env node
// Stationary damage comparison using production combat methods, with no balance edits.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Game,WORDS,getWord,towerDefense,wordRules,SPECIAL_EFFECTS} from '../dist/engine.mjs';

const seconds=60,dt=.05,base=new Game(0,42);
const scenarios={single:{kind:'normal',count:1},pack:{kind:'normal',count:6},boss:{kind:'boss',count:1}};
const signature=w=>JSON.stringify([w.type,w.tier,w.special,w.trait,w.runes,w.semanticCycle,w.damage,w.range,w.rate,w.aura,w.income,wordRules(w)]);
const groups=new Map();
for(const w of WORDS.filter(w=>w.tier>=2)){
 const key=signature(w);if(!groups.has(key))groups.set(key,{w,words:[]});groups.get(key).words.push(w.word);
}
function measure(w,level,scene){
 const g=Object.assign(Object.create(Game.prototype),base,{
  towers:[],enemies:[],effects:[],events:[],zones:[],queue:[],pendingWaves:[1],
  ink:1e9,time:0,wave:1,phase:'battle',nextId:2,autoWaveAt:0,
 });
 const t={id:1,word:w.word,pad:0,level:w.tier,spent:w.cost,cooldown:0,repairReadyAt:0,rebuilds:0};
 t.hp=towerDefense(t).maxHp;g.towers=[t];
 while(t.level<level)assert.ok(g.upgrade(t.id));
 const distances=[];
 for(let i=0;i<scene.count;i++){
  const d=130+i*4,e=g.spawn(scene.kind,d);distances.push(d);
  e.hp=e.maxHp=1e9;e.shield=e.maxShield=0;e.speed=0;
  // Keep the boss classification, while excluding its casts/escorts from a damage dummy.
  e.pulses=999;e.escortCalls=2;e.abilityAt=Infinity;
 }
 for(let frame=0;frame<seconds/dt;frame++){
  g.time=(frame+1)*dt;
  // Fixed positions measure damage, rather than crediting control with extra firing time.
  g.enemies.forEach((e,i)=>{e.d=distances[i];});
  g.updateZones();g.updateEnemies(dt);g.attack(t,dt);g.effects=[];g.events=[];
 }
 assert.equal(g.enemies.length,scene.count);assert.ok(g.enemies.every(e=>e.hp>0));
 const damage=g.enemies.reduce((n,e)=>n+e.maxHp-e.hp,0);
 return {dps:damage/seconds,per100Ink:damage/seconds/t.spent*100,spent:t.spent,shots:t.shots||0};
}
function stats(entries,value='dps'){
 const list=entries.map(x=>({v:x[value],n:x.words.length})).sort((a,b)=>a.v-b.v),count=list.reduce((s,x)=>s+x.n,0);
 const quantile=q=>{let at=0;for(const x of list){at+=x.n;if(at>=Math.max(1,Math.ceil(count*q)))return x.v;}};
 return {recipes:count,signatures:entries.length,min:list[0]?.v??null,p10:quantile(.1),median:quantile(.5),p90:quantile(.9),max:list.at(-1)?.v??null};
}
const rows=[];let done=0;
for(const {w,words}of groups.values()){
 for(const level of new Set([w.tier,4]))for(const[scenario,scene]of Object.entries(scenarios))rows.push({
  word:w.word,words,type:w.type,icon:w.icon,tier:w.tier,level,special:w.special||null,scenario,...measure(w,level,scene),
 });
 if(++done%200===0)console.log(`Measured ${done}/${groups.size} distinct combat profiles`);
}
const summary=[];
for(const type of [...new Set(rows.map(x=>x.type))])for(const tier of [2,3,4])for(const level of new Set([tier,4]))for(const scenario of Object.keys(scenarios)){
 const matching=rows.filter(x=>x.type===type&&x.tier===tier&&x.level===level&&x.scenario===scenario);
 if(matching.length)summary.push({type,icon:matching[0].icon,tier,level,scenario,dps:stats(matching),per100Ink:stats(matching,'per100Ink')});
}
const families=[];
for(const id of Object.keys(SPECIAL_EFFECTS))for(const tier of [2,3,4])for(const scenario of Object.keys(scenarios)){
 const matching=rows.filter(x=>x.special===id&&x.tier===tier&&x.level===tier&&x.scenario===scenario);
 if(matching.length)families.push({id,name:SPECIAL_EFFECTS[id].name,tier,scenario,dps:stats(matching),per100Ink:stats(matching,'per100Ink')});
}
const exampleWords=['三国演义','三顾茅庐','一心一意','周而复始','势如破竹','众志成城','妙手回春','东奔西走','寒冰箭','毒云','火焰盾','雷暴术','烈火','火球','你好','文'];
const examples=exampleWords.filter(word=>getWord(word)?.tier>=2).flatMap(word=>{
 const w=getWord(word),key=signature(w);return rows.filter(x=>signature(getWord(x.word))===key).map(({words,...row})=>({...row,word}));
});
const sha=async name=>createHash('sha256').update(await readFile(new URL('../dist/'+name,import.meta.url))).digest('hex');
const report={date:new Date().toISOString().slice(0,10),engineHash:await sha('engine.mjs'),specialsHash:await sha('specials.mjs'),seconds,dt,
 methodology:[
  'All two-, three-, and four-character recipes; identical combat profiles evaluated once and weighted by the number of matching recipes. This is dictionary weighting, not hand-draw probability.',
  'Full-health single tower; original runes and grade effects retained. Compare equal word length at initial level, and separately at shared level 4 using actual upgrade spending.',
  'Production attack, zone and enemy-update methods; 60 seconds, 50 ms ticks, first shot ready, no pre-stacked growth. Includes burn/poison/bleed within the window.',
  'Targets held within range at route distances 130,134,...150; six-enemy pack is tightly clustered and aligned, favoring area and piercing attacks.',
  'High-health unarmored ground dummy, six such dummies, and unarmored ground boss dummy. No shields, casts, summons, regeneration, return attacks, or kills; boss classification is retained.',
  'Control, range, armor penetration, execute, damage taken, healing, shielding, income, and ally buffs are not valued by this solo damage benchmark. Full-health conditions do not trigger last-stand effects.',
  'No gameplay parameters changed to obtain these results. DPS is not chapter win rate.',
 ],recipes:WORDS.filter(w=>w.tier>=2).length,learningRecipes:WORDS.filter(w=>w.tier>=2&&w.special).length,
 combatProfiles:groups.size,measurements:rows.length,summary,families,examples};
await writeFile(new URL('../docs/reports/word-damage-benchmark.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({recipes:report.recipes,learningRecipes:report.learningRecipes,combatProfiles:report.combatProfiles,measurements:report.measurements,initial:summary.filter(x=>x.tier===x.level&&['basic','learning','splash','chain','poison','sniper','heavy'].includes(x.type)).map(x=>({type:x.type,tier:x.tier,scenario:x.scenario,median:x.dps.median,p10:x.dps.p10,p90:x.dps.p90,per100Ink:x.per100Ink.median}))},null,2));
