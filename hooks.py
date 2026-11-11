"""
hooks.py — 构建时汇总内容，交给模板
==========================================================================
MkDocs 每次构建（mkdocs serve / mkdocs build）都会对每个页面调用
on_page_context()。这里趁这个机会读一遍内容文件：

    docs/site.yml        邮箱 / 微信 / 留言板设置
    docs/gallery.yml     首页「照片 + 小诗」仓库
    docs/novels/*.md     小说（一篇一个文件，按 order 排序）
    docs/photos/*.jpg    照片（一个文件一张，按文件名排序）

把结果塞进模板上下文，theme/main.html 再写进 window.__SITE__ /
__GALLERY__ / __PHOTOS__ / __NOVELS__ 这几个变量，前端脚本只读这些变量。
==========================================================================
"""

import os
import re

import markdown
import yaml

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}

# 文章开头 --- ... --- 之间的元信息
FRONT_MATTER = re.compile(r"\A---\s*\n(.*?)\n---[ \t]*(?:\n|\Z)", re.S)


def _load_yaml(path, default):
    """读一个 YAML 文件，缺文件或内容为空时返回 default。"""
    try:
        with open(path, encoding="utf-8") as handle:
            data = yaml.safe_load(handle)
    except (FileNotFoundError, yaml.YAMLError):
        return default
    return default if data is None else data


def _split_front_matter(text):
    """拆出 (元信息 dict, 正文)。没有元信息时返回 ({}, 原文)。"""
    match = FRONT_MATTER.match(text)
    if not match:
        return {}, text
    data = _load_yaml_text(match.group(1))
    return data, text[match.end():]


def _load_yaml_text(text):
    try:
        data = yaml.safe_load(text)
    except yaml.YAMLError:
        return {}
    return data if isinstance(data, dict) else {}


def _order(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return 9999.0


def _read_gallery(docs_dir):
    """首页仓库：一条 = 一张照片 + 一首小诗。"""
    raw = _load_yaml(os.path.join(docs_dir, "gallery.yml"), [])
    if not isinstance(raw, list):
        return []
    items = []
    for entry in raw:
        if not isinstance(entry, dict) or not entry.get("image"):
            continue
        items.append({
            "src": str(entry["image"]).replace("\\", "/").lstrip("/"),
            "alt": str(entry.get("alt") or "照片"),
            "poem": str(entry.get("poem") or "").strip(),
            "open": False,
        })
    return items


def _read_photos(docs_dir):
    """照片：docs/photos/ 里的图片，按文件名排序（想调整顺序就改文件名）。"""
    folder = os.path.join(docs_dir, "photos")
    if not os.path.isdir(folder):
        return []
    items = []
    for name in sorted(os.listdir(folder)):
        stem, ext = os.path.splitext(name)
        if ext.lower() not in IMAGE_EXT or name.startswith("."):
            continue
        items.append({
            "src": "photos/" + name,
            "title": stem,
        })
    return items


def _read_novels(docs_dir, markdown_extensions):
    """小说：docs/novels/ 里除 index.md 之外的每个 .md 文件算一篇。"""
    folder = os.path.join(docs_dir, "novels")
    if not os.path.isdir(folder):
        return []

    converter = markdown.Markdown(extensions=markdown_extensions)
    items = []
    for name in sorted(os.listdir(folder)):
        if not name.endswith(".md") or name == "index.md":
            continue
        with open(os.path.join(folder, name), encoding="utf-8") as handle:
            meta, body = _split_front_matter(handle.read())
        converter.reset()
        items.append({
            "title": str(meta.get("title") or os.path.splitext(name)[0]),
            "order": _order(meta.get("order")),
            "html": converter.convert(body),
        })

    items.sort(key=lambda item: (item["order"], item["title"]))
    return items


def _read_site(docs_dir, site_name):
    """站点信息：邮箱、微信、留言板设置。"""
    site = _load_yaml(os.path.join(docs_dir, "site.yml"), {})
    if not isinstance(site, dict):
        site = {}

    guestbook = site.get("guestbook")
    if not isinstance(guestbook, dict):
        guestbook = {}

    return {
        "name": site_name,
        "email": str(site.get("email") or ""),
        "wechat": str(site.get("wechat") or ""),
        "guestbook": {
            "storageKey": str(guestbook.get("storage_key") or "guestbook-v1"),
            "adminPassword": str(guestbook.get("admin_password") or ""),
        },
    }


def _section(page):
    """判断当前页面属于哪个栏目：home / novels / photos / contact / guestbook。"""
    meta = page.meta or {}
    if meta.get("view"):
        return str(meta["view"])

    uri = page.file.src_uri
    if uri == "index.md":
        return "home"
    for name in ("novels", "photos", "contact", "guestbook"):
        if uri == name + ".md" or uri.startswith(name + "/"):
            return name
    return "home"


def on_page_context(context, *, page, config, nav, **kwargs):
    docs_dir = config["docs_dir"]
    # base_url 是当前页面到站点根目录的相对前缀（首页 "./"，"/novels/" 是 "../"）
    base_url = context.get("base_url") or "./"
    if not base_url.endswith("/"):
        base_url += "/"

    gallery = _read_gallery(docs_dir)
    photos = _read_photos(docs_dir)
    novels = _read_novels(docs_dir, config["markdown_extensions"])

    # 图片路径补上当前页面的前缀，脚本里拿到就能直接用
    for item in gallery:
        item["src"] = base_url + item["src"]
    for item in photos:
        item["src"] = base_url + item["src"]

    context["section"] = _section(page)
    context["site_data"] = _read_site(docs_dir, config["site_name"])
    context["gallery"] = gallery
    context["photo_list"] = photos
    context["novel_list"] = novels
    return context
