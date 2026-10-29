# 字阵 WORDWARD

以字为兵，以词筑塔。原创中文组词塔防，纸墨与山河主题，浏览器单人游戏。

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
- `dist/index.html`：语义化页面与可访问操作。
- `docs/DESIGN.md`：游戏规则、数值与技术设计。
- `docs/TESTING.md`：测试范围和验收结果。
- `.openai/hosting.json`：Sites 项目身份和静态托管配置。

## 发布

将精确提交推送到本项目配置的 Sites 源码仓库，打包 `.openai/hosting.json` 与 `dist/`，使用 Sites 保存版本并部署。部署保留网站当前的访问范围；新建站点默认为仅所有者可访问。客户端不需要账号、数据库或密钥。切勿把仓库临时写凭证写入源码或 Git 配置。

## 存档

使用当前域名下的 localStorage：`wordward-save-v1` 保存战局，`wordward-record-v1` 保存三章最佳星级。操作后、每 5 秒及离开页面时保存。刷新恢复进行中的战斗后先暂停。设置内可重开当前战局或确认后清除全部进度。浏览器清理数据、使用隐私模式或更换设备可能使存档不可用；没有云端同步。
