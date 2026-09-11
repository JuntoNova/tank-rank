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
    const s = abs >= 10 ? String(Math.round(abs)) : abs.toFixed(1);
    return n < 0 ? "\u2212" + s : s;
  }
  function fmtSigned(n) {
    if (n == null || isNaN(n) || Math.abs(n) < 0.05) return "0";
    return (n > 0 ? "+" : "\u2212") + fmtExp(Math.abs(n)).replace(/^[\u2212\-]/, "");
  }
  function fmtPct(n) { return Math.round((n || 0) * 100) + "%"; }
  function fmtPp(dp) {
    const pts = (dp || 0) * 100;
    if (Math.abs(pts) < 0.5) return "0";
    return (pts > 0 ? "+" : "\u2212") + Math.abs(pts).toFixed(0);
  }
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
  function only(p, feat, priors, overrides) {
    return project(p, Object.assign({
      age: 21, ht: feat.ht, wt: feat.wt, cls: "So", origin: "college",
      tier: "other", stash: 0, delay: 0, never: 0, create: 0
    }, overrides), priors);
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
    s.textContent = ".vs{display:block;margin-top:6px;font-size:11px;color:var(--muted)}"
      + ".vs.up{color:var(--lime)}.vs.down{color:var(--coral)}.vs.even{color:var(--gold)}"
      + ".th-ledger{margin-top:8px}.th-ledger table{min-width:480px}"
      + ".th-ledger td,.th-ledger th{vertical-align:middle;font-variant-numeric:tabular-nums}"
      + ".th-ledger .pct{text-align:right}"
      + ".num-zero{color:var(--muted)}"
      + ".num-up{color:var(--lime)}.num-down{color:var(--coral)}";
    document.head.appendChild(s);
  }
  function numCell(v, kind) {
    const cls = kind === "up" ? "num-up" : kind === "down" ? "num-down" : "num-zero";
    return '<td class="pct ' + cls + '">' + v + "</td>";
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
  function rows(p, slot, priors) {
    const feat = p.theoryFeat || {};
    const htIn = inches(feat.ht);
    function delta(iso) {
      return {
        as: fmtSigned((iso.expAs || 0) - (slot.expAs || 0)),
        nba: fmtSigned((iso.expNba || 0) - (slot.expNba || 0)),
        rawPp: (iso.pAs || 0) - (slot.pAs || 0)
      };
    }
    function kind(pp) { return pp > 0.004 ? "up" : pp < -0.004 ? "down" : "zero"; }
    const age = delta(only(p, feat, priors, { age: feat.age }));
    const cls = delta(only(p, feat, priors, { cls: feat.cls, origin: "college" }));
    const handle = delta(only(p, feat, priors, { ht: feat.ht, create: feat.create }));
    const intl = delta(only(p, feat, priors, { origin: feat.origin }));
    const stash = delta(only(p, feat, priors, { origin: "intl", stash: feat.stash, delay: feat.delay, never: feat.never }));
    const wpi = feat.wt && htIn ? (feat.wt / htIn).toFixed(2) : "\u2014";
    return [
      ["Slot", "Pk " + String(p.rank).padStart(2, "0") + " \u00b7 " + slot.slot, fmtExp(slot.expAs), fmtExp(slot.expNba), "zero"],
      ["Age", feat.age != null ? String(feat.age) : "\u2014", age.as, age.nba, kind(age.rawPp)],
      ["Class", feat.cls || "\u2014", cls.as, cls.nba, kind(cls.rawPp)],
      ["School", p.school || "\u2014", "0", "0", "zero"],
      ["Origin", feat.origin || "\u2014", intl.as, intl.nba, kind(intl.rawPp)],
      ["Stash", feat.never ? "never" : (feat.delay >= 2 ? "+" + feat.delay + " yr" : feat.origin === "intl" ? "0 yr" : "\u2014"), stash.as, stash.nba, kind(stash.rawPp)],
      ["Height", feat.ht || "\u2014", "0", "0", "zero"],
      ["Weight", feat.wt != null ? String(feat.wt) : "\u2014", "0", "0", "zero"],
      ["Lb/in", wpi, "0", "0", "zero"],
      ["Create", feat.create ? "1" : "0", handle.as, handle.nba, kind(handle.rawPp)],
      ["Wingspan", p.wsp || "\u2014", "\u2014", "\u2014", "zero"],
      ["Reach", p.reach || "\u2014", "\u2014", "\u2014", "zero"],
      ["Combine", "\u2014", "\u2014", "\u2014", "zero"],
      ["Box", "\u2014", "\u2014", "\u2014", "zero"]
    ];
  }
  function paint(root, p, priors) {
    css();
    const slot = project(p, null, priors);
    const full = project(p, p.theoryFeat, priors);
    p.proj = full;
    const gotAs = Number(p.allStar) || 0;
    const gotNba = Number(p.allNba) || 0;
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
    if (metrics) {
      function card(label, got, exp) {
        const d = got - exp;
        const cls = Math.abs(d) < 0.25 ? "even" : d > 0 ? "up" : "down";
        return '<div class="metric"><label>' + label + "</label><b>" + got + '</b><div class="bar"><i style="width:'
          + Math.min(100, Math.round((got / Math.max(exp, 1)) * 100)) + '%"></i></div><div class="vs '
          + cls + '">' + fmtExp(exp) + "  " + fmtSigned(d) + "</div></div>";
      }
      metrics.innerHTML =
        card("AS", gotAs, full.expAs) +
        card("All-NBA", gotNba, full.expNba) +
        '<div class="metric"><label>P(AS)</label><b>' + fmtPct(full.pAs) + '</b><div class="bar"><i style="width:'
          + Math.round(full.pAs * 100) + '%"></i></div><div class="vs">' + fmtPct(slot.pAs) + " slot</div></div>" +
        '<div class="metric"><label>P(HOF)</label><b>' + fmtPct(full.pHof) + '</b><div class="bar"><i style="width:'
          + Math.round(full.pHof * 100) + '%"></i></div></div>';
    }
    fillSize(p);
    if (root.querySelector(".th-player")) return;
    const body = rows(p, slot, priors).map(function (r) {
      return "<tr><td>" + r[0] + "</td><td class=\"pct\">" + r[1] + "</td>"
        + numCell(r[2], r[4]) + numCell(r[3], r[4]) + "</tr>";
    }).join("");
    const box = document.createElement("section");
    box.className = "section th-player";
    box.innerHTML = '<div class="table-wrap th-ledger"><table><thead><tr>'
      + "<th></th><th>Value</th><th>\u0394 AS</th><th>\u0394 NBA</th>"
      + "</tr></thead><tbody>" + body + "</tbody></table></div>";
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
