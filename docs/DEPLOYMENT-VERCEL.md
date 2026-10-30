# Vercel 生产发布

正式地址：https://game.polishwb1020.com

默认地址：https://zi-zhen.vercel.app

- 团队：`changsheng`，ID `team_azaP3oGtfy4m7CDhqfxdNiLP`
- 项目：`zi-zhen`，ID `prj_knArbjGsckakBpEb06lLwiWsHlyb`
- 生产部署：`dpl_4G9gcE5jd4sspZxSjLH6QKtHg6Vv`
- 部署地址：https://zi-zhen-e8l5ieecm-changsheng.vercel.app
- 生产源码提交：`46a6e3de4a24b3a8d02aa5420693b7d49bf3c5bf`
- 发布时间：2026-10-30；状态 `READY`，环境 `production`
- 框架：静态站点，`framework: null`，输出 `public`，无安装/构建依赖。
- Vercel 输出构建 36ms；从 buildingAt 到 ready 约 1.6 秒；日志无构建错误。
- 控制台：https://vercel.com/changsheng/zi-zhen

## 更新方法

```sh
python3 scripts/prepare-vercel.py
```

默认输出 `/workspace/deploy/zi-zhen-vercel`；可传 `--output`。生成目录的 `.vercel/project.json` 仅含项目和团队标识，不含凭证。

通过已授权 Vercel 连接器上传 `vercel.json` 与十个 `public/` 文件，共 11 个。三个模块的 `.mjs` 扩展名统一适配为 `.js`，同步改写 HTML 和模块 import。词库与 `THIRD-PARTY-NOTICES.txt` 必须随包上传，不可漏掉。

当前未关联 Git，因此提交本地代码不会自动部署。后续继续发布到上述既有项目和团队；或在生成目录使用已登录同一账户的 Vercel CLI 执行 `vercel deploy --prod`。不要重复新建同名项目，不要为测试关闭访问保护。

## 线上验证

- 正式域名的十个文件全部 HTTP 200，Content-Type 正确，内容与上传文件逐字节一致，包括常用词库与许可声明。
- `BASE_URL=https://game.polishwb1020.com node tests/browser.cjs` 通过：开始界面、同屏布局、付费提示、技能、跳关、终局恢复、无尽与失败重试。
- 线上 `tests/responsive.cjs` 十种尺寸通过：页面无溢出、字牌无空格、地图比例一致、严格词序、点击效果、单次点击显示范围、详情与升级、恢复和旋转。
- 线上 `tests/expansion.cjs` 通过：冰霜箭建造、毒云搜索、解锁涨价、手势保护、固定波次计时及叠波、九十四类怪物与周期 Boss 实际出场。
- 线上 `tests/campaign.cjs` 验证十章主题与入口、四十二种 Boss、52 种普通怪轮廓、各章特色兵说明、属性详情、音效静音、升级和提示栏。
- 线上 `tests/pause.cjs` 验证四种尺寸暂停布阵与时钟冻结、继续后的定时出波。
- 线上 `tests/word-traits.cjs` 验证毒箭与毒云不同词意、数值、区域和存档；`tests/endless-bosses.cjs` 验证密集无尽 Boss 的预告、出场和数量显示。
- 线上 `tests/word-meanings.cjs` 验证四种尺寸下的 39 类词义筛选与索引、组合词标识、成语精确解释、重生次数、距离词面板；最终精确词义修订后重跑该流程和基本游戏流程。
- 测试期间 JavaScript 运行错误为零；数值平衡和规则测试见 `TESTING.md`。

## 域名与原生资源

`game.polishwb1020.com` 已绑定生产项目并验证，复用阿里云原有泛域名解析，本次未修改 DNS。HTTPS 和匿名访问正常。注册商仍为阿里云，无需转移域名。

`python3 scripts/prepare-mobile.py` 生成包含词库和许可的本地资源包。该包与本次公开部署资源逐字节一致。Capacitor 配置和尚未完成的原生签名/构建事项见 `MOBILE-APP.md`；当前未生成安装包。

## 本轮新增线上验收

生产状态 READY、域名自动别名无错误，十个公开文件均 HTTP 200，逐字节匹配已测试的发布包与 native 资源。构建日志无错误，静态站点没有服务端运行日志。

- 线上 WebKit `tests/standalone.cjs`：五种独立窗口尺寸、安全区与高度恢复、旋转、键盘可视高度、暂停升级、存档重入、无独立 Boss 遮挡层。
- 线上 WebKit `tests/enemy-codex.cjs`：三种尺寸的 94 张不同形象解码、52 小怪/42 Boss/每章六种专属筛选，图鉴前后战场画布一致。
- 线上 Chromium `tests/tower-art.cjs`：十四类属性、十九种形态、三十九种附加特性及升级渲染，真实混合攻击、减少动态效果、暂停不改变战斗状态。
- 线上 Chromium `tests/browser.cjs`：基础游戏、提示、技能、跳关、无尽、失败及重试全流程。

实体 iPhone 的系统状态栏仍未验证；WebKit 模拟不等于 iOS 主屏幕安装环境。更新后先彻底关闭再重新打开桌面应用，保留本地数据。

## 独立窗口高度与成长曲线复验

本次生产源码包含独立窗口 CSS 四边定位修复与 Boss/小怪渐进强化。线上 WebKit `tests/standalone-bounds.cjs` 覆盖五种尺寸，两种 JS 高度同时少报仍铺满窗口、前台恢复/旋转/重载、字库外 6px 间距和内部手势区；线上 Chromium 基本游戏流程和 94 种图鉴检查通过。十个静态文件 HTTP 200 并与测试/原生包逐字节一致。

127 项规则回归与 400 场强化后的自动对局通过，未降低难度检查阈值。现存敌人沿用存档生命，新出场敌人应用新曲线；所有 42 种 Boss 的半血阶段各只触发一次。实体 iPhone 的系统窗口仍未直接验证。

## 品质词义上限发布

本次按原词字数限制附加特性为 0/1/1/2，升级不扩槽；低品质不再获得被裁剪项的效果或数值取舍，基础属性与攻击形态保留。详情、预览、词典筛选、塔身符印读取同一份生效列表。132 项规则与 400 场自动对局通过原有标准。

线上 WebKit `tests/quality.cjs` 覆盖四种尺寸、实际生效数量和筛选、升级到 4 级仍保持灵词品质、重载恢复；`tests/standalone-bounds.cjs` 覆盖五种独立窗口尺寸、旋转与恢复，没有新增底部空白。十个文件均 HTTP 200，与测试发布包及原生资源逐字节一致。

## Boss 强化与小怪战术发布

本次提升 Boss 与轮间生命成长，42 种 Boss 均有有限主动技能和半血加速；16 种小怪新增限次主动战术，6 种新增半血反应，第 4/6 轮逐步加入。墨医优先限次救援残血；保护与干扰取最高值，不无限叠加。

145 项规则、400 场十章自动对局按原有阈值通过。发布包 Chromium/WebKit 四尺寸新技能流程通过；本地 94 张图鉴、无尽多 Boss、暂停布阵和基本游戏流程回归通过。线上 WebKit 四尺寸 `tests/enemy-tactics.cjs` 验证 Boss 蓄势与实际凝盾、技能说明和状态保存、手机无页面溢出且无独立 Boss 遮挡层；线上 Chromium 基本游戏全流程通过。十个静态文件均 HTTP 200，并与发布包及原生资源逐字节一致。原 iOS 独立窗口四边定位没有更改，实体 iPhone 未直接验证。

## 波次与商店价格发布

波次间隔 30 秒；刷新固定 50；提示按成功购买次数为 100/200/300…，跨轮/无尽保留，复看或无词不涨价，重开/切章重置。新增提示计数持久化并校验，旧存档不追算购买次数。当前已保存的在途倒计时保持，后续新安排使用 30 秒。

150 项规则通过，800 场资源账本审计完成。新价格与 30 秒节奏另测 400 场有效提升策略，整体通关率 90%/91%，个别章节为 75%，未宣称原有每章 casual 阈值全部通过；数据与限定条件见 `TESTING.md`、`ECONOMY.md`。

线上 WebKit `tests/pricing.cjs` 四种尺寸验证精确扣费、100/200/300 报价与免费复看、固定 50 刷新、价格存档和说明；线上 Chromium `tests/expansion.cjs` 验证定时叠波，`tests/browser.cjs` 验证基本游戏全流程。十个公开文件均 HTTP 200，逐字节匹配发布和原生资源包。构建和浏览器无运行错误；实体 iPhone 未直接验证。
