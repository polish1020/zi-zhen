# Vercel 部署

当前生产站点：https://game.polishwb1020.com

Vercel 默认地址：https://zi-zhen.vercel.app

- 备用正式别名：https://zi-zhen-changsheng.vercel.app
- 项目：`zi-zhen`，团队：`changsheng`
- 项目 ID：`prj_knArbjGsckakBpEb06lLwiWsHlyb`
- 团队 ID：`team_azaP3oGtfy4m7CDhqfxdNiLP`
- 生产部署 ID：`dpl_HGjaTFvcgAjWw7NcSGdNc8bQENUU`
- 本次部署地址：https://zi-zhen-ooz5a3g9q-changsheng.vercel.app
- 发布时间：2026-10-29，状态：`READY`，环境：`production`
- 控制台：https://vercel.com/changsheng/zi-zhen

## 更新

源码仍以 `dist/` 为准，沿用已测试的 `.js` 静态发布格式。没有构建步骤、服务端、密钥或数据库。输出目录为 `public`，框架设置为 Other（`framework: null`）。

```sh
python3 scripts/prepare-vercel.py
```

生成目录默认为 `/workspace/deploy/zi-zhen-vercel`；可用 `--output` 指定其他路径。`.vercel/project.json` 仅保存既有项目和团队的标识，不含登录凭证。

本次通过用户授权的 Vercel 连接器上传七个文件（`vercel.json` 和六个 `public/` 文件，包含 `responsive.css`），指定上述既有项目、团队及 `production` 环境。当前未连接 Git 仓库，因此提交代码不会自动部署。后续可继续通过连接器发布；或使用已登录同一账户且具有该团队权限的 Vercel CLI，在生成目录中运行 `vercel deploy --prod`。不要重复创建同名项目。

部署后须等待 `READY`，检查构建日志，并验证首页和模块资源及实际游戏操作。不要为通过测试而关闭项目访问保护。本次保留平台默认保护设置；下述匿名访问是发布当时的实际验证结果。

## 本次验证

- 未登录 HTTPS 请求访问自定义域名成功，首页及五个资源均为 HTTP 200，线上六个文件与上传文件逐字节一致，Content-Type 正确。
- 自适应布局源码提交：`3951de3746fd5d1d4472ec79108102788a1427c5`。
- 独立 Chromium 访问自定义域名，通过七种尺寸的响应式和真实触屏输入回归；包含选字建造、升级、无键盘取消放置、战斗暂停、弹窗及横竖屏切换。JavaScript 运行错误为零。
- 浏览器截图：`/workspace/shared/zi-zhen-responsive-390.png`、`/workspace/shared/zi-zhen-responsive-1440.png`。
- Vercel 构建输出耗时 45ms，从 buildingAt 至 ready 约 1.8 秒。
- Vercel 构建日志完成，无构建错误。此发布是文件上传，没有对应的 Vercel Git 部署提交记录。

## 自定义域名

2026-10-29 已将 `game.polishwb1020.com` 绑定到该项目的生产环境，Vercel 返回 `verified: true`，DNS 配置检查 `misconfigured: false`。没有设置重定向。

复用用户在阿里云已有的泛域名解析，没有修改 DNS。公共 DNS 查询显示该子域名 CNAME 指向 `e6fc46e6b7fd7c8f.vercel-dns-017.com`。此记录是发布当时的实际解析值，后续如需修改应重新获取 Vercel 的要求。

已使用独立 Chromium 通过该域名的 HTTPS 地址完成模块加载、建塔扣费、战斗和暂停测试，JavaScript 运行错误为零。首页、两个 JavaScript 模块、两份 CSS 和 SVG 均返回 HTTP 200，与上传文件一致；未绕过证书校验。

旧域名上的 localStorage 存档不会自动迁移到 Vercel 域名。
