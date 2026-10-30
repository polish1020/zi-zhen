import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game,CHAPTERS,getWord,towerStats,enemyLength,WAVE_INTERVAL} from '../dist/engine.mjs';
import {invest,investEfficient} from './strategy.mjs';

// Observe real public actions and settlements; never grant money, cards or kills.
const n=Number(process.argv[2]||10),output=process.argv[3]||'/tmp/wordward-economy-audit.json';
assert.ok(Number.isInteger(n)&&n>0);
const policies=(process.argv.find(x=>x.startsWith('--policies='))?.split('=')[1]||'adaptive,efficient,hold').split(',');
assert.ok(policies.length&&new Set(policies).size===policies.length&&policies.every(p=>['adaptive','efficient','hold'].includes(p)));
const source={combat:0,bounty:0,wave:0,round:0,production:0,prosper:0,refund:0};
const sink={build:0,upgrade:0,unlock:0,refresh:0,skill:0,hint:0};
const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
function observe(g){
 const initial=g.ink,income={...source},expense={...sink},rows=[],actions={};
 let bountyAtSettlement;
 const settle=g.settleWaves;
 g.settleWaves=function(){bountyAtSettlement=this.bountyEarned;return settle.call(this);};
 for(const [method,key]of Object.entries({build:'build',upgrade:'upgrade',unlockPad:'unlock',refreshHand:'refresh',skill:'skill',requestHint:'hint',sell:'refund'})){
  const original=g[method];g[method]=function(...args){
   const before=this.ink,result=original.apply(this,args),delta=this.ink-before;
   if(delta<0){expense[key]-=delta;actions[key]=(actions[key]||0)+1;}
   if(delta>0){assert.equal(key,'refund');income.refund+=delta;actions.sell=(actions.sell||0)+1;}
   return result;
  };
 }
 function check(){
  const earned=income.combat+income.wave+income.round+income.production+income.prosper;
  assert.ok(Math.abs(g.ink-(initial+earned+income.refund-sum(expense)))<1e-6,'the observed ledger must balance');
 }
 return{initial,income,expense,actions,rows,step(dt){
  const earned=g.totalEarned,bounty=g.bountyEarned;g.events=[];bountyAtSettlement=undefined;g.step(dt);
  income.combat+=g.totalEarned-earned;
  income.bounty+=(bountyAtSettlement??g.bountyEarned)-bounty;
  let ended=false;
  for(const event of g.events)if(event.type==='clear'||event.type==='won'){
   if(event.roundEnd){
    const round=g.wave/3;income.round+=20+round*3;income.production+=event.income;
    income.prosper+=event.reward-(20+round*3)-event.income;ended=true;
   }else if(event.type==='clear')income.wave+=event.reward;
  }
  check();
  if(ended)rows.push({round:g.wave/3,endless:g.endless,ink:g.ink,hp:g.hp,
   towers:g.towers.length,maxed:g.towers.filter(t=>t.level>=getWord(t.word).maxLevel).length,
   grades:g.towers.reduce((a,t)=>(a[getWord(t.word).tier-1]++,a),[0,0,0,0]),
   assetValue:g.towers.reduce((v,t)=>v+t.spent,0),
   goldTowers:g.towers.filter(t=>getWord(t.word).type==='income').length,
   productionPotential:g.towers.filter(t=>getWord(t.word).type==='income').reduce((v,t)=>v+towerStats(t).income,0),
   income:{...income,kill:income.combat-income.bounty},expense:{...expense},actions:{...actions}});
 },check};
}

const runs=[];
for(const policy of policies)for(let chapter=0;chapter<CHAPTERS.length;chapter++){
 for(let seed=1;seed<=n;seed++){
  const g=new Game(chapter,seed),audit=observe(g);let lastWave=-1,lastInvest=0,steps=0,lockedAt=null,mainCleared=false;
  const target=CHAPTERS[chapter].rounds+10;
  function spend(){
   if(policy==='hold'&&lockedAt===null&&g.towers.length===g.pads.length&&g.towers.every(t=>t.level>=getWord(t.word).maxLevel))lockedAt=Math.max(1,Math.ceil(g.wave/3));
   if(lockedAt===null)(policy==='efficient'?investEfficient:invest)(g);
  }
  while(g.phase!=='lost'&&steps++<120000){
   if(g.phase==='won'){mainCleared=true;assert.ok(g.continueEndless());}
   if(g.phase==='prepare'&&g.wave/3>=target)break;
   if(g.phase==='prepare'){spend();g.startWave();}
   if(g.phase==='battle'&&g.wave!==lastWave){lastWave=g.wave;spend();}
   if(g.phase==='battle'&&g.time-lastInvest>=8){lastInvest=g.time;spend();}
   if(g.phase==='battle'&&g.skillCost()<=90&&g.ink>=g.skillCost()+40&&g.enemies.filter(e=>e.d/enemyLength(e)>.72).length>=3)g.skill();
   audit.step(.1);
  }
  audit.check();
  assert.ok(steps<120000,'simulation timeout');
  runs.push({chapter:chapter+1,seed,policy,mainCleared,lockedAt,phase:g.phase,
   finalRound:Math.ceil(g.wave/3),finalInk:g.ink,hp:g.hp,initial:audit.initial,
   income:audit.income,expense:audit.expense,actions:audit.actions,rows:audit.rows});
 }
 console.log(JSON.stringify({policy,chapter:chapter+1,runs:n,mainCleared:runs.filter(r=>r.policy===policy&&r.chapter===chapter+1&&r.mainCleared).length}));
}
const median=xs=>{const a=[...xs].sort((a,b)=>a-b);return a.length?(a[Math.floor((a.length-1)/2)]+a[Math.ceil((a.length-1)/2)])/2:null;};
const summaries=[];
for(const policy of policies)for(const round of [3,6,9,12,15,18,20]){
 const samples=runs.filter(r=>r.policy===policy).flatMap(r=>{
  const row=r.rows.find(x=>x.round===round);if(!row)return[];
  const before=r.rows.find(x=>x.round===round-1);
  const earned=row.income.combat+row.income.wave+row.income.round+row.income.production+row.income.prosper;
  const previous=before?before.income.combat+before.income.wave+before.income.round+before.income.production+before.income.prosper:0;
  return[{...row,chapter:r.chapter,seed:r.seed,roundEarned:earned-previous,
   roundSpent:sum(row.expense)-(before?sum(before.expense):0),
   roundRefund:row.income.refund-(before?before.income.refund:0),
   roundNet:row.ink-(before?before.ink:r.initial)}];
 });
 summaries.push({policy,round,survivors:samples.length,outOf:CHAPTERS.length*n,
  eligible:CHAPTERS.filter(ch=>ch.rounds+10>=round).length*n,
  medianInk:median(samples.map(x=>x.ink)),minInk:samples.length?Math.min(...samples.map(x=>x.ink)):null,maxInk:samples.length?Math.max(...samples.map(x=>x.ink)):null,
  medianRoundEarned:median(samples.map(x=>x.roundEarned)),medianRoundSpent:median(samples.map(x=>x.roundSpent)),medianRoundNet:median(samples.map(x=>x.roundNet)),
  medianRoundRefund:median(samples.map(x=>x.roundRefund)),medianRoundNetSpent:median(samples.map(x=>x.roundSpent-x.roundRefund)),
  medianTowers:median(samples.map(x=>x.towers)),medianMaxed:median(samples.map(x=>x.maxed))});
}
fs.writeFileSync(output,JSON.stringify({version:1,generatedAt:new Date().toISOString(),seeds:n,waveInterval:WAVE_INTERVAL,refreshCost:new Game().refreshCost(),policies,
 methodology:'Actual seeded hands, public purchases, real combat; continue ten endless rounds after main campaign. Adaptive strategy matches balance.mjs, including its repeated late refresh spending. Efficient strategy replaces only with a stronger higher-quality word of the same attribute and stops refreshing at all tier 4. Hold stops investment after all 16 towers max. All retain the same near-gate skill policy (maximum 90 ink). Income includes clear rewards and production; all refunds and expenses are audited with conservation checks. Per-round summaries condition on clearing that round; survivor counts are shown.',
 summaries,runs},null,2));
console.log(JSON.stringify(summaries,null,2));
console.log(`Saved ${runs.length} audited runs: ${output}`);
