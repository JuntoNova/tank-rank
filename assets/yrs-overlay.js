(function () {
  function fillLastClass() {
    if (!window.TANK_RANK) return;
    var cur = TANK_RANK.currentYear || 2027;
    var draft = TANK_RANK.drafts[cur - 1];
    if (!draft) return;
    (draft.players || []).forEach(function (p) {
      if (p.yrs == null || p.yrs === "") p.yrs = 0;
    });
  }
  fillLastClass();
  var q = document.querySelector("#q");
  if (q) q.dispatchEvent(new Event("input", { bubbles: true }));
})();
