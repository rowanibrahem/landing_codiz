/*
 * Codiz Insights — articles data (single source of truth).
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO PUBLISH AN ARTICLE
 *   1. Add an object to `articles` below (see the template at the bottom of this file).
 *   2. Run:   node tools/build-insights.js
 *      This regenerates /insights/index.html and one static page per article at
 *      /insights/<slug>/index.html (own title, meta description, Open Graph, JSON-LD).
 *   3. Commit/deploy the generated `insights/` folder together with this file.
 *
 *   The listing page (filtering, "Load More") reads this file directly in the browser, so
 *   remember step 2 — a card without a generated page would lead nowhere. The build script
 *   validates the data and reports errors (duplicate slugs, unknown categories, ...).
 *
 * ARTICLE FIELDS
 *   id            unique id (string)
 *   slug          URL slug: lowercase a–z, 0–9 and dashes only → /insights/<slug>/
 *   title         article title
 *   description   short excerpt / meta description
 *   category      id of one of the categories below
 *   publishedAt   "YYYY-MM-DD"
 *   readingTime   minutes (number, e.g. 6) or a ready string
 *   coverImage    (optional) path from the site root, e.g. "assets/insights/my-cover.jpg"
 *   coverAlt      (optional) alt text for the cover
 *   featured      true → shown as the featured article (if several, the newest wins)
 *   lang          "ar" (RTL, default) or "en" (LTR) — sets the article direction
 *   content       array of blocks (below)
 *
 * CONTENT BLOCKS
 *   { type: "heading",   level: 2 | 3, text }
 *   { type: "paragraph", text }
 *   { type: "list",      ordered: false, items: [text, ...] }
 *   { type: "quote",     text, cite? }
 *   { type: "image",     src, alt, caption?, width?, height? }
 *   { type: "code",      language: "js", filename?, code }
 *   { type: "divider" }
 *   Inline formatting inside any `text`:  **bold**   `code`   [link text](https://example.com)
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CODIZ_INSIGHTS = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    // Absolute site origin (no trailing slash), e.g. "https://codiz.tech". Needed for canonical
    // URLs and Open Graph images/urls. Leave empty until the production domain is known.
    siteUrl: "",
    siteName: "مدونة Codiz",
    defaultLang: "ar",
    pageSize: 6,                 // articles per "Load More" step
    allLabel: "All Articles",    // label of the first filter chip
    defaultOgImage: "",          // optional fallback image path (from site root) for Open Graph

    // Categories drive the filter chips. tone: blush | lav | mint | sand
    categories: [
      { id: "tech-explained",     label: "Tech Explained",     tone: "lav" },
      { id: "behind-the-code",    label: "Behind the Code",    tone: "mint" },
      { id: "technical-articles", label: "Technical Articles", tone: "blush" }
    ],

    // Published articles. Newest first is not required — they are sorted by publishedAt.
    articles: [
      {
        id: "1",
        slug: "deep-dive-into-code-quality-beyond-bugs",
        title: "Deep Dive into Code Quality - Beyond Bugs",
        // Excerpt = the original introduction's first paragraph, copied verbatim.
        description: "احيانا ممكن يقابلنا مشاكل او bugs و احنا بنعدل او بنضيف Feature جديدة للكود علي عكس المتوقع و دا لأن معظمنا ك software engineers بنركز دايما اننا عايزين نطلع منتج كويس و شغال عند العميل ، بس هل فكرنا قبل كدا في quality بتاعته ك code ؟",
        category: "technical-articles",
        publishedAt: "2024-09-01",          // original publication date
        readingTime: 5,
        coverImage: "assets/insights/deep-dive-into-code-quality-beyond-bugs/cover.png",
        coverAlt: "Deep Dive into Code Quality - Beyond Bugs",
        featured: false,
        lang: "ar",
        hideIntro: true,                    // the article body already starts with its own introduction
        author: { name: "Rowan Ibrahem", title: "Flutter Developer", url: "https://www.linkedin.com/in/rowanibrahem30227/" },
        tags: ["Clean Code", "Refactoring", "Design Patterns", "Programming Language", "Java"],
        contentFile: "content/insights/deep-dive-into-code-quality-beyond-bugs.json"
      }
    ]

    /* Template:
    ,{
      id: "1",
      slug: "my-article-slug",
      title: "Article title",
      description: "One or two sentences that summarise the article.",
      category: "tech-explained",
      publishedAt: "2026-01-31",
      readingTime: 5,
      coverImage: "",
      featured: false,
      lang: "ar",
      content: [
        { type: "heading", level: 2, text: "Heading" },
        { type: "paragraph", text: "Text with **bold**, `code` and a [link](https://example.com)." }
      ]
    }
    */
  };
});
