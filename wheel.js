/* Codiz — Lucky Wheel: collects a phone/email, spins once per visitor, shows a 7-day reward ticket. */
(function () {
  "use strict";
  var C = window.CODIZ_WHEEL;
  if (!C || !C.enabled || !Array.isArray(C.segments) || !C.segments.length) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ENDPOINT = C.formEndpoint || (window.CODIZ_EVENTS && window.CODIZ_EVENTS.formEndpoint) || null;
  var N = C.segments.length, SEG = 360 / N;
  var COLORS = [
    ["#4b1d5e", "#ffffff"], ["#f6d9e7", "#4b1d5e"], ["#7a3d86", "#ffffff"], ["#cdeee1", "#0f4a3a"],
    ["#b784c7", "#ffffff"], ["#f7ebdd", "#4b1d5e"], ["#3a1049", "#ffffff"], ["#ddd2f5", "#4b1d5e"]
  ];

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function load() { try { return JSON.parse(localStorage.getItem(C.storageKey)); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(C.storageKey, JSON.stringify(v)); } catch (e) {} }
  function fmtDate(ts) {
    return new Date(ts).toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }
  function pick() {
    var total = C.segments.reduce(function (a, s) { return a + (s.weight || 1); }, 0), r = Math.random() * total;
    for (var i = 0; i < N; i++) { r -= (C.segments[i].weight || 1); if (r < 0) return i; }
    return N - 1;
  }
  function code() {
    var a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "CDZ-";
    for (var i = 0; i < 5; i++) s += a.charAt(Math.floor(Math.random() * a.length));
    return s;
  }
  // contact must be an email or a phone number
  function validContact(v) {
    v = (v || "").trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return v;
    var d = v.replace(/[\s\-().]/g, "");
    return /^\+?\d{8,15}$/.test(d) ? d : "";
  }
  function send(rec) {
    if (!ENDPOINT) return;
    var fd = new FormData();
    fd.append("form", "lucky-wheel");
    fd.append("contact", rec.contact);
    fd.append("prize", rec.title);
    fd.append("prizeType", rec.type);
    fd.append("code", rec.code);
    fd.append("expiresAt", rec.type === "none" ? "" : new Date(rec.expiresAt).toISOString());
    try { fetch(ENDPOINT, { method: "POST", mode: "no-cors", body: fd }); } catch (e) {}
  }

  /* ───────── markup ───────── */
  var back = document.createElement("div");
  back.className = "lw-back";
  back.setAttribute("role", "dialog");
  back.setAttribute("aria-modal", "true");
  back.setAttribute("aria-labelledby", "lw-title");
  back.innerHTML =
    '<div class="lw-box">' +
      '<button type="button" class="lw-x" aria-label="إغلاق">✕</button>' +
      '<div class="lw-confetti" aria-hidden="true"></div>' +

      '<div class="lw-step" data-step="form">' +
        '<h2 id="lw-title">🎡 لفّ عجلة الحظ!</h2>' +
        '<p class="lw-sub">اكتب رقم تليفونك أو إيميلك، ولفّ العجلة، واللي هيطلعلك تاخده كخصم على برامجنا التدريبية.</p>' +
        '<form class="lw-form" novalidate>' +
          '<label for="lw-contact">رقم الموبايل أو الإيميل</label>' +
          '<input id="lw-contact" name="contact" autocomplete="tel" placeholder="+20 10 1234 5678 أو name@email.com">' +
          '<div class="lw-err" role="alert">اكتب رقم موبايل صحيح (8 إلى 15 رقم) أو إيميل صحيح.</div>' +
          '<button type="submit" class="btn">كمّل ولفّ العجلة 🎯</button>' +
          '<p class="lw-note">لفّة واحدة لكل شخص. بياناتك بنستخدمها بس عشان نتواصل معاك بخصوص جايزتك وبرامج Codiz.</p>' +
        '</form>' +
      '</div>' +

      '<div class="lw-step" data-step="spin" hidden>' +
        '<h2>اضغط وجرّب حظك ✨</h2>' +
        '<div class="lw-wheel-wrap"><div class="lw-pointer"></div><canvas width="600" height="600" aria-label="عجلة الحظ"></canvas><div class="lw-hub" aria-hidden="true">🎁</div></div>' +
        '<button type="button" class="btn lw-spin">لفّ العجلة</button>' +
      '</div>' +

      '<div class="lw-step" data-step="result" hidden></div>' +
    '</div>';
  document.body.appendChild(back);

  var box = $(".lw-box", back), canvas = $("canvas", back), steps = {};
  Array.prototype.forEach.call(back.querySelectorAll("[data-step]"), function (el) { steps[el.getAttribute("data-step")] = el; });

  function show(name) {
    Object.keys(steps).forEach(function (k) { steps[k].hidden = k !== name; });
  }

  /* ───────── wheel drawing ───────── */
  function draw() {
    var ctx = canvas.getContext("2d"), W = canvas.width, R = W / 2;
    ctx.clearRect(0, 0, W, W);
    for (var i = 0; i < N; i++) {
      var a0 = (i * SEG - 90) * Math.PI / 180, a1 = ((i + 1) * SEG - 90) * Math.PI / 180, col = COLORS[i % COLORS.length];
      ctx.beginPath(); ctx.moveTo(R, R); ctx.arc(R, R, R - 4, a0, a1); ctx.closePath();
      ctx.fillStyle = col[0]; ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 3; ctx.stroke();

      ctx.save();
      ctx.translate(R, R);
      ctx.rotate((a0 + a1) / 2);
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillStyle = col[1];
      ctx.font = "900 " + (N > 8 ? 30 : 34) + "px Tajawal, sans-serif";
      ctx.direction = "rtl";
      ctx.fillText(C.segments[i].label, R - 34, 0);
      ctx.restore();
    }
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw); else draw();
  draw();

  /* ───────── result ───────── */
  function confetti() {
    if (reduce) return;
    var host = $(".lw-confetti", back), cols = ["#b784c7", "#f6d9e7", "#cdeee1", "#7a3d86", "#ffd37a"];
    host.innerHTML = "";
    for (var i = 0; i < 38; i++) {
      var p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = cols[i % cols.length];
      p.style.animationDelay = Math.random() * 0.6 + "s";
      p.style.animationDuration = 1.8 + Math.random() * 1.4 + "s";
      host.appendChild(p);
    }
  }
  function renderResult(rec) {
    var el = steps.result;
    if (rec.type === "none") {
      el.innerHTML =
        '<div class="lw-none" aria-hidden="true">🍀</div>' +
        "<h2>" + esc(rec.title) + "</h2>" +
        '<p class="lw-sub">' + esc(rec.desc) + "</p>" +
        '<div class="lw-actions"><a class="btn" href="events.html">شوف برامجنا التدريبية</a>' +
        '<button type="button" class="btn o lw-close">إغلاق</button></div>';
    } else {
      el.innerHTML =
        "<h2>🎉 مبروك!</h2>" +
        '<div class="lw-ticket">' +
          "<small>CODIZ REWARD TICKET</small>" +
          "<strong>" + esc(rec.title) + "</strong>" +
          "<p>" + esc(rec.desc) + "</p>" +
          '<div class="lw-meta">' +
            "<span><b>Code</b>" + esc(rec.code) + "</span>" +
            "<span><b>Valid until</b>" + esc(fmtDate(rec.expiresAt)) + "</span>" +
            '<span style="grid-column:1/-1"><b>Contact</b>' + esc(rec.contact) + "</span>" +
          "</div>" +
        "</div>" +
        '<div class="lw-shot">📸 خد سكرين شوت للتذكرة دي وتواصل معانا على صفحتنا. الخصم صالح لمدة أسبوع (7 أيام) من النهارده.</div>' +
        '<div class="lw-actions">' +
          '<a class="btn" href="' + esc(C.contactPageUrl) + '" target="_blank" rel="noopener noreferrer">تواصل معانا على الصفحة</a>' +
          '<button type="button" class="btn o lw-close">إغلاق</button>' +
        "</div>";
      confetti();
    }
    show("result");
  }

  /* ───────── launcher ───────── */
  var launch = document.createElement("button");
  launch.type = "button";
  launch.className = "lw-launch";
  launch.hidden = true;
  document.body.appendChild(launch);

  function refreshLauncher() {
    var rec = load();
    if (!rec) { launch.hidden = false; launch.innerHTML = "🎡 لفّ عجلة الحظ"; return; }
    if (rec.type !== "none" && Date.now() < rec.expiresAt) { launch.hidden = false; launch.innerHTML = "🎟️ جايزتك"; return; }
    launch.hidden = true;
  }

  /* ───────── open / close ───────── */
  var lastFocus = null, spinning = false;
  function open() {
    lastFocus = document.activeElement;
    var rec = load();
    if (rec) renderResult(rec); else show("form");
    back.classList.add("open");
    document.body.style.overflow = "hidden";
    var f = $("#lw-contact", back); if (!rec && f) setTimeout(function () { f.focus(); }, 80);
  }
  function close() {
    if (spinning) return;
    back.classList.remove("open");
    document.body.style.overflow = "";
    try { sessionStorage.setItem(C.storageKey + "-seen", "1"); } catch (e) {}
    refreshLauncher();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $(".lw-x", back).addEventListener("click", close);
  back.addEventListener("click", function (e) { if (e.target === back) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && back.classList.contains("open")) close(); });
  back.addEventListener("click", function (e) { if (e.target.classList && e.target.classList.contains("lw-close")) close(); });
  launch.addEventListener("click", open);

  /* ───────── flow ───────── */
  var pending = null; // contact captured, waiting for the spin
  $(".lw-form", back).addEventListener("submit", function (e) {
    e.preventDefault();
    var v = validContact($("#lw-contact", back).value), err = $(".lw-err", back);
    if (!v) { err.classList.add("show"); return; }
    err.classList.remove("show");
    pending = v;
    show("spin");
  });

  $(".lw-spin", back).addEventListener("click", function () {
    if (spinning || !pending) return;
    spinning = true;
    var btn = this; btn.disabled = true; btn.textContent = "بتلف...";

    var idx = pick(), seg = C.segments[idx];
    var rec = {
      id: seg.id, type: seg.type, title: seg.title, desc: seg.desc, contact: pending, code: code(),
      createdAt: Date.now(), expiresAt: Date.now() + (C.validDays || 7) * 86400000
    };
    save(rec);          // lock the single spin immediately
    send(rec);          // collect the lead

    var jitter = (Math.random() - 0.5) * SEG * 0.6;
    var deg = 360 * 6 - (idx + 0.5) * SEG + jitter;
    canvas.style.transform = "rotate(" + deg + "deg)";

    setTimeout(function () {
      spinning = false;
      renderResult(rec);
    }, reduce ? 50 : 5400);
  });

  /* ───────── boot ───────── */
  refreshLauncher();
  var seen = false;
  try { seen = sessionStorage.getItem(C.storageKey + "-seen") === "1"; } catch (e) {}
  if (!load() && !seen) setTimeout(open, C.showDelayMs || 1500);
})();
