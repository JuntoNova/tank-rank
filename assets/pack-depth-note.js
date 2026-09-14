/* F2a: pack vs depth disclose on living boards deeper than theory pack. Hitch Exact. Sara mute chrome. */
(function () {
  function note() {
    var y = Number(new URLSearchParams(location.search).get("year")) || (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
    var cur = (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
    if (y < cur) return;
    var draft = window.TANK_RANK && TANK_RANK.drafts && TANK_RANK.drafts[y];
    if (!draft || !draft.players || draft.players.length <= 62) return;
    if (document.querySelector(".pack-depth-note")) return;
    var text = "Theory-pack features cover picks 1–62. Picks 63–100 are depth fills with thinner inputs. Method is on Methodology.";
    var host = document.querySelector(".section-head");
    if (!host || !host.parentNode) return;
    var el = document.createElement("p");
    el.className = "pack-depth-note";
    el.textContent = text;
    host.parentNode.insertBefore(el, host.nextSibling);
  }
  note();
  setInterval(note, 500);
})();
