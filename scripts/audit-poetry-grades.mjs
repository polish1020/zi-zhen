import assert from'node:assert/strict';
import{readFileSync,writeFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{Game,drawHandWords,getWord,POEMS,POEM_LINES,POETRY_GRADES,poemWithinGrade}from'../dist/engine.mjs';
const files=['dist/engine.mjs','dist/poetry-rules.mjs','dist/poetry-data.mjs'],hashes=()=>Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(new URL('../'+f,import.meta.url))).digest('hex')])),sourceHashes=hashes();
const grades=[];
for(const{value:grade,label}of POETRY_GRADES){
 const eligible=POEMS.filter(p=>poemWithinGrade(p.id,grade)),lines=POEM_LINES.filter(l=>poemWithinGrade(l.poem,grade));const row={grade,label,eligiblePoems:eligible.length,eligibleLines:lines.length,eligibleLengths:Object.fromEntries([5,6,7].map(n=>[n,lines.filter(l=>l.word.length===n).length])),samples:1000,guaranteedPoemLengths:{5:0,6:0,7:0},extraPoems:0,independentWholeHandBuilds:0};
 for(let seed=1;seed<=1000;seed++){
  const rng=Object.create(Game.prototype);rng.rngState=seed;for(let i=0;i<4;i++)rng.random();const plan=drawHandWords(()=>rng.random(),grade);assert.equal(plan.join('').length,32);assert.equal(new Set(plan).size,plan.length);assert.ok(getWord(plan[0]).poem);assert.deepEqual(plan.slice(1,6).map(w=>w.length),[4,4,3,3,3]);row.guaranteedPoemLengths[plan[0].length]++;
  for(const word of plan){const w=getWord(word);assert.ok(w&&word.length>=2);if(w.poem)assert.ok(poemWithinGrade(w.poem,grade),`${grade}:${word}`);}row.extraPoems+=plan.slice(6).filter(word=>getWord(word).poem).length;
  if(seed<=10){const g=new Game(seed%10,seed,grade);g.ink=10000;g.hand=plan.join('').split('').map(ch=>({ch,id:++g.handSerial,used:false}));for(let i=0;i<plan.length;i++)assert.ok(g.build(plan[i],i),plan[i]);assert.ok(g.hand.every(t=>t.used));assert.deepEqual(Game.restore(g.export()).export(),g.export());row.independentWholeHandBuilds++;}
 }
 grades.push(row);
}
assert.deepEqual(hashes(),sourceHashes);
const report={date:'2026-11-02',method:'1000 deterministic recipe plans for each of all/grades 1–6; cumulative grade scopes from existing corpus labels. Every guarantee and extra poem must belong to an eligible poem; no single-character fillers, no duplicate recipes, all plans use exactly 32 cards. Missing verse-length pools are excluded, never replaced by higher grades. Ten plans per scope are actually built with real costs and all 32 cards consumed using a test-only 10000 wallet. Default all-mode initial exports/RNG/hand bytes additionally match 200 frozen pre-feature snapshots. These checks validate selection and compatibility, not the win rate of restricted-grade armies.',sourceHashes,totalSamples:7000,independentWholeHandBuilds:70,defaultSnapshots:'tests/fixtures/pre-poetry-grade-hands.json',grades};
if(process.argv.includes('--write'))writeFileSync(new URL('../docs/reports/poetry-grades.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
