(function () {
  function fold(s) {
    return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  function fmtExp(n) { return TR.Model ? TR.Model.fmtExp(n) : String(n); }
  function fmtPct(n) { return TR.Model ? TR.Model.fmtPct(n) : Math.round((n || 0) * 100) + "%"; }
  function fmtMul(m) { return TR.Model ? TR.Model.fmtMul(m) : ("\u00d7" + Number(m).toFixed(2)); }
  function dash(v) {
    if (v == null || v === "") return "\u2014";
    return String(v);
  }
  function project(p, feat, priors) { return TR.projectPlayer(p, feat, priors); }
  function deriveFeat(p) { return TR.deriveFeat(p); }
  function findPlayer(draft, id) {
    const list = (draft && draft.players) || [];
    if (!list.length) return null;
    let p = list.find(function (x) { return x.id === id; });
    if (p) return p;
    const fid = fold(id);
    p = list.find(function (x) { return fold(x.id) === fid; });
    if (p) return p;
    const m = String(id || "").match(/-(\d{4})-(\d+)$/);
    if (m) {
      const pk = Number(m[2]);
      p = list.find(function (x) { return Number(x.rank) === pk; });
    }
    return p || list[0];
  }
  function css() {
    if (document.getElementById("th-card-css")) return;
    const s = document.createElement("style");
    s.id = "th-card-css";
    s.textContent = ".player-hero .lede{display:none!important}.player-hero + .section .grid-3{display:none!important}.th-math{margin:8px 0 28px}.th-eq{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:0 0 16px}.th-eq div{background:var(--bg-2);border:1px solid var(--line);border-radius:14px;padding:12px 14px}.th-eq label{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}.th-eq b{font-family:var(--serif);font-size:26px;font-weight:500}.th-eq span{display:block;margin-top:4px;color:var(--muted);font-size:12px}.th-ledger table{min-width:560px}.th-mul{font-family:var(--mono);white-space:nowrap}.th-mul.up{color:var(--lime)}.th-mul.down{color:var(--coral)}.th-mul.flat{color:var(--muted)}.size-grid .tile.th-empty{display:none}@media (max-width:860px){.th-eq{grid-template-columns:1fr 1fr}}";
    document.head.appendChild(s);
  }
  function mulClass(m) {
    if (!m || Math.abs(m - 1) < 0.02) return "flat";
    return m > 1 ? "up" : "down";
  }
  function hideEmptySize() {
    var box = document.getElementById("size-box");
    if (!box) return;
    var cells = box.querySelectorAll(".size-grid > div");
    var real = 0;
    cells.forEach(function (tile) {
      var label = ((tile.querySelector("label") || {}).textContent || "");
      var b = ((tile.querySelector("b") || {}).textContent || "").trim();
      var empty = !b || b === "\u2014" || b === "-" || b === "undefined" || b === "/ lbs" || b === "lbs";
      var meta = /source|combine vs listed|lbs \/ inch|wingspan|standing reach/i.test(label);
      if (empty) tile.style.display = "none";
      else {
        tile.style.display = "";
        if (/height|weight/i.test(label)) real++;
        if (/wingspan/i.test(label) && !/height/.test(label)) real++;
      }
      if (meta && empty) tile.style.display = "none";
    });
    box.style.display = real ? "" : "none";
  }
  function scrubPills(root, p, feat, year) {
    var pills = root.querySelector(".pills");
    if (!pills) return;
    var school = String(p.school || "").replace(/\s*\((RS-)?(Fr|So|Jr|Sr|HS)[^)]*\)\s*$/i, "").trim();
    var ht = feat.ht || p.htListed || p.htCombine || p.ht;
    var wt = feat.wt || p.wt;
    var age = (p.draftAge != null) ? p.draftAge : ((p.age !== "" && p.age != null) ? p.age : null);
    var tags = [];
    if (year) tags.push(String(year));
    if (p.pos) tags.push(p.pos);
    if (school && school !== "\u2014") tags.push(school);
    if (ht && wt) tags.push(ht + " / " + wt);
    else if (ht) tags.push(String(ht));
    if (age != null && age !== "") tags.push("Age " + age);
    if (p.hof) tags.push("Hall of Fame");
    pills.innerHTML = tags.map(function (x) { return '<span class="tag">' + x + "</span>"; }).join("");
  }
  function cell(label, val) {
    if (val == null || val === "") return "";
    return '<div class="metric"><label>' + label + "</label><b>" + val + "</b></div>";
  }
  function paint(root, p, priors) {
    window.__TDM_THEORY_CARD = true;
    css();
    const feat = Object.assign({}, deriveFeat(p), p.theoryFeat || {});
    p.theoryFeat = feat;
    const full = project(p, feat, priors);
    p.proj = full;
    const lede = root.querySelector(".lede");
    if (lede) { lede.textContent = ""; lede.style.display = "none"; }
    const year = new URLSearchParams(location.search).get("year") || "";
    const cur = (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
    const historic = Number(year) < cur;
    scrubPills(root, p, feat, year);
    const metrics = root.querySelector(".metrics");
    if (metrics) {
      var g = (p.g != null && p.g !== "") ? Number(p.g).toLocaleString("en-US") : "";
      var pts = (p.pts != null && p.pts !== "") ? Number(p.pts).toFixed(1) : "";
      var ws = (p.ws != null && p.ws !== "") ? Number(p.ws).toFixed(1) : "";
      metrics.innerHTML =
        cell("Yrs", p.yrs != null && p.yrs !== "" ? p.yrs : "") +
        cell("G", g) +
        cell("PTS", pts) +
        cell("WS", ws) +
        cell("AS", p.allStar != null && p.allStar !== "" ? p.allStar : (historic ? 0 : "")) +
        cell("All-NBA", p.allNba != null && p.allNba !== "" ? p.allNba : (historic ? 0 : "")) +
        cell("MVP", p.mvp != null && p.mvp !== "" ? p.mvp : (historic ? 0 : "")) +
        cell("Titles", p.champs != null && p.champs !== "" ? p.champs : (historic ? 0 : "")) +
        cell("HOF", p.hof ? "Yes" : (historic ? "No" : ""));
    }
    const h1 = root.querySelector(".player-hero h1");
    if (h1 && p.name) h1.textContent = p.name;
    const kick = root.querySelector(".player-hero .kicker");
    if (kick) {
      kick.textContent = year + " \u00b7 #" + p.rank + (p.team ? " \u00b7 " + p.team : "");
    }
    const existing = root.querySelector(".th-player");
    if (existing) existing.remove();
    const rows = (full.steps || []).filter(function (s) {
      return s.id === "slot" || Math.abs((s.mAs || 1) - 1) >= 0.02 || Math.abs((s.mHof || s.mMvp || 1) - 1) >= 0.02;
    });
    const body = rows.map(function (s) {
      return "<tr><td>" + s.label + "</td><td>" + (s.value || "\u2014") + "</td>"
        + '<td class="th-mul ' + mulClass(s.mAs) + '">' + fmtMul(s.mAs) + "</td>"
        + '<td class="th-mul ' + mulClass(s.mHof || s.mMvp) + '">' + fmtMul(s.mHof || s.mMvp) + "</td></tr>";
    }).join("");
    const box = document.createElement("section");
    box.className = "section th-player th-math";
    if (historic) {
      box.innerHTML = body
        ? ('<div class="kicker">Draft-night factors</div>'
          + '<div class="table-wrap th-ledger"><table><thead><tr><th>Theory</th><th>Draft night</th><th>\u00d7 AS</th><th>\u00d7 HOF</th></tr></thead><tbody>' + body + "</tbody></table></div>")
        : "";
      if (!box.innerHTML) box.remove();
    } else {
      box.innerHTML =
        '<div class="kicker">When drafted</div>'
        + '<div class="th-eq">'
        + "<div><label>AS</label><b>" + fmtExp(full.expAs) + "</b><span>career " + dash(p.allStar) + "</span></div>"
        + "<div><label>All-NBA</label><b>" + fmtExp(full.expNba) + "</b><span>career " + dash(p.allNba) + "</span></div>"
        + "<div><label>Yrs</label><b>" + fmtExp(full.expYrs) + "</b><span>career " + (p.yrs != null && p.yrs !== "" ? p.yrs : "") + "</span></div>"
        + "<div><label>MVP</label><b>" + fmtExp(full.expMvp) + "</b><span>career " + dash(p.mvp) + "</span></div>"
        + "<div><label>HOF</label><b>" + fmtPct(full.pHof) + "</b><span>career " + (p.hof ? "Yes" : "No") + "</span></div></div>"
        + (body ? '<div class="table-wrap th-ledger"><table><thead><tr><th>Theory</th><th>Draft night</th><th>\u00d7 AS</th><th>\u00d7 HOF</th></tr></thead><tbody>' + body + "</tbody></table></div>" : "");
    }
    const hero = root.querySelector(".player-hero");
    if (box.parentNode == null && box.innerHTML && hero && hero.parentNode) hero.parentNode.insertBefore(box, hero.nextSibling);
    else if (hero && hero.parentNode && box.parentNode == null) hero.parentNode.insertBefore(box, hero.nextSibling);
    hideEmptySize();
    if (historic) {
      document.querySelectorAll(".banner").forEach(function (el) { el.remove(); });
      var cta = document.querySelector(".player-hero .cta-row");
      if (cta && !cta.querySelector(".back-historic")) {
        var a = document.createElement("a");
        a.className = "btn ghost back-historic";
        a.href = "./drafts.html";
        a.textContent = "← Historic drafts";
        cta.appendChild(a);
      }
    }
  }
  function load(year) {
    const dec = (Math.floor(Number(year) / 10) * 10) + "s";
    return Promise.all([
      fetch("./assets/slot-priors.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("./assets/theory-packs/all.json").then(function (r) { return r.ok ? r.json() : null; }).then(function (all) {
        if (all && all[String(year)]) return all[String(year)];
        return fetch("./assets/theory-packs/" + year + ".json").then(function (r) { return r.ok ? r.json() : null; });
      }).catch(function () { return null; }),
      fetch("./assets/outcomes/" + dec + ".json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("./assets/outcomes-extra.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("./assets/measurements-listed.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ]).then(function (parts) {
      const priors = parts[0] || (window.TANK_RANK && TANK_RANK.slotPriors) || {};
      if (priors && window.TANK_RANK) TANK_RANK.slotPriors = priors;
      const draft = window.TANK_RANK && TANK_RANK.drafts[year];
      if (!draft) return { priors: priors };
      const pack = parts[1];
      const extra = Object.assign({}, ((parts[2] || {})[String(year)] || {}), ((parts[3] || {})[String(year)] || {}));
      const listed = parts[4] || {};
      if (pack) {
        const byPk = {};
        (pack.players || []).forEach(function (f) { byPk[f.pk] = f; });
        (draft.players || []).forEach(function (p) {
          p.theoryFeat = Object.assign({}, deriveFeat(p), byPk[p.rank] || {});
          const f = p.theoryFeat;
          if (f.ht && !p.ht) p.ht = f.ht;
          if (f.wt && !p.wt) p.wt = f.wt;
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
        const L = listed[p.id] || listed[year + "-" + p.rank];
        if (L) {
          if (L.ht && !p.ht) p.ht = L.ht;
          if (L.wt && !p.wt) p.wt = L.wt;
          if (L.wsp && !p.wsp) p.wsp = L.wsp;
          if (L.reach && !p.reach) p.reach = L.reach;
        }
        var cur = (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
        if ((p.yrs == null || p.yrs === "") && year === cur - 1) p.yrs = 0;
      });
      return { priors: priors, draft: draft };
    });
  }
  const orig = window.TR && TR.renderPlayer;
  if (typeof orig === "function") {
    TR.renderPlayer = function (root) {
      const y = Number(new URLSearchParams(location.search).get("year")) || (window.TANK_RANK && TANK_RANK.currentYear);
      const id = new URLSearchParams(location.search).get("id");
      return Promise.resolve(orig(root)).then(function () {
        return load(y).then(function (out) {
          const draft = (out && out.draft) || (window.TANK_RANK && TANK_RANK.drafts[y]);
          if (!draft) return;
          const p = findPlayer(draft, id);
          if (p) {
            if (window.TR && TR.applyMeasures) TR.applyMeasures();
            paint(root, p, (out && out.priors) || TANK_RANK.slotPriors || {});
            if (window.TR && TR.paintSize) TR.paintSize();
            hideEmptySize();
          }
        });
      });
    };
  }
})();
