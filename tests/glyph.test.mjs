import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {GLYPHS,GLYPH_INDEX,LEVELS,COMPONENTS,STRUCTURES,ASSEMBLY_VARIANTS,placementText,structureName} from '../dist/glyph-data.mjs';
import {GlyphGame,GLYPH_SAVE_KEY,matchAssembly,WritingSession,evaluateStroke,screenMedian,resample} from '../dist/glyph-engine.mjs';
const strokes=JSON.parse(readFileSync(new URL('../dist/glyph-strokes.json',import.meta.url)));
const forge=(game,char)=>{const glyph=GLYPH_INDEX.get(char);game.setLayout(glyph.layout);glyph.parts.forEach((part,i)=>assert.equal(game.addPart(part,i),true,char));const result=game.assemble();assert.equal(result.status,'success',char);assert.equal(result.glyph.char,char);return result;};
test('20 authored levels cover 60 mission characters and all 76 discoverable characters with exact component recipes',()=>{
 assert.equal(LEVELS.length,20);assert.equal(GLYPHS.length,76);assert.equal(new Set(GLYPHS.map(g=>g.char)).size,76);assert.equal(new Set(LEVELS.flatMap(l=>l.targets)).size,60);assert.equal(new Set(LEVELS.flatMap(l=>[...l.targets,...l.extras])).size,76);
 for(const level of LEVELS){assert.equal(level.targets.length,3);assert.ok(level.pool.length<=7);assert.ok(level.pool.every(p=>COMPONENTS[p]));for(const char of [...level.targets,...level.extras]){const g=GLYPH_INDEX.get(char);assert.ok(g);assert.equal(g.parts.length,STRUCTURES[g.layout].positions.length);assert.ok(g.parts.every(p=>level.pool.includes(p)));assert.equal(matchAssembly(g.layout,g.parts).char,char);assert.ok(g.meaning.length>8&&g.pinyin.length>0);}}
 assert.equal(COMPONENTS['氵'].name,'三点水');assert.notEqual(COMPONENTS['囗'].name,COMPONENTS['口'].name);assert.match(COMPONENTS['青'].note,/并不完全一样/);assert.match(structureName(GLYPH_INDEX.get('问')),/半包围/);assert.match(structureName(GLYPH_INDEX.get('品')),/品字形/);assert.ok(placementText(GLYPH_INDEX.get('国')).includes('玉'));
});
test('composition depends on position and structure, allows repeated parts, and does not call unknown combinations non-characters',()=>{
 const g=new GlyphGame();g.addPart('青');g.addPart('氵');assert.equal(g.assemble().status,'placement');assert.equal(g.learned.length,0);g.swap();assert.equal(g.assemble().glyph.char,'清');assert.deepEqual(g.learned,['清']);g.assemble();assert.equal(g.learned.length,1);
 g.setLayout('stack');assert.equal(g.assemble().status,'placement');g.slots=['氵','日'];const unknown=g.assemble();assert.equal(unknown.status,'uncollected');assert.match(unknown.message,/还没收进/);assert.doesNotMatch(unknown.message,/不能组成|不存在|错误的字/);assert.equal(g.addPart('木'),false);assert.equal(g.addPart('氵',7),false);
 assert.equal(matchAssembly('lr',['木','木']).char,'林');assert.equal(matchAssembly('triple',['木','木','木']).char,'森');assert.equal(matchAssembly('stack',['木','林']).char,'森');assert.equal(ASSEMBLY_VARIANTS.length,1);
 assert.equal(matchAssembly('surround',['囗','玉']).char,'国');assert.equal(matchAssembly('surround',['囗','王']),null);assert.equal(matchAssembly('surround',['口','木']),null);
});
test('a complete natural first level changes three different scene goals, unlocks the next level and keeps all recipe parts',()=>{
 const g=new GlyphGame(),pool=[...g.chapter.pool];assert.equal(g.selectLevel(2),false);for(const c of ['清','晴','请']){forge(g,c);const event=g.apply();assert.equal(event.ok,true);assert.ok(event.effect);assert.equal(g.apply().ok,false);assert.deepEqual(g.chapter.pool,pool);}
 assert.equal(g.complete,true);assert.equal(g.leaves,3);assert.equal(g.finishedLevels,1);assert.equal(g.unlocked,2);assert.equal(g.selectLevel(2),true);assert.equal(g.complete,false);assert.equal(g.result,null);assert.deepEqual(g.slots,[null,null]);
});
test('hints, failed attempts and discovering extra characters never consume resources or block learning',()=>{
 const g=new GlyphGame();const first=g.hint(),second=g.hint();assert.equal(first.step,1);assert.ok(!first.message.includes('清'));assert.match(second.message,/清.*qīng/);assert.ok(second.message.includes('三点水'));assert.equal(g.leaves,0);forge(g,'情');assert.equal(g.apply().ok,false);assert.ok(g.learned.includes('情'));assert.equal(g.leaves,0);assert.equal(g.recordPractice('清'),false);assert.equal(g.recordPractice('情'),true);assert.equal(g.practiced['情'],1);
 assert.equal(Object.hasOwn(g,'ink'),false);assert.equal(Object.hasOwn(g,'hp'),false);assert.equal(Object.hasOwn(g,'time'),false);
});
test('every level, hidden character and partial draft survives save/restore; all 76 words are reachable without a dead end',()=>{
 let g=new GlyphGame();for(const level of LEVELS){assert.equal(g.selectLevel(level.id),true);for(const char of [...level.extras,...level.targets]){forge(g,char);if(level.targets.includes(char))assert.equal(g.apply().ok,true);assert.equal(g.recordPractice(char),true);const saved=g.export();g=GlyphGame.restore(saved);assert.deepEqual(g.export(),saved);saved.learned.length=0;assert.ok(g.learned.length>0);}}
 assert.equal(g.finishedLevels,20);assert.equal(g.leaves,60);assert.equal(g.learned.length,76);assert.equal(Object.keys(g.practiced).length,76);assert.equal(g.unlocked,20);assert.equal(g.selectLevel(21),false);assert.ok(g.selectLevel(1));g.addPart('青');const restored=GlyphGame.restore(g.export());assert.deepEqual(restored.slots,['青',null]);
});
test('corrupt progress is rejected and construction can never write into the tower-defense save keys',()=>{
 const base=new GlyphGame().export();for(const patch of [{version:2},{level:20},{learned:['假字']},{history:{20:['众']}},{practiced:{清:1}},{hints:{'1:9':3}},{layout:'diagonal'},{slots:['木',null]},{result:'清'},{questIndex:3},{history:JSON.parse('{"__proto__":["清"]}')}])assert.throws(()=>GlyphGame.restore({...structuredClone(base),...patch}));
 assert.notEqual(GLYPH_SAVE_KEY,'wordward-save-v1');assert.notEqual(GLYPH_SAVE_KEY,'wordward-record-v1');assert.doesNotMatch(readFileSync(new URL('../dist/glyph-app.mjs',import.meta.url),'utf8'),/localStorage\.(?:removeItem|clear)\(/);
});
test('all 625 original stroke paths are available offline, correct directional traces advance exactly one stroke',()=>{
 assert.equal(strokes.source.commit,'68d10a4b21150cae5e1ebbd223eed289cf32d90c');assert.match(strokes.source.license,/Arphic/);assert.match(strokes.source.note,/unchanged/);let count=0;
 for(const glyph of GLYPHS){const data=strokes.characters[glyph.char],session=new WritingSession(data);for(const median of data.medians){assert.equal(session.complete,false);const result=session.submit(screenMedian(median));assert.equal(result.accepted,true,glyph.char+' stroke '+session.index);count++;}assert.equal(session.complete,true);assert.equal(session.submit([[0,0],[2,2]]).accepted,false);}
 assert.equal(count,625);assert.match(readFileSync(new URL('../dist/ARPHICPL.TXT',import.meta.url),'utf8'),/Copyright \(C\) 1999 Arphic Technology/);
});
test('tracing rejects taps, distant/reversed long strokes and scribbles while allowing gentle motor variation',()=>{
 const median=[[100,700],[550,700],[700,700]],path=screenMedian(median);assert.equal(evaluateStroke(path,median).accepted,true);assert.equal(evaluateStroke(path.map(([x,y])=>[x+18,y-15]),median).accepted,true);
 for(const p of [[[100,200]],[[100,200],[100,200]],path.slice().reverse(),[[100,200],[300,800],[600,20],[700,200]],[[NaN,1],[2,3]]])assert.equal(evaluateStroke(p,median).accepted,false);
 const corner=[[100,700],[700,700],[700,100]];assert.equal(evaluateStroke(screenMedian([corner[0],corner[2]]),corner).accepted,false);const s=new WritingSession(strokes.characters['清']);assert.equal(s.submit([[0,0],[500,500]]).accepted,false);assert.equal(s.index,0);assert.throws(()=>new WritingSession({strokes:['M0 0'],medians:[]}));assert.equal(resample(path).length,28);
});
test('tower-defense engine, combat vocabulary and semantic skills remain byte-identical to the shipped baseline',()=>{
 const baseline={'engine.mjs':'1c0a7467438132012e3669cb466745f88f47d082f04cd7bcfbc87b5e6d9836c7','lexicon.mjs':'279cdab447a3b168c28aa9c9f28ff0cfd97bbeeb3ff89ac8ffdf28a828a6aa52','specials.mjs':'9123c609756d05908e7d43084e5cc318a7afdb715ebbf672fd069cefb0e90820'};for(const[f,hash]of Object.entries(baseline))assert.equal(createHash('sha256').update(readFileSync(new URL('../dist/'+f,import.meta.url))).digest('hex'),hash,f);
});
test('static asset manifest contains the complete independent mode, local stroke data, license and every relative module import',()=>{
 const assets=JSON.parse(readFileSync(new URL('../data/static-assets.json',import.meta.url)));assert.equal(new Set(assets).size,assets.length);assert.equal(assets.length,20);
 for(const file of assets){const text=readFileSync(new URL('../dist/'+file,import.meta.url),'utf8');assert.ok(text.length);for(const match of text.matchAll(/(?:from\s*|import\s*)['"]\.\/([^'"]+\.mjs)['"]/g))assert.ok(assets.includes(match[1]),file+' imports '+match[1]);}
 assert.match(readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),/id="enter-glyph"/);assert.match(readFileSync(new URL('../dist/glyph.html',import.meta.url),'utf8'),/ARPHICPL\.TXT/);assert.match(readFileSync(new URL('../dist/glyph-app.mjs',import.meta.url),'utf8'),/fetch\('\.\/glyph-strokes\.json'\)/);
});
