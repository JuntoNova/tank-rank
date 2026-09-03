window.TANK_RANK = {
  version: "0.5.0-prototype",
  updated: "2026-09-02",
  currentYear: 2027,
  nextYear: 2028,
  firstYear: 1947,
  horizonYear: 2029,
  years: [],
  disclaimer: "Prototype boards. Ranks and probabilities are illustrative placeholders until the ranking engine is connected.",
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
      pHof: o.pHof ?? 0.04,
      pAllNba: o.pAllNba ?? 0.14,
      pAllStar: o.pAllStar ?? 0.32,
      pBust: o.pBust ?? 0.22,
      expWs: o.expWs ?? 28,
      delta: o.delta ?? 0,
      wt: o.wt ?? 210,
      age: o.age ?? 19.2,
      ht: o.ht ?? "6-7",
      ...o
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

  pack(2027, "2027 NBA Draft", "Current living board.", [
    { id: "tyran-stokes", name: "Tyran Stokes", bucket: "college", school: "Kansas", pos: "F", age: 19.1, ht: "6-7", wt: 230, pHof: 0.12, pAllNba: 0.34, pAllStar: 0.55, pBust: 0.16, expWs: 51.2, delta: 0 },
    { id: "caleb-holt", name: "Caleb Holt", bucket: "college", school: "Arizona", pos: "G/F", age: 19.2, ht: "6-5", wt: 200, pHof: 0.06, pAllNba: 0.22, pAllStar: 0.44, pBust: 0.19, expWs: 38.4, delta: 1 },
    { id: "jordan-smith-jr", name: "Jordan Smith Jr.", bucket: "college", school: "Arkansas", pos: "G", age: 19.0, ht: "6-2", wt: 200, pHof: 0.05, pAllNba: 0.20, pAllStar: 0.42, pBust: 0.21, expWs: 36.1, delta: 2 },
    { id: "bruce-branch", name: "Bruce Branch III", bucket: "college", school: "BYU", pos: "F", age: 19.3, ht: "6-7", wt: 205, pHof: 0.05, pAllNba: 0.19, pAllStar: 0.40, pBust: 0.20, expWs: 34.8, delta: -1 },
    { id: "alijah-arenas", name: "Alijah Arenas", bucket: "college", school: "USC", pos: "G", age: 19.4, ht: "6-6", wt: 199, pHof: 0.04, pAllNba: 0.17, pAllStar: 0.37, pBust: 0.24, expWs: 31.6, delta: 3 },
    { id: "braylon-mullins", name: "Braylon Mullins", bucket: "college", school: "UConn", pos: "G", age: 20.1, ht: "6-5", wt: 190, pHof: 0.03, pAllNba: 0.15, pAllStar: 0.35, pBust: 0.18, expWs: 30.2, delta: 4 },
    { id: "amari-allen", name: "Amari Allen", bucket: "college", school: "Alabama", pos: "F", age: 20.0, ht: "6-8", wt: 215, pHof: 0.03, pAllNba: 0.14, pAllStar: 0.33, pBust: 0.22, expWs: 28.7, delta: 5 },
    { id: "sayon-keita", name: "Sayon Keita", bucket: "college", school: "North Carolina", pos: "C", age: 19.6, ht: "6-11", wt: 240, pHof: 0.03, pAllNba: 0.13, pAllStar: 0.30, pBust: 0.26, expWs: 27.1, delta: 1 },
    { id: "dylan-mingo", name: "Dylan Mingo", bucket: "college", school: "Baylor", pos: "G", age: 19.2, ht: "6-5", wt: 195, pHof: 0.03, pAllNba: 0.12, pAllStar: 0.29, pBust: 0.25, expWs: 26.4, delta: -2 },
    { id: "cam-williams", name: "Cam Williams", bucket: "college", school: "Duke", pos: "G", age: 19.1, ht: "6-4", wt: 190, pHof: 0.02, pAllNba: 0.11, pAllStar: 0.27, pBust: 0.27, expWs: 24.8, delta: 2 },
    { id: "hugo-yimga", name: "Hugo Yimga-Moukouri", bucket: "international", school: "France", pos: "F", age: 18.8, ht: "6-9", wt: 215, pHof: 0.04, pAllNba: 0.16, pAllStar: 0.34, pBust: 0.27, expWs: 29.4, delta: 6 },
    { id: "stefan-joksimovic", name: "Stefan Joksimovic", bucket: "international", school: "Serbia", pos: "C", age: 19.1, ht: "7-0", wt: 240, pHof: 0.03, pAllNba: 0.13, pAllStar: 0.29, pBust: 0.31, expWs: 25.6, delta: 4 },
    { id: "cameron-houindo", name: "Cameron Houindo", bucket: "international", school: "France", pos: "F", age: 19.0, ht: "6-9", wt: 220, pHof: 0.02, pAllNba: 0.10, pAllStar: 0.24, pBust: 0.33, expWs: 21.8, delta: 5 },
    { id: "tounde-yessoufou", name: "Tounde Yessoufou", bucket: "college", school: "Baylor", pos: "F", age: 20.2, ht: "6-6", wt: 215, pHof: 0.02, pAllNba: 0.11, pAllStar: 0.26, pBust: 0.23, expWs: 23.9, delta: 3 }
  ]);

  pack(2028, "2028 NBA Draft", "Next class. High school bucket opens here.", [
    { id: "beckham-black", name: "Beckham Black", bucket: "high-school", school: "2028 class", pos: "G", age: 16.8, ht: "6-4", wt: 185, pHof: 0.06, pAllNba: 0.21, pAllStar: 0.43, pBust: 0.20, expWs: 37.0, delta: 0 },
    { id: "aj-williams", name: "AJ Williams", bucket: "high-school", school: "2028 class", pos: "G", age: 16.6, ht: "6-5", wt: 180, pHof: 0.05, pAllNba: 0.18, pAllStar: 0.39, pBust: 0.23, expWs: 33.2, delta: 1 },
    { id: "adan-diggs", name: "Adan Diggs", bucket: "high-school", school: "2028 class", pos: "F", age: 16.7, ht: "6-8", wt: 210, pHof: 0.04, pAllNba: 0.16, pAllStar: 0.36, pBust: 0.24, expWs: 30.5, delta: 2 },
    { id: "christian-collins", name: "Christian Collins", bucket: "high-school", school: "USC commit", pos: "F", age: 17.0, ht: "6-8", wt: 205, pHof: 0.03, pAllNba: 0.12, pAllStar: 0.28, pBust: 0.28, expWs: 24.1, delta: 3 },
    { id: "nate-ahrens", name: "Nate Ahrens", bucket: "college", school: "TBD", pos: "F", age: 18.4, ht: "6-9", wt: 215, pHof: 0.04, pAllNba: 0.15, pAllStar: 0.34, pBust: 0.26, expWs: 28.8, delta: 2 },
    { id: "luka-petrovic", name: "Luka Petrovic", bucket: "international", school: "Serbia", pos: "G", age: 18.2, ht: "6-6", wt: 190, pHof: 0.03, pAllNba: 0.13, pAllStar: 0.30, pBust: 0.29, expWs: 25.0, delta: 4 }
  ]);

  pack(2029, "2029 NBA Draft", "Two years out. High school bucket stays open.", [
    { id: "2029-hs-1", name: "Eli Ellis", bucket: "high-school", school: "2029 class", pos: "G", age: 15.9, ht: "6-3", pHof: 0.05, pAllNba: 0.18, pAllStar: 0.38, pBust: 0.24, expWs: 32.0, delta: 0 },
    { id: "2029-hs-2", name: "Camden Ward", bucket: "high-school", school: "2029 class", pos: "F", age: 16.0, ht: "6-8", pHof: 0.04, pAllNba: 0.16, pAllStar: 0.34, pBust: 0.26, expWs: 29.1, delta: 1 },
    { id: "2029-int-1", name: "Mateo Kovac", bucket: "international", school: "Croatia", pos: "F", age: 16.4, ht: "6-10", pHof: 0.03, pAllNba: 0.14, pAllStar: 0.30, pBust: 0.30, expWs: 24.6, delta: 3 }
  ]);

  TANK_RANK.futureYears = [2027, 2028, 2029];
  TANK_RANK.historicYears = [];
  for (let y = 2026; y >= 1947; y--) TANK_RANK.historicYears.push(y);
  TANK_RANK.years = TANK_RANK.futureYears.concat(TANK_RANK.historicYears);
})();
