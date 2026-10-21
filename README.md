# BG2HHW · 动态个人主页

个人主页使用 Cloudflare Pages 托管，动态内容通过 Pages Functions 和 D1 数据库读取。

## 功能

- 首页、作品、QSL、札记和联系页面
- 舒展 / 紧凑布局、深色 / 浅色主题
- `/moments/` 动态页从 D1 数据库读取内容
- `/admin/` 后台登录后可新增、编辑、发布、隐藏和删除动态
- API 不可用时动态页自动使用 `js/moments-data.js` 中的静态内容

## 本地开发

首次运行：

```powershell
npm run db:migrate:local
npm run dev
```

访问：

- 网站：`http://127.0.0.1:8788/`
- 后台：`http://127.0.0.1:8788/admin/`
- 动态页：`http://127.0.0.1:8788/moments/`

本地开发密码在 `package.json` 的 `dev` 命令中，仅供本机测试。

## 云上初始化

先登录 Cloudflare：

```powershell
wrangler login
```

创建 D1 数据库：

```powershell
wrangler d1 create bg2hhw-moments
```

把返回的 `database_id` 写入 `wrangler.toml`，然后执行：

```powershell
npm run db:migrate:remote
```

创建 Pages 项目与后台密钥：

```powershell
wrangler pages project create bg2hhw-site --production-branch main
wrangler pages secret put ADMIN_PASSWORD --project-name bg2hhw-site
wrangler pages secret put SESSION_SECRET --project-name bg2hhw-site
```

`SESSION_SECRET` 应使用至少 32 位的随机字符串。最后部署：

```powershell
npm run deploy
```

部署到 `pages.dev` 并验证无误后，再把 `bg2hhw.top` 切换到 Cloudflare Pages。不要在验证前删除现有 DNS 记录。

## 内容结构

- 静态页面内容：`js/content.js`
- 动态页本地回退数据：`js/moments-data.js`
- D1 数据库迁移：`migrations/`
- 后台页面：`admin/index.html`、`js/admin.js`、`css/admin.css`
- API：`functions/api/`
- Cloudflare 配置：`wrangler.toml`

后台目前通过图片 URL 引用图片。把图片放进 `assets/moments/` 或填写完整 HTTPS 地址即可。

