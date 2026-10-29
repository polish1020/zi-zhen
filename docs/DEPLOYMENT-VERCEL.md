# Vercel 部署

当前生产站点：https://zi-zhen.vercel.app

- 备用正式别名：https://zi-zhen-changsheng.vercel.app
- 项目：`zi-zhen`，团队：`changsheng`
- 项目 ID：`prj_knArbjGsckakBpEb06lLwiWsHlyb`
- 团队 ID：`team_azaP3oGtfy4m7CDhqfxdNiLP`
- 生产部署 ID：`dpl_EAJHVXmYtdxX8hET4SiN4qXDEtDr`
- 本次部署地址：https://zi-zhen-7scsex09y-changsheng.vercel.app
- 发布时间：2026-10-29，状态：`READY`，环境：`production`
- 控制台：https://vercel.com/changsheng/zi-zhen

## 更新

源码仍以 `dist/` 为准，沿用已测试的 `.js` 静态发布格式。没有构建步骤、服务端、密钥或数据库。输出目录为 `public`，框架设置为 Other（`framework: null`）。

```sh
python3 scripts/prepare-vercel.py
```

生成目录默认为 `/workspace/deploy/zi-zhen-vercel`；可用 `--output` 指定其他路径。`.vercel/project.json` 仅保存既有项目和团队的标识，不含登录凭证。

本次通过用户授权的 Vercel 连接器上传六个文件（`vercel.json` 和五个 `public/` 文件），指定上述既有项目、团队及 `production` 环境。当前未连接 Git 仓库，因此提交代码不会自动部署。后续可继续通过连接器发布；或使用已登录同一账户且具有该团队权限的 Vercel CLI，在生成目录中运行 `vercel deploy --prod`。不要重复创建同名项目。

部署后须等待 `READY`，检查构建日志，并验证首页和模块资源及实际游戏操作。不要为通过测试而关闭项目访问保护。本次保留平台默认保护设置；下述匿名访问是发布当时的实际验证结果。

## 本次验证

- 未登录 HTTP 请求访问正式别名成功，首页及四个资源均为 HTTP 200。
- HTML、JavaScript、CSS、SVG 的 Content-Type 正确，线上五个文件的 SHA-256 均与上传文件一致。
- 独立 Chromium 浏览器访问正式别名：初始墨点 200，组合火球并建塔后为 140；可开始战斗、暂停；JavaScript 运行错误为零。
- 浏览器截图：`/workspace/shared/zi-zhen-vercel-live.png`。
- Vercel 构建日志完成，无构建错误。此发布是文件上传，没有对应的 Vercel Git 部署提交记录。

## 自定义域名

`game.polishwb1020.com` 尚未绑定到 Vercel，阿里云 DNS 未修改。若继续使用它，需先在此 Vercel 项目添加该域名，再依据 Vercel 实际返回的记录配置阿里云 DNS，并验证所有权、证书和页面访问。不要沿用其他托管平台的 CNAME，也不要修改无关解析。

旧域名上的 localStorage 存档不会自动迁移到 Vercel 域名。
