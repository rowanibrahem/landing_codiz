const fs = require("fs");
const slug = "deep-dive-into-code-quality-beyond-bugs";
const src = fs.readFileSync(__dirname + "/_src.html", "utf8");
const a = src.indexOf('<div class="post-content">');
const aside = src.indexOf('<aside class="post-sidebar">', a);
const S = src.slice(a, aside > 0 ? aside : src.indexOf("</article>", a)).replace(/<div class="kg-bookmark-metadata">[\s\S]*?<\/div>/g, "");
const gen = fs.readFileSync(__dirname + `/../insights/${slug}/index.html`, "utf8");
const g0 = gen.indexOf('<div class="ins-prose"'); const G = gen.slice(g0, gen.indexOf("</article>", g0));
const cnt = (h, re) => (h.match(re) || []).length;
const rows = [
  ["h2", /<h2[ >]/g], ["h3", /<h3[ >]/g], ["li", /<li[ >]/g], ["ul/ol", /<(ul|ol)[ >]/g], ["hr", /<hr[ >]/g],
  ["links (content, not bookmarks)", null]
];
const strip = (h) => h.replace(/<figure class="kg-card kg-bookmark-card">[\s\S]*?<\/figure>/g, "");
for (const [n, re] of rows) {
  if (!re) { console.log(n.padEnd(34), cnt(strip(S), /<a [^>]*href=/g), "vs", cnt(G.replace(/<a class="ins-bookmark"[\s\S]*?<\/a>/g, "").replace(/<a class="ins-zoom"[\s\S]*?<\/a>/g, ""), /<a [^>]*href=/g)); continue; }
  console.log(n.padEnd(34), cnt(S, re), "vs", cnt(G, re));
}
console.log("strong".padEnd(34), cnt(S, /<strong>/g), "vs", cnt(G, /<strong>/g));
console.log("images".padEnd(34), cnt(S, /kg-image-card/g), "vs", cnt(G, /<figure class="ins-fig"/g) + cnt(G, /missing image/g), "(includes 1 missing)");
console.log("bookmarks".padEnd(34), cnt(S, /kg-bookmark-card/g), "vs", cnt(G, /class="ins-bookmark"/g));
console.log("callouts".padEnd(34), cnt(S, /kg-callout-card/g), "vs", cnt(G, /class="ins-callout"/g));
