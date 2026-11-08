// Marks image blocks whose file could not be downloaded as `missing` (kept in the data, not silently dropped).
const fs = require("fs");
const slug = process.argv[2];
const f = __dirname + "/../content/insights/" + slug + ".json";
const b = JSON.parse(fs.readFileSync(f, "utf8"));
const imgs = JSON.parse(fs.readFileSync(__dirname + "/_images.json", "utf8"));
let n = 0;
b.forEach((x, i) => {
  if (x.type === "image" && x.src && !fs.existsSync(__dirname + "/../" + x.src)) {
    const im = imgs.find((m) => "assets/insights/" + slug + "/" + m.local === x.src);
    x.originalUrl = im ? im.remote : ""; delete x.src; delete x.srcset; x.missing = true; n++;
    console.log("MISSING image at block", i, "→", x.originalUrl);
  }
});
fs.writeFileSync(f, JSON.stringify(b, null, 2) + "\n");
console.log("marked missing:", n);
