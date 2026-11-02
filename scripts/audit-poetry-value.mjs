import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Game,WORDS,POEM_LINES,getWord,wordRules,towerDefense,CHAPTERS,ENEMIES,enemyPosition,enemyLength,VERSE_INDEX,POEM_INDEX} from '../dist/engine.mjs';
import {maintain} from '../tests/strategy.mjs';
const paired=process.argv.includes('--paired-rng')?JSON.parse(readFileSync(new URL('../tests/fixtures/poetry-value-rng.json',import.meta.url))):null;
const files=[...(paired?['tests/fixtures/poetry-value-rng.json']:[]),'dist/engine.mjs','dist/poetry-rules.mjs','dist/poetry-combat.mjs','dist/poetry-scenes.mjs','dist/poetry-scene-rules.mjs','dist/poetry-impact.mjs','dist/poetry-data.mjs','dist/specials.mjs','tests/strategy.mjs'];
const hashes=()=>Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(new URL('../'+f,import.meta.url))).digest('hex')]));
const sourceHashes=hashes(),round=n=>Number(n.toFixed(2));
const ENDLESS_METHOD="按截图选择第2章竹海听风，测主线10轮之后的第11轮、首个无尽轮内三波，30秒间隔、真实随机Boss/护卫/回血/护盾/攻塔/山门伤害。各阵容与条件使用种子1—20，属于配对控制实验，不是独立人类胜率。预设字牌齐备，不计寻找/刷新字牌费用，实际支付建造、阵位解锁与升级费用。budgetNNNN使用该总资金，按相同阵位优先级尽量建塔并预留1000墨点，然后按固定顺序合法升级；阵容形成后不再补塔或升级。max16为16座各自合法满级塔，记录不同建设成本，另留相同1000战斗余额，并非等投入。native8/native16为8/16座未升级塔，另留1000余额，mixed的native8为4常规+4诗塔。maintenanceEnabled=true时沿用同一维护策略、每2秒检查一次并按真实价格维修/重建；false不手动维修，但词塔自身修复和护盾技能照常。落墨使用相同受限策略。战斗不加钱、不启用调试、不削弱敌人。随机诗句按5/6/7字等概率，并按当前早年级70%偏好抽取；其他阵容为明确列出的固定示例，不是最优玩家求解器。敌方HP/护盾属性记录真实扣除量，过量击杀不重复计伤，回复另计。持续伤害没有完整归属来源标签，因此damageBySource不能作为完整的混合队属性输出占比图。胜利表示爱心未耗尽且清完这三波，不表示整个无尽通关。";
const stock=(g,word)=>g.hand=[...word.padEnd(32,'月')].map(ch=>({ch,id:++g.handSerial,used:false}));
const stats=xs=>{const a=xs.slice().sort((a,b)=>a-b);return{n:a.length,min:round(a[0]),p10:round(a[Math.floor((a.length-1)*.1)]),median:round(a[Math.floor((a.length-1)*.5)]),p90:round(a[Math.floor((a.length-1)*.9)]),max:round(a.at(-1))};};
const verify=()=>assert.deepEqual(hashes(),sourceHashes,'Combat sources changed during the audit');

function controls(){
 const groups=new Map();for(const w of WORDS.filter(w=>w.tier===4&&!w.poem)){const key=JSON.stringify([w.type,w.special,w.idiomMove,w.trait,w.runes,w.semanticCycle,w.damage,w.range,w.rate,w.aura,w.income,wordRules(w)]);if(!groups.has(key))groups.set(key,w);}
 const selected=[];for(const type of new Set([...groups.values()].map(w=>w.type))){const pool=[...groups.entries()].filter(([,w])=>w.type===type).sort((a,b)=>a[0].localeCompare(b[0]));const n=Math.min(24,pool.length);for(let i=0;i<n;i++)selected.push(pool[Math.floor(i*(pool.length-1)/Math.max(1,n-1))][1]);}return{profiles:groups.size,selected};
}
function solo(word,level,scenario){
 const g=new Game(0,42);g.ink=1e6;stock(g,word);assert.ok(g.build(word,2));const t=g.towers[0],w=getWord(word);while(t.level<level)assert.ok(g.upgrade(t.id));
 g.phase='battle';g.wave=1;g.pendingWaves=[1];g.time=10;const count=scenario==='pack'?8:1,kind=scenario==='boss'?'boss':'normal';
 for(let i=0;i<count;i++){const e=g.spawn(kind,245+i*12);e.hp=e.maxHp=1e9;e.shield=e.maxShield=0;e.speed=1e-6;e.pulses=999;e.escortCalls=2;e.abilityAt=e.pulseAt=e.escortReadyAt=e.bossReadyAt=1e9;}
 let normal=0,opening=0,persistent=0,dot=0,previous=0;const damage=()=>g.enemies.reduce((s,e)=>s+e.maxHp-e.hp,0);
 g.effects.push=(...effects)=>{if(w.poem)for(const f of effects)if(f.kind==='poem-ink'||f.kind==='poem-cast'){const n=damage();if(f.kind==='poem-ink')normal+=n-previous;else opening+=n-previous;previous=n;}return 0;};
 for(let step=0;step<1200;step++){
  g.time=10+(step+1)*.05;g.enemies.forEach((e,i)=>e.d=245+i*12);let before=damage();g.updatePoetryScenes(.05);persistent+=damage()-before;before=damage();g.updateZones();g.updateEnemies(.05);dot+=damage()-before;previous=damage();g.attack(t,.05);g.events=[];
 }
 const total=damage();assert.ok(total>=0&&Number.isFinite(total));if(w.poem)assert.ok(Math.abs(normal+opening+persistent+dot-total)<.01,word);
 return{word,type:w.type,tier:w.tier,level,scenario,spent:t.spent,dps:round(total/60),per100Ink:round(total/60/t.spent*100),shots:t.shots||0,casts:t.verseCasts||t.idiomCasts||0,...(w.poem?{ordinary:round(normal/60),opening:round(opening/60),persistent:round(persistent/60),dot:round(dot/60),specialShare:round((opening+persistent+dot)/Math.max(1,total)*100)}:{})};
}
function runSolo(){
 const cohort=controls(),rows=[];for(const w of[...POEM_LINES.map(l=>getWord(l.word)),...cohort.selected]){
  for(const level of new Set([...(w.poem?[w.tier]:[]),w.maxLevel,...(w.poem&&w.tier<=6?[6]:[])]))for(const scenario of['single','pack','boss'])rows.push(solo(w.word,level,scenario));
 }
 const summary=[];for(const group of['max','level6','native5','native6','native7'])for(const scenario of['single','pack','boss'])for(const type of[...new Set(rows.map(r=>r.type))]){
  const rs=rows.filter(r=>r.type===type&&r.scenario===scenario&&(group==='max'?r.level===getWord(r.word).maxLevel:group==='level6'?r.level===6:r.type==='poetry'&&r.level===r.tier&&r.tier===Number(group.slice(6))));if(rs.length)summary.push({group,scenario,type,damage:stats(rs.map(r=>r.dps)),per100Ink:stats(rs.map(r=>r.per100Ink)),investment:stats(rs.map(r=>r.spent))});
 }
 verify();const report={date:'2026-11-02',sourceHashes,method:'60 seconds, 50ms ticks, production attacks/scenes/zones/enemy status updates; includes actual poison, burn and bleed. All 483 poetry lines at legal maximum levels, plus their native levels and legal level-6 subset. Four-character controls sample up to 24 distinct mechanical profiles per attribute at their legal level-6 maximum, evenly across sorted configuration keys; samples are equally weighted, not word-frequency weighted and not every short-word recipe. Compare maximum development separately from common level 6 and normalize actual construction+upgrade investment. Eight tightly clustered stationary high-HP targets favor area skills. Boss is the base ground Boss with no healing/casting/retaliation/summons/shields or half-health transitions in this fixture. No ally support, travel, kills, tower damage or utility is monetized here; real endless tests evaluate those outcomes.',controlProfiles:cohort.profiles,controlSample:cohort.selected.length,measurements:rows.length,summary,rows};
 writeFileSync('docs/reports/poetry-value-solo.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,rows:undefined},null,2));
}

const random=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const damagePoems=['飞流直下三千尺','疑是银河落九天','过江千尺浪','红掌拨清波','日出江花红胜火','黄河入海流','大漠沙如雪','千锤万凿出深山','夜半钟声到客船','清泉石上流','遥看瀑布挂前川','散作满河星','润物细无声','孤舟蓑笠翁','千山鸟飞绝','万径人踪灭'];
const ordinary=['火树银花','电闪雷鸣','毒蛇猛兽','毒素之力','冰天雪地','万箭齐发','万剑归宗','势如破竹','滴水穿石','五雷轰顶','风卷残云','三顾茅庐','众志成城','妙手回春','光芒万丈','符咒之力'];
const spots=[2,4,6,8,1,9,0,7,10,3,5,11,12,13,14,15];
function teamWords(team,seed){
 if(team==='poetry-offense')return damagePoems;
 if(team==='no-poetry')return ordinary;
 if(team==='mixed')return[...ordinary.slice(0,12),'润物细无声','孤舟蓑笠翁','千山鸟飞绝','飞流直下三千尺'];
 const rng=random(seed^0x9745),out=[];while(out.length<16){const size=5+Math.floor(rng()*3),pool=POEM_LINES.filter(l=>l.word.length===size),early=pool.filter(l=>['一年级','二年级'].some(grade=>POEM_INDEX.get(l.poem).grade?.startsWith(grade)));const candidates=early.length&&rng()<.7?early:pool;const word=candidates[Math.floor(rng()*candidates.length)].word;if(!out.includes(word))out.push(word);}return out;
}
function endless(team,mode,seed,chapter=1){
 const g=new Game(chapter,seed),fullWords=teamWords(team,seed),words=mode==='native8'?(team==='mixed'?[...ordinary.slice(0,4),'润物细无声','孤舟蓑笠翁','千山鸟飞绝','飞流直下三千尺']:fullWords.slice(0,8)):fullWords,start=mode.startsWith('budget')?Number(mode.slice(6)):50000;g.ink=start;
 if(paired){assert.equal(chapter+1,paired.chapter);assert.ok(Number.isInteger(paired.states[seed]),'Missing paired seed');g.rngState=paired.states[seed];}
 for(const word of words)assert.ok(getWord(word),'Unknown test word '+word);
 for(const word of words){const pad=spots[g.towers.length],unlock=g.padUnlocked(pad)?0:g.unlockCost();if(mode.startsWith('budget')&&g.ink<getWord(word).cost+unlock+1000)continue;if(unlock)assert.ok(g.unlockPad(pad));stock(g,word);assert.ok(g.build(word,pad));}
 if(mode==='max16'){for(const t of g.towers)while(t.level<getWord(t.word).maxLevel)assert.ok(g.upgrade(t.id));}
 else if(mode.startsWith('budget'))for(let pass=0;pass<2;pass++)for(const t of g.towers)if(t.level<getWord(t.word).maxLevel&&g.ink>=g.upgradeCost(t)+1000)g.upgrade(t.id);
 const spent=start-g.ink;if(!mode.startsWith('budget'))g.ink=1000;const reserve=g.ink;
 g.wave=g.campaignWaves;g.phase='won';assert.ok(g.continueEndless());const firstWave=g.wave+1,lastWave=g.wave+3;g.events=[];
 let removedHp=0,removedShield=0,healedHp=0,newShields=0,maintenance=0,rebuilds=0,leaks=0,leakDamage=0,ruins=0,blocked=0,eligible=0,skillUses=0,lastMaintenance=-2,lastWaveSeen=firstWave-1;
 const damageBySource={poetry:0,other:0,scene:0,dotAndEnemyUpdate:0,counter:0,skill:0,unknown:0};let source='unknown';
 const inSource=(key,fn)=>{const prior=source;source=key;try{return fn();}finally{source=prior;}};
 const spawn=g.spawn;g.spawn=function(...args){const e=spawn.apply(this,args);let hp=e.hp,shield=e.shield||0,max=e.maxHp;Object.defineProperty(e,'hp',{enumerable:true,configurable:true,get:()=>hp,set:value=>{if(value<hp){const n=Math.min(Math.max(0,hp),hp-value);removedHp+=n;damageBySource[source]+=n;}else if(value>hp&&e.maxHp===max)healedHp+=value-hp;max=e.maxHp;hp=value;}});Object.defineProperty(e,'shield',{enumerable:true,configurable:true,get:()=>shield,set:value=>{if(value<shield){const n=Math.min(shield,shield-value);removedShield+=n;damageBySource[source]+=n;}else if(value>shield)newShields+=value-shield;shield=value;}});return e;};
 const attack=g.attack;g.attack=function(t,dt){const l=VERSE_INDEX.get(t.word);if(l&&t.hp>0&&!(t.disruptedUntil>this.time)&&(t.verseCharge||0)>=4&&!(t.verseReadyAt>this.time)&&this.enemies.some(e=>e.hp>0&&e.d<enemyLength(e))){eligible++;const previous=t.verseCasts||0,locked=l.field.some(k=>this.poetryFieldReady?.[k]>this.time);const result=inSource('poetry',()=>attack.call(this,t,dt));if(locked&&(t.verseCasts||0)===previous)blocked++;return result;}return inSource(l?'poetry':'other',()=>attack.call(this,t,dt));};
 for(const[name,key]of[['updatePoetryScenes','scene'],['updateEnemies','dotAndEnemyUpdate'],['damageTower','counter'],['skill','skill']]){const fn=g[name];g[name]=function(...args){return inSource(key,()=>fn.apply(this,args));};}
 const repair=g.repair;g.repair=function(id){const t=this.towers.find(t=>t.id===id),wasRuin=t?.hp===0,before=this.ink,ok=repair.call(this,id);if(ok){maintenance+=before-this.ink;if(wasRuin)rebuilds++;}return ok;};
 const transitions=[],cleared=[];let steps=0;assert.ok(g.startWave());
 while(g.phase==='battle'&&steps++<6000){
  if(!process.argv.includes('--no-maintenance')&&g.time-lastMaintenance>=2){lastMaintenance=g.time;maintain(g);}
  if(g.skillCost()<=90&&g.ink>=g.skillCost()+40&&g.enemies.filter(e=>e.hp>0&&e.d/enemyLength(e)>.72).length>=3&&g.skill())skillUses++;
  g.step(.1);
  for(const ev of g.events){if(ev.type==='leak'){leaks++;leakDamage+=ev.damage;}if(ev.type==='tower-down')ruins++;if(ev.type==='clear'&&!ev.roundEnd)cleared.push(ev.wave);}
  g.events=[];g.effects=[];
  if(g.wave!==lastWaveSeen){lastWaveSeen=g.wave;transitions.push({wave:g.wave,part:(g.wave-firstWave)+1,time:round(g.time),hearts:g.hp,enemies:g.enemies.length,bosses:g.enemies.filter(e=>ENEMIES[e.kind].boss).length,ruined:g.towers.filter(t=>t.hp<=0).length,enemyHp:round(g.enemies.reduce((n,e)=>n+Math.max(0,e.hp)+(e.shield||0),0))});}
 }
 assert.ok(g.phase!=='battle','Endless case timed out');assert.equal(g.wave<=lastWave,true);const damage=removedHp+removedShield;assert.ok(Math.abs(Object.values(damageBySource).reduce((a,b)=>a+b,0)-damage)<.01,'damage accounting');
 return{team,mode,seed,chapter:chapter+1,towerCount:g.towers.length,maintenanceEnabled:!process.argv.includes('--no-maintenance'),spent,reserve,clearedAllThree:g.phase==='prepare',hearts:g.hp,lastPart:g.wave-firstWave+1,time:round(g.time),clearedWaves:cleared.length,leaks,leakDamage,ruins,remainingRuins:g.towers.filter(t=>t.hp<=0).length,maintenance,rebuilds,skillUses,actualDamage:round(damage),effectiveDps:round(damage/Math.max(.1,g.time)),enemyHealing:round(healedHp),enemyShieldsAdded:round(newShields),eligiblePoetryFrames:eligible,blockedPoetryFrames:blocked,blockedShare:round(blocked/Math.max(1,eligible)*100),casts:g.towers.reduce((n,t)=>n+(t.verseCasts||0),0),neverCastPoems:g.towers.filter(t=>getWord(t.word).poem&&!t.verseCasts).length,damageBySource:Object.fromEntries(Object.entries(damageBySource).map(([k,v])=>[k,round(v)])),bosses:g.bossDraws.map(b=>({wave:b.wave,kind:b.kind})),formation:g.towers.map(t=>({word:t.word,level:t.level,spent:t.spent,casts:t.verseCasts||0,shots:t.shots||0})),transitions};
}
function runEndless(){
 const n=Number(process.argv.find(s=>s.startsWith('--seeds='))?.split('=')[1]||20),modes=(process.argv.find(s=>s.startsWith('--modes='))?.split('=')[1]||'budget8000,max16').split(','),rows=[];
 for(const mode of modes)for(const team of['poetry-random','poetry-offense','no-poetry','mixed']){for(let seed=1;seed<=n;seed++)rows.push(endless(team,mode,seed));console.log(JSON.stringify({mode,team,cases:n,clears:rows.filter(r=>r.mode===mode&&r.team===team&&r.clearedAllThree).length}));}
 const summary=[];for(const mode of modes)for(const team of['poetry-random','poetry-offense','no-poetry','mixed']){const rs=rows.filter(r=>r.mode===mode&&r.team===team);summary.push({mode,team,cases:rs.length,wins:rs.filter(r=>r.clearedAllThree).length,winRate:round(rs.filter(r=>r.clearedAllThree).length/rs.length*100),failedByPart:Object.fromEntries([1,2,3].map(n=>[n,rs.filter(r=>!r.clearedAllThree&&r.lastPart===n).length])),hearts:stats(rs.map(r=>r.hearts)),towerCount:stats(rs.map(r=>r.towerCount)),investment:stats(rs.map(r=>r.spent)),repairs:stats(rs.map(r=>r.maintenance)),damage:stats(rs.map(r=>r.actualDamage)),enemyHealing:stats(rs.map(r=>r.enemyHealing)),ruins:stats(rs.map(r=>r.ruins)),globalLockPercent:stats(rs.map(r=>r.blockedShare)),poetryCasts:stats(rs.map(r=>r.casts))});}
 verify();const report={date:'2026-11-02',sourceHashes,maintenanceEnabled:!process.argv.includes('--no-maintenance'),modes,randomStream:paired?{sourceCommit:paired.sourceCommit,description:paired.meaning}:'current hand constructor',method:ENDLESS_METHOD,cases:rows.length,summary,rows};writeFileSync(process.argv.find(s=>s.startsWith('--out='))?.split('=')[1]||'docs/reports/poetry-value-endless.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,rows:undefined},null,2));
}
if(process.argv.includes('--solo'))runSolo();
else if(process.argv.includes('--endless'))runEndless();
else throw Error('Use --solo or --endless [--seeds=20]');
