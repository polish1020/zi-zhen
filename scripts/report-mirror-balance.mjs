import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
const files=process.argv.slice(2);assert.equal(files.length,4,'Pass full plain/skill logs followed by holdout plain/skill logs');
const hash=path=>createHash('sha256').update(readFileSync(new URL(path,import.meta.url))).digest('hex');
const sourceHashes={engineHash:hash('../dist/engine.mjs'),specialsHash:hash('../dist/specials.mjs'),lexiconHash:hash('../dist/lexicon.mjs'),strategyHash:hash('../tests/strategy.mjs'),appHash:hash('../dist/app.mjs')};
const runs=files.map(file=>{
 // These are trusted local test runner logs, not input from a deployment/user.
 const rows=(readFileSync(file,'utf8').match(/^\{\n[\s\S]*?^\}/gm)||[]).map(block=>JSON.parse(JSON.stringify(runInNewContext('('+block+')',{}, {timeout:100}))));
 const summary=rows.at(-1);assert.equal(summary?.summary,true);for(const key of ['engineHash','specialsHash','strategyHash'])assert.equal(summary[key],sourceHashes[key]);
 const chapters=rows.slice(0,-1);assert.ok(chapters.every(r=>r.total===20&&r.timeouts===0));return {summary,chapters};
});
const baseline=JSON.parse(readFileSync(new URL('../docs/reports/hand-balance.json',import.meta.url)));
assert.deepEqual(runs.slice(0,2).map(r=>r.summary.games),[200,200]);assert.deepEqual(runs.slice(2).map(r=>r.summary.games),[20,20]);
for(let i=0;i<2;i++)for(const row of runs[i].chapters)if(row.chapter!==8)assert.deepEqual(row,baseline.strategies[i].chapters.find(r=>r.chapter===row.chapter),'Other chapters must reproduce the baseline exactly');
const chapters=baseline.chapters.map(previous=>({chapter:previous.chapter,wins:runs.slice(0,2).reduce((s,r)=>s+r.chapters.find(c=>c.chapter===previous.chapter).wins,0),total:40,previousWins:previous.wins}));
const holdoutWins=runs.slice(2).reduce((s,r)=>s+r.summary.wins,0),pairedWins=chapters[7].wins;
const report={date:'2026-10-31',baselineCommit:'318f1ca57a2fedfe43096219c25d32f46e1b704c',sourceHashes,
 method:'Ten chapters, seeds 1–20 under the same two formation strategies (with/without active ink skill), plus chapter 8 holdout seeds 21–40 under both strategies. Actual resources and prices, no extra ink. Paired seeds are not independent maps or human win rates. Victory requires chapter completion with hearts remaining; tower destruction is allowed.',
 games:400,wins:chapters.reduce((s,r)=>s+r.wins,0),chapters,strategies:runs.slice(0,2),
 chapter8:{paired:{wins:pairedWins,total:40,previousWins:40},holdout:{wins:holdoutWins,total:40,seedStart:21,seedEnd:40,strategies:runs.slice(2)},combined:{wins:pairedWins+holdoutWins,total:80,rate:(pairedWins+holdoutWins)/80}},
 unchangedOtherChapters:true,limitations:['The first twenty seeds were used while iterating on route design; the next twenty were not used for tuning.','Only chapter 8 geometry and map persistence/touch selection changed. The overall curve remains uneven: chapters 5 and 9 are still easier than nearby chapters. No enemy, tower, income or cost adjustment was made to force a target rate.']};
writeFileSync(new URL('../docs/reports/mirror-balance.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({games:report.games,wins:report.wins,chapters,chapter8:{paired:report.chapter8.paired,holdout:holdoutWins,combined:report.chapter8.combined}},null,2));
