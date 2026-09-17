(function () {
  function fold(s) {
    return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  function fmtExp(n) { return TR.Model ? TR.Model.fmtExp(n) : String(n); }
  function fmtPct(n) { return TR.Model ? TR.Model.fmtPct(n) : Math.round((n || 0) * 100) + "%"; }
  function dash(v) {
    if (v == null || v === "") return "\u2014";
    return String(v);
  }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
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
    s.id = "th-card-css";
    s.textContent = ".player-hero .lede{display:none!important}.player-hero + .section .grid-3{display:none!important}.th-math{margin:8px 0 28px}.th-ledger table{min-width:640px}.th-ledger .name{font-weight:500}.th-ledger .meta{color:var(--muted);font-size:12px;margin-top:2px}.th-mul.up{color:var(--lime)}.th-mul.down{color:var(--coral)}.th-mul.flat{color:inherit}.size-grid .tile.th-empty{display:none}.metrics .kicker{grid-column:1/-1;margin-bottom:4px}.metrics .metric .band{display:block;font-size:11px;color:var(--muted);font-weight:400;margin-top:2px;line-height:1.2}";
    document.head.appendChild(s);
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
  function cell(label, val, extra) {
    if (val == null || val === "") return "";
    return '<div class="metric"><label>' + label + "</label><b>" + val + "</b>" + (extra || "") + "</div>";
  }
  function bandOf(full, key, pct) {
    var b = full && full.band && full.band[key];
    if (!b) return "";
    var fn = TR.Model && TR.Model.bandHtml;
    return fn ? fn(b.lo, b.hi, pct) : "";
  }
  function theoryName(s) {
    var name = s.label || s.id;
    if (s.href) name = '<a href="' + s.href + '">' + name + "</a>";
    var meta = (s.value && s.value !== "-" && s.value !== "missing") ? String(s.value) : "";
    return '<div class="name">' + name + "</div>" + (meta ? '<div class="meta">' + meta + "</div>" : "");
  }
  function scoreOf(full, mAs, mNba, mHof, mMvp, mYrs) {
    var inten = (TR.Model && TR.Model.PLAYER) || {};
    mAs = clamp(mAs, 0.18, 5.00);
    mNba = clamp(mNba, 0.18, 5.00);
    mHof = clamp(mHof, 0.20, 2.40);
    mMvp = clamp(mMvp, 0.12, 5.00);
    mYrs = clamp(mYrs, 0.45, 1.50);
    var cap = (TR.Model && TR.Model.HOF_CAP) || 0.28;
    var pHof = clamp(0.010 * mAs * mAs * mHof, 0.002, cap);
    return {
      expAs: clamp(0.50 * mAs * mAs, 0.02, 12),
      expNba1: clamp(0.028 * mNba * mNba * mNba, 0.005, 6),
      expNba: clamp(0.20 * mNba * mNba, 0.01, 12),
      expYrs: clamp(4.5 * mYrs + 2.8 * mAs, 1.5, 19),
      expCh: clamp(0.033 * mAs * mAs, 0.01, 2.50),
      expMvp: clamp(0.014 * mMvp * mMvp, 0.002, 1.20),
      pHof: pHof
    };
  }
  function moved(s) {
    return Math.abs((s.mAs || 1) - 1) >= 0.02
      || Math.abs((s.mNba || 1) - 1) >= 0.02
      || Math.abs((s.mHof || 1) - 1) >= 0.02
      || Math.abs((s.mMvp || 1) - 1) >= 0.02
      || Math.abs((s.mYrs || 1) - 1) >= 0.02;
  }
  function td(now, was, pct) {
    var txt = pct ? fmtPct(now) : fmtExp(now);
    var old = was == null ? txt : (pct ? fmtPct(was) : fmtExp(was));
    var cls = "flat";
    if (old !== txt) cls = now > was ? "up" : "down";
    return '<td class="pct th-mul ' + cls + '">' + txt + "</td>";
  }
  function ledgerRows(full) {
    var html = "";
    var prev = null;
    (full.steps || []).forEach(function (s) {
      if (s.id === "slot") return;
      if (s.id === "stash" && (s.value === "-" || s.value === "")) return;
      if (!s.snap) return;
      if (!moved(s) && s.id !== "size" && s.id !== "age") return;
      var cur = s.snap;
      var was = prev || s.prev;
      html += "<tr><td>" + theoryName(s) + "</td>"
        + td(cur.expAs, was && was.expAs, false)
        + td(cur.expNba1, was && was.expNba1, false)
        + td(cur.expNba, was && was.expNba, false)
        + td(cur.expYrs, was && was.expYrs, false)
        + td(cur.expCh, was && was.expCh, false)
        + td(cur.expMvp, was && was.expMvp, false)
        + td(cur.pHof, was && was.pHof, true)
        + "</tr>";
      prev = cur;
    });
    return html;
  }
  function paint(root, p, priors) {
    window.__TDM_THEORY_CARD = true;
    css();
    const feat = Object.assign({}, deriveFeat(p), p.theoryFeat || {});
    p.theoryFeat = feat;
    p.year = p.year || Number(new URLSearchParams(location.search).get("year")) || 0;
    const full = project(p, feat, priors);
    p.proj = full;
    const lede = root.querySelector(".lede");
    if (lede) { lede.textContent = ""; lede.style.display = "none"; }
    const year = new URLSearchParams(location.search).get("year") || "";
    const cur = (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
    const yNum = Number(year);
    const historic = yNum < cur;
    scrubPills(root, p, feat, year);
    const metrics = root.querySelector(".metrics");
    if (metrics) {
      var hofFn = (TR.careerHofP || (TR.Model && TR.Model.careerHofP));
      var hofNow = hofFn ? hofFn(p, yNum, cur) : null;
      if (hofNow == null) hofNow = full.pHof;
      var fmtHof = (TR.Model && TR.Model.fmtHofRemain)
        ? TR.Model.fmtHofRemain
        : function (n) { return n == null ? "" : Math.round(n * 100) + "%"; };
      var html = "";
      if (historic) {
        var g = (p.g != null && p.g !== "") ? Number(p.g).toLocaleString("en-US") : "0";
        var pts = (p.pts != null && p.pts !== "") ? Number(p.pts).toFixed(1) : "0.0";
        var ws = (p.ws != null && p.ws !== "") ? Number(p.ws).toFixed(1) : "0.0";
        var yrs = (p.yrs != null && p.yrs !== "") ? p.yrs : 0;
        html +=
          '<div class="kicker">Career</div>' +
          cell("Yrs", yrs) +
          cell("G", g) +
          cell("PTS", pts) +
          cell("WS", ws) +
          cell("AS", p.allStar != null && p.allStar !== "" ? p.allStar : 0) +
          cell("All-NBA", p.allNba != null && p.allNba !== "" ? p.allNba : 0) +
          cell("MVP", p.mvp != null && p.mvp !== "" ? p.mvp : 0) +
          cell("Titles", p.champs != null && p.champs !== "" ? p.champs : 0);
      }
      html +=
        '<div class="kicker">Draft night</div>' +
        cell("AS", fmtExp(full.expAs), bandOf(full, "expAs")) +
        cell("All-NBA", fmtExp(full.expNba), bandOf(full, "expNba")) +
        cell("Yrs", fmtExp(full.expYrs), bandOf(full, "expYrs")) +
        cell("MVP", fmtExp(full.expMvp), bandOf(full, "expMvp")) +
        cell("HOF then", fmtPct(full.pHof), bandOf(full, "pHof", true));
      if (historic) html += cell("HOF now", fmtHof(hofNow));
      metrics.innerHTML = html;
    }
    const h1 = root.querySelector(".player-hero h1");
    if (h1 && p.name) h1.textContent = p.name;
    const kick = root.querySelector(".player-hero .kicker");
    if (kick) {
      kick.textContent = year + " \u00b7 #" + p.rank + (p.team ? " \u00b7 " + p.team : "");
    }
    const existing = root.querySelector(".th-player");
    if (existing) existing.remove();
    const body = ledgerRows(full);
    const box = document.createElement("section");
    box.className = "section th-player th-math";
    if (body) {
      box.innerHTML =
        '<div class="kicker">Theories</div>'
        + '<div class="table-wrap th-ledger"><table><thead><tr><th>Theory</th><th>AS</th><th>1st</th><th>All-NBA</th><th>Yrs</th><th>Chips</th><th>MVP</th><th>HOF</th></tr></thead><tbody>'
        + body + "</tbody></table></div>";
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
      fetch("./assets/slot-priors.json?v=78").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      (window.TR && typeof TR.fetchTheoryPack === "function"
        ? TR.fetchTheoryPack(year)
        : fetch("./assets/theory-packs/" + year + ".json?v=94").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })),
      fetch("./assets/outcomes/" + dec + ".json?v=78").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("./assets/outcomes-extra.json?v=78").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("./assets/measurements-listed.json?v=82").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
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
        var now = (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
        if ((p.yrs == null || p.yrs === "") && year === now - 1) p.yrs = 0;
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
