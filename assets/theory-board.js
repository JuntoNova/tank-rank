(function () {
  const INTENSITY = {
    "1": { as: 5.5, nba: 3.2 }, "2-3": { as: 4.2, nba: 2.4 }, "4-5": { as: 3.8, nba: 2.2 },
    "6-10": { as: 3.2, nba: 1.8 }, "11-14": { as: 2.8, nba: 1.6 },
    "15-30": { as: 2.2, nba: 1.4 }, "31+": { as: 1.8, nba: 1.3 }
  };
  function slotBucket(pk) {
    pk = Number(pk) || 99;
    if (pk === 1) return "1";
    if (pk <= 3) return "2-3";
    if (pk <= 5) return "4-5";
    if (pk <= 10) return "6-10";
    if (pk <= 14) return "11-14";
    if (pk <= 30) return "15-30";
    return "31+";
  }
  function inches(ht) {
    const m = String(ht || "").match(/(\d+)\s*-\s*(\d+)/);
    return m ? Number(m[1]) * 12 + Number(m[2]) : 0;
  }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function fmtExp(n) {
    if (n == null || isNaN(n)) return "\u2014";
    if (Math.abs(n) < 0.05) return "0";
    if (Math.abs(n) < 0.1) return n < 0 ? "\u2212<0.1" : "<0.1";
    const abs = Math.abs(n);
    return (n < 0 ? "\u2212" : "") + (abs >= 10 ? String(Math.round(abs)) : abs.toFixed(1));
  }
  function fmtSigned(n) {
    if (n == null || isNaN(n) || Math.abs(n) < 0.25) return "0";
    return (n > 0 ? "+" : "\u2212") + Math.abs(n).toFixed(1);
  }
  function fmtPct(n) { return Math.round((n || 0) * 100) + "%"; }
  function project(p, feat, priors) {
    const key = slotBucket(p.rank);
    const slot = (priors || {})[key] || {};
    let pAs = slot.pAs || 0, pNba = slot.pNba || 0, pHof = slot.pHof || 0;
    const pk = Number(p.rank) || 99;
    function mul(m) { if (m && m !== 1) { pAs *= m; pNba *= m; pHof *= m; } }
    if (feat) {
      if (feat.age != null && feat.age <= 19) mul(pk <= 5 ? 1.10 : 1.25);
      else if (feat.age != null && feat.age >= 23) mul(0.70);
      if (feat.origin === "college") {
        if ((feat.cls === "Fr" || feat.cls === "RS-Fr") && !(feat.age <= 19)) mul(1.15);
        if (feat.cls === "Sr" && !(feat.age >= 23)) mul(0.85);
      }
      if (feat.origin === "intl") {
        if (pk <= 5) mul(0.69);
        else if (pk <= 14) mul(0.59);
        if (feat.never) mul(0.05);
        else if (feat.stash || (feat.delay || 0) >= 2) mul(0.59);
      }
      if (feat.create && inches(feat.ht) >= 79) mul(1.35);
    }
    pAs = clamp(pAs, 0.002, 0.92);
    pNba = clamp(pNba, 0.001, 0.80);
    pHof = clamp(pHof, 0.0005, 0.55);
    const inten = INTENSITY[key] || INTENSITY["31+"];
    return { pAs: pAs, pNba: pNba, pHof: pHof, expAs: pAs * inten.as, expNba: pNba * inten.nba };
  }
  function vsCell(got, exp) {
    const n = Number(got) || 0;
    const d = n - exp;
    const cls = Math.abs(d) < 0.25 ? "even" : d > 0 ? "up" : "down";
    return n + ' <span class="vs ' + cls + '">' + fmtSigned(d) + "</span>";
  }
  function viewOf() {
    const v = new URLSearchParams(location.search).get("view");
    return (v === "then" || v === "drafted") ? "drafted" : "now";
  }
  function filtered(draft) {
    const q = ((document.querySelector("#q") || {}).value || "").toLowerCase();
    let rows = (draft.players || []).slice();
    if (!q) return rows;
    return rows.filter(function (p) {
      return (p.name || "").toLowerCase().indexOf(q) >= 0
        || (p.school || "").toLowerCase().indexOf(q) >= 0
        || (p.team || "").toLowerCase().indexOf(q) >= 0;
    });
  }
  function css() {
    if (document.getElementById("th-board-css")) return;
    const s = document.createElement("style");
    s.id = "th-board-css";
    s.textContent = ".vs{display:inline-block;margin-left:6px;font-size:11px;color:var(--muted)}"
      + ".vs.up{color:var(--lime)}.vs.down{color:var(--coral)}.vs.even{color:var(--gold)}";
    document.head.appendChild(s);
  }
  function paint(year, priors) {
    const draft = window.TANK_RANK && TANK_RANK.drafts[year];
    const head = document.querySelector("thead tr");
    const body = document.querySelector("#rows");
    if (!draft || !head || !body) return;
    css();
    (draft.players || []).forEach(function (p) {
      if (p.theoryFeat) p.proj = project(p, p.theoryFeat, priors);
    });
    const rows = filtered(draft);
    const view = viewOf();
    if (view === "drafted") {
      head.innerHTML = "<th>Pk</th><th>Player</th><th>Team</th><th>E[AS]</th><th>E[NBA]</th><th>P(AS)</th><th>P(HOF)</th>";
      body.innerHTML = rows.map(function (p) {
        const proj = p.proj || project(p, p.theoryFeat, priors);
        return '<tr onclick="location.href=\'./player.html?year=' + year + "&id=" + p.id + '\'" style="cursor:pointer">'
          + '<td class="rank">' + String(p.rank).padStart(2, "0") + "</td>"
          + '<td><div class="name">' + p.name + '</div><div class="meta">' + [p.pos, p.school].filter(Boolean).join(" \u00b7 ") + "</div></td>"
          + "<td>" + (p.team || "\u2014") + "</td>"
          + '<td class="pct">' + fmtExp(proj.expAs) + "</td>"
          + '<td class="pct">' + fmtExp(proj.expNba) + "</td>"
          + '<td class="pct">' + fmtPct(proj.pAs) + "</td>"
          + '<td class="pct">' + fmtPct(proj.pHof) + "</td></tr>";
      }).join("");
    } else {
      head.innerHTML = "<th>Pk</th><th>Player</th><th>Team</th><th>AS</th><th>1st</th><th>All-NBA</th><th>Yrs</th><th>Chips</th><th>MVP</th>";
      body.innerHTML = rows.map(function (p) {
        const proj = p.proj || (p.theoryFeat ? project(p, p.theoryFeat, priors) : null);
        return '<tr onclick="location.href=\'./player.html?year=' + year + "&id=" + p.id + '\'" style="cursor:pointer">'
          + '<td class="rank">' + String(p.rank).padStart(2, "0") + "</td>"
          + '<td><div class="name">' + p.name + (p.hof ? ' <span class="hof">HOF</span>' : "") + '</div><div class="meta">' + [p.pos, p.school].filter(Boolean).join(" \u00b7 ") + "</div></td>"
          + "<td>" + (p.team || "\u2014") + "</td>"
          + '<td class="pct">' + (proj ? vsCell(p.allStar, proj.expAs) : (p.allStar || "\u2014")) + "</td>"
          + '<td class="pct">' + (p.nba1 || "\u2014") + "</td>"
          + '<td class="pct">' + (proj ? vsCell(p.allNba, proj.expNba) : (p.allNba || "\u2014")) + "</td>"
          + '<td class="pct">' + (p.yrs || "\u2014") + "</td>"
          + '<td class="pct">' + (p.champs || "\u2014") + "</td>"
          + '<td class="pct">' + (p.mvp || "\u2014") + "</td></tr>";
      }).join("");
    }
    const sub = document.querySelector(".section-head .sub");
    if (sub) sub.textContent = view === "drafted" ? "E = slot prior \u00d7 scored theories." : "Actual \u2212 E.";
  }
  function load(year) {
    return Promise.all([
      fetch("./assets/theory-packs/" + year + ".json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("./assets/slot-priors.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ]).then(function (pair) {
      const pack = pair[0], priors = pair[1] || (window.TANK_RANK && TANK_RANK.slotPriors) || {};
      if (priors && window.TANK_RANK) TANK_RANK.slotPriors = priors;
      const draft = window.TANK_RANK && TANK_RANK.drafts[year];
      if (!pack || !draft) return { pack: pack, priors: priors };
      const byPk = {};
      (pack.players || []).forEach(function (f) { byPk[f.pk] = f; });
      (draft.players || []).forEach(function (p) { p.theoryFeat = byPk[p.rank]; });
      return { pack: pack, priors: priors, draft: draft };
    });
  }
  const orig = window.TR && TR.renderBoard;
  if (typeof orig !== "function") return;
  TR.renderBoard = function (root) {
    const y = Number(new URLSearchParams(location.search).get("year")) || (window.TANK_RANK && TANK_RANK.currentYear);
    return Promise.resolve(orig(root)).then(function () {
      return load(y).then(function (out) {
        if (!out || !out.draft) return;
        paint(y, out.priors);
        const toolbar = document.querySelector(".toolbar");
        if (toolbar && !toolbar.dataset.thBound) {
          toolbar.dataset.thBound = "1";
          toolbar.querySelectorAll("[data-view]").forEach(function (btn) {
            btn.addEventListener("click", function () { setTimeout(function () { paint(y, out.priors); }, 0); });
          });
          const q = document.querySelector("#q");
          if (q) q.addEventListener("input", function () { setTimeout(function () { paint(y, out.priors); }, 0); });
        }
      });
    });
  };
})();
