/* Codiz — BA program page: mobile nav + scroll reveal. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var tg = $(".nav-tg"), nav = tg && tg.closest("nav");
  if (tg && nav) {
    var set = function (open) {
      nav.classList.toggle("open", open);
      tg.setAttribute("aria-expanded", open ? "true" : "false");
      tg.innerHTML = open ? "&#10005;" : "&#9776;";
    };
    tg.addEventListener("click", function () { set(!nav.classList.contains("open")); });
    $$(".lk a", nav).forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
    document.addEventListener("click", function (e) { if (!nav.contains(e.target)) set(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 900) set(false); });
  }

  var els = $$(".rv");
  if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("in"); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(function (el) { io.observe(el); });
})();
