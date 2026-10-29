import {COMMON_WORDS} from './lexicon.mjs';
// Each recipe has a distinct word; length determines its starting tier.
const SCHOOLS = [
 {type:'splash',icon:'火',name:'烈焰',color:'#c56843',cost:60,damage:24,range:155,rate:1.05,tag:'范围伤害',desc:'爆裂攻击，对目标周围的敌人造成范围伤害。',words:['火','火球','烈火','火焰','流火','火焰山','三昧火','火流星','火树银花','星火燎原','火上浇油']},
 {type:'slow',icon:'冰',name:'寒霜',color:'#659ba7',cost:50,damage:9,range:145,rate:.8,tag:'减速控制',desc:'寒霜使目标移动速度降低 45%，持续 2.1 秒。',words:['冰','冰霜','寒冰','冰雪','寒霜','寒冰箭','冰封术','冰凌花','冰天雪地','冷若冰霜','寒气逼人']},
 {type:'chain',icon:'雷',name:'雷霆',color:'#a38a48',cost:80,damage:31,range:170,rate:1.3,tag:'连锁攻击',desc:'闪电连接最多三个敌人，可对空，对护盾造成双倍伤害。',words:['雷','雷电','惊雷','雷霆','闪电','连环雷','雷霆击','风雷动','雷霆万钧','电闪雷鸣','五雷轰顶']},
 {type:'fast',icon:'风',name:'疾风',color:'#65866d',cost:50,damage:12,range:160,rate:.42,tag:'高速单体',desc:'快速连续攻击，擅长补刀和拦截疾影。',words:['风','风刃','疾风','旋风','狂风','旋风刃','风卷云','追风剑','风卷残云','风驰电掣','风风火火']},
 {type:'heavy',icon:'石',name:'山石',color:'#908176',cost:85,damage:66,range:180,rate:1.8,tag:'破甲重击',desc:'重击无视墨甲护甲，擅长迎击高血敌人；无法攻击飞行怪。',words:['石','巨石','岩石','山石','磐石','落石阵','金刚石','镇山石','稳如泰山','排山倒海','坚如磐石']},
 {type:'aura',icon:'光',name:'辉光',color:'#c1a45a',cost:65,damage:0,range:155,rate:1,tag:'增益辅助',desc:'提高范围内词塔伤害；取最强光环，不叠加。',words:['光','光环','星光','月光','辉光','日月光','星辰光','明月光','光芒万丈','光明磊落','日月同辉']},
 {type:'poison',icon:'毒',name:'毒瘴',color:'#8b8a4b',cost:65,damage:14,range:155,rate:1.1,tag:'持续毒伤',desc:'持续 3 秒的毒伤，抑制回血；同类取最强效果。',words:['毒','毒雾','毒蛇','瘴气','剧毒','毒气弹','毒龙胆','迷魂香','蛇蝎心肠','毒蛇猛兽','笑里藏刀']},
 {type:'sniper',icon:'弓',name:'神射',color:'#94709c',cost:75,damage:46,range:235,rate:1.7,tag:'远程斩杀',desc:'远程精准射击，生命低于 30% 的目标受到 1.8 倍伤害。',words:['弓','弓箭','神箭','飞箭','穿杨','穿云箭','追魂箭','连珠箭','百步穿杨','箭无虚发','百发百中']},
 {type:'income',icon:'金',name:'生财',color:'#b18b44',cost:55,damage:0,range:120,rate:1,tag:'过波生财',desc:'不攻击；每轮结束产出额外墨点，全部财塔合计最多 80。',words:['金','生财','招财','金币','聚宝','摇钱树','聚宝盆','招财猫','招财进宝','财源广进','日进斗金']}
];
const EXTRA_COMBAT_WORDS={"splash": ["火箭", "火墙", "火海", "火雨", "火龙", "烈焰", "炎爆", "爆炎", "流星火", "大火球", "火焰箭", "烈焰箭", "爆裂火球", "烈焰风暴", "火焰之箭", "流星火雨", "野火", "火山"], "slow": ["冰霜箭", "寒冰剑", "冰箭", "冰刃", "冰锥", "冰盾", "冰封", "霜冻", "冰冻", "极寒", "寒气", "雪花", "雪暴", "暴风雪", "冰风暴", "寒冰盾", "冰封万里", "冰龙", "霜龙", "冰晶", "寒流", "冰枪", "冰霜之箭"], "chain": ["雷击", "雷暴", "雷枪", "电弧", "雷箭", "电流", "电球", "雷雨", "天雷", "落雷", "闪电箭", "雷电球", "雷暴术", "雷电风暴", "闪电链", "连锁闪电"], "fast": ["风暴", "飓风", "风墙", "风龙", "旋风斩", "疾风箭", "风刃术", "暴风", "风之刃", "风暴之眼", "乘风破浪", "疾风骤雨"], "heavy": ["落石", "巨岩", "石墙", "岩墙", "岩盾", "岩刺", "山岳", "大地", "地震", "岩崩", "地刺", "滚石", "落石术", "岩石盾", "泰山压顶", "山崩地裂", "地动山摇"], "aura": ["圣光", "曙光", "护盾", "守护", "光盾", "光辉", "神光", "祝福", "光明", "月华", "守护光环", "神圣之光", "圣光守护", "光明之盾", "星辰之力"], "poison": ["毒云", "毒箭", "毒液", "毒气", "毒刺", "毒牙", "毒刃", "毒火", "毒龙", "毒花", "毒素", "毒蘑菇", "剧毒箭", "剧毒云", "腐蚀", "瘴云", "剧毒新星", "毒雾弥漫"], "sniper": ["箭雨", "弩箭", "利箭", "穿云", "追魂", "长弓", "短弓", "强弩", "狙击", "穿甲箭", "爆裂箭", "连弩", "万箭齐发", "箭如雨下"], "income": ["财富", "金钱", "宝藏", "宝石", "黄金", "钱币", "铜钱", "银币", "银钱", "金库", "发财", "黄金屋", "金银财宝", "财运亨通", "财源滚滚", "点石成金"]};
for(const school of SCHOOLS)school.words=[...new Set([...school.words,...EXTRA_COMBAT_WORDS[school.type]])];
const POWER=[0,.48,1,1.95,3.3], PRICE=[0,.44,1,1.55,2.35];
const COMBAT_WORDS=SCHOOLS.flatMap(s=>s.words.map(word=>{
 const tier=[...word].length;
 return {...s,words:undefined,word,tier,maxLevel:tier+2,cost:Math.round(s.cost*PRICE[tier]),damage:Math.round(s.damage*POWER[tier]),range:s.range+(tier-2)*12,aura:.15+tier*.1,income:7*tier};
}));
const BASIC_SCHOOL={type:'basic',icon:'文',name:'文阵',color:'#748870',cost:55,damage:18,range:155,rate:.9,tag:'均衡单体',desc:'文字凝成灵力，对单个敌人造成稳定伤害。'};
const SEMANTIC_SCHOOLS=[[/毒|瘴|腐|蚀|疫|蛊/,'poison'],[/冰|雪|霜|寒|冻|冷/,'slow'],[/火|炎|焰|烧|爆|燃/,'splash'],[/雷|电|霆/,'chain'],[/箭|弓|弩|射|狙|穿/,'sniper'],[/财|钱|金|宝|币|银|富/,'income'],[/风|速|疾|旋/,'fast'],[/石|岩|山|地|土|震/,'heavy'],[/光|圣|星|月|灵|护|盾|祝|明/,'aura']];
const combatSet=new Set(COMBAT_WORDS.map(w=>w.word));
export const WORDS=[...COMBAT_WORDS,...COMMON_WORDS.filter(word=>!combatSet.has(word)).map(word=>{const type=SEMANTIC_SCHOOLS.find(([re])=>re.test(word))?.[1];const s=type?SCHOOLS.find(s=>s.type===type):BASIC_SCHOOL;const tier=[...word].length;return {...s,words:undefined,word,tier,maxLevel:tier+2,cost:Math.round(s.cost*PRICE[tier]),damage:Math.round(s.damage*POWER[tier]),range:s.range+(tier-2)*12,aura:.15+tier*.1,income:7*tier};})];
export const GRADES=['','凡字','灵词','妙语','天成'];
export const HAND_SIZE=16;
export const HINT_COST=100;
export const SKILL_COOLDOWN=30, SKILL_BASE_COST=30, SKILL_COST_STEP=15;
const WORD_INDEX=new Map(WORDS.map(w=>[w.word,w]));
const WORD_PREFIXES=new Set(WORDS.flatMap(w=>Array.from({length:w.tier},(_,i)=>w.word.slice(0,i+1))));
export const getWord=word=>WORD_INDEX.get(word);
export function towerStats(t){const w=getWord(t.word),up=t.level-w.tier;return {damage:Math.round(w.damage*(1+up*.65)),range:w.range+up*15,rate:w.rate/(1+up*.14),aura:w.aura,income:Math.round(w.income*(1+up*.5))};}
export function matchWord(chars){if(chars.length<1||chars.length>4)return null;return getWord(chars.join(''))||null;}
export const CHAPTERS=[{name:'青山初试',area:'青山道',intro:'墨影初现，试以文字守住山门。',waves:6,hp:20,ink:200},{name:'竹海听风',area:'竹隐谷',intro:'疾影穿竹而来，以寒霜留住它们。',waves:8,hp:18,ink:230},{name:'长夜守卷',area:'藏书阁',intro:'墨潮席卷长夜，守住最后一卷光。',waves:10,hp:24,ink:300}].map(ch=>({...ch,rounds:ch.waves,wavesPerRound:3,waves:ch.waves*3}));
export const PATH=[{x:-30,y:150},{x:190,y:150},{x:190,y:340},{x:440,y:340},{x:440,y:145},{x:690,y:145},{x:690,y:370},{x:940,y:370}];
export const FREE_PAD_COUNT=12;
export const PADS=[{x:100,y:78},{x:110,y:240},{x:265,y:228},{x:277,y:420},{x:360,y:265},{x:365,y:78},{x:520,y:225},{x:600,y:75},{x:610,y:305},{x:770,y:230},{x:783,y:445},{x:855,y:292},{x:250,y:75},{x:480,y:430},{x:620,y:460},{x:800,y:85}];
const seg=PATH.slice(1).map((p,i)=>Math.hypot(p.x-PATH[i].x,p.y-PATH[i].y));
export const LENGTH=seg.reduce((a,b)=>a+b,0);
export function position(d){for(let i=0;i<seg.length;i++){if(d<=seg[i]){const t=Math.max(0,d/seg[i]);return{x:PATH[i].x+(PATH[i+1].x-PATH[i].x)*t,y:PATH[i].y+(PATH[i+1].y-PATH[i].y)*t};}d-=seg[i];}return {...PATH.at(-1)};}
export const ENEMIES={
 normal:{name:'墨影',hp:45,speed:43,reward:3,harm:1,desc:'普通地面墨影，成群推进。'},
 swift:{name:'疾影',hp:30,speed:76,reward:2,harm:1,desc:'移动快、生命低；减速或高速攻击更有效。'},
 armor:{name:'墨甲',hp:100,speed:31,reward:5,harm:2,desc:'普通攻击减伤 30%；山石重击无视护甲。'},
 flying:{name:'飞羽',hp:40,speed:66,reward:3,harm:1,desc:'沿空中捷径直飞山门；山石无法攻击，远程塔可对空。'},
 tank:{name:'巨魁',hp:230,speed:24,reward:8,harm:3,desc:'生命很高，移动慢；破甲重击、持续毒伤和斩杀适合迎击。'},
 shield:{name:'玄盾',hp:85,speed:36,reward:5,harm:2,desc:'拥有额外护盾；雷霆对护盾双倍伤害，落墨无视护盾。'},
 regen:{name:'回春',hp:115,speed:35,reward:5,harm:2,desc:'每秒恢复最大生命的 2%；中毒期间停止回血。'},
 split:{name:'裂墨',hp:100,speed:39,reward:3,harm:2,desc:'被击败后分裂为两个小墨影；范围攻击可清理子体。'},
 small:{name:'墨点',hp:20,speed:62,reward:1,harm:1,desc:'裂墨的子体，生命低，移动较快。'},
 boss:{name:'墨魁',hp:330,speed:25,reward:18,harm:4,desc:'每 3 轮及章节末轮的最后一波出现，漏过山门损失 4 点生命。'}
};
const AIR_START={x:-30,y:85},AIR_END={x:940,y:370};
export const AIR_LENGTH=Math.hypot(AIR_END.x-AIR_START.x,AIR_END.y-AIR_START.y);
export const enemyLength=e=>e.kind==='flying'?AIR_LENGTH:LENGTH;
export function enemyPosition(e){if(e.kind!=='flying')return position(e.d);const t=Math.max(0,Math.min(1,e.d/AIR_LENGTH));return{x:AIR_START.x+(AIR_END.x-AIR_START.x)*t,y:AIR_START.y+(AIR_END.y-AIR_START.y)*t};}
export function wavePlan(chapter,wave){const round=Math.max(1,Math.ceil(wave/3)),part=(Math.max(1,wave)-1)%3+1;const boss=part===3&&(round%3===0||round===CHAPTERS[chapter].rounds);const pool=['normal','normal','normal','swift'];if(round>=2)pool.push('armor','flying',...(part===2?['flying','swift']:[]));if(round>=3)pool.push('tank','shield',...(part===1?['shield']:[]));if(round>=4)pool.push('regen','split');return{round,part,pool,boss,count:Math.min(80,8+round*3+chapter*2+(part-1)*2),title:boss?'墨魁压境':round>=4?'异影来袭':round>=2&&part===2?'飞羽突袭':round>=3?'重阵推进':'墨影来袭'};}
export class Game {
 constructor(chapter=0,seed=(Math.random()*4294967296)>>>0){this.chapter=chapter;this.wave=0;this.endless=false;this.unlockedPads=Array.from({length:FREE_PAD_COUNT},(_,i)=>i);this.hp=CHAPTERS[chapter].hp;this.ink=CHAPTERS[chapter].ink;this.towers=[];this.enemies=[];this.effects=[];this.queue=[];this.time=0;this.spawnTime=0;this.autoWaveAt=0;this.phase='prepare';this.kills=0;this.nextId=1;this.skillReady=0;this.skillUses=0;this.totalEarned=0;this.events=[];this.rngState=(seed>>>0)||1;this.refreshes=0;this.handSerial=0;this.hand=[];for(let i=0;i<4;i++)this.random();this.drawHand();}
 emit(type,data={}){this.events.push({type,...data});}
 random(){let x=this.rngState;x^=x<<13;x^=x>>>17;x^=x<<5;this.rngState=x>>>0;return this.rngState/4294967296;}
 drawHand(){
  this.hintWord=null;
  const pick=xs=>xs[Math.floor(this.random()*xs.length)];
  const attack=COMBAT_WORDS.filter(w=>w.tier===2&&w.damage>0);
  const short=COMBAT_WORDS.filter(w=>w.tier===2),medium=COMBAT_WORDS.filter(w=>w.tier===3),long=COMBAT_WORDS.filter(w=>w.tier===4);
  const starter=pick(attack);
  const letters=[...starter.word,starter.icon,...pick(short).word,...pick(medium).word,...pick(long).word];
  const pool=COMBAT_WORDS.flatMap(w=>[...w.word]);
  while(letters.length<HAND_SIZE)letters.push(pick(pool));
  for(let i=letters.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[letters[i],letters[j]]=[letters[j],letters[i]];}
  this.hand=letters.map(ch=>({id:++this.handSerial,ch,used:false}));
 }
 padUnlocked(pad){return this.unlockedPads.includes(pad);}
 unlockCost(){return 40+(this.unlockedPads.length-FREE_PAD_COUNT)*20;}
 unlockPad(pad){if(!PADS[pad]||this.padUnlocked(pad)||['won','lost'].includes(this.phase)||this.ink<this.unlockCost())return false;const cost=this.unlockCost();this.ink-=cost;this.unlockedPads.push(pad);this.emit('unlock',{pad,cost});return true;}
 hintCost(){return this.hintWord&&this.tilesFor(this.hintWord)?0:HINT_COST;}
 requestHint(){if(['won','lost'].includes(this.phase))return false;if(this.hintWord&&this.tilesFor(this.hintWord))return {word:this.hintWord,cost:0};const word=this.availableWords().sort((a,b)=>b.tier-a.tier||a.cost-b.cost)[0];if(!word||this.ink<HINT_COST)return false;this.ink-=HINT_COST;this.hintWord=word.word;this.emit('hint',{word:word.word,cost:HINT_COST});return {word:word.word,cost:HINT_COST};}
 refreshCost(){return Math.min(40,15+this.refreshes*5);}
 refreshHand(){if(['won','lost'].includes(this.phase)||this.ink<this.refreshCost())return false;const cost=this.refreshCost();this.ink-=cost;this.refreshes++;this.drawHand();this.emit('refresh',{cost});return true;}
 tilesFor(word){const ids=[];for(const ch of word){const tile=this.hand.find(t=>!t.used&&t.ch===ch&&!ids.includes(t.id));if(!tile)return null;ids.push(tile.id);}return ids;}
 availableWords(){const key=this.hand.map(t=>t.used?'_':t.ch).join('');if(this._wordCacheKey!==key){const counts=new Map();for(const t of this.hand)if(!t.used)counts.set(t.ch,(counts.get(t.ch)||0)+1);const found=[];const visit=prefix=>{for(const [ch,count]of counts){if(!count)continue;const next=prefix+ch;if(!WORD_PREFIXES.has(next))continue;const w=getWord(next);if(w)found.push(w);if(next.length<4){counts.set(ch,count-1);visit(next);counts.set(ch,count);}}};visit('');this._wordCacheKey=key;this._wordCache=found;}return this._wordCache.slice();}
 canBuild(word,ids){const w=getWord(word);if(!w||this.ink<w.cost||['won','lost'].includes(this.phase))return false;const chosen=ids??this.tilesFor(word);if(!chosen||chosen.length!==w.tier||new Set(chosen).size!==chosen.length)return false;const tiles=chosen.map(id=>this.hand.find(t=>t.id===id&&!t.used));return tiles.every(Boolean)&&tiles.map(t=>t.ch).join('')===word;}
 build(word,pad,ids){const w=getWord(word),chosen=ids??this.tilesFor(word);if(!PADS[pad]||!this.padUnlocked(pad)||this.towers.some(t=>t.pad===pad)||!this.canBuild(word,chosen))return false;this.ink-=w.cost;for(const id of chosen)this.hand.find(t=>t.id===id).used=true;if(this.hintWord&&!this.tilesFor(this.hintWord))this.hintWord=null;this.towers.push({word,pad,level:w.tier,spent:w.cost,cooldown:0,id:this.nextId++});this.emit('build',{word});return true;}
 upgrade(id){const t=this.towers.find(t=>t.id===id);if(!t||t.level>=getWord(t.word).maxLevel||['won','lost'].includes(this.phase))return false;const cost=this.upgradeCost(t);if(this.ink<cost)return false;this.ink-=cost;t.spent+=cost;t.level++;this.emit('upgrade');return true;}
 upgradeCost(t){return Math.round(getWord(t.word).cost*(t.level===getWord(t.word).tier?.75:1.15));}
 sell(id){const t=this.towers.find(t=>t.id===id);if(!t||['won','lost'].includes(this.phase))return false;this.ink+=Math.floor(t.spent*.7);this.towers=this.towers.filter(x=>x.id!==id);this.emit('sell');return true;}
 continueEndless(){if(this.phase!=='won'||this.endless)return false;this.endless=true;this.phase='prepare';this.events=[];this.emit('endless');return true;}
 roundInfo(next=this.phase==='prepare'||this.phase==='intermission'){return wavePlan(this.chapter,this.wave+(next?1:0));}
 wavePreview(){return wavePlan(this.chapter,this.wave+1);}
 startWave(){if(!['prepare','intermission'].includes(this.phase))return false;this.wave++;this.phase='battle';const plan=wavePlan(this.chapter,this.wave);this.queue=Array.from({length:plan.count},(_,i)=>({kind:plan.boss&&i===plan.count-1?'boss':plan.pool[Math.floor(this.random()*plan.pool.length)]}));this.spawnTime=0;this.autoWaveAt=0;this.emit('wave');return true;}
 spawn(kind,distance=0){const round=Math.max(1,Math.ceil(this.wave/3)),part=(Math.max(1,this.wave)-1)%3;const scale=(1+(round-1)*.36+part*.08+this.chapter*.45)*1.25;const st=ENEMIES[kind];const e={id:this.nextId++,kind,hp:st.hp*scale,maxHp:st.hp*scale,speed:st.speed*(1+this.chapter*.07),reward:st.reward,harm:st.harm,d:Math.max(0,distance),slowUntil:0};if(kind==='shield'){e.shield=55*scale;e.maxShield=e.shield;}this.enemies.push(e);return e;}
 skillCost(){return SKILL_BASE_COST+this.skillUses*SKILL_COST_STEP;}
 skill(){const cost=this.skillCost();if(this.phase!=='battle'||this.time<this.skillReady||this.ink<cost)return false;this.ink-=cost;this.skillUses++;this.skillReady=this.time+SKILL_COOLDOWN;for(const e of this.enemies){e.hp-=100;e.slowUntil=this.time+3;}this.effects.push({kind:'rain',life:1,max:1});this.emit('skill',{cost,nextCost:this.skillCost()});return true;}
 step(dt){dt=Math.max(0,Math.min(dt,.1));for(const fx of this.effects)fx.life-=dt;this.effects=this.effects.filter(f=>f.life>0);if(this.phase==='intermission'){this.time+=dt;if(this.time>=this.autoWaveAt)this.startWave();return;}if(this.phase!=='battle')return;this.time+=dt;this.spawnTime-=dt;if(this.queue.length&&this.spawnTime<=0){this.spawn(this.queue.shift().kind);this.spawnTime=Math.max(.4,1.03-Math.ceil(this.wave/3)*.035);}
 for(const e of this.enemies){if(e.kind==='regen'&&e.hp>0&&!(e.poisonUntil>this.time))e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.02*dt);if(e.hp>0&&e.poisonUntil>this.time-dt)e.hp-=Math.min(dt,Math.max(0,e.poisonUntil-(this.time-dt)))*e.poisonDps;if(e.hp>0)e.d+=e.speed*dt*(e.slowUntil>this.time?.55:1);}
 for(const t of this.towers){const w=getWord(t.word);if(w.type==='aura'||w.type==='income')continue;t.cooldown-=dt;if(t.cooldown>0)continue;const p=PADS[t.pad],stats=towerStats(t),range=stats.range;const targets=this.enemies.filter(e=>e.hp>0&&e.d<enemyLength(e)&&!(e.kind==='flying'&&w.type==='heavy')&&Math.hypot(enemyPosition(e).x-p.x,enemyPosition(e).y-p.y)<=range).sort((a,b)=>b.d/enemyLength(b)-a.d/enemyLength(a));if(!targets.length)continue;const target=targets[0];let damage=stats.damage;const buffs=this.towers.filter(a=>getWord(a.word).type==='aura'&&Math.hypot(PADS[a.pad].x-p.x,PADS[a.pad].y-p.y)<=towerStats(a).range).map(a=>towerStats(a).aura);if(buffs.length)damage*=1+Math.max(...buffs);if(w.type==='sniper'&&target.hp/target.maxHp<.3)damage*=1.8;const hit=(e,m=1)=>{let amount=damage*m*(e.kind==='armor'&&w.type!=='heavy'?.7:1);if(e.shield>0){const bonus=w.type==='chain'?2:1,absorbed=Math.min(e.shield,amount*bonus);e.shield-=absorbed;amount-=absorbed/bonus;}e.hp-=Math.max(0,amount);this.effects.push({kind:'bolt',from:p,to:enemyPosition(e),color:w.color,life:.19,max:.19});};hit(target);if(w.type==='poison'){target.poisonDps=Math.max(target.poisonUntil>this.time?target.poisonDps:0,damage*.6);target.poisonUntil=this.time+3;}if(w.type==='slow')target.slowUntil=this.time+2.1;if(w.type==='splash'){const q=enemyPosition(target);for(const e of this.enemies){if(e!==target&&e.hp>0&&Math.hypot(enemyPosition(e).x-q.x,enemyPosition(e).y-q.y)<65)hit(e,.65);}this.effects.push({kind:'blast',to:q,color:w.color,life:.35,max:.35});}if(w.type==='chain'){for(let i=1;i<Math.min(3,targets.length);i++)hit(targets[i],Math.pow(.72,i));}t.cooldown=stats.rate;}
 for(const e of this.enemies){if(e.hp<=0){this.ink+=e.reward;this.totalEarned+=e.reward;this.kills++;this.effects.push({kind:'pop',to:enemyPosition(e),color:'#556b58',life:.45,max:.45});if(e.kind==='split'){this.spawn('small',e.d);this.spawn('small',e.d-12);}}else if(e.d>=enemyLength(e)){this.hp=Math.max(0,this.hp-e.harm);this.emit('leak');}}
 this.enemies=this.enemies.filter(e=>e.hp>0&&e.d<enemyLength(e));if(this.hp<=0){this.phase='lost';this.emit('lost');}else if(!this.queue.length&&!this.enemies.length){const plan=wavePlan(this.chapter,this.wave),roundEnd=plan.part===3;const income=roundEnd?Math.min(80,this.towers.filter(t=>getWord(t.word).type==='income').reduce((sum,t)=>sum+towerStats(t).income,0)):0;const reward=8+plan.round*2+(roundEnd?20+plan.round*3:0)+income;this.ink+=reward;if(roundEnd){this.refreshes=0;this.hp=Math.min(CHAPTERS[this.chapter].hp,this.hp+2);}if(!this.endless&&this.wave>=CHAPTERS[this.chapter].waves)this.phase='won';else if(roundEnd)this.phase='prepare';else{this.phase='intermission';this.autoWaveAt=this.time+6;}this.emit(this.phase==='won'?'won':'clear',{income,reward,roundEnd});}}
 export(){const {effects,events,_wordCacheKey,_wordCache,...data}=this;return {...data,towers:this.towers.map(t=>({...t})),enemies:this.enemies.map(e=>({...e})),queue:this.queue.map(e=>({...e})),hand:this.hand.map(t=>({...t})),unlockedPads:[...this.unlockedPads],version:3};}
 static restore(data){
 const finite=n=>typeof n==='number'&&Number.isFinite(n),int=n=>Number.isInteger(n)&&n>=0,kind=k=>Object.hasOwn(ENEMIES,k);
 if(!data||![1,2,3].includes(data.version)||!int(data.chapter)||!CHAPTERS[data.chapter]||!int(data.wave)||(data.endless!==undefined&&typeof data.endless!=='boolean')||(!data.endless&&data.wave>(data.version<3?CHAPTERS[data.chapter].rounds:CHAPTERS[data.chapter].waves))||!['prepare','battle','intermission','won','lost'].includes(data.phase)||!['ink','hp','time','skillReady','totalEarned'].every(k=>finite(data[k])&&data[k]>=0)||data.hp>CHAPTERS[data.chapter].hp||!['kills','nextId'].every(k=>int(data[k]))||!finite(data.spawnTime)||!Array.isArray(data.towers)||!Array.isArray(data.enemies)||!Array.isArray(data.queue))throw Error('Invalid save');
 if(data.towers.length>PADS.length||new Set(data.towers.map(t=>t?.pad)).size!==data.towers.length||data.towers.some(t=>!t||!WORDS.some(w=>w.word===t.word)||!int(t.pad)||!PADS[t.pad]||(!Number.isInteger(t.level)||(data.version===1?![1,2,3].includes(t.level):t.level<getWord(t.word).tier||t.level>getWord(t.word).maxLevel))||!int(t.id)||!finite(t.cooldown))||data.enemies.some(e=>!e||!kind(e.kind)||!int(e.id)||!['hp','maxHp','speed','reward','harm','d','slowUntil'].every(k=>finite(e[k]))||e.maxHp<=0||e.speed<=0||e.d<0)||data.queue.some(e=>!e||!kind(e.kind)))throw Error('Invalid save');
 if(data.enemies.some(e=>(e.shield!==undefined&&(!finite(e.shield)||e.shield<0))||(e.maxShield!==undefined&&(!finite(e.maxShield)||e.maxShield<0))))throw Error('Invalid shield state');
 if(data.skillUses!==undefined&&!int(data.skillUses))throw Error('Invalid skill use count');
 if(data.autoWaveAt!==undefined&&(!finite(data.autoWaveAt)||data.autoWaveAt<0))throw Error('Invalid wave timer');
 const g=new Game(data.chapter);g.autoWaveAt=data.autoWaveAt??0;g.endless=data.endless===true;g.skillUses=data.skillUses??0;for(const k of ['wave','hp','ink','towers','enemies','queue','time','spawnTime','phase','kills','nextId','skillReady','totalEarned'])g[k]=data[k];
 if(data.version>=2){
  const chars=new Set(WORDS.flatMap(w=>[...w.word]));
  if(!int(data.rngState)||data.rngState===0||data.rngState>4294967295||!int(data.refreshes)||!int(data.handSerial)||!Array.isArray(data.hand)||data.hand.length!==HAND_SIZE||new Set(data.hand.map(t=>t?.id)).size!==HAND_SIZE||data.hand.some(t=>!t||!int(t.id)||t.id===0||t.id>data.handSerial||!chars.has(t.ch)||typeof t.used!=='boolean')||data.towers.some(t=>!finite(t.spent)||t.spent<getWord(t.word).cost)||data.enemies.some(e=>(e.poisonDps!==undefined&&(!finite(e.poisonDps)||e.poisonDps<0))||(e.poisonUntil!==undefined&&(!finite(e.poisonUntil)||!finite(e.poisonDps)))))throw Error('Invalid word tray');
  for(const k of ['rngState','refreshes','handSerial','hand'])g[k]=data[k];
 }else{
  g.towers=g.towers.map(t=>{const w=getWord(t.word),up=t.level-1;return {...t,level:w.tier+up,spent:w.cost+(up>0?Math.round(w.cost*.75):0)+(up>1?Math.round(w.cost*1.15):0)};});
 }
 if(data.version<3)g.wave=data.phase==='prepare'||data.phase==='won'?data.wave*3:Math.max(1,(data.wave-1)*3+1);
 if(data.unlockedPads!==undefined){if(!Array.isArray(data.unlockedPads)||data.unlockedPads.length<FREE_PAD_COUNT||data.unlockedPads.length>PADS.length||new Set(data.unlockedPads).size!==data.unlockedPads.length||data.unlockedPads.some(i=>!int(i)||!PADS[i])||Array.from({length:FREE_PAD_COUNT},(_,i)=>i).some(i=>!data.unlockedPads.includes(i)))throw Error('Invalid unlocked pads');g.unlockedPads=[...data.unlockedPads];}
 if(g.towers.some(t=>!g.padUnlocked(t.pad)))throw Error('Tower on locked pad');
 if(data.hintWord!==undefined&&data.hintWord!==null){if(typeof data.hintWord!=='string'||!getWord(data.hintWord)||!g.tilesFor(data.hintWord))throw Error('Invalid saved hint');g.hintWord=data.hintWord;}
 g.towers=g.towers.map(t=>({...t}));g.enemies=g.enemies.map(e=>({...e}));g.queue=g.queue.map(e=>({...e}));g.hand=g.hand.map(t=>({...t}));return g;
 }
}
