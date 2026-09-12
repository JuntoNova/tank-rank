(function () {
  function fold(s) {
    return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  function fmtMul(m) { return window.TR && TR.Model ? TR.Model.fmtMul(m) : ("\u00d7" + Number(m).toFixed(2)); }
  function project(p, feat, priors) { return TR.projectPlayer(p, feat, priors); }
  function deriveFeat(p) { return TR.deriveFeat(p); }
  function findPlayer(draft, id) {
    const list = (draft && draft.players) || [];
    let p = list.find(function (x) { return x.id === id; });
    if (p) return p;
    const fid = fold(id);
    p = list.find(function (x) { return fold(x.id) === fid; });
    if (p) return p;
    const m = String(id || "").match(/-(\d{4})-(\d+)$/);
    if (m) p = list.find(function (x) { return Number(x.rank) === Number(m[2]); });
    return p || list[0];
  }
  function css() {
    if (document.getElementById("th-card-css")) return;
    const s = document.createElement("style");
    s.id = "th-card-css";
    s.textContent = ".player-hero .lede,.player-hero .metrics{display:none!important}.player-hero + .section .grid-3{display:none!important}.th-math{margin:8px 0 28px}.th-mul.up{color:var(--lime)}.th-mul.down{color:var(--coral)}.th-mul.flat{color:var(--muted)}";
    document.head.appendChild(s);
  }
  function mulClass(m) {
    if (!m || Math.abs(m - 1) < 0.02) return "flat";
    return m > 1 ? "up" : "down";
  }
  function paint(root, p, priors) {
    css();
    const feat = Object.assign({}, deriveFeat(p), p.theoryFeat || {});
    const full = project(p, feat, priors);
    const lede = root.querySelector(".lede");
    if (lede) lede.remove();
    const metrics = root.querySelector(".metrics");
    if (metrics) metrics.remove();
    const h1 = root.querySelector(".player-hero h1");
    if (h1 && p.name) h1.textContent = p.name;
    const kick = root.querySelector(".player-hero .kicker");
    if (kick) {
      const year = new URLSearchParams(location.search).get("year") || "";
      kick.textContent = year + " \u00b7 #" + p.rank + (p.team ? " \u00b7 " + p.team : "");
    }
    root.querySelectorAll(".pills .tag").forEach(function (t) {
      const v = t.textContent.replace(/\s+/g, " ").trim();
      if (/^Age/i.test(v) && feat.age != null) t.textContent = "Age " + feat.age;
      if ((/lbs/i.test(v) || v === "/ lbs") && (feat.ht || p.ht)) t.textContent = (feat.ht || p.ht) + ((feat.wt || p.wt) ? " / " + (feat.wt || p.wt) : "");
    });
    const old = root.querySelector(".th-player");
    if (old) old.remove();
    const rows = (full.steps || []).filter(function (s) {
      return s.id === "slot" || Math.abs((s.mAs || 1) - 1) >= 0.02 || Math.abs((s.mHof || s.mMvp || 1) - 1) >= 0.02;
    });
    if (!rows.length) return;
    const body = rows.map(function (s) {
      return "<tr><td>" + s.label + "</td><td>" + (s.value || "\u2014") + "</td>" +
        '<td class="th-mul ' + mulClass(s.mAs) + '">' + fmtMul(s.mAs) + "</td>" +
        '<td class="th-mul ' + mulClass(s.mHof || s.mMvp) + '">' + fmtMul(s.mHof || s.mMvp) + "</td></tr>";
    }).join("");
    const box = document.createElement("section");
    box.className = "section th-player th-math";
    box.innerHTML = '<div class="kicker">Draft-night factors</div>'
      + '<div class="table-wrap"><table><thead><tr><th>Theory</th><th>Draft night</th><th>\u00d7 AS</th><th>\u00d7 HOF</th></tr></thead><tbody>'
      + body + "</tbody></table></div>";
    const hero = root.querySelector(".player-hero");
    const pd = document.getElementById("pd-box");
    if (pd && pd.parentNode) pd.parentNode.insertBefore(box, pd.nextSibling);
    else if (hero && hero.parentNode) hero.parentNode.insertBefore(box, hero.nextSibling);
  }
  function load(year) {
    const dec = (Math.floor(Number(year) / 10) * 10) + "s";
    return Promise.all([
      fetch("./assets/slot-priors.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("./assets/theory-packs/" + year + ".json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("./assets/outcomes/" + dec + ".json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("./assets/outcomes-extra.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ]).then(function (parts) {
      const priors = parts[0] || {};
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
          if (f.age && !p.age) p.age = f.age;
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
          if (p) paint(root, p, (out && out.priors) || {});
        });
      });
    };
  }
})();
