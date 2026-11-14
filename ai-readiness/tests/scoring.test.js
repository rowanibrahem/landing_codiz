/*
 * Codiz AI Readiness Quiz — scoring & report tests.   Run:  node ai-readiness/tests/scoring.test.js
 * The expected answer key below is typed independently of scoring.js on purpose.
 */
"use strict";
const assert = require("assert");
const Q = require("../questions.js");
const S = require("../scoring.js");
const R = require("../report.js");
const I = require("../insights.js");

const KEY = { // from the product spec
  Q1: [2, 1, 1], Q2: [1, 2, 1], Q3: [2, 1, 2], Q4: [2, 1, 2], Q5: [1, 1, 2],
  Q6: [1, 1, 2], Q8: [2, 1, 1], Q9: [1, 2, 2], Q10: [1, 1, 2]
};
const L = ["A", "B", "C"];
const ids = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10"];
let n = 0; const ok = (name, fn) => { fn(); n++; console.log("  ✓", name); };

ok("10 questions in order, 3 options each", () => {
  assert.deepStrictEqual(Q.map((q) => q.id), ids);
  Q.forEach((q) => assert.deepStrictEqual(q.options.map((o) => o.id), L));
});
ok("answer key matches the spec exactly", () => {
  Object.keys(KEY).forEach((q) => L.forEach((l, i) => assert.strictEqual(S.KEY[q][l], KEY[q][i], q + l)));
  assert.strictEqual(S.KEY.Q7, null);
});
const build = (pick) => { const a = {}; ids.forEach((q) => { a[q] = pick(q); }); return a; };
const lowest = (q) => (q === "Q7" ? "A" : L[KEY[q].indexOf(Math.min(...KEY[q]))]);
const highest = (q) => (q === "Q7" ? "A" : L[KEY[q].indexOf(Math.max(...KEY[q]))]);

ok("min score is 9 and max is 18", () => {
  assert.strictEqual(S.calculate(build(lowest)).score, 9);
  assert.strictEqual(S.calculate(build(highest)).score, 18);
  assert.strictEqual(S.MIN, 9); assert.strictEqual(S.MAX, 18);
});
ok("classification boundaries", () => {
  const id = (s) => S.classify(s).id;
  assert.strictEqual(id(9), "building"); assert.strictEqual(id(11), "building");
  assert.strictEqual(id(12), "developing"); assert.strictEqual(id(15), "developing");
  assert.strictEqual(id(16), "confident"); assert.strictEqual(id(18), "confident");
  assert.strictEqual(S.classify(11).name, "Building Your AI Readiness");
  assert.strictEqual(S.classify(12).name, "Developing AI Collaborator");
  assert.strictEqual(S.classify(16).name, "Confident AI Collaborator");
});
ok("Q7 never changes the score or classification", () => {
  const base = build(highest);
  const r = L.map((l) => S.calculate(Object.assign({}, base, { Q7: l })));
  r.forEach((x) => { assert.strictEqual(x.score, 18); assert.strictEqual(x.classification.id, "confident"); });
  assert.deepStrictEqual(r.map((x) => x.humanEdge), L);
});
ok("changing any scored answer is reflected in the score", () => {
  const base = build(lowest);
  Object.keys(KEY).forEach((q) => {
    const best = L[KEY[q].indexOf(Math.max(...KEY[q]))];
    const before = S.calculate(base).score, after = S.calculate(Object.assign({}, base, { [q]: best })).score;
    assert.strictEqual(after - before, Math.max(...KEY[q]) - Math.min(...KEY[q]));
  });
});
ok("incomplete answers produce no result", () => {
  const a = build(highest); delete a.Q4;
  assert.strictEqual(S.calculate(a), null);
  assert.strictEqual(S.calculate({}), null);
  assert.strictEqual(S.calculate(null), null);
});
ok("score is the SUM of points, not the count of A/B/C (all 3^9 combinations)", () => {
  const scored = Object.keys(KEY); let seen = new Set();
  const rec = (i, acc, sum) => {
    if (i === scored.length) {
      const calc = S.calculate(Object.assign(build(() => "A"), acc));
      assert.strictEqual(calc.score, sum); assert.ok(calc.score >= 9 && calc.score <= 18); seen.add(calc.score); return;
    }
    L.forEach((l, k) => rec(i + 1, Object.assign({}, acc, { [scored[i]]: l }), sum + KEY[scored[i]][k]));
  };
  rec(0, {}, 0);
  assert.deepStrictEqual([...seen].sort((a, b) => a - b), [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
});
ok("report: strengths/improvements follow the answers", () => {
  const rep = R.build(build(highest));
  assert.strictEqual(rep.improvements.length, 0); assert.strictEqual(rep.noImprovements, true);
  assert.strictEqual(rep.strengths.length, 2);
  rep.strengths.forEach((s) => assert.strictEqual(S.calculate(build(highest)).perQuestion[s.id], 2));
  const low = R.build(build(lowest));
  assert.strictEqual(low.strengths.length, 0); assert.strictEqual(low.improvements.length, 2);
  assert.strictEqual(low.band.id, "building");
});
ok("report: improvements come only from questions scored below 2 and cover different themes", () => {
  const themeOf = {}; Q.forEach((q) => { themeOf[q.id] = q.theme; });
  const rep = R.build(build(lowest));
  const [a, b] = rep.improvements; assert.notStrictEqual(themeOf[a.id], themeOf[b.id]);
});
ok("report: picks are not always the first questions (varies with the answers)", () => {
  const shown = new Set();
  const letters = ["A", "B", "C"];
  for (let i = 0; i < 300; i++) {
    const a = build((q) => letters[(i * 7 + q.length * 3 + ids.indexOf(q) * (i % 5 + 1)) % 3]);
    R.build(a).improvements.forEach((x) => shown.add(x.id));
  }
  assert.ok(shown.size >= 5, "only saw " + [...shown].join(","));
});
ok("report: same answers → same report; Q7 only changes the human edge", () => {
  const a = build(lowest);
  assert.deepStrictEqual(R.build(a), R.build(Object.assign({}, a)));
  const x = R.build(Object.assign({}, a, { Q7: "A" })), y = R.build(Object.assign({}, a, { Q7: "C" }));
  assert.strictEqual(x.score, y.score);
  assert.notStrictEqual(x.humanEdge.title, y.humanEdge.title);
});
ok("human edge variants exist for A, B, C", () => {
  assert.strictEqual(I.humanEdge.A.title, "Understanding People & Products");
  assert.strictEqual(I.humanEdge.B.title, "Judgment & Decision Making");
  assert.strictEqual(I.humanEdge.C.title, "Execution & Quality");
});
console.log(`\n${n} tests passed`);
