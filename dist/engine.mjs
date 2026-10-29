// Each recipe has a distinct word; length determines its starting tier.
const SCHOOLS = [
 {type:'splash',icon:'火',name:'烈焰',color:'#c56843',cost:60,damage:24,range:155,rate:1.05,tag:'范围伤害',desc:'爆裂攻击，对目标周围的敌人造成范围伤害。',words:['火','火球','烈火','火焰','流火','火焰山','三昧火','火流星','火树银花','星火燎原','火上浇油']},
 {type:'slow',icon:'冰',name:'寒霜',color:'#659ba7',cost:50,damage:9,range:145,rate:.8,tag:'减速控制',desc:'寒霜使目标移动速度降低 45%，持续 2.1 秒。',words:['冰','冰霜','寒冰','冰雪','寒霜','寒冰箭','冰封术','冰凌花','冰天雪地','冷若冰霜','寒气逼人']},
 {type:'chain',icon:'雷',name:'雷霆',color:'#a38a48',cost:80,damage:31,range:170,rate:1.3,tag:'连锁攻击',desc:'闪电最多连接三个敌人，后续伤害逐次衰减。',words:['雷','雷电','惊雷','雷霆','闪电','连环雷','雷霆击','风雷动','雷霆万钧','电闪雷鸣','五雷轰顶']},
 {type:'fast',icon:'风',name:'疾风',color:'#65866d',cost:50,damage:12,range:160,rate:.42,tag:'高速单体',desc:'快速连续攻击，擅长补刀和拦截疾影。',words:['风','风刃','疾风','旋风','狂风','旋风刃','风卷云','追风剑','风卷残云','风驰电掣','风风火火']},
 {type:'heavy',icon:'石',name:'山石',color:'#908176',cost:85,damage:66,range:180,rate:1.8,tag:'破甲重击',desc:'重击无视墨甲的护甲减伤，擅长迎击墨魁。',words:['石','巨石','岩石','山石','磐石','落石阵','金刚石','镇山石','稳如泰山','排山倒海','坚如磐石']},
 {type:'aura',icon:'光',name:'辉光',color:'#c1a45a',cost:65,damage:0,range:155,rate:1,tag:'增益辅助',desc:'提高范围内词塔伤害；取最强光环，不叠加。',words:['光','光环','星光','月光','辉光','日月光','星辰光','明月光','光芒万丈','光明磊落','日月同辉']},
 {type:'poison',icon:'毒',name:'毒瘴',color:'#8b8a4b',cost:65,damage:14,range:155,rate:1.1,tag:'持续毒伤',desc:'命中附带持续 3 秒的毒伤，同类取最强效果。',words:['毒','毒雾','毒蛇','瘴气','剧毒','毒气弹','毒龙胆','迷魂香','蛇蝎心肠','毒蛇猛兽','笑里藏刀']},
 {type:'sniper',icon:'弓',name:'神射',color:'#94709c',cost:75,damage:46,range:235,rate:1.7,tag:'远程斩杀',desc:'远程精准射击，生命低于 30% 的目标受到 1.8 倍伤害。',words:['弓','弓箭','神箭','飞箭','穿杨','穿云箭','追魂箭','连珠箭','百步穿杨','箭无虚发','百发百中']},
 {type:'income',icon:'金',name:'生财',color:'#b18b44',cost:55,damage:0,range:120,rate:1,tag:'过波生财',desc:'不攻击；每过一波产出额外墨点，全部财塔合计最多 80。',words:['金','生财','招财','金币','聚宝','摇钱树','聚宝盆','招财猫','招财进宝','财源广进','日进斗金']}
];
const POWER=[0,.48,1,1.95,3.3], PRICE=[0,.44,1,1.55,2.35];
export const WORDS=SCHOOLS.flatMap(s=>s.words.map(word=>{
 const tier=[...word].length;
 return {...s,words:undefined,word,tier,maxLevel:tier+2,cost:Math.round(s.cost*PRICE[tier]),damage:Math.round(s.damage*POWER[tier]),range:s.range+(tier-2)*12,aura:.15+tier*.1,income:7*tier};
}));
export const GRADES=['','凡字','灵词','妙语','天成'];
export const HAND_SIZE=16;
const WORD_INDEX=new Map(WORDS.map(w=>[w.word,w]));
export const getWord=word=>WORD_INDEX.get(word);
export function towerStats(t){const w=getWord(t.word),up=t.level-w.tier;return {damage:Math.round(w.damage*(1+up*.65)),range:w.range+up*15,rate:w.rate/(1+up*.14),aura:w.aura,income:Math.round(w.income*(1+up*.5))};}
const signature=chars=>[...chars].sort().join('');
const ANAGRAM_INDEX=new Map();for(const w of WORDS)if(!ANAGRAM_INDEX.has(signature(w.word)))ANAGRAM_INDEX.set(signature(w.word),w);
export function matchWord(chars){if(chars.length<1||chars.length>4)return null;return getWord(chars.join(''))||ANAGRAM_INDEX.get(signature(chars))||null;}
export const CHAPTERS=[{name:'青山初试',area:'青山道',intro:'墨影初现，试以文字守住山门。',waves:6,hp:20,ink:200},{name:'竹海听风',area:'竹隐谷',intro:'疾影穿竹而来，以寒霜留住它们。',waves:8,hp:18,ink:230},{name:'长夜守卷',area:'藏书阁',intro:'墨潮席卷长夜，守住最后一卷光。',waves:10,hp:16,ink:260}];
export const PATH=[{x:-30,y:150},{x:190,y:150},{x:190,y:340},{x:440,y:340},{x:440,y:145},{x:690,y:145},{x:690,y:370},{x:940,y:370}];
export const PADS=[{x:100,y:78},{x:110,y:240},{x:265,y:228},{x:277,y:420},{x:360,y:265},{x:365,y:78},{x:520,y:225},{x:600,y:75},{x:610,y:305},{x:770,y:230},{x:783,y:445},{x:855,y:292}];
const seg=PATH.slice(1).map((p,i)=>Math.hypot(p.x-PATH[i].x,p.y-PATH[i].y));
export const LENGTH=seg.reduce((a,b)=>a+b,0);
export function position(d){for(let i=0;i<seg.length;i++){if(d<=seg[i]){const t=Math.max(0,d/seg[i]);return{x:PATH[i].x+(PATH[i+1].x-PATH[i].x)*t,y:PATH[i].y+(PATH[i+1].y-PATH[i].y)*t};}d-=seg[i];}return {...PATH.at(-1)};}
export class Game {
 constructor(chapter=0,seed=(Math.random()*4294967296)>>>0){this.chapter=chapter;this.wave=0;this.hp=CHAPTERS[chapter].hp;this.ink=CHAPTERS[chapter].ink;this.towers=[];this.enemies=[];this.effects=[];this.queue=[];this.time=0;this.spawnTime=0;this.phase='prepare';this.kills=0;this.nextId=1;this.skillReady=0;this.totalEarned=0;this.events=[];this.rngState=(seed>>>0)||1;this.refreshes=0;this.handSerial=0;this.hand=[];for(let i=0;i<4;i++)this.random();this.drawHand();}
 emit(type,data={}){this.events.push({type,...data});}
 random(){let x=this.rngState;x^=x<<13;x^=x>>>17;x^=x<<5;this.rngState=x>>>0;return this.rngState/4294967296;}
 drawHand(){
  const pick=xs=>xs[Math.floor(this.random()*xs.length)];
  const attack=WORDS.filter(w=>w.tier===2&&w.damage>0);
  const short=WORDS.filter(w=>w.tier===2),medium=WORDS.filter(w=>w.tier===3),long=WORDS.filter(w=>w.tier===4);
  const starter=pick(attack);
  const letters=[...starter.word,starter.icon,...pick(short).word,...pick(medium).word,...pick(long).word];
  const pool=WORDS.flatMap(w=>[...w.word]);
  while(letters.length<HAND_SIZE)letters.push(pick(pool));
  for(let i=letters.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[letters[i],letters[j]]=[letters[j],letters[i]];}
  this.hand=letters.map(ch=>({id:++this.handSerial,ch,used:false}));
 }
 refreshCost(){return Math.min(40,15+this.refreshes*5);}
 refreshHand(){if(['won','lost'].includes(this.phase)||this.ink<this.refreshCost())return false;const cost=this.refreshCost();this.ink-=cost;this.refreshes++;this.drawHand();this.emit('refresh',{cost});return true;}
 tilesFor(word){const ids=[];for(const ch of word){const tile=this.hand.find(t=>!t.used&&t.ch===ch&&!ids.includes(t.id));if(!tile)return null;ids.push(tile.id);}return ids;}
 availableWords(){return WORDS.filter(w=>this.tilesFor(w.word));}
 canBuild(word,ids){const w=getWord(word);if(!w||this.ink<w.cost||['won','lost'].includes(this.phase))return false;const chosen=ids??this.tilesFor(word);if(!chosen||chosen.length!==w.tier||new Set(chosen).size!==chosen.length)return false;const tiles=chosen.map(id=>this.hand.find(t=>t.id===id&&!t.used));return tiles.every(Boolean)&&signature(tiles.map(t=>t.ch))===signature(word);}
 build(word,pad,ids){const w=getWord(word),chosen=ids??this.tilesFor(word);if(!PADS[pad]||this.towers.some(t=>t.pad===pad)||!this.canBuild(word,chosen))return false;this.ink-=w.cost;for(const id of chosen)this.hand.find(t=>t.id===id).used=true;this.towers.push({word,pad,level:w.tier,spent:w.cost,cooldown:0,id:this.nextId++});this.emit('build',{word});return true;}
 upgrade(id){const t=this.towers.find(t=>t.id===id);if(!t||t.level>=getWord(t.word).maxLevel||['won','lost'].includes(this.phase))return false;const cost=this.upgradeCost(t);if(this.ink<cost)return false;this.ink-=cost;t.spent+=cost;t.level++;this.emit('upgrade');return true;}
 upgradeCost(t){return Math.round(getWord(t.word).cost*(t.level===getWord(t.word).tier?.75:1.15));}
 sell(id){const t=this.towers.find(t=>t.id===id);if(!t||['won','lost'].includes(this.phase))return false;this.ink+=Math.floor(t.spent*.7);this.towers=this.towers.filter(x=>x.id!==id);this.emit('sell');return true;}
 startWave(){if(this.phase!=='prepare')return false;this.wave++;this.phase='battle';const count=7+this.wave*2+this.chapter*2;this.queue=Array.from({length:count},(_,i)=>({kind:(this.wave%3===0&&i===count-1)?'boss':this.wave>=2&&this.random()<.2?'armor':this.random()<.25?'swift':'normal'}));this.spawnTime=0;this.emit('wave');return true;}
 spawn(kind){const scale=1+(this.wave-1)*.29+this.chapter*.45;const stats={normal:[45,43,8,1],swift:[30,71,7,1],armor:[95,31,12,2],boss:[310,24,45,4]}[kind];this.enemies.push({id:this.nextId++,kind,hp:stats[0]*scale,maxHp:stats[0]*scale,speed:stats[1]*(1+this.chapter*.07),reward:stats[2],harm:stats[3],d:0,slowUntil:0});}
 skill(){if(this.phase!=='battle'||this.time<this.skillReady||this.ink<30)return false;this.ink-=30;this.skillReady=this.time+28;for(const e of this.enemies){e.hp-=100;e.slowUntil=this.time+3;}this.effects.push({kind:'rain',life:1,max:1});this.emit('skill');return true;}
 step(dt){dt=Math.max(0,Math.min(dt,.1));for(const fx of this.effects)fx.life-=dt;this.effects=this.effects.filter(f=>f.life>0);if(this.phase!=='battle')return;this.time+=dt;this.spawnTime-=dt;if(this.queue.length&&this.spawnTime<=0){this.spawn(this.queue.shift().kind);this.spawnTime=Math.max(.46,1.05-this.wave*.035);}
 for(const e of this.enemies){if(e.hp>0&&e.poisonUntil>this.time-dt)e.hp-=Math.min(dt,Math.max(0,e.poisonUntil-(this.time-dt)))*e.poisonDps;if(e.hp>0)e.d+=e.speed*dt*(e.slowUntil>this.time?.55:1);}
 for(const t of this.towers){const w=getWord(t.word);if(w.type==='aura'||w.type==='income')continue;t.cooldown-=dt;if(t.cooldown>0)continue;const p=PADS[t.pad],stats=towerStats(t),range=stats.range;const targets=this.enemies.filter(e=>e.hp>0&&e.d<LENGTH&&Math.hypot(position(e.d).x-p.x,position(e.d).y-p.y)<=range).sort((a,b)=>b.d-a.d);if(!targets.length)continue;const target=targets[0];let damage=stats.damage;const buffs=this.towers.filter(a=>getWord(a.word).type==='aura'&&Math.hypot(PADS[a.pad].x-p.x,PADS[a.pad].y-p.y)<=towerStats(a).range).map(a=>towerStats(a).aura);if(buffs.length)damage*=1+Math.max(...buffs);if(w.type==='sniper'&&target.hp/target.maxHp<.3)damage*=1.8;const hit=(e,m=1)=>{e.hp-=damage*m*(e.kind==='armor'&&w.type!=='heavy'?.7:1);this.effects.push({kind:'bolt',from:p,to:position(e.d),color:w.color,life:.19,max:.19});};hit(target);if(w.type==='poison'){target.poisonDps=Math.max(target.poisonUntil>this.time?target.poisonDps:0,damage*.6);target.poisonUntil=this.time+3;}if(w.type==='slow')target.slowUntil=this.time+2.1;if(w.type==='splash'){const q=position(target.d);for(const e of this.enemies){if(e!==target&&e.hp>0&&Math.hypot(position(e.d).x-q.x,position(e.d).y-q.y)<65)hit(e,.65);}this.effects.push({kind:'blast',to:q,color:w.color,life:.35,max:.35});}if(w.type==='chain'){for(let i=1;i<Math.min(3,targets.length);i++)hit(targets[i],Math.pow(.72,i));}t.cooldown=stats.rate;}
 for(const e of this.enemies){if(e.hp<=0){this.ink+=e.reward;this.totalEarned+=e.reward;this.kills++;this.effects.push({kind:'pop',to:position(e.d),color:'#556b58',life:.45,max:.45});}else if(e.d>=LENGTH){this.hp=Math.max(0,this.hp-e.harm);this.emit('leak');}}
 this.enemies=this.enemies.filter(e=>e.hp>0&&e.d<LENGTH);if(this.hp<=0){this.phase='lost';this.emit('lost');}else if(!this.queue.length&&!this.enemies.length){const income=Math.min(80,this.towers.filter(t=>getWord(t.word).type==='income').reduce((sum,t)=>sum+towerStats(t).income,0));this.ink+=40+this.wave*6+income;this.refreshes=0;this.phase=this.wave>=CHAPTERS[this.chapter].waves?'won':'prepare';this.emit(this.phase==='won'?'won':'clear',{income});}}
 export(){const {effects,events,...data}=this;return {...data,towers:this.towers.map(t=>({...t})),enemies:this.enemies.map(e=>({...e})),queue:this.queue.map(e=>({...e})),hand:this.hand.map(t=>({...t})),version:2};}
 static restore(data){
 const finite=n=>typeof n==='number'&&Number.isFinite(n),int=n=>Number.isInteger(n)&&n>=0,kind=k=>['normal','swift','armor','boss'].includes(k);
 if(!data||![1,2].includes(data.version)||!int(data.chapter)||!CHAPTERS[data.chapter]||!int(data.wave)||data.wave>CHAPTERS[data.chapter].waves||!['prepare','battle','won','lost'].includes(data.phase)||!['ink','hp','time','skillReady','totalEarned'].every(k=>finite(data[k])&&data[k]>=0)||data.hp>CHAPTERS[data.chapter].hp||!['kills','nextId'].every(k=>int(data[k]))||!finite(data.spawnTime)||!Array.isArray(data.towers)||!Array.isArray(data.enemies)||!Array.isArray(data.queue))throw Error('Invalid save');
 if(data.towers.length>PADS.length||new Set(data.towers.map(t=>t?.pad)).size!==data.towers.length||data.towers.some(t=>!t||!WORDS.some(w=>w.word===t.word)||!int(t.pad)||!PADS[t.pad]||(!Number.isInteger(t.level)||(data.version===1?![1,2,3].includes(t.level):t.level<getWord(t.word).tier||t.level>getWord(t.word).maxLevel))||!int(t.id)||!finite(t.cooldown))||data.enemies.some(e=>!e||!kind(e.kind)||!int(e.id)||!['hp','maxHp','speed','reward','harm','d','slowUntil'].every(k=>finite(e[k]))||e.maxHp<=0||e.speed<=0||e.d<0)||data.queue.some(e=>!e||!kind(e.kind)))throw Error('Invalid save');
 const g=new Game(data.chapter);for(const k of ['wave','hp','ink','towers','enemies','queue','time','spawnTime','phase','kills','nextId','skillReady','totalEarned'])g[k]=data[k];
 if(data.version===2){
  const chars=new Set(WORDS.flatMap(w=>[...w.word]));
  if(!int(data.rngState)||data.rngState===0||data.rngState>4294967295||!int(data.refreshes)||!int(data.handSerial)||!Array.isArray(data.hand)||data.hand.length!==HAND_SIZE||new Set(data.hand.map(t=>t?.id)).size!==HAND_SIZE||data.hand.some(t=>!t||!int(t.id)||t.id===0||t.id>data.handSerial||!chars.has(t.ch)||typeof t.used!=='boolean')||data.towers.some(t=>!finite(t.spent)||t.spent<getWord(t.word).cost)||data.enemies.some(e=>(e.poisonDps!==undefined&&(!finite(e.poisonDps)||e.poisonDps<0))||(e.poisonUntil!==undefined&&(!finite(e.poisonUntil)||!finite(e.poisonDps)))))throw Error('Invalid word tray');
  for(const k of ['rngState','refreshes','handSerial','hand'])g[k]=data[k];
 }else{
  g.towers=g.towers.map(t=>{const w=getWord(t.word),up=t.level-1;return {...t,level:w.tier+up,spent:w.cost+(up>0?Math.round(w.cost*.75):0)+(up>1?Math.round(w.cost*1.15):0)};});
 }
 g.towers=g.towers.map(t=>({...t}));g.enemies=g.enemies.map(e=>({...e}));g.queue=g.queue.map(e=>({...e}));g.hand=g.hand.map(t=>({...t}));return g;
 }
}
