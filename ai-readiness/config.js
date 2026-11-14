/*
 * Codiz AI Readiness Quiz — editable settings.
 * Nothing here is sent anywhere: the quiz runs entirely in the browser.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.AIR_CONFIG = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    // Where the "اكتشف ورشة Codiz" button leads. No dedicated workshop registration link
    // exists yet, so it points to the existing Events page (lists the sessions and workshops
    // that are actually announced). Replace with a specific registration URL when available.
    // Relative to /ai-readiness/ — absolute URLs (https://…) also work.
    workshopCtaUrl: "../events.html",

    // Landing page (back to the main site).
    homeUrl: "../index.html",

    // Text used by the "شارك نتيجتك" button. {classification} and {score} are replaced.
    shareText: "جربت Codiz AI Readiness Quiz وطلعت: {classification} ({score}/18). جرّب اختبر جاهزيتك للتعامل مع AI:",

    // Optional analytics. The quiz never sends answers or personal data.
    // If a global `gtag` or `dataLayer` exists on the page, events are forwarded to it.
    // Add your own handler here if you need something else: window.CODIZ_TRACK = function (name, params) {…}
    trackedEvents: ["quiz_viewed", "quiz_started", "quiz_question_answered", "quiz_completed", "result_viewed", "workshop_cta_clicked", "result_shared"]
  };
});
