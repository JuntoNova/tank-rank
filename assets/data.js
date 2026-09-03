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

  function slug(name, year) {
    return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + year;
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

  const firsts = [
    [1947, "Clifton McNeely", "Texas Wesleyan", "G", "college", 0.00, 0.00, 0.00, 0.95, 0],
    [1948, "Andy Tonkovich", "Marshall", "G", "college", 0.00, 0.00, 0.00, 0.90, 2],
    [1949, "Howie Shannon", "Kansas State", "G", "college", 0.00, 0.00, 0.01, 0.70, 8],
    [1950, "Chuck Share", "Bowling Green", "C", "college", 0.00, 0.00, 0.02, 0.55, 18],
    [1951, "Gene Melchiorre", "Bradley", "G", "college", 0.00, 0.00, 0.00, 0.99, 0],
    [1952, "Mark Workman", "West Virginia", "C", "college", 0.00, 0.00, 0.00, 0.85, 3],
    [1953, "Ray Felix", "Long Island", "C", "college", 0.00, 0.02, 0.08, 0.40, 22],
    [1954, "Frank Selvy", "Furman", "G", "college", 0.00, 0.01, 0.06, 0.45, 16],
    [1955, "Dick Ricketts", "Duquesne", "F", "college", 0.00, 0.00, 0.01, 0.70, 8],
    [1956, "Sihugo Green", "Duquesne", "G", "college", 0.00, 0.00, 0.04, 0.50, 14],
    [1957, "Hot Rod Hundley", "West Virginia", "G", "college", 0.00, 0.01, 0.05, 0.48, 15],
    [1958, "Elgin Baylor", "Seattle", "F", "college", 0.62, 0.78, 0.90, 0.06, 120],
    [1959, "Bob Boozer", "Kansas State", "F", "college", 0.01, 0.06, 0.18, 0.28, 36],
    [1960, "Oscar Robertson", "Cincinnati", "G", "college", 0.72, 0.86, 0.94, 0.04, 140],
    [1961, "Walt Bellamy", "Indiana", "C", "college", 0.18, 0.22, 0.40, 0.16, 72],
    [1962, "Bill McGill", "Utah", "C", "college", 0.00, 0.00, 0.01, 0.80, 6],
    [1963, "Art Heyman", "Duke", "F", "college", 0.00, 0.01, 0.04, 0.60, 12],
    [1964, "Jim Barnes", "Texas Western", "C", "college", 0.00, 0.01, 0.03, 0.55, 14],
    [1965, "Fred Hetzel", "Davidson", "F", "college", 0.00, 0.01, 0.04, 0.50, 16],
    [1966, "Cazzie Russell", "Michigan", "F", "college", 0.00, 0.04, 0.12, 0.32, 28],
    [1967, "Jimmy Walker", "Providence", "G", "college", 0.00, 0.04, 0.14, 0.30, 30],
    [1968, "Elvin Hayes", "Houston", "F", "college", 0.28, 0.42, 0.62, 0.10, 88],
    [1969, "Kareem Abdul-Jabbar", "UCLA", "C", "college", 0.92, 0.96, 0.98, 0.02, 180],
    [1970, "Bob Lanier", "St. Bonaventure", "C", "college", 0.16, 0.22, 0.40, 0.14, 70],
    [1971, "Austin Carr", "Notre Dame", "G", "college", 0.00, 0.04, 0.12, 0.35, 28],
    [1972, "LaRue Martin", "Loyola Chicago", "C", "college", 0.00, 0.00, 0.01, 0.88, 4],
    [1973, "Doug Collins", "Illinois State", "G", "college", 0.01, 0.08, 0.22, 0.26, 38],
    [1974, "Bill Walton", "UCLA", "C", "college", 0.22, 0.28, 0.36, 0.32, 64],
    [1975, "David Thompson", "NC State", "G", "college", 0.12, 0.22, 0.38, 0.22, 58],
    [1976, "John Lucas", "Maryland", "G", "college", 0.00, 0.02, 0.08, 0.40, 22],
    [1977, "Kent Benson", "Indiana", "C", "college", 0.00, 0.01, 0.04, 0.62, 16],
    [1978, "Mychal Thompson", "Minnesota", "C", "college", 0.00, 0.04, 0.10, 0.28, 32],
    [1979, "Magic Johnson", "Michigan State", "G", "college", 0.88, 0.94, 0.97, 0.03, 155],
    [1980, "Joe Barry Carroll", "Purdue", "C", "college", 0.00, 0.04, 0.12, 0.48, 26],
    [1981, "Mark Aguirre", "DePaul", "F", "college", 0.01, 0.08, 0.22, 0.24, 42],
    [1982, "James Worthy", "North Carolina", "F", "college", 0.22, 0.28, 0.48, 0.12, 76],
    [1983, "Ralph Sampson", "Virginia", "C", "college", 0.02, 0.08, 0.18, 0.42, 34],
    [1984, "Hakeem Olajuwon", "Houston", "C", "college", 0.78, 0.86, 0.92, 0.05, 148],
    [1985, "Patrick Ewing", "Georgetown", "C", "college", 0.42, 0.55, 0.72, 0.08, 102],
    [1986, "Brad Daugherty", "North Carolina", "C", "college", 0.02, 0.10, 0.24, 0.30, 44],
    [1987, "David Robinson", "Navy", "C", "college", 0.48, 0.62, 0.78, 0.06, 112],
    [1988, "Danny Manning", "Kansas", "F", "college", 0.01, 0.08, 0.20, 0.28, 40],
    [1989, "Pervis Ellison", "Louisville", "C", "college", 0.00, 0.02, 0.06, 0.58, 14],
    [1990, "Derrick Coleman", "Syracuse", "F", "college", 0.01, 0.08, 0.20, 0.36, 38],
    [1991, "Larry Johnson", "UNLV", "F", "college", 0.01, 0.08, 0.18, 0.32, 36],
    [1992, "Shaquille O'Neal", "LSU", "C", "college", 0.72, 0.84, 0.92, 0.04, 142],
    [1993, "Chris Webber", "Michigan", "F", "college", 0.08, 0.22, 0.42, 0.18, 62],
    [1994, "Glenn Robinson", "Purdue", "F", "college", 0.01, 0.08, 0.20, 0.26, 40],
    [1995, "Joe Smith", "Maryland", "F", "college", 0.00, 0.02, 0.08, 0.40, 24],
    [1996, "Allen Iverson", "Georgetown", "G", "college", 0.28, 0.38, 0.62, 0.12, 84],
    [1997, "Tim Duncan", "Wake Forest", "F", "college", 0.82, 0.90, 0.95, 0.03, 158],
    [1998, "Michael Olowokandi", "Pacific", "C", "college", 0.00, 0.00, 0.02, 0.82, 8],
    [1999, "Elton Brand", "Duke", "F", "college", 0.02, 0.10, 0.24, 0.22, 48],
    [2000, "Kenyon Martin", "Cincinnati", "F", "college", 0.01, 0.06, 0.16, 0.30, 34],
    [2001, "Kwame Brown", "Glynn Academy", "C", "high-school", 0.00, 0.01, 0.04, 0.72, 12],
    [2002, "Yao Ming", "Shanghai Sharks", "C", "international", 0.12, 0.22, 0.40, 0.28, 58],
    [2003, "LeBron James", "St. Vincent-St. Mary", "F", "high-school", 0.96, 0.98, 0.99, 0.01, 200],
    [2004, "Dwight Howard", "SW Atlanta Christian", "C", "high-school", 0.08, 0.28, 0.52, 0.14, 78],
    [2005, "Andrew Bogut", "Utah", "C", "college", 0.01, 0.06, 0.14, 0.32, 36],
    [2006, "Andrea Bargnani", "Benetton Treviso", "F", "international", 0.00, 0.01, 0.04, 0.68, 14],
    [2007, "Greg Oden", "Ohio State", "C", "college", 0.00, 0.01, 0.04, 0.78, 8],
    [2008, "Derrick Rose", "Memphis", "G", "college", 0.04, 0.12, 0.28, 0.36, 42],
    [2009, "Blake Griffin", "Oklahoma", "F", "college", 0.04, 0.16, 0.38, 0.20, 56],
    [2010, "John Wall", "Kentucky", "G", "college", 0.02, 0.12, 0.32, 0.24, 48],
    [2011, "Kyrie Irving", "Duke", "G", "college", 0.08, 0.22, 0.48, 0.16, 62],
    [2012, "Anthony Davis", "Kentucky", "F", "college", 0.22, 0.48, 0.68, 0.10, 96],
    [2013, "Anthony Bennett", "UNLV", "F", "college", 0.00, 0.00, 0.01, 0.88, 4],
    [2014, "Andrew Wiggins", "Kansas", "F", "college", 0.01, 0.08, 0.22, 0.26, 40],
    [2015, "Karl-Anthony Towns", "Kentucky", "C", "college", 0.06, 0.22, 0.42, 0.16, 64],
    [2016, "Ben Simmons", "LSU", "G", "college", 0.01, 0.08, 0.20, 0.42, 32]
  ];

  const extras = {
    1969: [{ name: "Julius Erving", school: "UMass / ABA", pos: "F", bucket: "college", pHof: 0.70, pAllNba: 0.80, pAllStar: 0.88, pBust: 0.06, expWs: 125, delta: 12 }],
    1979: [{ name: "Sidney Moncrief", school: "Arkansas", pos: "G", bucket: "college", pHof: 0.08, pAllNba: 0.22, pAllStar: 0.36, pBust: 0.16, expWs: 58, delta: 4 }],
    1984: [{ name: "Michael Jordan", school: "North Carolina", pos: "G", bucket: "college", pHof: 0.98, pAllNba: 0.99, pAllStar: 0.99, pBust: 0.01, expWs: 214, delta: 2 }],
    1996: [
      { name: "Kobe Bryant", school: "Lower Merion", pos: "G", bucket: "high-school", pHof: 0.86, pAllNba: 0.90, pAllStar: 0.94, pBust: 0.04, expWs: 172, delta: 12 },
      { name: "Steve Nash", school: "Santa Clara", pos: "G", bucket: "college", pHof: 0.42, pAllNba: 0.55, pAllStar: 0.62, pBust: 0.10, expWs: 98, delta: 14 }
    ],
    1998: [
      { name: "Dirk Nowitzki", school: "DJK Wurzburg", pos: "F", bucket: "international", pHof: 0.62, pAllNba: 0.72, pAllStar: 0.82, pBust: 0.06, expWs: 145, delta: 8 },
      { name: "Paul Pierce", school: "Kansas", pos: "F", bucket: "college", pHof: 0.22, pAllNba: 0.32, pAllStar: 0.52, pBust: 0.12, expWs: 92, delta: 9 }
    ],
    2003: [
      { name: "Dwyane Wade", school: "Marquette", pos: "G", bucket: "college", pHof: 0.38, pAllNba: 0.48, pAllStar: 0.68, pBust: 0.08, expWs: 108, delta: 4 },
      { name: "Carmelo Anthony", school: "Syracuse", pos: "F", bucket: "college", pHof: 0.12, pAllNba: 0.22, pAllStar: 0.52, pBust: 0.12, expWs: 78, delta: 2 }
    ],
    2009: [{ name: "James Harden", school: "Arizona State", pos: "G", bucket: "college", pHof: 0.28, pAllNba: 0.52, pAllStar: 0.70, pBust: 0.10, expWs: 118, delta: 2 }],
    2011: [{ name: "Kawhi Leonard", school: "San Diego State", pos: "F", bucket: "college", pHof: 0.32, pAllNba: 0.55, pAllStar: 0.62, pBust: 0.14, expWs: 92, delta: 14 }],
    2013: [{ name: "Giannis Antetokounmpo", school: "Filathlitikos", pos: "F", bucket: "international", pHof: 0.48, pAllNba: 0.72, pAllStar: 0.80, pBust: 0.10, expWs: 128, delta: 14 }],
    2014: [{ name: "Nikola Jokic", school: "Mega Basket", pos: "C", bucket: "international", pHof: 0.62, pAllNba: 0.82, pAllStar: 0.86, pBust: 0.08, expWs: 140, delta: 40 }]
  };

  firsts.forEach(([year, name, school, pos, bucket, pHof, pAllNba, pAllStar, pBust, expWs]) => {
    if (TANK_RANK.drafts[year]) return;
    const list = [
      { id: slug(name, year), name, school, pos, bucket, pHof, pAllNba, pAllStar, pBust, expWs, delta: 0 }
    ];
    (extras[year] || []).forEach((p, i) => {
      list.push({ id: slug(p.name, year), ...p, rank: i + 2 });
    });
    const era = year <= 1949 ? "BAA draft. Counted in official NBA draft history." : "Archive class. Prototype reconstruction from the actual draft.";
    pack(year, year <= 1949 ? year + " BAA Draft" : year + " NBA Draft", era, list);
  });

  const years = [];
  for (let y = TANK_RANK.horizonYear; y >= TANK_RANK.firstYear; y--) years.push(y);
  TANK_RANK.years = years;
})();
