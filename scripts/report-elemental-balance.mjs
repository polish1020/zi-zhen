import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
const files=process.argv.slice(2);assert.equal(files.length,2,'Pass plain and active-skill campaign logs');
const hash=path=>createHash('sha256').update(readFileSync(new URL(path,import.meta.url))).digest('hex');
const sourceHashes={engineHash:hash('../dist/engine.mjs'),specialsHash:hash('../dist/specials.mjs'),lexiconHash:hash('../dist/lexicon.mjs'),strategyHash:hash('../tests/strategy.mjs')};
const strategies=files.map(file=>{
 const rows=(readFileSync(file,'utf8').match(/^\{\n[\s\S]*?^\}/gm)||[]).map(block=>JSON.parse(JSON.stringify(runInNewContext('('+block+')',{}, {timeout:100}))));
 const summary=rows.at(-1);assert.equal(summary?.summary,true);for(const key of Object.keys(sourceHashes))assert.equal(summary[key],sourceHashes[key]);assert.equal(summary.games,200);
 const chapters=rows.slice(0,-1);assert.equal(chapters.length,10);assert.ok(chapters.every(c=>c.total===20&&c.timeouts===0));return {summary,chapters};
});
const baseline=JSON.parse(readFileSync(new URL('../docs/reports/mirror-balance.json',import.meta.url))),vocabulary=JSON.parse(readFileSync(new URL('../docs/reports/elemental-skills.json',import.meta.url)));
assert.equal(vocabulary.engineHash,sourceHashes.engineHash);assert.equal(vocabulary.lexiconHash,sourceHashes.lexiconHash);
const chapters=baseline.chapters.map(c=>({chapter:c.chapter,wins:strategies.reduce((s,r)=>s+r.chapters.find(x=>x.chapter===c.chapter).wins,0),total:40,previousWins:c.wins}));
const report={date:'2026-10-31',vocabularyBaselineCommit:'660ece3009b7d3e271ee41223dbca788555a3283',previousFullCampaignCommit:'53a8cdad99f98f918f55109e6686eaee87dc7dcc',sourceHashes,
 method:'Ten chapters, paired seeds 1–20 under the unchanged formation strategies with/without active ink skill. Actual resources, prices, repairs and drops; no extra income. Tower destruction is allowed; victory means completed chapter with hearts remaining. The previous release added cosmetic boss defeat scenes only; the prior full campaign is the reference. Vocabulary changes random draw choices and subsequent RNG use, so this is not a fixed-enemy causal ablation or a human win rate.',
 games:400,wins:chapters.reduce((s,c)=>s+c.wins,0),previousWins:baseline.wins,chapters,strategies,
 vocabulary:{added:vocabulary.added,total:vocabulary.total,unchangedExistingProfiles:vocabulary.unchangedExistingProfiles,baselineProfileHash:vocabulary.baselineProfileHash},
 limitations:['Forty runs per chapter reuse twenty seeds across two strategies.','The curve can fluctuate between chapters; no monster, tower, price, chapter or strategy adjustment was made to force a win-rate quota.']};
writeFileSync(new URL('../docs/reports/elemental-balance.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({games:report.games,wins:report.wins,chapters},null,2));
