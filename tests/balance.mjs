import assert from 'node:assert/strict';
import {readFileSync}from'node:fs';
import {createHash}from'node:crypto';
import {Game,CHAPTERS,ENEMIES,enemyLength,enemyPosition} from '../dist/engine.mjs';
import {invest,investEfficient,investFormation} from './strategy.mjs';
const hashFile=path=>createHash('sha256').update(readFileSync(new URL(path,import.meta.url))).digest('hex');
const sourceHashes={engineHash:hashFile('../dist/engine.mjs'),specialsHash:hashFile('../dist/specials.mjs'),lexiconHash:hashFile('../dist/lexicon.mjs'),strategyHash:hashFile('./strategy.mjs')};
const spend=process.argv.includes('--formation')?investFormation:process.argv.includes('--efficient')?investEfficient:invest;
const n=Number(process.argv[2]||40),skills=process.argv.includes('--skills'),pressure=process.argv.includes('--pressure');
const onlyChapter=Number(process.argv.find(x=>x.startsWith('--chapter='))?.split('=')[1]||0)-1;
const firstSeed=Number(process.argv.find(x=>x.startsWith('--seed-start='))?.split('=')[1]||1);
assert.ok(Number.isInteger(n)&&n>0&&Number.isInteger(firstSeed)&&firstSeed>=1&&Number.isInteger(onlyChapter)&&onlyChapter>=-1&&onlyChapter<CHAPTERS.length);
const results=[];
for(let ch=0;ch<CHAPTERS.length;ch++){
 if(onlyChapter>=0&&ch!==onlyChapter)continue;
 let wins=0,timeouts=0,hps=[],rounds=[];
 const audit={hits:0,minionDamage:0,bossDamage:0,ruins:0,minionRuins:0,gamesWithRuins:0,secondHalfSamples:0,accompaniedSamples:0,reinforcements:0};
 for(let seed=firstSeed;seed<firstSeed+n;seed++){
  const g=new Game(ch,seed);let lastWave=-1,lastInvest=0,steps=0,lastSample=0,downs=0;
  while(!['won','lost'].includes(g.phase)&&steps++<50000){
   if(g.phase==='prepare'){spend(g);g.startWave();}
   if(g.phase==='battle'&&g.wave!==lastWave){lastWave=g.wave;spend(g);}
   if(g.phase==='battle'&&g.time-lastInvest>=8){lastInvest=g.time;spend(g);}
   if(skills&&g.phase==='battle'&&g.skillCost()<=90&&g.ink>=g.skillCost()+40&&g.enemies.filter(e=>e.d/enemyLength(e)>.72).length>=3)g.skill();
   g.step(.1);
   if(pressure){
    for(const e of g.events){
     if(e.type==='tower-hit'){audit.hits++;audit[ENEMIES[e.enemy]?.boss?'bossDamage':'minionDamage']+=e.damage;}
     if(e.type==='tower-down'){audit.ruins++;downs++;if(!e.reflected&&!ENEMIES[e.enemy]?.boss)audit.minionRuins++;}
     if(e.type==='boss-reinforce')audit.reinforcements++;
    }g.events=[];
    if(g.time-lastSample>=1){lastSample=g.time;for(const boss of g.enemies.filter(e=>ENEMIES[e.kind].boss&&e.d>enemyLength(e)*.5)){
     audit.secondHalfSamples++;const p=enemyPosition(boss);
     if(g.enemies.some(e=>e.hp>0&&!ENEMIES[e.kind].boss&&Math.hypot(enemyPosition(e).x-p.x,enemyPosition(e).y-p.y)<=175))audit.accompaniedSamples++;
    }}
   }
  }
  if(g.phase==='won')wins++;
  else if(process.argv.includes('--details'))console.log({ch:ch+1,seed,wave:g.wave,ink:g.ink,towers:g.towers.map(t=>t.word),threats:g.enemies.filter(e=>e.d/enemyLength(e)>.7).map(e=>({kind:e.kind,hp:Math.round(e.hp)}))});
  if(!['won','lost'].includes(g.phase))timeouts++;
  if(downs)audit.gamesWithRuins++;hps.push(g.hp);rounds.push(Math.ceil(g.wave/3));
 }
 assert.equal(timeouts,0,`Chapter ${ch+1} simulation did not finish`);
 results.push({chapter:ch+1,wins,total:n,rate:wins/n});
 console.log({chapter:ch+1,skills,wins,total:n,minHP:Math.min(...hps),meanHP:Math.round(hps.reduce((a,b)=>a+b,0)/n*10)/10,minRound:Math.min(...rounds),failedRounds:rounds.filter((_,i)=>hps[i]===0),timeouts,...(pressure?{pressure:{...audit,minionDamage:Math.round(audit.minionDamage),bossDamage:Math.round(audit.bossDamage)}}:{})});
}

assert.equal(hashFile('../dist/engine.mjs'),sourceHashes.engineHash,'Engine changed during simulation');
assert.equal(hashFile('../dist/specials.mjs'),sourceHashes.specialsHash,'Vocabulary changed during simulation');
assert.equal(hashFile('../dist/lexicon.mjs'),sourceHashes.lexiconHash,'Lexicon changed during simulation');
assert.equal(hashFile('./strategy.mjs'),sourceHashes.strategyHash,'Strategy changed during simulation');
console.log({summary:true,...sourceHashes,skills,games:results.reduce((s,r)=>s+r.total,0),wins:results.reduce((s,r)=>s+r.wins,0),rate:results.reduce((s,r)=>s+r.wins,0)/results.reduce((s,r)=>s+r.total,0),reference:"总体50–60%，首章约90%、末章约20%；允许波动，不按固定配额调整",chapters:results});
