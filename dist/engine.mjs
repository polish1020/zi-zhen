import {COMMON_WORDS} from './lexicon.mjs';
// Each recipe has a distinct word; length determines its starting tier.
const SCHOOLS = [
 {type:'splash',icon:'火',name:'烈焰',color:'#c56843',cost:60,damage:24,range:155,rate:1.05,tag:'范围伤害',desc:'爆裂攻击，对目标周围的敌人造成范围伤害。',words:['火','火球','烈火','火焰','流火','火焰山','三昧火','火流星','火树银花','星火燎原','火上浇油']},
 {type:'slow',icon:'冰',name:'寒霜',color:'#659ba7',cost:50,damage:9,range:145,rate:.8,tag:'减速控制',desc:'寒霜减速并控制目标，强度与持续时间随品阶和词意特性变化。',words:['冰','冰霜','寒冰','冰雪','寒霜','寒冰箭','冰封术','冰凌花','冰天雪地','冷若冰霜','寒气逼人']},
 {type:'chain',icon:'雷',name:'雷霆',color:'#a38a48',cost:80,damage:31,range:170,rate:1.3,tag:'连锁攻击',desc:'闪电连锁多个敌人，可对空，对护盾造成双倍伤害。',words:['雷','雷电','惊雷','雷霆','闪电','连环雷','雷霆击','风雷动','雷霆万钧','电闪雷鸣','五雷轰顶']},
 {type:'fast',icon:'风',name:'疾风',color:'#65866d',cost:50,damage:12,range:160,rate:.42,tag:'高速单体',desc:'快速连续攻击，擅长补刀和拦截疾影。',words:['风','风刃','疾风','旋风','狂风','旋风刃','风卷云','追风剑','风卷残云','风驰电掣','风风火火']},
 {type:'heavy',icon:'石',name:'山石',color:'#908176',cost:85,damage:66,range:180,rate:1.8,tag:'破甲重击',desc:'重击无视墨甲护甲，擅长迎击高血敌人；无法攻击飞行怪。',words:['石','巨石','岩石','山石','磐石','落石阵','金刚石','镇山石','稳如泰山','排山倒海','坚如磐石']},
 {type:'aura',icon:'光',name:'辉光',color:'#c1a45a',cost:65,damage:8,range:155,rate:1.4,tag:'圣光照明 · 增伤光环',desc:'主动攻击并照明目标，解除护阵师减伤；范围友塔取最强增伤光环，持续时间与强度由词意及品阶决定。',words:['光','光环','星光','月光','辉光','日月光','星辰光','明月光','光芒万丈','光明磊落','日月同辉']},
 {type:'poison',icon:'毒',name:'毒瘴',color:'#8b8a4b',cost:65,damage:14,range:155,rate:1.1,tag:'持续毒伤',desc:'持续毒伤抑制回血；持续时间和传播方式由品阶与词意决定，同类取最强。',words:['毒','毒雾','毒蛇','瘴气','剧毒','毒气弹','毒龙胆','迷魂香','蛇蝎心肠','毒蛇猛兽','笑里藏刀']},
 {type:'sniper',icon:'弓',name:'神射',color:'#94709c',cost:75,damage:46,range:235,rate:1.7,tag:'远程斩杀',desc:'远程精准射击，对低生命目标造成斩杀增伤；斩杀阈值随品阶提升。',words:['弓','弓箭','神箭','飞箭','穿杨','穿云箭','追魂箭','连珠箭','百步穿杨','箭无虚发','百发百中']},
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
const SCHOOL_ALIASES=[[/^(冷静|热爱|热情|热心|火候|心意|历史|文化|文学|艺术|电脑|计算机|数学|算法|程序|地图|地理|光景|时光|明天|今天|昨天|现在|过去|未来|一心一意|全神贯注|水滴石穿|滴水穿石|破釜沉舟|釜底抽薪|画蛇添足|画龙点睛|三心二意|七上八下|老马识途|守株待兔|南辕北辙)$/,'basic'],[/^(火车|汽车|列车|车辆|交通|运输|飞机|轮船|司机|马上|立刻|立即)$/,'fast'],[/^(电话|手机|通讯|通信|音乐|诗歌|歌曲)$/,'echo'],[/^(医生|医师|医疗|治疗|康复|健康)$/,'basic']];
const combatSet=new Set(COMBAT_WORDS.map(w=>w.word));
export const WORD_TRAITS={
 firewall:{name:'焰墙',damage:.72,rate:1.25,range:0,desc:'命中处留下 3 秒地面火焰区域，地面敌人受到每秒 40% 攻击的灼烧（不能对空），最多保留 2 片；直接伤害 −28%，攻击间隔 +25%。'},
 dragon:{name:'龙息',damage:.9,rate:1.2,range:-10,desc:'扇形吐息最多覆盖 6 个目标，副目标受到 60% 伤害并附带本属性效果；主伤害 −10%，攻击间隔 +20%，射程 −10。'},
 balanced:{name:'均衡',damage:1,rate:1,range:0,desc:'稳定输出，保留流派的基础机制。'},
 ranged:{name:'远射',damage:1,rate:1.12,range:40,desc:'射程 +40，攻击间隔 +12%；适合远程覆盖与拦截。'},
 blade:{name:'锋刃',damage:1.15,rate:1.12,range:-20,armorPierce:.1,desc:'伤害 +15%，无视 10 个百分点护甲；射程 −20，攻击间隔 +12%。'},
 impact:{name:'重击',damage:1.25,rate:1.25,range:-10,desc:'单次伤害 +25%，攻击间隔 +25%，射程 −10；偏向爆发。'},
 spread:{name:'弥散',damage:.82,rate:1.15,range:10,area:25,desc:'扩大群体覆盖；伤害 −18%，攻击间隔 +15%，射程 +10。'},
 combo:{name:'连击',damage:.82,rate:1.15,range:-10,followup:.4,desc:'追加一次 40% 直接伤害；主伤害 −18%，攻击间隔 +15%，射程 −10。'},
 bind:{name:'封缚',damage:.8,rate:1.1,range:-10,desc:'强化控制持续时间，命中可施加短暂定身；伤害 −20%，攻击间隔 +10%，射程 −10。'},
 ward:{name:'守阵',damage:.85,rate:1.15,range:20,desc:'射程 65% 的近身范围形成减速 10% 的守阵领域（同类不叠加）；伤害 −15%，攻击间隔 +15%，射程 +20。'},
 radiance:{name:'辉耀',damage:.85,rate:1.1,range:20,aura:.06,desc:'光环额外增伤 6 个百分点，射程 +20；自身伤害 −15%，攻击间隔 +10%。'},
 purify:{name:'净化',damage:1.15,rate:1.1,range:0,aura:-.05,desc:'照明持续 5 秒，对护盾伤害 ×1.5；自身伤害 +15%，光环增伤减少 5 个百分点，攻击间隔 +10%。'},
 moon:{name:'月华',damage:.9,rate:1,range:10,aura:-.03,desc:'命中额外减速 20%、持续 1 秒，射程 +10；自身伤害 −10%，光环增伤减少 3 个百分点。'},
 coin:{name:'点金',damage:1.1,rate:1,range:10,income:.75,bounty:1,desc:'每个标记的击杀赏金额外 +1，伤害 +10%，射程 +10；轮末收入 −25%，仍受全场赏金上限约束。'},
 fortune:{name:'聚财',damage:.8,rate:1.2,range:0,income:1.35,desc:'轮末收入 +35%；自身伤害 −20%，攻击间隔 +20%，仍受轮末产墨上限约束。'},
 entice:{name:'招财',damage:1,rate:1.1,range:20,income:.9,desc:'赏金标记延长至 7 秒，射程 +20；轮末收入 −10%，攻击间隔 +10%。'},
 venom:{name:'蚀毒',damage:.85,rate:1.1,range:0,poisonRatio:.9,desc:'毒伤提高至每秒 90% 攻击并延长 1 秒；直接伤害 −15%，攻击间隔 +10%。'},
 rapid:{name:'迅捷',damage:.85,rate:.82,range:-5,desc:'伤害 −15%，攻击间隔 −18%，射程 −5；更快补刀和破除冰壳。'},
 sunder:{name:'破甲',damage:.85,rate:1.15,range:0,desc:'命中使目标破甲 2.5 秒，其他词塔也可受益；自身伤害 −15%，攻击间隔 +15%。'}
};
// Secondary meanings compose with the attack shape; no hash or reroll determines effects.
export const WORD_RUNES={
 ember:{name:'灼热',damage:.96,desc:'命中附带短时灼烧；火系的灼烧更强。'},
 frost:{name:'凝霜',damage:.96,desc:'附带 10% 短暂减速；冰系改为强化原有减速与持续时间。'},
 storm:{name:'雷鸣',damage:.96,desc:'护盾伤害额外提高，雷系在原破盾倍率上继续增强。'},
 toxin:{name:'淬毒',damage:.94,desc:'命中附带弱毒；毒系改为提高原有毒伤比例。'},
 venom:{name:'腐蚀',damage:.94,desc:'强化毒伤并延长持续时间；非毒系也可附带腐蚀毒。'},
 thorn:{name:'缠绕',damage:.94,desc:'每第三次攻击可短暂定身；同目标有控制间隔。'},
 shine:{name:'显形',damage:.97,desc:'命中照明目标，解除隐匿和护阵；光系照明持续更久。'},
 curse:{name:'衰咒',damage:.94,desc:'命中施加短时 8% 易伤，与更强咒印取最高值。'},
 edge:{name:'锐意',damage:.97,desc:'额外无视 5 个百分点护甲；已无视护甲的石、剑改为增加少量直伤。'},
 tide:{name:'震退',damage:.95,desc:'每第四次攻击可小幅推退目标；Boss 位移减半，同目标有间隔。'},
 valor:{name:'先声',damage:.97,desc:'对生命高于 85% 的目标增加 15% 直接伤害，适合先手。'},
 execute:{name:'追猎',damage:.97,desc:'对生命低于 20% 的目标再增加 15% 直接伤害，擅长收尾。'},
 focus:{name:'专注',damage:.97,desc:'每第四次攻击的直接伤害提高 15%。'},
 study:{name:'研习',damage:.96,desc:'该词塔升级费用减少 8%，拆塔仍按实际投入返还。'},
 tempo:{name:'奋进',damage:.97,desc:'每第四次攻击后，下一次攻击间隔缩短 12%。'},
 mend:{name:'回春',damage:.9,desc:'轮末额外修补山门 1 点生命；全场此类修补合计最多 2 点。'},
 prosper:{name:'盈余',damage:.92,desc:'轮末额外产墨，按字数计算；全场附加产墨合计最多 10。'},
 barrier:{name:'护佑',damage:.9,desc:'每轮为山门提供屏障，按字数最多抵挡 2 点漏怪伤害；同类不叠加。'},
 inspire:{name:'鼓舞',damage:.94,desc:'近身友塔攻速提高 3%，与其他攻速光环取最强值。'},
 sky:{name:'远望',damage:.98,range:12,rate:1.04,desc:'射程额外 +12，攻击间隔 +4%，偏向远程覆盖。'},
 slayer:{name:'伏魔',damage:.96,desc:'对 Boss 的直接伤害额外提高 12%。'},
 echo:{name:'回声',damage:.93,desc:'追加一个 20% 伤害的副目标，适合传讯、声响和连携词。'},
 brood:{name:'灵伴',damage:.96,desc:'每第三次攻击追加一次 20% 直接伤害的灵伴追击。'},
 luck:{name:'赐福',damage:.9,desc:'命中留下短时赏金标记，任意击杀可额外得 1 墨；受全场赏金上限约束。'},
 peace:{name:'止戈',damage:.94,desc:'使目标漏过山门时的伤害短暂减少 1，最低仍为 1。'},
 bloom:{name:'绽放',damage:.93,desc:'命中后向附近最多两个目标溅射 15% 直接伤害。'},
 soul:{name:'噬魂',damage:.94,desc:'击杀被标记的目标可修补山门 1 点生命，每轮全场最多一次。'},
 seal:{name:'封息',damage:.95,desc:'命中短暂阻止回血，不需要造成毒伤也能禁疗。'},
 rescue:{name:'反攻',damage:.96,desc:'对已走过路线 70% 的敌人增加 12% 直接伤害，擅长救险。'},
 gravity:{name:'镇压',damage:.95,desc:'每第四次攻击附加目标最大生命 0.3% 伤害，上限 8。'},
 count:{name:'数律',damage:.94,desc:'按词中数值周期蓄发，周期 1—10 次，触发时增加周期 ×10% 直接伤害。'},
 measure:{name:'尺度',damage:.97,rate:1.04,desc:'按距离词的实际尺度增加射程（有上限），攻击间隔 +4%。'},
 bleed:{name:'裂伤',damage:.94,desc:'命中造成少量持续裂伤，同类取最高；不属于毒伤或灼烧。'},
 silence:{name:'缄默',damage:.94,desc:'每第四次攻击可封住主动技能 1 秒，同目标每 4 秒一次；不阻止半血阶段。'},
 revive:{name:'重生',damage:.85,desc:'山门受到致命伤害时保留 1 点生命；每局仅一次，刷新不重置。'},
 flank:{name:'侧翼',damage:.96,desc:'从行进方向侧面命中时，直接伤害增加 15%。'},
 backstab:{name:'背击',damage:.96,desc:'从目标行进方向后方命中时，直接伤害增加 15%。'},
 front:{name:'正锋',damage:.96,desc:'从目标行进方向正面命中时，直接伤害增加 15%。'},
 growth:{name:'成长',damage:.95,desc:'每次升级额外提高 10% 基础伤害，仍最多升级两次。'}
};
const SYNONYM_RUNES=[
 [/^(你好|您好|欢迎|问好|问候|早安|晚安)$/,['shine','inspire']],
 [/^(谢谢|多谢|感谢|感恩|感激|报答)$/,['luck','peace']],
 [/^(朋友|伙伴|友谊|友情|合作|协作|团结|同伴|齐心协力|同舟共济|风雨同舟)$/,['echo','inspire']],
 [/^(开心|快乐|欢乐|高兴|幸福|喜悦|欢喜|心花怒放)$/,['inspire','luck']],
 [/^(和平|安宁|宁静|安静|平静|和谐|安详|心平气和)$/,['peace','seal']],
 [/^(学习|学问|知识|读书|教育|学校|学生|老师|教师|研究|科学|智慧|聪明|教学相长)$/,['study','focus']],
 [/^(工作|劳动|奋斗|努力|勤奋|勤劳|勤学苦练|自强不息)$/,['tempo','growth']],
 [/^(勇敢|勇气|英勇|勇士|英雄|无畏|勇往直前|一往无前)$/,['valor','rescue']],
 [/^(母亲|妈妈|父亲|爸爸|父母|家人|亲人|关爱|爱护|关怀)$/,['barrier','mend']],
 [/^(医生|医师|医疗|治疗|康复|健康|痊愈|救死扶伤)$/,['mend','seal']],
 [/^(火树银花|烟花|礼花|庆祝|庆典|节日|生日|寿辰)$/,['bloom','luck']],
 [/^(百步穿杨|百发百中|箭无虚发|百无一失|准确|精确|精准)$/,['focus','execute']],
 [/^(电脑|计算机|计算|算术|数学|程序|算法|工程|技术)$/,['focus','study']],
 [/^(电话|手机|通讯|通信|消息|新闻|广播|传递|传说)$/,['echo','sky']],
 [/^(玫瑰|牡丹|桃花|樱花|荷花|莲花|百合|兰花|菊花)$/,['bloom','thorn']],
 [/^(汽车|火车|列车|飞机|轮船|车辆|交通|运输|旅行|旅游)$/,['tempo','sky']],
 [/^(政府|国家|祖国|民族|人民|社会|法律|法院|公安|警察)$/,['barrier','rescue']],
 [/^(吃饭|食物|粮食|食品|面包|米饭|水果|苹果|香蕉|饮食)$/,['mend','growth']],
 [/^(历史|文化|文学|艺术|音乐|诗歌|故事|小说|书法|绘画)$/,['study','echo']],
 [/^(坚持|永恒|永远|永久|发展|成长|进步|未来|坚持不懈)$/,['growth','tempo']]
];
const RUNE_PATTERNS=[
 ['venom',/剧毒|腐蚀|瘟|疫|蛊/],['frost',/冰|雪|霜|寒|冻|冷/],['toxin',/毒|瘴/],['ember',/火|炎|焰|燃|热|烧|爆/],['storm',/雷|电|霆|霹/],
 ['shine',/光|亮|圣|明|真相|诚实|曙/],['soul',/魂|魄|鬼|冥|死|亡|幽/],['slayer',/魔|邪|妖|猎|斩妖|伏魔|降魔/],
 ['edge',/剑|刃|刀|锋|锐|刺|穿甲/],['tide',/浪|潮|涛|震|浪涌|冲击/],['gravity',/山|岳|岩|石|重|磐|镇/],
 ['thorn',/藤|根|草|木|竹|林|森林|花园/],['bloom',/花|蕊|绽|盛开|芳|香/],['mend',/春|医|疗|康|愈|生机|复苏|恢复/],
 ['prosper',/财|宝|富|财富|聚|收获|丰|商|经营/],['luck',/福|幸|吉|币|钱|银|金|礼|祝|恩/],
 ['barrier',/盾|护|卫|防|城|墙|保|国|家|亲/],['peace',/和|安|宁|静|平|温柔|友好/],
 ['inspire',/勇|军|战|壮|鼓|喜|乐|欢|爱|心|情/],['rescue',/救|援|助|帮|追|赶|急|警|危/],
 ['study',/学|书|文|知|识|思|智|理|论|教|研|术|法|史|记|诗|画|考|读|写/],
 ['focus',/精|准|睛|眼|看|察|算|计|数|机|证|验|测|认|清楚/],['echo',/声|音|鸣|响|歌|唱|钟|语|言|话|信|传|联|连|双|齐|共/],
 ['brood',/龙|凤|鸟|燕|鹤|鹰|虎|狼|狮|豹|马|牛|羊|鹿|兔|蛇|鱼|虫|蚁|蜂|群|兽|宠/],
 ['sky',/天|空|星|宇|宙|云|远|望|高|顶|上|外|大|广|长/],['tempo',/风|疾|迅|速|飞|快|动|行|走|奔|跑|来|往|运|流|忙|工|作|劳|勤/],
 ['growth',/新|初|始|幼|小|苗|种|长大|成|生|育|年|岁|时|日|月|未|后|继|续|久/],
 ['curse',/咒|恨|怨|悲|痛|忧|愁|怒|恶|苦|难|病|伤|灾|惧|怕/],['seal',/封|闭|禁|锁|定|止|清|净|绝/],['valor',/先|首|开|启|起|前|朝|早/],['execute',/末|终|尽|杀|灭|残|垂|衰|枯|竭|殆|收尾|穷途|处决|完结|破灭|结束/]
];
SYNONYM_RUNES.unshift(
 [/^(穿杨|穿云|穿云箭|神箭|神射|百步穿杨|箭无虚发|百发百中)$/,['focus','execute']],
 [/^(惊雷|天雷|落雷|雷霆击|雷霆万钧)$/,['storm','gravity']],
 [/^(火上浇油)$/,['ember','valor']],
 [/^(星火燎原)$/,['ember','growth']],
 [/^(寒气逼人|冷若冰霜)$/,['frost','curse']],
 [/^(冰天雪地|冰封万里)$/,['frost','sky']],
 [/^(风卷残云)$/,['tempo','tide']],
 [/^(风驰电掣)$/,['tempo','storm']],
 [/^(风风火火)$/,['tempo','ember']],
 [/^(稳如泰山|坚如磐石|坚不可摧|不动如山|金刚不坏)$/,['barrier','gravity']],
 [/^(金刚石|钻石|金石)$/,['gravity','edge']],
 [/^(光明磊落)$/,['shine','peace']],
 [/^(光芒万丈|日月同辉)$/,['shine','sky']],
 [/^(蛇蝎心肠)$/,['venom','curse']],
 [/^(毒蛇猛兽)$/,['toxin','brood']],
 [/^(笑里藏刀)$/,['backstab','edge']],
 [/^(万剑归宗)$/,['edge','echo']],
 [/^(剑气纵横)$/,['edge','flank']],
 [/^(画地为牢)$/,['barrier','seal']],
 [/^(符咒之力)$/,['curse','seal']],
 [/^(镜花水月|如梦似幻)$/,['echo','peace']],
 [/^(科学家|数学家|思想家|哲学家|教育家)$/,['study','focus']],
 [/^(作家|书法家|文学家|演说家)$/,['study','echo']],
 [/^(歌手|歌唱家|音乐家)$/,['echo','inspire']],
 [/^(画家|艺术家|绘画家)$/,['study','bloom']],

 [/^(千里眼|洞察|火眼金睛)$/,['focus','sky']],
 [/^(顺风耳|耳听八方)$/,['echo','sky']],
 [/^(弓箭手|战士|军队|军人|将军)$/,['valor','inspire']],
 [/^(冷静|冷静思考|冰释前嫌|和颜悦色|温柔|温暖|温和|安慰|谅解|宽容)$/,['peace','focus']],
 [/^(热爱|热情|热心|心意|心想事成|热泪盈眶)$/,['inspire','luck']],
 [/^(马上|立刻|立即|立马|赶快|赶紧|尽快|迅雷不及)$/,['tempo','rescue']],
 [/^(电光石火|昙花一现|转瞬即逝|稍纵即逝)$/,['tempo','valor']],
 [/^(海阔天空|天高地厚|无边无际|一望无际)$/,['sky','peace']],
 [/^(不动如山|坚不可摧|固若金汤|铜墙铁壁|众志成城)$/,['barrier','gravity']],
 [/^(百花齐放|万紫千红|姹紫嫣红|春暖花开|繁花似锦)$/,['bloom','mend']],
 [/^(雪中送炭|助人为乐|扶危济困|见义勇为)$/,['rescue','mend']],
 [/^(百折不回|日积月累|厚积薄发|积少成多|熟能生巧|持之以恒)$/,['growth','study']],
 [/^(声东击西|明修栈道|暗度陈仓|出其不意|攻其不备)$/,['flank','valor']],
 [/^(不劳而获|坐享其成|一本万利|开源节流|量入为出)$/,['prosper','focus']],
 [/^(一模一样|一成不变|一如既往|别无二致)$/,['focus','growth']],
 [/^(形影不离|比翼双飞|相辅相成|相得益彰)$/,['echo','inspire']],
 [/^(落井下石|趁火打劫|乘人之危|痛打落水)$/,['execute','curse']],

 [/^(三七|田七|人参|黄芪|当归|枸杞|药品|药物|药材|良药)$/,['mend','seal']],
 [/^(浴火重生|死而复生|起死回生|涅槃重生|涅槃|重生|复活)$/,['revive','growth']],
 [/^(水滴石穿|滴水穿石|锲而不舍|百折不挠)$/,['growth','edge']],
 [/^(一心一意|全神贯注|专心|专心致志|聚精会神)$/,['focus','growth']],
 [/^(三心二意|七嘴八舌)$/,['echo','count']],
 [/^(五雷轰顶|三头六臂)$/,['count','storm']],
 [/^(老马识途|高瞻远瞩|远见|远见卓识)$/,['focus','sky']],
 [/^(守株待兔|以逸待劳)$/,['barrier','execute']],
 [/^(画蛇添足|画龙点睛)$/,['brood','focus']],
 [/^(南辕北辙|迂回|包抄|背后|背面|后方|背刺|绕后)$/,['backstab','sky']],
 [/^(正面|前方|前面|迎面|迎击|冲锋)$/,['front','valor']],
 [/^(侧面|两侧|侧翼|左右|两边|旁边|两翼|左翼|右翼)$/,['flank','echo']],
 [/^(破釜沉舟|背水一战)$/,['valor','rescue']],
 [/^(釜底抽薪|清心寡欲)$/,['seal','curse']],
 [/^(乘风破浪|排山倒海|惊涛骇浪)$/,['tide','gravity']],
 [/^(沉默|缄默|缄口|禁言|闭口|封口|噤声|三缄其口)$/,['silence','peace']],
 [/^(撕裂|裂伤|切割|割裂|割伤|切开|斩断)$/,['bleed','edge']],
 [/^(红色|赤红|火红|鲜红|朱红|绯红)$/,['ember','valor']],
 [/^(蓝色|深蓝|碧蓝|湛蓝|冰蓝)$/,['frost','sky']],
 [/^(绿色|翠绿|碧绿|嫩绿)$/,['mend','thorn']],
 [/^(黑色|漆黑|墨黑|黝黑)$/,['soul','curse']],
 [/^(白色|雪白|洁白|银白)$/,['shine','seal']],
 [/^(夏天|夏日|夏季|盛夏|酷暑|炎夏)$/,['ember','growth']],
 [/^(秋天|秋日|秋季|金秋|丰收)$/,['prosper','growth']],
 [/^(冬天|冬日|冬季|寒冬|严冬)$/,['frost','growth']],
 [/^(今天|明天|昨天|昨日|来日|当今|现在|目前|此时|时代|时刻|时候)$/,['growth','focus']],
 [/^(过去|从前|往昔|往事|回忆|记忆|怀念)$/,['study','focus']],
 [/^(床|床铺|休息|休养|睡眠|睡觉|安眠|卧室)$/,['mend','peace']],
 [/^(厨师|厨房|做饭|烹饪|烧菜)$/,['mend','prosper']],
 [/^(司机|驾驶|航行|航海|船长|飞行员)$/,['tempo','sky']],
 [/^(裁缝|缝纫|裁剪|剪裁|工匠|手艺)$/,['edge','barrier']],
 [/^(什么|如何|为何|为什么|哪儿|哪里|何处|谁|疑问|提问|询问)$/,['shine','focus']]
);
RUNE_PATTERNS.unshift(['silence',/缄|噤|禁言|闭口|封口|无声/],['revive',/重生|复活|涅槃|还魂/],['bleed',/撕|裂|割|切|斩断|锯|剪|刮|削/]);
RUNE_PATTERNS.push(
 ['tide',/撞|砸|锤|推|摧|撼|敲|碰|击|拍|掀|撬|抬|压/],
 ['barrier',/坚|韧|硬|固|撑|承|支柱|支架|挡|筑|围|门|墙|房|屋|桌|椅|柜|箱|宿|住|舍|盾牌/],
 ['rescue',/扶|帮|支援|援助|维护|拯救|营救|挽回|挽救|补救|补偿/],
 ['prosper',/贸|易|买|卖|购|售|税|资|产|利|贷|储|蓄|储存|仓|收|割|获|酬|报酬|支付|经营|市场/],
 ['mend',/药|食|粮|米饭|果实|苹果|蔬|菜|营养|血|体|生命|肝|肺|脾|胃|肠/],
 ['brood',/犬|狗|猫|熊|猴|猿|猪|鼠|鸡|鸭|鹅|狐|狸|龟|蟹|虾|虫|蝶|蝉|蛙|雀|蝠|鳄/],
 ['thorn',/松|柏|杨|柳|梅|桃|杏|李树|榆|槐|桑|枫|杉|椿|桦|苇|棕|蓬|芦|茅|苗|芽|枝|叶|梢|丛|种植/],
 ['bloom',/桂|菊|莲|荷|兰花|玫瑰|牡丹|芙蓉|丁香|郁金香/],
 ['focus',/量|度量|衡|称|审|判|核|检|观|视|望|仪|表|电路|仪器|传感|探|究|索|问|求|查|搜|寻|找/],
 ['study',/章|册|稿|籍|典|卷|刊|报|纸|笔|墨|印|字|符|码|律|策|例|规|制|规程|训练|练习|经验/],
 ['tempo',/进|退|移|迁|撤|换|转|变|改|调|搬|送|取|拿|抓|握|撒|播|拔|攀|登|跳|跃|舞|摆|踏|骑|乘|车|舟|船|艇|轮|道|路|途/],
 ['echo',/听|闻|耳|嘴|口|舌|喉|沟通|报道|消息|网络|互联网|广播|新闻|波长|通信/],
 ['inspire',/人|众|群体|队|团|员|兵|官|将|帅|士|师|君|群众|伙伴|亲友|欢欣|欣|愉|畅|悦|笑|荣|誉/],
 ['growth',/期|季|晨|夕|曦|暮|晚|夜|周|星期|年代|代|季节|钟点|时间|永|恒|持|续|延|存|留|保留|积|累|培|养|增|升|扩/],
 ['curse',/丧|哀|泣|哭|忧|郁|恼|烦|闷|愤|恼怒|愧|羞|惊|恐|慌|险|困|窘|挫|失|败|损|减|消耗|虚|伪|骗|诈/],
 ['peace',/柔|缓|慢|淡|稳|舒|轻松|休闲|闲|止息|友善|善|慈|仁|恕|谅|容忍/],
 ['sky',/宽|阔|辽|遥|广泛|浩|洋|洲|江|河|湖|泊|海峡|港|湾|岸|滩|谷|川|原|丘|岭|峰|岛|屿|境|区|域|省|县|乡|村|镇|街|市|里程/],
 ['edge',/钢|铁|铜|铝|钛|铅|锡|锌|锰|镍|刨|斧|镰|钩|锥|钉|针|铡|镖/]
);
function readNumber(word){const match=word.match(/^[零一二两三四五六七八九十百千万]+/);if(!match)return 4;let total=0,section=0,n=0;const digits={零:0,一:1,二:2,两:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};for(const ch of match[0]){if(ch in digits)n=digits[ch];else if(ch==='万'){total+=(section+n||1)*10000;section=0;n=0;}else{section+=(n||1)*({十:10,百:100,千:1000}[ch]);n=0;}}return Math.max(1,total+section+n);}
function distanceSpan(word){const unit=word.match(/(公里|千米|米|里|丈|尺|寸)$/)?.[1];const factor={公里:1000,千米:1000,米:1,里:500,丈:3.33,尺:.333,寸:.0333}[unit]||1;return Math.min(24,5+Math.round(Math.log10(1+readNumber(word)*factor)*3));}
function chooseRunes(word){const exact=SYNONYM_RUNES.find(([re])=>re.test(word));if(exact)return exact[1].slice();if(/^[零一二两三四五六七八九十百千万]+(个|只|位|名|件|次|倍|岁|米|里|丈|尺|寸|公里|千米|分|点|章|轮|波|枚|朵|杯|斤|吨|人|户|元|块|天|年|月)?$/.test(word))return[/(米|里|丈|尺|寸)$/.test(word)?'measure':'count',/(元|块)$/.test(word)?'prosper':/(年|月|天|岁)$/.test(word)?'growth':'focus'];const found=[];for(const [id,re]of RUNE_PATTERNS)if(re.test(word)&&!found.includes(id)){found.push(id);if(found.length===2)break;}return found;}
export const runeLimit=tier=>tier<=1?0:tier>=4?2:1;
function qualityRunes(w){
 const candidates=chooseRunes(w.word),limit=runeLimit(w.tier);
 // Mixed elemental words keep the extra element when their base attribute
 // already provides the first meaning (e.g. fire-poison arrows keep fire).
 const core={splash:'ember',slow:'frost',chain:'storm',poison:'toxin'}[w.type];
 if(limit===1&&candidates[0]===core&&['ember','frost','storm','toxin','venom'].includes(candidates[1]))return[candidates[1]];
 return candidates.slice(0,limit);
}
export const hasRune=(w,id)=>w.runes?.includes(id)||false;
export const runeEffect=w=>w.runes.length?w.runes.map(id=>WORD_RUNES[id].name+'：'+(id==='count'?`每 ${w.semanticCycle} 次攻击蓄发一次，触发时直接伤害 +${w.semanticCycle*10}%。`:id==='measure'?`射程额外 +${distanceSpan(w.word)}，攻击间隔 +4%。`:WORD_RUNES[id].desc)).join(' '):w.tier===1?'凡字没有附加特性，保留基础属性、攻击形态和品阶效果。':'此词保留基础词意，没有匹配的附加特性。';
function chooseTrait(w){
 const text=w.word;
 if(w.type==='income'){if(/聚|宝|库|藏|树|盆|财源|斗金/.test(text))return'fortune';if(/币|钱|银|点石/.test(text))return'coin';if(/招|财运|发财/.test(text))return'entice';return'balanced';}
 if(w.type==='aura'){if(/盾|守|护|界|阵/.test(text))return'ward';if(/环|辉|万丈/.test(text))return'radiance';if(/圣|神|祝|明/.test(text))return'purify';if(/月/.test(text))return'moon';if(/星/.test(text))return'spread';return'balanced';}
 if(/破甲|穿甲|破阵/.test(text))return'sunder';
 if(w.type==='poison'&&/剧|腐|蚀|疫/.test(text)&&!/[箭弓弩枪云雾雨海]/.test(text))return'venom';
 if(/封|缚|牢|冻|禁|镇/.test(text))return'bind';
 if(/连|珠|双|分身|幻影/.test(text))return'combo';
 if(/箭雨|箭如雨下|万箭|齐发/.test(text))return'spread';
 if(/箭|弓|弩|枪|矢/.test(text)||w.type==='sniper'&&/穿云|穿杨|狙击/.test(text))return'ranged';
 if(w.type==='splash'&&/墙/.test(text))return'firewall';
 if(/龙/.test(text)&&['splash','slow','poison','fast','basic'].includes(w.type))return'dragon';
 if(/墙|盾|阵|域|界|守/.test(text))return'ward';
 if(/雨|雾|云|海|潮|浪|风暴|新星/.test(text))return'spread';
 if(/刃|剑|刀|斩|刺|爪/.test(text))return'blade';
 if(/球|弹|爆|锤|重|巨/.test(text))return'impact';
 if(/疾|迅|速|狂风/.test(text))return'rapid';
 return'balanced';
}
function applyWordTrait(w){const trait=chooseTrait(w),t=WORD_TRAITS[trait],runes=qualityRunes(w),runeDamage=runes.reduce((m,id)=>m*WORD_RUNES[id].damage,1);const desc=trait==='dragon'?'朝目标方向喷吐本属性龙息，命中扇面内的多个敌人。':trait==='firewall'?'命中产生爆裂，并在落点留下持续燃烧的地面火焰区域。':w.type==='poison'&&trait==='spread'?'投出毒团，在命中处形成毒域；后来进入区域的敌人也会持续中毒。':w.type==='poison'&&trait==='ranged'?'射出远程毒箭，命中单个目标，造成直接伤害并持续施毒。':w.desc;return{...w,trait,runes,semanticCycle:Math.min(10,readNumber(w.word)),desc,damage:Math.max(1,Math.round(w.damage*t.damage*runeDamage)),range:Math.max(60,w.range+t.range+(runes.includes('sky')?12:0)+(runes.includes('measure')?distanceSpan(w.word):0)),rate:Number((w.rate*t.rate*(runes.includes('sky')||runes.includes('measure')?1.04:1)).toFixed(4)),aura:Math.max(0,w.aura+(t.aura||0)),income:Math.max(1,Math.round(w.income*(t.income||1)))};}
export function wordRules(w){const n=w.tier,t=WORD_TRAITS[w.trait];return{radius:(n>=4?90:n>=3?80:65)+(t.area||0),chainTargets:(n>=4?5:n>=3?4:3)+(w.trait==='spread'?1:0),poisonTargets:(n>=4?2:0)+(w.trait==='spread'?2:0),poisonDuration:(n>=4?5:n>=3?4:3)+(w.trait==='venom'?1:0)+(hasRune(w,'venom')?1:0),poisonRatio:(t.poisonRatio||.6)+(hasRune(w,'toxin')?.08:0)+(hasRune(w,'venom')?.12:0),poisonRadius:85+(t.area||0),slowFactor:(n>=3?.45:.55)-(w.trait==='bind'?.05:0)-(hasRune(w,'frost')?.04:0),slowDuration:2.1+(w.trait==='bind'?1.1:0)+(hasRune(w,'frost')?.3:0),freeze:n>=4?.4+(w.trait==='bind'?.15:0):w.trait==='bind'?.25:0,bounty:(n>=4?3:n>=3?2:1)+(t.bounty||0),bountyDuration:w.trait==='entice'?7:4,lightDuration:(w.trait==='purify'?5:3)+(hasRune(w,'shine')?1:0)};}
export function traitEffect(w){const t=WORD_TRAITS[w.trait];let extra='';if(w.trait==='spread')extra=w.type==='poison'?`毒伤最多扩散至附近 ${wordRules(w).poisonTargets} 个额外目标。`:w.type==='slow'?'减速扩散至附近 2 个额外目标。':w.type==='splash'?'爆炸半径额外 +25。':w.type==='chain'?'额外连锁 1 个目标。':w.type==='pulse'?'震荡命中上限 +2。':'追加最多 2 个各 35% 伤害的副目标。';if(w.trait==='bind')extra=w.type==='slow'?'减速更强、持续更久，并有定身。':'命中施加短暂定身（同目标 4 秒间隔）。';if(w.trait==='spread'&&w.type==='poison')extra='命中处留下 3 秒毒域，后来进入的敌人也会受到每秒 35% 攻击的毒伤，离开后持续 2 秒；最多保留 2 片。'+extra;return extra+t.desc;}
const AUTHORED_MEANING_WORDS='寒冰毒箭 冰霜毒箭 冰火箭 冰毒箭 火毒箭 雷火箭 雷冰箭 火焰毒云 寒冰毒云 冰霜毒雾 雷霆毒箭 圣光箭 神圣箭 月光箭 星辰箭 追魂毒箭 剧毒之箭 腐蚀之箭 冰火双刃 冰火风暴 风雷之箭 浴火重生 死而复生 起死回生 涅槃重生 水滴石穿 滴水穿石 破釜沉舟 釜底抽薪 一心一意 全神贯注 三心二意 七上八下 老马识途 守株待兔 画蛇添足 南辕北辙 一米 两米 三米 十米 百米 千米 一里 十里 百里 千里 三尺 一寸 一丈 十丈 一公里 十公里 千里眼 顺风耳 侧翼 背刺 缄默 裂伤 灵兽 伏魔'.split(' ');
export const WORDS=[...COMBAT_WORDS,...[...new Set([...COMMON_WORDS,...AUTHORED_MEANING_WORDS])].filter(word=>!combatSet.has(word)).map(word=>{const type=SCHOOL_ALIASES.find(([re])=>re.test(word))?.[1]||SEMANTIC_SCHOOLS.find(([re])=>re.test(word))?.[1];const s=type&&type!=='basic'?SCHOOLS.find(s=>s.type===type):BASIC_SCHOOL;const tier=[...word].length;return {...s,words:undefined,word,tier,maxLevel:tier+2,cost:Math.round(s.cost*PRICE[tier]),damage:Math.round(s.damage*POWER[tier]),range:s.range+(tier-2)*12,aura:.15+tier*.1,income:5*tier};})].map(applyWordTrait);
const MEANING_HAND_WORDS='学习 读书 知识 朋友 伙伴 合作 团结 勇敢 英雄 努力 奋斗 成长 医生 健康 康复 和平 安宁 守护 母亲 家人 开心 快乐 感谢 谢谢 欢迎 工作 旅行 音乐 歌声 回声 沉默 缄默 撕裂 切割 背刺 侧翼 正面 冲锋 复活 重生 祝福 财富 丰收 秋天 夏天 冬天 春天 花朵 玫瑰 莲花 草木 森林 老虎 白虎 灵兽 人参 三七 五个 三倍 三尺 百米 千米 火毒箭 冰毒箭 冰火箭 月光箭 圣光箭 星辰箭 千里眼 顺风耳 寒冰毒箭 冰霜毒箭 冰霜毒雾 火焰毒云 雷霆毒箭 冰火双刃 冰火风暴 风雷之箭 浴火重生 涅槃重生 死而复生 起死回生 滴水穿石 水滴石穿 一心一意 全神贯注 老马识途 守株待兔 画龙点睛 破釜沉舟 釜底抽薪 乘风破浪 声东击西 暗度陈仓 春暖花开 百花齐放 众志成城 坚不可摧 日积月累 厚积薄发 积少成多 自强不息 齐心协力 同舟共济'.split(' ').map(word=>WORDS.find(w=>w.word===word)).filter(Boolean);
export const GRADES=['','凡字','灵词','妙语','天成'];
export function gradeEffect(w){
 const n=w.tier,r=wordRules(w);
 const effects={
 splash:`爆炸半径 ${r.radius}${n>=4?'；额外灼烧 2 秒（每秒 18% 攻击）':''}`,
 slow:`减速 ${Math.round((1-r.slowFactor)*100)}%，持续 ${r.slowDuration.toFixed(1)} 秒${r.freeze?'；每目标每 4 秒定身 '+r.freeze.toFixed(2)+' 秒':''}`,
 chain:`最多连锁 ${r.chainTargets} 个目标；雷击护盾双倍伤害`,
 fast:n>=3?`每第三次攻击额外追击 ${n>=4?70:35}% 伤害`:'高速持续单体攻击',
 heavy:n>=4?'无视护甲；附加目标最大生命 2% 伤害（上限 60）':n>=3?'无视护甲；重击使目标破甲 3 秒':'无视护甲；无法对空',
 aura:`光环增伤 ${Math.round(w.aura*100)}%${n>=3?'、攻速提高 '+(n>=4?12:6)+'%':''}；照明 ${r.lightDuration} 秒`,
 poison:`毒伤每秒 ${Math.round(r.poisonRatio*100)}% 攻击，持续 ${r.poisonDuration} 秒${r.poisonTargets?'；扩散至附近 '+r.poisonTargets+' 个目标':'；中毒停止回血'}`,
 sniper:n>=4?'生命低于 40% 时伤害 ×2.2':n>=3?'生命低于 35% 时伤害 ×2':'生命低于 30% 时伤害 ×1.8',
 income:`每轮产墨 ${w.income}；击杀赏金 +${r.bounty}，全体金塔每轮赏金上限 ${n>=4?35:n>=3?25:15}`,
 pierce:`直线最多穿透 ${n>=4?5:n>=3?4:3} 个目标，后续伤害 ${n>=4?85:70}%`,
 pulse:n>=4?'环形冲击最多 12 个目标，减速 1 秒':n>=3?'环形冲击最多 10 个目标':'环形冲击最多 8 个目标',
 mark:`咒印易伤 ${n>=4?30:n>=3?22:15}%，持续 ${n>=4?5:3} 秒`,
 echo:`幻影追击 ${n>=4?2:1} 次，每次 ${n>=3?60:45}% 伤害`,
 basic:n>=4?'每第四次攻击对附近 2 个目标造成 50% 余波':n>=3?'每第四次攻击额外造成 40% 伤害':'稳定的单体攻击'
 };if(w.trait==='dragon')return`龙息扇面最多覆盖 6 个目标${w.type==='slow'?'；减速 '+Math.round((1-r.slowFactor)*100)+'%':w.type==='poison'?'；毒伤持续 '+r.poisonDuration+' 秒':n>=4&&w.type==='splash'?'；天成吐息额外灼烧':''}`;return effects[w.type];
}
export const WAVE_INTERVAL=35;
export const HAND_SIZE=16;
export const HINT_COST=100;
export const SKILL_COOLDOWN=30, SKILL_BASE_COST=30, SKILL_COST_STEP=15;
const WORD_INDEX=new Map(WORDS.map(w=>[w.word,w]));
const WORD_PREFIXES=new Set(WORDS.flatMap(w=>Array.from({length:w.tier},(_,i)=>w.word.slice(0,i+1))));
export const getWord=word=>WORD_INDEX.get(word);
export function towerStats(t){const w=getWord(t.word),up=t.level-w.tier;return {damage:Math.round(w.damage*(1+up*(.65+(hasRune(w,'growth')?.1:0)))),range:w.range+up*15,rate:w.rate/(1+up*.14),aura:w.aura,income:Math.round(w.income*(1+up*.5))};}
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
Object.assign(ENEMIES,{
 hillrunner:{name:'踏岩山魈',hp:44,speed:35,reward:3,harm:1,icon:'跃',color:'#967453',role:'跳跃突进',desc:'每 6 秒跃进 50 距离；减速或冰冻期间无法跳跃，寒霜可阻断突进。'},
 bamboostalker:{name:'竹隐刺客',hp:48,speed:48,reward:4,harm:1,icon:'隐',color:'#547d58',role:'远距隐匿',desc:'距离词塔超过 130 时，直接伤害降低 30%；近距布塔、光塔照明或咒印可破隐。'},
 scrollguard:{name:'护卷书灵',hp:62,speed:32,reward:4,harm:1,icon:'卷',color:'#8b789d',role:'再生护盾',shield:24,desc:'每 8 秒重建护盾，最多 2 次；雷霆双倍破盾，毒伤可绕过护盾。'},
 tideshaper:{name:'溪鳞祭司',hp:72,speed:30,reward:5,harm:1,icon:'潮',color:'#4b9597',role:'群体护盾',desc:'每 6 秒给附近最多 3 个友军加薄盾，最多 2 次且护盾不叠加；雷霆、毒伤或尽早集火可克制。'},
 cloudraptor:{name:'云翼游隼',hp:44,speed:48,reward:4,harm:1,icon:'隼',color:'#688fa9',role:'空中俯冲',air:true,desc:'沿空中捷径飞行，每 7 秒俯冲 2 秒，速度提高 55%；减速和冰冻可中止俯冲，山石无法对空。'},
 clockwork:{name:'回廊机甲',hp:105,speed:28,reward:5,harm:2,icon:'机',color:'#aa8350',role:'正面格挡',desc:'来自行进方向正面的直接伤害降低 45%；从后方交叉攻击、山石重击或剑气穿透可破阵。'},
 frostbeast:{name:'霜壳雪兽',hp:90,speed:34,reward:5,harm:2,icon:'霜',color:'#79a8b8',role:'冰壳免控',desc:'冰壳减伤 15% 并免疫减速和冰冻；3 次词塔命中破壳，火与山石一次算 2 次。破壳后可正常控制。'},
 mirrorling:{name:'镜城幻伶',hp:62,speed:41,reward:4,harm:1,icon:'镜',color:'#aa78a7',role:'半血幻身',desc:'半血时生成一只 35% 生命的镜像，仅触发一次；镜像不能再次分身，范围攻击可同时清理。'},
 beaconrunner:{name:'烽火传令使',hp:60,speed:45,reward:4,harm:1,icon:'令',color:'#bc744b',role:'战败传令',desc:'被击败时使附近友军提速 30%，持续 3 秒，不叠加；远程提前击杀、减速留住后排可应对。'},
 astral:{name:'星蚀游灵',hp:94,speed:32,reward:5,harm:2,icon:'星',color:'#897bb8',role:'日月换相',desc:'每 5 秒切换日/月相：日相抵抗 35% 兵器伤害，月相抵抗 35% 法术伤害；照明、咒印、破甲或毒伤可克制。'}
});
Object.assign(ENEMIES,{
 hillboss:{name:'青岳山君',boss:true,behavior:'hillrunner',sigil:'岳',hp:350,speed:22,reward:25,harm:4,desc:'岩甲山君每 8 秒跃进；半血后狂化，跳跃更频繁。减速与定身可阻止跃进。'},
 bambooboss:{name:'竹海影皇',boss:true,behavior:'bamboostalker',sigil:'隐',hp:360,speed:25,reward:25,harm:4,stealthDistance:145,desc:'远于 145 的直接攻击减伤 30%；半血召来两名竹隐刺客。近塔、光照与咒印可破隐。'},
 scrollboss:{name:'禁书典狱',boss:true,behavior:'scrollguard',sigil:'典',hp:360,speed:22,reward:26,harm:4,shield:60,desc:'每 9 秒重建护盾，最多 3 次；半血召来两名护卷书灵。雷霆破盾与持续毒伤可克制。'},
 tideboss:{name:'沧流龙王',boss:true,behavior:'tideshaper',sigil:'沧',hp:390,speed:22,reward:26,harm:4,desc:'定时为附近友军加盾，最多 3 次；半血回复 8% 生命，中毒可阻止这次回复。'},
 cloudboss:{name:'云霄羽皇',boss:true,behavior:'cloudraptor',sigil:'霄',hp:300,speed:32,reward:26,harm:4,air:true,desc:'空中俯冲 Boss；半血展开护盾，周期加速。减速可中止俯冲，山石无法对空。'},
 gearboss:{name:'千机城主',boss:true,behavior:'clockwork',sigil:'机',hp:410,speed:21,reward:27,harm:4,desc:'正面直接伤害减免 45%，后方与石、剑可绕过格挡；半血核心暴露，失去正面格挡但提速 20%。'},
 frostlord:{name:'永冬霜主',boss:true,behavior:'frostbeast',sigil:'冬',hp:390,speed:22,reward:27,harm:4,shellLimit:6,desc:'冰壳减伤 20% 并免控，6 次词塔命中破壳，火与石每击算 2 次；半血重新结壳一次。'},
 mirrorqueen:{name:'万镜女王',boss:true,behavior:'mirrorboss',sigil:'镜',hp:360,speed:24,reward:27,harm:4,desc:'半血召来两名镜城幻伶，它们各自只能分身一次；范围、龙息与持续区域可清理镜阵。'},
 beaconlord:{name:'赤烽战侯',boss:true,behavior:'rallyboss',sigil:'烽',hp:400,speed:24,reward:28,harm:4,desc:'每 8 秒号令附近友军提速 30%、持续 3 秒，最多 3 次；半血自身狂化提速 20%。'},
 astralboss:{name:'万象星君',boss:true,behavior:'astral',sigil:'象',hp:430,speed:23,reward:30,harm:5,desc:'日/月相轮换，分别抵抗 35% 兵器/法术伤害；半血展开护盾并加快换相。光、咒、破甲及毒可克制。'}
});
// Variant bosses combine a primary behavior with bounded pulses and a single phase.
Object.assign(ENEMIES,{
 drumking:{name:'战鼓魔侯',boss:true,behavior:'rallyboss',sigil:'鼓',hp:370,speed:23,reward:27,harm:4,portraitUnit:'banner',ornament:'drum',color:'#aa7c63',phase:{summon:'swift',count:2},desc:'战鼓定时令附近友军提速 30%，持续 3 秒，最多 3 次；半血召来两只疾影。用减速和范围攻击化解鼓阵。'},
 shadeknight:{name:'掠影魔将',boss:true,behavior:'bamboostalker',sigil:'影',hp:340,speed:25,reward:27,harm:4,stealthDistance:140,portraitUnit:'bamboostalker',ornament:'blades',color:'#7c7894',pulse:{kind:'blink',interval:8,limit:3,distance:40},phase:{haste:.15},desc:'远距隐匿，每 8 秒闪进 40 距离，最多 3 次；控制可阻断闪进，半血提速 15%。光照与咒印破隐。'},
 lifetree:{name:'源泉树祖',boss:true,behavior:'plainboss',sigil:'泉',hp:320,speed:21,reward:27,harm:4,regenRate:.004,portraitUnit:'healer',ornament:'tree',color:'#76966a',pulse:{kind:'heal',interval:9,limit:3,ratio:.025,targets:3,radius:120},phase:{shield:.1},desc:'缓慢再生，并定时治疗自身与附近两名友军，最多 3 次；中毒阻止回复，半血展开护盾。毒箭集火或毒云禁疗都有效。'},
 ironcarapace:{name:'玄甲虫皇',boss:true,behavior:'plainboss',sigil:'甲',hp:380,speed:22,reward:27,harm:4,armor:.25,portraitUnit:'brood',ornament:'armor',color:'#6e8076',pulse:{kind:'summon',interval:10,limit:2,unit:'small',count:2},phase:{haste:.2},desc:'常驻护甲减伤 25%，分批孵出小墨点，最多两批；半血提速 20%。石、剑破甲，范围塔清理幼虫。'},
 emberhound:{name:'熔火獒王',boss:true,behavior:'plainboss',sigil:'炎',hp:350,speed:25,reward:28,harm:4,resistTypes:['splash'],resistance:.25,burnResist:.5,portraitUnit:'hillrunner',ornament:'flame',color:'#bd754b',pulse:{kind:'blink',interval:7,limit:3,distance:35},phase:{haste:.2},desc:'烈焰直接伤害减免 25%，灼烧减免 50%；会跃进，半血加速。用冰控制，搭配毒、雷或弓输出。'},
 plaguequeen:{name:'百毒蛊后',boss:true,behavior:'plainboss',sigil:'蛊',hp:330,speed:23,reward:28,harm:4,poisonResist:.4,portraitUnit:'brood',ornament:'spores',color:'#8c9660',pulse:{kind:'summon',interval:9,limit:3,unit:'small',count:1},phase:{summon:'split',count:1},desc:'毒伤减免 40%，分批召来墨点，半血再召一只裂墨；召唤有次数上限。用火雨、龙息或雷霆清群。'},
 stonewarden:{name:'镇岳石王',boss:true,behavior:'plainboss',sigil:'镇',hp:380,speed:20,reward:26,harm:4,armor:.25,portraitUnit:'tank',ornament:'armor',color:'#988068',pulse:{kind:'shield',interval:10,limit:2,ratio:.08,targets:1},phase:{shield:.1},desc:'岩甲常驻减伤 25%，定时形成石盾，半血另展护盾。石与剑无视护甲，雷霆破盾，毒伤绕盾。'},
 peakelder:{name:'山海灵猿',boss:true,behavior:'hillrunner',sigil:'猿',hp:330,speed:24,reward:26,harm:4,portraitUnit:'hillrunner',ornament:'staff',color:'#9b916c',phase:{summon:'hillrunner',count:2,haste:.1},desc:'跃进山道，半血召来两只踏岩山魈并提速 10%。提前铺设减速和持续区域，阻断猿群跃进。'},
 bambooswords:{name:'竹剑尊',boss:true,behavior:'plainboss',sigil:'剑',hp:350,speed:25,reward:26,harm:4,resistTypes:['fast','sniper'],resistance:.2,portraitUnit:'lancer',ornament:'blades',color:'#668461',pulse:{kind:'haste',interval:9,limit:2,radius:110},phase:{haste:.2,summon:'swift',count:1},desc:'疾风和神射直接伤害减免 20%，会号令附近友军加速；半血提速并召来疾影。用冰、雷、火或剑交叉迎击。'},
 bamboowitch:{name:'碧篁蛊师',boss:true,behavior:'plainboss',sigil:'篁',hp:330,speed:23,reward:26,harm:4,poisonResist:.3,portraitUnit:'healer',ornament:'spores',color:'#7e9666',pulse:{kind:'summon',interval:9,limit:2,unit:'small',count:2},phase:{heal:.06},desc:'抗毒 30%，分批召来墨点；半血回复 6% 生命，仍可被毒伤禁疗。范围攻击清虫，爆发压低本体。'},
 inkarchivist:{name:'墨卷司书',boss:true,behavior:'plainboss',sigil:'书',hp:330,speed:22,reward:27,harm:4,portraitUnit:'scrollguard',ornament:'pages',color:'#9886a8',pulse:{kind:'summon',interval:10,limit:2,unit:'scrollguard',count:1},phase:{shield:.12},desc:'定时召来护卷书灵，最多两名；半血展开护盾。雷霆破盾，毒域持续压制书阵。'},
 silencewarden:{name:'缄言判官',boss:true,behavior:'frostboss',sigil:'缄',hp:340,speed:23,reward:27,harm:4,resistTypes:['splash','slow','chain','poison','pulse','mark','echo','aura','basic'],resistance:.2,portraitUnit:'ward',ornament:'cage',color:'#7c7c9a',phase:{summon:'normal',count:2},desc:'附近词塔攻击间隔延长 25%，多数法术直接伤害减免 20%；半血召来墨影。远程弓、风、石、剑更有效。'},
 pearlclam:{name:'碧潮蚌母',boss:true,behavior:'scrollguard',sigil:'蚌',hp:330,speed:21,reward:27,harm:4,shield:65,portraitUnit:'shield',ornament:'pearl',color:'#87b4b3',phase:{heal:.08},desc:'厚盾可重建三次，半血回复 8% 生命；毒伤既绕盾又禁疗，雷霆也可高效破盾。'},
 riverturtle:{name:'玄澜龟将',boss:true,behavior:'plainboss',sigil:'澜',hp:370,speed:21,reward:27,harm:4,armor:.3,portraitUnit:'tank',ornament:'shell',color:'#668e88',pulse:{kind:'shield',interval:10,limit:2,ratio:.07,targets:3,radius:110},phase:{haste:.12},desc:'龟甲减伤 30%，给自身和附近两名友军加盾；半血提速。石、剑破甲，雷与毒协同拆盾。'},
 thunderkite:{name:'霆羽雷隼',boss:true,behavior:'cloudraptor',sigil:'隼',hp:270,speed:34,reward:27,harm:4,air:true,portraitUnit:'cloudraptor',ornament:'lightning',color:'#7d9cbb',phase:{summon:'flying',count:2,shield:.08},desc:'高速空中俯冲，半血召来两只飞羽并附盾。用寒霜中止俯冲，搭配长射程弓塔对空。'},
 cloudwhale:{name:'浮空云鲸',boss:true,behavior:'plainboss',sigil:'鲸',hp:380,speed:24,reward:28,harm:4,air:true,regenRate:.003,portraitUnit:'flying',ornament:'whale',color:'#95b6c3',pulse:{kind:'shield',interval:10,limit:2,ratio:.08,targets:1},phase:{haste:.15},desc:'高血慢速飞行，缓慢回复并周期附盾；半血提速 15%。毒箭禁疗、雷霆破盾，石塔无法对空。'},
 ballistalord:{name:'玄弩机关侯',boss:true,behavior:'clockwork',sigil:'弩',hp:320,speed:20,reward:28,harm:4,portraitUnit:'clockwork',ornament:'ballista',color:'#aa915c',pulse:{kind:'summon',interval:11,limit:2,unit:'armor',count:1},phase:{haste:.25},desc:'正面格挡并分批召来墨甲；半血失去格挡但提速 25%。后方布塔、石击和剑气可破机关阵。'},
 pendulumlord:{name:'千轮摆钟',boss:true,behavior:'frostboss',sigil:'钟',hp:350,speed:21,reward:28,harm:4,portraitUnit:'clockwork',ornament:'clock',color:'#a29471',pulse:{kind:'blink',interval:9,limit:2,distance:40},phase:{shield:.1},desc:'近身延缓词塔攻击，定时错步跃进，半血附盾。用远射词塔覆盖后段，减速可阻止错步。'},
 icephoenix:{name:'寒羽冰凰',boss:true,behavior:'cloudraptor',sigil:'凰',hp:280,speed:30,reward:28,harm:4,air:true,shellLimit:4,portraitUnit:'cloudraptor',ornament:'icewings',color:'#9fc4d6',phase:{shell:true},desc:'飞行俯冲，冰壳免控，四击破壳，火与石每击算两次；半血仅重新结壳一次。火、雷、弓与破壳后减速配合。'},
 glaciergolem:{name:'冰川巨像',boss:true,behavior:'frostbeast',sigil:'川',hp:400,speed:19,reward:28,harm:4,shellLimit:8,portraitUnit:'tank',ornament:'crystal',color:'#9eb9c7',phase:{summon:'frostbeast',count:1},desc:'八击才能破开初始冰壳，火、石每击算两次；半血召来雪兽，不会再次结壳。速射或连击也能快速破壳。'},
 glasswyrm:{name:'琉璃镜螭',boss:true,behavior:'bamboostalker',sigil:'螭',hp:330,speed:25,reward:28,harm:4,stealthDistance:150,portraitUnit:'hillrunner',ornament:'mirrors',color:'#b594bd',pulse:{kind:'blink',interval:9,limit:2,distance:35},phase:{summon:'mirrorling',count:1,shield:.08},desc:'远距折光减伤并会闪进；半血召来幻伶并附盾。光照或咒印破折光，范围攻击清理镜像。'},
 dreamweaver:{name:'幻梦织主',boss:true,behavior:'plainboss',sigil:'梦',hp:320,speed:22,reward:28,harm:4,resistTypes:['fast','heavy','sniper','pierce'],resistance:.2,portraitUnit:'healer',ornament:'ribbons',color:'#a58bb4',pulse:{kind:'summon',interval:12,limit:2,unit:'mirrorling',count:1},phase:{heal:.06},desc:'兵器直接伤害减免 20%，定时召来可分身的幻伶；半血回复生命。法术范围伤害和毒云更适合拆梦阵。'},
 embermarshal:{name:'炎旗大将',boss:true,behavior:'rallyboss',sigil:'旗',hp:360,speed:23,reward:29,harm:4,resistTypes:['splash'],resistance:.25,burnResist:.4,portraitUnit:'banner',ornament:'warbanner',color:'#b9855c',phase:{haste:.15,shield:.08},desc:'抗烈焰与灼烧，号令友军冲锋；半血自身提速并附盾。冰控、雷击和毒伤可压制军旗。'},
 emberbeast:{name:'烽燧火犼',boss:true,behavior:'hillrunner',sigil:'犼',hp:340,speed:23,reward:29,harm:4,burnResist:.5,portraitUnit:'hillrunner',ornament:'flame',color:'#be8054',phase:{summon:'lancer',count:1},desc:'会跃进且灼烧伤害减半；半血召来突阵冲锋。减速阻断跃进，用毒、雷、弓集中输出。'},
 sunsovereign:{name:'曜日天尊',boss:true,behavior:'astral',sigil:'曜',hp:390,speed:23,reward:30,harm:5,initialPhase:0,portraitUnit:'astral',ornament:'sun',color:'#c0a15e',phase:{mode:1,shield:.12},desc:'前半场固定日相抵抗兵器，半血转为月相抵抗法术并附盾。混搭伤害类别，用光、咒或毒应对反转。'},
 moonsovereign:{name:'幽月冥后',boss:true,behavior:'astral',sigil:'冥',hp:370,speed:23,reward:30,harm:5,initialPhase:1,portraitUnit:'astral',ornament:'moon',color:'#9688bc',phase:{mode:0,heal:.08},desc:'前半场固定月相抵抗法术，半血转日相并回复生命；毒伤阻止回复，光照与咒印解除相位抗性。'}
});
// Small enemy variants use bounded abilities and modest replacement budgets.
Object.assign(ENEMIES,{
 shieldscout:{"name":"披盾斥候","hp":38,"speed":62,"reward":4,"harm":1,"sprite":"swift","trim":"shield","color":"#6e91a5","icon":"披","role":"轻盾疾行","desc":"低血快行并携带薄盾；雷霆破盾，寒霜拦截。","shield":18},
 ironvanguard:{"name":"轻甲先锋","hp":88,"speed":34,"reward":5,"harm":1,"sprite":"armor","trim":"helmet","color":"#8a9081","icon":"轻","role":"轻甲推进","desc":"护甲减伤 15%，没有厚重血量；石、剑无视护甲。","armor":0.15},
 duskwing:{"name":"暮羽蝠","hp":45,"speed":48,"reward":4,"harm":1,"sprite":"flying","trim":"bat","color":"#82758f","icon":"暮","role":"远距隐匿 · 飞行","desc":"飞行且远于 170 时减伤 30%；光、咒破隐，弓与雷对空。","air":true,"behavior":"bamboostalker","stealthDistance":170},
 shellmite:{"name":"甲壳虫","hp":64,"speed":34,"reward":4,"harm":1,"sprite":"brood","trim":"shell","color":"#879b9e","icon":"甲","role":"二击冰壳","desc":"冰壳减伤并免控，2 次命中即破；火与石一击算两次。","shellLimit":2},
 hornacolyte:{"name":"号角徒","hp":72,"speed":27,"reward":4,"harm":1,"sprite":"healer","trim":"horn","color":"#a68a60","icon":"号","role":"限次鼓舞","desc":"只吹响一次号角，附近至多三名友军加速 3 秒；减速可压住冲锋。","pulse":{"kind":"haste","interval":9,"limit":1,"targets":3,"radius":85}},
 emberscout:{"name":"赤焰卒","hp":54,"speed":43,"reward":4,"harm":1,"sprite":"lancer","trim":"flame","color":"#ba7652","icon":"赤","role":"抗火轻兵","desc":"烈焰直伤与灼烧减免 20%，没有火焰免疫；换用冰、毒、雷可克制。","resistTypes":["splash"],"resistance":0.2,"burnResist":0.2},
 plaguebeetle:{"name":"瘴甲虫","hp":66,"speed":33,"reward":4,"harm":1,"sprite":"split","trim":"spores","color":"#899654","icon":"瘴","role":"弱抗毒","desc":"毒伤减免 25%；光或咒可揭除毒抗，火与剑适合快速清理。","poisonResist":0.25},
 pennantguard:{"name":"护旗卫","hp":110,"speed":23,"reward":5,"harm":1,"sprite":"shield","trim":"pennant","color":"#9c966b","icon":"护","role":"一次护援","desc":"给自己与附近一名友军加一次小盾；雷霆、毒伤或集火旗手可克制。","pulse":{"kind":"shield","interval":10,"limit":1,"ratio":0.08,"targets":2,"radius":80}},
 stonebadger:{"name":"岩背獾","hp":95,"speed":27,"reward":5,"harm":1,"sprite":"tank","trim":"rock","color":"#927b65","icon":"岩","role":"岩甲转锋","desc":"护甲减伤 20%，半血提速 12%；石剑破甲，冰控收尾。","armor":0.2,"phase":{"haste":0.12}},
 hillkite:{"name":"岚谷雀","hp":36,"speed":49,"reward":4,"harm":1,"sprite":"flying","trim":"gust","color":"#8f9b79","icon":"岚","role":"一次空跃","desc":"空中轻兵，只会跃进一次；减速或定身可阻止这次跃进。","air":true,"pulse":{"kind":"blink","interval":7,"limit":1,"distance":25}},
 bambooent:{"name":"缠枝木灵","hp":108,"speed":22,"reward":5,"harm":1,"sprite":"regen","trim":"leaves","color":"#6d9363","icon":"缠","role":"缓慢复苏","desc":"每秒回复 0.5% 生命；半血只唤出一只墨点。毒伤禁疗，范围塔清子体。","regenRate":0.005,"phase":{"summon":"small","count":1}},
 bamboodart:{"name":"竹叶镖客","hp":43,"speed":51,"reward":4,"harm":1,"sprite":"bamboostalker","trim":"dart","color":"#72925a","icon":"竹","role":"近域潜行","desc":"远于 100 时直接减伤 30%，但生命较低；近距塔、光照与咒印克制。","behavior":"bamboostalker","stealthDistance":100},
 scrollwisp:{"name":"墨页飞灵","hp":40,"speed":44,"reward":4,"harm":1,"sprite":"flying","trim":"pages","color":"#8d81aa","icon":"墨","role":"护盾飞页","desc":"沿空路前进，只有一层薄盾；雷霆破盾，弓与光可对空。","air":true,"shield":14},
 scrollscribe:{"name":"抄卷侍","hp":80,"speed":24,"reward":4,"harm":1,"sprite":"healer","trim":"brush","color":"#9a8b79","icon":"抄","role":"一次抄愈","desc":"只施放一次小治疗，最多覆盖三名友军；中毒或封息可阻止回复。","pulse":{"kind":"heal","interval":9,"limit":1,"ratio":0.02,"targets":3,"radius":85}},
 tideskipper:{"name":"浪涌斥候","hp":46,"speed":45,"reward":4,"harm":1,"sprite":"swift","trim":"splash","color":"#5c9d9c","icon":"浪","role":"有限踏浪","desc":"踏浪跃进最多两次，每次 30 距离；减速与定身可阻止跃进。","pulse":{"kind":"blink","interval":7,"limit":2,"distance":30}},
 tideclam:{"name":"蚌壳守卒","hp":105,"speed":23,"reward":5,"harm":1,"sprite":"shield","trim":"pearl","color":"#7eaaa1","icon":"蚌","role":"换壳守卫","desc":"携带护盾，半血仅换壳一次再加少量护盾；雷霆或绕盾毒伤克制。","shield":24,"phase":{"shield":0.12}},
 cloudmender:{"name":"浮云使","hp":58,"speed":29,"reward":4,"harm":1,"sprite":"healer","trim":"cloud","color":"#90aabc","icon":"浮","role":"空中护援","desc":"飞行支援兵，只给自己与一名近邻加一次薄盾；雷霆对空并破盾。","air":true,"pulse":{"kind":"shield","interval":9,"limit":1,"ratio":0.06,"targets":2,"radius":85}},
 thunderchick:{"name":"雷羽雏","hp":37,"speed":56,"reward":4,"harm":1,"sprite":"flying","trim":"bolt","color":"#9b9d6d","icon":"雷","role":"抗雷轻羽","desc":"飞行快怪，雷系直接伤害减免 15%；弓、冰或毒更合适。","air":true,"resistTypes":["chain"],"resistance":0.15},
 gearroller:{"name":"滚轮侍","hp":68,"speed":39,"reward":4,"harm":1,"sprite":"clockwork","trim":"wheel","color":"#a6926b","icon":"滚","role":"滚轮格挡","desc":"正面有格挡，半血提速 12%；交叉火力、石与剑可绕过格挡。","behavior":"clockwork","phase":{"haste":0.12}},
 gearglider:{"name":"伞翼机关","hp":48,"speed":38,"reward":4,"harm":1,"sprite":"flying","trim":"glider","color":"#a39b82","icon":"伞","role":"薄盾滑翔","desc":"伞翼沿空中捷径滑翔并携薄盾；雷和弓对空，石塔无法攻击。","air":true,"shield":18},
 frostshade:{"name":"雪幕灵","hp":48,"speed":40,"reward":4,"harm":1,"sprite":"bamboostalker","trim":"veil","color":"#91aab4","icon":"雪","role":"雪幕折光","desc":"远于 120 时直接伤害减免 30%；光照、咒印与近身火力可破雪幕。","behavior":"bamboostalker","stealthDistance":120},
 frostcrab:{"name":"冻河蟹","hp":90,"speed":25,"reward":5,"harm":1,"sprite":"frostbeast","trim":"iceclaws","color":"#8ab1bd","icon":"冻","role":"四击冰壳","desc":"低速蟹兵，冰壳需要 4 次命中才破；火与石每击算两次，速射也有效。","shellLimit":4},
 mirrorbird:{"name":"碎镜鸟","hp":38,"speed":49,"reward":4,"harm":1,"sprite":"flying","trim":"shard","color":"#b194b4","icon":"碎","role":"一次碎镜","desc":"飞行轻兵，半血只落下一只墨点；对空塔拦截，范围火力清理落地子体。","air":true,"phase":{"summon":"small","count":1}},
 mirrorguard:{"name":"映墨傀","hp":85,"speed":27,"reward":4,"harm":1,"sprite":"astral","trim":"mirror","color":"#9587ae","icon":"映","role":"镜面换相","desc":"每 5 秒切换兵器/法术抗性；光、咒、破甲与持续毒伤克制。","behavior":"astral"},
 beaconguard:{"name":"烽旗盾兵","hp":92,"speed":25,"reward":5,"harm":1,"sprite":"armor","trim":"warshield","color":"#b48b63","icon":"烽","role":"一次战旗","desc":"携盾且仅号令一次，自己和一名近邻短时加速；雷破盾，冰控截阵。","shield":22,"pulse":{"kind":"haste","interval":8,"limit":1,"targets":2,"radius":80}},
 beaconkite:{"name":"烽羽信使","hp":39,"speed":51,"reward":4,"harm":1,"sprite":"flying","trim":"spark","color":"#b78762","icon":"烽","role":"半血疾递","desc":"飞行轻兵，半血提速 20%；寒霜能压住加速，对空火力收尾。","air":true,"phase":{"haste":0.2}},
 astralbat:{"name":"星陨蝠","hp":47,"speed":45,"reward":4,"harm":1,"sprite":"flying","trim":"meteor","color":"#9a8ab8","icon":"星","role":"空中换相","desc":"空中轻兵，每 5 秒切换抗性；用光、咒或混搭对空伤害迎击。","air":true,"behavior":"astral"},
 astralweaver:{"name":"聚星侍","hp":84,"speed":24,"reward":4,"harm":1,"sprite":"ward","trim":"orbit","color":"#a29cc0","icon":"聚","role":"一次星盾","desc":"为附近至多三名友军加一次薄盾，半血回复 4%；毒或封息可阻止回复。","pulse":{"kind":"shield","interval":10,"limit":1,"ratio":0.05,"targets":3,"radius":85},"phase":{"heal":0.04}}
});
ENEMIES.boss.phase={shield:.12,haste:.12};
ENEMIES.boss.desc='高血墨魁，半血凝结护盾并提速 12%；雷霆拆盾、冰控与集中输出迎击。生命随轮数额外成长，漏过山门损失 4 点生命。';
ENEMIES.stormboss.phase={haste:.12};
ENEMIES.stormboss.desc='空中厚盾 Boss，半血提速 12%；用雷霆拆盾、弓塔拦截和寒霜减速，山石无法对空。';
ENEMIES.broodqueen.phase={shield:.08};
ENEMIES.broodqueen.desc='最多召唤三批墨点；半血展开护盾并缩短剩余召唤间隔。范围攻击清群，集中输出本体。';
ENEMIES.frostboss.phase={shield:.1,haste:.1};
ENEMIES.frostboss.desc='寒域使近身词塔攻击间隔增加 25%；半血附盾并提速 10%。用远射与毒伤处理本体。';
const BASE_MAP_BOSSES=['hillboss','bambooboss','scrollboss','tideboss','cloudboss','gearboss','frostlord','mirrorqueen','beaconlord','astralboss'];
const BASE_PHASES=[{haste:.12},{summon:'bamboostalker',count:2},{summon:'scrollguard',count:2},{heal:.08},{shield:.15},{haste:.2},{shell:true},{summon:'mirrorling',count:2},{haste:.2},{shield:.15,period:3}];
BASE_MAP_BOSSES.forEach((k,i)=>ENEMIES[k].phase=BASE_PHASES[i]);
export const COMMON_BOSSES=['boss','ironboss','broodqueen','stormboss','frostboss','inkking','drumking','shadeknight','lifetree','ironcarapace','emberhound','plaguequeen'];
export const MAP_BOSS_POOLS=[
 ['hillboss','stonewarden','peakelder'],['bambooboss','bambooswords','bamboowitch'],['scrollboss','inkarchivist','silencewarden'],['tideboss','pearlclam','riverturtle'],['cloudboss','thunderkite','cloudwhale'],['gearboss','ballistalord','pendulumlord'],['frostlord','icephoenix','glaciergolem'],['mirrorqueen','glasswyrm','dreamweaver'],['beaconlord','embermarshal','emberbeast'],['astralboss','sunsovereign','moonsovereign']
];
export const MAP_BOSSES=MAP_BOSS_POOLS.flat();
export const bossChapter=kind=>MAP_BOSS_POOLS.findIndex(pool=>pool.includes(kind));
export const enemyBehavior=e=>ENEMIES[e.kind].behavior||e.kind;
export const shellLimit=e=>ENEMIES[e.kind].shellLimit||3;
export const hasIceShell=e=>(enemyBehavior(e)==='frostbeast'||ENEMIES[e.kind].shellLimit>0)&&(e.shellHits||0)<shellLimit(e);
export const THEME_UNITS=[
 {kind:'hillrunner',counter:'用寒霜阻止跳跃，保留后段补刀'},
 {kind:'bamboostalker',counter:'近距布塔，或用光、咒解除隐匿'},
 {kind:'scrollguard',counter:'雷霆持续破盾，毒伤绕过护盾'},
 {kind:'tideshaper',counter:'先集火护盾祭司，搭配雷霆或毒伤'},
 {kind:'cloudraptor',counter:'补充对空与减速，拦住俯冲'},
 {kind:'clockwork',counter:'从后方交叉攻击，或用石、剑破阵'},
 {kind:'frostbeast',counter:'先用火、石或速射破壳，再用冰控制'},
 {kind:'mirrorling',counter:'范围攻击清理幻身，避免只靠单体'},
 {kind:'beaconrunner',counter:'远程提前击败传令使，用减速应对冲锋'},
 {kind:'astral',counter:'兵器与法术混搭，用光、咒或毒应对换相'}
];
export const COMMON_MINIONS=['shieldscout','ironvanguard','duskwing','shellmite','hornacolyte','emberscout','plaguebeetle','pennantguard'];
export const MAP_MINION_POOLS=[['hillrunner','stonebadger','hillkite'],['bamboostalker','bambooent','bamboodart'],['scrollguard','scrollwisp','scrollscribe'],['tideshaper','tideskipper','tideclam'],['cloudraptor','cloudmender','thunderchick'],['clockwork','gearroller','gearglider'],['frostbeast','frostshade','frostcrab'],['mirrorling','mirrorbird','mirrorguard'],['beaconrunner','beaconguard','beaconkite'],['astral','astralbat','astralweaver']];
export const minionChapter=kind=>MAP_MINION_POOLS.findIndex(pool=>pool.includes(kind));
export const astralPhase=(e,time)=>e.astralMode!==undefined?e.astralMode:Math.floor(Math.max(0,time-(e.bornAt??0))/(e.astralPeriod||5))%2;
const PHYSICAL_TYPES=new Set(['fast','heavy','sniper','pierce']);
export const damageClass=w=>PHYSICAL_TYPES.has(w.type)?'兵器':'法术';
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
 const endlessRound=Math.max(0,round-CHAPTERS[chapter].rounds);
 const boss=endlessRound>=4||part===3&&(endlessRound>0||round%3===0||round===CHAPTERS[chapter].rounds);
 const finale=round===CHAPTERS[chapter].rounds;
 const bossPool=[...COMMON_BOSSES,...MAP_BOSS_POOLS[chapter]],bossKind=null;
 const stage=round+Math.min(3,Math.floor(chapter/2),Math.max(0,round-2));
 let pool=['normal','normal','normal','swift'],formation='墨影来袭',counter='先布攻击塔，保留墨点补强';
 if(stage===2){pool=['normal','swift','armor',...(part===2?['flying','flying']:['shield'])];formation=part===2?'飞羽突袭':'先锋试阵';counter='补充对空、破甲与减速';}
 if(stage===3){pool=['normal','swift','armor','tank','shield',...(chapter>0?['lancer']:[])];formation='重阵推进';counter='雷霆破盾、山石迎击重甲';}
 if(stage>=4){const f=FORMATIONS[(stage-4+part-1+chapter*2)%FORMATIONS.length];pool=[...f.pool,'normal','normal','swift'];formation=f.name;counter=f.counter;if(round>=7)pool.push(...FORMATIONS[(round+part+chapter)%FORMATIONS.length].pool.slice(0,2));if(round>=9)pool.push('ward','healer');}
 const signature=round>=4?MAP_MINION_POOLS[chapter][(round-4+part-1)%3]:THEME_UNITS[chapter].kind;if(round>=2)pool.push(signature);if(round>=4){pool.push(COMMON_MINIONS[(round+part+chapter)%COMMON_MINIONS.length],...MAP_MINION_POOLS[chapter]);}
 return{bossPool,endlessRound,signature,round,part,stage,pool,boss,bossKind,formation,counter,count:Math.min(80,8+round*3+chapter*2+(part-1)*2+Math.floor(Math.max(0,round-4)*1.2)),title:boss?'随机 Boss · '+formation:formation};
}
export function enemyHealthScale(chapter,wave,kind){
 const round=Math.max(1,Math.ceil(wave/3)),part=(Math.max(1,wave)-1)%3,boss=!!ENEMIES[kind].boss;
 const opening=chapter>=3&&round<=3&&!boss?.9:1;
 const growth=boss?1.65+round*.06:1+Math.max(0,round-3)*.02;
 return(1+(round-1)*.36+part*.08+CHAPTERS[chapter].difficulty)*1.25*(1+Math.max(0,round-5)*.015)*opening*growth;
}
export class Game {
 get pads(){return getMap(this.chapter).pads;}
 constructor(chapter=0,seed=(Math.random()*4294967296)>>>0){this.chapter=chapter;this.wave=0;this.endless=false;this.unlockedPads=Array.from({length:FREE_PAD_COUNT},(_,i)=>i);this.hp=CHAPTERS[chapter].hp;this.ink=CHAPTERS[chapter].ink;this.towers=[];this.enemies=[];this.effects=[];this.zones=[];this.queue=[];this.time=0;this.spawnTime=0;this.autoWaveAt=0;this.pendingWaves=null;this.phase='prepare';this.kills=0;this.nextId=1;this.skillReady=0;this.skillUses=0;this.totalEarned=0;this.bountyEarned=0;this.barrierSpent=0;this.soulHealed=0;this.reviveUsed=false;this.bossDraws=[];this.events=[];this.rngState=(seed>>>0)||1;this.refreshes=0;this.handSerial=0;this.hand=[];for(let i=0;i<4;i++)this.random();this.drawHand();}
 emit(type,data={}){this.events.push({type,...data});}
 random(){let x=this.rngState;x^=x<<13;x^=x>>>17;x^=x<<5;this.rngState=x>>>0;return this.rngState/4294967296;}
 drawHand(){
  this.hintWord=null;
  const pick=xs=>xs[Math.floor(this.random()*xs.length)];
  const attack=COMBAT_WORDS.filter(w=>w.tier===2&&w.damage>0&&!['aura','income'].includes(w.type));
  const short=COMBAT_WORDS.filter(w=>w.tier===2),medium=COMBAT_WORDS.filter(w=>w.tier===3),long=COMBAT_WORDS.filter(w=>w.tier===4);
  const themed=(list,tier)=>this.random()<.15?pick(MEANING_HAND_WORDS.filter(w=>w.tier===tier)):pick(list);
  const starter=pick(attack);
  const letters=[...starter.word,starter.icon,...themed(short,2).word,...themed(medium,3).word,...themed(long,4).word];
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
 upgradeCost(t){const w=getWord(t.word);return Math.round(w.cost*(t.level===w.tier?.75:1.15)*(hasRune(w,'study')?.92:1));}
 barrierRemaining(){return Math.max(0,Math.max(0,...this.towers.filter(t=>hasRune(getWord(t.word),'barrier')).map(t=>Math.min(2,getWord(t.word).tier)))-this.barrierSpent);}
 sell(id){const t=this.towers.find(t=>t.id===id);if(!t||['won','lost'].includes(this.phase))return false;this.ink+=Math.floor(t.spent*.7);this.towers=this.towers.filter(x=>x.id!==id);this.emit('sell');return true;}
 continueEndless(){if(this.phase!=='won'||this.endless)return false;this.endless=true;this.phase='prepare';this.events=[];this.emit('endless');return true;}
 plan(wave){const plan=wavePlan(this.chapter,wave),kind=this.bossDraws.find(x=>x.wave===wave)?.kind;return kind?{...plan,bossKind:kind,title:ENEMIES[kind].name+' · '+plan.formation}:plan;}
 roundInfo(next=this.phase==='prepare'||this.phase==='intermission'){return this.plan(this.wave+(next?1:0));}
 wavePreview(){return this.plan(this.wave+1);}
 startWave(){if(!['prepare','intermission'].includes(this.phase))return false;this.launchWave(this.time);return true;}
 launchWave(at){
  this.wave++;this.phase='battle';const plan=wavePlan(this.chapter,this.wave),map=getMap(this.chapter);
  if(plan.boss){const last=this.bossDraws.at(-1)?.kind,choices=[...COMMON_BOSSES,...MAP_BOSS_POOLS[this.chapter].flatMap(k=>Array(COMMON_BOSSES.length/MAP_BOSS_POOLS[this.chapter].length).fill(k))].filter(k=>k!==last);plan.bossKind=choices[Math.floor(this.random()*choices.length)];this.bossDraws.push({wave:this.wave,kind:plan.bossKind});this.bossDraws=this.bossDraws.slice(-12);}
  const batch=map.mode==='simultaneous'?map.routes.length:1,interval=Math.max(.4,1.03-plan.round*.035);
  const entries=Array.from({length:plan.count},(_,i)=>({kind:plan.boss&&i===plan.count-1?plan.bossKind:i===0&&plan.round>=2?plan.signature:i<Math.min(3,plan.pool.length)&&plan.stage>=4?plan.pool[i]:plan.pool[Math.floor(this.random()*plan.pool.length)],route:map.mode==='staggered'?Math.floor(i/4)%map.routes.length:i%map.routes.length,wave:this.wave,at:at+Math.floor(i/batch)*interval*batch}));
  this.queue.push(...entries);this.queue.sort((a,b)=>(a.at??this.time)-(b.at??this.time));
  this.pendingWaves??=[];this.pendingWaves.push(this.wave);this.autoWaveAt=plan.part<3?at+WAVE_INTERVAL:0;this.emit('wave',{wave:this.wave});
 }
 spawn(kind,distance=0,route=0,wave=this.wave){const st=ENEMIES[kind],scale=enemyHealthScale(this.chapter,wave,kind);const e={map:this.chapter,route,wave,bornAt:this.time,id:this.nextId++,kind,hp:st.hp*scale,maxHp:st.hp*scale,speed:st.speed*(1+Math.min(this.chapter,4)*.05),reward:st.reward,harm:st.harm,d:Math.max(0,distance),slowUntil:0};if(kind==='shield'||st.shield){e.shield=(st.shield||55)*scale;e.maxShield=e.shield;}const behavior=st.behavior||kind;if(['healer','broodqueen','hillrunner','scrollguard','tideshaper','cloudraptor','rallyboss'].includes(behavior))e.abilityAt=this.time+({healer:4,broodqueen:8,hillrunner:st.boss?8:6,scrollguard:st.boss?9:8,tideshaper:st.boss?8:6,cloudraptor:st.boss?8:7,rallyboss:8}[behavior]);if(st.pulse)e.pulseAt=this.time+st.pulse.interval;if(st.initialPhase!==undefined)e.astralMode=st.initialPhase;this.enemies.push(e);return e;}
 skillCost(){return SKILL_BASE_COST+this.skillUses*SKILL_COST_STEP;}
 skill(){const cost=this.skillCost();if(this.phase!=='battle'||this.time<this.skillReady||this.ink<cost)return false;this.ink-=cost;this.skillUses++;this.skillReady=this.time+SKILL_COOLDOWN;for(const e of this.enemies){e.hp-=100;if(!(hasIceShell(e)))e.slowUntil=this.time+3;}this.effects.push({kind:'rain',life:1,max:1});this.emit('skill',{cost,nextCost:this.skillCost()});return true;}
 step(dt){dt=Math.max(0,Math.min(dt,.1));for(const fx of this.effects)fx.life-=dt;this.effects=this.effects.filter(f=>f.life>0);if(this.phase==='intermission'){this.phase='battle';this.pendingWaves=[];}
 if(this.phase!=='battle')return;
 this.pendingWaves??=this.wave>0?[this.wave]:[];
 this.time+=dt;
 if(this.autoWaveAt>0&&this.time+1e-9>=this.autoWaveAt)this.launchWave(this.autoWaveAt);
 this.spawnTime-=dt;
 while(this.queue.length&&this.queue[0].at!==undefined&&this.queue[0].at<=this.time+1e-9){const next=this.queue.shift();this.spawn(next.kind,0,next.route??0,next.wave??this.wave);}
 // Older saves and handcrafted states may still contain an unscheduled spawn queue.
 if(this.queue.length&&this.queue[0].at===undefined&&this.spawnTime<=0){const batch=getMap(this.chapter).mode==='simultaneous'?getMap(this.chapter).routes.length:1;for(const next of this.queue.splice(0,batch))this.spawn(next.kind,0,next.route??0,next.wave??this.wave);this.spawnTime=Math.max(.4,1.03-Math.ceil(this.wave/3)*.035)*batch;}

 this.updateZones();
 this.updateEnemies(dt);
 for(const t of this.towers)this.attack(t,dt);
 for(const e of this.enemies){if(e.hp<=0){const cap=Math.max(this.towers.some(t=>hasRune(getWord(t.word),'luck'))?10:0,...this.towers.filter(t=>getWord(t.word).type==='income').map(t=>getWord(t.word).tier>=4?35:getWord(t.word).tier>=3?25:15));const bounty=e.bountyUntil>this.time?Math.min(e.bounty||0,Math.max(0,cap-this.bountyEarned)):0;this.bountyEarned+=bounty;this.ink+=e.reward+bounty;this.totalEarned+=e.reward+bounty;if(bounty)this.effects.push({kind:'coin',to:enemyPosition(e),amount:bounty,life:.8,max:.8});if(e.soulUntil>this.time&&this.soulHealed<1&&this.hp<CHAPTERS[this.chapter].hp){this.hp++;this.soulHealed++;}this.kills++;this.effects.push({kind:'pop',to:enemyPosition(e),color:'#556b58',life:.45,max:.45});if(e.kind==='beaconrunner'){const p=enemyPosition(e);for(const ally of this.enemies)if(ally!==e&&ally.hp>0&&Math.hypot(enemyPosition(ally).x-p.x,enemyPosition(ally).y-p.y)<110)ally.rallyUntil=Math.max(ally.rallyUntil||0,this.time+3);this.effects.push({kind:'blast',to:p,color:'#bd7a43',life:.5,max:.5});}if(e.kind==='split'){this.spawn('small',e.d,e.route,e.wave);this.spawn('small',e.d-12,e.route,e.wave);}}else if(e.d>=enemyLength(e)){const harm=Math.max(1,e.harm-(e.weakenUntil>this.time?1:0)),blocked=Math.min(harm,this.barrierRemaining());this.barrierSpent+=blocked;this.hp=Math.max(0,this.hp-harm+blocked);if(this.hp===0&&!this.reviveUsed&&this.towers.some(t=>hasRune(getWord(t.word),'revive'))){this.hp=1;this.reviveUsed=true;this.emit('revive');}this.emit('leak',{blocked,damage:harm-blocked});}}
 this.enemies=this.enemies.filter(e=>e.hp>0&&e.d<enemyLength(e));if(this.hp<=0){this.phase='lost';this.emit('lost');}else this.settleWaves();
 }
 settleWaves(){
  for(const wave of [...this.pendingWaves]){
   if(this.queue.some(e=>(e.wave??this.wave)===wave)||this.enemies.some(e=>(e.wave??this.wave)===wave))continue;
   const reward=8+Math.ceil(wave/3)*2;this.ink+=reward;this.pendingWaves=this.pendingWaves.filter(w=>w!==wave);this.emit('clear',{wave,reward,income:0,roundEnd:false});
  }
  if(this.wave===0||this.wave%3!==0||this.pendingWaves.length||this.queue.length||this.enemies.length)return;
  const round=this.wave/3,incomeCap=Math.max(80,...this.towers.filter(t=>getWord(t.word).type==='income').map(t=>getWord(t.word).tier>=4?100:getWord(t.word).tier>=3?90:80));
  const income=Math.min(incomeCap,this.towers.filter(t=>getWord(t.word).type==='income').reduce((sum,t)=>sum+towerStats(t).income,0));
  const extra=Math.min(10,this.towers.filter(t=>hasRune(getWord(t.word),'prosper')).reduce((v,t)=>v+getWord(t.word).tier,0));const repair=Math.min(2,this.towers.filter(t=>hasRune(getWord(t.word),'mend')).length);const reward=20+round*3+income+extra;this.ink+=reward;this.refreshes=0;this.bountyEarned=0;this.hp=Math.min(CHAPTERS[this.chapter].hp,this.hp+2+repair);this.barrierSpent=0;this.soulHealed=0;this.autoWaveAt=0;
  this.zones=[];this.phase=!this.endless&&this.wave>=CHAPTERS[this.chapter].waves?'won':'prepare';this.emit(this.phase==='won'?'won':'clear',{wave:this.wave,reward,income,roundEnd:true});
 }

 addZone(t,kind,target,damage){
  const own=this.zones.filter(z=>z.tower===t.id);if(own.length>=2){const oldest=own.sort((a,b)=>a.until-b.until)[0];this.zones=this.zones.filter(z=>z!==oldest);}
  const point=enemyPosition(target),tier=getWord(t.word).tier;
  this.zones.push({kind,tower:t.id,word:t.word,x:point.x,y:point.y,radius:kind==='fire'?55:tier*5+65,power:damage*(kind==='fire'?.4:.35),until:this.time+3});
 }
 updateZones(){
  this.zones=this.zones.filter(z=>z.until>this.time);
  for(const e of this.enemies){if(e.hp<=0)continue;const p=enemyPosition(e);for(const z of this.zones){if(Math.hypot(p.x-z.x,p.y-z.y)>z.radius||z.kind==='fire'&&isAir(e))continue;if(z.kind==='poison'){e.poisonDps=Math.max(e.poisonUntil>this.time?e.poisonDps:0,z.power);e.poisonUntil=Math.max(e.poisonUntil||0,this.time+2);}else{e.burnDps=Math.max(e.burnUntil>this.time?e.burnDps:0,z.power);e.burnUntil=Math.max(e.burnUntil||0,this.time+.2);}}}
 }
 updateEnemies(dt){
  const nearby=(a,b,r)=>Math.hypot(enemyPosition(a).x-enemyPosition(b).x,enemyPosition(a).y-enemyPosition(b).y)<=r;
  // Iterate a snapshot so summons never recursively execute abilities this frame.
  const living=this.enemies.filter(e=>e.hp>0&&e.d<enemyLength(e));
  for(const e of living){
   const behavior=enemyBehavior(e),boss=ENEMIES[e.kind].boss,canAct=!(e.silencedUntil>this.time);
   const data=ENEMIES[e.kind],regen=data.regenRate||(e.kind==='regen'?.02:0);if(regen&&!(e.poisonUntil>this.time||e.healBlockUntil>this.time))e.hp=Math.min(e.maxHp,e.hp+e.maxHp*regen*dt);
   if(e.poisonUntil>this.time-dt)e.hp-=Math.min(dt,Math.max(0,e.poisonUntil-(this.time-dt)))*e.poisonDps*(1-((e.lightUntil>this.time||e.markUntil>this.time)?0:(data.poisonResist||0)));
   if(e.bleedUntil>this.time-dt)e.hp-=Math.min(dt,Math.max(0,e.bleedUntil-(this.time-dt)))*e.bleedDps;
   if(e.burnUntil>this.time-dt)e.hp-=Math.min(dt,Math.max(0,e.burnUntil-(this.time-dt)))*e.burnDps*(1-(data.burnResist||0));
   if(e.hp<=0)continue;
   if(['brood','ironboss','inkking'].includes(e.kind)&&e.hp<=e.maxHp*.5&&!e.enraged){
    e.enraged=true;
    if(e.kind==='brood'){this.spawn('small',e.d,e.route,e.wave);this.spawn('small',e.d-14,e.route,e.wave);}
    if(e.kind==='inkking'){e.shield=e.maxShield=e.maxHp*.18;this.spawn('swift',e.d-12,e.route,e.wave);this.spawn('swift',e.d-24,e.route,e.wave);}
    if(ENEMIES[e.kind].boss)this.emit('boss-phase',{name:ENEMIES[e.kind].name});
   }
   if(data.phase&&!e.enraged&&e.hp<=e.maxHp*.5){
    e.enraged=true;const phase=data.phase;
    if(phase.summon)for(let i=0;i<(phase.count||1);i++)this.spawn(phase.summon,e.d-18*(i+1),e.route,e.wave);
    if(phase.heal&&!(e.poisonUntil>this.time||e.healBlockUntil>this.time))e.hp=Math.min(e.maxHp,e.hp+e.maxHp*phase.heal);
    if(phase.shield)e.shield=e.maxShield=Math.max(e.shield||0,e.maxHp*phase.shield);
    if(phase.shell){e.shellHits=0;e.slowUntil=0;e.freezeUntil=0;}
    if(phase.period)e.astralPeriod=phase.period;
    if(phase.mode!==undefined)e.astralMode=phase.mode;
    if(data.boss)this.emit('boss-phase',{name:data.name});
   }
   const pulse=data.pulse;
   if(pulse&&canAct&&this.time>=e.pulseAt&&(e.pulses||0)<pulse.limit){
    const allies=[e,...living.filter(a=>a!==e&&a.hp>0&&nearby(e,a,pulse.radius||110))].slice(0,pulse.targets||3);
    if(pulse.kind==='heal')for(const a of allies){if(!(a.poisonUntil>this.time||a.healBlockUntil>this.time))a.hp=Math.min(a.maxHp,a.hp+a.maxHp*pulse.ratio);}
    if(pulse.kind==='shield')for(const a of allies){a.shield=Math.max(a.shield||0,e.maxHp*pulse.ratio);a.maxShield=Math.max(a.maxShield||0,a.shield);}
    if(pulse.kind==='haste')for(const a of allies)a.rallyUntil=Math.max(a.rallyUntil||0,this.time+3);
    if(pulse.kind==='summon')for(let i=0;i<pulse.count;i++)this.spawn(pulse.unit,e.d-18*(i+1),e.route,e.wave);
    if(pulse.kind==='blink'&&!(e.slowUntil>this.time)&&!(e.freezeUntil>this.time))e.d+=pulse.distance;
    e.pulses=(e.pulses||0)+1;e.pulseAt=this.time+pulse.interval;this.effects.push({kind:'blast',to:enemyPosition(e),color:data.color||'#9a8260',life:.4,max:.4});
   }
   if(behavior==='rallyboss'&&canAct&&this.time>=e.abilityAt&&(e.charges||0)<3){for(const ally of living)if(ally!==e&&ally.hp>0&&nearby(e,ally,150))ally.rallyUntil=Math.max(ally.rallyUntil||0,this.time+3);e.charges=(e.charges||0)+1;e.abilityAt=this.time+8;this.effects.push({kind:'blast',to:enemyPosition(e),color:'#c68b46',life:.5,max:.5});}
   if(e.kind==='mirrorling'&&!e.mirrored&&e.hp<=e.maxHp*.5){
    e.mirrored=true;const copy=this.spawn('mirrorling',e.d-18,e.route,e.wave);copy.mirrored=true;copy.isCopy=true;copy.hp=copy.maxHp=e.maxHp*.35;copy.reward=1;
    this.effects.push({kind:'blast',to:enemyPosition(e),color:ENEMIES.mirrorling.color,life:.5,max:.5});
   }
   if(behavior==='hillrunner'&&canAct&&this.time>=e.abilityAt){if(!(e.slowUntil>this.time)&&!(e.freezeUntil>this.time)){e.d+=50;this.effects.push({kind:'pop',to:enemyPosition(e),color:ENEMIES.hillrunner.color,life:.4,max:.4});}e.abilityAt=this.time+(boss?(e.enraged?6:8):6);}
   if(behavior==='scrollguard'&&canAct&&this.time>=e.abilityAt&&(e.charges||0)<(boss?3:2)){e.shield=e.maxShield=Math.max(e.shield||0,e.maxHp*.38);e.charges=(e.charges||0)+1;e.abilityAt=this.time+(boss?9:8);}
   if(behavior==='tideshaper'&&canAct&&this.time>=e.abilityAt&&(e.charges||0)<(boss?3:2)){
    for(const ally of living.filter(a=>a!==e&&a.hp>0&&nearby(e,a,100)).slice(0,3)){const shield=e.maxHp*.25;ally.shield=Math.max(ally.shield||0,shield);ally.maxShield=Math.max(ally.maxShield||0,shield);}
    e.charges=(e.charges||0)+1;e.abilityAt=this.time+(boss?8:6);this.effects.push({kind:'blast',to:enemyPosition(e),color:ENEMIES.tideshaper.color,life:.4,max:.4});
   }
   if(behavior==='cloudraptor'&&(e.slowUntil>this.time||e.freezeUntil>this.time))e.diveUntil=Math.min(e.diveUntil||0,this.time);
   if(behavior==='cloudraptor'&&canAct&&this.time>=e.abilityAt){e.diveUntil=e.slowUntil>this.time||e.freezeUntil>this.time?this.time:this.time+2;e.abilityAt=this.time+(boss?8:7);}
   if(e.kind==='healer'&&canAct&&this.time>=e.abilityAt){
    for(const ally of living)if(ally.hp>0&&nearby(e,ally,110)&&!(ally.poisonUntil>this.time||ally.healBlockUntil>this.time))ally.hp=Math.min(ally.maxHp,ally.hp+ally.maxHp*.03);
    e.abilityAt=this.time+4;this.effects.push({kind:'blast',to:enemyPosition(e),color:'#719b65',life:.5,max:.5});
   }
   if(e.kind==='broodqueen'&&canAct&&this.time>=e.abilityAt&&(e.summons||0)<3){
    this.spawn('small',e.d-12,e.route,e.wave);this.spawn('small',e.d-24,e.route,e.wave);e.summons=(e.summons||0)+1;e.abilityAt=this.time+(e.hp<e.maxHp*.5?5:8);
   }
   const guarded=this.towers.some(t=>getWord(t.word).trait==='ward'&&Math.hypot(this.pads[t.pad].x-enemyPosition(e).x,this.pads[t.pad].y-enemyPosition(e).y)<=towerStats(t).range*.65);
   let movement=e.slowUntil>this.time?(e.slowFactor??.55):1;
   if(guarded&&!(hasIceShell(e)))movement=Math.min(movement,.9);
   if(e.freezeUntil>this.time)movement=0;
   if(e.rallyUntil>this.time)movement*=1.3;
   if(behavior==='cloudraptor'&&e.diveUntil>this.time&&!(e.slowUntil>this.time))movement*=1.55;
   if(e.kind==='lancer'&&e.hp<=e.maxHp*.5)movement*=1.35;
   if(e.enraged&&data.phase?.haste)movement*=1+data.phase.haste;
   if(e.kind==='ironboss'&&e.enraged)movement*=1.2;
   if(e.kind==='inkking'&&e.enraged)movement*=1.15;
   if(!isAir(e)&&living.some(a=>a.kind==='banner'&&a.id!==e.id&&a.hp>0&&nearby(e,a,110)))movement*=1.15;
   e.d+=e.speed*dt*movement;
  }
 }
 attack(t,dt){
  const w=getWord(t.word),p=this.pads[t.pad],stats=towerStats(t),rules=wordRules(w),trait=WORD_TRAITS[w.trait];
  t.cooldown-=dt;if(t.cooldown>0)return;
  const inRange=e=>Math.hypot(enemyPosition(e).x-p.x,enemyPosition(e).y-p.y)<=stats.range;
  const targets=this.enemies.filter(e=>e.hp>0&&e.d<enemyLength(e)&&!(isAir(e)&&w.type==='heavy')&&inRange(e)).sort((a,b)=>b.d/enemyLength(b)-a.d/enemyLength(a));
  if(!targets.length)return;
  const target=targets[0],n=w.tier;
  const lights=this.towers.filter(a=>a.id!==t.id&&getWord(a.word).type==='aura'&&Math.hypot(this.pads[a.pad].x-p.x,this.pads[a.pad].y-p.y)<=towerStats(a).range);
  const buff=Math.max(0,...lights.map(a=>towerStats(a).aura));
  const inspired=this.towers.some(a=>a.id!==t.id&&hasRune(getWord(a.word),'inspire')&&Math.hypot(this.pads[a.pad].x-p.x,this.pads[a.pad].y-p.y)<=towerStats(a).range*.65);const haste=Math.max(inspired?.03:0,...lights.map(a=>getWord(a.word).tier>=4?.12:getWord(a.word).tier>=3?.06:0));
  const chilled=this.enemies.some(e=>e.hp>0&&enemyBehavior(e)==='frostboss'&&Math.hypot(enemyPosition(e).x-p.x,enemyPosition(e).y-p.y)<=130);
  const damage=stats.damage*(1+buff);
  const shotNumber=(t.shots||0)+1;let hitNumber=0;
  const hit=(e,m=1)=>{
   if(e.hp<=0)return;const behavior=enemyBehavior(e);
   let armor=e.kind==='armor'?.3:e.kind==='ironboss'?(e.enraged?0:.4):(ENEMIES[e.kind].armor||0);
   if(['heavy','pierce'].includes(w.type)||e.breakUntil>this.time)armor=0;else armor=Math.max(0,armor-(trait.armorPierce||0)-(hasRune(w,'edge')?.05:0));
   const revealed=e.lightUntil>this.time||e.markUntil>this.time||e.breakUntil>this.time;
   let special=1;
   if(behavior==='bamboostalker'&&!revealed&&Math.hypot(enemyPosition(e).x-p.x,enemyPosition(e).y-p.y)>(ENEMIES[e.kind].stealthDistance||130))special*=.7;
   if(behavior==='clockwork'&&!(ENEMIES[e.kind].boss&&e.enraged)&&!['heavy','pierce'].includes(w.type)&&!revealed){const here=enemyPosition(e),ahead=enemyPosition({...e,d:e.d+4});if((p.x-here.x)*(ahead.x-here.x)+(p.y-here.y)*(ahead.y-here.y)>0)special*=.55;}
   if(hasIceShell(e)){special*=ENEMIES[e.kind].boss?.8:.85;e.shellHits=Math.min(shellLimit(e),(e.shellHits||0)+(['splash','heavy'].includes(w.type)?2:1));}
   if(behavior==='astral'&&!revealed&&!(w.type==='heavy'&&astralPhase(e,this.time)===0)&&PHYSICAL_TYPES.has(w.type)===(astralPhase(e,this.time)===0))special*=.65;
   if(ENEMIES[e.kind].resistTypes?.includes(w.type)&&!revealed)special*=1-(ENEMIES[e.kind].resistance||0);
   const protectedByWard=!(e.lightUntil>this.time)&&this.enemies.some(a=>a.hp>0&&a.kind==='ward'&&a.id!==e.id&&Math.hypot(enemyPosition(a).x-enemyPosition(e).x,enemyPosition(a).y-enemyPosition(e).y)<110);
   let amount=damage*m*special*(1-armor)*(protectedByWard?.88:1)*(e.markUntil>this.time?1+e.markPower:1);
   if(hasRune(w,'edge')&&['heavy','pierce'].includes(w.type))amount*=1.05;
   if(hasRune(w,'slayer')&&ENEMIES[e.kind].boss)amount*=1.12;
   if(hasRune(w,'valor')&&e.hp/e.maxHp>.85)amount*=1.15;
   if(hasRune(w,'execute')&&e.hp/e.maxHp<.2)amount*=1.15;
   if(hasRune(w,'focus')&&shotNumber%4===0)amount*=1.15;
   if(hasRune(w,'rescue')&&e.d/enemyLength(e)>.7)amount*=1.12;
   if(hasRune(w,'count')&&shotNumber%w.semanticCycle===0)amount*=1+w.semanticCycle*.1;
   if(hasRune(w,'flank')||hasRune(w,'backstab')||hasRune(w,'front')){const here=enemyPosition(e),ahead=enemyPosition({...e,d:e.d+4}),dx=ahead.x-here.x,dy=ahead.y-here.y,len=Math.hypot(dx,dy)*Math.hypot(p.x-here.x,p.y-here.y)||1,cos=((p.x-here.x)*dx+(p.y-here.y)*dy)/len;if(hasRune(w,'flank')&&Math.abs(cos)<.5||hasRune(w,'backstab')&&cos<-.5||hasRune(w,'front')&&cos>.5)amount*=1.15;}
   if(hasRune(w,'gravity')&&shotNumber%4===0)amount+=Math.min(8,e.maxHp*.003);
   if(w.type==='sniper'&&e.hp/e.maxHp<(n>=4?.4:n>=3?.35:.3))amount*=n>=4?2.2:n>=3?2:1.8;
   if(w.type==='heavy'&&n>=4)amount+=Math.min(60,e.maxHp*.02);
   if(e.shield>0){const bonus=(w.type==='chain'?2:w.trait==='purify'?1.5:1)+(hasRune(w,'storm')?.25:0),absorbed=Math.min(e.shield,amount*bonus);e.shield-=absorbed;amount-=absorbed/bonus;}
   e.hp-=Math.max(0,amount);
   if(w.type==='mark'){e.markPower=Math.max(e.markUntil>this.time?e.markPower:0,n>=4?.3:n>=3?.22:.15);e.markUntil=this.time+(n>=4?5:3);}
   if(hasRune(w,'luck')){e.bounty=Math.max(e.bountyUntil>this.time?e.bounty:0,1);e.bountyUntil=this.time+2;}
   if(hasRune(w,'shine')&&w.type!=='aura')e.lightUntil=Math.max(e.lightUntil||0,this.time+2);
   if(hasRune(w,'curse')){e.markPower=Math.max(e.markUntil>this.time?e.markPower:0,.08);e.markUntil=Math.max(e.markUntil||0,this.time+2);}
   if(hasRune(w,'peace'))e.weakenUntil=this.time+2;
   if(hasRune(w,'soul'))e.soulUntil=this.time+2;
   if(hasRune(w,'bleed')){e.bleedDps=Math.max(e.bleedUntil>this.time?e.bleedDps:0,damage*.1);e.bleedUntil=this.time+2;}
   if(hasRune(w,'silence')&&shotNumber%4===0&&!(e.silenceReady>this.time)){e.silencedUntil=this.time+1;e.silenceReady=this.time+4;}
   if(hasRune(w,'seal'))e.healBlockUntil=this.time+2;
   if(w.type==='aura')e.lightUntil=Math.max(e.lightUntil||0,this.time+rules.lightDuration);
   if(w.type==='income'){e.bounty=Math.max(e.bountyUntil>this.time?e.bounty:0,rules.bounty);e.bountyUntil=this.time+rules.bountyDuration;}
   if(w.type==='heavy'&&n>=3)e.breakUntil=this.time+3;if(w.trait==='sunder')e.breakUntil=Math.max(e.breakUntil||0,this.time+2.5);
   const delay=w.trait==='combo'?hitNumber++*.08:0;this.effects.push({kind:'bolt',word:w.word,level:t.level,shot:shotNumber,attackType:w.trait==='ranged'?'arrow':w.trait==='blade'&&w.type!=='pierce'?'slash':w.type,from:p,to:enemyPosition(e),color:w.color,life:.32+delay,max:.32});
  };
  const slow=(e,factor,seconds)=>{if(hasIceShell(e))return;e.slowFactor=Math.min(e.slowUntil>this.time?(e.slowFactor??.55):1,factor);e.slowUntil=Math.max(e.slowUntil||0,this.time+seconds);};
  const poison=e=>{e.poisonDps=Math.max(e.poisonUntil>this.time?e.poisonDps:0,damage*rules.poisonRatio);e.poisonUntil=Math.max(e.poisonUntil||0,this.time+rules.poisonDuration);};
  hit(target);this.effects.push({kind:'cast',word:w.word,level:t.level,shot:shotNumber,attackType:w.type,sound:w.trait==='ranged'?'sniper':w.type,from:p,color:w.color,life:.24,max:.24});t.shots=(t.shots||0)+1;
  if(w.type==='poison'){poison(target);if(rules.poisonTargets){const q=enemyPosition(target);for(const e of targets.filter(e=>e!==target&&Math.hypot(enemyPosition(e).x-q.x,enemyPosition(e).y-q.y)<rules.poisonRadius).slice(0,rules.poisonTargets))poison(e);}}
  if(w.type==='slow'){slow(target,rules.slowFactor,rules.slowDuration);if(w.trait==='spread'){const q=enemyPosition(target);for(const e of targets.filter(e=>e!==target&&Math.hypot(enemyPosition(e).x-q.x,enemyPosition(e).y-q.y)<100).slice(0,2))slow(e,rules.slowFactor,rules.slowDuration);}}
  const freeze=w.type==='slow'?rules.freeze:w.trait==='bind'?.15:0;if(freeze&&!(target.freezeReady>this.time)&&!(hasIceShell(target))){target.freezeUntil=this.time+freeze;target.freezeReady=this.time+4;this.effects.push({kind:'bind',to:enemyPosition(target),color:w.color,life:.45,max:.45});}
  if(w.trait==='moon')slow(target,.8,1);
  if(hasRune(w,'frost')&&w.type!=='slow')slow(target,.9,1);
  if(hasRune(w,'ember')){target.burnDps=Math.max(target.burnUntil>this.time?target.burnDps:0,damage*(w.type==='splash'?.26:.1));target.burnUntil=this.time+2;}
  if((hasRune(w,'toxin')||hasRune(w,'venom'))&&w.type!=='poison'){target.poisonDps=Math.max(target.poisonUntil>this.time?target.poisonDps:0,damage*(hasRune(w,'venom')?.24:.16));target.poisonUntil=this.time+2;}
  if(hasRune(w,'thorn')&&t.shots%3===0&&!(target.freezeReady>this.time)&&!hasIceShell(target)){target.freezeUntil=this.time+.15;target.freezeReady=this.time+4;}
  if(hasRune(w,'tide')&&t.shots%4===0&&!(target.recoilReady>this.time)){target.d=Math.max(0,target.d-(ENEMIES[target.kind].boss?4:8));target.recoilReady=this.time+3;}
  if(w.trait==='dragon'){
   const q=enemyPosition(target),dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1;const cone=targets.filter(e=>{const z=enemyPosition(e),dist=Math.hypot(z.x-p.x,z.y-p.y)||1;return((z.x-p.x)*dx+(z.y-p.y)*dy)/(dist*len)>=Math.cos(Math.PI/5);}).slice(0,6);
   for(const e of cone){if(e!==target)hit(e,.6);if(w.type==='poison')poison(e);if(w.type==='slow')slow(e,rules.slowFactor,rules.slowDuration);if(w.type==='splash'&&n>=4){e.burnDps=Math.max(e.burnUntil>this.time?e.burnDps:0,damage*.18);e.burnUntil=this.time+2;}}
   this.effects.push({kind:'breath',word:w.word,level:t.level,shot:shotNumber,from:p,to:q,radius:stats.range,color:w.color,life:.5,max:.5});
  }
  if(w.type==='splash'&&w.trait!=='dragon'){
   const q=enemyPosition(target),radius=rules.radius;
   for(const e of this.enemies){if(e.hp<=0||Math.hypot(enemyPosition(e).x-q.x,enemyPosition(e).y-q.y)>=radius)continue;if(e!==target)hit(e,.65);if(n>=4){e.burnDps=Math.max(e.burnUntil>this.time?e.burnDps:0,damage*.18);e.burnUntil=this.time+2;}}
   this.effects.push({kind:'blast',to:q,color:w.color,life:.35,max:.35});
  }
  if(w.type==='chain')for(let i=1;i<Math.min(rules.chainTargets,targets.length);i++)hit(targets[i],Math.pow(.72,i));
  if(w.type==='pierce'){
   const q=enemyPosition(target),dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1;
   const aligned=targets.filter(e=>{if(e===target)return false;const r=enemyPosition(e),along=((r.x-p.x)*dx+(r.y-p.y)*dy)/len;return along>=0&&Math.abs((r.x-p.x)*dy-(r.y-p.y)*dx)/len<28;});
   for(const e of aligned.slice(0,n>=4?4:n>=3?3:2))hit(e,n>=4?.85:.7);
  }
  if(w.type==='pulse'){for(const e of targets.slice(0,(n>=4?12:n>=3?10:8)+(w.trait==='spread'?2:0))){if(e!==target)hit(e);if(n>=4)slow(e,.7,1);}this.effects.push({kind:'blast',to:p,radius:stats.range,color:w.color,life:.4,max:.4});}
  if(w.type==='echo')for(let i=0;i<(n>=4?2:1);i++)hit(targets.find(e=>e!==target&&e.hp>0)||target,n>=3?.6:.45);
  if(w.type==='fast'&&n>=3&&t.shots%3===0)hit(target,n>=4?.7:.35);
  if(w.type==='basic'&&n>=3&&t.shots%4===0){if(n===3)hit(target,.4);else for(const e of targets.filter(e=>e!==target).slice(0,2))hit(e,.5);}
  if(w.trait==='firewall')this.addZone(t,'fire',target,damage);
  if(w.trait==='spread'&&w.type==='poison')this.addZone(t,'poison',target,damage);
  if(trait.followup)hit(target,trait.followup);
  if(w.trait==='spread'&&!['splash','slow','poison','chain','pulse'].includes(w.type))for(const e of targets.filter(e=>e!==target).slice(0,2))hit(e,.35);
  if(w.trait==='ward'&&w.type==='splash'){target.burnDps=Math.max(target.burnUntil>this.time?target.burnDps:0,damage*.12);target.burnUntil=this.time+2;}
  if(hasRune(w,'echo')){const side=targets.find(e=>e!==target&&e.hp>0);if(side)hit(side,.2);}
  if(hasRune(w,'brood')&&t.shots%3===0)hit(targets.find(e=>e.hp>0)||target,.2);
  if(hasRune(w,'bloom')){const q=enemyPosition(target);for(const side of targets.filter(e=>e!==target&&Math.hypot(enemyPosition(e).x-q.x,enemyPosition(e).y-q.y)<45).slice(0,2))hit(side,.15);}
  t.cooldown=stats.rate*(hasRune(w,'tempo')&&t.shots%4===0?.88:1)*(chilled?1.25:1)/(1+haste);
 }
 export(){const {effects,events,_wordCacheKey,_wordCache,...data}=this;return {...data,towers:this.towers.map(t=>({...t})),enemies:this.enemies.map(e=>({...e})),queue:this.queue.map(e=>({...e})),hand:this.hand.map(t=>({...t})),unlockedPads:[...this.unlockedPads],bossDraws:this.bossDraws.map(x=>({...x})),zones:this.zones.map(z=>({...z})),pendingWaves:this.pendingWaves?[...this.pendingWaves]:this.phase==='battle'&&this.wave>0?[this.wave]:[],version:4};}
 static restore(data){
 const finite=n=>typeof n==='number'&&Number.isFinite(n),int=n=>Number.isInteger(n)&&n>=0,kind=k=>Object.hasOwn(ENEMIES,k);
 if(!data||![1,2,3,4].includes(data.version)||!int(data.chapter)||!CHAPTERS[data.chapter]||!int(data.wave)||(data.endless!==undefined&&typeof data.endless!=='boolean')||(!data.endless&&data.wave>(data.version<3?CHAPTERS[data.chapter].rounds:CHAPTERS[data.chapter].waves))||!['prepare','battle','intermission','won','lost'].includes(data.phase)||!['ink','hp','time','skillReady','totalEarned'].every(k=>finite(data[k])&&data[k]>=0)||data.hp>CHAPTERS[data.chapter].hp||!['kills','nextId'].every(k=>int(data[k]))||!finite(data.spawnTime)||!Array.isArray(data.towers)||!Array.isArray(data.enemies)||!Array.isArray(data.queue))throw Error('Invalid save');
 if(data.towers.length>PADS.length||new Set(data.towers.map(t=>t?.pad)).size!==data.towers.length||data.towers.some(t=>!t||!WORDS.some(w=>w.word===t.word)||!int(t.pad)||!PADS[t.pad]||(!Number.isInteger(t.level)||(data.version===1?![1,2,3].includes(t.level):t.level<getWord(t.word).tier||t.level>getWord(t.word).maxLevel))||!int(t.id)||!finite(t.cooldown))||data.enemies.some(e=>!e||!kind(e.kind)||!int(e.id)||!['hp','maxHp','speed','reward','harm','d','slowUntil'].every(k=>finite(e[k]))||e.maxHp<=0||e.speed<=0||e.d<0)||data.queue.some(e=>!e||!kind(e.kind)))throw Error('Invalid save');
 if(data.enemies.some(e=>(e.shield!==undefined&&(!finite(e.shield)||e.shield<0))||(e.maxShield!==undefined&&(!finite(e.maxShield)||e.maxShield<0))))throw Error('Invalid shield state');
 if(data.reviveUsed!==undefined&&typeof data.reviveUsed!=='boolean')throw Error('Invalid revival');
 if(data.barrierSpent!==undefined&&(!int(data.barrierSpent)||data.barrierSpent>2)||data.soulHealed!==undefined&&(!int(data.soulHealed)||data.soulHealed>1))throw Error('Invalid semantic round state');
 if(data.bountyEarned!==undefined&&(!int(data.bountyEarned)||data.bountyEarned>35))throw Error('Invalid bounty');
 if(data.enemies.some(e=>['abilityAt','poisonDps','poisonUntil','burnDps','burnUntil','markUntil','markPower','breakUntil','lightUntil','bountyUntil','bounty','freezeUntil','freezeReady','slowFactor','summons','bornAt','rallyUntil','diveUntil','charges','shellHits','astralPeriod','pulseAt','pulses','soulUntil','weakenUntil','healBlockUntil','recoilReady','bleedDps','bleedUntil','silencedUntil','silenceReady'].some(k=>e[k]!==undefined&&(!finite(e[k])||e[k]<0))||(e.enraged!==undefined&&typeof e.enraged!=='boolean')||['mirrored','isCopy'].some(k=>e[k]!==undefined&&typeof e[k]!=='boolean')||['burn','bleed'].some(prefix=>e[prefix+'Until']!==undefined&&!finite(e[prefix+'Dps']))))throw Error('Invalid enemy ability');
 if(data.enemies.some(e=>e.astralMode!==undefined&&![0,1].includes(e.astralMode)))throw Error('Invalid astral mode');
 if(data.towers.some(t=>t.shots!==undefined&&!int(t.shots)))throw Error('Invalid tower attack counter');
 if(data.enemies.some(e=>(e.map!==undefined&&e.map!==data.chapter)||(e.route!==undefined&&(!int(e.route)||e.route>=getMap(data.chapter).routes.length)))||data.queue.some(e=>e.route!==undefined&&(!int(e.route)||e.route>=getMap(data.chapter).routes.length)))throw Error('Invalid route');
 if(data.version===4){
  if(!Array.isArray(data.pendingWaves)||new Set(data.pendingWaves).size!==data.pendingWaves.length||data.pendingWaves.some(w=>!int(w)||w===0||w>data.wave||Math.ceil(w/3)!==Math.ceil(data.wave/3)))throw Error('Invalid active waves');
  if(data.queue.some(e=>(e.at!==undefined&&(!finite(e.at)||e.at<0))||(e.wave!==undefined&&(!int(e.wave)||e.wave>data.wave)))||data.enemies.some(e=>e.wave!==undefined&&(!int(e.wave)||e.wave>data.wave)))throw Error('Invalid wave schedule');
  if(data.autoWaveAt>0&&(data.wave%3===0||data.phase!=='battle'))throw Error('Invalid next-wave timer');
 }
 if(data.bossDraws!==undefined&&(!Array.isArray(data.bossDraws)||data.bossDraws.length>12||data.bossDraws.some(x=>!x||!int(x.wave)||x.wave>data.wave||!ENEMIES[x.kind]?.boss)))throw Error('Invalid boss draws');
 if(data.zones!==undefined&&(!Array.isArray(data.zones)||data.zones.length>32||data.zones.some(z=>!z||!['fire','poison'].includes(z.kind)||!int(z.tower)||!getWord(z.word)||!['x','y','radius','power','until'].every(k=>finite(z[k]))||z.radius<=0||z.radius>200||z.power<0||z.until<0)))throw Error('Invalid spell zones');
 if(data.skillUses!==undefined&&!int(data.skillUses))throw Error('Invalid skill use count');
 if(data.autoWaveAt!==undefined&&(!finite(data.autoWaveAt)||data.autoWaveAt<0))throw Error('Invalid wave timer');
 const g=new Game(data.chapter);g.bossDraws=(data.bossDraws||[]).map(x=>({...x}));g.zones=(data.zones||[]).map(z=>({...z}));g.reviveUsed=data.reviveUsed??false;g.barrierSpent=data.barrierSpent??0;g.soulHealed=data.soulHealed??0;g.bountyEarned=data.bountyEarned??0;g.autoWaveAt=data.autoWaveAt??0;g.endless=data.endless===true;g.skillUses=data.skillUses??0;for(const k of ['wave','hp','ink','towers','enemies','queue','time','spawnTime','phase','kills','nextId','skillReady','totalEarned'])g[k]=data[k];
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
 if(data.version<4){
  g.pendingWaves=g.phase==='battle'&&g.wave>0?[g.wave]:[];
  const batch=getMap(g.chapter).mode==='simultaneous'?getMap(g.chapter).routes.length:1,interval=Math.max(.4,1.03-Math.ceil(g.wave/3)*.035);g.queue=g.queue.map((e,i)=>({...e,wave:g.wave,at:g.time+Math.max(0,g.spawnTime)+Math.floor(i/batch)*interval*batch}));
  if(g.phase==='intermission'){g.phase='battle';g.autoWaveAt=Math.max(g.time,g.autoWaveAt)||g.time+.001;}
  else g.autoWaveAt=g.phase==='battle'&&g.wave%3!==0?g.time+WAVE_INTERVAL:0;
 }else g.pendingWaves=[...data.pendingWaves];
 g.towers=g.towers.map(t=>({...t}));g.enemies=g.enemies.map(e=>({...e,map:g.chapter,route:e.route??0,wave:e.wave??g.wave}));g.queue=g.queue.map(e=>({...e}));if(!data.bossDraws){const seen=new Map([...g.enemies,...g.queue].filter(e=>ENEMIES[e.kind]?.boss).map(e=>[e.wave??g.wave,e.kind]));g.bossDraws=[...seen].map(([wave,kind])=>({wave,kind})).slice(-12);}g.hand=g.hand.map(t=>({...t}));return g;
 }
}
