/* Codiz — renders quiz cards on quizzes.html from quizzes-data.js and wires mobile nav + scroll reveal. */
(function () {
  "use strict";
  var Q = window.CODIZ_QUIZZES;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function quizCard(q) {
    var soon = q.status === "coming_soon";
    var meta = Array.isArray(q.meta) && q.meta.length
      ? '<div class="fl qz-meta">' + q.meta.map(function (m) { return "<span>" + esc(m) + "</span>"; }).join("") + "</div>"
      : "";
    var highlights = Array.isArray(q.highlights) && q.highlights.length
      ? '<ul class="qz-list">' + q.highlights.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + "</ul>"
      : "";
    var cta = soon || !q.href
      ? '<span class="btn is-disabled" aria-disabled="true">' + esc(q.ctaLabel || "قريبًا") + "</span>"
      : '<a class="btn" href="' + esc(q.href) + '">' + esc(q.ctaLabel || "ابدأ الاختبار الآن") + ' <span aria-hidden="true">←</span></a>';

    return '<article class="card qz-card' + (soon ? " soon" : " free") + ' rv">' +
      '<div class="qz-top">' +
        '<div class="ic" style="background:var(--' + esc(q.tone || "blush") + ')">' + esc(q.icon || "🎯") + "</div>" +
        '<div class="qz-badges">' +
          (q.category ? '<span class="ev-tag paid" dir="ltr">' + esc(q.category) + "</span>" : "") +
          '<span class="ev-tag ' + (soon ? "" : "free") + '">' + esc(q.badge || (soon ? "قريبًا" : "مجاني")) + "</span>" +
        "</div>" +
      "</div>" +
      "<h3>" + esc(q.title) + "</h3>" +
      (q.subtitle ? '<div class="sub">' + esc(q.subtitle) + "</div>" : "") +
      '<p class="d">' + esc(q.description) + "</p>" +
      highlights +
      meta +
      '<div class="qz-foot">' +
        '<span class="ev-status ' + (soon ? "done" : "up") + '">' + (soon ? "قريبًا" : "متاح الآن") + "</span>" +
        cta +
      "</div>" +
    "</article>";
  }

  function mount() {
    var root = $("[data-qz-mount]");
    if (!root || !Array.isArray(Q) || !Q.length) return;
    root.innerHTML = Q.map(quizCard).join("");
  }

  function initNav() {
    var tg = $(".nav-tg"), nav = tg && tg.closest("nav"); if (!tg || !nav) return;
    function set(open) {
      nav.classList.toggle("open", open);
      tg.setAttribute("aria-expanded", open ? "true" : "false");
      tg.innerHTML = open ? "&#10005;" : "&#9776;";
    }
    tg.addEventListener("click", function () { set(!nav.classList.contains("open")); });
    $$(".lk a", nav).forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
    document.addEventListener("click", function (e) { if (!nav.contains(e.target)) set(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 900) set(false); });
  }

  function initReveal() {
    var els = $$(".rv");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  mount();
  initNav();
  initReveal();
})();
