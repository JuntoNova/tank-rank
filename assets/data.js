(function () {
  function load(url) {
    var x = new XMLHttpRequest();
    x.open("GET", url, false);
    x.send();
    return x.responseText;
  }
  // Pull main data.js then apply PR-H H1 clears at runtime (Exact disclaimer + pack notes).
  var src = load("https://cdn.jsdelivr.net/gh/JuntoNova/tank-rank@main/assets/data.js");
  src = src.replace(/disclaimer:\s*"[^"]*"/, 'disclaimer: ""');
  src = src.replace(/pack\(2027,\s*"2027 NBA Draft",\s*"[^"]*"/, 'pack(2027, "2027 NBA Draft", ""');
  src = src.replace(/pack\(2028,\s*"2028 NBA Draft",\s*"[^"]*"/, 'pack(2028, "2028 NBA Draft", ""');
  src = src.replace(/pack\(2029,\s*"2029 NBA Draft",\s*"[^"]*"/, 'pack(2029, "2029 NBA Draft", ""');
  src = src.replace(/\/\* Local packs; Hitch-clean disclaimer \+ living-2027-bios overlay \*\/, "/* Local packs; living-2027-bios overlay */");
  src = src.replace(/var EXACT\s*=\s*"[^"]*";\s*if\s*\(window\.TANK_RANK\)\s*TANK_RANK\.disclaimer\s*=\s*EXACT;\s*/, "");
  eval(src);
})();
