#!/usr/bin/env node
import {readFile,writeFile} from 'node:fs/promises';
const read=name=>readFile(new URL('../docs/reports/'+name,import.meta.url),'utf8').then(JSON.parse);
const current=await read('word-damage-benchmark.json'),before=await read('word-damage-before-learning-buff.json');
const row=(data,type,tier,scenario,level=tier)=>data.summary.find(x=>x.type===type&&x.tier===tier&&x.level===level&&x.scenario===scenario);
const fmt=n=>n.toFixed(1),delta=(a,b)=>((a/b-1)*100).toFixed(1)+'%';
const lines=['# 词塔伤害对照（学属性增强）','',
 '本次提高学的基础输出与射程，并加强部分群攻、治疗、护盾和协同招式；建造、升级费用、其他属性、敌人和关卡参数不变。结果比较增强前后的相同测试条件。','',
 '## 测量方法','',
 `覆盖全部 ${current.recipes.toLocaleString()} 个二至四字词，其中学词 ${current.learningRecipes.toLocaleString()} 个、67 类招式。相同战斗配置合并后共 ${current.combatProfiles.toLocaleString()} 种配置、${current.measurements.toLocaleString()} 次测量；统计按对应词数加权，不按手牌抽取概率加权。`, '',
 '单座满耐久词塔持续攻击 60 秒，步长 50 毫秒；使用真实攻击、区域和敌人更新逻辑，保留品质与附加词义，无预叠层。分别测初始等级，以及二、三字词升级到共同 4 级，墨点效率包含实际升级支出。','',
 '场景为一个普通地面靶、六个密集共线地面靶、一个 Boss 地面靶；靶子不移动、不攻击、不施法、无护甲护盾、不回血、不死亡，Boss 保留分类判定。伤害包含测量窗口内的毒伤、灼烧和裂伤。','',
 '该对照不折算治疗、护盾、协同、控制、射程、破甲、斩杀和残血反击的完整价值，密集场景有利于范围和贯穿攻击。6 个单字学词不在多字词对照内。','',
 '## 学增强前后：同字数、同初始等级的单体伤害中位数','',
 '| 字数 / 等级 | 增强前学 | 增强后学 | 学自身提升 | 当前普 | 学相对普 | 学每 100 墨点 | 普每 100 墨点 |',
 '|---|---:|---:|---:|---:|---:|---:|---:|'];
for(const n of [2,3,4]){
 const a=row(before,'learning',n,'single'),b=row(current,'learning',n,'single'),p=row(current,'basic',n,'single');
 lines.push(`| ${n} 字 / ${n} 级 | ${fmt(a.dps.median)} | ${fmt(b.dps.median)} | +${delta(b.dps.median,a.dps.median)} | ${fmt(p.dps.median)} | +${delta(b.dps.median,p.dps.median)} | ${fmt(b.per100Ink.median)} | ${fmt(p.per100Ink.median)} |`);
}
lines.push('','## 各属性输出中位数','',
 '| 属性 | 二字单体 | 二字六怪总计 | 三字单体 | 三字六怪总计 | 四字单体 | 四字六怪总计 |',
 '|---|---:|---:|---:|---:|---:|---:|');
for(const type of ['basic','learning','splash','slow','chain','fast','heavy','aura','poison','sniper','income','pierce','pulse','mark','echo']){
 const values=[2,3,4].flatMap(n=>['single','pack'].map(s=>row(current,type,n,s).dps.median));
 lines.push('| '+row(current,type,2,'single').icon+' | '+values.map(fmt).join(' | ')+' |');
}
lines.push('','## 四字词的具体表现（初始 4 级）','',
 '| 词语 | 单体 | 六怪总计 | Boss |','|---|---:|---:|---:|');
for(const word of ['三国演义','三顾茅庐','一心一意','周而复始','势如破竹','众志成城','妙手回春','东奔西走']){
 const values=['single','pack','boss'].map(s=>current.examples.find(x=>x.word===word&&x.level===x.tier&&x.scenario===s).dps);
 lines.push('| '+word+' | '+values.map(fmt).join(' | ')+' |');
}
lines.push('','「妙手回春」的治疗、「众志成城」的护盾及「三顾茅庐」的友塔强化均未算入单塔伤害；这些收益另由真实状态、冷却和保存规则测试验证。','',
 '## 同为 4 级的复核','', '| 原词长度 | 学单体 | 普单体 |','|---|---:|---:|');
for(const n of [2,3,4])lines.push(`| ${n} 字 | ${fmt(row(current,'learning',n,'single',4).dps.median)} | ${fmt(row(current,'basic',n,'single',4).dps.median)} |`);
lines.push('','同等级时，原词品质、附加槽和实际支出仍有区别。不要把单塔木桩输出视为关卡通关率或玩家实战胜率。','',
 '复现：先运行 `node scripts/benchmark-word-damage.mjs`，再运行 `node scripts/report-word-damage.mjs`。', '',
 '完整 67 招式分组、费用效率和源码哈希：[当前报告](reports/word-damage-benchmark.json)；增强前固定基准：[增强前报告](reports/word-damage-before-learning-buff.json)。','');
await writeFile(new URL('../docs/WORD-DAMAGE.md',import.meta.url),lines.join('\n'));
console.log('Wrote before/after damage comparison');
