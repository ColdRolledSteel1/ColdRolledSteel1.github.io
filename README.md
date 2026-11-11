# 个人网站 · MkDocs 版

界面与功能跟改造前完全一致（2000 年代风格：左导航 + 深蓝标题条 + 白底正文），
只是把「一个 HTML + 一堆 JS 数据文件」换成了 MkDocs 工程：
**写 Markdown 就能出页面，样式和脚本不动。**

---

## 一、怎么跑起来

需要 Python 3.9 以上。

```bash
pip install -r requirements.txt     # 装 MkDocs（只有这一个依赖）
mkdocs serve                        # 本地预览：http://127.0.0.1:8000
mkdocs build                        # 生成静态站点到 site/
```

`mkdocs serve` 会盯着文件改动自动刷新，改完 Markdown 或 CSS 不用手动构建。

> 和旧版的一个区别：旧版双击 `index.html` 就能看；MkDocs 生成的是多页面站点，
> 需要用 `mkdocs serve`（或任意静态服务器）打开，`site/` 目录里的文件不建议直接双击。

---

## 二、目录结构

```
mkdocs.yml                 站点配置：名字、导航、主题、插件
requirements.txt           依赖（mkdocs）
hooks.py                   构建钩子：把下面这些内容汇总成页面数据
theme/main.html            整站唯一的模板（左导航 + 标题条 + 正文 + 大图查看）
docs/
  index.md                 首页
  novels/
    index.md               小说列表页
    潮汐图书馆.md           一篇小说 = 一个 md 文件（可继续加）
  photos/
    index.md               照片页
    01.jpg ~ 08.jpg        照片 = 目录里的图片文件
  contact.md               联系页
  guestbook.md             留言页
  site.yml                 邮箱 / 微信 / 留言密码
  gallery.yml              首页「照片 + 小诗」仓库
  assets/
    css/                   base · layout · components · pages
    js/                     core · hero · novels · photos · contact · guestbook · main
    img/hero/              首页照片
site/                      构建产物（每次 build 重新生成，不用管，也别手改）
```

内容、样式、脚本、模板四层是分开的：**改内容基本只需要动 `docs/` 里的 md 和 yml。**

---

## 三、日常怎么改

### 1. 加一篇小说

在 `docs/novels/` 新建一个 `.md`，文件名就是网址（`夜航.md` → `/novels/夜航/`）：

```markdown
---
title: 小说的标题
order: 4
---

第一段，段与段之间空一行。

第二段。**加粗**、*斜体*、链接都照常用。
```

- `title` 显示在列表里；不写就用文件名。
- `order` 决定排序（小的在前）；不写就排在最后。
- 列表页只显示标题，点标题展开正文 —— 和原来一样。
- 额外收获：每篇小说现在还有自己的网址，可以直接发给别人。

### 2. 加照片

把图片丢进 `docs/photos/` 就行，按文件名排序（想调顺序就改名，比如 `09-海边.jpg`）。
点开看大图、左右切换、ESC 关闭，都是原来的逻辑。

### 3. 加首页「照片 + 小诗」

1. 照片放进 `docs/assets/img/hero/`；
2. 在 `docs/gallery.yml` 里加一条：

```yaml
- image: assets/img/hero/09.jpg
  alt: 照片的无障碍描述
  poem: |
    第一行
    第二行
```

首页每次打开随机取一条，点照片换下一条。

### 4. 改邮箱 / 微信 / 留言密码

`docs/site.yml`：

```yaml
email: wangxinbo@example.com
wechat: wxid_xinbo2026
guestbook:
  storage_key: guestbook-v1
  admin_password: aero      # 点「管理」要输入的密码
```

### 5. 改名字

`mkdocs.yml` 里的 `site_name`。标题条、页面标题、导航都会跟着变。

### 6. 改导航

`mkdocs.yml` 的 `nav:`，一行一项。顺序就是左侧显示的顺序。

### 7. 改配色 / 字号 / 页面宽度

`docs/assets/css/base.css` 顶部的 `:root`：

| 变量 | 含义 |
| --- | --- |
| `--page` | 页面灰底 |
| `--paper` | 正文白底 |
| `--navy` / `--navy-hover` | 标题条与导航的深蓝 |
| `--link` | 链接蓝 |
| `--font-body` / `--font-head` | 正文与标题字体 |
| `--page-w` | 页面最大宽度（默认 `1400px`） |
| `--side-w` | 左侧导航宽度（默认 `180px`） |

首页照片与小诗框的宽度在 `docs/assets/css/pages.css` 的 `.hero__img` 与 `.hero__poem`。

### 8. 改版式结构

`theme/main.html` 是唯一的模板，四个栏目的骨架都在里面（按 `section` 分支）。
新增一个栏目大致是：加 `docs/xxx.md` → 在 `mkdocs.yml` 的 `nav` 加一行 → 在
`theme/main.html` 加一个 `{% if section == 'xxx' %}` 分支。`hooks.py` 里的
`_section()` 会按文件位置自动认栏目。

---

## 四、这套工程是怎么搭的

MkDocs 本身是「Markdown → HTML」的生成器，本站的数据流是：

```
docs/novels/*.md ─┐
docs/photos/*.jpg ─┤
docs/gallery.yml  ─┼→ hooks.py（on_page_context）─→ theme/main.html ─→ site/
docs/site.yml     ─┘        汇总成 Python 数据        写进 window.__XXX__
                                                      → assets/js/*.js 渲染
```

`hooks.py` 干四件事，都在 `on_page_context()` 里：

1. 读 `docs/site.yml` → 邮箱、微信、留言板配置；
2. 读 `docs/gallery.yml` → 首页照片 + 小诗；
3. 扫 `docs/novels/*.md` → 标题、排序、正文（用和站点一致的 Markdown 配置渲染成 HTML）；
4. 扫 `docs/photos/` 的图片 → 照片列表。

结果塞进模板上下文，模板再写成 `window.__SITE__`、`__GALLERY__`、`__PHOTOS__`、
`__NOVELS__` 四个变量，前端脚本只读这些变量。所以**加内容不用改 JS，也不用改 HTML。**

前端脚本与旧版几乎一致，只改了三处：数据源换成上面四个变量、`main.js` 从
「hash 路由」改成「按 `body[data-view]` 调对应模块」、各模块加了「元素不存在就跳过」的判断。

---

## 五、留言板（限制没变）

留言存在访客浏览器的 `localStorage` 里，所以**只有同一台电脑、同一个浏览器能看到同一批留言**，
访客之间不互通。这是纯静态站点的固有限制，MkDocs 不会替它解决。

要真正让所有人共享，两条路：

- 换现成评论服务（Waline、Twikoo、Giscus），把 `docs/assets/js/guestbook.js` 里
  `App.Store.read / add / remove` 换成接口调用；
- 自己写个小后端（比如几行 Flask + SQLite），同样只改 `App.Store` 那三个方法。

另外「管理」密码是纯前端的，只能挡住随手点击的人，不是真正的权限控制。

---

## 六、发布到 GitHub Pages

已配置好自动化：**push 到 `main` 分支 → GitHub Actions 自动构建 → 发布到 `gh-pages` 分支 → Pages 从该分支出站**。

```
.github/workflows/ci.yml    工作流定义
```

**仓库**：https://github.com/ColdRolledSteel1/github.io
**网址**：https://coldrolledsteel1.github.io/github.io/

### 日常发布流程

```bash
git add -A
git commit -m "更新照片"
git push
```

push 之后打开仓库的 Actions 页面能看到「构建并发布站点」在跑，跑完约 1–2 分钟。
不需要手动 `mkdocs gh-deploy`，也不需要本地构建。

### 首次需要手动做一次设置

仓库 → **Settings → Pages → Build and deployment**：

| 项 | 值 |
|---|---|
| Source | **Deploy from a branch**（不要选 GitHub Actions） |
| Branch | **gh-pages** |
| Folder | **/ (root)** |

保存后等第一次工作流跑完，网址即生效。

### 为什么主题不是 mkdocs-material

本站版式全部写在 `theme/main.html`，配置里是 `theme: {name: null, custom_dir: theme}`，
Material 不参与渲染，所以工作流只装 `requirements.txt` 里的 `mkdocs`。

### 手动构建 / 其他托管

```bash
mkdocs build          # 产物在 site/，可直接上传到任意静态托管
```

`use_directory_urls: true`（默认）意味着网址是 `/novels/` 这种形式，不需要 `.html` 后缀。
`site/` 是构建产物，不进版本库，已在 `.gitignore` 排除；`__pycache__/` 同理。
