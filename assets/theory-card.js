(function () {
  const HREF = {
    age: "./age.html", onedone: "./onedone.html", schools: "./schools.html",
    intl: "./intl.html", stash: "./stash.html", size: "./size.html",
    handle: "./handle.html", wingspan: "./wingspan.html", reach: "./reach.html",
    combine: "./combine.html", prod: "./prod.html"
  };
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
    if (n < 0.1) return "<0.1";
    return n >= 10 ? String(Math.round(n)) : n.toFixed(1);
  }
  function fmtPct(n) { return Math.round((n || 0) * 100) + "%"; }
  function project(p, feat, priors) {
    const key = slotBucket(p.rank);
    const slot = (priors || {})[key] || {};
    let pAs = slot.pAs || 0, pNba = slot.pNba || 0, pHof = slot.pHof || 0;
    const factors = [];
    const pk = Number(p.rank) || 99;
    function mul(k, m) {
      if (!m || m === 1) return;
      pAs *= m; pNba *= m; pHof *= m; factors.push({ key: k, m: m });
    }
    if (feat) {
      if (feat.age != null && feat.age <= 19) mul("age", pk <= 5 ? 1.10 : 1.25);
      else if (feat.age != null && feat.age >= 23) mul("age", 0.70);
      if (feat.origin === "college") {
        if ((feat.cls === "Fr" || feat.cls === "RS-Fr") && !(feat.age <= 19)) mul("onedone", 1.15);
        if (feat.cls === "Sr" && !(feat.age >= 23)) mul("onedone", 0.85);
      }
      if (feat.origin === "intl") {
        if (pk <= 5) mul("intl", 0.69);
        else if (pk <= 14) mul("intl", 0.59);
        if (feat.never) mul("stash", 0.05);
        else if (feat.stash || (feat.delay || 0) >= 2) mul("stash", 0.59);
      }
      if (feat.create && inches(feat.ht) >= 79) mul("handle", 1.35);
    }
    pAs = clamp(pAs, 0.002, 0.92);
    pNba = clamp(pNba, 0.001, 0.80);
    pHof = clamp(pHof, 0.0005, 0.55);
    const inten = INTENSITY[key] || INTENSITY["31+"];
    return { slot: key, pAs: pAs, pNba: pNba, pHof: pHof, expAs: pAs * inten.as, expNba: pNba * inten.nba, factors: factors };
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
  function css() {
    if (document.getElementById("th-card-css")) return;
    const s = document.createElement("style");
    s.id = "th-card-css";
    s.textContent = ".vs{display:inline-block;margin-top:6px;font-size:11px;color:var(--muted)}"
      + ".vs.up{color:var(--lime)}.vs.down{color:var(--coral)}.vs.even{color:var(--gold)}"
      + ".th-ledger{margin-top:16px}.th-ledger table{min-width:720px}"
      + ".th-ledger td,.th-ledger th{vertical-align:top}.th-ledger td{font-size:13px}"
      + ".th-series{color:var(--muted);white-space:normal;max-width:34ch;line-height:1.45}"
      + ".th-pill{display:inline-block;padding:4px 8px;border-radius:999px;font-family:var(--mono);font-size:10px;letter-spacing:.04em;border:1px solid var(--line);color:var(--muted);background:var(--bg-3);white-space:normal;line-height:1.35}"
      + ".th-pill.th-up{color:#111;background:var(--lime);border-color:var(--lime)}"
      + ".th-pill.th-down{color:#fff;background:var(--coral);border-color:var(--coral)}"
      + ".th-pill.th-fade{color:#111;background:var(--gold);border-color:var(--gold)}"
      + ".th-pill.th-flat,.th-pill.th-base{color:var(--text)}"
      + ".th-pill.th-na{color:var(--muted);background:transparent}";
    document.head.appendChild(s);
  }
  function fillSize(p) {
    const box = document.getElementById("size-box");
    if (!box) return;
    box.querySelectorAll(".size-grid div").forEach(function (d) {
      const lab = d.querySelector("label");
      const b = d.querySelector("b");
      if (!lab || !b) return;
      const k = lab.textContent.toLowerCase();
      if (k === "height" && p.ht) b.textContent = p.ht;
      if (k === "weight" && p.wt) b.textContent = p.wt + " lbs";
      if (k === "lbs / inch" && p.wt && inches(p.ht)) b.textContent = (p.wt / inches(p.ht)).toFixed(2);
      if (k === "source" && (p.ht || p.wt)) b.textContent = p.wsp ? "Combine" : "Listed";
    });
  }
  function ledger(p, slot, full) {
    const feat = p.theoryFeat || {};
    const by = {};
    (full.factors || []).forEach(function (f) { by[f.key] = f; });
    const htIn = inches(feat.ht);
    const size = [feat.ht || "\u2014", feat.wt ? feat.wt + " lbs" : ""].filter(Boolean).join(" / ");
    const wpi = feat.wt && htIn ? (feat.wt / htIn).toFixed(2) + " lb/in" : "";
    return [
      { id: null, name: "Draft slot", stat: "Pick " + String(p.rank).padStart(2, "0") + " \u00b7 band " + slot.slot, series: "Historical rate for that slot. Everything else is an adjustment on top.", effect: "base " + fmtPct(slot.pAs) + " \u00b7 " + fmtExp(slot.expAs) + " AS", kind: "base" },
      { id: "age", name: "Age", stat: feat.age != null ? feat.age + " on draft night" : "\u2014", series: "Lean true. Under 19.5 is 24.1% All-Star vs 3.5% at 22.5+.", effect: by.age ? "moved the projection" : "no bump \u2014 outside the young / old bins", kind: by.age ? (by.age.m > 1 ? "up" : "down") : "flat" },
      { id: "onedone", name: "Class year", stat: feat.cls || "\u2014", series: "Lean true. Freshmen 18.9% All-Star vs seniors 5.9%.", effect: by.onedone ? "moved the projection" : (feat.origin === "college" ? "no bump \u2014 sophomore / junior is the middle" : "n/a"), kind: by.onedone ? (by.onedone.m > 1 ? "up" : "down") : "flat" },
      { id: "schools", name: "School", stat: [p.school, feat.tier === "blue" ? "blue blood" : feat.tier].filter(Boolean).join(" \u00b7 "), series: "False once you condition on pick.", effect: "0 pp \u2014 theory scored false given slot", kind: "fade" },
      { id: "intl", name: "Origin", stat: feat.origin || "\u2014", series: "Lean true at the top. Flat later.", effect: by.intl ? "moved the projection" : "college \u2014 no intl adjustment", kind: by.intl ? "down" : "flat" },
      { id: "stash", name: "Stash / arrival", stat: feat.never ? "never arrived" : (feat.delay >= 2 ? "+" + feat.delay + " years out" : feat.origin === "intl" ? "immediate" : "n/a"), series: "Lean true on never-arriving risk.", effect: by.stash ? "moved the projection" : "no bump", kind: by.stash ? "down" : "flat" },
      { id: "size", name: "Listed size", stat: [size, wpi].filter(Boolean).join(" \u00b7 "), series: "Listed size is on the card. Combine scale does not exist for 1999, so weight does not move this projection yet.", effect: "listed only \u2014 no slot-adjusted bump", kind: "na" },
      { id: "handle", name: "Handle \u00d7 size", stat: feat.create && htIn >= 79 ? feat.ht + " with pre-draft creation" : (htIn >= 79 ? feat.ht + " \u00b7 no creation tag" : (feat.ht || "\u2014") + " \u00b7 below the 6-7 cut"), series: "Lean true. 6-7+ with creation is 30% All-Star vs 10.9% without.", effect: by.handle ? "moved the projection" : "no bump", kind: by.handle ? "up" : "flat" },
      { id: "wingspan", name: "Wingspan", stat: "\u2014", series: "Lean true on career honors. Defense untested.", effect: "missing \u2014 combine packs start 2000", kind: "na" },
      { id: "reach", name: "Standing reach", stat: "\u2014", series: "False as a general rule. Lean true only at 6-10+.", effect: "missing \u2014 no vertical series on this class", kind: "na" },
      { id: "combine", name: "Combine tests", stat: "\u2014", series: "Clock and bench lean noise. Max vertical scored false.", effect: "missing \u2014 1999 is before the combine packs", kind: "na" },
      { id: "prod", name: "College box", stat: "\u2014", series: "Production false. FT rate lean true. Creation lean true.", effect: "missing \u2014 college join starts 2002", kind: "na" }
    ];
  }
  function paint(root, p, priors) {
    css();
    const slot = project(p, null, priors);
    const full = project(p, p.theoryFeat, priors);
    p.proj = full;
    const gotAs = Number(p.allStar) || 0;
    const gotNba = Number(p.allNba) || 0;
    const asWord = gotAs + 0.25 < full.expAs ? "under" : gotAs > full.expAs + 0.25 ? "over" : "on";
    root.querySelectorAll(".pills .tag").forEach(function (t) {
      const v = t.textContent.trim();
      if (v === "Age" && p.draftAge != null) t.textContent = "Age " + p.draftAge;
      if ((v === "/ lbs" || v === "/ Lbs" || v === "lbs") && p.draftHt) {
        t.textContent = p.draftHt + (p.draftWt ? " / " + p.draftWt + " lbs" : "");
      }
    });
    const lede = root.querySelector(".lede");
    if (lede) {
      lede.textContent = "The projection said " + asWord + " the career. "
        + fmtExp(full.expAs) + " expected All-Stars, " + gotAs + " actual. "
        + fmtExp(full.expNba) + " expected All-NBA, " + gotNba + " actual.";
    }
    const metrics = root.querySelector(".metrics");
    if (metrics) {
      function card(label, got, exp) {
        const cls = got + 0.25 < exp ? "down" : got > exp + 0.25 ? "up" : "even";
        return '<div class="metric"><label>' + label + "</label><b>" + got + '</b><div class="bar"><i style="width:'
          + Math.min(100, Math.round((got / Math.max(exp, 1)) * 100)) + '%"></i></div><div class="vs '
          + cls + '">proj ' + fmtExp(exp) + "</div></div>";
      }
      metrics.innerHTML =
        card("All-Star", gotAs, full.expAs) +
        card("All-NBA", gotNba, full.expNba) +
        '<div class="metric"><label>P(AS) drafted</label><b>' + fmtPct(full.pAs) + '</b><div class="bar"><i style="width:'
          + Math.round(full.pAs * 100) + '%"></i></div><div class="vs">slot ' + fmtPct(slot.pAs) + "</div></div>" +
        '<div class="metric"><label>P(HOF) drafted</label><b>' + fmtPct(full.pHof) + '</b><div class="bar"><i style="width:'
          + Math.round(full.pHof * 100) + '%"></i></div></div>';
    }
    fillSize(p);
    if (root.querySelector(".th-player")) return;
    const rows = ledger(p, slot, full).map(function (r) {
      const name = r.id ? '<a href="' + HREF[r.id] + '">' + r.name + "</a>" : r.name;
      return "<tr><td>" + name + "</td><td>" + r.stat + '</td><td class="th-series">' + r.series
        + '</td><td><span class="th-pill th-' + r.kind + '">' + r.effect + "</span></td></tr>";
    }).join("");
    const box = document.createElement("section");
    box.className = "section th-player";
    box.innerHTML = '<div class="kicker">Factor by factor</div>'
      + '<h2 style="font-size:28px;margin:8px 0 14px">What the stats implied</h2>'
      + '<p class="theory-note">Each row is a scored theory and the number this player had on draft night. Missing series stay empty and do not invent a bump.</p>'
      + '<div class="table-wrap th-ledger"><table><thead><tr><th>Theory</th><th>His number</th><th>Series</th><th>Implied vs slot</th></tr></thead><tbody>'
      + rows + "</tbody></table></div>";
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
