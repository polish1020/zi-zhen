#!/usr/bin/env node
import assert from'node:assert/strict';import{readFile,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';import{Game,drawHandWords,getWord,HAND_EXTRA_LENGTH_WEIGHTS}from'../dist/engine.mjs';
const hash=async f=>createHash('sha256').update(await readFile(new URL('../dist/'+f,import.meta.url))).digest('hex');
const engineHash=await hash('engine.mjs'),counts=[],unique=new Set(),guarantees=new Set(),histograms=Object.fromEntries([2,3,4,5,6,7].map(n=>[n,{}])),examples=[];let independentBuilds=0,qualified=0,cheap=0;
const check=plan=>{assert.ok(getWord(plan[0]).poem);assert.deepEqual(plan.slice(1,6).map(w=>w.length),[4,4,3,3,3]);assert.equal(plan.join('').length,32);assert.equal(new Set(plan).size,plan.length);for(const word of plan)assert.ok(word.length>=2&&getWord(word));assert.deepEqual(plan.slice(6).map(w=>w.length),plan.slice(6).map(w=>w.length).sort((a,b)=>b-a));};
for(let seed=1;seed<=500;seed++){
 const g=new Game((seed-1)%10,seed);g.ink=10000;
 for(let draw=0;draw<4;draw++){
  const rng=Object.create(Game.prototype);rng.rngState=draw?g.rngState:seed;if(!draw)for(let n=0;n<4;n++)rng.random();const plan=drawHandWords(()=>rng.random());check(plan);
  if(draw){const before=g.ink;assert.ok(g.refreshHand());assert.equal(before-g.ink,50);}
  assert.equal(g.hand.length,32);const freq=s=>[...s].sort().join('');assert.equal(freq(plan.join('')),freq(g.hand.map(t=>t.ch).join('')));
  for(const word of plan.slice(0,6))guarantees.add(word);unique.add(g.hand.map(t=>t.ch).join(''));const available=g.availableWords(),row=[2,3,4,5,6,7].map(n=>available.filter(w=>w.tier===n).length);counts.push(row);
  assert.ok(available.some(w=>w.poem)&&row[1]>=3&&row[2]>=2);qualified++;if(available.some(w=>w.tier===1&&w.damage>0&&w.cost<=37))cheap++;
  for(let i=0;i<6;i++)histograms[i+2][row[i]]=(histograms[i+2][row[i]]||0)+1;
  if(examples.length<3)examples.push({letters:g.hand.map(t=>t.ch).join(''),guarantees:plan.slice(0,6),extras:plan.slice(6),counts:row});
  if(seed<=25){const h=Game.restore(g.export());h.ink=10000;for(let n=0;n<plan.length;n++)assert.ok(h.build(plan[n],n),plan[n]);assert.equal(h.hand.filter(t=>t.used).length,32);independentBuilds++;}
 }
}
const recipeAudit={samples:10000,guaranteedPoemLengths:{5:0,6:0,7:0},extraLengths:{2:0,3:0,4:0,5:0,6:0,7:0},completePoemCounts:{},recipeCounts:{},longIdiomHands:0};
for(let seed=1;seed<=10000;seed++){
 const rng=Object.create(Game.prototype);rng.rngState=seed;for(let n=0;n<4;n++)rng.random();const plan=drawHandWords(()=>rng.random());check(plan);recipeAudit.guaranteedPoemLengths[plan[0].length]++;for(const word of plan.slice(6))recipeAudit.extraLengths[word.length]++;
 const poems=plan.filter(w=>getWord(w).poem).length;recipeAudit.completePoemCounts[poems]=(recipeAudit.completePoemCounts[poems]||0)+1;recipeAudit.recipeCounts[plan.length]=(recipeAudit.recipeCounts[plan.length]||0)+1;if(plan.some(w=>w.length>4&&!getWord(w).poem))recipeAudit.longIdiomHands++;
}
assert.equal(await hash('engine.mjs'),engineHash,'Hand generator changed during audit');
const report={date:'2026-11-02',engineHash,specialsHash:await hash('specials.mjs'),lexiconHash:await hash('lexicon.mjs'),method:'500 seeds across ten chapters, initial hand plus 3 paid refreshes each; actual available recipes include cross-combinations. 100 hands spend all 32 cards on every independent complete recipe, with a test-only 10000 wallet. A separate 10000-seed plan census checks exact card packing and weighted extras. No singleton filler; words never compete for cards in the sampled underlying plans. Only 1 poem + 2 four-character + 3 three-character words are guarantees; two-character words are probabilistic. Candidate counts can overlap and are not the simultaneous tower count.',extraLengthWeights:HAND_EXTRA_LENGTH_WEIGHTS,extraLengthNote:'Relative weights renormalize over lengths that fit and can leave a fillable tail; after a length is picked, later extras cannot be longer. Six-character extras choose equally between an unselected curated long idiom and a poem, when both pools are available.',samples:counts.length,qualified,qualifiedPct:qualified/counts.length*100,cheapSingleAvailable:cheap,uniqueHands:unique.size,distinctGuaranteedWords:guarantees.size,independentWholeHandBuilds:independentBuilds,average:Object.fromEntries([2,3,4,5,6,7].map((n,i)=>[n,counts.reduce((s,r)=>s+r[i],0)/counts.length])),minimum:Object.fromEntries([2,3,4,5,6,7].map((n,i)=>[n,Math.min(...counts.map(r=>r[i]))])),recipeAudit,histograms,examples};
if(process.argv.includes('--write'))await writeFile(new URL('../docs/reports/poetry-hands.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,histograms:undefined},null,2));
