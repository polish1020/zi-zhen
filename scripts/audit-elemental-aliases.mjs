import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {WORDS,getWord,isGameSkill,wordCategory,runeLimit} from '../dist/engine.mjs';
import {aliasRules,aliasSkills} from './elemental-aliases.mjs';
export const PRE_ALIAS_PROFILE_HASH='03da316b15ca0c8898ad72308260ca8c98fe4b0774d6439c8c1d97b4836958f9';
export function auditAliases(){
 const hash=value=>createHash('sha256').update(value).digest('hex'),old=WORDS.filter(w=>!aliasSkills.has(w.word)).map(w=>({word:w.word,profileHash:hash(JSON.stringify(w))}));
 assert.equal(old.length,112468);assert.equal(hash(JSON.stringify(old)),PRE_ALIAS_PROFILE_HASH,'Every previously published profile must be unchanged');
 const byLength={},byType={},byKind={};
 for(const[word,rule]of aliasSkills){const w=getWord(word);assert.ok(w,word);assert.equal(wordCategory(word),'skill',word);assert.ok(isGameSkill(word),word);assert.equal(w.type,rule.school,word);assert.ok(w.runes.length<=runeLimit(w.tier));if(rule.trait)assert.equal(w.trait,rule.trait,word);byLength[w.tier]=(byLength[w.tier]||0)+1;byType[w.type]=(byType[w.type]||0)+1;byKind[rule.kind]=(byKind[rule.kind]||0)+1;}
 return {date:'2026-10-31',baselineCommit:'7c4e720bfe17381a38290d74a3576b738c3c4c62',engineHash:hash(readFileSync(new URL('../dist/engine.mjs',import.meta.url))),lexiconHash:hash(readFileSync(new URL('../dist/lexicon.mjs',import.meta.url))),baselineCount:112468,baselineProfileHash:PRE_ALIAS_PROFILE_HASH,unchangedExistingProfiles:old.length,added:aliasSkills.size,total:WORDS.length,elementAliases:Object.keys(aliasRules.aliases).length,skillRoots:Object.keys(aliasRules.skillRoots).length,byLength,byType,byKind,preservedCollisions:aliasRules.preserveWords,words:[...aliasSkills.keys()]};
}
if(process.argv[1]===new URL(import.meta.url).pathname){const report=auditAliases();if(process.argv.includes('--write'))writeFileSync(new URL('../docs/reports/elemental-aliases.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,words:undefined},null,2));}
