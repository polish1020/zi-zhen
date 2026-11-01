# 词库订正与成语依据

2026-11-01；基线 `9020632870665080aa4ef022f5cb38307ee3c94c`。

本次扫描原有 120,772 个词条，比较固定版本的释义参考库，筛查相差一个字的疑似错词，并重点复核明确错误。不是逐条人工考据全部词语，也不以某一本词典未收录作为删除依据。

## 处理结果

- 236 个错写词退出新组词，保留或补入规范形。例如血流成杵→血流漂杵、三顾茅芦→三顾茅庐、金榜提名→金榜题名、谈笑风声→谈笑风生、迫不急待→迫不及待。
- 54 个截断、损坏词条退出新组词，如一举手一、一下子把、迅雷不及。
- 新增 37 个缺失的正确写法。当前可用词条 120,519 个。
- 349 个依据不足的旧成语标签改为四字词；这些词的配方与战斗数值保留。未经确认的表达不靠分词 POS 标记或战斗招式分类获得成语标签。
- 当前 14,955 个标为成语的词条都有释义；为其中原来缺失的 14,347 个补齐释义。优先采用已有人工说明，其余使用 MIT 许可的固定参考库离线释义。
- 23,185 个技能组合配方全部保留。技能配方不会套用同字成语的参考释义，例如风雷火炮仍按游戏技能解释。

普通短语和合理异形表达不会因为与另一个成语相近就自动替换。例如各行其事、人尽其材、两厢情愿均保留。完整处置表、原始参考说明和结构检查结果见 [报告](reports/vocabulary-review.json)。

## 存档与玩法

原 120,482 个仍可用词的完整战斗配置保持一致。退出新组词的 290 个词保留发布时的精确战斗配置，只供旧存档已建塔及其持续效果使用；它们不会进入新发牌、组词、建造或提示。

旧塔详情明确标为旧版词条，并显示规范写法或截断说明。伤势、等级、投入、重建次数和已用字牌保留，不强行换塔或清空战局。旧存档若持有已付费但被撤下的提示，退回最后一次提示费用，并退回一次价格递增；保存重载不会重复退款。

所有成语释义会显示在预览弹窗和塔详情。参考释义经过文本转义，不作为 HTML 执行。仍未核实的四字词继续以四字词显示，不伪造释义或出处。

## 数据与复现

- 订正依据：[vocabulary-review.json](../data/vocabulary-review.json)。
- 参考释义：[idiom-definitions.json](../data/idiom-definitions.json)，MIT 来源及版权说明在 `data/idiom-source-notice.txt` 和打包后的 `THIRD-PARTY-NOTICES.txt`。
- 旧塔配置：[retired-word-profiles.json](../data/retired-word-profiles.json)，记录基线原位置及配置。
- `node scripts/audit-vocabulary-review.mjs --write`：全库、标签、释义、规范形、旧配置和技能配方审计。
- `python3 scripts/build-lexicon.py --check`、`python3 scripts/classify-idioms.py --check`、`node scripts/build-idiom-review.mjs --check`：检查离线构建可复现。
- `node --test tests/*.test.mjs`：包括真实建造扣牌扣费、290 个旧塔存档、提示退款与战斗回归。
- `node tests/vocabulary-review.cjs`：四尺寸浏览器界面验证，可用 `BROWSER=webkit` 检查 WebKit；不代替实体 iPhone 测试。

发牌和主线模拟分别见 [发牌报告](reports/vocabulary-review-hands.json) 与 [主线报告](reports/vocabulary-review-balance.json)。未为追求某个胜率调整怪物、路线、词塔、价格或奖励。
