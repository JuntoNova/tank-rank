/* F2a: pack vs depth disclose on living boards deeper than theory pack. Hitch voice. */
(function () {
  function note() {
    var y = Number(new URLSearchParams(location.search).get("year")) || (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
    var cur = (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
    if (y < cur) return;
    var draft = window.TANK_RANK && TANK_RANK.drafts && TANK_RANK.drafts[y];
    if (!draft || !draft.players || draft.players.length <= 62) return;
    if (document.querySelector(".banner.pack-depth")) return;
    var text = "Theory-pack features cover picks 1–62. Picks 63–100 use slot×origin fallback only.";
    var host = document.querySelector(".banner") || document.querySelector(".section-head");
    if (!host) return;
    var el = document.createElement("div");
    el.className = "banner pack-depth";
    el.textContent = text;
    if (host.classList.contains("banner") && host.parentNode) host.parentNode.insertBefore(el, host.nextSibling);
    else host.appendChild(el);
  }
  note();
  setInterval(note, 500);
})();
