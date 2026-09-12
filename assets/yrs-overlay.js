(function () {
  function apply(all) {
    if (!all || !window.TANK_RANK) return;
    Object.keys(TANK_RANK.drafts || {}).forEach(function (ys) {
      const pack = all[ys];
      if (!pack) return;
      (TANK_RANK.drafts[ys].players || []).forEach(function (p) {
        const y = pack[String(p.rank)];
        if (y == null) return;
        if (p.yrs == null || p.yrs === "") p.yrs = y;
      });
    });
    const q = document.querySelector("#q");
    if (q) q.dispatchEvent(new Event("input", { bubbles: true }));
  }
  fetch("./assets/career-yrs.json").then(function (r) { return r.ok ? r.json() : null; }).then(apply).catch(function () {});
})();
