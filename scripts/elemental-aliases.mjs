import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url)));
export const aliasRules=read('elemental-aliases.json');
const templates=read('skill-templates.json'),elemental=read('elemental-skills.json'),preserved=new Set(aliasRules.preserveWords);
export const aliasRoots={...templates.prefixes,...elemental.mixedPrefixes};
export const aliasSkills=new Map();
for(const[prefix,canonical]of Object.entries({...aliasRules.aliases,...aliasRules.skillRoots}))for(const[source,forms]of[['weapon',templates.suffixes],['technique',elemental.extraForms],['creature',elemental.creatures]])for(const[suffix,form]of Object.entries(forms)){
 if(Object.hasOwn(aliasRules.skillRoots,prefix)&&!aliasRules.skillRootSuffixes.includes(suffix))continue;
 const word=prefix+suffix;if(word.length>4||prefix===suffix||preserved.has(word))continue;
 assert.ok(!aliasSkills.has(word),word);const mixed=Object.hasOwn(elemental.mixedPrefixes,canonical),rule=aliasRoots[canonical];
 aliasSkills.set(word,{prefix,canonical,suffix,source,kind:Object.hasOwn(aliasRules.skillRoots,prefix)?'skill-root':'alias',school:mixed||source!=='weapon'?rule.school:form.school||rule.school,rune:rule.rune,trait:form.trait,extra:source==='creature'?'brood':form.extra,suffixFirst:!mixed&&(source==='creature'||source==='weapon'&&form.suffixFirst)});
}
