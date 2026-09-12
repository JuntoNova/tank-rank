(function () {
  function fmtExp(n) { return (window.TR && TR.Model ? TR.Model.fmtExp(n) : String(n)); }
  function fmtPct(n) { return (window.TR && TR.Model ? TR.Model.fmtPct(n) : Math.round((n || 0) * 100) + "%"); }
  function fmtSigned(n) {
    if (n == null || isNaN(n) || Math.abs(n) < 0.25) return "0";
    return (n > 0 ? "+" : "−") + Math.abs(n).toFixed(1);
  }
  function project(p, feat, priors) {
    const fn = window.TR && (TR.projectPlayer || (TR.Model && TR.Model.project));
    if (typeof fn === "function") return fn(p, feat, priors);
    return { expAs: 0, expNba: 0, expNba1: 0, expYrs: 0, expCh: 0, expMvp: 0, pHof: 0 };
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
      if (window.TR && typeof TR.deriveFeat === "function") {
        p.theoryFeat = Object.assign({}, TR.deriveFeat(p), p.theoryFeat || {});
      }
      p.proj = project(p, p.theoryFeat, priors);
    });
    const rows = filtered(draft);
    const view = viewOf();
    head.innerHTML = "<th>Pk</th><th>Player</th><th>Team</th><th>AS</th><th>1st</th><th>All-NBA</th><th>Yrs</th><th>Chips</th><th>MVP</th><th>HOF</th>";
    if (view === "drafted") {
      body.innerHTML = rows.map(function (p) {
        const proj = p.proj || project(p, p.theoryFeat, priors);
        return '<tr onclick="location.href=\'./player.html?year=' + year + "&id=" + p.id + '\'" style="cursor:pointer">'
          + '<td class="rank">' + String(p.rank).padStart(2, "0") + "</td>"
          + '<td><div class="name">' + p.name + '</div><div class="meta">' + [p.pos, p.school].filter(Boolean).join(" · ") + "</div></td>"
          + "<td>" + (p.team || "—") + "</td>"
          + '<td class="pct">' + fmtExp(proj.expAs) + "</td>"
          + '<td class="pct">' + fmtExp(proj.expNba1) + "</td>"
          + '<td class="pct">' + fmtExp(proj.expNba) + "</td>"
          + '<td class="pct">' + fmtExp(proj.expYrs) + "</td>"
          + '<td class="pct">' + fmtExp(proj.expCh) + "</td>"
          + '<td class="pct">' + fmtExp(proj.expMvp) + "</td>"
          + '<td class="pct">' + fmtPct(proj.pHof) + "</td></tr>";
      }).join("");
    } else {
      body.innerHTML = rows.map(function (p) {
        const proj = p.proj || project(p, p.theoryFeat, priors);
        const known = p.yrs != null && p.yrs !== "";
        return '<tr onclick="location.href=\'./player.html?year=' + year + "&id=" + p.id + '\'" style="cursor:pointer">'
          + '<td class="rank">' + String(p.rank).padStart(2, "0") + "</td>"
          + '<td><div class="name">' + p.name + '</div><div class="meta">' + [p.pos, p.school].filter(Boolean).join(" · ") + "</div></td>"
          + "<td>" + (p.team || "—") + "</td>"
          + '<td class="pct">' + vsCell(p.allStar, proj.expAs) + "</td>"
          + '<td class="pct">' + vsCell(p.nba1, proj.expNba1) + "</td>"
          + '<td class="pct">' + vsCell(p.allNba, proj.expNba) + "</td>"
          + '<td class="pct">' + (known ? vsCell(p.yrs, proj.expYrs) : "—") + "</td>"
          + '<td class="pct">' + (known || p.champs ? vsCell(p.champs, proj.expCh) : "—") + "</td>"
          + '<td class="pct">' + (known || p.mvp ? vsCell(p.mvp, proj.expMvp) : "—") + "</td>"
          + '<td class="pct">' + vsCell(p.hof ? 1 : 0, proj.pHof) + "</td></tr>";
      }).join("");
    }
    const sub = document.querySelector(".section-head .sub");
    if (sub) { sub.textContent = ""; sub.style.display = "none"; }
  }
  function load(year) {
    return Promise.all([
      fetch("./assets/theory-packs/all.json").then(function (r) { return r.ok ? r.json() : null; }).then(function (all) {
        if (all && all[String(year)]) return all[String(year)];
        return fetch("./assets/theory-packs/" + year + ".json").then(function (r) { return r.ok ? r.json() : null; });
      }).catch(function () { return null; }),
      fetch("./assets/slot-priors.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("./assets/outcomes-legacy.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("./assets/outcomes-extra.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("./assets/outcomes/" + (Math.floor(Number(year) / 10) * 10) + "s.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ]).then(function (parts) {
      const pack = parts[0], priors = parts[1] || (window.TANK_RANK && TANK_RANK.slotPriors) || {};
      const yk = String(year);
      const extra = Object.assign({},
        ((parts[2] || {})[yk] || {}),
        ((parts[3] || {})[yk] || {}),
        ((parts[4] || {})[yk] || {})
      );
      if (priors && window.TANK_RANK) TANK_RANK.slotPriors = priors;
      const draft = window.TANK_RANK && TANK_RANK.drafts[year];
      if (!draft) return { pack: pack, priors: priors };
      if (pack) {
        const byPk = {};
        (pack.players || []).forEach(function (f) { byPk[f.pk] = f; });
        (draft.players || []).forEach(function (p) {
          const derived = (window.TR && TR.deriveFeat) ? TR.deriveFeat(p) : {};
          p.theoryFeat = Object.assign({}, derived, byPk[p.rank] || {});
        });
      }
      (draft.players || []).forEach(function (p) {
        const o = extra[String(p.rank)];
        if (!o) return;
        if (o.hof) p.hof = 1;
        if (o.as != null) p.allStar = o.as;
        if (o.nba1 != null) p.nba1 = o.nba1;
        if (o.nba != null) p.allNba = o.nba;
        if (o.yrs != null) p.yrs = o.yrs;
        if (o.ch != null) p.champs = o.ch;
        if (o.mvp != null) p.mvp = o.mvp;
      });
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
