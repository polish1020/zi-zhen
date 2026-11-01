import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game,WORDS,getWord,getTowerWord,matchWord,wordCategory,wordLearning,towerStats,towerDefense,HINT_COST} from '../dist/engine.mjs';
import {WORD_REVIEW,RETIRED_WORD_PROFILES} from '../dist/lexicon.mjs';
import {auditVocabulary} from '../scripts/audit-vocabulary-review.mjs';

function stock(g,word){g.hand=[...word.padEnd(16,'麒')].map(ch=>({id:++g.handSerial,ch,used:false}));}
function retiredSave(word){const g=new Game(0,42),w=getTowerWord(word);g.ink=1000;stock(g,word);g.hand.slice(0,w.tier).forEach(t=>t.used=true);g.towers=[{word,pad:2,id:g.nextId++,level:w.tier,spent:w.cost,cooldown:.75,hp:towerDefense({word,level:w.tier}).maxHp*.37,repairReadyAt:0,rebuilds:1}];return g.export();}

test('complete catalog review preserves combat budgets and requires every confirmed idiom to have an explanation',()=>{
 const audit=auditVocabulary();assert.equal(audit.scannedPublishedWords,120772);assert.equal(audit.retired,290);assert.equal(audit.spellingCorrections,236);assert.equal(audit.retiredFragments,54);assert.equal(audit.confirmedIdiomsMissingMeaning,0);assert.equal(audit.unchangedSurvivingCombatProfiles,120482);assert.equal(audit.skillRecipesPreserved,23185);
});
test('every retired spelling/fragment is rejected without consuming tiles or ink, and never returned by hints',()=>{
 for(const word of Object.keys(WORD_REVIEW)){
  const g=new Game(0,42);g.ink=1000;stock(g,word);const hand=structuredClone(g.hand);
  assert.equal(getWord(word),undefined,word);assert.equal(matchWord([...word]),null,word);assert.equal(g.canBuild(word),false,word);assert.equal(g.build(word,2),false,word);assert.equal(g.ink,1000);assert.deepEqual(g.hand,hand);
  assert.ok(g.availableWords().every(w=>!WORD_REVIEW[w.word]),word);const hint=g.requestHint();if(hint)assert.ok(!WORD_REVIEW[hint.word],word);
 }
});
test('corrected examples forge in exact order with their own meanings and real effects',()=>{
 for(const word of ['血流漂杵','三顾茅庐','谈笑风生','金榜题名','迫不及待','九霄云外','饮鸩止渴','一张一弛']){
  const g=new Game(0,42);g.ink=1000;stock(g,word);const ids=g.tilesFor(word);assert.equal(g.build(word,2,ids.slice().reverse()),false);assert.ok(g.build(word,2),word);assert.equal(g.ink,1000-getWord(word).cost);assert.equal(g.hand.filter(t=>t.used).length,4);assert.equal(wordCategory(word),'idiom');assert.ok(wordLearning(word)?.meaning);assert.deepEqual(Game.restore(g.export()).towers,g.towers);
 }
 assert.match(wordLearning('血流漂杵').meaning,/战况惨烈/);assert.equal(getWord('血流漂杵').special,'sweep');
});
test('all already-built retired towers retain exact damage, injury, investment and consumed tiles through repeated reloads',()=>{
 for(const w of RETIRED_WORD_PROFILES){
  const save=retiredSave(w.word),g=Game.restore(save),t=g.towers[0];assert.equal(t.word,w.word);assert.deepEqual(towerStats(t),towerStats(save.towers[0]));assert.equal(t.hp,save.towers[0].hp);assert.equal(t.spent,w.cost);assert.equal(g.ink,save.ink);assert.deepEqual(g.hand,save.hand);assert.match(wordLearning(t.word).meaning,/旧/);assert.deepEqual(Game.restore(g.export()).export(),g.export());
 }
 const g=Game.restore(retiredSave('血流成杵'));g.phase='battle';g.wave=1;g.pendingWaves=[1];const e=g.spawn('normal',330);e.hp=e.maxHp=100000;g.towers[0].cooldown=0;g.attack(g.towers[0],.01);assert.ok(e.hp<100000);assert.ok(g.effects.length);
});
test('retired paid hints refund the last purchase exactly once while normal hints and invalid-save checks remain intact',()=>{
 const g=new Game(0,42);stock(g,'血流成杵');g.ink=37;g.hintUses=3;g.hintWord='血流成杵';const restored=Game.restore(g.export());assert.equal(restored.hintWord,null);assert.equal(restored.ink,37+HINT_COST*3);assert.equal(restored.hintUses,2);assert.equal(restored.hintCost(),HINT_COST*3);assert.equal(Game.restore(restored.export()).ink,restored.ink);
 const normal=new Game(0,42);stock(normal,'寒冰符咒');normal.hintUses=2;normal.hintWord='寒冰符咒';assert.equal(Game.restore(normal.export()).requestHint().cost,0);
 const bad=g.export();bad.hintWord='桌子之力';assert.throws(()=>Game.restore(bad));
});
test('unverified ordinary phrases and legitimate near matches stay playable without being automatically rewritten',()=>{
 for(const word of ['四合院','文房四宝','三十六计','两厢情愿','人尽其材','不厌其烦','不胜其烦','三顾之请','不分首从','各行其事','风雷火炮'])assert.ok(getWord(word),word);
 for(const word of ['共同奋斗','一举三得','一石多鸟','桃李天下']){assert.ok(getWord(word));assert.equal(wordCategory(word),'phrase',word);}
 const review=JSON.parse(readFileSync(new URL('../data/vocabulary-review.json',import.meta.url)));assert.equal(review.policy.referenceAbsenceIsNotError,true);assert.equal(WORDS.some(w=>WORD_REVIEW[w.word]),false);
});
