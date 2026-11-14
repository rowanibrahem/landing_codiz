/*
 * Codiz AI Readiness Quiz — scoring (pure functions, no DOM).
 * Score = SUM of the points of each selected option (NOT the count of A/B/C answers).
 * Q7 is reflective: it is never part of the score or the classification.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.AIR_SCORING = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Answer key: points per option. Q7 has no points (null).
  var KEY = {
    Q1: { A: 2, B: 1, C: 1 },
    Q2: { A: 1, B: 2, C: 1 },
    Q3: { A: 2, B: 1, C: 2 },
    Q4: { A: 2, B: 1, C: 2 },
    Q5: { A: 1, B: 1, C: 2 },
    Q6: { A: 1, B: 1, C: 2 },
    Q7: null,
    Q8: { A: 2, B: 1, C: 1 },
    Q9: { A: 1, B: 2, C: 2 },
    Q10: { A: 1, B: 1, C: 2 }
  };
  var ORDER = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10"];
  var SCORED = ORDER.filter(function (q) { return KEY[q]; }); // 9 questions

  var MIN = SCORED.reduce(function (s, q) { return s + Math.min(KEY[q].A, KEY[q].B, KEY[q].C); }, 0); // 9
  var MAX = SCORED.reduce(function (s, q) { return s + Math.max(KEY[q].A, KEY[q].B, KEY[q].C); }, 0); // 18

  // Classification bands (inclusive).
  var BANDS = [
    { id: "building", min: 9, max: 11, name: "Building Your AI Readiness" },
    { id: "developing", min: 12, max: 15, name: "Developing AI Collaborator" },
    { id: "confident", min: 16, max: 18, name: "Confident AI Collaborator" }
  ];

  function classify(score) {
    for (var i = 0; i < BANDS.length; i++) if (score >= BANDS[i].min && score <= BANDS[i].max) return BANDS[i];
    return null;
  }

  function isComplete(answers) {
    return !!answers && ORDER.every(function (q) { return answers[q] === "A" || answers[q] === "B" || answers[q] === "C"; });
  }

  /* answers: { Q1: "A", Q2: "C", ... } — all ten are required. */
  function calculate(answers) {
    if (!isComplete(answers)) return null;
    var perQuestion = {}, score = 0;
    SCORED.forEach(function (q) {
      var pts = KEY[q][answers[q]];
      perQuestion[q] = pts;
      score += pts;
    });
    return {
      score: score, max: MAX, min: MIN,
      classification: classify(score),
      perQuestion: perQuestion,      // points (0..2 scale used by insights) for Q1–Q6, Q8–Q10
      humanEdge: answers.Q7          // "A" | "B" | "C" — not scored
    };
  }

  return { KEY: KEY, ORDER: ORDER, SCORED: SCORED, MIN: MIN, MAX: MAX, BANDS: BANDS, classify: classify, isComplete: isComplete, calculate: calculate };
});
