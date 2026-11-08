/* Codiz Insights — listing behaviour (category filter, Load More), mobile nav toggle, code copy. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Mobile nav toggle (same behaviour as the rest of the site) */
  (function initNav() {
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
  })();

  /* Copy buttons on code blocks */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]"); if (!btn) return;
    var code = $("code", btn.closest(".ins-code")); if (!code) return;
    var done = function (ok) {
      btn.textContent = ok ? "Copied" : "Press Ctrl+C";
      setTimeout(function () { btn.textContent = "Copy"; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code.textContent).then(function () { done(true); }, function () { done(false); });
    } else {
      var r = document.createRange(); r.selectNodeContents(code);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); done(false);
    }
  });

  /* Listing page */
  var page = $("[data-ins-list]"), data = window.CODIZ_INSIGHTS, core = window.CodizInsightsCore;
  if (!page || !data || !core) return;

  var ALL = "all", size = Math.max(1, data.pageSize || 6);
  var articles = core.sortArticles(data.articles || []);
  var featured = articles.filter(function (a) { return a.featured; })[0] || null;
  var elF = $("#ins-featured"), elFilters = $("#ins-filters"), elGrid = $("#ins-grid"),
      elMore = $("#ins-more"), elEmpty = $("#ins-empty"), elStatus = $("#ins-status");
  var opts = { root: "../", base: "" };
  var state = { cat: ALL, shown: size };

  function validCat(id) { return id === ALL || (data.categories || []).some(function (c) { return c.id === id; }); }
  var q = new URLSearchParams(location.search).get("category");
  if (q && validCat(q)) state.cat = q;

  function renderFilters() {
    if (!articles.length) { elFilters.hidden = true; return; }
    var cats = [{ id: ALL, label: data.allLabel || "All Articles" }].concat(data.categories || []);
    elFilters.innerHTML = cats.map(function (c) {
      var on = c.id === state.cat;
      return '<button type="button" class="ins-chip' + (on ? " on" : "") + '" data-cat="' + core.esc(c.id) + '" aria-pressed="' + on + '">' + core.esc(c.label) + "</button>";
    }).join("");
  }

  function render() {
    var isAll = state.cat === ALL;
    elF.innerHTML = featured && isAll ? core.featuredHTML(featured, data, opts) : "";
    var list = articles.filter(function (a) { return isAll ? !(featured && a === featured) : a.category === state.cat; });
    var part = list.slice(0, state.shown);
    elGrid.innerHTML = part.map(function (a) { return core.cardHTML(a, data, opts); }).join("");
    elMore.hidden = list.length <= state.shown;

    var none = !articles.length ? "المقالات هتتنشر هنا قريبًا — ترقّبونا." :
      (!list.length && !(isAll && featured)) ? "مفيش مقالات في القسم ده لسه." : "";
    elEmpty.hidden = !none; elEmpty.textContent = none;
    elStatus.textContent = "";
    elStatus.className = "ins-status";
  }

  elFilters.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cat]"); if (!b) return;
    state.cat = b.getAttribute("data-cat"); state.shown = size;
    var url = state.cat === ALL ? location.pathname : location.pathname + "?category=" + encodeURIComponent(state.cat);
    try { history.replaceState(null, "", url); } catch (err) {}
    renderFilters(); render();
  });
  elMore.addEventListener("click", function () {
    var before = elGrid.children.length;
    state.shown += size; render();
    var next = elGrid.children[before]; var l = next && $("a", next); if (l) l.focus({ preventScroll: true });
  });

  renderFilters(); render();
})();
