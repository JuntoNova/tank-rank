window.TANK_RANK = {
  version: "0.5.2-prototype",
  updated: "2026-09-06",
  currentYear: 2027,
  nextYear: 2028,
  firstYear: 1947,
  horizonYear: 2029,
  years: [],
  disclaimer: "Prototype board. Probability columns unavailable until the published model is connected.",
  buckets: ["college", "high-school", "international"],
  drafts: {}
};

(function () {
  var EXACT = "Prototype board. Probability columns unavailable until the published model is connected.";
  function load(url) {
    var x = new XMLHttpRequest();
    x.open("GET", url, false);
    x.send();
    return x.responseText;
  }
  // Load pack data from the pre-cut data.js blob (same packs), then re-assert Hitch disclaimer.
  var src = load("https://cdn.jsdelivr.net/gh/JuntoNova/tank-rank@eac798e8700b50de98de25e2ac9dd62c7f3ddfb5/assets/data.js");
  var saved = {
    disclaimer: EXACT,
    version: TANK_RANK.version,
    updated: TANK_RANK.updated
  };
  eval(src);
  TANK_RANK.disclaimer = saved.disclaimer;
  TANK_RANK.version = saved.version;
  TANK_RANK.updated = saved.updated;
})();
