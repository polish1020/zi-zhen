import {COMMON_WORDS} from './lexicon.mjs';
// Each recipe has a distinct word; length determines its starting tier.
const SCHOOLS = [
 {type:'splash',icon:'火',name:'烈焰',color:'#c56843',cost:60,damage:24,range:155,rate:1.05,tag:'范围伤害',desc:'爆裂攻击，对目标周围的敌人造成范围伤害。',words:['火','火球','烈火','火焰','流火','火焰山','三昧火','火流星','火树银花','星火燎原','火上浇油']},
 {type:'slow',icon:'冰',name:'寒霜',color:'#659ba7',cost:50,damage:9,range:145,rate:.8,tag:'减速控制',desc:'寒霜使目标移动速度降低 45%，持续 2.1 秒。',words:['冰','冰霜','寒冰','冰雪','寒霜','寒冰箭','冰封术','冰凌花','冰天雪地','冷若冰霜','寒气逼人']},
 {type:'chain',icon:'雷',name:'雷霆',color:'#a38a48',cost:80,damage:31,range:170,rate:1.3,tag:'连锁攻击',desc:'闪电连接最多三个敌人，可对空，对护盾造成双倍伤害。',words:['雷','雷电','惊雷','雷霆','闪电','连环雷','雷霆击','风雷动','雷霆万钧','电闪雷鸣','五雷轰顶']},
 {type:'fast',icon:'风',name:'疾风',color:'#65866d',cost:50,damage:12,range:160,rate:.42,tag:'高速单体',desc:'快速连续攻击，擅长补刀和拦截疾影。',words:['风','风刃','疾风','旋风','狂风','旋风刃','风卷云','追风剑','风卷残云','风驰电掣','风风火火']},
 {type:'heavy',icon:'石',name:'山石',color:'#908176',cost:85,damage:66,range:180,rate:1.8,tag:'破甲重击',desc:'重击无视墨甲护甲，擅长迎击高血敌人；无法攻击飞行怪。',words:['石','巨石','岩石','山石','磐石','落石阵','金刚石','镇山石','稳如泰山','排山倒海','坚如磐石']},
 {type:'aura',icon:'光',name:'辉光',color:'#c1a45a',cost:65,damage:8,range:155,rate:1.4,tag:'圣光照明 · 增伤光环',desc:'主动攻击并照明目标 3 秒，解除其护阵师减伤；范围内友塔增伤，取最强光环不叠加。',words:['光','光环','星光','月光','辉光','日月光','星辰光','明月光','光芒万丈','光明磊落','日月同辉']},
 {type:'poison',icon:'毒',name:'毒瘴',color:'#8b8a4b',cost:65,damage:14,range:155,rate:1.1,tag:'持续毒伤',desc:'持续 3 秒的毒伤，抑制回血；同类取最强效果。',words:['毒','毒雾','毒蛇','瘴气','剧毒','毒气弹','毒龙胆','迷魂香','蛇蝎心肠','毒蛇猛兽','笑里藏刀']},
 {type:'sniper',icon:'弓',name:'神射',color:'#94709c',cost:75,damage:46,range:235,rate:1.7,tag:'远程斩杀',desc:'远程精准射击，生命低于 30% 的目标受到 1.8 倍伤害。',words:['弓','弓箭','神箭','飞箭','穿杨','穿云箭','追魂箭','连珠箭','百步穿杨','箭无虚发','百发百中']},
 {type:'income',icon:'金',name:'生财',color:'#b18b44',cost:55,damage:6,range:150,rate:1.6,tag:'点金赏金 · 轮末生财',desc:'主动攻击并标记赏金 4 秒，目标被任意词塔击杀都额外赚墨；轮末产墨，赏金有每轮上限。',words:['金','生财','招财','金币','聚宝','摇钱树','聚宝盆','招财猫','招财进宝','财源广进','日进斗金']}
];
SCHOOLS.push(
 {type:'pierce',icon:'剑',name:'剑气',color:'#648b9b',cost:70,damage:30,range:190,rate:1.2,tag:'直线穿透',desc:'剑气贯穿同一直线上的敌人，后续目标受到 70% 伤害；可对空。',words:['剑','剑气','飞剑','利剑','剑雨','御剑术','破阵剑','万剑归宗','剑气纵横']},
 {type:'pulse',icon:'水',name:'潮汐',color:'#527f9e',cost:65,damage:18,range:135,rate:1.45,tag:'环形震荡',desc:'以词塔为中心冲击范围内所有敌人，每次最多命中 8 个；可对空。',words:['水','水波','浪潮','潮汐','水龙','水龙卷','惊涛浪','惊涛骇浪','波涛汹涌']},
 {type:'mark',icon:'咒',name:'咒印',color:'#986586',cost:60,damage:16,range:165,rate:1.1,tag:'易伤咒印',desc:'命中施加 3 秒咒印，使目标受到的直接攻击伤害提高 15%；同类取最强。',words:['咒','咒印','符咒','诅咒','魔咒','封魔印','破甲咒','画地为牢','符咒之力']},
 {type:'echo',icon:'幻',name:'幻影',color:'#8a75ab',cost:60,damage:21,range:175,rate:1.2,tag:'分身追击',desc:'主攻击后产生一次 45% 伤害的幻影追击，优先攻击范围内另一目标。',words:['幻','幻影','分身','梦境','幻术','幻影箭','分身术','镜花水月','如梦似幻']}
);
const EXTRA_COMBAT_WORDS={"splash": ["火箭", "火墙", "火海", "火雨", "火龙", "烈焰", "炎爆", "爆炎", "流星火", "大火球", "火焰箭", "烈焰箭", "爆裂火球", "烈焰风暴", "火焰之箭", "流星火雨", "野火", "火山"], "slow": ["冰霜箭", "寒冰剑", "冰箭", "冰刃", "冰锥", "冰盾", "冰封", "霜冻", "冰冻", "极寒", "寒气", "雪花", "雪暴", "暴风雪", "冰风暴", "寒冰盾", "冰封万里", "冰龙", "霜龙", "冰晶", "寒流", "冰枪", "冰霜之箭"], "chain": ["雷击", "雷暴", "雷枪", "电弧", "雷箭", "电流", "电球", "雷雨", "天雷", "落雷", "闪电箭", "雷电球", "雷暴术", "雷电风暴", "闪电链", "连锁闪电"], "fast": ["风暴", "飓风", "风墙", "风龙", "旋风斩", "疾风箭", "风刃术", "暴风", "风之刃", "风暴之眼", "乘风破浪", "疾风骤雨"], "heavy": ["落石", "巨岩", "石墙", "岩墙", "岩盾", "岩刺", "山岳", "大地", "地震", "岩崩", "地刺", "滚石", "落石术", "岩石盾", "泰山压顶", "山崩地裂", "地动山摇"], "aura": ["圣光", "曙光", "护盾", "守护", "光盾", "光辉", "神光", "祝福", "光明", "月华", "守护光环", "神圣之光", "圣光守护", "光明之盾", "星辰之力"], "poison": ["毒云", "毒箭", "毒液", "毒气", "毒刺", "毒牙", "毒刃", "毒火", "毒龙", "毒花", "毒素", "毒蘑菇", "剧毒箭", "剧毒云", "腐蚀", "瘴云", "剧毒新星", "毒雾弥漫"], "sniper": ["箭雨", "弩箭", "利箭", "穿云", "追魂", "长弓", "短弓", "强弩", "狙击", "穿甲箭", "爆裂箭", "连弩", "万箭齐发", "箭如雨下"], "income": ["财富", "金钱", "宝藏", "宝石", "黄金", "钱币", "铜钱", "银币", "银钱", "金库", "发财", "黄金屋", "金银财宝", "财运亨通", "财源滚滚", "点石成金"]};
for(const school of SCHOOLS)school.words=[...new Set([...school.words,...(EXTRA_COMBAT_WORDS[school.type]||[])])];
const POWER=[0,.48,1,1.95,3.3], PRICE=[0,.44,1,1.55,2.35];
const COMBAT_WORDS=SCHOOLS.flatMap(s=>s.words.map(word=>{
 const tier=[...word].length;
 return {...s,words:undefined,word,tier,maxLevel:tier+2,cost:Math.round(s.cost*PRICE[tier]),damage:Math.round(s.damage*POWER[tier]),range:s.range+(tier-2)*12,aura:.15+tier*.1,income:5*tier};
}));
const BASIC_SCHOOL={type:'basic',icon:'文',name:'文阵',color:'#748870',cost:55,damage:18,range:155,rate:.9,tag:'均衡单体',desc:'文字凝成灵力，对单个敌人造成稳定伤害。'};
const SEMANTIC_SCHOOLS=[[/毒|瘴|腐|蚀|疫|蛊/,'poison'],[/冰|雪|霜|寒|冻|冷/,'slow'],[/火|炎|焰|烧|爆|燃/,'splash'],[/雷|电|霆/,'chain'],[/箭|弓|弩|射|狙|穿/,'sniper'],[/财|钱|金|宝|币|银|富/,'income'],[/风|速|疾|旋/,'fast'],[/石|岩|山|地|土|震/,'heavy'],[/光|圣|星|月|灵|护|盾|祝|明/,'aura']];
SEMANTIC_SCHOOLS.unshift([/剑|刃/,'pierce'],[/水|潮|浪|波|涌/,'pulse'],[/咒|符|诅|封/,'mark'],[/幻|梦|镜/,'echo']);
const combatSet=new Set(COMBAT_WORDS.map(w=>w.word));
export const WORDS=[...COMBAT_WORDS,...COMMON_WORDS.filter(word=>!combatSet.has(word)).map(word=>{const type=SEMANTIC_SCHOOLS.find(([re])=>re.test(word))?.[1];const s=type?SCHOOLS.find(s=>s.type===type):BASIC_SCHOOL;const tier=[...word].length;return {...s,words:undefined,word,tier,maxLevel:tier+2,cost:Math.round(s.cost*PRICE[tier]),damage:Math.round(s.damage*POWER[tier]),range:s.range+(tier-2)*12,aura:.15+tier*.1,income:5*tier};})];
export const GRADES=['','凡字','灵词','妙语','天成'];
export function gradeEffect(w){
 const n=w.tier;
 const effects={
 splash:n>=4?'爆炸半径 90；额外灼烧 2 秒（每秒 18% 攻击）':n>=3?'爆炸半径扩大至 80':'爆炸半径 65',
 slow:n>=4?'减速 55%；每目标每 4 秒可冰冻 0.4 秒':n>=3?'减速强化为 55%':'减速 45%，持续 2.1 秒',
 chain:`最多连锁 ${n>=4?5:n>=3?4:3} 个目标；雷击护盾双倍伤害`,
 fast:n>=3?`每第三次攻击额外追击 ${n>=4?70:35}% 伤害`:'高速持续单体攻击',
 heavy:n>=4?'无视护甲；附加目标最大生命 2% 伤害（上限 60）':n>=3?'无视护甲；重击使目标破甲 3 秒':'无视护甲；无法对空',
 aura:n>=4?'光环增伤 55%、攻速提高 12%；照明解除护阵':n>=3?'光环增伤 45%、攻速提高 6%；照明解除护阵':`光环增伤 ${Math.round(w.aura*100)}%；照明解除护阵`,
 poison:n>=4?'毒伤持续 5 秒；扩散至附近最多 2 个目标':n>=3?'毒伤持续 4 秒；中毒期间停止回血':'毒伤持续 3 秒；中毒期间停止回血',
 sniper:n>=4?'生命低于 40% 时伤害 ×2.2':n>=3?'生命低于 35% 时伤害 ×2':'生命低于 30% 时伤害 ×1.8',
 income:`每轮产墨 ${w.income}；击杀赏金 +${n>=4?3:n>=3?2:1}，全体金塔每轮赏金上限 ${n>=4?35:n>=3?25:15}`,
 pierce:`直线最多穿透 ${n>=4?5:n>=3?4:3} 个目标，后续伤害 ${n>=4?85:70}%`,
 pulse:n>=4?'环形冲击最多 12 个目标，减速 1 秒':n>=3?'环形冲击最多 10 个目标':'环形冲击最多 8 个目标',
 mark:`咒印易伤 ${n>=4?30:n>=3?22:15}%，持续 ${n>=4?5:3} 秒`,
 echo:`幻影追击 ${n>=4?2:1} 次，每次 ${n>=3?60:45}% 伤害`,
 basic:n>=4?'每第四次攻击对附近 2 个目标造成 50% 余波':n>=3?'每第四次攻击额外造成 40% 伤害':'稳定的单体攻击'
 };return effects[w.type];
}
export const HAND_SIZE=16;
export const HINT_COST=100;
export const SKILL_COOLDOWN=30, SKILL_BASE_COST=30, SKILL_COST_STEP=15;
const WORD_INDEX=new Map(WORDS.map(w=>[w.word,w]));
const WORD_PREFIXES=new Set(WORDS.flatMap(w=>Array.from({length:w.tier},(_,i)=>w.word.slice(0,i+1))));
export const getWord=word=>WORD_INDEX.get(word);
export function towerStats(t){const w=getWord(t.word),up=t.level-w.tier;return {damage:Math.round(w.damage*(1+up*.65)),range:w.range+up*15,rate:w.rate/(1+up*.14),aura:w.aura,income:Math.round(w.income*(1+up*.5))};}
export function matchWord(chars){if(chars.length<1||chars.length>4)return null;return getWord(chars.join(''))||null;}
export const CHAPTERS=[
 {name:'青山初试',area:'青山道',rounds:6,hp:20,ink:200,difficulty:0,intro:'墨影初现，试以文字守住山门。'},
 {name:'竹海听风',area:'竹隐谷',rounds:8,hp:20,ink:250,difficulty:.4,intro:'竹径回环，留意飞羽与护送阵。'},
 {name:'长夜守卷',area:'藏书阁',rounds:10,hp:26,ink:320,difficulty:.8,intro:'墨潮席卷长夜，守住最后一卷光。'},
 {name:'双溪合流',area:'双溪渡',rounds:8,hp:26,ink:320,difficulty:.95,intro:'两路墨影轮番而来，在汇合处设阵。'},
 {name:'云关夹击',area:'云中关',rounds:9,hp:28,ink:350,difficulty:1.1,intro:'上下入口同时进军，兼顾两翼。'},
 {name:'回廊迷阵',area:'千折廊',rounds:9,hp:28,ink:350,difficulty:1.25,intro:'曲折回廊，借交叉火力拦截重阵。'},
 {name:'霜河两岸',area:'霜河岸',rounds:10,hp:30,ink:380,difficulty:1.4,intro:'两岸交替来敌，寒域与飞羽相随。'},
 {name:'镜城围攻',area:'镜中城',rounds:10,hp:30,ink:390,difficulty:1.55,intro:'东西两路齐攻，守住南方卷门。'},
 {name:'三门烽火',area:'三门岭',rounds:11,hp:32,ink:410,difficulty:1.7,intro:'三路轮番试探，支援怪组合压境。'},
 {name:'万象归卷',area:'万象台',rounds:12,hp:34,ink:440,difficulty:1.85,intro:'三门同时开启，以完整词阵迎战墨君。'}
].map(ch=>({...ch,wavesPerRound:3,waves:ch.rounds*3}));
export const PATH=[{x:-30,y:150},{x:190,y:150},{x:190,y:340},{x:440,y:340},{x:440,y:145},{x:690,y:145},{x:690,y:370},{x:940,y:370}];
export const FREE_PAD_COUNT=12;
export const PADS=[{x:100,y:78},{x:110,y:240},{x:265,y:228},{x:277,y:420},{x:360,y:265},{x:365,y:78},{x:520,y:225},{x:600,y:75},{x:610,y:305},{x:770,y:230},{x:783,y:445},{x:855,y:292},{x:250,y:75},{x:480,y:430},{x:620,y:460},{x:800,y:85}];
const points=xs=>xs.map(([x,y])=>({x,y}));
export const MAPS=[
 {name:'青山曲径',mode:'single',routes:[PATH],pads:PADS,color:'#e9eddf'},
 {name:'竹谷回环',mode:'single',routes:[points([[-30,100],[300,100],[300,280],[110,280],[110,430],[650,430],[650,250],[940,250]])],pads:points([[100,170],[230,200],[370,180],[210,350],[380,350],[530,350],[570,200],[730,160],[750,330],[835,330],[460,490],[690,490],[100,30],[400,40],[55,370],[850,180]]),color:'#e2ebdc'},
 {name:'长夜折道',mode:'single',routes:[points([[-30,400],[250,400],[250,150],[520,150],[520,380],[750,380],[750,100],[940,100]])],pads:points([[100,330],[170,250],[330,300],[360,80],[450,230],[610,220],[640,310],[820,270],[670,60],[850,180],[430,460],[650,460],[100,470],[180,80],[560,70],[850,40]]),color:'#293c4a'},
 {name:'双溪汇阵',mode:'staggered',routes:[points([[-30,100],[180,100],[180,260],[350,260],[350,80],[650,80],[650,380],[940,380]]),points([[-30,420],[180,420],[180,260],[350,260],[350,80],[650,80],[650,380],[940,380]])],pads:points([[100,190],[100,330],[260,190],[265,335],[430,180],[510,150],[570,255],[725,240],[730,450],[850,300],[470,350],[400,460],[260,40],[540,25],[810,450],[70,490]]),color:'#e1ece5'},
 {name:'云关双翼',mode:'simultaneous',routes:[points([[120,-30],[120,180],[400,180],[400,300],[650,300],[650,80],[850,80],[850,370],[940,370]]),points([[120,550],[120,380],[400,380],[400,300],[650,300],[650,80],[850,80],[850,370],[940,370]])],pads:points([[200,90],[210,260],[210,460],[320,250],[480,230],[480,440],[570,380],[570,160],[730,160],[760,300],[780,440],[470,70],[50,260],[320,100],[730,30],[900,240]]),color:'#e4e7ef'},
 {name:'回廊折返',mode:'single',routes:[points([[-30,120],[650,120],[650,410],[250,410],[250,260],[800,260],[800,370],[940,370]])],pads:points([[100,60],[220,190],[390,190],[550,190],[730,180],[570,330],[410,335],[320,480],[190,330],[730,340],[875,280],[480,480],[100,190],[400,60],[720,450],[870,440]]),color:'#eae5d9'},
 {name:'霜河轮袭',mode:'staggered',routes:[points([[-30,90],[320,90],[320,260],[550,260],[550,100],[780,100],[780,420],[940,420]]),points([[-30,440],[320,440],[320,260],[550,260],[550,100],[780,100],[780,420],[940,420]])],pads:points([[130,165],[130,365],[240,255],[390,175],[390,350],[470,60],[620,180],[690,270],[690,440],[850,310],[850,160],[460,460],[110,30],[100,500],[620,350],[850,490]]),color:'#e0eaf0'},
 {name:'镜城东西门',mode:'simultaneous',routes:[points([[-30,90],[180,90],[180,220],[450,220],[450,430],[760,430],[760,300],[450,300],[450,550]]),points([[930,90],[720,90],[720,220],[450,220],[450,430],[760,430],[760,300],[450,300],[450,550]])],pads:points([[100,160],[270,145],[370,280],[535,150],[635,280],[815,170],[530,365],[650,365],[830,365],[365,445],[610,490],[535,490],[100,30],[810,30],[300,365],[850,480]]),color:'#e9e2ee'},
 {name:'三门轮阵',mode:'staggered',routes:[points([[-30,100],[200,100],[200,260],[450,260],[700,260],[700,430],[180,430],[180,340],[940,340]]),points([[-30,470],[70,470],[70,260],[450,260],[700,260],[700,430],[180,430],[180,340],[940,340]]),points([[450,-30],[450,260],[700,260],[700,430],[180,430],[180,340],[940,340]])],pads:points([[110,170],[280,185],[370,330],[520,190],[610,330],[770,270],[780,410],[600,490],[430,490],[250,490],[110,365],[850,280],[300,50],[520,60],[30,340],[850,430]]),color:'#ece2db'},
 {name:'万象三门',mode:'simultaneous',routes:[points([[-30,160],[180,160],[180,240],[350,240],[350,80],[650,80],[650,400],[850,400],[850,240],[940,240]]),points([[100,550],[100,360],[350,360],[350,240],[350,80],[650,80],[650,400],[850,400],[850,240],[940,240]]),points([[450,-30],[450,240],[350,240],[350,80],[650,80],[650,400],[850,400],[850,240],[940,240]])],pads:points([[100,240],[260,180],[260,290],[410,330],[520,160],[565,310],[730,180],[730,325],[780,470],[470,450],[30,420],[530,30],[250,30],[180,470],[720,30],[900,330]]),color:'#34344c'}
];
const metrics=path=>{const segments=path.slice(1).map((p,i)=>Math.hypot(p.x-path[i].x,p.y-path[i].y));return{path,segments,length:segments.reduce((a,b)=>a+b,0)};};
for(const [i,map] of MAPS.entries()){map.theme=['mountain','bamboo','archive','river','cloud','corridor','frost','mirror','beacon','cosmos'][i];map.ground=map.routes.map(metrics);map.air=map.routes.map((path,i)=>metrics([i===0&&map===MAPS[0]?{x:-30,y:85}:path[0],path.at(-1)]));}
export const getMap=chapter=>MAPS[chapter];
export const LENGTH=MAPS[0].ground[0].length;
function along(d,route){for(let i=0;i<route.segments.length;i++){if(d<=route.segments[i]){const t=Math.max(0,d/route.segments[i]);return{x:route.path[i].x+(route.path[i+1].x-route.path[i].x)*t,y:route.path[i].y+(route.path[i+1].y-route.path[i].y)*t};}d-=route.segments[i];}return{...route.path.at(-1)};}
export function position(d){return along(d,MAPS[0].ground[0]);}
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
 lancer:{name:'突阵',hp:85,speed:44,reward:4,harm:2,desc:'半血后速度提高 35%；寒霜与震荡可截住冲锋。'},
 healer:{name:'墨医',hp:90,speed:32,reward:5,harm:1,desc:'每 4 秒治疗附近友军 3% 生命；中毒目标无法接受治疗，优先集火。'},
 banner:{name:'疾行旗',hp:105,speed:33,reward:5,harm:2,desc:'附近地面友军提速 15%，同类不叠加；击败旗手解除加速。'},
 ward:{name:'护阵师',hp:100,speed:30,reward:5,harm:2,desc:'为附近其他敌人提供 12% 直接伤害减免；咒印与破甲可抵消。'},
 brood:{name:'孵墨',hp:130,speed:32,reward:5,harm:2,desc:'半血时孵出 2 个小墨影，仅一次；范围攻击或穿透可清理。'},
 ironboss:{name:'铁壁将军',boss:true,sigil:'甲',hp:420,speed:23,reward:24,harm:4,armor:.4,desc:'护甲减伤 40%；半血后脱甲，速度提高 20%。用剑气、山石或破甲咒应对。'},
 broodqueen:{name:'千墨母巢',boss:true,sigil:'巢',hp:400,speed:24,reward:24,harm:4,desc:'每 8 秒召唤 2 个小墨影，最多 3 次；半血加速召唤。用范围塔守住召唤群。'},
 stormboss:{name:'雷翼天鹏',boss:true,air:true,sigil:'翼',hp:270,speed:38,reward:24,harm:4,shield:95,desc:'沿空中捷径进攻，附带护盾；雷霆破盾，弓塔远程拦截，山石无法对空。'},
 frostboss:{name:'霜钟祭司',boss:true,sigil:'霜',hp:380,speed:24,reward:24,harm:4,desc:'附近 130 范围的词塔攻击间隔延长 25%；远程弓塔和毒伤可绕开寒域。'},
 inkking:{name:'蚀卷墨君',boss:true,sigil:'君',hp:510,speed:24,reward:32,harm:5,desc:'半血时进入二阶段：获得护盾、提速 15%，召唤 2 个疾影；雷霆、毒伤与咒印协同破阵。'},
 boss:{name:'墨魁',boss:true,sigil:'魁',hp:330,speed:25,reward:18,harm:4,desc:'每 3 轮及章节末轮的最后一波出现，漏过山门损失 4 点生命。'}
};
export const AIR_LENGTH=MAPS[0].air[0].length;
export const isAir=e=>e.kind==='flying'||ENEMIES[e.kind]?.air===true;
const routeFor=e=>(getMap(e.map??0)[isAir(e)?'air':'ground'])[e.route??0];
export const enemyLength=e=>routeFor(e).length;
export const enemyPosition=e=>along(e.d,routeFor(e));
const FORMATIONS=[
 {name:'疾影冲阵',pool:['swift','swift','lancer','normal','banner'],counter:'寒霜减速、疾风补刀'},
 {name:'铁壁护送',pool:['armor','tank','shield','ward','normal'],counter:'山石破甲、雷霆破盾、咒印易伤'},
 {name:'云翼掩袭',pool:['flying','flying','swift','shield','banner'],counter:'弓塔与雷霆对空，兼顾地面'},
 {name:'回春毒战',pool:['regen','healer','tank','normal','ward'],counter:'毒伤禁疗、优先击败墨医'},
 {name:'裂巢墨潮',pool:['split','brood','normal','swift','healer'],counter:'烈焰、潮汐、剑气清群'},
 {name:'军旗重阵',pool:['banner','armor','lancer','ward','tank'],counter:'咒印集火支援怪，搭配减速'},
 {name:'空陆合围',pool:['flying','split','shield','regen','lancer','brood'],counter:'对空、范围、持续伤害协同'}
];
export function wavePlan(chapter,wave){
 const round=Math.max(1,Math.ceil(wave/3)),part=(Math.max(1,wave)-1)%3+1;
 const boss=part===3&&(round%3===0||round===CHAPTERS[chapter].rounds);
 const finale=round===CHAPTERS[chapter].rounds;
 const bossKind=boss?(finale?['ironboss','frostboss','inkking','broodqueen','stormboss','ironboss','frostboss','stormboss','broodqueen','inkking'][chapter]:['boss','broodqueen','stormboss','frostboss','ironboss','inkking'][(Math.floor(round/3)-1+chapter*2)%6]):null;
 const stage=round+Math.min(3,Math.floor(chapter/2),Math.max(0,round-2));
 let pool=['normal','normal','normal','swift'],formation='墨影来袭',counter='先布攻击塔，保留墨点补强';
 if(stage===2){pool=['normal','swift','armor',...(part===2?['flying','flying']:['shield'])];formation=part===2?'飞羽突袭':'先锋试阵';counter='补充对空、破甲与减速';}
 if(stage===3){pool=['normal','swift','armor','tank','shield',...(chapter>0?['lancer']:[])];formation='重阵推进';counter='雷霆破盾、山石迎击重甲';}
 if(stage>=4){const f=FORMATIONS[(stage-4+part-1+chapter*2)%FORMATIONS.length];pool=[...f.pool,'normal','normal','swift'];formation=f.name;counter=f.counter;if(round>=7)pool.push(...FORMATIONS[(round+part+chapter)%FORMATIONS.length].pool.slice(0,2));if(round>=9)pool.push('ward','healer');}
 return{round,part,stage,pool,boss,bossKind,formation,counter,count:Math.min(80,8+round*3+chapter*2+(part-1)*2),title:boss?ENEMIES[bossKind].name+' · '+formation:formation};
}
export class Game {
 get pads(){return getMap(this.chapter).pads;}
 constructor(chapter=0,seed=(Math.random()*4294967296)>>>0){this.chapter=chapter;this.wave=0;this.endless=false;this.unlockedPads=Array.from({length:FREE_PAD_COUNT},(_,i)=>i);this.hp=CHAPTERS[chapter].hp;this.ink=CHAPTERS[chapter].ink;this.towers=[];this.enemies=[];this.effects=[];this.queue=[];this.time=0;this.spawnTime=0;this.autoWaveAt=0;this.phase='prepare';this.kills=0;this.nextId=1;this.skillReady=0;this.skillUses=0;this.totalEarned=0;this.bountyEarned=0;this.events=[];this.rngState=(seed>>>0)||1;this.refreshes=0;this.handSerial=0;this.hand=[];for(let i=0;i<4;i++)this.random();this.drawHand();}
 emit(type,data={}){this.events.push({type,...data});}
 random(){let x=this.rngState;x^=x<<13;x^=x>>>17;x^=x<<5;this.rngState=x>>>0;return this.rngState/4294967296;}
 drawHand(){
  this.hintWord=null;
  const pick=xs=>xs[Math.floor(this.random()*xs.length)];
  const attack=COMBAT_WORDS.filter(w=>w.tier===2&&w.damage>0&&!['aura','income'].includes(w.type));
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
 unlockPad(pad){if(!this.pads[pad]||this.padUnlocked(pad)||['won','lost'].includes(this.phase)||this.ink<this.unlockCost())return false;const cost=this.unlockCost();this.ink-=cost;this.unlockedPads.push(pad);this.emit('unlock',{pad,cost});return true;}
 hintCost(){return this.hintWord&&this.tilesFor(this.hintWord)?0:HINT_COST;}
 requestHint(){if(['won','lost'].includes(this.phase))return false;if(this.hintWord&&this.tilesFor(this.hintWord))return {word:this.hintWord,cost:0};const word=this.availableWords().sort((a,b)=>b.tier-a.tier||a.cost-b.cost)[0];if(!word||this.ink<HINT_COST)return false;this.ink-=HINT_COST;this.hintWord=word.word;this.emit('hint',{word:word.word,cost:HINT_COST});return {word:word.word,cost:HINT_COST};}
 refreshCost(){return Math.min(40,15+this.refreshes*5);}
 refreshHand(){if(['won','lost'].includes(this.phase)||this.ink<this.refreshCost())return false;const cost=this.refreshCost();this.ink-=cost;this.refreshes++;this.drawHand();this.emit('refresh',{cost});return true;}
 tilesFor(word){const ids=[];for(const ch of word){const tile=this.hand.find(t=>!t.used&&t.ch===ch&&!ids.includes(t.id));if(!tile)return null;ids.push(tile.id);}return ids;}
 availableWords(){const key=this.hand.map(t=>t.used?'_':t.ch).join('');if(this._wordCacheKey!==key){const counts=new Map();for(const t of this.hand)if(!t.used)counts.set(t.ch,(counts.get(t.ch)||0)+1);const found=[];const visit=prefix=>{for(const [ch,count]of counts){if(!count)continue;const next=prefix+ch;if(!WORD_PREFIXES.has(next))continue;const w=getWord(next);if(w)found.push(w);if(next.length<4){counts.set(ch,count-1);visit(next);counts.set(ch,count);}}};visit('');this._wordCacheKey=key;this._wordCache=found;}return this._wordCache.slice();}
 canBuild(word,ids){const w=getWord(word);if(!w||this.ink<w.cost||['won','lost'].includes(this.phase))return false;const chosen=ids??this.tilesFor(word);if(!chosen||chosen.length!==w.tier||new Set(chosen).size!==chosen.length)return false;const tiles=chosen.map(id=>this.hand.find(t=>t.id===id&&!t.used));return tiles.every(Boolean)&&tiles.map(t=>t.ch).join('')===word;}
 build(word,pad,ids){const w=getWord(word),chosen=ids??this.tilesFor(word);if(!this.pads[pad]||!this.padUnlocked(pad)||this.towers.some(t=>t.pad===pad)||!this.canBuild(word,chosen))return false;this.ink-=w.cost;for(const id of chosen)this.hand.find(t=>t.id===id).used=true;if(this.hintWord&&!this.tilesFor(this.hintWord))this.hintWord=null;this.towers.push({word,pad,level:w.tier,spent:w.cost,cooldown:0,id:this.nextId++});this.emit('build',{word});return true;}
 upgrade(id){const t=this.towers.find(t=>t.id===id);if(!t||t.level>=getWord(t.word).maxLevel||['won','lost'].includes(this.phase))return false;const cost=this.upgradeCost(t);if(this.ink<cost)return false;this.ink-=cost;t.spent+=cost;t.level++;this.emit('upgrade',{pad:t.pad,level:t.level});return true;}
 upgradeCost(t){return Math.round(getWord(t.word).cost*(t.level===getWord(t.word).tier?.75:1.15));}
 sell(id){const t=this.towers.find(t=>t.id===id);if(!t||['won','lost'].includes(this.phase))return false;this.ink+=Math.floor(t.spent*.7);this.towers=this.towers.filter(x=>x.id!==id);this.emit('sell');return true;}
 continueEndless(){if(this.phase!=='won'||this.endless)return false;this.endless=true;this.phase='prepare';this.events=[];this.emit('endless');return true;}
 roundInfo(next=this.phase==='prepare'||this.phase==='intermission'){return wavePlan(this.chapter,this.wave+(next?1:0));}
 wavePreview(){return wavePlan(this.chapter,this.wave+1);}
 startWave(){if(!['prepare','intermission'].includes(this.phase))return false;this.wave++;this.phase='battle';const plan=wavePlan(this.chapter,this.wave);this.queue=Array.from({length:plan.count},(_,i)=>({kind:plan.boss&&i===plan.count-1?plan.bossKind:i<Math.min(3,plan.pool.length)&&plan.stage>=4?plan.pool[i]:plan.pool[Math.floor(this.random()*plan.pool.length)],route:getMap(this.chapter).mode==='staggered'?Math.floor(i/4)%getMap(this.chapter).routes.length:i%getMap(this.chapter).routes.length}));this.spawnTime=0;this.autoWaveAt=0;this.emit('wave');return true;}
 spawn(kind,distance=0,route=0){const round=Math.max(1,Math.ceil(this.wave/3)),part=(Math.max(1,this.wave)-1)%3;const scale=(1+(round-1)*.36+part*.08+CHAPTERS[this.chapter].difficulty)*1.25*(1+Math.max(0,round-5)*.015);const st=ENEMIES[kind];const e={map:this.chapter,route,id:this.nextId++,kind,hp:st.hp*scale,maxHp:st.hp*scale,speed:st.speed*(1+Math.min(this.chapter,4)*.05),reward:st.reward,harm:st.harm,d:Math.max(0,distance),slowUntil:0};if(kind==='shield'||st.shield){e.shield=(st.shield||55)*scale;e.maxShield=e.shield;}if(kind==='healer'||kind==='broodqueen')e.abilityAt=this.time+(kind==='healer'?4:8);this.enemies.push(e);return e;}
 skillCost(){return SKILL_BASE_COST+this.skillUses*SKILL_COST_STEP;}
 skill(){const cost=this.skillCost();if(this.phase!=='battle'||this.time<this.skillReady||this.ink<cost)return false;this.ink-=cost;this.skillUses++;this.skillReady=this.time+SKILL_COOLDOWN;for(const e of this.enemies){e.hp-=100;e.slowUntil=this.time+3;}this.effects.push({kind:'rain',life:1,max:1});this.emit('skill',{cost,nextCost:this.skillCost()});return true;}
 step(dt){dt=Math.max(0,Math.min(dt,.1));for(const fx of this.effects)fx.life-=dt;this.effects=this.effects.filter(f=>f.life>0);if(this.phase==='intermission'){this.time+=dt;if(this.time>=this.autoWaveAt)this.startWave();return;}if(this.phase!=='battle')return;this.time+=dt;this.spawnTime-=dt;if(this.queue.length&&this.spawnTime<=0){const batch=getMap(this.chapter).mode==='simultaneous'?getMap(this.chapter).routes.length:1;for(const next of this.queue.splice(0,batch))this.spawn(next.kind,0,next.route??0);this.spawnTime=Math.max(.4,1.03-Math.ceil(this.wave/3)*.035)*batch;}
 this.updateEnemies(dt);
 for(const t of this.towers)this.attack(t,dt);
 for(const e of this.enemies){if(e.hp<=0){const cap=Math.max(0,...this.towers.filter(t=>getWord(t.word).type==='income').map(t=>getWord(t.word).tier>=4?35:getWord(t.word).tier>=3?25:15));const bounty=e.bountyUntil>this.time?Math.min(e.bounty||0,Math.max(0,cap-this.bountyEarned)):0;this.bountyEarned+=bounty;this.ink+=e.reward+bounty;this.totalEarned+=e.reward+bounty;if(bounty)this.effects.push({kind:'coin',to:enemyPosition(e),amount:bounty,life:.8,max:.8});this.kills++;this.effects.push({kind:'pop',to:enemyPosition(e),color:'#556b58',life:.45,max:.45});if(e.kind==='split'){this.spawn('small',e.d,e.route);this.spawn('small',e.d-12,e.route);}}else if(e.d>=enemyLength(e)){this.hp=Math.max(0,this.hp-e.harm);this.emit('leak');}}
 this.enemies=this.enemies.filter(e=>e.hp>0&&e.d<enemyLength(e));if(this.hp<=0){this.phase='lost';this.emit('lost');}else if(!this.queue.length&&!this.enemies.length){const plan=wavePlan(this.chapter,this.wave),roundEnd=plan.part===3;const incomeCap=Math.max(80,...this.towers.filter(t=>getWord(t.word).type==='income').map(t=>getWord(t.word).tier>=4?100:getWord(t.word).tier>=3?90:80));const income=roundEnd?Math.min(incomeCap,this.towers.filter(t=>getWord(t.word).type==='income').reduce((sum,t)=>sum+towerStats(t).income,0)):0;const reward=8+plan.round*2+(roundEnd?20+plan.round*3:0)+income;this.ink+=reward;if(roundEnd){this.refreshes=0;this.bountyEarned=0;this.hp=Math.min(CHAPTERS[this.chapter].hp,this.hp+2);}if(!this.endless&&this.wave>=CHAPTERS[this.chapter].waves)this.phase='won';else if(roundEnd)this.phase='prepare';else{this.phase='intermission';this.autoWaveAt=this.time+6;}this.emit(this.phase==='won'?'won':'clear',{income,reward,roundEnd});}}
 updateEnemies(dt){
  const nearby=(a,b,r)=>Math.hypot(enemyPosition(a).x-enemyPosition(b).x,enemyPosition(a).y-enemyPosition(b).y)<=r;
  // Iterate a snapshot so summons never recursively execute abilities this frame.
  const living=this.enemies.filter(e=>e.hp>0&&e.d<enemyLength(e));
  for(const e of living){
   if(e.kind==='regen'&&!(e.poisonUntil>this.time))e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.02*dt);
   if(e.poisonUntil>this.time-dt)e.hp-=Math.min(dt,Math.max(0,e.poisonUntil-(this.time-dt)))*e.poisonDps;
   if(e.burnUntil>this.time-dt)e.hp-=Math.min(dt,Math.max(0,e.burnUntil-(this.time-dt)))*e.burnDps;
   if(e.hp<=0)continue;
   if(['brood','ironboss','inkking'].includes(e.kind)&&e.hp<=e.maxHp*.5&&!e.enraged){
    e.enraged=true;
    if(e.kind==='brood'){this.spawn('small',e.d,e.route);this.spawn('small',e.d-14,e.route);}
    if(e.kind==='inkking'){e.shield=e.maxShield=e.maxHp*.18;this.spawn('swift',e.d-12,e.route);this.spawn('swift',e.d-24,e.route);}
    if(ENEMIES[e.kind].boss)this.emit('boss-phase',{name:ENEMIES[e.kind].name});
   }
   if(e.kind==='healer'&&this.time>=e.abilityAt){
    for(const ally of living)if(ally.hp>0&&nearby(e,ally,110)&&!(ally.poisonUntil>this.time))ally.hp=Math.min(ally.maxHp,ally.hp+ally.maxHp*.03);
    e.abilityAt=this.time+4;this.effects.push({kind:'blast',to:enemyPosition(e),color:'#719b65',life:.5,max:.5});
   }
   if(e.kind==='broodqueen'&&this.time>=e.abilityAt&&(e.summons||0)<3){
    this.spawn('small',e.d-12,e.route);this.spawn('small',e.d-24,e.route);e.summons=(e.summons||0)+1;e.abilityAt=this.time+(e.hp<e.maxHp*.5?5:8);
   }
   let movement=e.slowUntil>this.time?(e.slowFactor??.55):1;
   if(e.freezeUntil>this.time)movement=0;
   if(e.kind==='lancer'&&e.hp<=e.maxHp*.5)movement*=1.35;
   if(e.kind==='ironboss'&&e.enraged)movement*=1.2;
   if(e.kind==='inkking'&&e.enraged)movement*=1.15;
   if(!isAir(e)&&living.some(a=>a.kind==='banner'&&a.id!==e.id&&a.hp>0&&nearby(e,a,110)))movement*=1.15;
   e.d+=e.speed*dt*movement;
  }
 }
 attack(t,dt){
  const w=getWord(t.word),p=this.pads[t.pad],stats=towerStats(t);
  t.cooldown-=dt;if(t.cooldown>0)return;
  const inRange=e=>Math.hypot(enemyPosition(e).x-p.x,enemyPosition(e).y-p.y)<=stats.range;
  const targets=this.enemies.filter(e=>e.hp>0&&e.d<enemyLength(e)&&!(isAir(e)&&w.type==='heavy')&&inRange(e)).sort((a,b)=>b.d/enemyLength(b)-a.d/enemyLength(a));
  if(!targets.length)return;
  const target=targets[0],n=w.tier;
  const lights=this.towers.filter(a=>a.id!==t.id&&getWord(a.word).type==='aura'&&Math.hypot(this.pads[a.pad].x-p.x,this.pads[a.pad].y-p.y)<=towerStats(a).range);
  const buff=Math.max(0,...lights.map(a=>towerStats(a).aura));
  const haste=Math.max(0,...lights.map(a=>getWord(a.word).tier>=4?.12:getWord(a.word).tier>=3?.06:0));
  const chilled=this.enemies.some(e=>e.hp>0&&e.kind==='frostboss'&&Math.hypot(enemyPosition(e).x-p.x,enemyPosition(e).y-p.y)<=130);
  const damage=stats.damage*(1+buff);
  const hit=(e,m=1)=>{
   if(e.hp<=0)return;
   let armor=e.kind==='armor'?.3:e.kind==='ironboss'&&!e.enraged?.4:0;
   if(['heavy','pierce'].includes(w.type)||e.breakUntil>this.time)armor=0;
   const protectedByWard=!(e.lightUntil>this.time)&&this.enemies.some(a=>a.hp>0&&a.kind==='ward'&&a.id!==e.id&&Math.hypot(enemyPosition(a).x-enemyPosition(e).x,enemyPosition(a).y-enemyPosition(e).y)<110);
   let amount=damage*m*(1-armor)*(protectedByWard?.88:1)*(e.markUntil>this.time?1+e.markPower:1);
   if(w.type==='sniper'&&e.hp/e.maxHp<(n>=4?.4:n>=3?.35:.3))amount*=n>=4?2.2:n>=3?2:1.8;
   if(w.type==='heavy'&&n>=4)amount+=Math.min(60,e.maxHp*.02);
   if(e.shield>0){const bonus=w.type==='chain'?2:1,absorbed=Math.min(e.shield,amount*bonus);e.shield-=absorbed;amount-=absorbed/bonus;}
   e.hp-=Math.max(0,amount);
   if(w.type==='mark'){e.markPower=Math.max(e.markUntil>this.time?e.markPower:0,n>=4?.3:n>=3?.22:.15);e.markUntil=this.time+(n>=4?5:3);}
   if(w.type==='aura')e.lightUntil=this.time+3;
   if(w.type==='income'){e.bounty=Math.max(e.bountyUntil>this.time?e.bounty:0,n>=4?3:n>=3?2:1);e.bountyUntil=this.time+4;}
   if(w.type==='heavy'&&n>=3)e.breakUntil=this.time+3;
   this.effects.push({kind:'bolt',attackType:w.type,from:p,to:enemyPosition(e),color:w.color,life:.32,max:.32});
  };
  const slow=(e,factor,seconds)=>{e.slowFactor=Math.min(e.slowUntil>this.time?(e.slowFactor??.55):1,factor);e.slowUntil=Math.max(e.slowUntil||0,this.time+seconds);};
  const poison=e=>{e.poisonDps=Math.max(e.poisonUntil>this.time?e.poisonDps:0,damage*.6);e.poisonUntil=Math.max(e.poisonUntil||0,this.time+(n>=4?5:n>=3?4:3));};
  hit(target);this.effects.push({kind:'cast',attackType:w.type,sound:w.type,from:p,color:w.color,life:.24,max:.24});t.shots=(t.shots||0)+1;
  if(w.type==='poison'){poison(target);if(n>=4){const q=enemyPosition(target);for(const e of targets.filter(e=>e!==target&&Math.hypot(enemyPosition(e).x-q.x,enemyPosition(e).y-q.y)<85).slice(0,2))poison(e);}}
  if(w.type==='slow'){slow(target,n>=3?.45:.55,2.1);if(n>=4&&!(target.freezeReady>this.time)){target.freezeUntil=this.time+.4;target.freezeReady=this.time+4;}}
  if(w.type==='splash'){
   const q=enemyPosition(target),radius=n>=4?90:n>=3?80:65;
   for(const e of this.enemies){if(e.hp<=0||Math.hypot(enemyPosition(e).x-q.x,enemyPosition(e).y-q.y)>=radius)continue;if(e!==target)hit(e,.65);if(n>=4){e.burnDps=Math.max(e.burnUntil>this.time?e.burnDps:0,damage*.18);e.burnUntil=this.time+2;}}
   this.effects.push({kind:'blast',to:q,color:w.color,life:.35,max:.35});
  }
  if(w.type==='chain')for(let i=1;i<Math.min(n>=4?5:n>=3?4:3,targets.length);i++)hit(targets[i],Math.pow(.72,i));
  if(w.type==='pierce'){
   const q=enemyPosition(target),dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1;
   const aligned=targets.filter(e=>{if(e===target)return false;const r=enemyPosition(e),along=((r.x-p.x)*dx+(r.y-p.y)*dy)/len;return along>=0&&Math.abs((r.x-p.x)*dy-(r.y-p.y)*dx)/len<28;});
   for(const e of aligned.slice(0,n>=4?4:n>=3?3:2))hit(e,n>=4?.85:.7);
  }
  if(w.type==='pulse'){for(const e of targets.slice(0,n>=4?12:n>=3?10:8)){if(e!==target)hit(e);if(n>=4)slow(e,.7,1);}this.effects.push({kind:'blast',to:p,radius:stats.range,color:w.color,life:.4,max:.4});}
  if(w.type==='echo')for(let i=0;i<(n>=4?2:1);i++)hit(targets.find(e=>e!==target&&e.hp>0)||target,n>=3?.6:.45);
  if(w.type==='fast'&&n>=3&&t.shots%3===0)hit(target,n>=4?.7:.35);
  if(w.type==='basic'&&n>=3&&t.shots%4===0){if(n===3)hit(target,.4);else for(const e of targets.filter(e=>e!==target).slice(0,2))hit(e,.5);}
  t.cooldown=stats.rate*(chilled?1.25:1)/(1+haste);
 }
 export(){const {effects,events,_wordCacheKey,_wordCache,...data}=this;return {...data,towers:this.towers.map(t=>({...t})),enemies:this.enemies.map(e=>({...e})),queue:this.queue.map(e=>({...e})),hand:this.hand.map(t=>({...t})),unlockedPads:[...this.unlockedPads],version:3};}
 static restore(data){
 const finite=n=>typeof n==='number'&&Number.isFinite(n),int=n=>Number.isInteger(n)&&n>=0,kind=k=>Object.hasOwn(ENEMIES,k);
 if(!data||![1,2,3].includes(data.version)||!int(data.chapter)||!CHAPTERS[data.chapter]||!int(data.wave)||(data.endless!==undefined&&typeof data.endless!=='boolean')||(!data.endless&&data.wave>(data.version<3?CHAPTERS[data.chapter].rounds:CHAPTERS[data.chapter].waves))||!['prepare','battle','intermission','won','lost'].includes(data.phase)||!['ink','hp','time','skillReady','totalEarned'].every(k=>finite(data[k])&&data[k]>=0)||data.hp>CHAPTERS[data.chapter].hp||!['kills','nextId'].every(k=>int(data[k]))||!finite(data.spawnTime)||!Array.isArray(data.towers)||!Array.isArray(data.enemies)||!Array.isArray(data.queue))throw Error('Invalid save');
 if(data.towers.length>PADS.length||new Set(data.towers.map(t=>t?.pad)).size!==data.towers.length||data.towers.some(t=>!t||!WORDS.some(w=>w.word===t.word)||!int(t.pad)||!PADS[t.pad]||(!Number.isInteger(t.level)||(data.version===1?![1,2,3].includes(t.level):t.level<getWord(t.word).tier||t.level>getWord(t.word).maxLevel))||!int(t.id)||!finite(t.cooldown))||data.enemies.some(e=>!e||!kind(e.kind)||!int(e.id)||!['hp','maxHp','speed','reward','harm','d','slowUntil'].every(k=>finite(e[k]))||e.maxHp<=0||e.speed<=0||e.d<0)||data.queue.some(e=>!e||!kind(e.kind)))throw Error('Invalid save');
 if(data.enemies.some(e=>(e.shield!==undefined&&(!finite(e.shield)||e.shield<0))||(e.maxShield!==undefined&&(!finite(e.maxShield)||e.maxShield<0))))throw Error('Invalid shield state');
 if(data.bountyEarned!==undefined&&(!int(data.bountyEarned)||data.bountyEarned>35))throw Error('Invalid bounty');
 if(data.enemies.some(e=>['abilityAt','poisonDps','poisonUntil','burnDps','burnUntil','markUntil','markPower','breakUntil','lightUntil','bountyUntil','bounty','freezeUntil','freezeReady','slowFactor','summons'].some(k=>e[k]!==undefined&&(!finite(e[k])||e[k]<0))||(e.enraged!==undefined&&typeof e.enraged!=='boolean')||(e.burnUntil!==undefined&&!finite(e.burnDps))))throw Error('Invalid enemy ability');
 if(data.towers.some(t=>t.shots!==undefined&&!int(t.shots)))throw Error('Invalid tower attack counter');
 if(data.enemies.some(e=>(e.map!==undefined&&e.map!==data.chapter)||(e.route!==undefined&&(!int(e.route)||e.route>=getMap(data.chapter).routes.length)))||data.queue.some(e=>e.route!==undefined&&(!int(e.route)||e.route>=getMap(data.chapter).routes.length)))throw Error('Invalid route');
 if(data.skillUses!==undefined&&!int(data.skillUses))throw Error('Invalid skill use count');
 if(data.autoWaveAt!==undefined&&(!finite(data.autoWaveAt)||data.autoWaveAt<0))throw Error('Invalid wave timer');
 const g=new Game(data.chapter);g.bountyEarned=data.bountyEarned??0;g.autoWaveAt=data.autoWaveAt??0;g.endless=data.endless===true;g.skillUses=data.skillUses??0;for(const k of ['wave','hp','ink','towers','enemies','queue','time','spawnTime','phase','kills','nextId','skillReady','totalEarned'])g[k]=data[k];
 if(data.version>=2){
  const chars=new Set(WORDS.flatMap(w=>[...w.word]));
  if(!int(data.rngState)||data.rngState===0||data.rngState>4294967295||!int(data.refreshes)||!int(data.handSerial)||!Array.isArray(data.hand)||data.hand.length!==HAND_SIZE||new Set(data.hand.map(t=>t?.id)).size!==HAND_SIZE||data.hand.some(t=>!t||!int(t.id)||t.id===0||t.id>data.handSerial||!chars.has(t.ch)||typeof t.used!=='boolean')||data.towers.some(t=>!finite(t.spent)||t.spent<0)||data.enemies.some(e=>(e.poisonDps!==undefined&&(!finite(e.poisonDps)||e.poisonDps<0))||(e.poisonUntil!==undefined&&(!finite(e.poisonUntil)||!finite(e.poisonDps)))))throw Error('Invalid word tray');
  for(const k of ['rngState','refreshes','handSerial','hand'])g[k]=data[k];
 }else{
  g.towers=g.towers.map(t=>{const w=getWord(t.word),up=t.level-1;return {...t,level:w.tier+up,spent:w.cost+(up>0?Math.round(w.cost*.75):0)+(up>1?Math.round(w.cost*1.15):0)};});
 }
 if(data.version<3)g.wave=data.phase==='prepare'||data.phase==='won'?data.wave*3:Math.max(1,(data.wave-1)*3+1);
 if(data.unlockedPads!==undefined){if(!Array.isArray(data.unlockedPads)||data.unlockedPads.length<FREE_PAD_COUNT||data.unlockedPads.length>PADS.length||new Set(data.unlockedPads).size!==data.unlockedPads.length||data.unlockedPads.some(i=>!int(i)||!PADS[i])||Array.from({length:FREE_PAD_COUNT},(_,i)=>i).some(i=>!data.unlockedPads.includes(i)))throw Error('Invalid unlocked pads');g.unlockedPads=[...data.unlockedPads];}
 if(g.towers.some(t=>!g.padUnlocked(t.pad)))throw Error('Tower on locked pad');
 if(data.hintWord!==undefined&&data.hintWord!==null){if(typeof data.hintWord!=='string'||!getWord(data.hintWord)||!g.tilesFor(data.hintWord))throw Error('Invalid saved hint');g.hintWord=data.hintWord;}
 g.towers=g.towers.map(t=>({...t}));g.enemies=g.enemies.map(e=>({...e,map:g.chapter,route:e.route??0}));g.queue=g.queue.map(e=>({...e}));g.hand=g.hand.map(t=>({...t}));return g;
 }
}
