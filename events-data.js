/*
 * Codiz — events content & configuration (single source of truth).
 * Edit THIS file to add/update workshops and sessions; no page markup changes needed.
 * Copy is Arabic; session/workshop titles and technical terms stay in English.
 *
 * ── How to update a session ─────────────────────────────────────────────
 *  • Confirmed date/time:   set  date: "2026-12-05"  and  time: "7:00 م (بتوقيت القاهرة)"
 *  • Agenda:                fill  agenda: ["Item 1", "Item 2"]   (hidden while empty)
 *  • Mark as finished:      set   status: "completed"
 *  • Recording available:   set   recordingUrl: "https://..."  → CTA becomes "شاهد التسجيل"
 *  • Close registration:    set   registrationOpen: false
 *  • Homepage highlight:    change CODIZ_EVENTS.featuredSessionId
 */
window.CODIZ_EVENTS = {
  // Same Google Apps Script endpoint already used by the existing site forms.
  // BACKEND INTEGRATION POINT: see submitToBackend() in events.js.
  formEndpoint: "https://script.google.com/macros/s/AKfycby4t4PPWwvWOpfIb93uoEArFiC0uewfl0lpC5eZv-Kjige_vW0sr-Lmoms0twpLNWiz/exec",

  // Session shown in the homepage "featured" block.
  featuredSessionId: "build-smarter-with-ai",

  experienceLevels: ["مبتدئ", "متوسط", "متقدم"],

  sessions: [
    {
      id: "build-smarter-with-ai",
      title: "Build Smarter with AI",
      subtitle: "Frontend Development with AI Assistance & Vibe Coding",
      description:
        "اكتشف إزاي الـ AI بيغيّر تطوير الـ Frontend، وإزاي المطورين يستخدموا مساعدات الـ AI في شغلهم، وليه فهم الكود اللي بيتولّد ومراجعته واختباره لسه مهم.",
      icon: "🤖",
      tone: "mint",
      format: "سيشن لايف مجانية",
      status: "upcoming",                 // "upcoming" | "completed"
      statusLabel: "قادمة – سيشن لايف مجانية",
      registrationOpen: true,
      date: "2026-11-05",                 // 5 Nov 2026 — time still unpublished (add time: "...")
      time: null,                         // e.g. "7:00 م (بتوقيت القاهرة)"
      agenda: [],                         // hidden until set
      recordingUrl: null                  // set after the session to enable "شاهد التسجيل"
    },
    {
      id: "ai-explore-whats-possible",
      title: "AI: Explore What's Possible",
      subtitle: null,
      description:
        "سيشن مجانية تعريفية عن الـ AI وتطبيقاته العملية، وإزاي تفهم أدوات الـ AI وتستفيد منها بشكل أفضل.",
      icon: "✨",
      tone: "lav",
      format: "سيشن مجانية",
      status: "upcoming",
      statusLabel: "قادمة – سيشن مجانية",
      registrationOpen: true,
      date: null,                         // unpublished until confirmed
      time: null,                         // unpublished until confirmed
      agenda: [],                         // unpublished until confirmed
      recordingUrl: null
    }
  ],

  workshops: [
    {
      id: "problem-solving",
      title: "Problem Solving Workshop",
      description:
        "اتعلم تقسّم المشاكل وتفكر بالـ Algorithms وتتعامل مع التحديات التقنية بثقة.",
      category: "حل المشكلات · Algorithms",
      icon: "🧩",
      tone: "lav",
      status: "coming-soon"
    },
    {
      id: "flutter",
      title: "Flutter Workshop",
      description:
        "مقدمة عملية لبناء تطبيقات موبايل Cross-platform باستخدام Flutter.",
      category: "Mobile · Flutter",
      icon: "📱",
      tone: "blush",
      status: "coming-soon"
    },
    {
      id: "business",
      title: "Business Workshop",
      description:
        "اعرف إزاي التفكير والتحليل البزنس بيحوّلوا الأفكار لمنتجات برمجية واضحة وقيّمة.",
      category: "Business Analysis",
      icon: "📊",
      tone: "sand",
      status: "coming-soon"
    },
    {
      id: "backend",
      title: "Backend Development Workshop",
      description:
        "افهم إزاي الـ Server-side والـ APIs وقواعد البيانات بتشتغل مع بعض عشان تشغّل تطبيقات حقيقية.",
      category: "Backend · APIs",
      icon: "⚙️",
      tone: "mint",
      status: "coming-soon"
    },
    {
      id: "ui-ux",
      title: "UI/UX Workshop",
      description:
        "اتعلم أساسيات تصميم تجربة المستخدم وواجهات الاستخدام، وإزاي تحوّل الفكرة لتصميم واضح وسهل الاستخدام.",
      category: "UI/UX Design",
      icon: "🎨",
      tone: "blush",
      status: "coming-soon"
    },
    {
      id: "data-analysis",
      title: "Data Analysis Workshop",
      description:
        "تدريب عملي على استكشاف البيانات وتنظيفها وتحليلها عشان تاخد قرارات أحسن.",
      category: "Data & Analytics",
      icon: "📈",
      tone: "lav",
      status: "coming-soon"
    }
  ],

  // Workshop status → badge text. Add new statuses here.
  workshopStatuses: {
    "coming-soon": "قريبًا"
  },
  workshopCta: "انضم لقائمة الاهتمام"
};
