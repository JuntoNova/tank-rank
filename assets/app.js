(function () {
  function load(url) {
    var x = new XMLHttpRequest();
    x.open("GET", url, false);
    x.send();
    return x.responseText;
  }
  var src = load("https://cdn.jsdelivr.net/gh/JuntoNova/tank-rank@4d2b1729cda9b9a40965b36e5c5f5ce51b72951a/assets/app.js");
  src = src.replace(
    '<div class="kicker">Archive</div>',
    '<div class="kicker">Past</div>'
  );
  // Trust pack: honest count (not Top 300)
  src = src.replace(
    'year === currentYear() ? year + " Top 300" : year + " draft"',
    'year === currentYear() ? year + " board (" + playersOf(year).length + ")" : year + " draft"'
  );
  // Trust pack: remove P(Bust) until published definition
  src = src.replace(
    '<th>Rk</th><th>Player</th><th>Bucket</th><th>P(HOF)</th><th>P(AS)</th><th>P(All-NBA)</th><th>P(Bust)</th><th>Exp WS</th><th>Δ vs cons.</th>',
    '<th>Rk</th><th>Player</th><th>Bucket</th><th>P(HOF)</th><th>P(AS)</th><th>P(All-NBA)</th><th>Exp WS</th><th>Δ vs cons.</th>'
  );
  src = src.replace('        <td class="pct">${fmtPct(p.pBust)}</td>\n', "");
  src = src.replace('          ${metricHtml("P(Bust)", p.pBust, true)}\n', "");
  // Living-board empty row colspan was 9; drop one for removed P(Bust)
  src = src.replace(
    '      </tr>`).join("") || `<tr><td colspan="9" style="color:var(--muted);padding:24px">No players match.</td></tr>`;\n  };\n\n  root.innerHTML = `\n    ${nav(year === currentYear() ? "board" : "drafts")}',
    '      </tr>`).join("") || `<tr><td colspan="8" style="color:var(--muted);padding:24px">No players match.</td></tr>`;\n  };\n\n  root.innerHTML = `\n    ${nav(year === currentYear() ? "board" : "drafts")}'
  );
  var future = src.match(/<a class="door" href=\"\.\/upcoming\.html\">[\s\S]*?<\/a>/);
  var historic = src.match(/<a class="door" href=\"\.\/drafts\.html\">[\s\S]*?<\/a>/);
  if (future && historic) {
    src = src.replace(future[0] + "\n        " + historic[0], historic[0] + "\n        " + future[0]);
  }

  // Populate honesty: unavailable probs/metrics render as em dash
  src = src.replace(
    'const fmtPct = (n) => `${Math.round(n * 100)}%`;',
    'const fmtPct = (n) => (n == null || Number.isNaN(Number(n))) ? "—" : `${Math.round(Number(n) * 100)}%`;'
  );
  src = src.replace(
    'function metricHtml(label, val, risk) {\n  return `<div class="metric"><label>${label}</label><b>${fmtPct(val)}</b><div class="bar ${risk ? "risk" : ""}"><i style="width:${Math.round(val * 100)}%"></i></div></div>`;\n}',
    'function metricHtml(label, val, risk) {\n  if (val == null || Number.isNaN(Number(val))) return `<div class="metric"><label>${label}</label><b>—</b><div class="bar"><i style="width:0%"></i></div></div>`;\n  return `<div class="metric"><label>${label}</label><b>${fmtPct(val)}</b><div class="bar ${risk ? "risk" : ""}"><i style="width:${Math.round(val * 100)}%"></i></div></div>`;\n}'
  );
  src = src.replace(
    '<td class="pct">${(p.expWs || 0).toFixed(1)}</td>',
    '<td class="pct">${p.expWs == null ? "—" : Number(p.expWs).toFixed(1)}</td>'
  );
  src = src.replace(
    'function deltaHtml(d) {\n  if (!d) return `<span class="delta">—</span>`;',
    'function deltaHtml(d) {\n  if (d == null || d === "" || Number.isNaN(Number(d))) return `<span class="delta">—</span>`;'
  );
  eval(src);
})();
