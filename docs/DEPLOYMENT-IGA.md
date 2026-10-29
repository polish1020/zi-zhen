# IGA Pages 部署

- 项目：`zi-zhen`
- 项目 ID：`ei9p7c5x8t`
- 加速范围：中国大陆（`domestic`）
- 目标正式域名：`game.polishwb1020.com`
- 控制台：https://console.volcengine.com/dcdn/pages/detail/ei9p7c5x8t
- 域名注册及 DNS：用户的阿里云账号。

## 可重复部署

游戏源码以 `dist/` 为准。IGA CLI 的 ZIP 上传默认排除 `dist/**`，而 IGA 静态托管会把 `.mjs` 返回为 `binary/octet-stream`。因此上传前先生成一个独立的静态根目录，并把两个模块扩展名适配为 `.js`，同步替换 HTML 和 import 引用。游戏逻辑不变。

```sh
python3 scripts/prepare-iga.py
cd /workspace/deploy/zi-zhen-iga
VE_SKILL_ID=iga-pages/1.0.14 iga pages deploy --scope domestic --logs
```

脚本复用 `.iga/project.json` 中已有项目身份；不会新建项目。`.iga/` 不提交到版本库。若本机尚未关联项目，应先登录，再执行 `iga pages link --project ei9p7c5x8t`，不要重复创建同名项目。

此执行环境的 CLI 路径为 `/workspace/tools/iga/node_modules/.bin/iga`。当前版本 `1.1.15`。云端代理网络需要兼容 HTTPS CONNECT 的代理 agent；本次执行环境已对工具安装目录做适配，项目源码不依赖该修改。其他机器按其正常网络配置使用官方 CLI。

## 域名接入

IGA 的预览链接有时效且必须保留完整查询参数，不能作为长期正式域名。正式上线须完成：

1. 在 IGA 项目的域名管理中添加目标域名，核验备案状态。
2. 从控制台获取实际 TXT 主机记录和值，在阿里云 DNS 添加并完成所有权验证。不要使用文档中的示例验证值。
3. 域名绑定后获取实际 CNAME，在阿里云的 `polishwb1020.com` 解析区添加主机记录 `game`。
4. 配置匹配域名的 HTTPS 证书。
5. 验证 DNS、证书、游戏首页、模块 MIME 类型，以及实际建塔/战斗操作。

CNAME 或 TXT 如有已有记录，应先核对实际用途，保留其他站点与邮箱解析。当前未获得阿里云 DNS 写入权限；正式域名接入仍需用户配合。

## 本次发布结果

- 有效部署 ID：`k3bef510m1`
- 控制台部署记录：https://console.volcengine.com/dcdn/pages/detail/ei9p7c5x8t/deploy/k3bef510m1
- 发布成功，并通过真实线上 Chromium 验证：模块加载、组词建塔、扣费、迎战与暂停；JavaScript 运行错误为零。
- 首页及四个资源均返回 HTTP 200；两个 `.js` 模块的 Content-Type 为 `application/javascript`，线上文件与适配后的上传文件一致。
- `game.polishwb1020.com` 尚未完成绑定，不能视为已可访问。下一步需要 IGA 控制台生成的 TXT 验证记录及阿里云 DNS 配置。
