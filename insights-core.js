/*
 * Codiz Insights — shared rendering helpers.
 * Loaded in the browser (listing page) and required by tools/build-insights.js (static article
 * pages), so cards look identical everywhere. No dependencies.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CodizInsightsCore = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function langOf(a, data) { return a.lang || (data && data.defaultLang) || "ar"; }
  function dirOf(lang) { return lang === "en" ? "ltr" : "rtl"; }

  function formatDate(iso, lang) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return String(iso || "");
    return d.toLocaleDateString(lang === "en" ? "en-GB" : "ar-EG", { day: "numeric", month: "long", year: "numeric" });
  }

  // readingTime: number of minutes (e.g. 6) or a ready-made string (e.g. "٦ دقائق")
  function readingTimeText(rt, lang) {
    if (typeof rt === "string" && rt.trim()) return rt;
    var n = Math.max(1, Math.round(Number(rt) || 0));
    if (!rt) return "";
    if (lang === "en") return n + " min read";
    var num = n.toLocaleString("ar-EG");
    if (n === 1) return "قراءة دقيقة واحدة";
    if (n === 2) return "قراءة دقيقتين";
    return "قراءة " + num + (n <= 10 ? " دقائق" : " دقيقة");
  }

  function readLabel(lang) { return lang === "en" ? "Read Article" : "اقرأ المقال"; }

  function sortArticles(list) {
    return list.slice().sort(function (a, b) { return String(b.publishedAt).localeCompare(String(a.publishedAt)); });
  }

  function categoryOf(data, id) {
    var cats = data.categories || [];
    for (var i = 0; i < cats.length; i++) if (cats[i].id === id) return cats[i];
    return { id: id, label: id, tone: "lav" };
  }

  function resolveAsset(src, root) {
    if (!src) return "";
    return /^(https?:)?\/\//i.test(src) || src.charAt(0) === "/" || /^data:/.test(src) ? src : (root || "") + src;
  }

  var ARROW = '<svg class="ins-arrow" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /*
   * opts.root  path from the current page to the site root ("../" on the listing page)
   * opts.base  path from the current page to the folder that contains article folders ("" on the listing page)
   */
  function metaHTML(a, data, cat) {
    var lang = langOf(a, data);
    var rt = readingTimeText(a.readingTime, lang);
    var au = a.author && a.author.name ? '<bdi class="ins-author">' + esc(a.author.name) + '</bdi><span class="ins-dot" aria-hidden="true">•</span>' : "";
    return '<div class="ins-meta"><span class="ins-tag tone-' + esc(cat.tone || "lav") + '">' + esc(cat.label) + "</span></div>" +
      '<div class="ins-sub">' + au + '<time datetime="' + esc(a.publishedAt) + '">' + esc(formatDate(a.publishedAt, lang)) + "</time>" +
      (rt ? '<span class="ins-dot" aria-hidden="true">•</span><span>' + esc(rt) + "</span>" : "") + "</div>";
  }

  function articleHref(a, opts) { return (opts.base || "") + encodeURIComponent(a.slug) + "/index.html"; }

  function cardHTML(a, data, opts) {
    opts = opts || {};
    var lang = langOf(a, data), cat = categoryOf(data, a.category);
    var cover = a.coverImage
      ? '<div class="ins-cover"><img src="' + esc(resolveAsset(a.coverImage, opts.root)) + '" alt="' + esc(a.coverAlt || "") +
        '" loading="lazy" decoding="async"></div>'
      : "";
    return '<article class="ins-card is-' + dirOf(lang) + '" lang="' + esc(lang) + '" dir="' + dirOf(lang) + '">' + cover +
      '<div class="ins-card-body">' + metaHTML(a, data, cat) +
      '<h3><a href="' + esc(articleHref(a, opts)) + '">' + esc(a.title) + "</a></h3>" +
      '<p class="ins-excerpt">' + esc(a.description) + "</p>" +
      '<span class="ins-more">' + esc(readLabel(lang)) + " " + ARROW + "</span></div></article>";
  }

  function featuredHTML(a, data, opts) {
    opts = opts || {};
    var lang = langOf(a, data), cat = categoryOf(data, a.category);
    var cover = a.coverImage
      ? '<div class="ins-feature-cover"><img src="' + esc(resolveAsset(a.coverImage, opts.root)) + '" alt="' + esc(a.coverAlt || "") +
        '" loading="lazy" decoding="async"></div>'
      : "";
    var rt = readingTimeText(a.readingTime, lang);
    return '<article class="ins-feature is-' + dirOf(lang) + (cover ? " has-cover" : "") + '" lang="' + esc(lang) + '" dir="' + dirOf(lang) + '">' +
      '<div class="ins-feature-body"><span class="ins-tag tone-' + esc(cat.tone || "lav") + '">' + esc(cat.label) + "</span>" +
      '<h2><a href="' + esc(articleHref(a, opts)) + '">' + esc(a.title) + "</a></h2>" +
      '<p class="ins-feature-desc">' + esc(a.description) + "</p>" +
      '<div class="ins-feature-meta"><time datetime="' + esc(a.publishedAt) + '">' + esc(formatDate(a.publishedAt, lang)) + "</time>" +
      (rt ? '<span class="ins-dot" aria-hidden="true">•</span><span>' + esc(rt) + "</span>" : "") + "</div>" +
      '<a class="btn l" href="' + esc(articleHref(a, opts)) + '">' + esc(readLabel(lang)) + " " + ARROW + "</a></div>" + cover + "</article>";
  }

  return {
    esc: esc, langOf: langOf, dirOf: dirOf, formatDate: formatDate, readingTimeText: readingTimeText,
    readLabel: readLabel, sortArticles: sortArticles, categoryOf: categoryOf, resolveAsset: resolveAsset,
    metaHTML: metaHTML, cardHTML: cardHTML, featuredHTML: featuredHTML, ARROW: ARROW
  };
});
