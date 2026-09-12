(function () {
  function load(url) {
    var x = new XMLHttpRequest();
    x.open("GET", url, false);
    x.send();
    return x.responseText;
  }
  var src = load("https://cdn.jsdelivr.net/gh/JuntoNova/tank-rank@4d2b1729cda9b9a40965b36e5c5f5ce51b72951a/assets/app.js");
  src = src.replace(
    "function isSettled(year) {\n  return year <= 1999;\n}",
    "function isSettled(year) {\n  return year < currentYear();\n}"
  );
  src = src.replace(
    '<button class="chip ${view === \"then\" ? \"on\" : \"\"}" data-view="then">Then</button>',
    '<button class="chip ${view === \"then\" || view === \"drafted\" ? \"on\" : \"\"}" data-view="drafted">When drafted</button>'
  );
  src = src.replace(
    'let view = params.get("view") === "then" ? "then" : "now";',
    'let view = (params.get("view") === "then" || params.get("view") === "drafted") ? "drafted" : "now";'
  );
  src = src.replace(/view === "then"/g, 'view === "drafted"');
  src = src.replace(
    'if (view === "then") url.searchParams.set("view", "then");',
    'if (view === "drafted") url.searchParams.set("view", "drafted");'
  );
  src = src.replace(
    '<div class="kicker">Archive</div>',
    '<div class="kicker">Past</div>'
  );
  eval(src);
})();
