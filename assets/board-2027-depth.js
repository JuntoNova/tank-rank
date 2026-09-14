/* 2027 living board depth. Appends public-board names so the class is 100.
   Sources: Tankathon 2027 big board (Aug 2026) remaining names, then
   Bleacher Report Wasserman top 100 (30 Aug 2026) names not already listed.
   College + international only. Does not invent honor odds. */
(function () {
  var extra = [
    { id: "nikolas-khamenia-2027", name: "Nikolas Khamenia", bucket: "college", school: "UConn", pos: "F", age: 20.5, ht: "6-8", wt: 225 },
    { id: "cayden-boozer-2027", name: "Cayden Boozer", bucket: "college", school: "Duke", pos: "G", age: 19.9, ht: "6-4", wt: 205 },
    { id: "daniel-jacobsen-2027", name: "Daniel Jacobsen", bucket: "college", school: "Purdue", pos: "C", age: 21.2, ht: "7-4", wt: 250 },
    { id: "tomislav-ivisic-2027", name: "Tomislav Ivisic", bucket: "college", school: "Illinois", pos: "C", age: 23.0, ht: "7-1", wt: 255 },
    { id: "jt-toppin-2027", name: "JT Toppin", bucket: "college", school: "Texas Tech", pos: "F", age: 21.5, ht: "6-9", wt: 230 },
    { id: "coen-carr-2027", name: "Coen Carr", bucket: "college", school: "Michigan State", pos: "F", age: 22.0, ht: "6-6", wt: 230 },
    { id: "johann-grunloh-2027", name: "Johann Grunloh", bucket: "college", school: "Virginia", pos: "C", age: 20.5, ht: "7-0", wt: 238 },
    { id: "zvonimir-ivisic-2027", name: "Zvonimir Ivisic", bucket: "college", school: "Illinois", pos: "C", age: 23.2, ht: "7-2", wt: 250 },
    { id: "karter-knox-2027", name: "Karter Knox", bucket: "college", school: "Louisville", pos: "F", age: 21.0, ht: "6-6", wt: 214 },
    { id: "elliot-cadeau-2027", name: "Elliot Cadeau", bucket: "college", school: "Michigan", pos: "G", age: 21.3, ht: "6-1", wt: 180 },
    { id: "solo-ball-2027", name: "Solo Ball", bucket: "college", school: "UConn", pos: "G", age: 22.2, ht: "6-4", wt: 200 },
    { id: "ian-jackson-2027", name: "Ian Jackson", bucket: "college", school: "St. John's", pos: "G", age: 21.0, ht: "6-5", wt: 195 },
    { id: "xavier-booker-2027", name: "Xavier Booker", bucket: "college", school: "UCLA", pos: "F", age: 22.0, ht: "6-11", wt: 245 },
    { id: "pavle-backo-2027", name: "Pavle Backo", bucket: "international", school: "Mega Basket", pos: "C", age: 19.4, ht: "6-11", wt: 262 },
    { id: "tahaad-pettiford-2027", name: "Tahaad Pettiford", bucket: "college", school: "Auburn", pos: "G", age: 21.0, ht: "6-1", wt: 169 },
    { id: "bryson-howard-2027", name: "Bryson Howard", bucket: "college", school: "Duke", pos: "G/F", age: 18.5 },
    { id: "najai-hines-2027", name: "Najai Hines", bucket: "college", school: "UConn", pos: "C", age: 19.3 },
    { id: "abdou-toure-2027", name: "Abdou Toure", bucket: "college", school: "Arkansas", pos: "G/F", age: 18.6 },
    { id: "maximo-adams-2027", name: "Maximo Adams", bucket: "college", school: "North Carolina", pos: "G/F", age: 18.5 },
    { id: "arafan-diane-2027", name: "Arafan Diane", bucket: "college", school: "Houston", pos: "C", age: 18.5 },
    { id: "adam-atamna-2027", name: "Adam Atamna", bucket: "international", school: "Ratiopharm Ulm", pos: "G", age: 18.4 },
    { id: "roman-domon-2027", name: "Roman Domon", bucket: "college", school: "Murray State", pos: "F", age: 20.5 },
    { id: "nigel-james-2027", name: "Nigel James", bucket: "college", school: "Marquette", pos: "G", age: 20.4 },
    { id: "mason-falslev-2027", name: "Mason Falslev", bucket: "college", school: "Utah State", pos: "G", age: 24.2 },
    { id: "lucas-morillo-2027", name: "Lucas Morillo", bucket: "college", school: "Illinois", pos: "F", age: 18.5 },
    { id: "thijs-de-ridder-2027", name: "Thijs De Ridder", bucket: "college", school: "Virginia", pos: "F", age: 23.3 },
    { id: "arrinten-page-2027", name: "Arrinten Page", bucket: "college", school: "Providence", pos: "C", age: 21.3 },
    { id: "kellen-thames-2027", name: "Kellen Thames", bucket: "college", school: "Saint Louis", pos: "F", age: 23.2 },
    { id: "elyjah-freeman-2027", name: "Elyjah Freeman", bucket: "college", school: "Texas", pos: "F", age: 21.3 },
    { id: "nolan-winter-2027", name: "Nolan Winter", bucket: "college", school: "Wisconsin", pos: "F/C", age: 20.5 },
    { id: "braden-frager-2027", name: "Braden Frager", bucket: "college", school: "Nebraska", pos: "F", age: 19.4 },
    { id: "amani-hansberry-2027", name: "Amani Hansberry", bucket: "college", school: "Virginia Tech", pos: "F", age: 21.3 },
    { id: "zoom-diallo-2027", name: "Zoom Diallo", bucket: "college", school: "Kentucky", pos: "G", age: 20.4 },
    { id: "finley-bizjack-2027", name: "Finley Bizjack", bucket: "college", school: "West Virginia", pos: "G", age: 21.3 },
    { id: "alvaro-folguiras-2027", name: "Alvaro Folguiras", bucket: "college", school: "Louisville", pos: "F", age: 21.3 },
    { id: "ruben-prey-2027", name: "Ruben Prey", bucket: "college", school: "St. John's", pos: "C", age: 21.3 },
    { id: "paulius-murauskas-2027", name: "Paulius Murauskas", bucket: "college", school: "Arizona State", pos: "F", age: 22.3 },
    { id: "jordan-scott-2027", name: "Jordan Scott", bucket: "college", school: "Michigan State", pos: "F", age: 19.4 }
  ];
  function norm(n) { return String(n || "").toLowerCase().replace(/[^a-z0-9]+/g, ""); }
  function apply() {
    var d = window.TANK_RANK && TANK_RANK.drafts && TANK_RANK.drafts[2027];
    if (!d || !Array.isArray(d.players)) return false;
    var have = {};
    d.players.forEach(function (p) { have[norm(p.name)] = 1; have[norm(p.id)] = 1; });
    extra.forEach(function (p) {
      if (have[norm(p.name)] || have[norm(p.id)]) return;
      var row = Object.assign({
        features: (p.bucket === "international") ? ["Age", "Competition level", "Translation"] : ["Age", "Usage efficiency", "Shooting skill"],
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
