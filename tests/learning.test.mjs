import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,WORDS,getWord,wordLearning,towerDefense,towerStats,SPECIAL_EFFECTS,traitEffect,gradeEffect,runeLimit,enemyLength,enemyPosition} from '../dist/engine.mjs';
import {WORD_LEARNING} from '../dist/lexicon.mjs';
import {SPECIAL_WORDS,SPECIAL_GROUPS} from '../dist/specials.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function add(g,word,pad=0){g.hand=[...word.padEnd(16,'文')].map(ch=>({id:++g.handSerial,ch,used:false}));assert.ok(g.build(word,pad));return g.towers.at(-1);}
function arena(word){const g=new Game(0,42);g.ink=10000;const t=add(g,word);g.phase='battle';g.wave=1;g.pendingWaves=[1];g.time=10;return{g,t,w:getWord(word)};}
function enemy(g,kind='normal',d=130){const e=g.spawn(kind,d);e.hp=e.maxHp=100000;e.speed=.1;return e;}
function fire(g,t,shot){if(shot!==undefined)t.shots=shot-1;t.cooldown=0;g.attack(t,.01);}
function isolated(word,run){const w=getWord(word),runes=w.runes;w.runes=[];try{return run(arena(word));}finally{w.runes=runes;}}
test('all 736 lessons including 480 idioms and ordinary cultural words are learning, with unambiguous complete-word mappings',()=>{
 assert.equal(Object.keys(WORD_LEARNING).length,736);assert.equal(Object.values(WORD_LEARNING).filter(l=>l.kind==='idiom').length,480);
 assert.equal(Object.keys(SPECIAL_EFFECTS).length,43);assert.ok(WORDS.filter(w=>w.special).length>=1300);
 const spellings=Object.values(SPECIAL_GROUPS).flatMap(s=>s.split(/\s+/));assert.equal(new Set(spellings).size,spellings.length);
 for(const word of Object.keys(WORD_LEARNING)){const w=getWord(word);assert.equal(w.type,'learning',word);assert.equal(w.icon,'学');assert.ok(SPECIAL_EFFECTS[w.special]);assert.ok(traitEffect(w).length>25);assert.ok(wordLearning(word).meaning);}
 for(const [word,id]of Object.entries(SPECIAL_WORDS)){const w=getWord(word);assert.ok(w&&w.special===id,word);assert.ok(w.tier<=4);assert.ok(w.runes.length<=runeLimit(w.tier));assert.match(gradeEffect(w),/核心效果/);}
 assert.equal(getWord('你好').icon,'普');assert.equal(getWord('文').type,'basic');assert.equal(getWord('学').icon,'普');assert.equal(getWord('寒冰箭').type,'slow');assert.equal(getWord('寒冰箭').trait,'ranged');
});
test('figurative idioms and misleading everyday characters no longer pick literal elemental powers',()=>{
 for(const [word,id]of [['金蝉脱壳','escape'],['背水一战','resolve'],['画龙点睛','radiance'],['三顾茅庐','visit'],['豆腐','mend'],['金鱼','renew'],['银河','far'],['土豆','fortune'],['水牛','bulwark'],['金文','growth'],['发明','adapt']])assert.equal(getWord(word).special,id,word);
 for(const [word,type]of [['流星锤','heavy'],['毒镖','poison'],['熔岩','splash'],['岩浆','splash']])assert.equal(getWord(word).type,type,word);
 assert.ok(!getWord('三顾茅庐').runes.includes('thorn'));assert.ok(!getWord('金蝉脱壳').runes.includes('prosper'));assert.ok(!getWord('画龙点睛').runes.includes('brood'));
});
test('three visits are three budgeted hits and invite one actual ally without recursive cooperation',()=>isolated('三顾茅庐',({g,t,w})=>{
 const a=add(g,'三顾茅庐',1),e=enemy(g);fire(g,t,3);near(e.maxHp-e.hp,w.damage*1.2);assert.equal(g.effects.filter(f=>f.kind==='bolt').length,3);assert.equal(a.lessonPowerUntil,13);
 const hp=e.hp;fire(g,a,3);assert.ok(hp-e.hp>w.damage*1.2);assert.equal(t.lessonPowerUntil,undefined);assert.equal(a.lessonPowerUntil,0);
}));
test('focus and erosion build only against one target and reset upon a real target switch',()=>{
 for(const word of ['一心一意','水滴石穿'])isolated(word,({g,t})=>{const e=enemy(g,'armor');fire(g,t);const first=e.maxHp-e.hp;const hp=e.hp;fire(g,t);assert.ok(hp-e.hp>first);const other=enemy(g,'armor',150);fire(g,t);near(other.maxHp-other.hp,first);assert.equal(t.lessonStreak,0);});
});
test('accumulation and stored bursts have bounded, saved progress rather than flat identical stats',()=>{
 isolated('日积月累',({g,t})=>{const e=enemy(g);fire(g,t,1);const first=e.maxHp-e.hp;const hp=e.hp;fire(g,t,41);near(hp-e.hp,first*1.2);const h=Game.restore(g.export());assert.equal(h.towers[0].shots,41);});
 isolated('厚积薄发',({g,t,w})=>{const e=enemy(g);fire(g,t,1);near(e.maxHp-e.hp,w.damage*.85);const hp=e.hp;fire(g,t,4);near(hp-e.hp,w.damage*1.7);});
 isolated('揠苗助长',({g,t,w})=>{const e=enemy(g);fire(g,t,4);near(e.maxHp-e.hp,w.damage*1.65);near(t.cooldown,w.rate*1.4);});
});
test('multi-target families respect their target caps, area and single-target tradeoffs',()=>{
 for(const [word,shot,count]of [['一箭双雕',1,2],['三头六臂',1,3],['四面八方',1,4],['余音绕梁',1,2],['举一反三',4,3],['百花齐放',1,3],['电闪雷鸣',1,3]])isolated(word,({g,t})=>{for(let i=0;i<8;i++)enemy(g,'normal',130+i*4);fire(g,t,shot);assert.equal(g.enemies.filter(e=>e.hp<e.maxHp).length,count,word);});
 isolated('一箭双雕',({g,t,w})=>{const e=enemy(g);fire(g,t);near(e.maxHp-e.hp,w.damage*.75);});
 isolated('百花齐放',({g,t})=>{const e=enemy(g,'normal',200),far=enemy(g,'normal',50);fire(g,t);assert.ok(e.hp<e.maxHp);assert.equal(far.hp,far.maxHp);});
});
test('cooperation, encouragement and point-the-eye benefit eligible allies, never dead or out-of-range towers',()=>{
 for(const [word,shot,field]of [['齐心协力',3,'lessonPowerUntil'],['欢欣鼓舞',4,'lessonHasteUntil'],['画龙点睛',4,'lessonPowerUntil'],['琴瑟和鸣',4,'lessonPowerUntil']])isolated(word,({g,t})=>{const a=add(g,'火球',1),ruin=add(g,'火球',2),far=add(g,'火球',9);ruin.hp=0;enemy(g);fire(g,t,shot);assert.ok(a[field]>g.time,word);assert.equal(ruin[field],undefined);assert.equal(far[field],undefined);if(word==='画龙点睛')assert.ok(g.enemies[0].markPower>=.08);});
});
test('healing and shields repair tower durability only, with recipient cooldowns and no shield stacking',()=>{
 for(const word of ['亡羊补牢','雪中送炭','围魏救赵'])isolated(word,({g,t})=>{const a=add(g,'火球',1),max=towerDefense(a).maxHp;a.hp=max*.3;g.hp=8;enemy(g);fire(g,t,4);near(a.hp,max*.32);fire(g,t,8);near(a.hp,max*.32);assert.equal(g.hp,8);a.hp=0;g.time+=7;fire(g,t,12);assert.equal(a.hp,0);});
 isolated('众志成城',({g,t})=>{const a=add(g,'火球',1),e=enemy(g),max=towerDefense(a).maxHp;fire(g,t,4);near(a.lessonShield,max*.05);fire(g,t,8);near(a.lessonShield,max*.05);const hp=a.hp;const dealt=g.damageTower(a,max*.04,e);assert.equal(dealt,0);assert.equal(a.hp,hp);near(a.lessonShield,max*.01);g.time=15;assert.ok(g.damageTower(a,5,e)>0);});
 isolated('春回大地',({g,t})=>{const max=towerDefense(t).maxHp;t.hp=max*.5;g.hp=5;enemy(g);fire(g,t,8);near(t.hp,max*.52);fire(g,t,16);near(t.hp,max*.52);assert.equal(g.hp,5);});
});
test('last stands, substitutes, decoys and borrowed strength create real siege interactions',()=>{
 isolated('背水一战',({g,t,w})=>{const e=enemy(g);t.hp=towerDefense(t).maxHp*.3;fire(g,t);near(e.maxHp-e.hp,w.damage*1.25);near(t.cooldown,w.rate*.9);});
 for(const [word,ratio,factor]of [['金蝉脱壳',.3,.4],['声东击西',1,.65]])isolated(word,({g,t})=>{const e=enemy(g);t.hp=towerDefense(t).maxHp*ratio;const first=g.damageTower(t,10,e),next=g.damageTower(t,10,e);near(first,next*factor);assert.ok(t.lessonDefenseReady>g.time);});
 isolated('草船借箭',({g,t,w})=>{const e=enemy(g);g.damageTower(t,10,e);assert.equal(t.lessonStored,true);fire(g,t);near(e.maxHp-e.hp,w.damage*1.25);assert.equal(t.lessonStored,false);const hp=e.hp;fire(g,t);near(hp-e.hp,w.damage);});
});
test('precision reveals stealth before the hit, targets bosses and ignores part of armor',()=>isolated('百发百中',({g,t,w})=>{
 const e=enemy(g,'armor');fire(g,t);near(e.maxHp-e.hp,w.damage*.85);assert.ok(e.lightUntil>g.time);const b=enemy(g,'boss',120);fire(g,t);assert.ok(b.hp<b.maxHp);
}));
test('control families use shared immunity intervals and do not delay boss power',()=>{
 for(const [word,shot,field]of [['冰天雪地',4,'freezeUntil'],['枝繁叶茂',3,'freezeUntil'],['鸦雀无声',4,'silencedUntil']])isolated(word,({g,t})=>{const e=enemy(g);fire(g,t,shot);assert.ok(e[field]>g.time,word);const until=e[field];fire(g,t,shot*2);assert.equal(e[field],until);});
 for(const [word,shot,distance]of [['波涛汹涌',4,8],['排山倒海',3,12]])isolated(word,({g,t})=>{const e=enemy(g,'boss'),d=e.d;fire(g,t,shot);near(e.d,d-distance/2);fire(g,t,shot*2);near(e.d,d-distance/2);assert.ok(e.siegeWeakUntil>g.time);});
 isolated('忐忑不安',({g,t})=>{const e=enemy(g);e.towerStrikeAt=11;e.bossStrikeAt=12;fire(g,t,4);near(e.towerStrikeAt,11.5);near(e.bossStrikeAt,12);fire(g,t,8);near(e.towerStrikeAt,11.5);});
});
test('fire spreads only at its stated cycle; shield removal and healing suppression happen before damage',()=>{
 isolated('薪火相传',({g,t})=>{const e=enemy(g,'normal',160),a=enemy(g,'normal',155),b=enemy(g,'normal',20);fire(g,t,4);assert.ok(e.burnUntil>g.time&&a.burnUntil>g.time);assert.equal(b.burnUntil,undefined);});
 isolated('釜底抽薪',({g,t,w})=>{const e=enemy(g);e.shield=1000;fire(g,t,4);assert.ok(e.shield<1000-w.damage);assert.ok(e.healBlockUntil>g.time);});
});
test('ambush, finish, relief, adaptation, pivot, patient and balance effects follow actual conditions',()=>{
 for(const [word,assertion]of [
 ['守株待兔',({g,t,w,e})=>{fire(g,t);assert.ok(e.maxHp-e.hp>=w.damage*1.25);}],
 ['当机立断',({g,t,w,e})=>{e.hp=e.maxHp*.2;const hp=e.hp;fire(g,t);near(hp-e.hp,w.damage*1.4);}],
 ['围魏救赵',({g,t,w,e})=>{e.d=enemyLength(e)*.8;const p=enemyPosition(e);t.pad=g.pads.map((a,i)=>({i,d:Math.hypot(a.x-p.x,a.y-p.y)})).sort((a,b)=>a.d-b.d)[0].i;fire(g,t);near(e.maxHp-e.hp,w.damage*1.25);}],
 ['千变万化',({g,t,w,e})=>{const a=enemy(g,'normal',120);fire(g,t);near(a.maxHp-a.hp,w.damage*.3);}],
 ['半途而废',({g,t,w,e})=>{fire(g,t);near(e.maxHp-e.hp,w.damage*1.3);const hp=e.hp;fire(g,t);near(hp-e.hp,w.damage);}],
 ['三思而行',({g,t,w,e})=>{fire(g,t);near(t.cooldown,w.rate);}],
 ['阴阳',({g,t,w,e})=>{fire(g,t,2);assert.equal(e.slowFactor,.75);}],
 ['风驰电掣',({g,t,w,e})=>{fire(g,t);near(t.cooldown,w.rate);assert.ok(w.rate<1.05);}],
 ['海阔天空',({g,t,w,e})=>{fire(g,t);assert.ok(e.lightUntil>g.time);assert.ok(w.range>=229);}],
 ['五谷丰登',({g,t,w,e})=>{fire(g,t,4);assert.ok(e.bountyUntil>g.time);assert.equal(e.bounty,1);}]
 ])isolated(word,ctx=>{const e=enemy(ctx.g);assertion({...ctx,e});});
});
test('all learning families remain valid in mixed formations containing all 94 enemy types',()=>{
 for(const id of Object.keys(SPECIAL_EFFECTS)){const word=Object.keys(SPECIAL_WORDS).find(w=>SPECIAL_WORDS[w]===id),{g,t}=arena(word);for(const kind of Object.keys(enemies))enemy(g,kind);const shield=g.enemies.reduce((s,e)=>s+(e.shield||0),0);fire(g,t,4);assert.ok(t.cooldown>0,id);assert.ok(g.enemies.some(e=>e.hp<e.maxHp)||g.enemies.reduce((s,e)=>s+(e.shield||0),0)<shield,id);assert.ok(g.effects.length<180,id);const h=Game.restore(JSON.parse(JSON.stringify(g.export())));assert.deepEqual(h.export(),g.export());}
});
// Imported below to keep the family matrix readable.
import {ENEMIES as enemies} from '../dist/engine.mjs';
test('version six preserves progress and rejects malformed learning states; v5 converts old injury ratios',()=>{
 const {g,t}=arena('三顾茅庐');add(g,'火球',1);enemy(g);fire(g,t,3);g.damageTower(t,20,g.enemies[0]);const snapshot=JSON.parse(JSON.stringify(g.export())),h=Game.restore(snapshot);assert.equal(h.export().version,6);
 for(let i=0;i<30;i++){g.step(.1);h.step(.1);}assert.deepEqual(h.export(),g.export());
 for(const [key,value]of [['lessonPowerUntil',NaN],['lessonShield',1e9],['lessonStreak',6],['lessonTarget',-1],['lessonStored',1]]){const bad=structuredClone(snapshot);bad.towers[0][key]=value;assert.throws(()=>Game.restore(bad),key);}
 // Old 金蝉脱壳 was a gold tower: 420 max durability at starting tier four.
 const old=arena('金蝉脱壳').g.export();old.version=5;old.towers[0].hp=210;old.towers[0].spent=137;const migrated=Game.restore(old),mt=migrated.towers[0];near(mt.hp/towerDefense(mt).maxHp,.5);assert.equal(mt.spent,137);assert.equal(mt.level,4);assert.deepEqual(migrated.hand,old.hand);assert.equal(migrated.ink,old.ink);
});

test('harvest bounties pay real kills without needing a luck rune and obey the existing shared cap',()=>isolated('五谷丰登',({g,t})=>{
 g.queue=[{kind:'normal',wave:1,at:1e9}];for(let i=0;i<14;i++){const e=enemy(g);fire(g,t,4);e.hp=0;g.step(.01);}assert.equal(g.bountyEarned,10);assert.equal(Game.restore(g.export()).bountyEarned,10);
}));
