import json,re,collections,argparse,subprocess,tempfile,urllib.request,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description='Classify the complete four-character catalog using pinned meanings and exact reviewed overrides.')
parser.add_argument('--reference',type=Path,default=Path(tempfile.gettempdir())/'wordward-reference-idioms.json')
parser.add_argument('--check',action='store_true')
args=parser.parse_args()
if not args.reference.exists():
 args.reference.write_bytes(urllib.request.urlopen('https://raw.githubusercontent.com/pwxcoo/chinese-xinhua/fe6d6c2e8baa82187f4c96bbe042e43f96c05666/data/idiom.json',timeout=60).read())
assert hashlib.sha256(args.reference.read_bytes()).hexdigest()=='1d4b4f454ce1c416d6a1ab2369d6e66c0ff99e04390172eef70790499e21ce19','Reference differs from pinned source'
ref={x['word']:x['explanation'] for x in json.loads(args.reference.read_text())}
vocabulary_review=json.loads((root/'data/vocabulary-review.json').read_text())
retired=set(vocabulary_review['corrections'])
verified_extra=vocabulary_review['idiomAllowlist']
seed=json.loads((root/'data/idiom-review-seed.json').read_text())
sweep=json.loads((root/'data/basic-four-review.json').read_text())
supplement=sweep['entries']
all_words=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{WORDS}from'./dist/engine.mjs';console.log(JSON.stringify(WORDS.map(w=>w.word)))"],cwd=root,text=True))
words={word:{'word':word,'special':seed.get(word)} for word in all_words}
s=(root/'dist/lexicon.mjs').read_text();raw=set(json.loads(re.search(r'export const IDIOM_WORDS=(".*?")\.split',s).group(1)).split('|'))
skills=set(json.loads(re.search(r'export const SKILL_SCHOOLS=(\{.*?\});\n',s).group(1)))
lessons=json.loads((root/'data/learning-idioms.json').read_text());culture=json.loads((root/'data/cultural-words.json').read_text());extra=json.loads((root/'data/learning-expansion.json').read_text())['lessons'];lessons.update(culture);lessons.update(extra)
rejected={w:'普通短语、截断句或现代专名，保留可组词但不标成语' for w in '一一列举 一不注意 一两句话 一举手一 一再声明 一再表示 一再说明 一分收获 一分钱一 一切正常 一切照旧 一切都在 一切都是 一别多年 一听之下 一失足成 一夫一妻 一夫多妻 一妻多夫 一局上半 一局下半 一并处理 一房一厅 一挂之下 一推之下 一提之下 一摸之下 一时拥有 一灯大师 一树了之 一直未果 一省两地 一竿子打 一算之下 一致同意 一致意见 一荣俱荣 一而再再 一言既出 一言未发 魔兽争霸 鬼屋魔影 鬼片当道 鬼眼狂刀 魔鬼身材 鱼鳞图册 鸡精蛋白 黑恶势力 默认设置 鼎盛时期 高速旋转 高高飘扬 龙头老大'.split()}
for w in ['一荣俱荣','一言既出','一切照旧','一切正常','一别多年','一分收获','一再声明','一再表示','一再说明','一致同意','一致意见','一并处理','一国之主']:
 rejected.pop(w,None)
for w,l in lessons.items():
 if l['kind']=='phrase':rejected[w]='项目已审校为四字短语，保留原标签'
ids=raw|{w for w in words if len(w)==4 and w in ref}|{w for w,l in lessons.items() if l['kind']=='idiom'}
ids={w for w in ids if w in words and len(w)==4 and w not in rejected and w not in retired}
# Whole-phrase overrides correct familiar figurative meanings before any rule matching.
overrides={}
def put(special,move,text):
 for w in text.split():overrides[w]={'type':'learning','special':special,'move':move,'rule':'whole-word-reviewed'}
put('purity','purity','冰清玉洁 高风亮节 光明磊落 两袖清风 清正廉洁 公正无私 大公无私 廉洁奉公 洁身自好 刚正不阿 清清白白 堂堂正正 玉洁冰清')
put('aggravate','aggravate','火上浇油 推波助澜 助纣为虐 为虎作伥 煽风点火 雪上加霜 变本加厉 养虎为患')
put('conspire','conspire','一丘之貉 同流合污 狼狈为奸 沆瀣一气 臭味相投 朋比为奸 蛇鼠一窝 官官相护 结党营私')
put('succession','succession','一代宗师 为人师表 言传身教 尊师重道 桃李天下 薪火相传 传道授业 教学相长 因材施教 诲人不倦')
put('frustration','frustration','一事无成 一无所成 功败垂成 徒劳无功 劳而无功 事与愿违 适得其反 欲速不达 得不偿失')
put('steadfast','steadfast','百折不挠 坚贞不屈 坚定不移 始终不渝 矢志不渝 忠心耿耿 百折不回 坚忍不拔 坚韧不拔')
put('reputation','reputation','鲜为人知 默默无闻 名扬四海 举世闻名 声名远扬 大名鼎鼎 声名鹊起 赫赫有名 名副其实 闻名遐迩')
put('contrast','contrast','取长补短 扬长避短 优胜劣汰 去粗取精 去伪存真 良莠不齐 参差不齐 厚此薄彼 顾此失彼 此消彼长')
put('scarcity','scarcity','孤掌难鸣 众寡悬殊 寡不敌众 势单力薄 孤军奋战 以少胜多 以众暴寡 单枪匹马')
put('wrath','wrath','火冒三丈 怒发冲冠 勃然大怒 怒气冲冲 义愤填膺 暴跳如雷 怒不可遏 雷霆之怒')
put('swift','pursuit','雷厉风行 风驰电掣 文不加点 一挥而就 一蹴而就 健步如飞 大步流星')
put('decoy','mirage','叶公好龙 口蜜腹剑 花言巧语 金玉其外 掩耳盗铃 自欺欺人 瞒天过海 表里不一 阳奉阴违 虚张声势')
put('pivot','turning','南辕北辙 背道而驰 改弦更张 改弦易辙 另辟蹊径 悬崖勒马 迷途知返 浪子回头')
put('double','encircle','一举多得 一举三得 一举四得 一石两鸟 一石多鸟 一箭双雕 一石二鸟 一举两得 两全其美')
put('dawn','precision','水落石出 一针见血 一语道破 拨云见日 真相大白 明察秋毫 洞若观火 火眼金睛')
put('guide','succession','金玉良言 金科玉律 良师益友 谆谆教导 循循善诱 苦口婆心')
put('ambush','ambush','笑里藏刀 守株待兔 暗度陈仓 出其不意 攻其不备 先发制人')
put('puzzle','turning','朝三暮四 朝秦暮楚 变化多端 千变万化 瞬息万变 反复无常')

def element(typ,move,text):
 for w in text.split():overrides[w]={'type':typ,'move':move,'rule':'literal-whole-word-reviewed'}
element('slow','frost','冰天雪地 天寒地冻 白雪皑皑 大雪纷飞 风雪交加 银装素裹 鹅毛大雪 寒冬腊月 寒风刺骨 冰封雪飘')
element('splash','flame','烽火连天 战火纷飞 火光冲天 火光烛天 烈火熊熊')
element('fast','pursuit','风和日丽 惠风和畅 和风细雨')
element('pulse','tide','波涛汹涌 波澜壮阔 惊涛骇浪 风急浪高 洪水滔天 大浪淘沙')
element('aura','radiance','光芒万丈 光辉灿烂 灯火辉煌 灯火通明 火树银花 星光灿烂 明月当空')
element('income','bounty','腰缠万贯 家财万贯 财源广进 日进斗金 招财进宝 堆金积玉')
element('sniper','precision','箭无虚发 百步穿杨 百发百中 弯弓饮羽 穿杨贯虱')
element('pierce','encircle','剑气纵横 万剑归宗 刀光剑影 兵刃相接 舞刀弄剑 短兵相接')
element('poison','toxic','毒蛇猛兽 心如蛇蝎 心如蝎蛇')
put('confuse','turning','一不留神 神不守舍 心神不定 魂不守舍 六神无主')
put('reputation','reputation','一枝独秀 一花独秀 一代豪杰 一代风流 鹤立鸡群 出类拔萃 卓尔不群')


element('poison','toxic','蛇蝎心肠 心狠手辣')
put('renew','steadfast','浴火重生 涅槃重生 起死回生 死而复生')
put('legion','rally','天兵天将 千军万马 兵多将广 雄兵百万 精兵强将')
put('seasons','seasons','七月流火 星移斗转 斗转星移 春去秋来 秋去冬来 寒来暑往 日月如梭 四季轮回')
put('pillar','rampart','首当其冲')
put('rally','rally','炙手可热')
put('mechanism','precision','目无全牛')
put('succession','succession','如坐春风 如沐春风')
put('finish','precision','穷途末路')
put('decoy','mirage','居心叵测 心怀鬼胎 不怀好意 包藏祸心')

put('geometry','encircle','横七竖八')
put('confuse','turning','七上八下')
put('resolve','steadfast','三长两短')
put('contrast','contrast','不以为然')
put('patient','charge','不以为意 安之若素')
put('borrow','ambush','久假不归')
put('sweep','encircle','万人空巷')
put('steadfast','steadfast','不刊之论 始终如一')
put('harmony','rally','差强人意')
put('finish','precision','明日黄花')
put('scarcity','scarcity','身无长物')
put('reputation','reputation','不负众望 洛阳纸贵 空穴来风')
put('frustration','frustration','不孚众望 纸上谈兵')
put('purity','purity','胸无城府')
put('aggravate','aggravate','始作俑者')
put('growth','charge','登堂入室')
put('echo','charge','高山流水 阳春白雪 下里巴人')

element('chain','storm','五雷轰顶 电闪雷鸣 雷霆万钧')
element('splash','encircle','火树银花')
element('aura','radiance','风和日丽')
put('harmony','healing','和风细雨')
put('resonate','reputation','响彻云霄 震耳欲聋 锣鼓喧天 声震九霄')
put('borrow','ambush','狐假虎威 借刀杀人')
put('bargain','charge','揠苗助长 拔苗助长 急功近利')
put('decoy','mirage','滥竽充数 画饼充饥 指鹿为马')
put('inspire','rally','望梅止渴 闻鸡起舞')
put('escape','mirage','惊弓之鸟')
put('confuse','silence','对牛弹琴')
put('contrast','contrast','班门弄斧')
put('succession','succession','程门立雪')
put('frustration','frustration','黔驴技穷')
put('focus','precision','刻舟求剑 井底之蛙')
put('reversal','healing','塞翁失马')
put('relay','reputation','鸿雁传书')
put('echo','charge','口若悬河')
put('insight','encircle','盲人摸象')
put('mechanism','charge','闭门造车')
put('watch','radiance','走马观花 浮光掠影')
put('reputation','reputation','沉鱼落雁 国色天香')
put('silence','silence','黔驴技穷')
put('counter','mirage','适得其反 得不偿失')
put('confuse','frost','欲速不达')
put('reversal','turning','事与愿违')

element('echo','mirage','镜花水月 如梦似幻 梦幻泡影 扑朔迷离 海市蜃楼')
element('mark','judgment','口诛笔伐 千夫所指 众矢之的 怨声载道 天怒人怨 神憎鬼厌')
put('blast','festival','百花齐放 百花争艳 万紫千红')
put('festival','festival','八仙过海 各显神通 百家争鸣 各有所长 兼收并蓄 取长补短')
put('confuse','mirage','雾里看花')
put('aggravate','aggravate','无所不为 狼心狗肺 穷凶极恶')
put('silence','silence','不学无术')
put('adapt','festival','无所不能')
put('insight','insight','无所不知')
put('decoy','mirage','两面三刀')
put('puzzle','turning','出尔反尔')
put('frustration','frustration','爱莫能助 无能为力')
put('cooperate','rally','一荣俱荣')
put('conspire','conspire','一损俱损')
put('steadfast','steadfast','一言既出')
# Elemental routing is an explicit whole-word allowlist. An explanation can
# mention wind, stone or light while describing an unrelated metaphor.
element('aura','radiance','日和风暖 日暖风恬 月明千里 风和日暖 风清月明')
element('fast','pursuit','狂风怒号 疾风甚雨 骤风急雨 风雨如晦 风吹日晒')
element('heavy','rampart','名山大川 重峦叠嶂 重峦复嶂 高耸入云')
element('pulse','tide','一片汪洋 汹涌澎湃 浩浩汤汤 烟波浩渺 翻江搅海')
element('slow','frost','六出纷飞 岁暮天寒 料峭春寒 春寒料峭 迎风冒雪 眠霜卧雪')
element('splash','flame','烽火四起 焮天铄地')
element('pierce','precision','刀枪剑戟 吹毛利刃 坚甲利刃 锋不可当')
put('purity','purity','一廉如水 富贵不淫')
put('succession','succession','从善如流 从善若流 从谏如流')
put('reputation','reputation','如雷贯耳 轰雷贯耳 风行一时')
put('echo','reputation','口吐珠玑')
put('aggravate','aggravate','伤化败俗 伤教败俗 歪风邪气')
put('steadfast','steadfast','风雨无阻 人非草木 人非木石')
put('wrath','wrath','怒火中烧 忿火中烧 心焦如火')
put('frustration','frustration','惨无天日 暗无天日 覆盆之冤')
put('growth','growth','倒背如流')
put('seasons','seasons','岁月如流 日月如流 月落星沉 两鬓如霜')
# The existing reviewed cultural mapping wins unless a complete-word correction above applies.
move_by_core={}
def cores(move,text):
 for c in text.split():move_by_core[c]=move
cores('precision','focus erosion precision finish patient dawn')
cores('encircle','double volley sweep insight cross penetrate beast geometry resonate relay blast')
cores('rally','visit cooperate inspire radiance harmony rally festival')
cores('healing','mend rescue triage nectar renew reversal')
cores('rampart','bulwark pillar shelter counter')
cores('frost','frost roots weave')
cores('storm','storm')
cores('flame','flame')
cores('tide','tide recoil')
cores('silence','silence confuse cleanse')
cores('mirage','decoy escape')
cores('ambush','ambush borrow')
cores('pursuit','swift hunt far')
cores('bounty','fortune thrift')
cores('turning','pivot adapt puzzle balance')
cores('charge','charge growth bargain mechanism rhythm orbit echo resolve')
cores('succession','guide')
cores('radiance','watch radiance')
cores('roots','roots weave')
cores('borrow','borrow counter')
cores('wrath','resolve')
cores('contrast','balance')
cores('festival','festival')
cores('visit','visit')
cores('erosion','erosion')
cores('barrage','mechanism')
cores('growth','growth')
cores('insight','insight')
cores('reputation','echo rhythm')
cores('seasons','orbit')
# Match the explained meaning, especially the metaphor clause; never one isolated character.
rules=[]
def rule(id,pattern,special,move=None):rules.append((id,re.compile(pattern),special,move or move_by_core[special]))
rule('clean-integrity','廉洁|清白|正直|高尚|纯洁|品德|操行|公正|无私','purity','purity')
rule('learn-teach','教导|教诲|教人|老师|教师|师生|传授|教育|榜样|楷模','succession','succession')
rule('study-inquiry','学问|学习|读书|知识|学识|博学|勤学|求知|才能|才华|才干|文化','growth')
rule('truth-insight','真相|事实|明白|清楚|洞察|观察|看透|辨别|揭露|揭穿|识破|真伪','dawn')
rule('planning-wisdom','智慧|聪明|机智|谋略|计谋|策略|巧妙|智谋|灵活|办法|方法','adapt')
rule('persistence','坚持|坚韧|不屈|坚定|意志|坚强|决心|忠诚|忠贞|忠心|不改变','steadfast','steadfast')
rule('anger','愤怒|恼怒|生气|怒气|气愤|暴怒|发怒|暴躁','wrath','wrath')
rule('bad-company','勾结|同伙|奸党|串通|合谋|同类.*坏|结党|一伙|互相.*包庇','conspire','conspire')
rule('worse-state','加重|更加严重|更加.*困难|助长|加以.*迫害|恶化|祸患|祸害','aggravate','aggravate')
rule('fame','声望|名声|名气|闻名|名誉|名扬|名望|知名|声誉','reputation','reputation')
rule('many-few','人少|势单|众寡|力量.*薄弱|兵力.*少|寡不敌众|孤立无援','scarcity','scarcity')
rule('contrast','优劣|长处|短处|好坏|高低|不齐|不平|取舍|比较|对照|差别|不同之处','contrast','contrast')
rule('failure','失败|没有成功|不成功|一无所成|没有成就|白费|徒劳|无功|相反.*结果','frustration','frustration')
rule('cooperation','团结|合作|协力|协作|同心|互相帮助|同舟|共同.*努力|共同.*完成|互助|齐心','cooperate')
rule('relief','帮助|救助|救济|救援|补救|挽救|救人|解救|医治|治疗|病愈|康复','mend')
rule('safety','保护|防护|守卫|防守|防御|保卫|安全|坚固|牢固|防备|防范|警惕','bulwark')
rule('courage','勇敢|勇猛|奋勇|斗志|振奋|勇气|精神饱满|充满活力|勉励|鼓励','inspire')
rule('adversity','困境|逆境|危难|危急|危险.*拼|绝境|危亡|艰难|艰苦','resolve')
rule('focus','专心|专注|聚精|集中|认真|细致|细心|一心|全神|全力','focus')
rule('accumulation','积累|逐渐|逐步|日久|时间长|长久|不断|持久|接连|反复','erosion')
rule('preparation','准备|等待|蓄积|积蓄|时机|耐心|沉着|谨慎|慎重|考虑|思考','patient')
rule('speed','迅速|飞快|快速|敏捷|急速|很快|速度|疾速|急促|匆忙|赶快','swift')
rule('preemption','先行|抢先|先发|偷袭|突然袭击|袭击|出其不意|攻击.*不备','ambush')
rule('deceit','欺骗|虚假|假装|伪装|虚伪|蒙蔽|掩盖|诱骗|欺诈|遮掩|迷惑|假的','decoy')
rule('fear','害怕|恐惧|惊慌|惊恐|胆怯|退避|逃跑|躲避|逃避|畏惧|畏缩','escape')
rule('disorientation','混乱|糊涂|不明|迷乱|恍惚|犹豫|迟疑|不安|难以.*分辨','confuse')
rule('silence','不说|不言|安静|寂静|无声|沉默|说不出|闭口|缄默','silence')
rule('eloquence','说话|言语|语言|言论|议论|谈论|口才|言辞|表达|传说|声音|声响|歌声|音乐','echo')
rule('rage-quake','震动|震撼|震惊|惊人|气势|威力|猛烈|强烈|冲击|击退','recoil')
rule('concentration-crowds','众多|很多|人数多|数量多|到处|遍布|四周|各处|四面|聚集|多种多样','sweep')
rule('variety-beauty','美丽|美好|漂亮|鲜艳|色彩|景色|繁华|繁盛|茂盛|花朵|优美','blast')
rule('similarity','相似|相同|一样|一致|相像|相近|同样|彼此.*相','harmony')
rule('changes','变化|改变|变换|变动|转变|变通|改正|纠正|重新|更改|转换|反复无常','adapt')
rule('progress','进步|提高|成长|生长|发展|兴盛|成功|成就|有作为|兴起|新生','growth')
rule('recovery','恢复|复苏|重新.*生|重获|生机|活力|再生','renew')
rule('wealth','钱财|财富|财物|金钱|财产|收获|富裕|富有|丰收|利益|得利','fortune')
rule('thrift','节省|节约|俭朴|朴素|珍惜|吝啬|浪费','thrift')
rule('directions','方向|前后|远近|道路|路途|行程|往来|进退|距离|远方|遥远','far')
rule('struggle','争斗|争夺|争论|争执|斗争|冲突|对抗|交战|战斗|打仗|战争|厮杀','cross')
rule('removal','除去|消除|清除|扫除|摧毁|破坏|打破|消灭|毁灭','cleanse')
rule('cut-through','锋利|锐利|穿透|贯穿|穿过|直入|势不可挡','penetrate')
rule('distress','悲伤|忧愁|痛苦|忧虑|忧伤|愁苦|悲痛|哀伤|憎恨|怨恨|不满','charge')
rule('joy-harmony','快乐|喜悦|高兴|欢乐|欢喜|幸福|和睦|和谐|和平|安乐','harmony')
rule('loneliness','孤独|寂寞|独自|孤单|单独|一个人','scarcity','scarcity')
rule('respect','尊重|敬重|敬仰|尊敬|礼节|礼貌|礼仪|恭敬','guide')
rule('proportion','过分|极度|程度|十分|非常|极其|特别|完全|尽力|极端','charge')
rule('separation','分散|散开|分离|分开|分裂|离散|离开|离别|分布','volley')
rule('binding','牵连|牵制|限制|束缚|拘束|约束|缠绕|牵挂','roots')
rule('opportunities','机会|机遇|顺利|如意|好运|幸运|合适','fortune')
rule('strength','力量|强大|有力|坚实|强壮|壮大|雄伟|雄壮|巨大','pillar')
rule('grace','从容|安然|自在|自然|舒适|平稳|稳重','patient')
rule('precision','准确|精确|正确|恰当|恰好|正中|切中|关键|要害','precision')
rule('numbers','两种|两个|双|两面|兼顾|多方面|并举','double')
rule('craft','手艺|技艺|工艺|技巧|精巧|灵巧|巧妙|技术','mechanism')
rule('animals','禽兽|野兽|动物|鸟兽|走兽|猛兽|飞禽','beast')

rule('knowledge-deficit','不认识|不懂|无知|见识|见解|意见|识见|看法|眼界|看见|发现','insight')
rule('reform-advice','错误|毛病|缺点|过失|失误|缺陷|教训|改进|劝告','frustration','frustration')
rule('good-order','条理|秩序|整齐|秩序井然|严整|规矩|规章|法度|法规|法律|制度|法令|规制','geometry')
rule('tiny-detail','极小|微小|极少|细小|一点|少量|微不足道|轻微|细微|细节|渺小|细致','precision')
rule('respectable-model','景仰|崇仰|推崇|杰出|卓越|出众|超群|优秀|风尚|杰作|贤才|贤人','succession','succession')
rule('history-society','时代|朝代|帝王|皇帝|政权|君主|臣子|大臣|官吏|王朝|国家|百姓|人民|治理|天下|霸业|统治','rally')
rule('life-duration','一生|生平|终生|终身|性命|生命|死|活着|生存|寿命|永远|永恒|长寿','renew')
rule('interpersonal','人际|关系|交往|联系|连结|联络|亲密|亲近|亲属|家属|夫妻|夫妇|父母|子孙|亲人|家人|兄弟|骨肉','cooperate')
rule('speech-expression','话多|口口|说出|言|词|话|讲|口|文辞|文字|诗|书画|文章|文笔|词句|写作|文风','echo')
rule('respect-kindness','和蔼|和气|可亲|仁慈|慈爱|仁爱|温和|温柔|宽厚|宽容|友好|善良|怜惜|感激|感恩|报恩','mend')
rule('power-conflict','胜负|高下|士兵|军队|武力|勇力|气力|势力|能力|本领|本事|武艺|功夫','cross')
rule('time-event','时间|时候|片刻|一会|很久|不久|先后|早晚|转眼|瞬间|短暂|年月|年岁|年龄|岁月|年纪|时节','rhythm')
rule('all-complete','彻底|妥当|全部|全面|一切|尽数|完备|齐备|周到|周全|兼备|应有','sweep')
rule('chaos-restraint','乱到|乱|动荡|骚动|纷扰|搅扰|纠纷|复杂|麻烦|繁杂|繁琐|琐碎|纠缠|扰乱|阻碍|障碍','confuse')
rule('money-property','用钱|钱|金子|黄金|银子|贵重|价值|昂贵|珍贵|宝贝|珍宝|物资|物质|消费|资财|财力|有钱','fortune')
rule('number-amount','多|少|数量|数目|分量|总数|不计其数|大批|大量|大半|轻重|大小|粗细','double')
rule('strong-emotions','心情|情绪|感情|心意|情意|心地|心境|心思|情谊|爱情|爱恋|留恋|依恋|感受|心愿|愿望|心事|心肠','harmony')
rule('hunger-injury','病|痛|伤|疾病|医药|食物|饮食|吃|饭|饥|饱|饿|渴|穷困|贫困|贫穷|缺乏','mend')
rule('action-work','做事|办事|事情|行为|行动|举动|活动|工作|事务|行事|举止|处事|待人|事物|任务|做法|行径','adapt')
rule('appearance-detail','外貌|外表|模样|样子|形态|形状|姿态|面貌|仪容|容貌|神态|姿势|风度|体态|装饰|打扮','reputation','reputation')
rule('diligent-labor','劳动|辛劳|辛苦|辛勤|操劳|勤奋|勤劳|努力|用功|不懈|奔波|忙碌|奔忙|疲劳|疲惫','erosion')
rule('authority-rules','责任|职责|职务|职位|权力|权势|权威|义务|身份|地位|职位|官职|职业|资格','rally')
rule('moral-judgment','正义|正当|道德|道义|道理|义理|正理|公道|义气|信义|信用|守信|诚信|诚实|真诚|忠实','steadfast','steadfast')
rule('punish-malicious','犯罪|罪恶|罪行|作恶|恶毒|残忍|凶恶|残酷|狠毒|贪婪|贪心|贪图|自私|邪恶|卑鄙|恶劣|阴险|贬义','aggravate','aggravate')
rule('tactics-loss','失去|失掉|丧失|遗失|抛弃|放弃|舍弃|损失|丧|失落|消失|消逝|覆灭|毁|灭|腐朽|衰','frustration','frustration')
rule('pressure-arrogance','压迫|欺负|欺凌|欺人|傲慢|骄傲|自大|自满|自负|倨傲|蛮横|横暴|强横|狂妄|盛气','wrath','wrath')
rule('determination-rules','决定|果断|决断|坚决|果决|执行|贯彻|厉行|做主','finish')
rule('space-movement','行走|行路|走路|前进|向前|行进|奔跑|运动|移动|旅行|奔走|奔驰|跑|驰骋','swift')
rule('nature-flourishing','天地|自然界|大自然|植物|草木|树木|树|花|草|鸟|兽|山川|河山|山河|风景','blast')
rule('honor-office','荣耀|荣誉|荣耀|任一官|荣华|显贵|显达|官|权|尊贵|荣耀','reputation','reputation')
rule('time-repeat','每年|每月|每次|一次|多次|重来|重复|周期|季节','rhythm')
rule('mistake-adjust','变故|差错|差失|错|不知|不知道|不明白|不懂得|不通|认识不清','insight')
rule('response','响应|呼应|应和|随声|附和|回音|回声|吵|嚷|喧|号|叫','resonate')
rule('geography-extent','辽阔|宽阔|广阔|浩大|宽广|广大|广泛|边际|无边|大地|地域|地区|地方|田地|土地|之地|景象','sweep')
rule('substance-weakness','基础差|底子薄|衰弱|萎靡|不足|虚弱|不够|无所|不能|不得|不必|不愿','scarcity','scarcity')
rule('inheritance-agreement','流派|门户|派别|归属|传承|门派|门徒|同门|相处|相识|交情|相交|相遇|相逢','succession','succession')
rule('inner-clarity','心|念|想|意|精神|理想|志向|志趣|志气|意识|心理','focus')

# Multi-character phrase patterns are only used when no independent explanation exists.
head_rules=[
('whole-speech',r'言.{0,1}语|有口|无言|不语|一言|直言|高谈|阔论|默默|滔滔|说.{0,1}道','echo'),
('whole-study',r'学.{0,1}文|学.{0,1}才|好学|读书|知书|博学|多才|文.{0,1}武|文采|文章|文思|才华','growth'),
('whole-fear',r'惊.{0,1}恐|心惊|胆.{0,1}怕|胆小|惊慌|畏.{0,1}缩|闻风|逃之|退避','escape'),
('whole-faith',r'忠心|忠贞|不渝|不屈|坚定|坚贞|始终|自强|百折','steadfast'),
('whole-help',r'扶.{0,1}助|相助|援手|救.{0,1}助|救.{0,1}困|死.{0,1}生|回春|慈.{0,1}善','mend'),
('whole-unity',r'同心|同舟|协.{0,1}力|齐.{0,1}力|群策|万众|互.{0,1}助|团结','cooperate'),
('whole-fame',r'闻名|无名|有名|名声|名扬|声名|为人知|赫赫','reputation'),
('whole-anger',r'怒.{0,1}冲|暴.{0,1}雷|怒气|怒火|愤.{0,1}怒','wrath'),
('whole-many',r'成群|成千|千.{0,1}万|万.{0,1}千|比比|处处|四面|八方|满.{0,1}满|人来|多多','sweep'),
('whole-contrast',r'有.{0,1}无|无.{0,1}有|长.{0,1}短|高.{0,1}低|先.{0,1}后|前.{0,1}后|好.{0,1}坏|真.{0,1}假|大.{0,1}小','contrast'),
('whole-speed',r'飞.{0,1}快|如飞|飞奔|疾.{0,1}风|快.{0,1}快|迅.{0,1}速|大步|健步|一瞬|一晃','swift'),
('whole-cunning',r'暗中|瞒.{0,1}骗|弄虚|作假|假.{0,1}真|虚张|掩.{0,1}目|明.{0,1}暗','decoy'),
('whole-risk',r'危.{0,1}难|绝.{0,1}生|险.{0,1}生|血.{0,1}战|赴汤|蹈火|九死|孤注','resolve'),
('whole-light',r'光明|磊落|清廉|清白|正大|公正|正直|清正|大公','purity'),
('whole-bonds',r'依依|恋恋|牵.{0,1}挂|纠.{0,1}缠|缠绵|紧紧','roots'),
('whole-travel',r'天涯|海角|千里|万里|遥遥|远.{0,1}近|南.{0,1}北|东.{0,1}西|来.{0,1}去','far'),
('whole-victory',r'胜.{0,1}败|克.{0,1}胜|成.{0,1}败|败.{0,1}成|一举|功成|成就','finish'),
('whole-confusion',r'乱.{0,1}乱|纷纷|昏.{0,1}暗|糊里|惶惶|迷.{0,1}迷|迷迷|纷乱','confuse'),
('whole-safety',r'固.{0,1}金|守.{0,1}卫|护.{0,1}卫|坚.{0,1}石|铜墙|铁壁|稳如|平安|安然','bulwark'),
('whole-planning',r'算.{0,1}计|深思|谋.{0,1}虑|三思|思前|慎.{0,1}慎|步步|慢.{0,1}慢','patient'),
('whole-loss',r'无功|无成|未果|难成|难收|徒劳|白费|不成|尽失','frustration'),
('whole-flourish',r'花.{0,1}锦|繁花|似锦|春.{0,1}景|花.{0,1}艳|绚丽|缤纷|五光|五颜','blast'),
('whole-change',r'千变|万化|变幻|变.{0,1}化|变.{0,1}变|改.{0,1}换|反复|更.{0,1}更','adapt'),
('whole-gain',r'财.{0,1}富|财.{0,1}进|金.{0,1}银|富.{0,1}富|丰.{0,1}收|得.{0,1}利','fortune'),
('whole-spirited',r'勇.{0,1}敢|勇.{0,1}前|昂首|挺胸|精神|斗志|英勇|鼓.{0,1}气|生龙|虎虎','inspire'),
('whole-counter',r'以.{0,1}还|以.{0,1}制|反.{0,1}击|后发|借.{0,1}力','borrow'),
]
head_rules=[(id,re.compile(p),s,move_by_core.get(s,s)) for id,p,s in head_rules]
for word,entry in supplement.items():
 assert word in words and len(word)==4 and entry['kind'] in ('idiom','phrase')
 overrides[word]={k:v for k,v in entry.items() if k in ('type','special','move')}
 overrides[word]['rule']='basic-four-whole-word-reviewed'
 if entry['kind']=='idiom':rejected.pop(word,None)
byword={};reasons=collections.defaultdict(list)
ids |= set(overrides)-retired
ids -= skills-set(vocabulary_review['existingSkillRoutes'])
for w in sorted(ids):
 old=words.get(w,{});text=ref.get(w,'');meaning=text.split('比喻')[-1] if '比喻' in text else text
 for alias in re.findall(r'(?:同|见|犹言|犹)([\u4e00-\u9fff]{4})[。”]',text):
  if alias!=w and alias in ref:meaning+=' '+ref[alias]
 if w in overrides:p=overrides[w]
 elif old.get('special'):p={'type':'learning','special':old['special'],'move':move_by_core.get(old['special'],'charge'),'rule':'retained-reviewed-core'}
 else:
  p=None
  if p is None and text:
   candidates=[]
   broad={'inner-clarity','number-amount','proportion','action-work','space-movement','speech-expression','time-event','all-complete','similarity','strong-emotions','nature-flourishing','geography-extent'}
   for order,(rid,pat,spec,move) in enumerate(rules):
    matches=list(pat.finditer(meaning))
    if matches:candidates.append((max(len(m.group()) for m in matches)-(1.5 if rid in broad else 0),-order,rid,spec,move))
   if candidates:
    _,_,rid,spec,move=max(candidates);p={'type':'learning','special':spec,'move':move,'rule':rid}
  if p is None:
   for rid,pat,spec,move in head_rules:
    if pat.search(w):p={'type':'learning','special':spec,'move':move,'rule':rid};break
  if p is None:p={'type':'learning','special':'canon','move':'canon','rule':'complete-phrase-formation'}
 byword[w]=p;reasons[p['rule']].append(w)
groups=collections.defaultdict(list)
for w,p in byword.items():groups['/'.join([p['type'],p.get('special',''),p['move']])].append(w)
additional_lessons={
 '一丘之貉':'比喻同是坏人，或同属一类丑恶事物。含贬义。',
 '一代宗师':'一个时代中受到尊崇、能够开宗立派的大师。',
 '一事无成':'连一件事情也没有做成功，形容没有取得成就。',
 '金玉良言':'像金玉一样珍贵、有价值的劝告或教诲。',
 '七月流火':'农历七月傍晚，大火星逐渐向西落下，天气开始转凉；不是说天气炎热。',
 '首当其冲':'比喻最先受到攻击，或最先遭遇灾害。',
 '炙手可热':'比喻权势很盛、气焰很盛，使人不敢接近。',
 '目无全牛':'形容技艺十分熟练，已经掌握了事物的内部结构和规律。',
 '如坐春风':'比喻受到良师益友的教诲，感到亲切、舒畅。',
 '不以为然':'不认为是对的，表示不同意。',
 '不以为意':'不把事情放在心上。',
 '久假不归':'长期借用，却不归还。假在这里指借用。',
 '万人空巷':'人们都从家中出来聚集，形容欢迎或庆祝的热闹情景。',
 '不刊之论':'不可更改、不可磨灭的言论。刊在这里指削除、更改。',
 '文不加点':'写文章一气呵成，不用涂改。点在这里指涂改。',
 '差强人意':'大体上还能够让人满意。',
 '明日黄花':'比喻已经过时、不再有原来意义的事物。',
 '身无长物':'除自身以外没有多余的东西，形容清贫。'
}
extra_lessons={w:{'kind':'idiom','group':'常见与易混成语','meaning':meaning,'culture':True} for w,meaning in additional_lessons.items() if w in byword and w not in lessons}
for word,meaning in verified_extra.items():
 if word in byword and word not in lessons:extra_lessons[word]={'kind':'idiom','group':'词义辨析','meaning':meaning}
for word,meaning in vocabulary_review['meaningOverrides'].items():
 if word in byword:extra_lessons[word]={'kind':'idiom','group':'词义辨析','meaning':meaning}
for word,meaning in vocabulary_review.get('phraseMeanings',{}).items():
 if word in byword and word not in lessons:extra_lessons[word]={'kind':'phrase','group':'词义辨析','meaning':meaning}
for word,entry in supplement.items():
 if entry.get('meaning') and word not in lessons:extra_lessons[word]={'kind':entry['kind'],'group':'四字词复查','meaning':entry['meaning'],'culture':True}
out={'sources':[{'repository':'pwxcoo/chinese-xinhua','commit':'fe6d6c2e8baa82187f4c96bbe042e43f96c05666','license':'MIT','use':'Headword/meaning comparison and licensed offline fallback explanations; curated explanations take precedence.'}],'lessons':extra_lessons,'rejected':rejected,'groups':{k:' '.join(v) for k,v in sorted(groups.items())},'reviewRules':{k:' '.join(v) for k,v in sorted(reasons.items())},'wholeWordCorrections':overrides,'confirmed':' '.join(sorted(w for w in byword if w not in rejected and (w in ref or w in overrides or (w in raw and words.get(w,{}).get('special')) or lessons.get(w,{}).get('kind')=='idiom'))),'counts':{'sourceTagged':len(raw),'classified':len(byword),'referenceMatched':sum(w in ref for w in byword),'types':dict(collections.Counter(p['type'] for p in byword.values())),'canon':sum(p.get('special')=='canon' for p in byword.values())}}
out['confirmed']=' '.join(sorted(w for w in out['confirmed'].split() if w not in supplement or supplement[w]['kind']=='idiom'))
# A combat routing override and a jieba POS tag are not linguistic evidence.
# Unverified phrases keep their recipe/effect, but do not receive an idiom badge.
out['confirmed']=' '.join(sorted(w for w in byword if w not in retired and w not in rejected and (w in ref or w in verified_extra or lessons.get(w,{}).get('kind')=='idiom' or extra_lessons.get(w,{}).get('kind')=='idiom') and (w not in supplement or supplement[w]['kind']=='idiom')))
confirmed_set=set(out['confirmed'].split())
out['unverifiedHeadwords']=' '.join(sorted(w for w in byword if w not in confirmed_set and w not in rejected))
out['vocabularyReview']={'retired':len(retired),'verifiedHeadwords':len(out['confirmed'].split()),'unverifiedPlayablePhrases':len(out['unverifiedHeadwords'].split()),'segmentationTagsAreEvidence':False}
out['basicFourCorrections']=sorted(supplement)
out['basicFourReview']={'baselineCommit':sweep['baselineCommit'],'reviewed':len(sweep['baselineWords'].split()),'reclassified':len(supplement),'idioms':sum(e['kind']=='idiom' for e in supplement.values()),'phrases':sum(e['kind']=='phrase' for e in supplement.values())}
out['additionalLearning']={word:entry['special'] for word,entry in json.loads((root/'data/zodiac-words.json').read_text()).items()}
content=json.dumps(out,ensure_ascii=False,indent=2)+'\n'
if args.check:assert (root/'data/idiom-review.json').read_text()==content,'Review catalog needs rebuilding'
else:(root/'data/idiom-review.json').write_text(content)
print(json.dumps(out['counts'],ensure_ascii=False))
