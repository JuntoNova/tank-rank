/* 2028 living board depth. Appends ESPN 2027 SC Next names so the class is 100.
   2028 NBA draft = HS class of 2027 + early college/intl already on the board.
   Existing 1-20 stay in place. No invented honor odds. */
(function () {
  var extra = [
    { id: "demarcus-henry-2028", name: "Demarcus Henry", bucket: "high-school", school: "AZ Compass Prep", pos: "F", age: 17.2, ht: "6-7", wt: 180 },
    { id: "cj-rosser-2028", name: "C.J. Rosser", bucket: "high-school", school: "Southeastern Prep", pos: "F", age: 17.2, ht: "6-9", wt: 195 },
    { id: "lewis-uvwo-2028", name: "Lewis Uvwo", bucket: "high-school", school: "Prolific Prep", pos: "C", age: 17.2, ht: "6-10", wt: 225 },
    { id: "asa-montgomery-2028", name: "Asa Montgomery", bucket: "high-school", school: "Hillgrove", pos: "F", age: 17.2, ht: "6-6", wt: 185 },
    { id: "darius-wabbington-2028", name: "Darius Wabbington", bucket: "high-school", school: "Sunnyslope", pos: "C", age: 17.2, ht: "6-10", wt: 225 },
    { id: "reese-alston-2028", name: "Reese Alston", bucket: "high-school", school: "Second Baptist", pos: "G", age: 17.2, ht: "6-1", wt: 170 },
    { id: "nasir-anderson-2028", name: "Nasir Anderson", bucket: "high-school", school: "Prolific Prep", pos: "G", age: 17.2, ht: "6-4", wt: 215 },
    { id: "navorro-bowman-jr-2028", name: "NaVorro Bowman Jr.", bucket: "high-school", school: "Notre Dame HS", pos: "G", age: 17.2, ht: "6-2", wt: 170 },
    { id: "king-gibson-2028", name: "King Gibson", bucket: "high-school", school: "SPIRE Academy", pos: "G", age: 17.2, ht: "6-5", wt: 180 },
    { id: "jordan-page-2028", name: "Jordan Page", bucket: "high-school", school: "IMG Academy", pos: "F", age: 17.2, ht: "6-6", wt: 190 },
    { id: "moussa-kamissoko-2028", name: "Moussa Kamissoko", bucket: "high-school", school: "SPIRE Academy", pos: "F", age: 17.2, ht: "6-8", wt: 180 },
    { id: "malachi-jordan-2028", name: "Malachi Jordan", bucket: "high-school", school: "Prolific Prep", pos: "F", age: 17.2, ht: "6-5", wt: 180 },
    { id: "isaiah-hill-2028", name: "Isaiah Hill", bucket: "high-school", school: "Pike", pos: "C", age: 17.2, ht: "7-0", wt: 218 },
    { id: "dooney-johnson-2028", name: "Dooney Johnson", bucket: "high-school", school: "East River", pos: "G", age: 17.2, ht: "6-5", wt: 185 },
    { id: "ahmed-nur-2028", name: "Ahmed Nur", bucket: "high-school", school: "Bella Vista Prep", pos: "F", age: 17.2, ht: "6-8", wt: 190 },
    { id: "ahmad-hudson-2028", name: "Ahmad Hudson", bucket: "high-school", school: "Ruston", pos: "F", age: 17.2, ht: "6-7", wt: 225 },
    { id: "jalen-davis-2028", name: "Jalen Davis", bucket: "high-school", school: "Bremerton", pos: "G", age: 17.2, ht: "6-2", wt: 160 },
    { id: "jarvis-hayes-2028", name: "Jarvis Hayes", bucket: "high-school", school: "Woodward Academy", pos: "G", age: 17.2, ht: "6-5", wt: 170 },
    { id: "kager-knueppel-2028", name: "Kager Knueppel", bucket: "high-school", school: "Wisconsin Lutheran", pos: "F", age: 17.2, ht: "6-10", wt: 205 },
    { id: "ryan-hampton-2028", name: "Ryan Hampton", bucket: "high-school", school: "Rockwall-Heath", pos: "F", age: 17.2, ht: "6-5", wt: 180 },
    { id: "paul-osaruyi-2028", name: "Paul Osaruyi", bucket: "high-school", school: "Bella Vista Prep", pos: "C", age: 17.2, ht: "6-9", wt: 210 },
    { id: "kevin-savage-2028", name: "Kevin Savage", bucket: "high-school", school: "Wheeler", pos: "G", age: 17.2, ht: "5-11", wt: 160 },
    { id: "antonio-pemberton-2028", name: "Antonio Pemberton", bucket: "high-school", school: "The Masters Academy", pos: "G", age: 17.2, ht: "6-1", wt: 160 },
    { id: "chase-lumpkin-2028", name: "Chase Lumpkin", bucket: "high-school", school: "McEachern", pos: "G", age: 17.2, ht: "6-5", wt: 180 },
    { id: "devin-cleveland-2028", name: "Devin Cleveland", bucket: "high-school", school: "La Lumiere", pos: "G", age: 17.2, ht: "6-3", wt: 160 },
    { id: "micah-gordon-2028", name: "Micah Gordon", bucket: "high-school", school: "SPIRE Academy", pos: "G", age: 17.2, ht: "5-11", wt: 170 },
    { id: "zion-green-2028", name: "Zion Green", bucket: "high-school", school: "AZ Compass Prep", pos: "F", age: 17.2, ht: "6-9", wt: 185 },
    { id: "chase-branham-2028", name: "Chase Branham", bucket: "high-school", school: "La Lumiere", pos: "G", age: 17.2, ht: "6-4", wt: 170 },
    { id: "jahari-miller-2028", name: "Jahari Miller", bucket: "high-school", school: "Faith Family Academy", pos: "G", age: 17.2, ht: "6-3", wt: 190 },
    { id: "dawson-battie-2028", name: "Dawson Battie", bucket: "high-school", school: "Saint Mark's", pos: "F", age: 17.2, ht: "6-8", wt: 190 },
    { id: "dylan-jones-2028", name: "Dylan Jones", bucket: "high-school", school: "Bartlett", pos: "F", age: 17.2, ht: "6-7", wt: 180 },
    { id: "oneal-delancy-2028", name: "Oneal Delancy", bucket: "high-school", school: "Montverde Academy", pos: "G", age: 17.2, ht: "6-3", wt: 165 },
    { id: "cherif-millogo-2028", name: "Cherif Millogo", bucket: "high-school", school: "Saint Francis", pos: "C", age: 17.2, ht: "7-2", wt: 220 },
    { id: "kameron-mercer-2028", name: "Kameron Mercer", bucket: "high-school", school: "Princeton HS", pos: "F", age: 17.2, ht: "6-5", wt: 200 },
    { id: "scottie-adkinson-2028", name: "Scottie Adkinson", bucket: "high-school", school: "Webster Groves", pos: "G", age: 17.2, ht: "6-4", wt: 186 },
    { id: "josh-leonard-2028", name: "Josh Leonard", bucket: "high-school", school: "IMG Academy", pos: "F", age: 17.2, ht: "6-6", wt: 180 },
    { id: "jlon-lyons-2028", name: "J'Lon Lyons", bucket: "high-school", school: "Clinton Grace Christian", pos: "G", age: 17.2, ht: "6-2", wt: 165 },
    { id: "tyrone-jamison-2028", name: "Tyrone Jamison", bucket: "high-school", school: "Calvary Baptist", pos: "G", age: 17.2, ht: "6-2", wt: 170 },
    { id: "isaiah-santos-2028", name: "Isaiah Santos", bucket: "high-school", school: "Seven Lakes", pos: "F", age: 17.2, ht: "6-5", wt: 200 },
    { id: "jaxson-davis-2028", name: "Jaxson Davis", bucket: "high-school", school: "Monarch Academy", pos: "G", age: 17.2, ht: "6-0", wt: 165 },
    { id: "brandon-woodard-2028", name: "Brandon Woodard", bucket: "high-school", school: "Bishop McNamara", pos: "F", age: 17.2, ht: "6-7", wt: 205 },
    { id: "carson-crawford-2028", name: "Carson Crawford", bucket: "high-school", school: "Fleming Island", pos: "F", age: 17.2, ht: "6-7", wt: 190 },
    { id: "josiah-harrington-2028", name: "Josiah Harrington", bucket: "high-school", school: "North Scott", pos: "F", age: 17.2, ht: "6-6", wt: 200 },
    { id: "javion-tyndale-2028", name: "Javion Tyndale", bucket: "high-school", school: "Montverde Academy", pos: "G", age: 17.2, ht: "5-9", wt: 160 },
    { id: "aaron-britt-2028", name: "Aaron Britt", bucket: "high-school", school: "The Villages", pos: "G", age: 17.2, ht: "6-0", wt: 165 },
    { id: "lyris-robinson-2028", name: "Lyris Robinson", bucket: "high-school", school: "Bella Vista Prep", pos: "G", age: 17.2, ht: "6-4", wt: 175 },
    { id: "derek-daniels-2028", name: "Derek Daniels", bucket: "high-school", school: "Iowa United Prep", pos: "C", age: 17.2, ht: "6-7", wt: 220 },
    { id: "justin-wise-2028", name: "Justin Wise", bucket: "high-school", school: "North Oconee", pos: "G", age: 17.2, ht: "6-4", wt: 175 },
    { id: "jeremy-jenkins-2028", name: "Jeremy Jenkins", bucket: "high-school", school: "Riviera Prep", pos: "F", age: 17.2, ht: "6-9", wt: 225 },
    { id: "rj-moore-2028", name: "RJ Moore", bucket: "high-school", school: "Ambassador Christian", pos: "F", age: 17.2, ht: "6-7", wt: 175 },
    { id: "quinton-kitt-2028", name: "Quinton Kitt", bucket: "high-school", school: "Monarch Academy", pos: "F", age: 17.2, ht: "6-6", wt: 200 },
    { id: "howard-williams-2028", name: "Howard Williams", bucket: "high-school", school: "Dynamic Prep", pos: "F", age: 17.2, ht: "6-6", wt: 180 },
    { id: "abdul-malik-olajuwon-2028", name: "Abdul-Malik Olajuwon", bucket: "high-school", school: "Clements", pos: "G", age: 17.2, ht: "6-4", wt: 185 },
    { id: "tyran-frazier-2028", name: "Tyran Frazier", bucket: "high-school", school: "Principia", pos: "F", age: 17.2, ht: "6-10", wt: 200 },
    { id: "kamsi-awaka-2028", name: "Kamsi Awaka", bucket: "high-school", school: "Blair Academy", pos: "C", age: 17.2, ht: "6-9", wt: 225 },
    { id: "jaydn-jenkins-2028", name: "Jaydn Jenkins", bucket: "high-school", school: "Archbishop Wood", pos: "C", age: 17.2, ht: "6-9", wt: 200 },
    { id: "darrell-davis-2028", name: "Darrell Davis", bucket: "high-school", school: "SPIRE Academy", pos: "G", age: 17.2, ht: "5-11", wt: 165 },
    { id: "mahamadou-diop-2028", name: "Mahamadou Diop", bucket: "high-school", school: "San Gabriel Academy", pos: "C", age: 17.2, ht: "6-10", wt: 220 },
    { id: "yohane-kabongo-2028", name: "Yohane Kabongo", bucket: "high-school", school: "DME Academy", pos: "C", age: 17.2, ht: "6-9", wt: 200 },
    { id: "joshua-tyson-2028", name: "Joshua Tyson", bucket: "high-school", school: "Lakota West", pos: "G", age: 17.2, ht: "6-2", wt: 170 },
    { id: "munir-greig-2028", name: "Munir Greig", bucket: "high-school", school: "Coronado", pos: "F", age: 17.2, ht: "6-5", wt: 180 },
    { id: "ferlandes-wright-2028", name: "Ferlandes Wright", bucket: "high-school", school: "La Lumiere", pos: "F", age: 17.2, ht: "6-7", wt: 220 },
    { id: "payton-jones-2028", name: "Payton Jones", bucket: "high-school", school: "Dynamic Prep", pos: "G", age: 17.2, ht: "6-3", wt: 185 },
    { id: "markus-kerr-2028", name: "Markus Kerr", bucket: "high-school", school: "Wellington Sports Academy", pos: "F", age: 17.2, ht: "6-5", wt: 180 },
    { id: "marcus-curry-jr-2028", name: "Marcus Curry Jr.", bucket: "high-school", school: "Grayson", pos: "F", age: 17.2, ht: "6-5", wt: 175 },
    { id: "marri-wesley-2028", name: "Marri Wesley", bucket: "high-school", school: "Southeastern Prep", pos: "F", age: 17.2, ht: "6-5", wt: 185 },
    { id: "gene-roebuck-2028", name: "Gene Roebuck", bucket: "high-school", school: "La Mirada", pos: "F", age: 17.2, ht: "6-4", wt: 180 },
    { id: "henry-robinson-2028", name: "Henry Robinson", bucket: "high-school", school: "Matanzas", pos: "F", age: 17.2, ht: "6-7", wt: 190 },
    { id: "jimmy-mckinney-2028", name: "Jimmy McKinney", bucket: "high-school", school: "Vashon", pos: "G", age: 17.2, ht: "6-1", wt: 160 },
    { id: "jalen-white-2028", name: "Jalen White", bucket: "high-school", school: "Bella Vista Prep", pos: "F", age: 17.2, ht: "6-7", wt: 195 },
    { id: "lucai-anderson-2028", name: "Lucai Anderson", bucket: "high-school", school: "IMG Academy", pos: "G", age: 17.2, ht: "6-3", wt: 170 },
    { id: "donovan-davis-2028", name: "Donovan Davis", bucket: "high-school", school: "Freedom", pos: "F", age: 17.2, ht: "6-7", wt: 200 },
    { id: "jason-gardner-2028", name: "Jason Gardner", bucket: "high-school", school: "Fishers", pos: "G", age: 17.2, ht: "6-1", wt: 180 },
    { id: "jeremiah-profit-2028", name: "Jeremiah Profit", bucket: "high-school", school: "Rancho Christian", pos: "F", age: 17.2, ht: "6-4", wt: 170 },
    { id: "geren-holmes-2028", name: "Geren Holmes", bucket: "high-school", school: "The Burlington School", pos: "G", age: 17.2, ht: "6-5", wt: 185 },
    { id: "josiah-nance-2028", name: "Josiah Nance", bucket: "high-school", school: "Notre Dame HS", pos: "G", age: 17.2, ht: "6-5", wt: 175 },
    { id: "king-rachal-2028", name: "King Rachal", bucket: "high-school", school: "DNA Prep", pos: "F", age: 17.2, ht: "6-7", wt: 180 },
    { id: "king-kendrick-2028", name: "King Kendrick", bucket: "high-school", school: "Caldwell Academy", pos: "G", age: 17.2, ht: "6-0", wt: 160 },
    { id: "kellen-brewer-2028", name: "Kellen Brewer", bucket: "high-school", school: "Metairie Park Country Day", pos: "G", age: 17.2, ht: "6-6", wt: 170 },
    { id: "keaundre-morris-2028", name: "Keaundre Morris", bucket: "high-school", school: "Bella Vista Prep", pos: "G", age: 17.2, ht: "6-1", wt: 165 }
  ];
  function norm(n) { return String(n || "").toLowerCase().replace(/[^a-z0-9]+/g, ""); }
  function apply() {
    var d = window.TANK_RANK && TANK_RANK.drafts && TANK_RANK.drafts[2028];
    if (!d || !Array.isArray(d.players)) return false;
    var have = {};
    d.players.forEach(function (p) { have[norm(p.name)] = 1; have[norm(p.id)] = 1; });
    extra.forEach(function (p) {
      if (have[norm(p.name)] || have[norm(p.id)]) return;
      var row = Object.assign({
        features: ["Age", "Frame", "Creation"],
        pHof: null, pAllNba: null, pAllStar: null, pBust: null, expWs: null, delta: null
      }, p);
      row.rank = d.players.length + 1;
      row.catRank = d.players.filter(function (x) { return x.bucket === p.bucket; }).length + 1;
      d.players.push(row);
      have[norm(p.name)] = 1;
    });
    return true;
  }
  if (!apply()) {
    var n = 0;
    var id = setInterval(function () {
      n += 1;
      if (apply() || n > 40) clearInterval(id);
    }, 50);
  }
})();
