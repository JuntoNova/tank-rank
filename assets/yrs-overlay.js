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
  function apply(all) {
    if (all && window.TANK_RANK) {
      Object.keys(TANK_RANK.drafts || {}).forEach(function (ys) {
        const pack = all[ys];
        if (!pack) return;
        (TANK_RANK.drafts[ys].players || []).forEach(function (p) {
          const y = pack[String(p.rank)];
          if (y == null) return;
          if (p.yrs == null || p.yrs === "") p.yrs = y;
        });
      });
    }
    fillLastClass();
    const q = document.querySelector("#q");
    if (q) q.dispatchEvent(new Event("input", { bubbles: true }));
  }
  fillLastClass();
  fetch("./assets/career-yrs.json").then(function (r) { return r.ok ? r.json() : null; }).then(apply).catch(function () { apply(null); });
})();
