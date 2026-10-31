import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{createHash}from'node:crypto';import{Game,WORDS,getWord,towerStats,towerDefense,enemyPosition,enemyLength,RANGED_MIN_RANGE,traitEffect}from'../dist/engine.mjs';
const frozen=JSON.parse(readFileSync(new URL('./fixtures/ranged-v9.json',import.meta.url))),saved=JSON.parse(readFileSync(new URL('./fixtures/ranged-save-v9.json',import.meta.url)));
const fields=w=>({word:w.word,type:w.type,trait:w.trait,tier:w.tier,special:w.special||null,idiomMove:w.idiomMove||null,damage:w.damage,range:w.range,rate:w.rate,cost:w.cost,runes:w.runes});
function build(chapter,word,pad=0,up=0){const g=new Game(chapter,42);g.ink=10000;g.hand=[...word.padEnd(16,'火')].map(ch=>({id:++g.handSerial,ch,used:false}));assert.ok(g.build(word,pad));const t=g.towers[0];for(let n=0;n<up;n++)assert.ok(g.upgrade(t.id));return{g,t};}
test('all 2044 ranged words reach the fixed bow reference without recursively raising the bow or changing their other budgets',()=>{
 assert.equal(RANGED_MIN_RANGE,263);assert.equal(getWord('弓').range,263);assert.equal(frozen.ranged.length,2044);
 for(const old of frozen.ranged){const w=getWord(old.word),extra=old.runes.includes('sky')?12:0;assert.equal(w.range,Math.max(old.range-extra,263)+extra,old.word);for(const k of['damage','rate','cost','type','trait','tier'])assert.equal(w[k],old[k],old.word+' '+k);assert.deepEqual(w.runes,old.runes);assert.ok(w.range>=263);}
 const nonRanged=WORDS.filter(w=>w.trait!=='ranged').map(fields);assert.equal(nonRanged.length,frozen.nonRangedCount);assert.equal(createHash('sha256').update(JSON.stringify(nonRanged)).digest('hex'),frozen.nonRangedHash,'Every non-ranged profile stays unchanged');
});
test('far-sight bonuses apply above the floor and each paid upgrade still adds 15 range',()=>{
 const sky=frozen.ranged.filter(w=>w.runes.includes('sky')&&w.range-12<263);assert.ok(sky.length>0);for(const old of sky)assert.equal(getWord(old.word).range,275,old.word);
 for(const word of['弓','毒云箭','冰箭','寒冰箭','弓箭']){const w=getWord(word);for(let up=0;up<=2;up++)assert.equal(towerStats({word,level:w.tier+up}).range,w.range+up*15);}
 assert.deepEqual([3,4,5].map(level=>towerStats({word:'毒云箭',level}).range),[263,278,293]);assert.match(traitEffect(getWord('毒云箭')),/至少提升至 263/);
});
test('old v9 towers gain coverage on load while preserving their exact injury, investment, cooldown, wallet and consumed letters',()=>{
 const g=Game.restore(saved),t=g.towers[0],old=saved.towers[0];assert.equal(towerStats(t).range,278);assert.equal(t.hp,old.hp);assert.equal(t.hp/towerDefense(t).maxHp,.37);for(const k of['word','level','spent','cooldown'])assert.equal(t[k],old[k]);assert.equal(g.ink,saved.ink);assert.deepEqual(g.hand,saved.hand);const copy=Game.restore(g.export());assert.equal(copy.towers[0].hp,t.hp);assert.equal(towerStats(copy.towers[0]).range,278);
});
test('poison cloud arrows really hit and poison the new outer boundary in all ten chapters and stop outside it at every level',()=>{
 for(let ch=0;ch<10;ch++)for(let up=0;up<=2;up++){const{g,t}=build(ch,'毒云箭',0,up),probe=g.spawn('normal',0),length=enemyLength(probe),p=g.pads[0],range=towerStats(t).range;let inside,outside;for(let d=0;d<length;d+=.2){probe.d=d;const q=enemyPosition(probe),distance=Math.hypot(q.x-p.x,q.y-p.y);if(!inside&&distance>range-1&&distance<range-.1)inside=d;if(!outside&&distance>range+.1&&distance<range+1)outside=d;if(inside&&outside)break;}assert.ok(inside&&outside,`chapter ${ch+1}`);for(const[d,expected]of[[inside,true],[outside,false]]){g.enemies=[];const e=g.spawn('normal',d);e.hp=e.maxHp=100000;t.cooldown=0;g.attack(t,.01);assert.equal(e.hp<e.maxHp,expected,`${ch+1} level ${t.level}`);assert.equal((e.poisonUntil||0)>g.time,expected);}}
});
