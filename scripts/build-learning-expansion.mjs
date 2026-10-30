#!/usr/bin/env node
import {readFile,writeFile}from'node:fs/promises';
const file=new URL('../dist/specials.mjs',import.meta.url),data=JSON.parse(await readFile(new URL('../data/learning-expansion.json',import.meta.url),'utf8'));
const source=await readFile(file,'utf8'),start='// BEGIN REVIEWED LEARNING EXPANSION',end='// END REVIEWED LEARNING EXPANSION';
const block=start+'\nconst EXPANDED_GROUPS='+JSON.stringify(data.groups,null,1)+';\nfor(const[id,words]of Object.entries(EXPANDED_GROUPS))SPECIAL_GROUPS[id]=[SPECIAL_GROUPS[id],words].filter(Boolean).join(" ");\nexport const SPECIAL_LESSONS='+JSON.stringify(data.lessons,null,1)+';\n'+end;
const next=source.includes(start)?source.slice(0,source.indexOf(start))+block+source.slice(source.indexOf(end)+end.length):source.replace('// Every spelling is curated once;',block+'\n// Every spelling is curated once;');
if(process.argv.includes('--check')){if(next!==source)throw Error('Learning expansion is stale');console.log('PASS learning expansion is reproducible');}else{await writeFile(file,next);console.log('Built reviewed learning expansion');}
