/*
 * Codiz AI Readiness Quiz — result content (local data). Texts are final.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.AIR_INSIGHTS = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    // Keyed by classification id from scoring.js
    classifications: {
      building: {
        title: "You're Exploring AI",
        description: "أنت في مرحلة اكتشاف أفضل طريقة للتعامل مع AI. بدأت تستفيد من أدوات الذكاء الاصطناعي، لكن طريقة استخدامك ليها ممكن تكون محتاجة تنظيم ووعي أكبر.",
        recommendations: [
          "متكتفيش بأول إجابة يقدمها AI.",
          "اتعود توفر له Context واضح عن المهمة.",
          "جرّب المخرجات بنفسك قبل استخدامها.",
          "افهم الأساسيات بدل ما تعتمد على الإجابات الجاهزة."
        ],
        nextStep: "ابدأ ببناء طريقة استخدام واعية ومنظمة للـ AI."
      },
      developing: {
        title: "You're Learning to Collaborate",
        description: "عندك أساس جيد في استخدام AI، لكن لسه فيه مساحة للتطور. التحدي الحقيقي هو الانتقال من مجرد استخدام الأداة إلى القدرة على توجيهها وتقييم نتائجها واتخاذ قرارات مستقلة.",
        recommendations: [
          "اشتغل على تقسيم المهام الكبيرة لمراحل.",
          "راجع المصادر والمخرجات المهمة بنفسك.",
          "متعتبرش إن الكود أو الحل صحيح لمجرد إنه اشتغل.",
          "اتعلم تشرح قراراتك وتبرر اختياراتك."
        ],
        nextStep: "طوّر قدرتك على إدارة التعاون بينك وبين AI بدل الاعتماد على مخرجاته فقط."
      },
      confident: {
        title: "You're Ready to Collaborate",
        description: "إجاباتك بتعكس وعيًا جيدًا بكيفية العمل مع AI. واضح إنك بتفكر في السياق، وبتراجع المخرجات، وبتحاول تحافظ على دورك في تقييم الحلول واتخاذ القرارات.",
        recommendations: [
          "انتقل من استخدام الأدوات إلى بناء حلول عملية باستخدامها.",
          "اختبر جودة النتائج في سيناريوهات واقعية.",
          "اهتم بالخصوصية والأمان حتى مع الأدوات الموثوقة.",
          "استمر في تطوير مهاراتك الأساسية بعيدًا عن الاعتماد على AI."
        ],
        nextStep: "استخدم AI لبناء حلول حقيقية، واحتفظ بمسؤولية التقييم والقرار."
      }
    },

    // Shown when the answer earned the top points (2).
    strengths: {
      Q1: { title: "Problem Understanding", message: "بتحاول تفهم المشكلة وتحدد موضع الخلل قبل اختيار الحل." },
      Q2: { title: "Context Management", message: "بتوفر سياقًا واضحًا يساعد AI على فهم التعديلات المطلوبة." },
      Q3: { title: "Task Breakdown", message: "بتتعامل مع المهام الكبيرة على مراحل وبتراجع النتائج أثناء التنفيذ." },
      Q4: { title: "Information Verification", message: "بتتحقق من المعلومات بالرجوع للمصادر بدل الاعتماد على إجابة AI وحدها." },
      Q5: { title: "Code Review & Testing", message: "بتراجع الكود وبتختبره قبل الاعتماد عليه في المشروع." },
      Q6: { title: "Responsible AI Usage", message: "بتفكر في الخصوصية والصلاحيات قبل ربط أدوات AI ببياناتك." },
      Q8: { title: "Practical AI Application", message: "بتفكر في الجمهور ومصادر المعرفة ومعايير جودة الحل قبل تنفيذه." },
      Q9: { title: "Continuous Learning", message: "بتوازن بين استخدام AI والتعلم من المصادر والتطبيق العملي." },
      Q10: { title: "Decision Justification", message: "بتقدر توضح أسباب قراراتك وتقارن بين البدائل والـ Trade-offs." }
    },

    // Shown when the answer scored below 2.
    improvements: {
      Q1: { title: "Analyze Before Solving", message: "حدد الجزء اللي مش بيعالج المشكلة قبل ما تطلب حلولًا جديدة." },
      Q2: { title: "Provide Better Context", message: "شارك الكود والتفاصيل والقيود المهمة بدل الاعتماد على سياق المحادثة فقط." },
      Q3: { title: "Work in Steps", message: "قسم المهام الكبيرة لمراحل وراجع مخرجات كل مرحلة قبل الانتقال للي بعدها." },
      Q4: { title: "Verify Your Sources", message: "افتح المصادر وتأكد من صحة المعلومات بشكل مستقل قبل استخدامها." },
      Q5: { title: "Understand Before Integrating", message: "نجاح الكود في أول تجربة مش كفاية؛ افهمه واختبر الحالات المهمة قبل دمجه." },
      Q6: { title: "Protect Your Data", message: "راجع الصلاحيات وسياسة الخصوصية، واستخدم أقل مستوى وصول ممكن." },
      Q8: { title: "Start with the Problem", message: "حدد المستخدمين ومصادر المعلومات ومعايير نجاح الحل قبل اختيار الأداة." },
      Q9: { title: "Build Your Foundations", message: "وازن بين شرح AI والتطبيق العملي والرجوع للمصادر الأصلية." },
      Q10: { title: "Explain Your Decisions", message: "فكر في البدائل والـ Trade-offs، ومتكتفيش بعرض القرار النهائي." }
    },

    // Shown instead of "Areas to Improve" when nothing needs improving.
    noImprovements: {
      title: "Advanced Challenge",
      message: "مبروك! إجاباتك كلها كانت في أعلى مستوى في الاختبار ده. التحدي الجاي: جرّب تبني حلًّا صغيرًا باستخدام AI، وقيّم جودة نتايجه في سيناريوهات حقيقية، وشارك طريقة تفكيرك مع غيرك."
    },

    // Shown instead of "Your Strengths" when no answer reached the top level.
    noStrengths: {
      message: "لسه مفيش نقطة قوة بارزة في الإجابات دي، وده طبيعي في البداية. ركّز على نقاط التطوير اللي تحت، وأعد الاختبار بعد ما تجربها."
    },

    // Q7 — not scored. Three different kinds of professional value (none is "better").
    humanEdge: {
      A: {
        title: "Understanding People & Products",
        message: "أنت شايف إن فهم المنتج واحتياجات المستخدمين والتعاون مع الفريق من أهم القيم اللي بتضيفها.",
        tip: "شارك في تحليل احتياجات المستخدمين، وافهم الـ Business Context، وحاول تحول الاحتياجات لحلول واضحة."
      },
      B: {
        title: "Judgment & Decision Making",
        message: "أنت شايف إن تقييم الحلول وفهم القرارات والتعامل مع المواقف غير المتوقعة من أهم قيمك.",
        tip: "مارس تحليل البدائل، وتقييم المخاطر، وتبرير القرارات في مواقف عملية."
      },
      C: {
        title: "Execution & Quality",
        message: "أنت شايف إن الإنجاز والتنظيم ومتابعة الجودة من أهم الجوانب اللي بتضيفها للفريق.",
        tip: "حسن إدارة المهام، وحدد معايير الجودة، واستخدم AI لتسريع التنفيذ مع الحفاظ على مسؤوليتك عن النتيجة."
      }
    },

    cta: {
      heading: "متسيبش AI يفكر مكانك… اتعلم إزاي تفكر وتشتغل معاه.",
      paragraphs: [
        "الذكاء الاصطناعي ممكن يساعدك تنجز أسرع، لكنه مش بديل عن فهمك للمشكلة، وقدرتك على مراجعة الحلول واتخاذ القرارات.",
        "في Codiz بنؤمن إن التعلم الحقيقي مش مجرد استخدام أدوات جديدة؛ لكن إنك تعرف تطبقها في مواقف عملية وتتحمل مسؤولية النتيجة."
      ],
      card: {
        title: "Build Smarter with AI",
        description: "تعرف على طرق استخدام AI في تطوير الأفكار وتنفيذ المهام، وكتابة Prompts فعالة، ومراجعة وفهم مخرجات الأدوات بدل الاعتماد عليها بشكل أعمى.",
        button: "اكتشف ورشة Codiz"
      }
    }
  };
});
