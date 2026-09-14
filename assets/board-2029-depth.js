/* 2029 living board depth. Appends public HS names so the class is 100.
   Keep existing 1-14. Then ESPN 2029 SC Next + On3/Rivals 2029 remainder,
   then ESPN 2028 SC Next names not already on the 2028 board (HS 2028 = 2029 NBA draft).
   No invented honor odds. */
(function () {
  var extra = [
    { id: "cadien-hudson-2029", name: "Cadien Hudson", bucket: "high-school", school: "Faith Family Academy", pos: "F", age: 16.4, ht: "6-5", wt: 180 },
    { id: "will-phillips-2029", name: "Will Phillips", bucket: "high-school", school: "Sacramento", pos: "F", age: 16.4, ht: "6-6", wt: 175 },
    { id: "alex-alexander-2029", name: "Alex Alexander", bucket: "high-school", school: "Mesquite", pos: "F", age: 16.4, ht: "6-9", wt: 210 },
    { id: "chudier-diew-yak-2029", name: "Chudier Diew Yak", bucket: "high-school", school: "North Broward Prep", pos: "C", age: 16.4, ht: "6-8", wt: 205 },
    { id: "mj-postell-2029", name: "MJ Postell", bucket: "high-school", school: "Saint Benedict's Prep", pos: "G", age: 16.4, ht: "6-4", wt: 180 },
    { id: "aj-scott-2029", name: "AJ Scott", bucket: "high-school", school: "New Bern", pos: "F", age: 16.4, ht: "6-9", wt: 210 },
    { id: "mason-grivna-2029", name: "Mason Grivna", bucket: "high-school", school: "Ballard", pos: "C", age: 16.4, ht: "6-10", wt: 215 },
    { id: "jeremiah-triplin-2029", name: "Jeremiah Triplin", bucket: "high-school", school: "James Island", pos: "C", age: 16.4, ht: "6-8", wt: 210 },
    { id: "bronx-ganaway-2029", name: "Bronx Ganaway", bucket: "high-school", school: "Father Tolton", pos: "F", age: 16.4, ht: "6-8", wt: 190 },
    { id: "felix-okam-2029", name: "Felix Okam", bucket: "high-school", school: "Grand Prairie", pos: "F", age: 16.4, ht: "6-8", wt: 185 },
    { id: "braylen-alexander-2029", name: "Braylen Alexander", bucket: "high-school", school: "Central", pos: "G", age: 16.4, ht: "6-4", wt: 170 },
    { id: "austin-acy-2029", name: "Austin Acy", bucket: "high-school", school: "Chaminade", pos: "F", age: 16.4, ht: "6-7", wt: 185 },
    { id: "jalil-hill-2029", name: "Jalil Hill", bucket: "high-school", school: "Fleming Island", pos: "C", age: 16.4, ht: "6-9", wt: 185 },
    { id: "king-bacot-2029", name: "King Bacot", bucket: "high-school", school: "Petersburg", pos: "G", age: 16.4, ht: "6-2", wt: 175 },
    { id: "eghosa-odeje-2029", name: "Eghosa Odeje", bucket: "high-school", school: "2029 class", pos: "C", age: 16.4, ht: "6-11", wt: null },
    { id: "rabi-bongo-2029", name: "Rabi Bongo", bucket: "high-school", school: "Utah Prep", pos: "C", age: 16.4, ht: "6-11", wt: null },
    { id: "tristan-edwards-2029", name: "Tristan Edwards", bucket: "high-school", school: "2029 class", pos: "F", age: 16.4, ht: "6-7", wt: null },
    { id: "jean-philippe-oka-2029", name: "Jean-Philippe Oka", bucket: "high-school", school: "2029 class", pos: "F", age: 16.4, ht: "6-8", wt: null },
    { id: "issa-sow-2029", name: "Issa Sow", bucket: "high-school", school: "Bella Vista Prep", pos: "C", age: 16.4, ht: "6-10", wt: 200 },
    { id: "devin-melton-2029", name: "Devin Melton", bucket: "high-school", school: "Brantley", pos: "F", age: 16.4, ht: "6-7", wt: 205 },
    { id: "eli-murray-2029", name: "Eli Murray", bucket: "high-school", school: "St. Francis Prep", pos: "F", age: 16.4, ht: "6-5", wt: 180 },
    { id: "harlem-nunez-2029", name: "Harlem Nunez", bucket: "high-school", school: "Mt. Zion Prep", pos: "F", age: 16.4, ht: "6-8", wt: null },
    { id: "noah-woods-2029", name: "Noah Woods", bucket: "high-school", school: "Washington Sioux Falls", pos: "F", age: 16.4, ht: "6-8", wt: 200 },
    { id: "praise-badejo-2029", name: "Praise Badejo", bucket: "high-school", school: "Orangeville Prep", pos: "G", age: 16.4, ht: "6-1", wt: null },
    { id: "roman-henry-2029", name: "Roman Henry", bucket: "high-school", school: "Sioux City East", pos: "G", age: 16.4, ht: "6-4", wt: 180 },
    { id: "kiir-nang-2029", name: "Kiir Nang", bucket: "high-school", school: "Anthem Prep", pos: "F", age: 16.4, ht: "6-8", wt: 190 },
    { id: "marquice-pless-2029", name: "Marquice Pless", bucket: "high-school", school: "Bella Vista Prep", pos: "G", age: 16.4, ht: "6-4", wt: 180 },
    { id: "jacob-schlutow-2029", name: "Jacob Schlutow", bucket: "high-school", school: "Blue Springs", pos: "G", age: 16.4, ht: "6-6", wt: 180 },
    { id: "somto-patrick-2029", name: "Somto Patrick", bucket: "high-school", school: "Modesto Christian", pos: "C", age: 16.4, ht: "6-9", wt: 215 },
    { id: "jordan-mcdaniel-2029", name: "Jordan McDaniel", bucket: "high-school", school: "Roseville", pos: "G", age: 16.4, ht: "5-10", wt: 145 },
    { id: "chance-finlayson-2029", name: "Chance Finlayson", bucket: "high-school", school: "2029 class", pos: "F", age: 16.4, ht: "6-6", wt: null },
    { id: "juleeyan-williams-2029", name: "Juleeyan Williams", bucket: "high-school", school: "Centennial", pos: "G", age: 16.4, ht: "6-4", wt: 175 },
    { id: "desean-clayton-2029", name: "Desean Clayton", bucket: "high-school", school: "Westminster Academy", pos: "G", age: 16.4, ht: "6-4", wt: 185 },
    { id: "bryce-irby-2029", name: "Bryce Irby", bucket: "high-school", school: "Lutheran East", pos: "F", age: 16.4, ht: "6-6", wt: null },
    { id: "braeden-greenup-2029", name: "Braeden Greenup", bucket: "high-school", school: "North Raleigh Christian", pos: "G", age: 16.4, ht: "6-4", wt: 192 },
    { id: "jordan-costley-2029", name: "Jordan Costley", bucket: "high-school", school: "Springdale Prep", pos: "G", age: 16.4, ht: "6-2", wt: 160 },
    { id: "kaedyn-cole-2029", name: "Kaedyn Cole", bucket: "high-school", school: "Petersburg", pos: "F", age: 16.4, ht: "6-6", wt: 215 },
    { id: "aaron-parker-2029", name: "Aaron Parker", bucket: "high-school", school: "NC GBB Academy", pos: "F", age: 16.4, ht: "6-6", wt: 175 },
    { id: "nas-abraham-2029", name: "Nas Abraham", bucket: "high-school", school: "2029 class", pos: "C", age: 16.4, ht: "6-10", wt: null },
    { id: "vijay-keshaav-2029", name: "Vijay Keshaav", bucket: "high-school", school: "Memorial", pos: "G", age: 16.4, ht: "6-2", wt: 170 },
    { id: "semaj-cuyler-2029", name: "Semaj Cuyler", bucket: "high-school", school: "Bella Vista Prep", pos: "G", age: 16.4, ht: "6-4", wt: null },
    { id: "mikhail-francis-2029", name: "Mikhail Francis", bucket: "high-school", school: "Edge School", pos: "F", age: 16.4, ht: "6-5", wt: null },
    { id: "julian-sam-2029", name: "Julian Sam", bucket: "high-school", school: "Centerville", pos: "F", age: 16.4, ht: "6-8", wt: 190 },
    { id: "james-jenkins-iii-2029", name: "James Jenkins III", bucket: "high-school", school: "DME Academy", pos: "G", age: 16.4, ht: "6-4", wt: 175 },
    { id: "cordi-smith-2029", name: "Cordi Smith", bucket: "high-school", school: "Olive Branch", pos: "F", age: 16.4, ht: "6-6", wt: 185 },
    { id: "logan-szpak-2029", name: "Logan Szpak", bucket: "high-school", school: "Iowa United Prep", pos: "G", age: 16.4, ht: "6-6", wt: null },
    { id: "jacobi-thompson-2029", name: "JaCobi Thompson", bucket: "high-school", school: "Arcadia", pos: "F", age: 16.4, ht: "6-5", wt: 185 },
    { id: "ruach-gony-2029", name: "Ruach Gony", bucket: "high-school", school: "Bella Vista Prep", pos: "F", age: 16.4, ht: "6-8", wt: 180 },
    { id: "dk-heard-2029", name: "DK Heard", bucket: "high-school", school: "Mount Carmel", pos: "G", age: 16.4, ht: "6-4", wt: 170 },
    { id: "bob-da-silva-2029", name: "Bob Da Silva", bucket: "high-school", school: "Andrews Osborne Academy", pos: "F", age: 16.4, ht: "6-6", wt: 190 },
    { id: "zaire-colbert-2029", name: "Zaire Colbert", bucket: "high-school", school: "The Rock School", pos: "G", age: 16.4, ht: "6-0", wt: 160 },
    { id: "phillip-reed-2029", name: "Phillip Reed", bucket: "high-school", school: "Palisades", pos: "G", age: 16.4, ht: "6-1", wt: 170 },
    { id: "treyvon-gillum-2029", name: "Trey'Von Gillum", bucket: "high-school", school: "Atchison", pos: "G", age: 16.4, ht: "6-1", wt: null },
    { id: "dari-bruce-2029", name: "D'Ari Bruce", bucket: "high-school", school: "Oakland", pos: "F", age: 16.4, ht: "6-5", wt: 210 },
    { id: "jaylen-shepherd-2029", name: "Jaylen Shepherd", bucket: "high-school", school: "Crestwood Prep", pos: "G", age: 16.4, ht: "6-2", wt: 160 },
    { id: "damari-smith-2029", name: "Damari Smith", bucket: "high-school", school: "Crestwood Prep", pos: "G", age: 16.4, ht: "6-2", wt: 160 },
    { id: "brayden-ragland-2029", name: "Brayden Ragland", bucket: "high-school", school: "Highland", pos: "F", age: 16.4, ht: "6-6", wt: 230 },
    { id: "drew-cabana-2029", name: "Drew Cabana", bucket: "high-school", school: "Chelsea", pos: "G", age: 16.4, ht: "6-5", wt: 180 },
    { id: "jaiden-hunter-2029", name: "Jaiden Hunter", bucket: "high-school", school: "Miller School", pos: "G", age: 16.4, ht: "6-7", wt: 190 },
    { id: "diego-fernandez-2029", name: "Diego Fernandez", bucket: "high-school", school: "Miller School", pos: "C", age: 16.4, ht: "6-9", wt: 215 },
    { id: "javez-coleby-2029", name: "Javez Coleby", bucket: "high-school", school: "Veritas Christian", pos: "F", age: 16.4, ht: "6-7", wt: 205 },
    { id: "finn-mccauley-2029", name: "Finn McCauley", bucket: "high-school", school: "New Hampton School", pos: "F", age: 16.4, ht: "6-7", wt: 185 },
    { id: "benjamin-berrouet-2029", name: "Benjamin Berrouet", bucket: "high-school", school: "Dynamic Prep", pos: "F", age: 16.4, ht: "6-8", wt: 240 },
    { id: "myles-hayes-2029", name: "Myles Hayes", bucket: "high-school", school: "Woodward Academy", pos: "G", age: 16.4, ht: "6-5", wt: 175 },
    { id: "xavier-young-2029", name: "Xavier Young", bucket: "high-school", school: "Faith Family Academy", pos: "C", age: 16.4, ht: "6-9", wt: 210 },
    { id: "evan-willis-2029", name: "Evan Willis", bucket: "high-school", school: "Utah Prep", pos: "F", age: 16.4, ht: "6-7", wt: 200 },
    { id: "brady-pettigrew-2029", name: "Brady Pettigrew", bucket: "high-school", school: "Bolingbrook", pos: "G", age: 16.4, ht: "6-3", wt: 185 },
    { id: "mateen-cleaves-jr-2029", name: "Mateen Cleaves Jr.", bucket: "high-school", school: "Dream City Christian", pos: "G", age: 16.4, ht: "6-3", wt: 200 },
    { id: "jordan-mize-2029", name: "Jordan Mize", bucket: "high-school", school: "Sierra Canyon", pos: "F", age: 16.4, ht: "6-5", wt: 165 },
    { id: "blaze-johnson-2029", name: "Blaze Johnson", bucket: "high-school", school: "Dynamic Prep", pos: "G", age: 16.4, ht: "6-5", wt: 175 },
    { id: "isaiah-hamilton-2029", name: "Isaiah Hamilton", bucket: "high-school", school: "Montverde Academy", pos: "F", age: 16.4, ht: "6-7", wt: 200 },
    { id: "xavier-skipworth-2029", name: "Xavier Skipworth", bucket: "high-school", school: "Montverde Academy", pos: "F", age: 16.4, ht: "6-5", wt: 185 },
    { id: "jakyi-miles-2029", name: "Jakyi Miles", bucket: "high-school", school: "AZ Compass Prep", pos: "G", age: 16.4, ht: "6-3", wt: 165 },
    { id: "liam-mitakaro-2029", name: "Liam Mitakaro", bucket: "high-school", school: "Bella Vista Prep", pos: "G", age: 16.4, ht: "6-3", wt: 170 },
    { id: "tai-bell-2029", name: "Tai Bell", bucket: "high-school", school: "Christopher Columbus", pos: "G", age: 16.4, ht: "6-3", wt: 175 },
    { id: "anthony-spratt-2029", name: "Anthony Spratt", bucket: "high-school", school: "Benton", pos: "G", age: 16.4, ht: "6-4", wt: 190 },
    { id: "logan-chwastyk-2029", name: "Logan Chwastyk", bucket: "high-school", school: "Malvern Prep", pos: "C", age: 16.4, ht: "6-9", wt: 200 },
    { id: "jj-sati-grier-2029", name: "JJ Sati-Grier", bucket: "high-school", school: "Sierra Canyon", pos: "G", age: 16.4, ht: "5-10", wt: 150 },
    { id: "nash-avery-2029", name: "Nash Avery", bucket: "high-school", school: "Archbishop Spalding", pos: "F", age: 16.4, ht: "6-8", wt: 200 },
    { id: "shalen-sheppard-2029", name: "Shalen Sheppard", bucket: "high-school", school: "Crossroads", pos: "F", age: 16.4, ht: "6-8", wt: 215 },
    { id: "landon-lampley-2029", name: "Landon Lampley", bucket: "high-school", school: "Pike", pos: "F", age: 16.4, ht: "6-6", wt: 180 },
    { id: "darren-ford-2029", name: "Darren Ford", bucket: "high-school", school: "AZ Compass Prep", pos: "G", age: 16.4, ht: "6-2", wt: 180 },
    { id: "martin-sibal-2029", name: "Martin Sibal", bucket: "high-school", school: "Christopher Columbus", pos: "C", age: 16.4, ht: "7-2", wt: 210 },
    { id: "josh-lowery-2029", name: "Josh Lowery", bucket: "high-school", school: "Sierra Canyon", pos: "F", age: 16.4, ht: "6-4", wt: 180 },
    { id: "will-brunson-2029", name: "Will Brunson", bucket: "high-school", school: "IMG Academy", pos: "F", age: 16.4, ht: "6-5", wt: 185 },
    { id: "braxton-bogard-2029", name: "Braxton Bogard", bucket: "high-school", school: "The Masters Academy", pos: "F", age: 16.4, ht: "6-9", wt: 210 }
  ];
  function norm(n) { return String(n || "").toLowerCase().replace(/[^a-z0-9]+/g, ""); }
  function apply() {
    var d = window.TANK_RANK && TANK_RANK.drafts && TANK_RANK.drafts[2029];
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
