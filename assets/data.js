window.TANK_RANK = {
  version: "0.5.0-prototype",
  updated: "2026-09-05",
  currentYear: 2027,
  nextYear: 2028,
  firstYear: 1947,
  horizonYear: 2029,
  years: [],
  disclaimer: "Living boards. Order is a working consensus of public rankings until the model is connected.",
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

  pack(2027, "2027 NBA Draft", "Living 2027 board.", [
    { id: "tyran-stokes-2027", name: "Tyran Stokes", bucket: "college", school: "Kansas", pos: "F", age: 19.1, ht: "6-7", wt: 230, pHof: 0.12, pAllNba: 0.34, pAllStar: 0.55, expWs: 51 },
    { id: "caleb-holt-2027", name: "Caleb Holt", bucket: "college", school: "Arizona", pos: "G", age: 19.2, ht: "6-5", wt: 200, pHof: 0.08, pAllNba: 0.26, pAllStar: 0.48, expWs: 42 },
    { id: "jordan-smith-jr-2027", name: "Jordan Smith Jr.", bucket: "college", school: "Arkansas", pos: "G", age: 19.0, ht: "6-2", wt: 200, pHof: 0.07, pAllNba: 0.24, pAllStar: 0.46, expWs: 40 },
    { id: "bruce-branch-iii-2027", name: "Bruce Branch III", bucket: "college", school: "BYU", pos: "F", age: 18.9, ht: "6-7", wt: 190, pHof: 0.06, pAllNba: 0.22, pAllStar: 0.44, expWs: 38 },
    { id: "stefan-joksimovic-2027", name: "Stefan Joksimović", bucket: "international", school: "Baskonia", pos: "G", age: 18.6, ht: "6-7", wt: 205, pHof: 0.06, pAllNba: 0.21, pAllStar: 0.43, expWs: 37 },
    { id: "anthony-thompson-2027", name: "Anthony Thompson", bucket: "college", school: "Ohio State", pos: "F", age: 18.9, ht: "6-9", wt: 215, pHof: 0.05, pAllNba: 0.19, pAllStar: 0.40, expWs: 35 },
    { id: "cameron-williams-2027", name: "Cameron Williams", bucket: "college", school: "Duke", pos: "F", age: 19.1, ht: "6-11", wt: 200, pHof: 0.05, pAllNba: 0.18, pAllStar: 0.39, expWs: 34 },
    { id: "baba-oladotun-2027", name: "Baba Oladotun", bucket: "college", school: "Maryland", pos: "F", age: 18.5, ht: "6-10", wt: 195, pHof: 0.04, pAllNba: 0.16, pAllStar: 0.36, expWs: 32 },
    { id: "brandon-mccoy-jr-2027", name: "Brandon McCoy Jr.", bucket: "college", school: "Michigan", pos: "G", age: 19.2, ht: "6-5", wt: 190, pHof: 0.04, pAllNba: 0.15, pAllStar: 0.35, expWs: 31 },
    { id: "braylon-mullins-2027", name: "Braylon Mullins", bucket: "college", school: "UConn", pos: "G", age: 20.3, ht: "6-6", wt: 196, pHof: 0.04, pAllNba: 0.15, pAllStar: 0.34, expWs: 30 },
    { id: "hugo-yimga-moukouri-2027", name: "Hugo Yimga-Moukouri", bucket: "international", school: "Nanterre 92", pos: "F", age: 18.9, ht: "6-9", wt: 218, pHof: 0.03, pAllNba: 0.14, pAllStar: 0.32, expWs: 29 },
    { id: "amari-allen-2027", name: "Amari Allen", bucket: "college", school: "Alabama", pos: "F", age: 20.4, ht: "6-7", wt: 205, pHof: 0.03, pAllNba: 0.14, pAllStar: 0.31, expWs: 28 },
    { id: "dylan-mingo-2027", name: "Dylan Mingo", bucket: "college", school: "Baylor", pos: "G", age: 18.9, ht: "6-5", wt: 185, pHof: 0.03, pAllNba: 0.13, pAllStar: 0.30, expWs: 27 },
    { id: "thomas-haugh-2027", name: "Thomas Haugh", bucket: "college", school: "Florida", pos: "F", age: 21.2, ht: "6-9", wt: 215, pHof: 0.03, pAllNba: 0.13, pAllStar: 0.29, expWs: 26 },
    { id: "patrick-ngongba-ii-2027", name: "Patrick Ngongba II", bucket: "college", school: "Duke", pos: "C", age: 20.6, ht: "6-11", wt: 245, pHof: 0.03, pAllNba: 0.12, pAllStar: 0.28, expWs: 25 },
    { id: "jason-crowe-jr-2027", name: "Jason Crowe Jr.", bucket: "college", school: "Missouri", pos: "G", age: 19.0, ht: "6-3", wt: 180, pHof: 0.02, pAllNba: 0.12, pAllStar: 0.27, expWs: 24 },
    { id: "sayon-keita-2027", name: "Sayon Keita", bucket: "college", school: "North Carolina", pos: "C", age: 19.4, ht: "7-0", wt: 240, pHof: 0.02, pAllNba: 0.11, pAllStar: 0.26, expWs: 24 },
    { id: "ivan-kharchenkov-2027", name: "Ivan Kharchenkov", bucket: "college", school: "Arizona", pos: "F", age: 20.1, ht: "6-7", wt: 205, pHof: 0.02, pAllNba: 0.11, pAllStar: 0.25, expWs: 23 },
    { id: "tounde-yessoufou-2027", name: "Tounde Yessoufou", bucket: "college", school: "St. John's", pos: "F", age: 20.2, ht: "6-6", wt: 210, pHof: 0.02, pAllNba: 0.10, pAllStar: 0.25, expWs: 23 },
    { id: "miikka-muurinen-2027", name: "Miikka Muurinen", bucket: "college", school: "Arkansas", pos: "F", age: 19.3, ht: "6-11", wt: 215, pHof: 0.02, pAllNba: 0.10, pAllStar: 0.24, expWs: 22 },
    { id: "luigi-suigo-2027", name: "Luigi Suigo", bucket: "college", school: "Villanova", pos: "C", age: 19.1, ht: "7-4", wt: 240, pHof: 0.02, pAllNba: 0.10, pAllStar: 0.23, expWs: 22 },
    { id: "quentin-coleman-2027", name: "Quentin Coleman", bucket: "college", school: "Illinois", pos: "G", age: 19.0, ht: "6-4", wt: 185, pHof: 0.02, pAllNba: 0.09, pAllStar: 0.22, expWs: 21 },
    { id: "motiejus-krivas-2027", name: "Motiejus Krivas", bucket: "college", school: "Arizona", pos: "C", age: 21.4, ht: "7-2", wt: 250, pHof: 0.02, pAllNba: 0.09, pAllStar: 0.22, expWs: 21 },
    { id: "jj-andrews-2027", name: "JJ Andrews", bucket: "college", school: "Arkansas", pos: "F", age: 19.0, ht: "6-6", wt: 200, pHof: 0.02, pAllNba: 0.09, pAllStar: 0.21, expWs: 20 },
    { id: "christian-collins-2027", name: "Christian Collins", bucket: "college", school: "USC", pos: "F", age: 19.1, ht: "6-9", wt: 205, pHof: 0.02, pAllNba: 0.08, pAllStar: 0.21, expWs: 20 },
    { id: "davis-fogle-2027", name: "Davis Fogle", bucket: "college", school: "Gonzaga", pos: "G", age: 20.1, ht: "6-7", wt: 200, pHof: 0.02, pAllNba: 0.08, pAllStar: 0.20, expWs: 19 },
    { id: "billy-richmond-iii-2027", name: "Billy Richmond III", bucket: "college", school: "Arkansas", pos: "G/F", age: 20.8, ht: "6-7", wt: 210, pHof: 0.02, pAllNba: 0.08, pAllStar: 0.20, expWs: 19 },
    { id: "milan-momcilovic-2027", name: "Milan Momcilovic", bucket: "college", school: "Kentucky", pos: "F", age: 21.5, ht: "6-9", wt: 220, pHof: 0.02, pAllNba: 0.08, pAllStar: 0.19, expWs: 18 },
    { id: "alijah-arenas-2027", name: "Alijah Arenas", bucket: "college", school: "USC", pos: "G", age: 20.0, ht: "6-6", wt: 199, pHof: 0.02, pAllNba: 0.07, pAllStar: 0.19, expWs: 18 },
    { id: "malachi-moreno-2027", name: "Malachi Moreno", bucket: "college", school: "Kentucky", pos: "C", age: 20.3, ht: "7-0", wt: 242, pHof: 0.02, pAllNba: 0.07, pAllStar: 0.18, expWs: 18 },
    { id: "david-mirkovic-2027", name: "David Mirkovic", bucket: "college", school: "Illinois", pos: "F", age: 20.2, ht: "6-9", wt: 225, pHof: 0.01, pAllNba: 0.07, pAllStar: 0.18, expWs: 17 },
    { id: "tyler-tanner-2027", name: "Tyler Tanner", bucket: "college", school: "Vanderbilt", pos: "G", age: 20.8, ht: "6-0", wt: 175, pHof: 0.01, pAllNba: 0.06, pAllStar: 0.17, expWs: 17 },
    { id: "trey-mckenney-2027", name: "Trey McKenney", bucket: "college", school: "Michigan", pos: "G", age: 20.1, ht: "6-4", wt: 195, pHof: 0.01, pAllNba: 0.06, pAllStar: 0.17, expWs: 16 },
    { id: "alex-condon-2027", name: "Alex Condon", bucket: "college", school: "Florida", pos: "F/C", age: 21.3, ht: "7-0", wt: 230, pHof: 0.01, pAllNba: 0.06, pAllStar: 0.16, expWs: 16 },
    { id: "cameron-houindo-2027", name: "Cameron Houindo", bucket: "international", school: "Cedevita Olimpija", pos: "F", age: 19.2, ht: "6-9", wt: 220, pHof: 0.01, pAllNba: 0.06, pAllStar: 0.16, expWs: 16 },
    { id: "matt-able-2027", name: "Matt Able", bucket: "college", school: "North Carolina", pos: "G", age: 20.0, ht: "6-5", wt: 190, pHof: 0.01, pAllNba: 0.05, pAllStar: 0.15, expWs: 15 },
    { id: "andrej-stojakovic-2027", name: "Andrej Stojakovic", bucket: "college", school: "Illinois", pos: "G", age: 21.6, ht: "6-7", wt: 205, pHof: 0.01, pAllNba: 0.05, pAllStar: 0.15, expWs: 15 },
    { id: "shelton-henderson-2027", name: "Shelton Henderson", bucket: "college", school: "Miami", pos: "F", age: 20.2, ht: "6-6", wt: 205, pHof: 0.01, pAllNba: 0.05, pAllStar: 0.14, expWs: 14 },
    { id: "juke-harris-2027", name: "Juke Harris", bucket: "college", school: "Tennessee", pos: "G", age: 21.0, ht: "6-7", wt: 210, pHof: 0.01, pAllNba: 0.05, pAllStar: 0.14, expWs: 14 },
    { id: "rueben-chinyelu-2027", name: "Rueben Chinyelu", bucket: "college", school: "Florida", pos: "C", age: 21.2, ht: "6-11", wt: 240, pHof: 0.01, pAllNba: 0.04, pAllStar: 0.13, expWs: 14 }
  ]);

  pack(2028, "2028 NBA Draft", "Next class. High school bucket is open.", [
    { id: "joaquim-boumtje-boumtje-2028", name: "Joaquim Boumtje-Boumtje", bucket: "college", school: "Duke", pos: "F/C", age: 17.3, ht: "6-11", wt: 240, pHof: 0.14, pAllNba: 0.36, pAllStar: 0.58, expWs: 54 },
    { id: "nikola-kusturica-2028", name: "Nikola Kusturica", bucket: "college", school: "UCLA", pos: "F", age: 17.4, ht: "6-8", wt: 210, pHof: 0.08, pAllNba: 0.26, pAllStar: 0.48, expWs: 40 },
    { id: "nathan-soliman-2028", name: "Nathan Soliman", bucket: "international", school: "France", pos: "F", age: 17.5, ht: "6-8", wt: 205, pHof: 0.06, pAllNba: 0.22, pAllStar: 0.44, expWs: 36 },
    { id: "aj-williams-2028", name: "AJ Williams", bucket: "high-school", school: "Eagle's Landing Christian", pos: "F", age: 16.8, ht: "6-7", wt: 200, pHof: 0.05, pAllNba: 0.20, pAllStar: 0.42, expWs: 34 },
    { id: "kevin-wheatley-jr-2028", name: "Kevin Wheatley Jr.", bucket: "high-school", school: "Master's Academy International", pos: "F", age: 16.9, ht: "6-6", wt: 190, pHof: 0.05, pAllNba: 0.18, pAllStar: 0.39, expWs: 32 },
    { id: "beckham-black-2028", name: "Beckham Black", bucket: "high-school", school: "IMG Academy", pos: "G", age: 16.8, ht: "6-4", wt: 185, pHof: 0.04, pAllNba: 0.17, pAllStar: 0.38, expWs: 31 },
    { id: "yann-kamagate-2028", name: "Yann Kamagate", bucket: "high-school", school: "2028 class", pos: "C", age: 16.7, ht: "7-1", wt: 230, pHof: 0.04, pAllNba: 0.16, pAllStar: 0.36, expWs: 30 },
    { id: "cayden-daughtry-2028", name: "Cayden Daughtry", bucket: "high-school", school: "Florida Rebels", pos: "G", age: 17.2, ht: "6-3", wt: 180, pHof: 0.04, pAllNba: 0.16, pAllStar: 0.36, expWs: 30 },
    { id: "colton-hiller-2028", name: "Colton Hiller", bucket: "high-school", school: "Coatesville", pos: "G/F", age: 16.8, ht: "6-5", wt: 190, pHof: 0.03, pAllNba: 0.14, pAllStar: 0.33, expWs: 28 },
    { id: "bamba-touray-2028", name: "Bamba Touray", bucket: "high-school", school: "IMG Academy", pos: "C", age: 16.9, ht: "6-11", wt: 230, pHof: 0.03, pAllNba: 0.13, pAllStar: 0.30, expWs: 26 },
    { id: "erick-dampier-jr-2028", name: "Erick Dampier Jr.", bucket: "high-school", school: "Madison-Ridgeland Academy", pos: "C", age: 16.7, ht: "6-9", wt: 230, pHof: 0.03, pAllNba: 0.12, pAllStar: 0.29, expWs: 25 },
    { id: "adan-diggs-2028", name: "Adan Diggs", bucket: "high-school", school: "Millennium", pos: "G", age: 16.7, ht: "6-3", wt: 175, pHof: 0.03, pAllNba: 0.12, pAllStar: 0.28, expWs: 25 },
    { id: "derek-swartz-2028", name: "Derek Swartz", bucket: "high-school", school: "New Hampton School", pos: "G", age: 16.8, ht: "6-5", wt: 185, pHof: 0.03, pAllNba: 0.11, pAllStar: 0.27, expWs: 24 },
    { id: "josiah-rose-2028", name: "Josiah Rose", bucket: "high-school", school: "Oak Cliff Faith Family", pos: "G", age: 16.6, ht: "6-2", wt: 175, pHof: 0.02, pAllNba: 0.10, pAllStar: 0.24, expWs: 22 },
    { id: "bentley-lusakueno-2028", name: "Bentley Lusakueno", bucket: "high-school", school: "Woodward Academy", pos: "F", age: 16.7, ht: "6-8", wt: 210, pHof: 0.02, pAllNba: 0.10, pAllStar: 0.23, expWs: 21 },
    { id: "michai-white-2028", name: "Michai White", bucket: "high-school", school: "2028 class", pos: "G", age: 16.6, ht: "6-2", wt: 170, pHof: 0.02, pAllNba: 0.09, pAllStar: 0.22, expWs: 20 },
    { id: "kaharri-coleman-2028", name: "Kaharri Coleman", bucket: "high-school", school: "2028 class", pos: "G", age: 16.7, ht: "6-4", wt: 190, pHof: 0.02, pAllNba: 0.09, pAllStar: 0.21, expWs: 20 },
    { id: "dylan-betts-2028", name: "Dylan Betts", bucket: "high-school", school: "IMG Academy", pos: "C", age: 16.8, ht: "6-11", wt: 230, pHof: 0.02, pAllNba: 0.08, pAllStar: 0.20, expWs: 19 },
    { id: "dj-okoth-2028", name: "DJ Okoth", bucket: "high-school", school: "Bartlett", pos: "F", age: 16.7, ht: "6-6", wt: 195, pHof: 0.02, pAllNba: 0.08, pAllStar: 0.20, expWs: 19 },
    { id: "mason-collins-2028", name: "Mason Collins", bucket: "high-school", school: "Tatnall", pos: "F", age: 16.8, ht: "6-6", wt: 190, pHof: 0.02, pAllNba: 0.08, pAllStar: 0.19, expWs: 18 }
  ]);

  pack(2029, "2029 NBA Draft", "Two years out. High school class of 2029.", [
    { id: "jj-crawford-2029", name: "JJ Crawford", bucket: "high-school", school: "Rainier Beach", pos: "G", age: 16.0, ht: "6-5", wt: 175, pHof: 0.07, pAllNba: 0.22, pAllStar: 0.44, expWs: 36 },
    { id: "draydne-mcdaniel-2029", name: "Draydne McDaniel", bucket: "high-school", school: "Prolific Prep", pos: "F", age: 16.1, ht: "6-7", wt: 205, pHof: 0.06, pAllNba: 0.20, pAllStar: 0.41, expWs: 33 },
    { id: "rj-evans-2029", name: "RJ Evans", bucket: "high-school", school: "Academy of Central Florida", pos: "G/F", age: 16.0, ht: "6-7", wt: 172, pHof: 0.05, pAllNba: 0.19, pAllStar: 0.40, expWs: 32 },
    { id: "david-johnson-2029", name: "David Johnson", bucket: "high-school", school: "SPIRE Academy", pos: "F", age: 16.0, ht: "6-7", wt: 180, pHof: 0.05, pAllNba: 0.18, pAllStar: 0.38, expWs: 31 },
    { id: "cayden-gaskins-2029", name: "Cayden Gaskins", bucket: "high-school", school: "Christopher Columbus", pos: "F", age: 16.0, ht: "6-7", wt: 205, pHof: 0.04, pAllNba: 0.16, pAllStar: 0.36, expWs: 29 },
    { id: "austin-leonard-2029", name: "Austin Leonard", bucket: "high-school", school: "Grayson", pos: "G", age: 16.0, ht: "6-4", wt: 170, pHof: 0.04, pAllNba: 0.15, pAllStar: 0.34, expWs: 28 },
    { id: "london-jackson-2029", name: "London Jackson", bucket: "high-school", school: "Harlan", pos: "G", age: 16.0, ht: "6-5", wt: 180, pHof: 0.03, pAllNba: 0.14, pAllStar: 0.32, expWs: 27 },
    { id: "flory-kuminga-2029", name: "Flory Kuminga", bucket: "high-school", school: "The Patrick School", pos: "F", age: 16.1, ht: "6-5", wt: 210, pHof: 0.03, pAllNba: 0.13, pAllStar: 0.30, expWs: 26 },
    { id: "grant-duggins-2029", name: "Grant Duggins", bucket: "high-school", school: "Greensboro Day", pos: "C", age: 16.0, ht: "6-9", wt: 215, pHof: 0.03, pAllNba: 0.12, pAllStar: 0.28, expWs: 25 },
    { id: "majok-ater-2029", name: "Majok Ater", bucket: "high-school", school: "Principia", pos: "C", age: 16.0, ht: "6-10", wt: 180, pHof: 0.03, pAllNba: 0.12, pAllStar: 0.27, expWs: 24 },
    { id: "josiah-brooks-2029", name: "Josiah Brooks", bucket: "high-school", school: "SLAM Miami", pos: "G", age: 16.0, ht: "6-1", wt: 175, pHof: 0.02, pAllNba: 0.11, pAllStar: 0.26, expWs: 23 },
    { id: "quali-giran-2029", name: "Quali Giran", bucket: "high-school", school: "Millikan", pos: "G", age: 16.0, ht: "6-1", wt: 170, pHof: 0.02, pAllNba: 0.10, pAllStar: 0.24, expWs: 22 },
    { id: "will-conroy-jr-2029", name: "Will Conroy Jr.", bucket: "high-school", school: "Village Christian", pos: "G", age: 16.0, ht: "6-1", wt: 170, pHof: 0.02, pAllNba: 0.10, pAllStar: 0.24, expWs: 22 },
    { id: "thaddeus-young-jr-2029", name: "Thaddeus Young Jr.", bucket: "high-school", school: "Dynamic Prep", pos: "G/F", age: 16.1, ht: "6-4", wt: 185, pHof: 0.02, pAllNba: 0.09, pAllStar: 0.22, expWs: 21 }
  ]);

  TANK_RANK.futureYears = [2027, 2028, 2029];
  TANK_RANK.historicYears = [];
  for (let y = 2026; y >= 1947; y--) TANK_RANK.historicYears.push(y);
  TANK_RANK.years = TANK_RANK.futureYears.concat(TANK_RANK.historicYears);
})();
