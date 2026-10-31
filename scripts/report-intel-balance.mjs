import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
const files=process.argv.slice(2);assert.equal(files.length,2,'Pass plain/skill campaign logs');
const hash=path=>createHash('sha256').update(readFileSync(new URL(path,import.meta.url))).digest('hex');
const sourceHashes={engineHash:hash('../dist/engine.mjs'),specialsHash:hash('../dist/specials.mjs'),lexiconHash:hash('../dist/lexicon.mjs'),strategyHash:hash('../tests/strategy.mjs'),appHash:hash('../dist/app.mjs'),gameplayHash:hash('../dist/gameplay.css')};
const strategies=files.map(file=>{
 const rows=(readFileSync(file,'utf8').match(/^\{\n[\s\S]*?^\}/gm)||[]).map(block=>JSON.parse(JSON.stringify(runInNewContext('('+block+')',{}, {timeout:100}))));
 const summary=rows.at(-1);assert.equal(summary?.summary,true);for(const key of ['engineHash','specialsHash','lexiconHash','strategyHash'])assert.equal(summary[key],sourceHashes[key]);assert.equal(summary.games,200);const chapters=rows.slice(0,-1);assert.equal(chapters.length,10);assert.ok(chapters.every(c=>c.total===20&&c.timeouts===0));return {summary,chapters};
});
const before=JSON.parse(readFileSync(new URL('../docs/reports/elemental-balance.json',import.meta.url))),words=JSON.parse(readFileSync(new URL('../docs/reports/elemental-aliases.json',import.meta.url)));
assert.equal(words.lexiconHash,sourceHashes.lexiconHash);const chapters=before.chapters.map(c=>({chapter:c.chapter,wins:strategies.reduce((s,r)=>s+r.chapters.find(x=>x.chapter===c.chapter).wins,0),total:40,previousWins:c.wins}));
const report={date:'2026-10-31',baselineCommit:'7c4e720bfe17381a38290d74a3576b738c3c4c62',sourceHashes,
 method:'Ten chapters, paired seeds 1–20 under the same formation strategies without/with active ink skill. Actual income, prices and repairs; no injected resources. Tower destruction is allowed and hearts remaining at chapter completion is victory. New vocabulary changes hand choices and subsequent RNG, so this is not a fixed-enemy causal ablation or a human win rate.',
 games:400,wins:chapters.reduce((s,c)=>s+c.wins,0),previousWins:before.wins,chapters,strategies,vocabulary:{added:words.added,total:words.total,unchangedExistingProfiles:words.unchangedExistingProfiles,baselineProfileHash:words.baselineProfileHash},
 limitations:['Two strategies reuse the same twenty seeds per chapter.','The curve can fluctuate; no monster, tower, economy, chapter or strategy change was made to reach a prescribed win-rate quota.']};
writeFileSync(new URL('../docs/reports/intel-balance.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({games:report.games,wins:report.wins,chapters},null,2));
