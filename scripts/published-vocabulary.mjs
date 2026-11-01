import {readFileSync} from 'node:fs';
import {WORDS} from '../dist/engine.mjs';

// Reconstruct the exact pre-review catalog for historical profile-hash checks.
// Active recipes and saved-only retirements are audited separately by the new
// vocabulary audit; this never reintroduces a retired word into gameplay.
const archive=JSON.parse(readFileSync(new URL('../data/retired-word-profiles.json',import.meta.url)));
const review=JSON.parse(readFileSync(new URL('../data/vocabulary-review.json',import.meta.url)));
export const addedCorrections=new Set(review.addedHeadwords);
export function publishedVocabulary(){
 const old=WORDS.filter(w=>!addedCorrections.has(w.word));
 for(const entry of archive.profiles)old.splice(entry.index,0,entry.profile);
 return old;
}
