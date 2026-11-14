/* Codiz AI Readiness Quiz — UI logic. No backend; answers live in memory + sessionStorage only. */
(function () {
  "use strict";
  var Q = window.AIR_QUESTIONS, SC = window.AIR_SCORING, REP = window.AIR_REPORT, INS = window.AIR_INSIGHTS, CFG = window.AIR_CONFIG;
  if (!Q || !SC || !REP || !INS || !CFG) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var STORE = "codiz-aiq-v1", TOTAL = Q.length;
  var views = { intro: $("#view-intro"), quiz: $("#view-quiz"), result: $("#view-result") };
  var state = load() || fresh();

  /* ───────── helpers ───────── */
  function fresh() { return { answers: {}, index: 0, done: false }; }
  function load() {
    try {
      var s = JSON.parse(sessionStorage.getItem(STORE));
      if (s && typeof s === "object" && s.answers && typeof s.index === "number") return s;
    } catch (e) {}
    return null;
  }
  function save() { try { sessionStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }
  function clear() { try { sessionStorage.removeItem(STORE); } catch (e) {} }
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  // Optional analytics — never receives answers or personal data.
  function track(name, params) {
    try {
      if (typeof window.CODIZ_TRACK === "function") window.CODIZ_TRACK(name, params || {});
      else if (typeof window.gtag === "function") window.gtag("event", name, params || {});
      else if (window.dataLayer && window.dataLayer.push) window.dataLayer.push(Object.assign({ event: name }, params || {}));
    } catch (e) {}
  }
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 2600);
  }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ───────── routing (#/ , #/quiz , #/result) ───────── */
  function show(name, focusSel) {
    Object.keys(views).forEach(function (k) { views[k].hidden = k !== name; });
    window.scrollTo(0, 0);
    var f = $(focusSel); if (f) f.focus({ preventScroll: true });
  }
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }

  var firstRoute = true;
  function route() {
    var h = location.hash || "#/";
    if (h === "#/result") {
      var complete = state.done && SC.isComplete(state.answers);
      if (!complete) { history.replaceState(null, "", "#/"); return route(); }
      renderResult(); show("result", "#result-title"); track("result_viewed"); return;
    }
    if (h === "#/quiz") {
      if (state.done) { state = fresh(); save(); }
      state.index = Math.max(0, Math.min(TOTAL - 1, state.index | 0));
      renderQuestion(); show("quiz", "#q-text"); return;
    }
    show("intro", firstRoute ? null : "#intro-title");
    if (firstRoute) track("quiz_viewed");
  }
  window.addEventListener("hashchange", function () { firstRoute = false; route(); });

  /* ───────── quiz ───────── */
  function renderQuestion(animate) {
    var q = Q[state.index], sel = state.answers[q.id] || null;
    var card = $("#q-card");
    $("#q-text").textContent = q.text;
    $("#q-count").textContent = "Question " + (state.index + 1) + " of " + TOTAL;
    var bar = $("#q-bar");
    bar.setAttribute("aria-valuenow", state.index + 1);
    $("span", bar).style.width = ((state.index + 1) / TOTAL * 100) + "%";

    $("#q-options").innerHTML = q.options.map(function (o) {
      return '<label class="aiq-opt' + (sel === o.id ? " on" : "") + '">' +
        '<input type="radio" name="answer" value="' + o.id + '"' + (sel === o.id ? " checked" : "") + ">" +
        '<span class="aiq-badge" aria-hidden="true">' + o.id + "</span>" +
        '<span class="aiq-opt-text">' + esc(o.text) + "</span>" +
        '<span class="aiq-check" aria-hidden="true">✓</span></label>';
    }).join("");

    $("#btn-prev").hidden = state.index === 0;
    var next = $("#btn-next");
    next.textContent = state.index === TOTAL - 1 ? "اعرض النتيجة" : "التالي";
    next.disabled = !sel;
    $("#q-hint").style.visibility = sel ? "hidden" : "visible";

    if (animate && !reduce) { card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap"); }
  }

  $("#q-options").addEventListener("change", function (e) {
    if (e.target.name !== "answer") return;
    var q = Q[state.index];
    state.answers[q.id] = e.target.value; save();
    Array.prototype.forEach.call(this.children, function (l) { l.classList.toggle("on", $("input", l).checked); });
    $("#btn-next").disabled = false; $("#q-hint").style.visibility = "hidden";
    track("quiz_question_answered", { question_number: state.index + 1 });
  });

  $("#btn-next").addEventListener("click", function () {
    var q = Q[state.index];
    if (!state.answers[q.id]) return;                       // one answer is required to continue
    if (state.index < TOTAL - 1) { state.index++; save(); renderQuestion(true); $("#q-text").focus({ preventScroll: true }); return; }
    if (!SC.isComplete(state.answers)) return;              // never show a result before all 10 are answered
    state.done = true; save(); track("quiz_completed"); go("#/result");
  });
  $("#btn-prev").addEventListener("click", function () {
    if (state.index > 0) { state.index--; save(); renderQuestion(true); $("#q-text").focus({ preventScroll: true }); }
  });
  $("#btn-exit").addEventListener("click", function () { go("#/"); });
  $("#btn-start").addEventListener("click", function () {
    state = fresh(); save(); track("quiz_started"); go("#/quiz");
  });

  /* ───────── results ───────── */
  var RING = 2 * Math.PI * 54;

  function card(item, kind) {
    return '<article class="aiq-ins ' + kind + '"><span class="aiq-ins-i" aria-hidden="true">' + (kind === "s" ? "✦" : "↗") + "</span>" +
      "<h3>" + esc(item.title) + "</h3><p>" + esc(item.message) + "</p></article>";
  }

  function renderResult() {
    var r = REP.build(state.answers);
    var c = r.content, pct = r.score / r.max;
    var html = "";

    // A — hero
    html += '<div class="aiq-rhero"><div class="w aiq-rhero-in">' +
      '<span class="pill">CODIZ AI READINESS RESULT</span>' +
      '<div class="aiq-score">' +
        '<div class="aiq-ring" role="img" aria-label="النتيجة ' + r.score + ' من ' + r.max + '">' +
          '<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="bg" cx="60" cy="60" r="54"/><circle class="fg" cx="60" cy="60" r="54" stroke-dasharray="' + RING.toFixed(2) + '" stroke-dashoffset="' + RING.toFixed(2) + '" data-offset="' + (RING * (1 - pct)).toFixed(2) + '"/></svg>' +
          '<div class="aiq-ring-n"><bdi dir="ltr"><b>' + r.score + '</b> / ' + r.max + "</bdi></div></div>" +
        '<div class="aiq-score-t"><h1 id="result-title" tabindex="-1">' + esc(r.band.name) + '</h1>' +
        '<p class="aiq-rtitle">' + esc(c.title) + "</p></div></div>" +
      '<p class="aiq-rdesc">' + esc(c.description) + "</p>" +
    "</div></div>";

    html += '<div class="w aiq-rbody">';

    // recommendations + next step
    html += '<section class="aiq-rsec"><span class="pill">Recommendations</span><h2>إيه اللي تعمله دلوقتي؟</h2>' +
      '<ul class="aiq-rec">' + c.recommendations.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
      '<div class="aiq-next"><span>Your Next Step</span><p>' + esc(c.nextStep) + "</p></div></section>";

    // B — strengths
    html += '<section class="aiq-rsec"><span class="pill">Your Strengths</span><h2>نقاط قوتك</h2>' +
      (r.strengths.length
        ? '<div class="aiq-grid2">' + r.strengths.map(function (s) { return card(s, "s"); }).join("") + "</div>"
        : '<p class="aiq-empty">' + esc(INS.noStrengths.message) + "</p>") + "</section>";

    // C — improvements
    html += '<section class="aiq-rsec"><span class="pill">Areas to Improve</span><h2>مهارات تستحق التطوير</h2>' +
      (r.noImprovements
        ? '<article class="aiq-ins s wide"><span class="aiq-ins-i" aria-hidden="true">🎉</span><h3>' + esc(INS.noImprovements.title) + "</h3><p>" + esc(INS.noImprovements.message) + "</p></article>"
        : '<div class="aiq-grid2">' + r.improvements.map(function (s) { return card(s, "i"); }).join("") + "</div>") + "</section>";

    // D — human edge (Q7, not scored)
    html += '<section class="aiq-rsec"><span class="pill">Your Human Edge</span><h2>القيمة اللي بتضيفها</h2>' +
      '<article class="aiq-edge"><h3>' + esc(r.humanEdge.title) + "</h3><p>" + esc(r.humanEdge.message) + "</p>" +
      '<div class="aiq-tip"><span>Practical Tip</span><p>' + esc(r.humanEdge.tip) + "</p></div>" +
      '<small>سؤال القيمة البشرية مش محسوب في الدرجة، وكل اختيار فيه نوع مختلف من القيمة المهنية.</small></article></section>';

    html += "</div>";

    // Page 4 — final CTA
    var k = INS.cta;
    html += '<div class="aiq-final"><div class="w aiq-final-in"><span class="pill">Your Next Step</span>' +
      "<h2>" + esc(k.heading) + "</h2>" +
      k.paragraphs.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
      '<article class="aiq-ws"><h3 dir="ltr">' + esc(k.card.title) + "</h3><p>" + esc(k.card.description) + "</p>" +
      '<a class="btn l" id="cta-ws" href="' + esc(CFG.workshopCtaUrl) + '">' + esc(k.card.button) + "</a></article>" +
      '<div class="aiq-actions">' +
        '<button type="button" class="btn g" id="btn-retry">أعد الاختبار</button>' +
        '<a class="btn g" href="' + esc(CFG.homeUrl) + '">العودة لموقع Codiz</a>' +
      "</div>" +
      '<p class="aiq-note dark">الاختبار ده تجربة تعريفية مجانية؛ مش اختبار توظيف ولا شهادة معتمدة ولا قياس علمي، ومش بيتنبأ بأي حاجة عن مستقبلك المهني.</p>' +
    "</div></div>";

    $("#result-root").innerHTML = html;

    // animate the ring
    var fg = $(".aiq-ring .fg");
    if (fg) { var off = fg.getAttribute("data-offset"); if (reduce) fg.style.strokeDashoffset = off; else requestAnimationFrame(function () { requestAnimationFrame(function () { fg.style.strokeDashoffset = off; }); }); }

    $("#cta-ws").addEventListener("click", function () { track("workshop_cta_clicked"); });
    $("#btn-retry").addEventListener("click", function () { state = fresh(); save(); go("#/quiz"); });
  }

  // Page lifecycle
  var h = location.hash;
  if (!h || h === "#/") { clear(); state = fresh(); }   // a fresh visit to the intro starts clean
  route();
})();
