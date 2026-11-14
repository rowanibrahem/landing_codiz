/*
 * Codiz AI Readiness Quiz — builds the personalised result from the answers (pure, no DOM).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./questions.js"), require("./scoring.js"), require("./insights.js"));
  } else root.AIR_REPORT = factory(root.AIR_QUESTIONS, root.AIR_SCORING, root.AIR_INSIGHTS);
})(typeof self !== "undefined" ? self : this, function (QUESTIONS, SCORING, INSIGHTS) {
  "use strict";

  var THEMES = ["collaboration", "verification", "responsible", "practical"];
  var themeOf = {};
  QUESTIONS.forEach(function (q) { themeOf[q.id] = q.theme; });

  // Small deterministic hash of the answers — varies the picks between different answer sets
  // without randomness (same answers → same report).
  function seedOf(answers) {
    var s = SCORING.ORDER.map(function (q) { return answers[q]; }).join("");
    var h = 7;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i) * (i + 1)) % 100003;
    return h;
  }

  /*
   * Picks up to `n` question ids spread across different themes, so the result does not always
   * show the same questions just because of their order. Rotation start depends on the seed.
   */
  function pickBalanced(ids, seed, n) {
    var byTheme = {};
    THEMES.forEach(function (t) { byTheme[t] = []; });
    ids.forEach(function (id) { byTheme[themeOf[id]].push(id); });
    var themes = THEMES.filter(function (t) { return byTheme[t].length; });
    var out = [], start = seed % Math.max(1, themes.length), round = 0;
    while (out.length < n && out.length < ids.length) {
      for (var k = 0; k < themes.length && out.length < n; k++) {
        var list = byTheme[themes[(start + k) % themes.length]];
        if (round < list.length) out.push(list[(seed + round) % list.length]);
      }
      round++;
      if (round > ids.length) break;
    }
    // remove accidental duplicates (same theme list wrapped) and top-up if needed
    var seen = {}, uniq = [];
    out.forEach(function (id) { if (!seen[id]) { seen[id] = 1; uniq.push(id); } });
    for (var i = 0; i < ids.length && uniq.length < Math.min(n, ids.length); i++) if (!seen[ids[i]]) { seen[ids[i]] = 1; uniq.push(ids[i]); }
    return uniq.slice(0, n);
  }

  function build(answers) {
    var calc = SCORING.calculate(answers);
    if (!calc) return null;
    var seed = seedOf(answers);
    var strong = SCORING.SCORED.filter(function (q) { return calc.perQuestion[q] === 2; });
    var weak = SCORING.SCORED.filter(function (q) { return calc.perQuestion[q] < 2; });
    var cls = INSIGHTS.classifications[calc.classification.id];
    return {
      score: calc.score, max: calc.max, min: calc.min,
      band: calc.classification,            // { id, name, min, max }
      content: cls,                         // title, description, recommendations, nextStep
      strengths: pickBalanced(strong, seed, 2).map(function (q) { return Object.assign({ id: q }, INSIGHTS.strengths[q]); }),
      improvements: pickBalanced(weak, seed + 1, 2).map(function (q) { return Object.assign({ id: q }, INSIGHTS.improvements[q]); }),
      noImprovements: weak.length === 0,
      humanEdge: INSIGHTS.humanEdge[calc.humanEdge],
      humanEdgeKey: calc.humanEdge
    };
  }

  return { build: build, pickBalanced: pickBalanced, seedOf: seedOf };
});
