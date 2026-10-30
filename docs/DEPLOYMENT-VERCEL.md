# Vercel 生产发布

正式地址：https://game.polishwb1020.com

默认地址：https://zi-zhen.vercel.app

- 团队：`changsheng`，ID `team_azaP3oGtfy4m7CDhqfxdNiLP`
- 项目：`zi-zhen`，ID `prj_knArbjGsckakBpEb06lLwiWsHlyb`
- 生产部署：`dpl_rtaSiZ8msYVaBw8MLoSPBuG9pP8p`
- 部署地址：https://zi-zhen-qgasyyhd8-changsheng.vercel.app
- 生产源码提交：`6ba57ff1ce0a0b80a6a5d18a4267e05c96735773`
- 发布时间：2026-10-30；状态 `READY`，环境 `production`
- 框架：静态站点，`framework: null`，输出 `public`，无安装/构建依赖。
- Vercel 输出构建 50ms；从 buildingAt 到 ready 约 1.8 秒；日志无构建错误。
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
- 线上 `tests/expansion.cjs` 通过：冰霜箭建造、毒云搜索、解锁涨价、手势保护、固定波次计时及叠波、六十六类怪物与周期 Boss 实际出场。
- 线上 `tests/campaign.cjs` 验证十章主题与入口、四十二种 Boss、24 种普通怪轮廓、各章特色兵说明、属性详情、音效静音、升级和提示栏。
- 线上 `tests/pause.cjs` 验证四种尺寸暂停布阵与时钟冻结、继续后的定时出波。
- 线上 `tests/word-traits.cjs` 验证毒箭与毒云不同词意、数值、区域和存档；`tests/endless-bosses.cjs` 验证密集无尽 Boss 的预告、出场和数量显示。
- 线上 `tests/word-meanings.cjs` 验证四种尺寸下的 39 类词义筛选与索引、组合词标识、成语精确解释、重生次数、距离词面板；最终精确词义修订后重跑该流程和基本游戏流程。
- 测试期间 JavaScript 运行错误为零；数值平衡和规则测试见 `TESTING.md`。

## 域名与原生资源

`game.polishwb1020.com` 已绑定生产项目并验证，复用阿里云原有泛域名解析，本次未修改 DNS。HTTPS 和匿名访问正常。注册商仍为阿里云，无需转移域名。

`python3 scripts/prepare-mobile.py` 生成包含词库和许可的本地资源包。该包与本次公开部署资源逐字节一致。Capacitor 配置和尚未完成的原生签名/构建事项见 `MOBILE-APP.md`；当前未生成安装包。
