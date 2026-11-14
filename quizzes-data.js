/*
 * Codiz — "اختبر نفسك" (Self-Assessment Quizzes) data.
 *
 * To add a new quiz in the future, append a new item to `quizzes`:
 *   {
 *     id: "unique-id",
 *     title: "عنوان الاختبار",
 *     subtitle: "English or Arabic subtitle",
 *     category: "تصنيف الاختبار",
 *     badge: "مجاني",
 *     icon: "🤖",
 *     tone: "blush",              // blush | lav | sand | mint
 *     description: "وصف مختصر للاختبار...",
 *     meta: ["📝 10 أسئلة", "⏱️ 2–3 دقائق", "⚡ نتيجة فورية"],
 *     highlights: ["نقطة 1", "نقطة 2"],
 *     href: "ai-readiness/index.html",
 *     ctaLabel: "ابدأ الاختبار الآن",
 *     status: "available"         // "available" | "coming_soon"
 *   }
 */
window.CODIZ_QUIZZES = [
  {
    id: "ai-readiness",
    title: "Codiz AI Readiness Quiz",
    subtitle: "هل أنت جاهز تشتغل مع AI؟ · Are You Ready to Work with AI?",
    category: "AI Readiness",
    badge: "اختبار مجاني",
    icon: "🤖",
    tone: "blush",
    description:
      "اختبر طريقة تعاملك مع الذكاء الاصطناعي من خلال مواقف عملية، واكتشف نقاط قوتك والمهارات اللي محتاج تطورها عشان تستفيد من أدوات AI بذكاء في شغلك ومشاريعك.",
    meta: [
      "📝 10 أسئلة مواقف عملية",
      "⏱️ 2–3 دقائق",
      "⚡ نتيجة وتوصيات فورية"
    ],
    highlights: [
      "فهم المشكلات والتعاون مع AI",
      "التفكير النقدي والتحقق من النتائج",
      "الخصوصية والاستخدام المسؤول",
      "التطبيق العملي وبناء الحلول"
    ],
    href: "ai-readiness/index.html",
    ctaLabel: "ابدأ الاختبار الآن",
    status: "available"
  }
];
