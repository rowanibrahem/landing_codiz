/* Codiz — renders the "Meet Our Instructors" cards from instructors-data.js */
(function () {
  "use strict";
  var list = window.CODIZ_INSTRUCTORS || [];
  var mount = document.querySelector("[data-inst-mount]");
  if (!mount || !list.length) return;

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function initials(n) {
    return String(n).trim().split(/\s+/).slice(0, 2).map(function (p) { return p.charAt(0); }).join("").toUpperCase();
  }

  mount.innerHTML = list.map(function (p) {
    var photo = p.photo
      ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy">'
      : '<span aria-hidden="true">' + esc(initials(p.name)) + "</span>";
    return '<article class="inst-card rv">' +
      '<div class="inst-photo">' + photo + "</div>" +
      '<h3 class="inst-name">' + esc(p.name) + "</h3>" +
      (p.title ? '<div class="inst-role">' + esc(p.title) + "</div>" : "") +
      '<p class="inst-bio">' + esc(p.bio) + "</p></article>";
  }).join("");

  // If a photo fails to load, fall back to initials
  Array.prototype.forEach.call(mount.querySelectorAll(".inst-photo img"), function (img, i) {
    img.addEventListener("error", function () {
      var s = document.createElement("span");
      s.setAttribute("aria-hidden", "true");
      s.textContent = initials(list[i].name);
      img.replaceWith(s);
    });
  });
})();

