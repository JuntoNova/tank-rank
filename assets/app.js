(function () {
  function load(url) {
    var x = new XMLHttpRequest();
    x.open("GET", url, false);
    x.send();
    return x.responseText;
  }
  var src = load("https://cdn.jsdelivr.net/gh/JuntoNova/tank-rank@4d2b1729cda9b9a40965b36e5c5f5ce51b72951a/assets/app.js");
  src = src.replace('loadJSON("./assets/history-index.json")', 'loadJSON("./assets/history-index.json?v=84")');

  src = src.replace(
    '<a class="${active === \"upcoming\" ? \"active\" : \"\"}" href="./upcoming.html">Upcoming</a>\n          <a class="${active === \"drafts\" ? \"active\" : \"\"}" href="./drafts.html">Historic</a>\n          <a class="${active === \"board\" ? \"active\" : \"\"}" href="./board.html">Big Board</a>\n          <a class="${active === \"method\" ? \"active\" : \"\"}" href="./methodology.html">Methodology</a>\n          <a class="${active === \"about\" ? \"active\" : \"\"}" href="./about.html">About</a>',
    '<a class="${active === \"drafts\" ? \"active\" : \"\"}" href="./drafts.html">Historic</a>\n          <a class="${active === \"upcoming\" ? \"active\" : \"\"}" href="./upcoming.html">Upcoming</a>\n          <a class="${active === \"theories\" ? \"active\" : \"\"}" href="./theories.html">Theories</a>\n          <a class="${active === \"method\" ? \"active\" : \"\"}" href="./methodology.html">Methodology</a>'
  );
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
  src = src.replace(
    '<p>Every completed class, 1947–2026. Every round.</p>',
    '<p>1947–2026.</p>'
  );
  src = src.replace(
    '<p>Living 2027 board, plus 2028 and 2029.</p>',
    '<p>2027 board, plus 2028 and 2029.</p>'
  );
  src = src.replace(
    '<div class="banner">${TANK_RANK.disclaimer} ${draft.note || ""}</div>',
    '${historic ? "" : `<div class="banner">${TANK_RANK.disclaimer}</div>`}'
  );
  // Honesty: null/NaN probabilities render blank, never 0% or em dash.
  src = src.replace(
    "const fmtPct = (n) => `${Math.round(n * 100)}%`;",
    "const fmtPct = (n) => (n == null || !Number.isFinite(Number(n))) ? \"\" : `${Math.round(n * 100)}%`;"
  );
  // Honesty: living board heading uses actual count in plain words, not Top 300 / (n).
  src = src.replace(
    'year === currentYear() ? year + " Top 300" : year + " draft"',
    'year === currentYear() ? year + " board, " + playersOf(year).length + " players" : year + " draft"'
  );
  // Honesty: Exp WS / delta nulls never render as 0; prefer blank over em dash.
  src = src.replace(
    "function deltaHtml(d) {\n  if (!d) return `<span class=\"delta\">—</span>`;\n  const cls = d > 0 ? \"up\" : \"down\";\n  const sign = d > 0 ? \"+\" : \"\";\n  return `<span class=\"delta ${cls}\">${sign}${d}</span>`;\n}",
    "function deltaHtml(d) {\n  if (d == null || !Number.isFinite(Number(d))) return `<span class=\"delta\"></span>`;\n  if (!d) return `<span class=\"delta\"></span>`;\n  const cls = d > 0 ? \"up\" : \"down\";\n  const sign = d > 0 ? \"+\" : \"\";\n  return `<span class=\"delta ${cls}\">${sign}${d}</span>`;\n}"
  );
  src = src.replace(
    '<td class="pct">${(p.expWs || 0).toFixed(1)}</td>',
    '<td class="pct">${(p.expWs == null || !Number.isFinite(Number(p.expWs))) ? \"\" : Number(p.expWs).toFixed(1)}</td>'
  );
  src = src.replace(
    "function metricHtml(label, val, risk) {\n  return `<div class=\"metric\"><label>${label}</label><b>${fmtPct(val)}</b><div class=\"bar ${risk ? \"risk\" : \"\"}\"><i style=\"width:${Math.round(val * 100)}%\"></i></div></div>`;\n}",
    "function metricHtml(label, val, risk) {\n  const w = (val == null || !Number.isFinite(Number(val))) ? 0 : Math.round(val * 100);\n  return `<div class=\"metric\"><label>${label}</label><b>${fmtPct(val)}</b><div class=\"bar ${risk ? \"risk\" : \"\"}\"><i style=\"width:${w}%\"></i></div></div>`;\n}"
  );
  // Honesty: hide P(Bust) until a published definition exists.
  src = src.replace(
    '<th>Rk</th><th>Player</th><th>Bucket</th><th>P(HOF)</th><th>P(AS)</th><th>P(All-NBA)</th><th>P(Bust)</th><th>Exp WS</th><th>Δ vs cons.</th>',
    '<th>Rk</th><th>Player</th><th>Bucket</th><th>P(HOF)</th><th>P(AS)</th><th>P(All-NBA)</th><th>Exp WS</th><th>Δ vs cons.</th>'
  );
  src = src.replace(/<td class="pct">\$\{fmtPct\(p\.pBust\)\}<\/td>\s*/, "");
  src = src.replace(/\$\{metricHtml\("P\(Bust\)", p\.pBust, true\)\}\s*/, "");
  src = src.replace(
    '      </tr>`).join("") || `<tr><td colspan="9" style="color:var(--muted);padding:24px">No players match.</td></tr>`;\n  };\n\n  root.innerHTML = `\n    ${nav(year === currentYear() ? "board" : "drafts")}',
    '      </tr>`).join("") || `<tr><td colspan="8" style="color:var(--muted);padding:24px">No players match.</td></tr>`;\n  };\n\n  root.innerHTML = `\n    ${nav(year === currentYear() ? "board" : "drafts")}'
  );
  if (/betting|sportsbook|wager|gambling/i.test(src)) {
    throw new Error("Refusing to eval app blob containing banned betting language");
  }
  // PR-D: strip legacy badge / framing from CDN app blob before eval.
  src = src.replace(/<span class="badge">Prototype<\/span>/g, "");
  src = src.replace(/Feature drivers in this prototype card:/g, "Feature drivers in this card:");
  src = src.replace(/v0\.5\.\d-prototype/g, "v0.5.2");
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
