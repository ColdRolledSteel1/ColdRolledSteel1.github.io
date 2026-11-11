/* ==========================================================================
   assets/js/photos.js — 「照片」栏目：格子 + 大图查看
   数据来自 docs/photos/ 里的图片（构建时写入 window.__PHOTOS__）
   ========================================================================== */

(function () {
  "use strict";

  var $ = App.$, el = App.el;
  var gridEl = $("#photoGrid");
  var data = (window.__PHOTOS__ || []).filter(function (item) {
    return item && item.src;
  });

  var built = false;
  var lb = $("#lightbox");
  var lbImg = $("#lbImg");
  var index = 0;
  var lastFocus = null;

  /* ------------------------------------------------ 大图 */
  function paint() {
    var item = data[index];
    if (!item) return;
    lbImg.src = item.src;
    lbImg.alt = item.title || "照片";
  }

  function openLightbox(i) {
    if (!data.length) return;
    index = i;
    lastFocus = document.activeElement;
    paint();
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    $("#lbClose").focus();
  }

  function closeLightbox() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(delta) {
    if (!data.length) return;
    index = (index + delta + data.length) % data.length;
    paint();
  }

  /* ------------------------------------------------ 渲染 */
  function build() {
    if (built || !gridEl) return;
    built = true;

    data.forEach(function (item, i) {
      var li = el("li");

      var btn = el("button", "photos__item");
      btn.type = "button";
      btn.setAttribute("aria-label", item.title || "查看照片");

      var img = el("img", "photos__img");
      img.src = item.src;
      img.alt = item.title || "照片";
      img.loading = "lazy";

      btn.appendChild(img);
      btn.addEventListener("click", function () {
        openLightbox(i);
      });

      li.appendChild(btn);
      gridEl.appendChild(li);
    });
  }

  /* ------------------------------------------------ 事件（只绑一次） */
  if (lb) {
    $("#lbClose").addEventListener("click", closeLightbox);
    $("#lbPrev").addEventListener("click", function () {
      step(-1);
    });
    $("#lbNext").addEventListener("click", function () {
      step(1);
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
  }

  App.views.photos = {
    enter: build,
  };
})();
