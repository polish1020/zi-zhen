import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {WORDS,getWord,getTowerWord,matchWord,wordCategory,wordLearning} from '../dist/engine.mjs';
import {IDIOM_PROFILES,REVIEWED_IDIOMS} from '../dist/specials.mjs';
import {COMMON_WORDS,IDIOM_WORDS,SKILL_SCHOOLS,WORD_DEFINITIONS,WORD_REVIEW} from '../dist/lexicon.mjs';
import {publishedVocabulary} from './published-vocabulary.mjs';

const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url)));
export function auditVocabulary(){
 const review=read('vocabulary-review.json'),archive=read('retired-word-profiles.json');
 const old=publishedVocabulary(),before=new Map(old.map(w=>[w.word,w])),active=new Set(WORDS.map(w=>w.word));
 const hash=value=>createHash('sha256').update(value).digest('hex');
 assert.equal(old.length,120772);
 assert.equal(hash(JSON.stringify(old.map(w=>({word:w.word,hash:hash(JSON.stringify(w))})))),review.baselineProfilesHash,'A published combat profile changed');
 assert.equal(active.size,WORDS.length);
 const surviving=old.filter(w=>!WORD_REVIEW[w.word]);
 for(const w of surviving)assert.deepEqual(getWord(w.word),w,`Unexpected combat change: ${w.word}`);
 for(const w of WORDS)assert.ok(w.tier>=1&&w.tier<=4&&/^[\u4e00-\u9fff]+$/.test(w.word),w.word);
 for(const [word,entry]of Object.entries(WORD_REVIEW)){
  assert.ok(!active.has(word)&&!COMMON_WORDS.includes(word)&&!IDIOM_WORDS.includes(word),word);
  assert.equal(getWord(word),undefined,word);assert.equal(matchWord([...word]),null,word);
  assert.equal(wordCategory(word),'legacy',word);assert.ok(!IDIOM_PROFILES[word],word);
  assert.deepEqual(getTowerWord(word),before.get(word),`Saved-only profile changed: ${word}`);
  assert.ok(wordLearning(word)?.meaning,word);
  if(entry.replacement){assert.ok(getWord(entry.replacement),word);assert.ok(wordLearning(entry.replacement)?.meaning,word);}
 }
 const idioms=WORDS.filter(w=>wordCategory(w.word)==='idiom');
 for(const w of idioms){assert.ok(wordLearning(w.word)?.meaning,w.word);assert.notEqual(w.type,'basic',w.word);}
 for(const word of REVIEWED_IDIOMS){assert.ok(getWord(word),word);assert.ok(WORD_DEFINITIONS[word]||review.idiomAllowlist[word]||wordLearning(word)?.kind==='idiom',word);}
 for(const word of Object.keys(SKILL_SCHOOLS)){assert.ok(active.has(word),word);assert.equal(getWord(word).type,before.get(word).type,word);}
 for(const word of review.preserveExamples)assert.ok(getWord(word),word);
 const labelChanges=old.filter(w=>active.has(w.word)&&review.previousConfirmed.includes(w.word)&&wordCategory(w.word)!=='idiom').map(w=>w.word);
 const report={date:review.date,baselineCommit:review.baselineCommit,method:'Complete structural/headword scan, one-character near-match screening and focused review of clear spelling errors. Not a claim that all words were individually verified by a lexicographer.',scannedPublishedWords:old.length,currentWords:WORDS.length,retired:Object.keys(WORD_REVIEW).length,spellingCorrections:Object.values(WORD_REVIEW).filter(x=>x.reason==='spelling').length,retiredFragments:Object.values(WORD_REVIEW).filter(x=>x.reason==='fragment').length,newCorrectHeadwords:review.addedHeadwords,unchangedSurvivingCombatProfiles:surviving.length,archivedExactCombatProfiles:archive.profiles.length,allPublishedCombatProfilesHash:hash(JSON.stringify(old.map(w=>({word:w.word,hash:hash(JSON.stringify(w))})))),confirmedIdioms:idioms.length,confirmedIdiomsMissingMeaning:idioms.filter(w=>!wordLearning(w.word)).length,licensedFallbackDefinitions:Object.keys(WORD_DEFINITIONS).length,previouslyMissingIdiomMeanings:review.previousMissingMeanings.filter(w=>active.has(w)&&wordCategory(w)==='idiom'&&wordLearning(w)).length,conservativeLabelChanges:labelChanges.length,stillPlayableUnverifiedPhrases:read('idiom-review.json').vocabularyReview.unverifiedPlayablePhrases,skillRecipesPreserved:Object.keys(SKILL_SCHOOLS).length,sourceTaggedCandidates:IDIOM_WORDS.length,sourceTagsAreNotIdiomProof:true,absenceFromOneReferenceIsNotRejection:true,labelChanges,corrections:WORD_REVIEW,sources:review.sources};
 return report;
}
if(process.argv[1]===new URL(import.meta.url).pathname){const report=auditVocabulary();if(process.argv.includes('--write'))writeFileSync(new URL('../docs/reports/vocabulary-review.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,labelChanges:undefined,corrections:undefined,sources:undefined},null,2));}
