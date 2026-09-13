window.TANK_RANK = {
  version: "0.5.2",
  updated: "2026-09-06",
  currentYear: 2027,
  nextYear: 2028,
  firstYear: 1947,
  horizonYear: 2029,
  years: [],
  disclaimer: "Theory-adjusted estimates from Methodology. Not guarantees. No P(Bust).",
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

  pack(2027, "2027 NBA Draft", "College + international only (depth pass). Top order is working consensus; added ESPN top-60 college/intl names not yet listed. No high school. Theory-adjusted estimates from Methodology; not guarantees. No P(Bust).", [
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
    { id: "motiejus-krivas-2027", name: "Motiejus Krivas", bucket: "college", school: "Arizona", pos: "C", age: 21.4, ht: "7-2", wt: 250 },
    { id: "jj-andrews-2027", name: "JJ Andrews", bucket: "college", school: "Arkansas", pos: "F", age: 19.0, ht: "6-6", wt: 200 },
    { id: "christian-collins-2027", name: "Christian Collins", bucket: "college", school: "USC", pos: "F", age: 19.1, ht: "6-9", wt: 205 },
    { id: "davis-fogle-2027", name: "Davis Fogle", bucket: "college", school: "Gonzaga", pos: "G", age: 20.1, ht: "6-7", wt: 200 },
    { id: "billy-richmond-iii-2027", name: "Billy Richmond III", bucket: "college", school: "Arkansas", pos: "G/F", age: 20.8, ht: "6-7", wt: 210 },
    { id: "milan-momcilovic-2027", name: "Milan Momcilovic", bucket: "college", school: "Kentucky", pos: "F", age: 21.5, ht: "6-9", wt: 220 },
    { id: "alijah-arenas-2027", name: "Alijah Arenas", bucket: "college", school: "USC", pos: "G", age: 20.0, ht: "6-6", wt: 199 },
    { id: "malachi-moreno-2027", name: "Malachi Moreno", bucket: "college", school: "Kentucky", pos: "C", age: 20.3, ht: "7-0", wt: 242 },
    { id: "david-mirkovic-2027", name: "David Mirkovic", bucket: "college", school: "Illinois", pos: "F", age: 20.2, ht: "6-9", wt: 225 },
    { id: "tyler-tanner-2027", name: "Tyler Tanner", bucket: "college", school: "Vanderbilt", pos: "G", age: 20.8, ht: "6-0", wt: 175 },
    { id: "trey-mckenney-2027", name: "Trey McKenney", bucket: "college", school: "Michigan", pos: "G", age: 20.1, ht: "6-4", wt: 195 },
    { id: "alex-condon-2027", name: "Alex Condon", bucket: "college", school: "Florida", pos: "F/C", age: 21.3, ht: "7-0", wt: 230 },
    { id: "cameron-houindo-2027", name: "Cameron Houindo", bucket: "international", school: "Cedevita Olimpija", pos: "F", age: 19.2, ht: "6-9", wt: 220 },
    { id: "matt-able-2027", name: "Matt Able", bucket: "college", school: "North Carolina", pos: "G", age: 20.0, ht: "6-5", wt: 190 },
    { id: "andrej-stojakovic-2027", name: "Andrej Stojakovic", bucket: "college", school: "Illinois", pos: "G", age: 21.6, ht: "6-7", wt: 205 },
    { id: "shelton-henderson-2027", name: "Shelton Henderson", bucket: "college", school: "Miami", pos: "F", age: 20.2, ht: "6-6", wt: 205 },
    { id: "juke-harris-2027", name: "Juke Harris", bucket: "college", school: "Tennessee", pos: "G", age: 21.0, ht: "6-7", wt: 210 },
    { id: "rueben-chinyelu-2027", name: "Rueben Chinyelu", bucket: "college", school: "Florida", pos: "C", age: 21.2, ht: "6-11", wt: 240 },
    { id: "joseph-tugler-2027", name: "Joseph Tugler", bucket: "college", school: "Houston", pos: "—" },
    { id: "flory-bidunga-2027", name: "Flory Bidunga", bucket: "college", school: "Louisville", pos: "—" },
    { id: "pryce-sandfort-2027", name: "Pryce Sandfort", bucket: "college", school: "Nebraska", pos: "—" },
    { id: "jeremy-fears-jr-2027", name: "Jeremy Fears Jr.", bucket: "college", school: "Michigan State", pos: "—" },
    { id: "miles-byrd-2027", name: "Miles Byrd", bucket: "college", school: "Providence", pos: "—" },
    { id: "john-blackwell-2027", name: "John Blackwell", bucket: "college", school: "Duke", pos: "—" },
    { id: "moustapha-thiam-2027", name: "Moustapha Thiam", bucket: "college", school: "Michigan", pos: "—" },
    { id: "massamba-diop-2027", name: "Massamba Diop", bucket: "college", school: "Gonzaga", pos: "—" },
    { id: "matas-vokietaitis-2027", name: "Matas Vokietaitis", bucket: "college", school: "Texas", pos: "—" },
    { id: "killyan-toure-2027", name: "Killyan Toure", bucket: "college", school: "Iowa State", pos: "—" },
    { id: "sam-lewis-2027", name: "Sam Lewis", bucket: "college", school: "Virginia", pos: "—" },
    { id: "dame-sarr-2027", name: "Dame Sarr", bucket: "college", school: "Duke", pos: "—" },
    { id: "jacob-cofie-2027", name: "Jacob Cofie", bucket: "college", school: "USC", pos: "—" },
    { id: "stefan-vaaks-2027", name: "Stefan Vaaks", bucket: "college", school: "Illinois", pos: "—" },
    { id: "neoklis-avdalas-2027", name: "Neoklis Avdalas", bucket: "college", school: "North Carolina", pos: "—" },
    { id: "caleb-gaskins-2027", name: "Caleb Gaskins", bucket: "college", school: "Miami", pos: "—" },
    { id: "austin-goosby-2027", name: "Austin Goosby", bucket: "college", school: "Texas", pos: "—" },
    { id: "jaxon-richardson-2027", name: "Jaxon Richardson", bucket: "college", school: "Alabama", pos: "—" },
    { id: "cheickh-niang-2027", name: "Cheickh Niang", bucket: "international", school: "Trento", pos: "—" },
    { id: "colben-landrew-2027", name: "Colben Landrew", bucket: "college", school: "UConn", pos: "—" },
    { id: "obinna-ekezie-jr-2027", name: "Obinna Ekezie Jr.", bucket: "college", school: "Louisville", pos: "—" },
    { id: "dash-daniels-2027", name: "Dash Daniels", bucket: "international", school: "Melbourne United", pos: "—" }
  ]);

  pack(2028, "2028 NBA Draft", "Next class. High school bucket is open. Theory estimates not yet on this board.", [
    { id: "joaquim-boumtje-boumtje-2028", name: "Joaquim Boumtje-Boumtje", bucket: "college", school: "Duke", pos: "F/C", age: 17.3, ht: "6-11", wt: 240 },
    { id: "nikola-kusturica-2028", name: "Nikola Kusturica", bucket: "college", school: "UCLA", pos: "F", age: 17.4, ht: "6-8", wt: 210 },
    { id: "nathan-soliman-2028", name: "Nathan Soliman", bucket: "international", school: "France", pos: "F", age: 17.5, ht: "6-8", wt: 205 },
    { id: "aj-williams-2028", name: "AJ Williams", bucket: "high-school", school: "Eagle's Landing Christian", pos: "F", age: 16.8, ht: "6-7", wt: 200 },
    { id: "kevin-wheatley-jr-2028", name: "Kevin Wheatley Jr.", bucket: "high-school", school: "Master's Academy International", pos: "F", age: 16.9, ht: "6-6", wt: 190 },
    { id: "beckham-black-2028", name: "Beckham Black", bucket: "high-school", school: "IMG Academy", pos: "G", age: 16.8, ht: "6-4", wt: 185 },
    { id: "yann-kamagate-2028", name: "Yann Kamagate", bucket: "high-school", school: "2028 class", pos: "C", age: 16.7, ht: "7-1", wt: 230 },
    { id: "cayden-daughtry-2028", name: "Cayden Daughtry", bucket: "high-school", school: "Florida Rebels", pos: "G", age: 17.2, ht: "6-3", wt: 180 },
    { id: "colton-hiller-2028", name: "Colton Hiller", bucket: "high-school", school: "Coatesville", pos: "G/F", age: 16.8, ht: "6-5", wt: 190 },
    { id: "bamba-touray-2028", name: "Bamba Touray", bucket: "high-school", school: "IMG Academy", pos: "C", age: 16.9, ht: "6-11", wt: 230 },
    { id: "erick-dampier-jr-2028", name: "Erick Dampier Jr.", bucket: "high-school", school: "Madison-Ridgeland Academy", pos: "C", age: 16.7, ht: "6-9", wt: 230 },
    { id: "adan-diggs-2028", name: "Adan Diggs", bucket: "high-school", school: "Millennium", pos: "G", age: 16.7, ht: "6-3", wt: 175 },
    { id: "derek-swartz-2028", name: "Derek Swartz", bucket: "high-school", school: "New Hampton School", pos: "G", age: 16.8, ht: "6-5", wt: 185 },
    { id: "josiah-rose-2028", name: "Josiah Rose", bucket: "high-school", school: "Oak Cliff Faith Family", pos: "G", age: 16.6, ht: "6-2", wt: 175 },
    { id: "bentley-lusakueno-2028", name: "Bentley Lusakueno", bucket: "high-school", school: "Woodward Academy", pos: "F", age: 16.7, ht: "6-8", wt: 210 },
    { id: "michai-white-2028", name: "Michai White", bucket: "high-school", school: "2028 class", pos: "G", age: 16.6, ht: "6-2", wt: 170 },
    { id: "kaharri-coleman-2028", name: "Kaharri Coleman", bucket: "high-school", school: "2028 class", pos: "G", age: 16.7, ht: "6-4", wt: 190 },
    { id: "dylan-betts-2028", name: "Dylan Betts", bucket: "high-school", school: "IMG Academy", pos: "C", age: 16.8, ht: "6-11", wt: 230 },
    { id: "dj-okoth-2028", name: "DJ Okoth", bucket: "high-school", school: "Bartlett", pos: "F", age: 16.7, ht: "6-6", wt: 195 },
    { id: "mason-collins-2028", name: "Mason Collins", bucket: "high-school", school: "Tatnall", pos: "F", age: 16.8, ht: "6-6", wt: 190 }
  ]);

  pack(2029, "2029 NBA Draft", "Two years out. High school class of 2029. Theory estimates not yet on this board.", [
    { id: "jj-crawford-2029", name: "JJ Crawford", bucket: "high-school", school: "Rainier Beach", pos: "G", age: 16.0, ht: "6-5", wt: 175 },
    { id: "draydne-mcdaniel-2029", name: "Draydne McDaniel", bucket: "high-school", school: "Prolific Prep", pos: "F", age: 16.1, ht: "6-7", wt: 205 },
    { id: "rj-evans-2029", name: "RJ Evans", bucket: "high-school", school: "Academy of Central Florida", pos: "G/F", age: 16.0, ht: "6-7", wt: 172 },
    { id: "david-johnson-2029", name: "David Johnson", bucket: "high-school", school: "SPIRE Academy", pos: "F", age: 16.0, ht: "6-7", wt: 180 },
    { id: "cayden-gaskins-2029", name: "Cayden Gaskins", bucket: "high-school", school: "Christopher Columbus", pos: "F", age: 16.0, ht: "6-7", wt: 205 },
    { id: "austin-leonard-2029", name: "Austin Leonard", bucket: "high-school", school: "Grayson", pos: "G", age: 16.0, ht: "6-4", wt: 170 },
    { id: "london-jackson-2029", name: "London Jackson", bucket: "high-school", school: "Harlan", pos: "G", age: 16.0, ht: "6-5", wt: 180 },
    { id: "flory-kuminga-2029", name: "Flory Kuminga", bucket: "high-school", school: "The Patrick School", pos: "F", age: 16.1, ht: "6-5", wt: 210 },
    { id: "grant-duggins-2029", name: "Grant Duggins", bucket: "high-school", school: "Greensboro Day", pos: "C", age: 16.0, ht: "6-9", wt: 215 },
    { id: "majok-ater-2029", name: "Majok Ater", bucket: "high-school", school: "Principia", pos: "C", age: 16.0, ht: "6-10", wt: 180 },
    { id: "josiah-brooks-2029", name: "Josiah Brooks", bucket: "high-school", school: "SLAM Miami", pos: "G", age: 16.0, ht: "6-1", wt: 175 },
    { id: "quali-giran-2029", name: "Quali Giran", bucket: "high-school", school: "Millikan", pos: "G", age: 16.0, ht: "6-1", wt: 170 },
    { id: "will-conroy-jr-2029", name: "Will Conroy Jr.", bucket: "high-school", school: "Village Christian", pos: "G", age: 16.0, ht: "6-1", wt: 170 },
    { id: "thaddeus-young-jr-2029", name: "Thaddeus Young Jr.", bucket: "high-school", school: "Dynamic Prep", pos: "G/F", age: 16.1, ht: "6-4", wt: 185 }
  ]);

  TANK_RANK.futureYears = [2027, 2028, 2029];
  TANK_RANK.historicYears = [];
  for (let y = 2026; y >= 1947; y--) TANK_RANK.historicYears.push(y);
  TANK_RANK.years = TANK_RANK.futureYears.concat(TANK_RANK.historicYears);
})();

/* Local packs; Hitch-clean disclaimer + living-2027-bios overlay */
(function () {
  var EXACT = "Theory-adjusted estimates from Methodology. Not guarantees. No P(Bust).";
  if (window.TANK_RANK) TANK_RANK.disclaimer = EXACT;
  function load(url) {
    var x = new XMLHttpRequest();
    x.open("GET", url, false);
    x.send();
    return x.responseText;
  }
  // Keep PR #11: 2027 ranks 41–62 bios + Dash Daniels → SE Melbourne Phoenix
  eval(load("assets/living-2027-bios.js"));
})();
