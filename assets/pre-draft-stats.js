(function () {
  function pct(n) {
    if (n == null || n === "") return "\u2014";
    const x = Number(n);
    if (isNaN(x)) return String(n);
    return (x <= 1 ? (x * 100).toFixed(1) : x.toFixed(1)) + "%";
  }
  function num(n) {
    if (n == null || n === "") return "\u2014";
    return String(n);
  }
  function css() {
    if (document.getElementById("pd-css")) return;
    const s = document.createElement("style");
    s.id = "pd-css";
    s.textContent = ".pd-stats{margin:8px 0 28px}.pd-stats .table-wrap{margin-top:12px}.pd-stats td,.pd-stats th{white-space:nowrap}.pd-lvl{font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--lime)}.pd-meta{color:var(--muted);font-size:12px}";
    document.head.appendChild(s);
  }
  function rowsOf(entry) {
    if (!entry) return [];
    if (Array.isArray(entry.rows)) return entry.rows;
    if (Array.isArray(entry)) return entry;
    return [entry];
  }
  function paint(root, year, pick) {
    css();
    const pack = window.TANK_RANK && TANK_RANK.preDraft && TANK_RANK.preDraft[String(year)];
    const rows = rowsOf(pack && (pack[String(pick)] || pack[pick]));
    let box = document.getElementById("pd-box");
    if (!rows.length) {
      if (box) box.remove();
      return;
    }
    if (!box) {
      box = document.createElement("section");
      box.id = "pd-box";
      box.className = "section pd-stats";
      const hero = root.querySelector(".player-hero");
      const math = root.querySelector(".th-player");
      if (math && math.parentNode) math.parentNode.insertBefore(box, math);
      else if (hero && hero.parentNode) hero.parentNode.insertBefore(box, hero.nextSibling);
      else root.appendChild(box);
    }
    const body = rows.map(function (r) {
      return "<tr>"
        + '<td><div class="pd-lvl">' + (r.lvl || "\u2014") + '</div><div class="pd-meta">' + [r.team, r.season, r.cls].filter(Boolean).join(" \u00b7 ") + "</div></td>"
        + "<td>" + num(r.g) + "</td><td>" + num(r.mp) + "</td><td>" + num(r.pts) + "</td><td>" + num(r.trb) + "</td>"
        + "<td>" + num(r.ast) + "</td><td>" + num(r.stl) + "</td><td>" + num(r.blk) + "</td>"
        + "<td>" + num(r.tov) + "</td><td>" + pct(r.fg) + "</td><td>" + pct(r.tp) + "</td><td>" + pct(r.ft) + "</td></tr>";
    }).join("");
    box.innerHTML = '<div class="kicker">Pre-draft stats</div>'
      + '<div class="table-wrap"><table><thead><tr><th>Level</th><th>G</th><th>MP</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>TO</th><th>FG%</th><th>3P%</th><th>FT%</th></tr></thead><tbody>'
      + body + "</tbody></table></div>";
  }
  function attachFeat(year, pick, p) {
    const pack = window.TANK_RANK && TANK_RANK.preDraft && TANK_RANK.preDraft[String(year)];
    const rows = rowsOf(pack && (pack[String(pick)] || pack[pick]));
    if (!rows.length || !p) return;
    const row = rows[0];
    p.theoryFeat = p.theoryFeat || {};
    if (row.ast != null) p.theoryFeat.ast = row.ast;
    if (row.pts != null) p.theoryFeat.pts = row.pts;
    if (row.ast != null && Number(row.ast) >= 2.2) p.theoryFeat.create = 1;
  }
  function load(year) {
    if (window.TANK_RANK && TANK_RANK.preDraft && TANK_RANK.preDraft[String(year)]) {
      return Promise.resolve(TANK_RANK.preDraft[String(year)]);
    }
    return fetch("./assets/pre-draft/" + year + ".json?v=92").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
      .then(function (pack) {
        window.TANK_RANK = window.TANK_RANK || {};
        TANK_RANK.preDraft = TANK_RANK.preDraft || {};
        if (pack) TANK_RANK.preDraft[String(year)] = pack.players || pack;
        return TANK_RANK.preDraft[String(year)] || null;
      });
  }
  const orig = window.TR && TR.renderPlayer;
  if (typeof orig === "function") {
    TR.renderPlayer = function (root) {
      const y = Number(new URLSearchParams(location.search).get("year")) || (window.TANK_RANK && TANK_RANK.currentYear);
      const id = new URLSearchParams(location.search).get("id") || "";
      const m = String(id).match(/-(\d+)$/);
      const pk = m ? Number(m[1]) : 1;
      const r = orig.apply(this, arguments);
      const after = function () {
        return load(y).then(function () {
          const draft = window.TANK_RANK && TANK_RANK.drafts && TANK_RANK.drafts[y];
          const p = draft && (draft.players || []).find(function (x) { return x.id === id || Number(x.rank) === pk; });
          if (p) attachFeat(y, p.rank || pk, p);
          paint(root, y, (p && p.rank) || pk);
        });
      };
      if (r && typeof r.then === "function") return r.then(after);
      after();
      return r;
    };
  }
})();
