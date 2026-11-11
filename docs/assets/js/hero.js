/* ==========================================================================
   assets/js/hero.js — 首页：随机取「照片 + 小诗」，点击换下一张
   数据来自 docs/gallery.yml（构建时写入 window.__GALLERY__）
   ========================================================================== */

(function () {
  "use strict";

  var $ = App.$;
  var data = (window.__GALLERY__ || []).filter(function (item) {
    return item && item.src;
  });

  var btn = $("#hero");
  var img = $("#heroImg");
  var poem = $("#heroPoem");
  var current = -1;

  /** 随机挑一个和当前不同的下标 */
  function pickDifferent(exclude) {
    if (data.length === 0) return -1;
    if (data.length === 1) return 0;
    var i = exclude;
    var guard = 0;
    while (i === exclude && guard < 40) {
      i = Math.floor(Math.random() * data.length);
      guard++;
    }
    return i === exclude ? (exclude + 1) % data.length : i;
  }

  function show(index) {
    var item = data[index];
    if (!item) return;
    img.src = item.src;
    img.alt = item.alt || "照片";
    poem.textContent = item.poem || "";
    current = index;
  }

  function init() {
    if (!data.length || !btn) return;

    // 每次打开随机一条
    show(Math.floor(Math.random() * data.length));

    btn.addEventListener("click", function () {
      show(pickDifferent(current));
    });

    // 空闲时预加载，点击时不会白一下
    window.setTimeout(function () {
      data.forEach(function (item) {
        var pre = new Image();
        pre.src = item.src;
      });
    }, 300);
  }

  App.views.home = { enter: init };
})();
