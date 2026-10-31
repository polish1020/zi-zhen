#!/usr/bin/env node
import {readFile,writeFile}from'node:fs/promises';
const file=new URL('../dist/specials.mjs',import.meta.url),data=JSON.parse(await readFile(new URL('../data/idiom-review.json',import.meta.url),'utf8'));
const source=await readFile(file,'utf8'),start='// BEGIN COMPLETE IDIOM REVIEW',end='// END COMPLETE IDIOM REVIEW';
const block=start+'\nexport const PREVIOUS_LEARNING_WORDS=Object.freeze(Object.fromEntries(Object.entries(SPECIAL_GROUPS).flatMap(([id,words])=>words.split(/\\s+/).map(word=>[word,id]))));\n'+
 'const IDIOM_ROUTE_GROUPS='+JSON.stringify(data.groups,null,1)+';\n'+
 'export const REVIEWED_IDIOMS='+JSON.stringify(data.confirmed)+' .split(" ");\n'+
 'export const IDIOM_LESSONS='+JSON.stringify(data.lessons||{},null,1)+';\n'+
 'export const IDIOM_EXCLUSIONS='+JSON.stringify(Object.keys(data.rejected))+';\n'+
 'export const IDIOM_PROFILES=Object.freeze(Object.fromEntries(Object.entries(IDIOM_ROUTE_GROUPS).flatMap(([key,words])=>{const[type,special,move]=key.split("/");return words.split(" ").map(word=>[word,{type,special,move}]);})));\n'+
 'for(const[id,words]of Object.entries(SPECIAL_GROUPS))SPECIAL_GROUPS[id]=words.split(/\\s+/).filter(word=>!IDIOM_PROFILES[word]).join(" ");\n'+
 'for(const[key,words]of Object.entries(IDIOM_ROUTE_GROUPS)){const[type,id]=key.split("/");if(type==="learning")SPECIAL_GROUPS[id]=[SPECIAL_GROUPS[id],words].filter(Boolean).join(" ");}\n'+end;
const next=source.includes(start)?source.slice(0,source.indexOf(start))+block+source.slice(source.indexOf(end)+end.length):source.replace('// Every spelling is curated once;',block+'\n// Every spelling is curated once;');
if(process.argv.includes('--check')){if(next!==source)throw Error('Idiom review is stale');console.log('PASS idiom review is reproducible');}else{await writeFile(file,next);console.log('Built complete idiom review');}
