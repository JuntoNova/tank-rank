(function () {
  function featFromPage() {
    const y = Number(new URLSearchParams(location.search).get("year")) || (window.TANK_RANK && TANK_RANK.currentYear);
    const id = new URLSearchParams(location.search).get("id");
    const draft = window.TANK_RANK && TANK_RANK.drafts[y];
    if (!draft) return null;
    const list = draft.players || [];
    const p = list.find(function (x) { return x.id === id; }) || list[0] || {};
    return Object.assign({}, p.theoryFeat || {}, p);
  }
  function tryPaint() {
    if (!window.TR || !TR.paintSize || !TR.Size) return;
    const root = document.getElementById("app") || document.body;
    if (!root || !root.querySelector(".player-hero, .th-player")) return;
    const feat = featFromPage();
    if (!feat || (!feat.ht && !feat.wt && !feat.name)) return;
    const key = String(feat.ht || "") + "|" + String(feat.wt || "");
    if (root.querySelector(".th-size") && window.__TDM_SIZE_KEY === key) return;
    window.__TDM_SIZE_KEY = key;
    TR.paintSize(root, feat);
  }
  [300, 800, 1600, 3200].forEach(function (ms) { setTimeout(tryPaint, ms); });
})();
