# BG2HHW Django 学习版

这是个人主页的 Django 版本。它复用现有前端样式和交互，同时把整站内容放进 Django 模型，通过 Django Admin 管理。

## 启动

```powershell
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py seed_site
python manage.py runserver
```

访问：

- 主页：`http://127.0.0.1:8000/`
- 动态页：`http://127.0.0.1:8000/moments/`
- 管理后台：`http://127.0.0.1:8000/admin/`

本地超级用户名为 `bg2hhw`。密码是之前设置的站点后台密码，可用下面的命令修改：

```powershell
python manage.py changepassword bg2hhw
```

## 可以修改什么

Django Admin 中提供：

- **站点设置**：SEO、呼号、QTH、GRID、首屏文字、各栏目标题和 QSL 文案
- **作品**：项目卡片、标签、视觉类型、图片与画廊
- **札记**：日期、标签、正文和关联操作
- **现在卡片**：正在做、正在学和正在听
- **联系链接**：Bilibili、GitHub、QRZ 等
- **动态**：按表单新增、编辑、发布或隐藏

保存后刷新主页或动态页即可看到改动。

## 关键文件

```text
config/settings.py         Django 设置
config/urls.py             URL 入口
siteapp/models.py          内容模型
siteapp/admin.py           Admin 配置
siteapp/views.py           页面与 JSON API
siteapp/templates/         HTML 模板
siteapp/management/commands/seed_site.py
```

页面仍然使用父目录的 `css/styles.css`、`js/main.js` 和 `js/moments.js`，Django 通过 `STATICFILES_DIRS` 把这些文件映射到 `/static/`。

## 数据流

1. `home` 视图从模型生成兼容现有前端的 JSON 内容。
2. 模板通过 `json_script` 把初始内容交给 JavaScript。
3. JavaScript 立即渲染页面，再从 `/api/site/` 同步最新数据库内容。
4. 动态页通过 `/api/moments/` 获取已发布的动态。

## 当前限制

- 使用 SQLite，适合本地学习和单机开发。
- 正式上线应改用 PostgreSQL、关闭 `DEBUG`、设置安全的 `DJANGO_SECRET_KEY`，并使用 Gunicorn/uWSGI 和 Nginx。
- 图片目前填写路径或 URL，尚未接入 Django 文件上传表单。

