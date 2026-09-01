window.TANK_RANK = {
  version: "0.2.0-prototype",
  updated: "2026-09-01",
  currentYear: 2027,
  years: [2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017],
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
    { id: "beckham-black", name: "Beckham Black", bucket: "high-school", school: "2027 class", pos: "G", age: 17.8, ht: "6-4", wt: 185, pHof: 0.06, pAllNba: 0.21, pAllStar: 0.43, pBust: 0.20, expWs: 37.0, delta: 0 },
    { id: "aj-williams", name: "AJ Williams", bucket: "high-school", school: "2027 class", pos: "G", age: 17.6, ht: "6-5", wt: 180, pHof: 0.05, pAllNba: 0.18, pAllStar: 0.39, pBust: 0.23, expWs: 33.2, delta: 1 },
    { id: "adan-diggs", name: "Adan Diggs", bucket: "high-school", school: "2027 class", pos: "F", age: 17.7, ht: "6-8", wt: 210, pHof: 0.04, pAllNba: 0.16, pAllStar: 0.36, pBust: 0.24, expWs: 30.5, delta: 2 },
    { id: "christian-collins", name: "Christian Collins", bucket: "high-school", school: "USC commit", pos: "F", age: 18.0, ht: "6-8", wt: 205, pHof: 0.03, pAllNba: 0.12, pAllStar: 0.28, pBust: 0.28, expWs: 24.1, delta: 3 },
    { id: "hugo-yimga", name: "Hugo Yimga-Moukouri", bucket: "international", school: "France", pos: "F", age: 18.8, ht: "6-9", wt: 215, pHof: 0.04, pAllNba: 0.16, pAllStar: 0.34, pBust: 0.27, expWs: 29.4, delta: 6 },
    { id: "stefan-joksimovic", name: "Stefan Joksimovic", bucket: "international", school: "Serbia", pos: "C", age: 19.1, ht: "7-0", wt: 240, pHof: 0.03, pAllNba: 0.13, pAllStar: 0.29, pBust: 0.31, expWs: 25.6, delta: 4 },
    { id: "cameron-houindo", name: "Cameron Houindo", bucket: "international", school: "France", pos: "F", age: 19.0, ht: "6-9", wt: 220, pHof: 0.02, pAllNba: 0.10, pAllStar: 0.24, pBust: 0.33, expWs: 21.8, delta: 5 },
    { id: "tounde-yessoufou", name: "Tounde Yessoufou", bucket: "college", school: "Baylor", pos: "F", age: 20.2, ht: "6-6", wt: 215, pHof: 0.02, pAllNba: 0.11, pAllStar: 0.26, pBust: 0.23, expWs: 23.9, delta: 3 }
  ]);

  pack(2026, "2026 NBA Draft", "Completed June 2026. Prototype reconstruction.", [
    { id: "aj-dybantsa", name: "AJ Dybantsa", bucket: "college", school: "BYU", pos: "F", ht: "6-9", pHof: 0.14, pAllNba: 0.36, pAllStar: 0.58, pBust: 0.14, expWs: 54.0 },
    { id: "cameron-boozer", name: "Cameron Boozer", bucket: "college", school: "Duke", pos: "F", ht: "6-9", pHof: 0.13, pAllNba: 0.35, pAllStar: 0.56, pBust: 0.12, expWs: 53.1, delta: 1 },
    { id: "darryn-peterson", name: "Darryn Peterson", bucket: "college", school: "Kansas", pos: "G", ht: "6-5", pHof: 0.08, pAllNba: 0.26, pAllStar: 0.48, pBust: 0.17, expWs: 42.0, delta: -1 },
    { id: "caleb-wilson", name: "Caleb Wilson", bucket: "college", school: "North Carolina", pos: "F", ht: "6-10", pHof: 0.04, pAllNba: 0.16, pAllStar: 0.35, pBust: 0.23, expWs: 30.2, delta: 2 },
    { id: "sergio-de-larrea", name: "Sergio de Larrea", bucket: "international", school: "Spain", pos: "G", pHof: 0.03, pAllNba: 0.12, pAllStar: 0.28, pBust: 0.29, expWs: 24.4, delta: 8 }
  ]);

  pack(2025, "2025 NBA Draft", "Archive class. Prototype reconstruction.", [
    { id: "cooper-flagg", name: "Cooper Flagg", bucket: "college", school: "Duke", pos: "F", ht: "6-9", pHof: 0.22, pAllNba: 0.48, pAllStar: 0.71, pBust: 0.08, expWs: 72.0 },
    { id: "dylan-harper", name: "Dylan Harper", bucket: "college", school: "Rutgers", pos: "G", ht: "6-6", pHof: 0.08, pAllNba: 0.27, pAllStar: 0.50, pBust: 0.16, expWs: 44.8, delta: 0 },
    { id: "ace-bailey", name: "Ace Bailey", bucket: "college", school: "Rutgers", pos: "F", ht: "6-8", pHof: 0.07, pAllNba: 0.24, pAllStar: 0.46, pBust: 0.18, expWs: 41.2, delta: 1 },
    { id: "vj-edgecombe", name: "VJ Edgecombe", bucket: "college", school: "Baylor", pos: "G", ht: "6-5", pHof: 0.05, pAllNba: 0.18, pAllStar: 0.38, pBust: 0.21, expWs: 34.0, delta: 2 },
    { id: "kon-knueppel", name: "Kon Knueppel", bucket: "college", school: "Duke", pos: "G/F", ht: "6-7", pHof: 0.04, pAllNba: 0.16, pAllStar: 0.35, pBust: 0.17, expWs: 32.1, delta: 4 }
  ]);

  pack(2024, "2024 NBA Draft", "Archive class. Prototype reconstruction.", [
    { id: "zac-risacher", name: "Zaccharie Risacher", bucket: "international", school: "JL Bourg", pos: "F", ht: "6-9", pHof: 0.04, pAllNba: 0.16, pAllStar: 0.36, pBust: 0.22, expWs: 31.4 },
    { id: "alex-sarr", name: "Alex Sarr", bucket: "international", school: "Perth", pos: "C", ht: "7-1", pHof: 0.05, pAllNba: 0.18, pAllStar: 0.38, pBust: 0.26, expWs: 33.0, delta: 1 },
    { id: "stephon-castle", name: "Stephon Castle", bucket: "college", school: "UConn", pos: "G", ht: "6-6", pHof: 0.04, pAllNba: 0.17, pAllStar: 0.40, pBust: 0.18, expWs: 34.6, delta: 2 },
    { id: "reed-sheppard", name: "Reed Sheppard", bucket: "college", school: "Kentucky", pos: "G", ht: "6-3", pHof: 0.03, pAllNba: 0.14, pAllStar: 0.33, pBust: 0.19, expWs: 28.8, delta: 3 }
  ]);

  pack(2023, "2023 NBA Draft", "Archive class. Prototype reconstruction.", [
    { id: "wemby", name: "Victor Wembanyama", bucket: "international", school: "Metropolitans 92", pos: "C", ht: "7-4", pHof: 0.41, pAllNba: 0.72, pAllStar: 0.86, pBust: 0.07, expWs: 98.0 },
    { id: "brandon-miller", name: "Brandon Miller", bucket: "college", school: "Alabama", pos: "F", ht: "6-9", pHof: 0.04, pAllNba: 0.18, pAllStar: 0.39, pBust: 0.20, expWs: 34.2, delta: 0 },
    { id: "scoot", name: "Scoot Henderson", bucket: "high-school", school: "G League Ignite", pos: "G", ht: "6-3", pHof: 0.03, pAllNba: 0.14, pAllStar: 0.32, pBust: 0.28, expWs: 27.5, delta: -2 },
    { id: "amen", name: "Amen Thompson", bucket: "high-school", school: "Overtime Elite", pos: "G/F", ht: "6-7", pHof: 0.05, pAllNba: 0.20, pAllStar: 0.42, pBust: 0.21, expWs: 36.8, delta: 4 }
  ]);

  pack(2022, "2022 NBA Draft", "Archive class. Prototype reconstruction.", [
    { id: "paolo", name: "Paolo Banchero", bucket: "college", school: "Duke", pos: "F", ht: "6-10", pHof: 0.08, pAllNba: 0.28, pAllStar: 0.52, pBust: 0.14, expWs: 46.0 },
    { id: "chet", name: "Chet Holmgren", bucket: "college", school: "Gonzaga", pos: "C", ht: "7-1", pHof: 0.07, pAllNba: 0.26, pAllStar: 0.48, pBust: 0.18, expWs: 43.2, delta: 1 },
    { id: "jabari", name: "Jabari Smith Jr.", bucket: "college", school: "Auburn", pos: "F", ht: "6-10", pHof: 0.03, pAllNba: 0.14, pAllStar: 0.33, pBust: 0.22, expWs: 29.4, delta: -1 },
    { id: "jalen-williams", name: "Jalen Williams", bucket: "college", school: "Santa Clara", pos: "F", ht: "6-6", pHof: 0.05, pAllNba: 0.22, pAllStar: 0.45, pBust: 0.16, expWs: 39.1, delta: 10 }
  ]);

  pack(2021, "2021 NBA Draft", "Archive class. Prototype reconstruction.", [
    { id: "cade", name: "Cade Cunningham", bucket: "college", school: "Oklahoma State", pos: "G", ht: "6-6", pHof: 0.09, pAllNba: 0.30, pAllStar: 0.54, pBust: 0.15, expWs: 48.2 },
    { id: "mobley", name: "Evan Mobley", bucket: "college", school: "USC", pos: "C", ht: "6-11", pHof: 0.08, pAllNba: 0.29, pAllStar: 0.51, pBust: 0.14, expWs: 46.6, delta: 1 },
    { id: "barnes", name: "Scottie Barnes", bucket: "college", school: "Florida State", pos: "F", ht: "6-8", pHof: 0.05, pAllNba: 0.20, pAllStar: 0.42, pBust: 0.18, expWs: 37.0, delta: 3 },
    { id: "franz", name: "Franz Wagner", bucket: "college", school: "Michigan", pos: "F", ht: "6-10", pHof: 0.04, pAllNba: 0.18, pAllStar: 0.40, pBust: 0.16, expWs: 35.5, delta: 6 }
  ]);

  pack(2020, "2020 NBA Draft", "Archive class. Prototype reconstruction.", [
    { id: "ant", name: "Anthony Edwards", bucket: "college", school: "Georgia", pos: "G", ht: "6-4", pHof: 0.16, pAllNba: 0.42, pAllStar: 0.66, pBust: 0.11, expWs: 61.0 },
    { id: "lamelo", name: "LaMelo Ball", bucket: "international", school: "Illawarra", pos: "G", ht: "6-7", pHof: 0.06, pAllNba: 0.24, pAllStar: 0.48, pBust: 0.20, expWs: 41.2, delta: 1 },
    { id: "halliburton", name: "Tyrese Haliburton", bucket: "college", school: "Iowa State", pos: "G", ht: "6-5", pHof: 0.07, pAllNba: 0.26, pAllStar: 0.50, pBust: 0.14, expWs: 44.8, delta: 9 },
    { id: "wiseman", name: "James Wiseman", bucket: "college", school: "Memphis", pos: "C", ht: "7-1", pHof: 0.01, pAllNba: 0.05, pAllStar: 0.14, pBust: 0.48, expWs: 12.4, delta: -8 }
  ]);

  pack(2019, "2019 NBA Draft", "Archive class. Prototype reconstruction.", [
    { id: "zion", name: "Zion Williamson", bucket: "college", school: "Duke", pos: "F", ht: "6-6", pHof: 0.08, pAllNba: 0.28, pAllStar: 0.52, pBust: 0.24, expWs: 45.0 },
    { id: "ja", name: "Ja Morant", bucket: "college", school: "Murray State", pos: "G", ht: "6-3", pHof: 0.07, pAllNba: 0.26, pAllStar: 0.50, pBust: 0.16, expWs: 44.1, delta: 1 },
    { id: "garland", name: "Darius Garland", bucket: "college", school: "Vanderbilt", pos: "G", ht: "6-1", pHof: 0.03, pAllNba: 0.16, pAllStar: 0.38, pBust: 0.20, expWs: 32.6, delta: 4 },
    { id: "herro", name: "Tyler Herro", bucket: "college", school: "Kentucky", pos: "G", ht: "6-5", pHof: 0.02, pAllNba: 0.12, pAllStar: 0.30, pBust: 0.18, expWs: 27.8, delta: 6 }
  ]);

  pack(2018, "2018 NBA Draft", "Archive class. Prototype reconstruction.", [
    { id: "ayton", name: "Deandre Ayton", bucket: "college", school: "Arizona", pos: "C", ht: "7-0", pHof: 0.03, pAllNba: 0.14, pAllStar: 0.32, pBust: 0.22, expWs: 30.0 },
    { id: "luka", name: "Luka Dončić", bucket: "international", school: "Real Madrid", pos: "G", ht: "6-7", pHof: 0.38, pAllNba: 0.78, pAllStar: 0.90, pBust: 0.05, expWs: 110.0, delta: 2 },
    { id: "trae", name: "Trae Young", bucket: "college", school: "Oklahoma", pos: "G", ht: "6-1", pHof: 0.06, pAllNba: 0.24, pAllStar: 0.48, pBust: 0.16, expWs: 42.4, delta: 3 },
    { id: "sga", name: "Shai Gilgeous-Alexander", bucket: "college", school: "Kentucky", pos: "G", ht: "6-6", pHof: 0.22, pAllNba: 0.55, pAllStar: 0.74, pBust: 0.10, expWs: 78.0, delta: 10 }
  ]);

  pack(2017, "2017 NBA Draft", "Archive class. Prototype reconstruction.", [
    { id: "fultz", name: "Markelle Fultz", bucket: "college", school: "Washington", pos: "G", ht: "6-4", pHof: 0.01, pAllNba: 0.04, pAllStar: 0.12, pBust: 0.46, expWs: 11.2 },
    { id: "lonzo", name: "Lonzo Ball", bucket: "college", school: "UCLA", pos: "G", ht: "6-6", pHof: 0.02, pAllNba: 0.08, pAllStar: 0.22, pBust: 0.28, expWs: 20.4, delta: 0 },
    { id: "tatum", name: "Jayson Tatum", bucket: "college", school: "Duke", pos: "F", ht: "6-8", pHof: 0.24, pAllNba: 0.58, pAllStar: 0.78, pBust: 0.08, expWs: 82.0, delta: 1 },
    { id: "fox", name: "De'Aaron Fox", bucket: "college", school: "Kentucky", pos: "G", ht: "6-3", pHof: 0.04, pAllNba: 0.18, pAllStar: 0.40, pBust: 0.16, expWs: 35.6, delta: 2 },
    { id: "mitchell", name: "Donovan Mitchell", bucket: "college", school: "Louisville", pos: "G", ht: "6-1", pHof: 0.08, pAllNba: 0.28, pAllStar: 0.54, pBust: 0.14, expWs: 48.5, delta: 10 }
  ]);
})();
