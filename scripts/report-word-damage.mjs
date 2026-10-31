#!/usr/bin/env node
import{readFile,writeFile}from'node:fs/promises';
const current=JSON.parse(await readFile(new URL('../docs/reports/word-damage-benchmark.json',import.meta.url),'utf8'));
const row=(type,tier,scenario,level=tier)=>current.summary.find(x=>x.type===type&&x.tier===tier&&x.level===level&&x.scenario===scenario),fmt=n=>Number.isFinite(n)?n.toFixed(1):'—';
const lines=['# 词塔伤害对照：词义绝技','', '学属性保留此前的词义绝技预算。远射形态的初始范围至少 263，额外射程和升级继续叠加，伤害与攻击间隔不变。重新分类的词使用目标属性原有的数值和规则。旧版学增强报告保留为历史，不能拿不同组成的学词集合推算逐词提升。','', '## 测量方法','',`覆盖 ${current.recipes.toLocaleString()} 个二至四字词，${current.combatProfiles.toLocaleString()} 种实际战斗配置，${current.measurements.toLocaleString()} 次测量（含关闭绝技的配对对照）。结果按词数加权，非手牌抽取概率加权。`,'','满耐久单塔持续攻击 60 秒，50 毫秒步长，保留品质与附加词义，无预叠层。分别测初始等级与共同 4 级，包含真实升级支出。使用真实攻击、区域和敌人状态更新，统计窗口内持续伤害。','', '基础场景为一个无甲地面靶、六个密集共线无甲靶、一个无甲 Boss 靶；另测有甲靶与飞行靶。靶子不移动、不出手、不施法、不回血、不死亡，Boss 保留分类判定。每个带绝技的配置再关闭这一项复测，面板、原招式、附加词义完全相同。','', '静止靶位于原有射程之内，因此本表不能衡量射程增强带来的提前开火收益，需结合整局报告。木桩也不折算友塔增益、治疗、护盾、控制、射程、击杀收益、残血反击和斩杀的完整价值；有甲场景才体现破甲，飞行场景保留防空限制。单塔输出不等于整局胜率。','', '## 同一个词：保留原招式，只开关绝技','', '| 四字词 | 属性 | 单体无绝技 | 单体含绝技 | 六怪无绝技 | 六怪含绝技 | 有甲含绝技 |','|---|---|---:|---:|---:|---:|---:|'];
for(const word of['三顾茅庐','滴水穿石','冰清玉洁','火上浇油','一丘之貉','七月流火','一代宗师','五雷轰顶','毒蛇猛兽','火树银花','三国演义','众志成城','妙手回春']){
 const get=s=>current.examples.find(x=>x.word===word&&x.level===4&&x.scenario===s),a=get('single'),b=get('pack'),c=get('armored');if(!a||!b)continue;
 lines.push(`| ${word} | ${a.icon} | ${fmt(a.withoutUltimateDps)} | ${fmt(a.dps)} | ${fmt(b.withoutUltimateDps)} | ${fmt(b.dps)} | ${fmt(c?.dps)} |`);
}
lines.push('','## 不同长度与属性的输出中位数','', '| 属性 | 二字单体 | 二字六怪 | 三字单体 | 三字六怪 | 四字单体 | 四字六怪 |','|---|---:|---:|---:|---:|---:|---:|');
for(const type of['basic','learning','splash','slow','chain','fast','heavy','aura','poison','sniper','income','pierce','pulse','mark','echo']){const first=row(type,2,'single');lines.push('| '+first.icon+' | '+[2,3,4].flatMap(n=>['single','pack'].map(s=>fmt(row(type,n,s)?.dps.median))).join(' | ')+' |');}
lines.push('','## 具体二三字参照（同为 4 级）','', '| 词语 | 属性 | 单体 | 六怪 | 每百墨点单体 |','|---|---|---:|---:|---:|');
for(const word of['火球','烈焰箭','毒气弹','寒冰箭','毒云']){const a=current.examples.find(x=>x.word===word&&x.level===4&&x.scenario==='single'),b=current.examples.find(x=>x.word===word&&x.level===4&&x.scenario==='pack');if(a)lines.push(`| ${word} | ${a.icon} | ${fmt(a.dps)} | ${fmt(b.dps)} | ${fmt(a.per100Ink)} |`);}
lines.push('','同为 4 级，原词品质、附加槽与实际支出仍有区别。辅助技能在单塔表中偏低，密集靶有利于范围攻击；不存在每个四字词都在所有场景超过二三字词的承诺。','', '复现：`node scripts/benchmark-word-damage.mjs` 后运行 `node scripts/report-word-damage.mjs`。','', '[完整报告与源码哈希](reports/word-damage-benchmark.json)；[旧基础增强前报告](reports/word-damage-before-learning-buff.json)。','');
await writeFile(new URL('../docs/WORD-DAMAGE.md',import.meta.url),lines.join('\n'));console.log('Wrote paired semantic ability comparison');
