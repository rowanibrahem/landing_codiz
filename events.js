/* Codiz — renders events (sessions / workshops) from events-data.js and drives the
   interest-list + registration forms. Works on index.html (featured + compact blocks)
   and events.html (full lists + forms). */
(function () {
  "use strict";
  var E = window.CODIZ_EVENTS;
  if (!E) return;

  var EVENTS_PAGE = "events.html";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : null; }

  /* ───────────── view helpers ───────────── */

  function formatDate(d) {
    var dt = new Date(d + "T00:00:00");
    if (isNaN(dt)) return esc(d);
    return dt.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  // CTA rules: upcoming + open → Register; completed + recording → Watch Recording; otherwise inactive label.
  function sessionCta(s) {
    var rec = safeUrl(s.recordingUrl);
    if (s.status === "completed") {
      return rec
        ? { label: "شاهد التسجيل", href: rec, external: true, primary: true }
        : { label: "السيشن انتهت", disabled: true };
    }
    if (s.registrationOpen === false) return { label: "التسجيل مغلق", disabled: true };
    return {
      label: "سجّل مجانًا",
      href: EVENTS_PAGE + "?session=" + encodeURIComponent(s.id) + "#register",
      attr: 'data-session-cta="' + esc(s.id) + '"', primary: true
    };
  }

  function ctaHtml(c, extraCls) {
    var cls = "btn" + (extraCls ? " " + extraCls : "");
    if (c.disabled) return '<span class="' + cls + ' is-disabled" aria-disabled="true">' + esc(c.label) + "</span>";
    return '<a class="' + cls + '" href="' + esc(c.href) + '" ' + (c.attr || "") +
      (c.external ? ' target="_blank" rel="noopener"' : "") + ">" + esc(c.label) + "</a>";
  }

  function sessionStatusLabel(s) {
    return s.status === "completed" ? "انتهت" : (s.statusLabel || "قادمة");
  }

  function metaHtml(s) {
    var rows = [];
    rows.push(s.date ? "📅 " + formatDate(s.date) : '<span class="tba">📅الموعد هيتحدد قريبًا</span>');
    if (s.date && s.time) rows.push("🕒 " + esc(s.time));
    var out = '<ul class="ev-meta">' + rows.map(function (r) { return "<li>" + r + "</li>"; }).join("") + "</ul>";
    if (s.agenda && s.agenda.length) {
      out += '<ul class="ev-agenda">' + s.agenda.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ul>";
    }
    return out;
  }

  function sessionCard(s) {
    var done = s.status === "completed";
    return '<article class="card ev-card free rv">' +
      '<div class="ev-top"><div class="ic" style="background:var(--' + esc(s.tone || "mint") + ')">' + esc(s.icon) + '</div>' +
      '<span class="ev-tag free">مجاني</span></div>' +
      "<h3>" + esc(s.title) + "</h3>" +
      (s.subtitle ? '<div class="sub">' + esc(s.subtitle) + "</div>" : "") +
      '<p class="d">' + esc(s.description) + "</p>" +
      metaHtml(s) +
      '<div class="ev-foot"><span class="ev-status ' + (done ? "done" : "up") + '">' + esc(sessionStatusLabel(s)) + "</span>" +
      ctaHtml(sessionCta(s), "sm") + "</div></article>";
  }

  function featuredSession(s) {
    var done = s.status === "completed";
    return '<div class="ev-feature rv"><div>' +
      '<span class="ev-tag free">سيشن مجانية</span>' +
      "<h3>" + esc(s.title) + "</h3>" +
      (s.subtitle ? '<div class="sub">' + esc(s.subtitle) + "</div>" : "") +
      '<p class="d">' + esc(s.description) + "</p>" +
      metaHtml(s) +
      '<p class="ev-status ' + (done ? "done" : "up") + '" style="margin-bottom:18px">' + esc(sessionStatusLabel(s)) + "</p>" +
      '<div class="ev-actions">' + ctaHtml(sessionCta(s), "l") +
      '<a class="btn g" href="' + EVENTS_PAGE + '#free-sessions">كل السيشنز المجانية</a></div>' +
      '</div><div class="ev-feature-art" aria-hidden="true"><i>' + esc(s.icon) + "</i><b>" + esc(s.format || "سيشن مجانية") +
      "</b><span>متاحة للجميع</span></div></div>";
  }

  function workshopCard(w, compact) {
    var status = E.workshopStatuses[w.status] || w.status;
    return '<article class="card ev-card paid' + (compact ? " compact" : "") + ' rv">' +
      '<div class="ev-top"><div class="ic" style="background:var(--' + esc(w.tone || "lav") + ')">' + esc(w.icon) + "</div>" +
      '<span class="ev-tag paid">' + esc(w.category) + "</span></div>" +
      "<h3>" + esc(w.title) + "</h3>" +
      (compact ? "" : '<p class="d">' + esc(w.description) + "</p>") +
      '<div class="ev-foot"><span class="ev-status">' + esc(status) + "</span>" +
      '<a class="btn' + (compact ? " o" : "") + ' sm" href="' + EVENTS_PAGE + "?workshop=" + encodeURIComponent(w.id) +
      '#interest" data-workshop-cta="' + esc(w.id) + '">' + esc(E.workshopCta) + "</a></div></article>";
  }

  /* ───────────── mounting ───────────── */

  function mount() {
    $$("[data-ev-mount]").forEach(function (el) {
      var kind = el.getAttribute("data-ev-mount"), html = "";
      if (kind === "featured-session") {
        var s = byId(E.sessions, E.featuredSessionId) || E.sessions[0];
        html = s ? featuredSession(s) : "";
      } else if (kind === "sessions") {
        html = E.sessions.map(sessionCard).join("");
      } else if (kind === "workshops") {
        html = E.workshops.map(function (w) { return workshopCard(w, false); }).join("");
      } else if (kind === "workshops-compact") {
        html = E.workshops.map(function (w) { return workshopCard(w, true); }).join("");
      }
      el.innerHTML = html;
    });
  }

  /* ───────────── forms ───────────── */

  var RULES = {
    name: function (v) { return v.trim().length >= 2 ? "" : "من فضلك اكتب اسمك بالكامل."; },
    whatsapp: function (v) {
      var d = v.replace(/[\s\-().]/g, "");
      return /^\+?\d{8,15}$/.test(d) ? "" : "اكتب رقم واتساب صحيح (من 8 إلى 15 رقم، مثال: +20 10 1234 5678).";
    },
    email: function (v) {
      return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "اكتب إيميل صحيح.";
    },
    workshop: function (v) { return v ? "" : "من فضلك اختار الـ Workshop."; },
    session: function (v) { return v ? "" : "من فضلك اختار السيشن."; }
  };

  function validateField(form, name) {
    var input = form.elements[name]; if (!input) return true;
    var msg = RULES[name] ? RULES[name](input.value) : "";
    var wrap = input.closest(".fld");
    if (wrap) { wrap.classList.toggle("bad", !!msg); var fe = $(".fe", wrap); if (fe) fe.textContent = msg; }
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  /*
   * BACKEND INTEGRATION POINT
   * Posts to the existing Google Apps Script endpoint (E.formEndpoint) — the same one the current
   * waitlist / instructor forms use. Two NEW form types are sent in the "form" field:
   *   "workshop-interest"    → name, whatsapp, email, workshop, workshopTitle, level
   *   "session-registration" → name, whatsapp, email, session, sessionTitle
   * The Apps Script must be updated to store these (e.g. one sheet per form type).
   * Note: mode "no-cors" returns an opaque response, so the browser cannot confirm the script
   * saved the row — "success" means the request was sent. To get true confirmation, have the
   * script return CORS-enabled JSON and read it here.
   */
  function submitToBackend(type, data) {
    if (!E.formEndpoint) return Promise.reject(new Error("No form endpoint configured"));
    var fd = new FormData();
    fd.append("form", type);
    Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });
    fd.append("submittedAt", new Date().toISOString());
    fd.append("page", location.pathname);
    return fetch(E.formEndpoint, { method: "POST", mode: "no-cors", body: fd });
  }

  function initForm(cfg) {
    var form = $(cfg.form); if (!form) return null;
    var btn = $("button[type=submit]", form), btnText = btn.textContent;
    var err = $(".ev-err", form), ok = $(cfg.ok);

    $$("input,select", form).forEach(function (i) {
      i.addEventListener("blur", function () { if (RULES[i.name]) validateField(form, i.name); });
      i.addEventListener("input", function () { if (i.closest(".fld.bad")) validateField(form, i.name); });
    });
    if (cfg.onChange) form.elements[cfg.onChange.field].addEventListener("change", cfg.onChange.fn);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      err.classList.remove("show");
      var valid = true, firstBad = null;
      Object.keys(RULES).forEach(function (n) {
        if (form.elements[n] && !validateField(form, n)) { valid = false; firstBad = firstBad || form.elements[n]; }
      });
      if (!valid) { firstBad.focus(); return; }

      var data = cfg.collect(form);
      btn.disabled = true; btn.textContent = "جاري الإرسال..."; form.setAttribute("aria-busy", "true");
      submitToBackend(cfg.type, data).then(function () {
        form.style.display = "none"; ok.classList.add("show");
        $(".ev-ok-msg", ok).textContent = cfg.successMsg(data);
        ok.setAttribute("tabindex", "-1"); ok.focus();
      }).catch(function () {
        err.textContent = "حصلت مشكلة ومتبعتش بياناتك. اتأكد من الإنترنت وحاول تاني، أو تواصل معانا على codiz.tech.hub@gmail.com.";
        err.classList.add("show");
      }).then(function () {
        btn.disabled = false; btn.textContent = btnText; form.removeAttribute("aria-busy");
      });
    });

    var again = $("[data-reset]", ok);
    if (again) again.addEventListener("click", function () {
      form.reset(); form.style.display = ""; ok.classList.remove("show");
      $$(".fld.bad", form).forEach(function (f) { f.classList.remove("bad"); });
      if (cfg.afterReset) cfg.afterReset();
      form.elements[cfg.firstField].focus();
    });
    return form;
  }

  function initForms() {
    /* Workshop interest list */
    var wf = $("#interest-form");
    if (wf) {
      var wsel = wf.elements.workshop;
      wsel.insertAdjacentHTML("beforeend", E.workshops.map(function (w) {
        return '<option value="' + esc(w.id) + '">' + esc(w.title) + "</option>";
      }).join(""));
      var lsel = wf.elements.level;
      lsel.insertAdjacentHTML("beforeend", E.experienceLevels.map(function (l) {
        return '<option value="' + esc(l) + '">' + esc(l) + "</option>";
      }).join(""));
      initForm({
        form: "#interest-form", ok: "#interest-ok", type: "workshop-interest", firstField: "name",
        collect: function (f) {
          var w = byId(E.workshops, f.elements.workshop.value) || {};
          return {
            name: f.elements.name.value.trim(), whatsapp: f.elements.whatsapp.value.trim(),
            email: f.elements.email.value.trim(), workshop: w.id || "", workshopTitle: w.title || "",
            level: f.elements.level.value
          };
        },
        successMsg: function (d) {
          return "شكرًا يا " + d.name.split(" ")[0] + "! اتسجلت في قائمة الاهتمام لـ " + d.workshopTitle +
            ". هنتواصل معاك على الواتساب أول ما التفاصيل تتأكد. ده مش حجز — التسجيل لسه ما اتفتحش.";
        }
      });
    }

    /* Free session registration */
    var sf = $("#register-form");
    if (sf) {
      var open = E.sessions.filter(function (s) { return s.status === "upcoming" && s.registrationOpen !== false; });
      var ssel = sf.elements.session;
      ssel.insertAdjacentHTML("beforeend", open.map(function (s) {
        return '<option value="' + esc(s.id) + '">' + esc(s.title) + "</option>";
      }).join(""));
      var banner = $("#register-banner");
      var setBanner = function () {
        var s = byId(E.sessions, ssel.value);
        banner.innerHTML = s ? "🎟️ بتسجّل في: <strong dir=\"ltr\">" + esc(s.title) + "</strong>" : "👆 اختار السيشن اللي عايز تحضرها";
      };
      if (!open.length) {
        $("#register-empty").style.display = "block"; sf.style.display = "none"; banner.style.display = "none";
      }
      setBanner();
      initForm({
        form: "#register-form", ok: "#register-ok", type: "session-registration", firstField: "name",
        onChange: { field: "session", fn: setBanner }, afterReset: setBanner,
        collect: function (f) {
          var s = byId(E.sessions, f.elements.session.value) || {};
          return {
            name: f.elements.name.value.trim(), whatsapp: f.elements.whatsapp.value.trim(),
            email: f.elements.email.value.trim(), session: s.id || "", sessionTitle: s.title || ""
          };
        },
        successMsg: function (d) {
          return "تم تسجيلك في “" + d.sessionTitle + "” يا " + d.name.split(" ")[0] + "! هنبعتلك تفاصيل السيشن على الواتساب أول ما تتأكد.";
        }
      });
    }

    /* CTA clicks on the events page: preselect + jump to the right form instead of reloading */
    document.addEventListener("click", function (e) {
      var a = e.target.closest("[data-session-cta],[data-workshop-cta]"); if (!a) return;
      var isS = a.hasAttribute("data-session-cta");
      var form = isS ? sf : wf; if (!form) return; // not on events page → normal link navigation
      e.preventDefault();
      var id = a.getAttribute(isS ? "data-session-cta" : "data-workshop-cta");
      selectFromId(isS ? "session" : "workshop", id, true);
    });

    /* Deep links: events.html?session=…  /  ?workshop=… */
    var q = new URLSearchParams(location.search);
    if (q.get("session")) selectFromId("session", q.get("session"), false);
    if (q.get("workshop")) selectFromId("workshop", q.get("workshop"), false);
  }

  function selectFromId(kind, id, scroll) {
    var form = $(kind === "session" ? "#register-form" : "#interest-form"); if (!form) return;
    var sel = form.elements[kind];
    if (sel && $("option[value='" + id.replace(/'/g, "") + "']", sel)) {
      sel.value = id; sel.dispatchEvent(new Event("change"));
    }
    var target = $(kind === "session" ? "#register" : "#interest");
    if (scroll && target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", "#" + target.id);
      setTimeout(function () { form.elements.name.focus({ preventScroll: true }); }, 500);
    }
  }

  /* Highlight active tab on the events page */
  function initTabs() {
    var tabs = $$(".ev-tabs a"); if (!tabs.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) tabs.forEach(function (t) { t.classList.toggle("on", t.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    $$("#free-sessions,#workshops").forEach(function (s) { io.observe(s); });
  }

  /* Mobile nav: hamburger toggles the links panel */
  function initNav() {
    var tg = $(".nav-tg"), nav = tg && tg.closest("nav"); if (!tg || !nav) return;
    function set(open) {
      nav.classList.toggle("open", open);
      tg.setAttribute("aria-expanded", open ? "true" : "false");
      tg.innerHTML = open ? "&#10005;" : "&#9776;";
    }
    tg.addEventListener("click", function () { set(!nav.classList.contains("open")); });
    $$(".lk a", nav).forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
    document.addEventListener("click", function (e) { if (!nav.contains(e.target)) set(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 900) set(false); });
  }

  mount();
  initForms();
  initTabs();
  initNav();
})();

