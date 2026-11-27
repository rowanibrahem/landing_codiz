/*
 * Codiz — Lucky Wheel settings (edit here, no code changes needed).
 *
 * segments: the wheel slices in order (clockwise from the top). Repeat a prize on several slices to
 *           make it appear more than once. `weight` = chance of that slice being the result
 *           (relative to the sum of all weights — higher = more likely).
 * type:     "discount" | "free" | "friend" | "none"   ("none" = no reward, no ticket)
 */
window.CODIZ_WHEEL = {
  enabled: true,
  showDelayMs: 1500,          // popup appears this long after the landing page opens
  validDays: 7,               // reward validity
  storageKey: "codiz-wheel-v1",
  contactPageUrl: "https://www.facebook.com/codiztech/",   // where winners send the screenshot
  // leave null to reuse the same Google Apps Script endpoint used by the site's other forms
  formEndpoint: null,

  segments: [
    { id: "d5-a",  label: "خصم 5%",          type: "discount", value: 5,  weight: 22,
      title: "خصم 5%", desc: "على أي برنامج تدريبي من برامجنا التدريبية." },
    { id: "none-a", label: "حظ أوفر",        type: "none",     weight: 16,
      title: "حظ أوفر المرة القادمة", desc: "ماحصلتش على جايزة المرة دي، بس لسه فيه فرص جاية معانا." },
    { id: "d10-a", label: "خصم 10%",         type: "discount", value: 10, weight: 12,
      title: "خصم 10%", desc: "على أي برنامج تدريبي من برامجنا التدريبية." },
    { id: "d5-b",  label: "خصم 5%",          type: "discount", value: 5,  weight: 22,
      title: "خصم 5%", desc: "على أي برنامج تدريبي من برامجنا التدريبية." },
    { id: "friend", label: "30% + صاحبك",    type: "friend",   value: 30, weight: 6,
      title: "هات صاحبك وخد خصم 30%", desc: "هات صاحبك واشتركوا مع بعض في برنامج تدريبي وخد خصم 30%." },
    { id: "none-b", label: "حظ أوفر",        type: "none",     weight: 16,
      title: "حظ أوفر المرة القادمة", desc: "ماحصلتش على جايزة المرة دي، بس لسه فيه فرص جاية معانا." },
    { id: "d10-b", label: "خصم 10%",         type: "discount", value: 10, weight: 12,
      title: "خصم 10%", desc: "على أي برنامج تدريبي من برامجنا التدريبية." },
    { id: "free",  label: "مكان مجانًا",     type: "free",
      weight: 4,
      title: "مكان مجانًا", desc: "مكان مجاني في برنامج تدريبي — تواصل معانا علشان نأكدلك التفاصيل." }
  ]
};
