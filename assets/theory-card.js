(function () {
  function fold(s) {
    return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  function fmtExp(n) { return TR.Model ? TR.Model.fmtExp(n) : String(n); }
  function fmtPct(n) { return TR.Model ? TR.Model.fmtPct(n) : Math.round((n || 0) * 100) + "%"; }
  function fmtMul(m) { return TR.Model ? TR.Model.fmtMul(m) : ("\u00d7" + Number(m).toFixed(2)); }
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
    s.textContent = ".th-math{margin:8px 0 28px}.th-eq{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 16px}.th-eq div{background:var(--bg-2);border:1px solid var(--line);border-radius:14px;padding:12px 14px}.th-eq label{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}.th-eq b{font-family:var(--serif);font-size:26px;font-weight:500}.th-eq span{display:block;margin-top:4px;color:var(--muted);font-size:12px}.th-formula{background:var(--bg-2);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:0 0 16px;font-size:13px;line-height:1.55}.th-formula code{font-family:var(--mono);font-size:12px;color:var(--lime)}.th-ledger table{min-width:720px}.th-why{color:var(--muted);font-size:12px;line-height:1.45;max-width:46ch}.th-mul{font-family:var(--mono);white-space:nowrap}.th-mul.up{color:var(--lime)}.th-mul.down{color:var(--coral)}.th-mul.flat{color:var(--muted)}@media (max-width:860px){.th-eq{grid-template-columns:1fr 1fr}}";
    document.head.appendChild(s);
  }
  function mulClass(m) {
    if (!m || Math.abs(m - 1) < 0.02) return "flat";
    return m > 1 ? "up" : "down";
  }
  function paint(root, p, priors) {
    css();
    const feat = deriveFeat(p);
    p.theoryFeat = feat;
    const full = project(p, feat, priors);
    p.proj = full; p.pHof = full.pHof; p.pAllStar = full.pAs; p.pAllNba = full.pNba;
    const lede = root.querySelector(".lede");
    if (lede) lede.textContent = "Slot prior \u00d7 scored theories. Age, class, origin, stash, handle \u00d7 size, wingspan, and reach each get their own multiplier. MVP is not a copy of the All-Star column.";
    const metrics = root.querySelector(".metrics");
    if (metrics) {
      metrics.innerHTML =
        '<div class="metric"><label>P(AS) drafted</label><b>' + fmtPct(full.pAs) + '</b><div class="bar"><i style="width:' + Math.round(full.pAs * 100) + '%"></i></div><div class="vs">slot ' + fmtPct(full.slotAs) + "</div></div>"
        + '<div class="metric"><label>P(All-NBA)</label><b>' + fmtPct(full.pNba) + '</b><div class="bar"><i style="width:' + Math.round(full.pNba * 100) + '%"></i></div><div class="vs">slot ' + fmtPct(full.slotNba) + "</div></div>"
        + '<div class="metric"><label>P(HOF)</label><b>' + fmtPct(full.pHof) + '</b><div class="bar"><i style="width:' + Math.round(full.pHof * 100) + '%"></i></div><div class="vs">slot ' + fmtPct(full.slotHof) + "</div></div>"
        + '<div class="metric"><label>E[MVP]</label><b>' + fmtExp(full.expMvp) + '</b><div class="vs">slot ' + fmtExp(full.slotMvp) + " \u00d7 " + fmtMul(full.mMvp) + "</div></div>";
    }
    root.querySelectorAll(".pills .tag").forEach(function (t) {
      const v = t.textContent.replace(/\s+/g, " ").trim();
      if (/^Age/i.test(v) && feat.age != null) t.textContent = "Age " + feat.age;
      if ((/lbs/i.test(v) || v === "/ lbs") && feat.ht) t.textContent = feat.ht + (feat.wt ? " / " + feat.wt : "");
    });
    const h1 = root.querySelector(".player-hero h1");
    if (h1 && p.name) h1.textContent = p.name;
    const existing = root.querySelector(".th-player");
    if (existing) existing.remove();
    const moved = (full.steps || []).filter(function (s) {
      return s.id !== "slot" && (Math.abs((s.mAs || 1) - 1) >= 0.02 || Math.abs((s.mMvp || 1) - 1) >= 0.02);
    });
    const product = moved.length ? moved.map(function (s) { return fmtMul(s.mAs) + " " + s.label.toLowerCase(); }).join(" \u00d7 ") : "\u00d71.00 (no scored bump fired)";
    const mvpProduct = moved.length ? moved.map(function (s) { return fmtMul(s.mMvp) + " " + s.label.toLowerCase(); }).join(" \u00d7 ") : "\u00d71.00";
    const intenAs = ((TR.Model && TR.Model.INTENSITY[full.slot]) || {}).as;
    const body = (full.steps || []).map(function (s) {
      return "<tr><td>" + s.label + "</td><td>" + s.value + "</td>"
        + '<td class="th-mul ' + mulClass(s.mAs) + '">' + fmtMul(s.mAs) + "</td>"
        + '<td class="th-mul ' + mulClass(s.mMvp) + '">' + fmtMul(s.mMvp) + "</td>"
        + '<td class="th-why">' + s.why + "</td></tr>";
    }).join("");
    const box = document.createElement("section");
    box.className = "section th-player th-math";
    box.innerHTML =
      '<div class="kicker">Draft-night math</div>'
      + "<h2 style=\"font-size:28px;margin:8px 0 14px\">Slot \u00d7 scored theories</h2>"
      + '<div class="th-eq">'
      + "<div><label>Expected AS</label><b>" + fmtExp(full.expAs) + "</b><span>career " + (Number(p.allStar) || 0) + " \u00b7 slot " + fmtPct(full.slotAs) + "</span></div>"
      + "<div><label>Expected All-NBA</label><b>" + fmtExp(full.expNba) + "</b><span>career " + (Number(p.allNba) || 0) + "</span></div>"
      + "<div><label>Expected years</label><b>" + fmtExp(full.expYrs) + "</b><span>career " + (p.yrs != null && p.yrs !== "" ? p.yrs : "\u2014") + "</span></div>"
      + "<div><label>Expected MVP</label><b>" + fmtExp(full.expMvp) + "</b><span>career " + (Number(p.mvp) || 0) + " \u00b7 slot " + fmtExp(full.slotMvp) + "</span></div></div>"
      + '<div class="th-formula"><div><code>P(AS) = ' + fmtPct(full.slotAs) + " slot \u00d7 " + product + " = " + fmtPct(full.pAs) + "</code></div>"
      + "<div><code>E[AS] = " + fmtPct(full.pAs) + " \u00d7 " + intenAs + " if-star intensity = " + fmtExp(full.expAs) + "</code></div>"
      + "<div><code>E[MVP] = " + fmtExp(full.slotMvp) + " slot \u00d7 " + mvpProduct + " = " + fmtExp(full.expMvp) + "</code></div></div>"
      + '<p class="theory-note">Each row is one scored claim and the number he had that night. Missing measurements stay at \u00d71.00 instead of inventing a number.</p>'
      + '<div class="table-wrap th-ledger"><table><thead><tr><th>Theory</th><th>His number</th><th>\u00d7 AS</th><th>\u00d7 MVP</th><th>Why</th></tr></thead><tbody>'
      + body + "</tbody></table></div>";
    const hero = root.querySelector(".player-hero");
    if (hero && hero.parentNode) hero.parentNode.insertBefore(box, hero.nextSibling);
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
      fetch("./assets/outcomes-extra.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ]).then(function (parts) {
      const priors = parts[0] || (window.TANK_RANK && TANK_RANK.slotPriors) || {};
      if (priors && window.TANK_RANK) TANK_RANK.slotPriors = priors;
      const draft = window.TANK_RANK && TANK_RANK.drafts[year];
      if (!draft) return { priors: priors };
      const pack = parts[1];
      const extra = Object.assign({}, ((parts[2] || {})[String(year)] || {}), ((parts[3] || {})[String(year)] || {}));
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
        if (!o) return;
        if (o.hof) p.hof = 1;
        if (o.as != null) p.allStar = o.as;
        if (o.nba1 != null) p.nba1 = o.nba1;
        if (o.nba != null) p.allNba = o.nba;
        if (o.yrs != null) p.yrs = o.yrs;
        if (o.ch != null) p.champs = o.ch;
        if (o.mvp != null) p.mvp = o.mvp;
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
          }
        });
      });
    };
  }
})();
