import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game,WORDS,getWord,wordCategory,wordLearning,towerDefense,towerStats,IDIOM_MOVES} from '../dist/engine.mjs';
import {IDIOM_PROFILES,REVIEWED_IDIOMS,IDIOM_EXCLUSIONS,SPECIAL_WORDS} from '../dist/specials.mjs';

const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const fixture=name=>JSON.parse(readFileSync(new URL('./fixtures/'+name,import.meta.url)));
function add(g,word,pad){g.hand=[...word.padEnd(16,'火')].map(ch=>({id:++g.handSerial,ch,used:false}));assert.ok(g.build(word,pad),word);return g.towers.at(-1);}
function arena(move,word){
 const w=word?getWord(word):(WORDS.find(w=>w.idiomMove===move&&w.type==='learning')||WORDS.find(w=>w.idiomMove===move)),g=new Game(0,42);assert.ok(w,move);
 g.ink=10000;const t=add(g,w.word,2);g.phase='battle';g.wave=1;g.pendingWaves=[1];g.time=10;
 return{g,t,w};
}
function enemy(g,d=330,kind='normal'){const e=g.spawn(kind,d);e.hp=e.maxHp=100000;e.speed=.1;return e;}
function fire(g,t){t.cooldown=0;g.attack(t,.01);}
function charge(g,t){for(let i=0;i<4;i++)fire(g,t);}

test('every recognized four-character idiom has a non-ordinary attribute and an executable semantic move',()=>{
 const idioms=WORDS.filter(w=>wordCategory(w.word)==='idiom');assert.ok(idioms.length>14000);
 for(const w of idioms){assert.equal(w.tier,4);assert.notEqual(w.type,'basic',w.word);assert.ok(IDIOM_MOVES[w.idiomMove],w.word);}
 for(const[word,p]of Object.entries(IDIOM_PROFILES)){const w=getWord(word);assert.ok(w,word);assert.notEqual(w.type,'basic',word);assert.equal(w.type,p.type);assert.equal(w.idiomMove,p.move);if(p.type==='learning')assert.equal(w.special,p.special);}
 assert.equal(new Set(REVIEWED_IDIOMS).size,REVIEWED_IDIOMS.length);assert.equal(new Set(WORDS.map(w=>w.word)).size,WORDS.length);
 assert.ok(!getWord(''));for(const word of ['默认设置','魔兽争霸','一举手一']){assert.ok(IDIOM_EXCLUSIONS.includes(word));assert.equal(wordCategory(word),'phrase');assert.ok(getWord(word));}
});
test('literal elements and figurative meanings separate without using a single fire, ice or gold character',()=>{
 for(const[word,type,move]of [['冰天雪地','slow','frost'],['百发百中','sniper','precision'],['毒蛇猛兽','poison','toxic'],['刀光剑影','pierce','encircle'],['财源广进','income','bounty'],['冰清玉洁','learning','purity'],['火上浇油','learning','aggravate'],['金玉良言','learning','succession'],['薪火相传','learning','succession'],['一丘之貉','learning','conspire']]){assert.equal(getWord(word).type,type,word);assert.equal(getWord(word).idiomMove,move,word);}
 assert.match(wordLearning('七月流火').meaning,/转凉/);assert.match(wordLearning('首当其冲').meaning,/最先/);assert.equal(wordCategory('星光灿烂'),'phrase');
 for(const word of ['伤化败俗','伤教败俗','歪风邪气','风土人情','人非木石','如雷贯耳','从善如流','一廉如水'])assert.equal(getWord(word).type,'learning',word+' must follow its figurative meaning, not an elemental word in the explanation');
});
test('v7 panels retain damage, interval and cost; only explicit ranged coverage receives the new floor',()=>{
 const frozen=fixture('idiom-panel-v7.json');assert.ok(frozen.length>100);
 for(const old of frozen){const w=getWord(old.word);if(old.word==='一廉如水'){assert.equal(w.type,'learning');assert.equal(w.special,'purity');continue;}for(const k of ['type','tier','damage','range','rate','cost'])assert.equal(w[k],k==='range'&&w.trait==='ranged'?Math.max(263,old.range-(w.runes.includes('sky')?12:0))+(w.runes.includes('sky')?12:0):old[k],old.word+' '+k);assert.deepEqual(w.runes,old.runes,old.word);}
});
test('all semantic abilities charge from four actual attacks, enforce cooldown and preserve charge through save',()=>{
 assert.equal(Object.keys(IDIOM_MOVES).length,39);
 for(const move of Object.keys(IDIOM_MOVES)){
  const{g,t}=arena(move);for(let i=0;i<7;i++)enemy(g,320+i*3);const a=add(g,'火球',4),b=add(g,'文',1);a.hp=b.hp=50;
  for(let i=0;i<3;i++)fire(g,t);assert.equal(t.idiomCasts,undefined,move);assert.equal(t.idiomCharge,3);
  const saved=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.equal(saved.towers[0].idiomCharge,3);
  fire(g,t);assert.equal(t.idiomCasts,1,move);assert.equal(t.idiomCharge,0);assert.equal(t.idiomReadyAt,10+IDIOM_MOVES[move].cooldown);assert.ok(g.effects.some(f=>f.kind==='idiom'&&f.move===move));
  charge(g,t);assert.equal(t.idiomCasts,1);assert.equal(t.idiomCharge,4);g.time=t.idiomReadyAt;fire(g,t);assert.equal(t.idiomCasts,2,move);assert.equal(t.idiomCharge,0);
  const restored=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.equal(restored.towers[0].idiomReadyAt,t.idiomReadyAt);assert.equal(restored.towers[0].idiomCasts,2);
 }
});
test('group burst adds exactly four bounded hits while a single-target move concentrates on one enemy',()=>{
 for(const[move,coefficient,count]of [['encircle',2,4],['precision',3,1],['canon',.6,3]]){
  const{g,t,w}=arena(move),runes=w.runes,special=w.special;w.runes=[];w.special=undefined;
  try{for(let i=0;i<8;i++)enemy(g,320+i*3);const snapshots=g.enemies.map(e=>e.hp);for(let i=0;i<3;i++)fire(g,t);const before=g.enemies.map(e=>e.hp);fire(g,t);const deltas=g.enemies.map((e,i)=>before[i]-e.hp);assert.equal(deltas.filter(d=>d>0).length,count,move);close(deltas.at(-1),w.damage*(1+(move==='canon'?1.4:coefficient)));for(const d of deltas.slice(0,-1).filter(d=>d>0))close(d,w.damage*coefficient);}
  finally{w.runes=runes;w.special=special;}
 }
});
test('poison burst reaches five in-range targets, really ticks and never weakens existing stronger poison',()=>{
 const{g,t,w}=arena('toxic','毒蛇猛兽');for(let i=0;i<8;i++)enemy(g,320+i*3);const far=enemy(g,20);g.enemies[3].poisonDps=w.damage*2;g.enemies[3].poisonUntil=20;
 charge(g,t);assert.equal(far.poisonUntil,undefined);assert.ok(g.enemies.filter(e=>e.poisonUntil>g.time).length<=6);assert.ok(g.enemies.filter(e=>e.healBlockUntil>g.time).length===5);assert.equal(g.enemies[3].poisonDps,w.damage*2);
 const e=g.enemies.find(e=>e.poisonUntil>g.time&&e!==g.enemies[3]),before=e.hp,power=e.poisonDps;g.towers=[];g.updateEnemies(.1);close(before-e.hp,power*.1);
});
test('healing and shielding protect actual towers, respect shared cooldowns and cannot resurrect or heal hearts',()=>{
 const{g,t}=arena('healing'),a=add(g,'火球',4),b=add(g,'文',1);for(const x of[a,b])x.hp=towerDefense(x).maxHp*.2;g.hp=7;enemy(g);charge(g,t);
 for(const x of[a,b]){assert.ok(x.hp>towerDefense(x).maxHp*.2);assert.ok(x.lessonShield>0);assert.ok(x.lessonShield<=towerDefense(x).maxHp*.1);}
 assert.equal(g.hp,7);const hp=a.hp;const{word}=WORDS.find(w=>w.idiomMove==='healing'&&w.word!==t.word),other=add(g,word,0);other.pad=3;other.pad=2;t.pad=0;charge(g,other);assert.equal(a.hp,hp);
 a.hp=0;g.time=20;charge(g,t);assert.equal(a.hp,0);assert.equal(g.hp,7);
});
test('purification clears real corrosion, chill and seal from eligible allies',()=>{
 const{g,t}=arena('purity','冰清玉洁'),a=add(g,'火球',4);a.corrodedUntil=a.chillUntil=a.disruptedUntil=30;t.corrodedUntil=t.chillUntil=30;enemy(g);charge(g,t);
 for(const x of[t,a])for(const field of ['corrodedUntil','chillUntil','disruptedUntil'])assert.equal(x[field]||0,0);
});
test('teaching empowers the lower-level ally once, strongest-value only, and refuses recursive empowerment',()=>{
 const{g,t}=arena('succession','一代宗师'),a=add(g,'文',1),e=enemy(g);charge(g,t);assert.equal(a.idiomPower,.45);assert.equal(a.idiomPowerUntil,13);
 const before=e.hp;fire(g,a);close(before-e.hp,towerStats(a).damage*1.45);assert.equal(a.idiomPowerUntil,0);
 const next=e.hp;fire(g,a);close(next-e.hp,towerStats(a).damage);
 const h=arena('succession','一代宗师'),b=add(h.g,'文',1);enemy(h.g);for(let i=0;i<3;i++)fire(h.g,h.t);h.t.lessonPowerUntil=13;fire(h.g,h.t);assert.equal(b.idiomPowerUntil,undefined);
});
test('a mirage guard reduces only the next incoming hit and does not grant permanent immunity',()=>{
 const{g,t}=arena('mirage','金蝉脱壳'),e=enemy(g);charge(g,t);const first=g.damageTower(t,10,e),second=g.damageTower(t,10,e);close(first,second*.65);assert.equal(t.idiomGuardUntil,0);
});
test('the four seasons produce distinct real effects and retain their sequence across reload',()=>{
 const{g,t}=arena('seasons','七月流火'),a=add(g,'火球',4);a.hp=50;const e=enemy(g);const glyphs=[];
 for(let i=0;i<4;i++){g.time=10+i*9;charge(g,t);glyphs.push(g.effects.filter(f=>f.kind==='idiom').at(-1).glyph);if(i===0)assert.ok(a.hp>50);if(i===1)assert.ok(e.burnUntil>g.time);if(i===2){assert.equal(e.bounty,2);assert.ok(e.bountyUntil>g.time);}if(i===3)assert.ok(e.slowUntil>g.time);}
 assert.deepEqual(glyphs,['春','夏','秋','冬']);const h=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.equal(h.towers[0].idiomCasts,4);h.time+=9;charge(h,h.towers[0]);assert.equal(h.effects.filter(f=>f.kind==='idiom').at(-1).glyph,'春');
});
test('frozen v7 saves migrate ordinary, element and learning towers without losing paid investment or injury ratio',()=>{
 for(const f of fixture('idiom-v7.json')){const g=Game.restore(f.data),t=g.towers[0];close(t.hp/towerDefense(t).maxHp,.37);assert.equal(t.spent,f.data.towers[0].spent);assert.equal(t.level,f.data.towers[0].level);assert.equal(g.hp,f.data.hp);assert.equal(g.ink,f.data.ink);assert.deepEqual(g.hand,f.data.hand);assert.equal(g.export().version,9);const h=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.equal(h.towers[0].hp,t.hp);}
});
test('v6 literal weapon and elemental corrections retain their historical durability rather than the older raw dictionary type',()=>{
 for(const f of fixture('idiom-v6-literals.json')){const g=Game.restore(f.data),t=g.towers[0];close(t.hp/towerDefense(t).maxHp,.37);assert.equal(t.spent,f.data.towers[0].spent);assert.equal(t.level,f.data.towers[0].level);}
});
test('old received shields use their historical maximum durability and convert safely to the new attribute',()=>{
 for(const f of fixture('idiom-v7.json')){const old=structuredClone(f.data);old.towers[0].lessonShield=f.maxHp*.1;old.towers[0].lessonShieldUntil=10;const h=Game.restore(old),t=h.towers[0];close(t.lessonShield,towerDefense(t).maxHp*.1);}
});
test('future versions, invalid charges and oversized empowerment are rejected while ruins never cast',()=>{
 const{g,t}=arena('canon');enemy(g);const base=g.export();for(const[key,value]of[['idiomCharge',5],['idiomPower',.46],['idiomReadyAt',NaN],['idiomCasts',-1]]){const bad=structuredClone(base);bad.towers[0][key]=value;assert.throws(()=>Game.restore(bad),key);}assert.throws(()=>Game.restore({...base,version:10}));t.hp=0;charge(g,t);assert.equal(t.idiomCasts,undefined);
});
test('machine volleys retarget after a kill and never generate additional charge for their extra bolts',()=>{
 const{g,t,w}=arena('barrage','游刃有余'),a=enemy(g,336),b=enemy(g,333);a.hp=w.damage*.5;t.idiomCharge=3;const hits=[];
 g.idiomAttack(t,w,a,[a,b],(e,m)=>{hits.push(e.id);e.hp-=w.damage*m;},()=>{},w.damage,4,false);
 assert.deepEqual(hits,[a.id,b.id,b.id,b.id]);assert.equal(t.idiomCharge,0);assert.equal(t.idiomCasts,1);
});
test('armor erosion requires repeated attacks on the actual surviving target, not a target killed by the preceding shot',()=>{
 const{g,t,w}=arena('erosion','滴水穿石'),a=enemy(g,336),b=enemy(g,333);t.idiomCharge=3;t.lessonTarget=a.id;t.lessonStreak=3;
 g.idiomAttack(t,w,a,[a,b],()=>{},()=>{},w.damage,4,false);assert.equal(a.breakUntil,g.time+1.5);
 g.time=(t.idiomReadyAt||g.time)+1;t.idiomCharge=3;a.hp=0;const multipliers=[];g.idiomAttack(t,w,a,[a,b],(e,m)=>multipliers.push(m),()=>{},w.damage,8,false);
 assert.equal(b.breakUntil,undefined);assert.deepEqual(multipliers,[1.8]);
});
test('accumulation grows the ability rather than its panel and caps both its damage bonus and shield',()=>{
 const{g,t,w}=arena('growth','日积月累'),e=enemy(g),damage=w.damage,multipliers=[];
 for(const shot of[8,40,80]){t.idiomCharge=3;g.idiomAttack(t,w,e,[e],(_,m)=>multipliers.push(m),()=>{},damage,shot,false);g.time=(t.idiomReadyAt||g.time)+1;}
 close(multipliers[0],1.9);close(multipliers[1],3.1);close(multipliers[2],3.1);assert.equal(w.damage,damage);close(t.lessonShield,towerDefense(t).maxHp*.1);
});
test('new weakness marks take the strongest value and never shorten a longer existing mark',()=>{
 for(const move of ['judgment','insight']){const{g,t,w}=arena(move),a=enemy(g,336),b=enemy(g,333);a.markPower=.3;a.markUntil=30;t.idiomCharge=3;
  g.idiomAttack(t,w,a,[a,b],()=>{},()=>{},w.damage,4,false);assert.equal(a.markPower,.3);assert.equal(a.markUntil,30);close(b.markPower,move==='judgment'?.2:.1);assert.ok(b.markUntil>g.time);
 }
});
test('cultural diversity counts distinct living in-range ally attributes, with a four-type limit',()=>{
 const{g,t,w}=arena('festival','八仙过海'),a=enemy(g,336),b=enemy(g,333),c=enemy(g,330);const formations=[['火球',1],['寒冰箭',3],['毒云',4],['弓箭',5],['学习',6]];
 for(const[word,pad]of formations)add(g,word,pad);t.idiomCharge=3;const hits=[];g.idiomAttack(t,w,a,[a,b,c],(_,m)=>hits.push(m),()=>{},w.damage,4,false);
 close(hits[0],3);close(hits[1],1.4);close(hits[2],1.4);
 g.time=(t.idiomReadyAt||g.time)+1;g.towers.find(x=>x.pad===5).hp=0;t.idiomCharge=3;const next=[];g.idiomAttack(t,w,a,[a,b,c],(_,m)=>next.push(m),()=>{},w.damage,8,false);close(next[0],2.7);
});
test('autumn bounties pay actual kills and share the existing global income limit',()=>{
 const{g,t}=arena('seasons','七月流火'),a=enemy(g,336);enemy(g,333);t.idiomCasts=2;t.idiomCharge=3;fire(g,t);assert.equal(a.bounty,2);a.hp=0;g.step(.01);assert.equal(g.bountyEarned,2);
});
test('borrowed protection visibly stores one empowered counterattack after an actual incoming hit',()=>{
 const{g,t,w}=arena('borrow','草船借箭'),e=enemy(g);charge(g,t);assert.ok(t.idiomGuardUntil>g.time);const received=g.damageTower(t,10,e);close(received,6.5);assert.equal(t.idiomPower,.45);
 const before=e.hp;fire(g,t);close(before-e.hp,w.damage*1.45*1.25);assert.equal(t.idiomPowerUntil,0);assert.equal(t.lessonStored,false);
 const next=e.hp;fire(g,t);close(next-e.hp,w.damage);assert.equal(t.idiomGuardUntil,0);
});
