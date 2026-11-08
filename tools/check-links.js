const fs = require("fs"), path = require("path");
const root = "g:/landing_codiz";
const files = [];
(function w(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? w(p) : /index\.html$/.test(p) && files.push(p); } })(path.join(root, "insights"));
let bad = 0, n = 0;
for (const f of files) {
  const h = fs.readFileSync(f, "utf8");
  for (const m of h.matchAll(/(?:href|src)="([^"]+)"/g)) {
    let u = m[1];
    if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(u) || u.startsWith("#")) continue;
    u = u.split("#")[0].split("?")[0]; if (!u) continue; n++;
    const t = path.resolve(path.dirname(f), decodeURIComponent(u));
    if (!fs.existsSync(t)) { bad++; console.log("BROKEN", path.relative(root, f), "->", m[1]); }
  }
}
console.log("checked", n, "links in", files.length, "pages; broken:", bad);
