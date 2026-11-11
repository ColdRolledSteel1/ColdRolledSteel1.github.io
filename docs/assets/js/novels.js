/* ==========================================================================
   assets/js/novels.js — 「小说」栏目：只列标题，点标题展开正文
   数据来自 docs/novels/*.md（构建时写入 window.__NOVELS__）
   ========================================================================== */

(function () {
  "use strict";

  var $ = App.$, $$ = App.$$, el = App.el;
  var listEl = $("#novelList");
  var data = window.__NOVELS__ || [];
  var built = false;

  function closeOthers(keep) {
    $$(".novel", listEl).forEach(function (li) {
      if (li === keep) return;
      li.classList.remove("is-open");
      var link = $(".novel__link", li);
      if (link) link.setAttribute("aria-expanded", "false");
    });
  }

  function build() {
    if (built || !listEl) return;
    built = true;

    data.forEach(function (item) {
      var li = el("li", "novel");

      var link = el("a", "novel__link", item.title || "无题");
      link.href = "#";
      link.setAttribute("role", "button");
      link.setAttribute("aria-expanded", "false");

      var body = el("div", "novel__body");
      body.innerHTML = item.html || "";

      link.addEventListener("click", function (e) {
        e.preventDefault();
        var open = li.classList.toggle("is-open");
        link.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) closeOthers(li);
      });

      li.appendChild(link);
      li.appendChild(body);
      listEl.appendChild(li);
    });
  }

  App.views.novels = {
    enter: build,
  };
})();
