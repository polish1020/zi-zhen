import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {WORDS,getWord,isGameSkill,wordCategory} from '../dist/engine.mjs';
export const rules=JSON.parse(readFileSync(new URL('../data/elemental-skills.json',import.meta.url)));
const preserved=new Set(rules.preserveWords),entries=new Map();
function add(prefix,suffix,source){const word=prefix+suffix;if(word.length<=4&&!preserved.has(word)){assert.ok(!entries.has(word),word);entries.set(word,{prefix,suffix,source});}}
for(const prefix of Object.keys(rules.mixedPrefixes))for(const suffix of [...rules.mixedSuffixes,...Object.keys(rules.extraForms)])add(prefix,suffix,'mixed');
for(const prefix of rules.elementalPrefixes)for(const suffix of Object.keys(rules.extraForms))add(prefix,suffix,'form');
for(const prefix of [...rules.elementalPrefixes,...Object.keys(rules.mixedPrefixes)])for(const suffix of Object.keys(rules.creatures))add(prefix,suffix,'creature');
export const addedSkills=entries;
export const ORIGINAL_PROFILE_HASH='2c2d22dba63db779bebc385f5e9ad8e8ced95a099d657879a090c108f56cf7aa';
export function audit(){
 const hash=text=>createHash('sha256').update(text).digest('hex'),old=WORDS.filter(w=>!entries.has(w.word)).map(w=>({word:w.word,profileHash:hash(JSON.stringify(w))}));
 assert.equal(old.length,107617);assert.equal(hash(JSON.stringify(old)),ORIGINAL_PROFILE_HASH,'All pre-existing word profiles must stay byte-identical');
 const byLength={},byType={},bySource={};
 for(const[word,{source}]of entries){const w=getWord(word);assert.ok(w,word);assert.ok(isGameSkill(word),word);assert.equal(wordCategory(word),'skill',word);byLength[w.tier]=(byLength[w.tier]||0)+1;byType[w.type]=(byType[w.type]||0)+1;bySource[source]=(bySource[source]||0)+1;}
 return {date:'2026-10-31',baselineCommit:'660ece3009b7d3e271ee41223dbca788555a3283',engineHash:hash(readFileSync(new URL('../dist/engine.mjs',import.meta.url))),lexiconHash:hash(readFileSync(new URL('../dist/lexicon.mjs',import.meta.url))),baselineCount:old.length,baselineProfileHash:ORIGINAL_PROFILE_HASH,unchangedExistingProfiles:old.length,total:WORDS.length,added:entries.size,byLength,byType,bySource,preservedCollisions:rules.preserveWords,words:[...entries.keys()]};
}
if(process.argv[1]===new URL(import.meta.url).pathname){const report=audit();if(process.argv.includes('--write'))writeFileSync(new URL('../docs/reports/elemental-skills.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,words:undefined,preservedCollisions:report.preservedCollisions.length},null,2));}
