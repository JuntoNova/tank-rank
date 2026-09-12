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
  src = src.replace(/<div>The Draft Model is a DBA of Junto Nova\.<\/div>/g, "");
  src = src.replace(/<div>Not affiliated with, endorsed by, or sponsored by the NBA, the NBA Draft, or any NBA team\.<\/div>/g, "");
  eval(src);
  function scrubFooter() {
    document.querySelectorAll("footer .copy div, footer p, .foot .copy div").forEach(function (el) {
      var t = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (/DBA of Junto Nova/i.test(t) || /Not affiliated with, endorsed by, or sponsored by the NBA/i.test(t)) {
        el.remove();
      }
    });
  }
  scrubFooter();
  setInterval(scrubFooter, 400);
})();
