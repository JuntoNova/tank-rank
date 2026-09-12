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

/* PR-D: local packs only; Hitch disclaimer + PR #11 bio overlay */
(function () {
  var EXACT = "Probability columns unavailable until the published model is connected.";
  if (window.TANK_RANK) TANK_RANK.disclaimer = EXACT;
  function load(url) {
    var x = new XMLHttpRequest();
    x.open("GET", url, false);
    x.send();
    return x.responseText;
  }
  // Keep PR #11: 2027 ranks 41-62 bios + Dash Daniels to SE Melbourne Phoenix
  eval(load("assets/living-2027-bios.js"));
})();
