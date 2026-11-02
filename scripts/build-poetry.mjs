import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {SCENE_RULES,signatureKey} from '../dist/poetry-scene-rules.mjs';
const root=new URL('../',import.meta.url),read=f=>readFileSync(new URL(f,root),'utf8');
const corpus=JSON.parse(read('data/poetry-corpus.json')),groups=new Map();let group;
for(const raw of read('data/poetry-abilities.txt').split('\n')){const line=raw.trim();if(!line||line.startsWith('#'))continue;if(line.startsWith('[')){group=Number(line.slice(1,-1));assert.ok(!groups.has(group));groups.set(group,[]);}else groups.get(group).push(line);}
const allowed=new Set('strike burst chain fan line sky ground slow freeze mark burn silence armor shred push reveal shield heal haste guard allShield allFreeze allSlow allMend allReveal allHaste allSilence allWeaken'.split(' '));
const sceneRows=read('data/poetry-signatures.txt').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')).map(s=>s.split('|'));
const sceneIndex=new Map(),sceneSignatures=new Map(),sceneNames=new Set();
for(const row of sceneRows){assert.equal(row.length,3);const[word,name,programText]=row,program=programText.split(',');assert.ok(!sceneIndex.has(word),word);assert.ok(!sceneNames.has(name),name);sceneNames.add(name);assert.ok(program.length>=2&&program.length<=3,word);assert.equal(new Set(program).size,program.length,word);for(const rule of program)assert.ok(SCENE_RULES[rule],word+': '+rule);const key=signatureKey(program);assert.ok(!sceneSignatures.has(key),'Same non-numeric scene behavior: '+word+' / '+sceneSignatures.get(key));sceneSignatures.set(key,word);sceneIndex.set(word,{name,program});}
assert.equal(sceneRows.length,483);
const signatures=new Set(),lines=[];
for(const [i,poem]of corpus.entries()){
 const definitions=groups.get(i+1);assert.equal(definitions.length,poem.forgeable.length,poem.title);
 for(const[index,word]of poem.forgeable.entries()){
  const fields=definitions[index].split('|');assert.equal(fields.length,4,word);const[art,aim,program,meaning]=fields;
  assert.ok(['front','boss','crowd','weak','rear','nearest','air','ground','shield','east','west','north','south'].includes(aim));
  const ops=program.split(';').map(s=>{const[k,ns]=s.split(':');const values=ns.split(',').map(Number);assert.ok(allowed.has(k),k);assert.ok(values.every(n=>Number.isFinite(n)&&n>0&&n<=180),s);return[k,...values];});
  const signature=JSON.stringify([aim,ops]);assert.ok(!signatures.has(signature),'Duplicated ability: '+word);signatures.add(signature);
  const field=ops.filter(op=>op[0].startsWith('all')).map(op=>op[0]);
  const cooldown=field.some(x=>['allFreeze','allShield','allMend'].includes(x))?16:field.length?14:12;
  assert.ok(sceneIndex.has(word),word);lines.push({word,poem:poem.id,line:index,art,aim,charge:4,cooldown,ops,meaning,field,signature:sceneIndex.get(word)});
 }
}
assert.equal(corpus.length,109);assert.equal(lines.length,483);assert.equal(new Set(lines.map(l=>l.word)).size,lines.length);
const poems=corpus.map(({id,title,author,grade,paragraphs,note,url})=>({id,title,author,grade,paragraphs,...(note?{note}:{}),...(url?{url}:{})}));
const output='// Reviewed classical texts are public domain; definitions and ability programs are project-authored.\n'+`export const POEMS=${JSON.stringify(poems)};\nexport const POEM_LINES=${JSON.stringify(lines)};\n`;
if(process.argv.includes('--check'))assert.equal(read('dist/poetry-data.mjs'),output);else writeFileSync(new URL('dist/poetry-data.mjs',root),output);
console.log(JSON.stringify({poems:poems.length,lines:lines.length,abilities:signatures.size,sceneBehaviors:sceneSignatures.size,sceneRules:Object.keys(SCENE_RULES).length,fieldAbilities:lines.filter(l=>l.field.length).length,lengths:Object.fromEntries([5,6,7].map(n=>[n,lines.filter(l=>l.word.length===n).length]))}));
