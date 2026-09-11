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
    return { slot: key, pAs: pAs, pNba: pNba, pHof: pHof, expAs: pAs * inten.as, expNba: pNba * inten.nba };
  }
  function attach(p, feat) {
    if (!p || !feat) return;
    p.theoryFeat = feat;
    p.draftAge = feat.age; p.draftHt = feat.ht; p.draftWt = feat.wt;
    p.cls = feat.cls; p.origin = feat.origin; p.tier = feat.tier;
    if (feat.ht) { if (!p.ht) p.ht = feat.ht; p.htListed = p.htListed || feat.ht; }
    if (feat.wt) { if (!p.wt) p.wt = feat.wt; p.wtListed = p.wtListed || feat.wt; }
    if (feat.age != null && (p.age === "" || p.age == null)) p.age = feat.age;
  }
  function fillSize(p) {
    const box = document.getElementById("size-box");
    if (!box) return;
    box.querySelectorAll(".size-grid div").forEach(function (d) {
      const lab = d.querySelector("label");
      const b = d.querySelector("b");
      if (!lab || !b) return;
      const k = lab.textContent.toLowerCase();
      if (k === "source") { d.style.display = "none"; return; }
      if (k === "height" && p.ht) b.textContent = p.ht;
      if (k === "weight" && p.wt) b.textContent = p.wt + " lbs";
      if (k === "lbs / inch" && p.wt && inches(p.ht)) b.textContent = (p.wt / inches(p.ht)).toFixed(2);
    });
  }
  function rows(p) {
    const feat = p.theoryFeat || {};
    const htIn = inches(feat.ht);
    const wpi = feat.wt && htIn ? (feat.wt / htIn).toFixed(2) : "\u2014";
    return [
      ["Slot", "Pk " + String(p.rank).padStart(2, "0")],
      ["Age", feat.age != null ? String(feat.age) : "\u2014"],
      ["Class", feat.cls || "\u2014"],
      ["School", p.school || "\u2014"],
      ["Origin", feat.origin || "\u2014"],
      ["Stash", feat.never ? "never" : (feat.delay >= 2 ? "+" + feat.delay + " yr" : feat.origin === "intl" ? "0 yr" : "\u2014")],
      ["Height", feat.ht || "\u2014"],
      ["Weight", feat.wt != null ? String(feat.wt) : "\u2014"],
      ["Lb/in", wpi],
      ["Create", feat.create ? "1" : "0"],
      ["Wingspan", p.wsp || "\u2014"],
      ["Reach", p.reach || "\u2014"],
      ["Combine", "\u2014"],
      ["Box", "\u2014"]
    ];
  }
  function paint(root, p, priors) {
    const full = project(p, p.theoryFeat, priors);
    p.proj = full;
    root.querySelectorAll(".pills .tag").forEach(function (t) {
      const v = t.textContent.replace(/\s+/g, " ").trim();
      if (v === "Age" && p.draftAge != null) t.textContent = "Age " + p.draftAge;
      if ((/^\/?\s*lbs$/i.test(v) || v === "/ lbs") && p.draftHt) {
        t.textContent = p.draftHt + (p.draftWt ? " / " + p.draftWt : "");
      }
    });
    const lede = root.querySelector(".lede");
    if (lede) lede.remove();
    const metrics = root.querySelector(".metrics");
    if (metrics) metrics.remove();
    fillSize(p);
    if (root.querySelector(".th-player")) return;
    const body = rows(p).map(function (r) {
      return "<tr><td>" + r[0] + "</td><td class=\"pct\">" + r[1] + "</td></tr>";
    }).join("");
    const box = document.createElement("section");
    box.className = "section th-player";
    box.innerHTML = '<div class="table-wrap th-ledger"><table><thead><tr>'
      + "<th></th><th>Value</th></tr></thead><tbody>" + body + "</tbody></table></div>";
    const hero = root.querySelector(".player-hero");
    if (hero && hero.parentNode) hero.parentNode.insertBefore(box, hero.nextSibling);
  }
  function load(year) {
    return Promise.all([
      fetch("./assets/theory-packs/" + year + ".json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("./assets/slot-priors.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ]).then(function (pair) {
      const pack = pair[0], priors = pair[1] || (window.TANK_RANK && TANK_RANK.slotPriors) || {};
      if (priors && window.TANK_RANK) TANK_RANK.slotPriors = priors;
      if (!pack || !window.TANK_RANK) return { pack: null, priors: priors };
      const draft = TANK_RANK.drafts[year];
      if (!draft) return { pack: pack, priors: priors };
      const byPk = {};
      (pack.players || []).forEach(function (f) { byPk[f.pk] = f; });
      (draft.players || []).forEach(function (p) { attach(p, byPk[p.rank]); });
      return { pack: pack, priors: priors, draft: draft };
    });
  }
  const orig = window.TR && TR.renderPlayer;
  if (typeof orig === "function") {
    TR.renderPlayer = function (root) {
      const y = Number(new URLSearchParams(location.search).get("year")) || (window.TANK_RANK && TANK_RANK.currentYear);
      const id = new URLSearchParams(location.search).get("id");
      return Promise.resolve(orig(root)).then(function () {
        return load(y).then(function (out) {
          if (!out || !out.draft) return;
          const p = (out.draft.players || []).find(function (x) { return x.id === id; }) || out.draft.players[0];
          if (p && p.theoryFeat) paint(root, p, out.priors);
        });
      });
    };
  }
})();
