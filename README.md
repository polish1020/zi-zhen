# 字阵 WORDWARD

以字为兵，以词筑塔。原创中文组词塔防，纸墨与山河主题，浏览器单人游戏。v2 使用 16 张一次性随机字牌，支持 99 个 1—4 字配方和九大流派；墨点可用于建塔、升级或刷新手牌。手机进入游戏后使用单屏沉浸布局。

## 运行与测试

无构建步骤，无运行时依赖。需要 Node.js 20+ 运行逻辑测试；Python 3 可启动静态预览。

```sh
python3 -m http.server 4173 --directory dist
node --test tests/engine.test.mjs
```

浏览器回归使用 Playwright Core 与 Chromium。`tests/browser.cjs` 默认使用本执行环境已安装的模块路径与 Chromium 路径；其他环境请修改这两处路径，或安装 Playwright 后替换 require 为 `require('playwright')`。预览服务运行时执行 `node tests/browser.cjs`。

## 文件

- `dist/engine.mjs`：与页面分离的战斗引擎、词塔定义、路径、关卡、存档序列化。
- `dist/app.mjs`：Canvas 绘制、界面交互、音效、本地存档、弹窗与结算。
- `dist/style.css`：响应式纸墨主题。
- `dist/responsive.css`：基础响应式布局。
- `dist/gameplay.css`：随机字牌工坊和移动端单屏游戏界面。
- `dist/index.html`：语义化页面与可访问操作。
- `docs/DESIGN.md`：游戏规则、数值与技术设计。
- `docs/TESTING.md`：测试范围和验收结果。
- `.openai/hosting.json`：Sites 项目身份和静态托管配置。

## 发布

将精确提交推送到本项目配置的 Sites 源码仓库，打包 `.openai/hosting.json` 与 `dist/`，使用 Sites 保存版本并部署。部署保留网站当前的访问范围；新建站点默认为仅所有者可访问。客户端不需要账号、数据库或密钥。切勿把仓库临时写凭证写入源码或 Git 配置。

## 存档

使用当前域名下的 localStorage：`wordward-save-v1` 保存战局，`wordward-record-v1` 保存三章最佳星级。操作后、每 5 秒及离开页面时保存。刷新恢复进行中的战斗后先暂停。设置内可重开当前战局或确认后清除全部进度。浏览器清理数据、使用隐私模式或更换设备可能使存档不可用；没有云端同步。

## IGA Pages

本项目也已接入火山引擎 IGA Pages。后续更新请使用 `scripts/prepare-iga.py` 准备上传目录，再部署至已有项目；操作流程、平台适配与域名接入见 `docs/DEPLOYMENT-IGA.md`。

## Vercel

当前生产站点：https://game.polishwb1020.com ，默认地址 https://zi-zhen.vercel.app 也可访问。使用 `python3 scripts/prepare-vercel.py` 准备发布目录，既有项目标识、更新方法和线上验证结果见 `docs/DEPLOYMENT-VERCEL.md`。当前未关联 Git 自动部署。

## 移动应用准备

运行 `python3 scripts/prepare-mobile.py` 生成原生 WebView 可用的本地资源；Capacitor 配置已提供，封装步骤和边界见 `docs/MOBILE-APP.md`。当前没有生成 APK 或 iOS 安装包。
