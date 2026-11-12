/* ==========================================================================
   assets/js/main.js — 启动：按当前页面所属栏目调用对应模块
   --------------------------------------------------------------------------
   每个栏目现在是独立页面，<body data-view="..."> 由构建时的模板写上
   （home / novels / photos / contact / guestbook），这里只负责分发。
   ========================================================================== */

(function () {
  "use strict";

  function boot() {
    var name = document.body.getAttribute("data-view") || "";
    var view = App.views[name];

    if (view && typeof view.enter === "function") {
      view.enter();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
