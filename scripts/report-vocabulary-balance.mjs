import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
const files=process.argv.slice(2);assert.equal(files.length,2);
const hash=path=>createHash('sha256').update(readFileSync(new URL(path,import.meta.url))).digest('hex');
const sourceHashes={engineHash:hash('../dist/engine.mjs'),specialsHash:hash('../dist/specials.mjs'),lexiconHash:hash('../dist/lexicon.mjs'),strategyHash:hash('../tests/strategy.mjs')};
const strategies=files.map(file=>{
 const rows=(readFileSync(file,'utf8').match(/^\{\n[\s\S]*?^\}/gm)||[]).map(block=>JSON.parse(JSON.stringify(runInNewContext('('+block+')',{}, {timeout:100}))));
 const summary=rows.at(-1);assert.equal(summary?.summary,true);assert.equal(summary.games,200);
 for(const key of Object.keys(sourceHashes))assert.equal(summary[key],sourceHashes[key]);
 const chapters=rows.slice(0,-1);assert.equal(chapters.length,10);assert.ok(chapters.every(c=>c.total===20&&c.timeouts===0));return{summary,chapters};
});
const before=JSON.parse(readFileSync(new URL('../docs/reports/intel-balance.json',import.meta.url)));
const chapters=strategies[0].chapters.map(c=>({chapter:c.chapter,wins:strategies.reduce((s,r)=>s+r.chapters.find(x=>x.chapter===c.chapter).wins,0),total:40,previousWins:before.chapters.find(x=>x.chapter===c.chapter).wins}));
const wins=chapters.reduce((s,c)=>s+c.wins,0),report={date:'2026-11-01',baselineCommit:'9020632870665080aa4ef022f5cb38307ee3c94c',sourceHashes,method:'Ten chapters; paired seeds 1–20 with the same formation policy without/with the active ink skill. Actual starting money, costs, repairs and rewards. Tower destruction is allowed; victory requires hearts remaining at chapter completion. Vocabulary changes affect hand choices and subsequent RNG. Paired strategies are not independent human observations; this is not a fixed-enemy causal comparison.',games:400,wins,winPct:wins/4,timeouts:0,chapters,strategies};
writeFileSync(new URL('../docs/reports/vocabulary-review-balance.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,strategies:undefined},null,2));
