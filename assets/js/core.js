/* ==========================================================================
   assets/js/core.js — 公共工具、留言存储层、视图注册表
   --------------------------------------------------------------------------
   站点数据由构建时写入 window.__SITE__（见 theme/main.html）
   ========================================================================== */

(function (window, document) {
  "use strict";

  /** 选择器简写 */
  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /** 建节点：el("div", "cls", "文字") */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  /** 时间戳 → "刚刚 / 12 分钟前 / 昨天 / 3 天前" */
  function relTime(ts) {
    var diff = Date.now() - ts;
    if (diff < 60 * 1000) return "刚刚";
    if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + " 分钟前";
    if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + " 小时前";
    if (diff < 48 * 60 * 60 * 1000) return "昨天";
    if (diff < 7 * 24 * 60 * 60 * 1000) return Math.floor(diff / 86400000) + " 天前";
    var d = new Date(ts);
    var p = function (n) {
      return n < 10 ? "0" + n : String(n);
    };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  /* ------------------------------------------------------------------------
     留言存储层
     ------------------------------------------------------------------------
     目前用浏览器 localStorage 存，所以「只在自己这台电脑 / 这个浏览器里看得到」。
     以后接后端时，只要把 read / write 两个方法换成接口请求，
     其它代码（渲染、删除、校验）一行都不用改。
     ---------------------------------------------------------------------- */
  var Store = {
    key: function () {
      var site = window.__SITE__ || {};
      return (site.guestbook && site.guestbook.storageKey) || "guestbook-v1";
    },

    read: function () {
      try {
        var raw = window.localStorage.getItem(this.key());
        var list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
      } catch (e) {
        return [];
      }
    },

    write: function (list) {
      try {
        window.localStorage.setItem(this.key(), JSON.stringify(list));
        return true;
      } catch (e) {
        return false;
      }
    },

    add: function (entry) {
      var list = this.read();
      list.unshift(entry);
      // 只留最近 200 条，防止越存越大
      if (list.length > 200) list = list.slice(0, 200);
      return this.write(list); // 返回是否写入成功
    },

    remove: function (id) {
      var list = this.read().filter(function (m) {
        return m.id !== id;
      });
      this.write(list);
      return list;
    },
  };

  /* 视图注册表：各栏目模块往这里挂 enter()，main.js 按当前栏目调用 */
  var views = {};

  window.App = {
    $: $,
    $$: $$,
    el: el,
    relTime: relTime,
    Store: Store,
    views: views,
  };
})(window, document);
