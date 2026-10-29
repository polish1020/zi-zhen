# Vercel 部署

当前生产站点：https://game.polishwb1020.com

Vercel 默认地址：https://zi-zhen.vercel.app

- 备用正式别名：https://zi-zhen-changsheng.vercel.app
- 项目：`zi-zhen`，团队：`changsheng`
- 项目 ID：`prj_knArbjGsckakBpEb06lLwiWsHlyb`
- 团队 ID：`team_azaP3oGtfy4m7CDhqfxdNiLP`
- 生产部署 ID：`dpl_EYfTUQue6bZUBP1FdjW98V3b4EGF`
- 本次部署地址：https://zi-zhen-bckm47grn-changsheng.vercel.app
- 发布时间：2026-10-29，状态：`READY`，环境：`production`
- 控制台：https://vercel.com/changsheng/zi-zhen

## 更新

源码仍以 `dist/` 为准，沿用已测试的 `.js` 静态发布格式。没有构建步骤、服务端、密钥或数据库。输出目录为 `public`，框架设置为 Other（`framework: null`）。

```sh
python3 scripts/prepare-vercel.py
```

生成目录默认为 `/workspace/deploy/zi-zhen-vercel`；可用 `--output` 指定其他路径。`.vercel/project.json` 仅保存既有项目和团队的标识，不含登录凭证。

本次通过用户授权的 Vercel 连接器上传九个文件（`vercel.json` 和八个 `public/` 文件，包含三份 CSS 和 Web App Manifest），指定上述既有项目、团队及 `production` 环境。当前未连接 Git 仓库，因此提交代码不会自动部署。后续可继续通过连接器发布；或使用已登录同一账户且具有该团队权限的 Vercel CLI，在生成目录中运行 `vercel deploy --prod`。不要重复创建同名项目。

部署后须等待 `READY`，检查构建日志，并验证首页和模块资源及实际游戏操作。不要为通过测试而关闭项目访问保护。本次保留平台默认保护设置；下述匿名访问是发布当时的实际验证结果。

## 本次验证

- 未登录 HTTPS 请求访问自定义域名成功，首页及七个资源均为 HTTP 200，线上八个文件与上传文件逐字节一致，Content-Type 正确。
- v2 随机字牌和单屏布局源码提交：`e6ffde5358d73d470a3631b1357474acdf962c96`。
- 独立 Chromium 访问自定义域名，通过十种尺寸的单屏响应式和触屏输入回归；包含一次性字牌、取消不扣牌、建塔扣费、淬炼、付费刷新、刷新网页保持原牌与价格、暂停恢复、词典筛选及横竖屏切换。完整浏览器流程（含四字初始 4 级、结算、下一章和失败重试）亦通过。JavaScript 运行错误为零。
- 浏览器截图：`/workspace/shared/zi-zhen-v2-390-forge.png`、`/workspace/shared/zi-zhen-v2-1440-battle.png`。
- Vercel 构建输出耗时 35ms，从 buildingAt 至 ready 约 1.6 秒。
- Vercel 构建日志完成，无构建错误。此发布是文件上传，没有对应的 Vercel Git 部署提交记录。

## 自定义域名

2026-10-29 已将 `game.polishwb1020.com` 绑定到该项目的生产环境，Vercel 返回 `verified: true`，DNS 配置检查 `misconfigured: false`。没有设置重定向。

复用用户在阿里云已有的泛域名解析，没有修改 DNS。公共 DNS 查询显示该子域名 CNAME 指向 `e6fc46e6b7fd7c8f.vercel-dns-017.com`。此记录是发布当时的实际解析值，后续如需修改应重新获取 Vercel 的要求。

已使用独立 Chromium 通过该域名的 HTTPS 地址完成模块加载、建塔扣费、战斗和暂停测试，JavaScript 运行错误为零。首页、两个 JavaScript 模块、三份 CSS、Web App Manifest 和 SVG 均返回 HTTP 200，与上传文件一致；未绕过证书校验。

旧域名上的 localStorage 存档不会自动迁移到 Vercel 域名。

## 原生封装准备

`python3 scripts/prepare-mobile.py` 生成本地资源包，已使用独立浏览器验证仅请求本地资源时可选字、建塔并战斗。Capacitor 配置和待办见 `MOBILE-APP.md`。尚未生成原生安装包。

## 取消默认答案提示

工坊已移除自动展示的可组词及其快捷按钮，玩家自行选择字牌。词典仍需主动打开。十种尺寸本地布局回归与线上完整游戏流程通过；首页、脚本和玩法样式与本次上传一致，均不包含自动提示元素。
