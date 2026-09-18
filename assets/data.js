window.TANK_RANK = {
  version: "0.5.2",
  updated: "2026-09-06",
  currentYear: 2027,
  nextYear: 2028,
  firstYear: 1947,
  horizonYear: 2029,
  years: [],
  disclaimer: "",
  buckets: ["college", "high-school", "international"],
  drafts: {}
};

(function () {
  const F = {
    college: ["Age", "Usage efficiency", "Shooting skill"],
    "high-school": ["Age", "Frame", "Creation"],
    international: ["Age", "Competition level", "Translation"]
  };

  function row(o) {
    return {
      features: F[o.bucket] || F.college,
      ...o,
      pHof: null,
      pAllNba: null,
      pAllStar: null,
      pBust: null,
      expWs: null,
      delta: null
    };
  }

  function pack(year, label, note, list) {
    const byBucket = { college: 0, "high-school": 0, international: 0 };
    const players = list.map((p, i) => {
      byBucket[p.bucket] = (byBucket[p.bucket] || 0) + 1;
      return row({ ...p, rank: p.rank || i + 1, catRank: p.catRank || byBucket[p.bucket] });
    });
    TANK_RANK.drafts[year] = { year, label, note, players };
  }

  // CONTENT_CONTINUES_FROM_DISK
})();
