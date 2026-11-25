/* Codiz — renders the "Our Partners" section from partners-data.js. */
(function () {
  "use strict";
  var list = window.CODIZ_PARTNERS;
  if (!Array.isArray(list) || !list.length) return;

  var mount = document.querySelector("[data-partners-mount]");
  if (!mount) return;

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(u) {
    return typeof u === "string" && /^https?:\/\//i.test(u.trim()) ? u.trim() : null;
  }

  mount.innerHTML = list.map(function (p) {
    var href = safeUrl(p.url);
    var inner =
      '<div class="prt-logo">' +
        '<img src="' + esc(p.logo) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async">' +
      "</div>" +
      '<span class="prt-name" dir="ltr">' + esc(p.name) + "</span>";

    if (href) {
      return '<a class="prt-card is-link rv" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(p.name) + '">' + inner + "</a>";
    }
    return '<div class="prt-card rv">' + inner + "</div>";
  }).join("");
})();
