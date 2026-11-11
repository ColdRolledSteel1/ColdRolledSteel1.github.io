/* ==========================================================================
   assets/js/guestbook.js — 「留言」栏目
   --------------------------------------------------------------------------
   留言存在浏览器本地（localStorage），换设备 / 换浏览器看不到彼此的留言。
   想变成所有人共享，只需要把 core.js 里 Store 的 read / write 换成接口请求，
   这个文件不用动。
   ========================================================================== */

(function () {
  "use strict";

  var $ = App.$, el = App.el, Store = App.Store;
  var SITE = window.__SITE__ || {};

  var formEl = $("#gbForm");
  var nameEl = $("#gbName");
  var textEl = $("#gbText");
  var listEl = $("#gbList");
  var adminBtn = $("#gbAdmin");

  var ADMIN_FLAG = "guestbook-admin";

  /* ---------------------------------------------------------- 管理状态 */
  function password() {
    return (SITE.guestbook && SITE.guestbook.adminPassword) || "";
  }

  function isAdmin() {
    try {
      return window.sessionStorage.getItem(ADMIN_FLAG) === "1";
    } catch (e) {
      return false;
    }
  }

  function setAdmin(on) {
    try {
      if (on) window.sessionStorage.setItem(ADMIN_FLAG, "1");
      else window.sessionStorage.removeItem(ADMIN_FLAG);
    } catch (e) {
      /* 隐私模式下 sessionStorage 可能不可用，忽略即可 */
    }
  }

  /* ---------------------------------------------------------- 渲染 */
  function renderItem(msg) {
    var li = el("li");

    var head = el("div", "gb__head");
    var who = el("span");
    who.appendChild(el("span", "gb__name", msg.name || "匿名"));
    who.appendChild(document.createTextNode("　"));
    who.appendChild(el("span", null, App.relTime(msg.time || Date.now())));
    head.appendChild(who);

    if (isAdmin()) {
      var del = el("button", "linkbtn linkbtn--danger", "删除");
      del.type = "button";
      del.addEventListener("click", function () {
        if (!window.confirm("删除这条留言？")) return;
        Store.remove(msg.id);
        render();
      });
      head.appendChild(del);
    }

    li.appendChild(head);
    li.appendChild(el("p", "gb__text", msg.text || ""));
    return li;
  }

  function render() {
    listEl.innerHTML = "";
    Store.read().forEach(function (msg) {
      listEl.appendChild(renderItem(msg));
    });

    var on = isAdmin();
    if (adminBtn) {
      adminBtn.textContent = on ? "退出" : "管理";
      adminBtn.classList.toggle("is-on", on);
      adminBtn.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  /* ---------------------------------------------------------- 投递 */
  function submit(e) {
    e.preventDefault();

    var text = (textEl.value || "").trim();
    if (!text) {
      textEl.value = "";
      textEl.focus();
      return;
    }

    Store.add({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: (nameEl.value || "").trim().slice(0, 16) || "匿名",
      text: text.slice(0, 500),
      time: Date.now(),
    });

    textEl.value = "";
    render();
  }

  /* ---------------------------------------------------------- 管理入口 */
  function toggleAdmin() {
    if (isAdmin()) {
      setAdmin(false);
      render();
      return;
    }

    var pw = password();
    if (!pw) {
      setAdmin(true);
      render();
      return;
    }

    var input = window.prompt("密码");
    if (input === null) return;
    if (input === pw) {
      setAdmin(true);
      render();
    }
  }

  /* ---------------------------------------------------------- 初始化 */
  if (formEl && adminBtn) {
    formEl.addEventListener("submit", submit);
    adminBtn.addEventListener("click", toggleAdmin);
  }

  App.views.guestbook = {
    enter: function () {
      if (listEl) render();
    },
  };
})();
