const fs = require("fs");
const t = fs.readFileSync(__dirname + "/_src.html", "utf8");
const a = t.indexOf("<article");
const b = t.indexOf("</article>", a);
let h = t.slice(a, b + 10);
fs.writeFileSync(__dirname + "/_article.html", h);
// compact view
let v = h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<svg[\s\S]*?<\/svg>/g, "[svg]").replace(/\s+/g, " ");
fs.writeFileSync(__dirname + "/_article.compact.txt", v);
console.log("article html length", h.length, "compact", v.length);
