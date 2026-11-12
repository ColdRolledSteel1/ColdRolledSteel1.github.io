/* ==========================================================================
   assets/js/contact.js — 「联系」栏目：邮箱与微信
   数据来自 docs/site.yml（构建时写入 window.__SITE__）
   ========================================================================== */

(function () {
  "use strict";

  var $ = App.$, el = App.el;
  var cardEl = $("#contactCard");
  var SITE = window.__SITE__ || {};
  var built = false;

  function row(label, value, href) {
    var wrap = el("div", "contact__row");
    wrap.appendChild(el("dt", "contact__label", label));

    var dd = el("dd", "contact__value");
    if (href && value) {
      var a = el("a", null, value);
      a.href = href + value;
      dd.appendChild(a);
    } else {
      dd.textContent = value || "";
    }

    wrap.appendChild(dd);
    return wrap;
  }

  function build() {
    if (built || !cardEl) return;
    built = true;

    cardEl.appendChild(row("邮箱", SITE.email, "mailto:"));
    cardEl.appendChild(row("微信", SITE.wechat));
  }

  App.views.contact = {
    enter: build,
  };
})();
