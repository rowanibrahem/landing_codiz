// Verifies the generated article body against the saved original page: every text node of the
// original post-content must appear, in order, in the generated .ins-prose (and vice versa).
const fs = require("fs");
const slug = "deep-dive-into-code-quality-beyond-bugs";
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] === "#") return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
  return { nbsp: "\u00a0", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[e.toLowerCase()] || m;
});
const norm = (s) => decode(s).replace(/[\s\u00a0]+/g, " ").trim();
function chunks(html) {
  return html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "").split(/<[^>]+>/).map(norm).filter(Boolean);
}
const src = fs.readFileSync(__dirname + "/_src.html", "utf8");
const a = src.indexOf('<div class="post-content">');
// end of post-content: find the closing by locating the next section marker after the last paragraph
let end = src.indexOf("</article>", a);
const srcBody = src.slice(a, end).replace(/<div class="kg-bookmark-metadata">[\s\S]*?<\/div>/g, "");
// cut trailing non-content (everything after the last content block marker)
const gen = fs.readFileSync(__dirname + `/../insights/${slug}/index.html`, "utf8");
const g0 = gen.indexOf('<div class="ins-prose"'); const g1 = gen.indexOf("</article>", g0);
const genBody = gen.slice(g0, g1).replace(/<span class="ins-bm-meta">[\s\S]*?<\/span>/g, "");

// Join chunks into a single stream per side and compare after removing all whitespace
const S = chunks(srcBody), G = chunks(genBody);
const join = (arr) => arr.join("").replace(/\s+/g, "");
const sj = join(S), gj = join(G);
console.log("source chars:", sj.length, "generated chars:", gj.length);
// locate where the generated stream deviates
let i = 0; while (i < sj.length && i < gj.length && sj[i] === gj[i]) i++;
console.log("common prefix:", i, "of", Math.min(sj.length, gj.length));
if (i < Math.min(sj.length, gj.length)) {
  console.log("source   >>", sj.slice(Math.max(0, i - 40), i + 80));
  console.log("generated>>", gj.slice(Math.max(0, i - 40), i + 80));
}
