(function () {
  function fmtExp(n) {
    if (window.TR && TR.Model) return TR.Model.fmtExp(n);
    if (n == null || isNaN(n)) return "\u2014";
    if (Math.abs(n) < 0.05) return "0";
    if (Math.abs(n) < 0.1) return "<0.1";
    return Math.abs(n) >= 10 ? String(Math.round(n)) : Number(n).toFixed(1);
  }
  function fmtPct(n) { return (window.TR && TR.Model ? TR.Model.fmtPct(n) : Math.round((n || 0) * 100) + "%"); }
  function fmtSigned(n) {
    if (n == null || isNaN(n) || Math.abs(n) < 0.25) return "0";
    return (n > 0 ? "+" : "\u2212") + Math.abs(n).toFixed(1);
  }
  const FALLBACK_INT = {
    "1":    { as: 5.5, nba: 3.2, nba1: 0.90, yrs: 13.5, ch: 0.55, mvp: 0.12 },
    "2-3":  { as: 4.2, nba: 2.4, nba1: 0.65, yrs: 11.5, ch: 0.40, mvp: 0.06 },
    "4-5":  { as: 3.8, nba: 2.2, nba1: 0.45, yrs: 10.5, ch: 0.32, mvp: 0.03 },
    "6-10": { as: 3.2, nba: 1.8, nba1: 0.28, yrs: 9.0,  ch: 0.25, mvp: 0.015 },
    "11-14":{ as: 2.8, nba: 1.6, nba1: 0.20, yrs: 8.0,  ch: 0.20, mvp: 0.008 },
    "15-30":{ as: 2.2, nba: 1.4, nba1: 0.12, yrs: 6.5,  ch: 0.14, mvp: 0.003 },
    "31+":  { as: 1.8, nba: 1.3, nba1: 0.08, yrs: 3.5,  ch: 0.06, mvp: 0.001 }
  };
  function slotKey(pk) {
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
    const m = String(ht || "").match(/(\d+)\s*-\s*(\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) * 12 + Number(m[2]) : 0;
  }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function featOf(p) {
    if (window.TR && typeof TR.deriveFeat === "function") return TR.deriveFeat(p);
    const g = p.theoryFeat || {};
    const school = String(p.school || g.school || "").toLowerCase();
    let origin = g.origin || p.origin || "";
    if (!origin) {
      if (p.bucket === "international" || /france|serbia|spain|baskonia|nanterre|cedevita|chalon|melbourne|australia/i.test(school)) origin = "intl";
      else if (p.bucket === "high-school" || g.cls === "HS") origin = "hs";
      else origin = "college";
    }
    let cls = g.cls || p.cls || "";
    if (!cls) {
      var cm = String(p.school || g.school || "").match(/\((RS-Fr|RS-So|RS-Jr|RS-Sr|Fr|So|Jr|Sr)[.]?\)/i);
      if (cm) cls = cm[1].replace(/\./g, "");
      else if (origin === "intl") cls = "Intl";
      else if (origin === "hs") cls = "HS";
    }
    let age = g.age != null ? g.age : p.age;
    age = age === "" || age == null ? (origin === "hs" ? 18.5 : origin === "intl" ? 19 : 19.5) : Number(age);
    const ht = g.ht || p.ht || "";
    const pos = String(g.pos || p.pos || "");
    const htIn = inches(ht);
    const guard = /(^|\b)(PG|SG|G)(\b|\/)/i.test(pos);
    const astN = g.ast != null ? Number(g.ast) : (p.ast != null ? Number(p.ast) : NaN);
    let create = 0;
    if (g.create != null && g.create !== "") create = Number(g.create) ? 1 : 0;
    else if (isFinite(astN) && ((astN >= 2.5 && htIn >= 77) || (astN >= 2.0 && guard))) create = 1;
    return { age: age, cls: cls, origin: origin, ht: ht, wsp: g.wsp || p.wsp || "", pos: pos, create: create, stash: g.stash || 0, delay: g.delay || 0, never: g.never || 0, pts: g.pts, ast: g.ast, stl: g.stl, blk: g.blk, fga: g.fga, fta: g.fta, fg3a: g.fg3a };
  }
  function project(p, feat, priors) {
    const fn = window.TR && (TR.projectPlayer || (TR.Model && TR.Model.project));
    feat = feat || featOf(p);
    if (typeof fn === "function") return fn(p, feat, priors);
    const pk = Number(p.rank) || 99;
    const key = slotKey(pk);
    const slot = (priors || {})[key] || {};
    const inten = FALLBACK_INT[key] || FALLBACK_INT["31+"];
    let mAs = 1, mNba = 1, mHof = 1, mMvp = 1, mYrs = 1;
    function mul(a, v, hof) {
      if (!a) a = 1; if (v == null) v = a; if (hof == null) hof = a;
      mAs *= a; mNba *= a; mHof *= hof; mMvp *= v;
    }
    const age = feat.age;
    if (age < 19.5) { mul(pk <= 5 ? 1.18 : 1.28, pk <= 5 ? 1.70 : 1.85, pk <= 5 ? 1.22 : 1.30); }
    else if (age < 20.5) { mul(pk <= 5 ? 1.14 : 1.22, pk <= 5 ? 1.35 : 1.50, pk <= 5 ? 1.16 : 1.22); }
    else if (age < 21.5) { mul(1.06, 1.10, 1.06); }
    else if (age < 22.5) { mul(0.96, 0.80, 0.95); }
    else { mul(0.72, 0.40, 0.75); }
    const cls = feat.cls || "";
    if (feat.origin === "college") {
      if (cls === "Fr" || cls === "RS-Fr") mul(age < 20.5 ? 1.04 : 1.12, age < 20.5 ? 1.10 : 1.25);
      else if (cls === "Sr" || cls === "RS-Sr") { if (!(age >= 22.5)) mul(0.88, 0.70); }
      else if (cls === "Jr" || cls === "RS-Jr") mul(0.96, 0.90);
    }
    if (feat.origin === "intl") {
      if (pk <= 5) mul(0.69, 0.45, 1.05);
      else if (pk <= 14) mul(0.59, 0.80, 1);
      if (feat.never) mul(0.05, 0.05);
      else if (feat.stash || (feat.delay || 0) >= 2) mul(0.59, 0.50);
    } else if (feat.origin === "hs") {
      mul(pk <= 14 ? 0.95 : 1.15, pk <= 5 ? 1.55 : 1.35, pk <= 5 ? 1.20 : 1.10);
    }
    const htIn = inches(feat.ht);
    if (feat.create && htIn >= 79) mul(1.22, 1.05, 1);
    else if (feat.create && htIn >= 77) mul(1.16, 1.18, 1);
    else if (htIn && htIn < 77 && /(PG|SG|G)/i.test(feat.pos || "")) mul(1.08, 1.20, 1);
    const wspIn = inches(feat.wsp);
    if (wspIn && htIn) {
      const ape = wspIn - htIn;
      if (htIn >= 82 && ape >= 6) mul(1.28, 1.00, 1.15);
      else if (ape >= 6) mul(1.10, 1.05, 1.08);
      else if (ape < 4 && htIn >= 79 && htIn < 84) mul(0.90, 0.85, 0.92);
    }
    mAs = clamp(mAs, 0.20, 2.20); mNba = clamp(mNba, 0.20, 2.20);
    mHof = clamp(mHof, 0.35, 1.80); mMvp = clamp(mMvp, 0.15, 3.20); mYrs = clamp(mYrs, 0.55, 1.35);
    const pAs = clamp((slot.pAs || 0) * mAs, 0.002, 0.92);
    const pNba = clamp((slot.pNba || 0) * mNba, 0.001, 0.80);
    const pHof = clamp((slot.pHof || 0) * 0.20 * mHof, 0.0005, 0.10);
    return {
      expAs: pAs * inten.as, expNba: pNba * inten.nba, expNba1: pNba * inten.nba1,
      expYrs: inten.yrs * mYrs, expCh: inten.ch * clamp((mAs + mHof) / 2, 0.50, 1.40),
      expMvp: inten.mvp * mMvp, pHof: pHof, pAs: pAs, mHof: mHof
    };
  }
  function vsCell(got, exp) {
    const n = Number(got) || 0;
    const d = n - exp;
    const cls = Math.abs(d) < 0.25 ? "even" : d > 0 ? "up" : "down";
    return n + ' <span class="vs ' + cls + '">' + fmtSigned(d) + "</span>";
  }
  function fmtHofNow(n) {
    if (window.TR && TR.Model && TR.Model.fmtHofRemain) return TR.Model.fmtHofRemain(n);
    if (n == null || !isFinite(Number(n))) return "\u2014";
    const p = Number(n);
    if (p <= 0) return "0%";
    if (p >= 0.995) return "100%";
    const pct = Math.round(p * 100);
    return pct === 0 ? "<1%" : pct + "%";
  }
  function hofNowCell(p, proj, year) {
    const cur = (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
    const fn = window.TR && (TR.careerHofP || (TR.Model && TR.Model.careerHofP));
    let nowP = fn ? fn(p, year, cur) : null;
    const draftP = proj && proj.pHof != null ? Number(proj.pHof) : 0;
    if (nowP == null) nowP = draftP;
    if (nowP == null || !isFinite(nowP)) return "\u2014";
    const d = (nowP - draftP) * 100;
    const cls = Math.abs(d) < 1 ? "even" : d > 0 ? "up" : "down";
    const signed = Math.abs(d) < 1 ? "0" : ((d > 0 ? "+" : "\u2212") + String(Math.round(Math.abs(d))));
    return fmtHofNow(nowP) + ' <span class="vs ' + cls + '">' + signed + "</span>";
  }
  function viewOf() {
    const y = Number(new URLSearchParams(location.search).get("year")) || (window.TANK_RANK && TANK_RANK.currentYear);
    const cur = (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
    const v = new URLSearchParams(location.search).get("view");
    if (v === "then" || v === "drafted") return "drafted";
    if (v === "now") return "now";
    if (y >= cur - 1) return "drafted";
    return "now";
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
    if (year < ((window.TANK_RANK && TANK_RANK.currentYear) || 2027)) {
      document.querySelectorAll(".banner").forEach(function (el) { el.remove(); });
    }
    (draft.players || []).forEach(function (p) {
      p.theoryFeat = Object.assign({}, featOf(p), p.theoryFeat || {});
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
          + "<td>" + (p.team || "\u2014") + "</td>"
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
          + "<td>" + (p.team || "\u2014") + "</td>"
          + '<td class="pct">' + vsCell(p.allStar, proj.expAs) + "</td>"
          + '<td class="pct">' + vsCell(p.nba1, proj.expNba1) + "</td>"
          + '<td class="pct">' + vsCell(p.allNba, proj.expNba) + "</td>"
          + '<td class="pct">' + (known ? vsCell(p.yrs, proj.expYrs) : "\u2014") + "</td>"
          + '<td class="pct">' + (known || p.champs ? vsCell(p.champs, proj.expCh) : "\u2014") + "</td>"
          + '<td class="pct">' + (known || p.mvp ? vsCell(p.mvp, proj.expMvp) : "\u2014") + "</td>"
          + '<td class="pct">' + hofNowCell(p, proj, year) + "</td></tr>";
      }).join("");
    }
    const sub = document.querySelector(".section-head .sub");
    const cur = (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
    if (sub) {
      if (view === "drafted" && year === cur - 1) {
        sub.textContent = "No NBA season yet. These are draft-night projections, not career totals.";
        sub.style.display = "";
      } else {
        sub.textContent = "";
        sub.style.display = "none";
      }
    }
    const headEl = document.querySelector(".section-head");
    if (headEl && year < ((window.TANK_RANK && TANK_RANK.currentYear) || 2027)) {
      if (!headEl.querySelector(".back-historic")) {
        const a = document.createElement("a");
        a.className = "btn ghost back-historic";
        a.href = "./drafts.html";
        a.textContent = "\u2190 Historic drafts";
        headEl.appendChild(a);
      }
    }
  }
  function load(year) {
    return Promise.all([
      fetch("./assets/theory-packs/all.json?v=80").then(function (r) { return r.ok ? r.json() : null; }).then(function (all) {
        if (all && all[String(year)]) return all[String(year)];
        return fetch("./assets/theory-packs/" + year + ".json?v=86").then(function (r) { return r.ok ? r.json() : null; });
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
          const f = p.theoryFeat;
          if (f.ht && !p.ht) p.ht = f.ht;
          if (f.wt && (p.wt == null || p.wt === "")) p.wt = f.wt;
          if (f.wsp && !p.wsp) p.wsp = f.wsp;
          if (f.reach && !p.reach) p.reach = f.reach;
          if (f.age && (p.age === "" || p.age == null)) p.age = f.age;
        });
      }
      (draft.players || []).forEach(function (p) {
        const o = extra[String(p.rank)];
        if (o) {
          if (o.hof) p.hof = 1;
          if (o.as != null) p.allStar = o.as;
          if (o.nba1 != null) p.nba1 = o.nba1;
          if (o.nba != null) p.allNba = o.nba;
          if (o.yrs != null) p.yrs = o.yrs;
          if (o.ch != null) p.champs = o.ch;
          if (o.mvp != null) p.mvp = o.mvp;
        }
        var cur = (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
        if ((p.yrs == null || p.yrs === "") && year === cur - 1) p.yrs = 0;
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
