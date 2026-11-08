#!/usr/bin/env node
/*
 * One-off importer: converts a saved Ghost article page (tools/_src.html) into
 *   content/insights/<slug>.json   (blocks for the Insights article system)
 * and downloads every image into assets/insights/<slug>/ (needs network).
 * Text is copied verbatim — nothing is rewritten. Unknown elements abort the import.
 *
 *   node tools/import-ghost-article.js <slug> [--no-download]
 */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const slug = process.argv[2];
const noDl = process.argv.includes("--no-download");
if (!slug) { console.error("usage: node tools/import-ghost-article.js <slug>"); process.exit(1); }
const html = fs.readFileSync(path.join(__dirname, "_src.html"), "utf8");

/* ── tiny HTML parser ── */
const VOID = new Set(["br", "hr", "img", "source", "meta", "link", "input", "wbr"]);
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    const map = { nbsp: "\u00a0", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", bull: "•", hellip: "…", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”" };
    return map[e.toLowerCase()] !== undefined ? map[e.toLowerCase()] : m;
  });
}
function parseAttrs(s) {
  const a = {}; s.replace(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g, (m, k, v1, v2, v3) => { a[k.toLowerCase()] = decode(v1 ?? v2 ?? v3 ?? ""); return m; });
  return a;
}
function parse(src) {
  const root = { tag: "#root", attrs: {}, children: [] }, stack = [root];
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z0-9]+)\s*>|<([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)>|[^<]+|</g;
  let m;
  while ((m = re.exec(src))) {
    const top = stack[stack.length - 1];
    if (m[0].startsWith("<!--")) continue;
    if (m[1]) { // close
      const t = m[1].toLowerCase();
      for (let i = stack.length - 1; i > 0; i--) if (stack[i].tag === t) { stack.length = i; break; }
    } else if (m[2]) {
      const t = m[2].toLowerCase(), node = { tag: t, attrs: parseAttrs(m[3] || ""), children: [] };
      top.children.push(node);
      if (!VOID.has(t) && !/\/\s*$/.test(m[3] || "")) stack.push(node);
    } else top.children.push({ text: decode(m[0]) });
  }
  return root;
}
const cls = (n) => (n.attrs && n.attrs.class ? n.attrs.class.split(/\s+/) : []);
function find(n, pred, out = []) { if (n.tag && pred(n)) out.push(n); (n.children || []).forEach((c) => find(c, pred, out)); return out; }
function textOf(n) { return n.text !== undefined ? n.text : (n.children || []).map(textOf).join(""); }

/* ── inline serialisation to the Codiz mini-markup (**bold**, `code`, [text](url), \n) ── */
const escMd = (s) => s.replace(/([\\*`\[\]()])/g, "\\$1");
function inline(n) {
  if (n.text !== undefined) return escMd(n.text.replace(/\s*\n\s*/g, " "));
  const inner = () => n.children.map(inline).join("");
  switch (n.tag) {
    case "strong": case "b": { const i = inner(); if (!i.trim() || /^\*\*[^*]+\*\*$/.test(i.trim())) return i; return "**" + i + "**"; }
    case "br": return "\n";
    case "a": return "[" + inner() + "](" + n.attrs.href.replace(/[()]/g, encodeURIComponent) + ")";
    case "code": return "`" + textOf(n) + "`";
    case "span": return inner();
    case "em": case "i": throw new Error("unsupported inline <" + n.tag + "> : " + textOf(n).slice(0, 60));
    default: throw new Error("unsupported inline <" + n.tag + ">");
  }
}

/* ── locate content ── */
const tree = parse(html);
const contentEl = find(tree, (n) => n.tag === "div" && cls(n).includes("post-content"))[0];
if (!contentEl) throw new Error("post-content not found");
const images = []; // {remote, local}
const outDir = path.join(ROOT, "assets", "insights", slug);
const relDir = "assets/insights/" + slug + "/";

function baseName(u) { return decodeURIComponent(u.split("?")[0].split("/").pop()); }
function register(remote, name) {
  let ex = images.find((i) => i.remote === remote);
  if (!ex) { ex = { remote, local: name }; images.push(ex); }
  return relDir + ex.local;
}
function imageBlock(fig, idx) {
  const img = find(fig, (n) => n.tag === "img")[0];
  const cap = find(fig, (n) => n.tag === "figcaption")[0];
  const remote = img.attrs.src;
  let name = /^https:\/\/storage\.ghost\.io/.test(remote) ? baseName(remote) : "external-" + idx + ".png";
  const local = register(remote, name);
  const b = { type: "image", src: local, alt: "", width: Number(img.attrs.width) || undefined, height: Number(img.attrs.height) || undefined };
  const set = (img.attrs.srcset || "").split(",").map((s) => s.trim().split(/\s+/)).filter((p) => p[1] && /w$/.test(p[1]));
  const variants = [];
  for (const [u, w] of set) {
    const wn = parseInt(w, 10);
    if (u === remote || wn === b.width) continue;
    const ext = path.extname(name), vname = name.slice(0, -ext.length) + "-w" + wn + ext;
    variants.push({ src: register(u, vname), width: wn });
  }
  if (variants.length) { b.srcset = variants.concat([{ src: local, width: b.width }]).sort((x, y) => x.width - y.width); }
  if (cap) b.caption = inline({ tag: "span", children: cap.children });
  return b;
}

const blocks = []; let skippedEmpty = 0, imgIdx = 0;
for (const n of contentEl.children) {
  if (n.text !== undefined) { if (n.text.trim()) throw new Error("stray text: " + n.text.slice(0, 50)); continue; }
  switch (n.tag) {
    case "h2": case "h3": blocks.push({ type: "heading", level: n.tag === "h2" ? 2 : 3, text: escMd(textOf(n)) }); break;
    case "p": {
      const t = n.children.map(inline).join("");
      if (!textOf(n).replace(/[\s\u00a0]+/g, "")) { skippedEmpty++; break; }
      blocks.push({ type: "paragraph", text: t }); break;
    }
    case "ul": case "ol":
      blocks.push({ type: "list", ordered: n.tag === "ol", items: n.children.filter((c) => c.tag === "li").map((li) => {
        if (find(li, (x) => x.tag === "ul" || x.tag === "ol").length) throw new Error("nested list");
        return li.children.map(inline).join("").replace(/\n+$/, "");
      }) }); break;
    case "hr": blocks.push({ type: "divider" }); break;
    case "figure": {
      const c = cls(n);
      if (c.includes("kg-image-card")) blocks.push(imageBlock(n, ++imgIdx));
      else if (c.includes("kg-bookmark-card")) {
        const a = find(n, (x) => x.tag === "a")[0];
        const g = (k) => { const e = find(n, (x) => cls(x).includes(k))[0]; return e ? textOf(e).trim() : ""; };
        blocks.push({ type: "bookmark", url: a.attrs.href, title: g("kg-bookmark-title"), description: g("kg-bookmark-description"), author: g("kg-bookmark-author"), publisher: g("kg-bookmark-publisher") });
      } else throw new Error("unknown figure " + c.join(" "));
      break;
    }
    case "div":
      if (cls(n).includes("kg-callout-card")) {
        const em = find(n, (x) => cls(x).includes("kg-callout-emoji"))[0], tx = find(n, (x) => cls(x).includes("kg-callout-text"))[0];
        blocks.push({ type: "callout", emoji: em ? textOf(em).trim() : "", text: tx.children.map(inline).join("") });
      } else throw new Error("unknown div " + cls(n).join(" "));
      break;
    default: throw new Error("unknown top-level element <" + n.tag + ">");
  }
}

/* cover + metadata for reference */
const feat = find(tree, (n) => n.tag === "figure" && cls(n).includes("post-feature-image"))[0];
const coverImg = feat && find(feat, (n) => n.tag === "img")[0];
const coverLocal = coverImg ? register(coverImg.attrs.src, "cover" + path.extname(baseName(coverImg.attrs.src))) : "";

fs.mkdirSync(path.join(ROOT, "content", "insights"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "content", "insights", slug + ".json"), JSON.stringify(blocks, null, 2) + "\n");
const stats = blocks.reduce((a, b) => (a[b.type] = (a[b.type] || 0) + 1, a), {});
console.log("blocks:", JSON.stringify(stats), "| skipped empty <p>:", skippedEmpty, "| images to fetch:", images.length, "| cover:", coverLocal);
fs.writeFileSync(path.join(__dirname, "_images.json"), JSON.stringify(images, null, 2));

if (noDl) process.exit(0);
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const missing = [];
  for (const im of images) {
    const dest = path.join(outDir, im.local);
    try {
      const r = await fetch(im.remote, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const ct = r.headers.get("content-type") || "";
      if (!/^image\//.test(ct)) throw new Error("not an image: " + ct);
      fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
      console.log("ok  ", im.local, fs.statSync(dest).size);
    } catch (e) { missing.push(im.local + "  <-  " + im.remote + "  (" + e.message + ")"); console.log("FAIL", im.local, e.message); }
  }
  console.log(missing.length ? "MISSING IMAGES:\n" + missing.join("\n") : "all images downloaded");
})();
