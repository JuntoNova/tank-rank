(function () {
  function load(url) {
    var x = new XMLHttpRequest();
    x.open("GET", url, false);
    x.send();
    return x.responseText;
  }
  function extractDoor(src, href) {
    var needle = '<a class="door" href="' + href + '">';
    var start = src.indexOf(needle);
    if (start < 0) return null;
    var end = src.indexOf("</a>", start);
    if (end < 0) return null;
    return src.slice(start, end + 4);
  }
  var src = load("https://cdn.jsdelivr.net/gh/JuntoNova/tank-rank@4d2b1729cda9b9a40965b36e5c5f5ce51b72951a/assets/app.js");
  src = src.replace(
    '<div class="kicker">Archive</div>',
    '<div class="kicker">Past</div>'
  );
  src = src.replace(
    'year === currentYear() ? year + " Top 300" : year + " draft"',
    'year === currentYear() ? year + " board (" + playersOf(year).length + ")" : year + " draft"'
  );
  src = src.replace(
    '<th>Rk</th><th>Player</th><th>Bucket</th><th>P(HOF)</th><th>P(AS)</th><th>P(All-NBA)</th><th>P(Bust)</th><th>Exp WS</th><th>Δ vs cons.</th>',
    '<th>Rk</th><th>Player</th><th>Bucket</th><th>P(HOF)</th><th>P(AS)</th><th>P(All-NBA)</th><th>Exp WS</th><th>Δ vs cons.</th>'
  );
  src = src.replace('        <td class="pct">${fmtPct(p.pBust)}</td>\n', "");
  src = src.replace('          ${metricHtml("P(Bust)", p.pBust, true)}\n', "");
  src = src.replace(
    '      </tr>`).join("") || `<tr><td colspan="9" style="color:var(--muted);padding:24px">No players match.</td></tr>`;\n  };\n\n  root.innerHTML = `\n    ${nav(year === currentYear() ? "board" : "drafts")}',
    '      </tr>`).join("") || `<tr><td colspan="8" style="color:var(--muted);padding:24px">No players match.</td></tr>`;\n  };\n\n  root.innerHTML = `\n    ${nav(year === currentYear() ? "board" : "drafts")}'
  );
  src = src.replace(
    '<a class="${active === "upcoming" ? "active" : ""}" href="./upcoming.html">Upcoming</a>\n          <a class="${active === "drafts" ? "active" : ""}" href="./drafts.html">Historic</a>',
    '<a class="${active === "drafts" ? "active" : ""}" href="./drafts.html">Historic</a>\n          <a class="${active === "upcoming" ? "active" : ""}" href="./upcoming.html">Upcoming</a>'
  );
  src = src.replace(
    '\n          <a class="${active === "about" ? "active" : ""}" href="./about.html">About</a>',
    ''
  );
  var future = extractDoor(src, "./upcoming.html");
  var historic = extractDoor(src, "./drafts.html");
  if (future && historic) {
    src = src.replace(future + "\n        " + historic, historic + "\n        " + future);
  }
  src = src.replace(
    'const fmtPct = (n) => `${Math.round(n * 100)}%`;',
    'const fmtPct = (n) => (n == null || Number.isNaN(Number(n))) ? "\u2014" : `${Math.round(Number(n) * 100)}%`;'
  );
  src = src.replace(
    'function metricHtml(label, val, risk) {\n  return `<div class="metric"><label>${label}</label><b>${fmtPct(val)}</b><div class="bar ${risk ? "risk" : ""}"><i style="width:${Math.round(val * 100)}%"></i></div></div>`;\n}',
    'function metricHtml(label, val, risk) {\n  if (val == null || Number.isNaN(Number(val))) return `<div class="metric"><label>${label}</label><b>\u2014</b><div class="bar"><i style="width:0%"></i></div></div>`;\n  return `<div class="metric"><label>${label}</label><b>${fmtPct(val)}</b><div class="bar ${risk ? "risk" : ""}"><i style="width:${Math.round(val * 100)}%"></i></div></div>`;\n}'
  );
  src = src.replace(
    '<td class="pct">${(p.expWs || 0).toFixed(1)}</td>',
    '<td class="pct">${p.expWs == null ? "\u2014" : Number(p.expWs).toFixed(1)}</td>'
  );
  src = src.replace(
    'function deltaHtml(d) {\n  if (!d) return `<span class="delta">\u2014</span>`;',
    'function deltaHtml(d) {\n  if (d == null || d === "" || Number.isNaN(Number(d))) return `<span class="delta">\u2014</span>`;'
  );
  src = src.replace('<div class="banner">${TANK_RANK.disclaimer} ${draft.note || ""}</div>', "");
  src = src.replace('<div class="banner">${TANK_RANK.disclaimer}</div>', "");
  src = src.replace('<div>The Draft Model is a DBA of Junto Nova.</div>', "");
  src = src.replace('<div>Not affiliated with, endorsed by, or sponsored by the NBA, the NBA Draft, or any NBA team.</div>', "");
  eval(src);
})();
