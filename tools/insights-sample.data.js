/*
 * SAMPLE / PLACEHOLDER DATA — FOR LOCAL TESTING ONLY.
 * These are NOT real Codiz articles. Never publish output built from this file:
 *   node tools/build-insights.js --data tools/insights-sample.data.js   (test)
 *   node tools/build-insights.js                                        (restores real/empty build)
 */
const real = require("../insights-data.js");
module.exports = Object.assign({}, real, {
  pageSize: 3,
  articles: [
    {
      id: "s1", slug: "sample-ar-article", title: "[عينة] مقال تجريبي بالعربي", lang: "ar", category: "tech-explained",
      description: "نص تجريبي للاختبار فقط — ليس مقالًا حقيقيًا.", publishedAt: "2026-03-10", readingTime: 6, featured: true,
      content: [
        { type: "heading", level: 2, text: "عنوان فرعي تجريبي" },
        { type: "paragraph", text: "فقرة عربية فيها مصطلح `Clean Architecture` وكلمة **غامقة** و[رابط](https://example.com)." },
        { type: "paragraph", text: "This English paragraph sits inside an Arabic article to test mixed direction." },
        { type: "list", items: ["عنصر أول", "عنصر ثاني with English", "عنصر ثالث"] },
        { type: "quote", text: "اقتباس تجريبي.", cite: "مصدر تجريبي" },
        { type: "code", language: "js", filename: "sample.js", code: "// comment\nconst user = { name: \"Codiz\", ok: true };\nasync function load(id) {\n  if (!id) return null;\n  return await fetch(`/api/${id}`);\n}" },
        { type: "heading", level: 3, text: "عنوان ثالث" },
        { type: "list", ordered: true, items: ["خطوة ١", "خطوة ٢"] }
      ]
    },
    {
      id: "s2", slug: "sample-en-article", title: "[SAMPLE] English test article with a somewhat longer title to check wrapping", lang: "en", category: "technical-articles",
      description: "Placeholder text for testing only — not a real article.", publishedAt: "2026-03-05", readingTime: 4,
      content: [
        { type: "heading", level: 2, text: "A heading" },
        { type: "paragraph", text: "English paragraph with `inline code`, **bold** and a [link](https://example.com)." },
        { type: "code", language: "dart", code: "class Counter extends StatelessWidget {\n  final int count; // value\n  const Counter({required this.count});\n}" },
        { type: "code", language: "python", code: "def add(a, b):\n    \"\"\"sum\"\"\"\n    return a + b  # ok" }
      ]
    },
    { id: "s3", slug: "sample-three", title: "[عينة] ثالث", lang: "ar", category: "behind-the-code", description: "نص تجريبي.", publishedAt: "2026-02-20", readingTime: 3, content: [{ type: "paragraph", text: "نص تجريبي." }] },
    { id: "s4", slug: "sample-four", title: "[SAMPLE] Four", lang: "en", category: "tech-explained", description: "Test.", publishedAt: "2026-02-10", readingTime: 1, content: [{ type: "paragraph", text: "Test." }] },
    { id: "s5", slug: "sample-five", title: "[عينة] خامس", lang: "ar", category: "behind-the-code", description: "نص تجريبي.", publishedAt: "2026-01-20", readingTime: 12, content: [{ type: "paragraph", text: "نص تجريبي." }] }
  ]
});
