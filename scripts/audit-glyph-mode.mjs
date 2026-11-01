import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {GLYPHS,GLYPH_INDEX,LEVELS,COMPONENTS,ASSEMBLY_VARIANTS} from '../dist/glyph-data.mjs';
import {GlyphGame,WritingSession,screenMedian} from '../dist/glyph-engine.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url));
const hash=path=>createHash('sha256').update(read(path)).digest('hex');
const data=JSON.parse(read('dist/glyph-strokes.json'));
let game=new GlyphGame(),traceCount=0;
for(const level of LEVELS){assert.ok(game.selectLevel(level.id));for(const char of [...level.extras,...level.targets]){const glyph=GLYPH_INDEX.get(char);game.setLayout(glyph.layout);glyph.parts.forEach((part,i)=>assert.ok(game.addPart(part,i)));assert.equal(game.assemble().status,'success');if(level.targets.includes(char))assert.ok(game.apply().ok);game=GlyphGame.restore(game.export());}}
for(const glyph of GLYPHS){const writer=new WritingSession(data.characters[glyph.char]);for(const median of writer.data.medians){assert.ok(writer.submit(screenMedian(median)).accepted);traceCount++;}assert.ok(writer.complete);}
const assets=JSON.parse(read('data/static-assets.json'));
const report={date:'2026-11-01',baselineCommit:'84b295587ed7f093e88d325619128cb2d4c76d50',levels:LEVELS.length,missionCharacters:new Set(LEVELS.flatMap(l=>l.targets)).size,discoverableCharacters:GLYPHS.length,bonusCharacters:LEVELS.reduce((n,l)=>n+l.extras.length,0),components:Object.keys(COMPONENTS).length,alternateRecipes:ASSEMBLY_VARIANTS.length,strokeCount:traceCount,fullCampaign:{completedLevels:game.finishedLevels,leaves:game.leaves,discovered:game.learned.length,restoreAfterEachRecipe:true},storageKey:'wordward-glyph-save-v1',practice:'Ordered tracing against authored stroke paths/medians; not arbitrary handwriting recognition. Watching a demonstration does not record a completed practice.',speech:'Browser/OS speech synthesis with Chinese voice selection and visible pinyin; voice availability depends on the device. No server speech service.',source:data.source,assets:Object.fromEntries(assets.map(file=>[file,hash('dist/'+file)])),levelsAndWords:LEVELS.map(l=>({level:l.id,title:l.title,family:l.family,targets:l.targets,extras:l.extras,pool:l.pool})),validation:'Complete deterministic engine traversal, all 625 reference strokes, 328 rule tests, Chromium/WebKit four viewports with actual 20-level browser play, 11 pointer-drawn strokes, demo/reset, dragging, storage isolation and failure/retry handling. Simulated standalone viewport is not a physical iPhone test.'};
assert.equal(report.levels,20);assert.equal(report.discoverableCharacters,76);assert.equal(report.strokeCount,625);assert.equal(report.fullCampaign.discovered,76);
if(process.argv.includes('--write'))writeFileSync(new URL('../docs/reports/glyph-mode.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,assets:undefined,levelsAndWords:undefined},null,2));
