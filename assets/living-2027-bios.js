/* 2027 living-board bio fills for ranks 41-62. Ages as of 2026-09-06 (board updated date).
   No probability / Exp WS / delta fields. Unknown age or wt left unset. */
(function () {
  var pack = window.TANK_RANK && TANK_RANK.drafts && TANK_RANK.drafts[2027];
  if (!pack || !pack.players) return;
  var bios = {
    "joseph-tugler-2027": { pos: "F", age: 21.3, ht: "6-8", wt: 230 },
    "flory-bidunga-2027": { pos: "F", age: 21.3, ht: "6-9", wt: 235 },
    "pryce-sandfort-2027": { pos: "F", age: 22.2, ht: "6-7", wt: 218 },
    "jeremy-fears-jr-2027": { pos: "G", age: 21.4, ht: "6-2", wt: 190 },
    "miles-byrd-2027": { pos: "G", age: 22.0, ht: "6-6", wt: 200 },
    "john-blackwell-2027": { pos: "G", age: 21.7, ht: "6-5", wt: 205 },
    "moustapha-thiam-2027": { pos: "C", age: 20.5, ht: "7-2", wt: 250 },
    "massamba-diop-2027": { pos: "C", age: 21.7, ht: "7-1", wt: 230 },
    "matas-vokietaitis-2027": { pos: "C", age: 21.8, ht: "7-0", wt: 255 },
    "killyan-toure-2027": { pos: "G", age: 20.1, ht: "6-3", wt: 205 },
    "sam-lewis-2027": { pos: "G", ht: "6-7", wt: 210 },
    "dame-sarr-2027": { pos: "G/F", age: 20.3, ht: "6-8", wt: 200 },
    "jacob-cofie-2027": { pos: "F", age: 20.6, ht: "6-10", wt: 231 },
    "stefan-vaaks-2027": { pos: "G", age: 21.3, ht: "6-7", wt: 215 },
    "neoklis-avdalas-2027": { pos: "G", age: 20.6, ht: "6-9", wt: 220 },
    "caleb-gaskins-2027": { pos: "F", age: 18.1, ht: "6-8", wt: 219 },
    "austin-goosby-2027": { pos: "G", age: 18.8, ht: "6-5", wt: 205 },
    "jaxon-richardson-2027": { pos: "G", ht: "6-6", wt: 200 },
    "cheickh-niang-2027": { pos: "G", age: 18.0, ht: "6-5", wt: 194 },
    "colben-landrew-2027": { pos: "F", age: 18.5, ht: "6-6", wt: 236 },
    "obinna-ekezie-jr-2027": { pos: "C", age: 18.3, ht: "7-2", wt: 240 },
    "dash-daniels-2027": { school: "SE Melbourne Phoenix", pos: "G", age: 18.7, ht: "6-5", wt: 198 }
  };
  for (var i = 0; i < pack.players.length; i++) {
    var p = pack.players[i];
    var b = bios[p.id];
    if (!b) continue;
    if (b.school) p.school = b.school;
    if (b.pos) p.pos = b.pos;
    if (b.age != null) p.age = b.age;
    if (b.ht) p.ht = b.ht;
    if (b.wt != null) p.wt = b.wt;
  }
})();
