window.TANK_RANK = {
  version: "0.5.2",
  updated: "2026-09-06",
  currentYear: 2027,
  nextYear: 2028,
  firstYear: 1947,
  horizonYear: 2029,
  years: [],
  disclaimer: "Probability columns unavailable until the published model is connected.",
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

  pack(2027, "2027 NBA Draft", "College + international only (depth pass). Top order is working consensus; added ESPN top-60 college/intl names not yet listed. No high school. Probability columns unavailable — not invented.", [
    { id: "tyran-stokes-2027", name: "Tyran Stokes", bucket: "college", school: "Kansas", pos: "F", age: 19.1, ht: "6-7", wt: 230 },
    { id: "caleb-holt-2027", name: "Caleb Holt", bucket: "college", school: "Arizona", pos: "G", age: 19.2, ht: "6-5", wt: 200 },
    { id: "jordan-smith-jr-2027", name: "Jordan Smith Jr.", bucket: "college", school: "Arkansas", pos: "G", age: 19.0, ht: "6-2", wt: 200 },
    { id: "bruce-branch-iii-2027", name: "Bruce Branch III", bucket: "college", school: "BYU", pos: "F", age: 18.9, ht: "6-7", wt: 190 },
    { id: "stefan-joksimovic-2027", name: "Stefan Joksimović", bucket: "international", school: "Baskonia", pos: "G", age: 18.6, ht: "6-7", wt: 205 },
    { id: "anthony-thompson-2027", name: "Anthony Thompson", bucket: "college", school: "Ohio State", pos: "F", age: 18.9, ht: "6-9", wt: 215 },
    { id: "cameron-williams-2027", name: "Cameron Williams", bucket: "college", school: "Duke", pos: "F", age: 19.1, ht: "6-11", wt: 200 },
    { id: "baba-oladotun-2027", name: "Baba Oladotun", bucket: "college", school: "Maryland", pos: "F", age: 18.5, ht: "6-10", wt: 195 },
    { id: "brandon-mccoy-jr-2027", name: "Brandon McCoy Jr.", bucket: "college", school: "Michigan", pos: "G", age: 19.2, ht: "6-5", wt: 190 },
    { id: "braylon-mullins-2027", name: "Braylon Mullins", bucket: "college", school: "UConn", pos: "G", age: 20.3, ht: "6-6", wt: 196 },
    { id: "hugo-yimga-moukouri-2027", name: "Hugo Yimga-Moukouri", bucket: "international", school: "Nanterre 92", pos: "F", age: 18.9, ht: "6-9", wt: 218 },
    { id: "amari-allen-2027", name: "Amari Allen", bucket: "college", school: "Alabama", pos: "F", age: 20.4, ht: "6-7", wt: 205 },
    { id: "dylan-mingo-2027", name: "Dylan Mingo", bucket: "college", school: "Baylor", pos: "G", age: 18.9, ht: "6-5", wt: 185 },
    { id: "thomas-haugh-2027", name: "Thomas Haugh", bucket: "college", school: "Florida", pos: "F", age: 21.2, ht: "6-9", wt: 215 },
    { id: "patrick-ngongba-ii-2027", name: "Patrick Ngongba II", bucket: "college", school: "Duke", pos: "C", age: 20.6, ht: "6-11", wt: 245 },
    { id: "jason-crowe-jr-2027", name: "Jason Crowe Jr.", bucket: "college", school: "Missouri", pos: "G", age: 19.0, ht: "6-3", wt: 180 },
    { id: "sayon-keita-2027", name: "Sayon Keita", bucket: "college", school: "North Carolina", pos: "C", age: 19.4, ht: "7-0", wt: 240 },
    { id: "ivan-kharchenkov-2027", name: "Ivan Kharchenkov", bucket: "college", school: "Arizona", pos: "F", age: 20.1, ht: "6-7", wt: 205 },
    { id: "tounde-yessoufou-2027", name: "Tounde Yessoufou", bucket: "college", school: "St. John's", pos: "F", age: 20.2, ht: "6-6", wt: 210 },
    { id: "miikka-muurinen-2027", name: "Miikka Muurinen", bucket: "college", school: "Arkansas", pos: "F", age: 19.3, ht: "6-11", wt: 215 },
    { id: "luigi-suigo-2027", name: "Luigi Suigo", bucket: "college", school: "Villanova", pos: "C", age: 19.1, ht: "7-4", wt: 240 },
    { id: "quentin-coleman-2027", name: "Quentin Coleman", bucket: "college", school: "Illinois", pos: "G", age: 19.0, ht: "6-4", wt: 185 },
