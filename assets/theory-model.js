(function () {
  const COUNTRY = ["spain","france","italy","germany","greece","serbia","croatia","slovenia","lithuania","latvia","russia","ukraine","turkey","israel","australia","brazil","argentina","china","senegal","nigeria","cameroon","congo","mali","montenegro","bosnia","poland","czech","sweden","finland","belgium","netherlands","japan","korea","venezuela","mexico","cuba","haiti","jamaica","bahamas","sudan","egypt","ghana","angola","portugal","hungary","romania","bulgaria","georgia","new zealand","dominican","puerto rico","ivory coast"];
  const INTENSITY = {
    "1":     { as: 5.5, nba: 3.2, nba1: 0.90, yrs: 13.5, ch: 0.55, mvp: 0.25 },
    "2-3":   { as: 4.2, nba: 2.4, nba1: 0.65, yrs: 11.5, ch: 0.40, mvp: 0.06 },
    "4-5":   { as: 3.8, nba: 2.2, nba1: 0.45, yrs: 10.5, ch: 0.32, mvp: 0.03 },
    "6-10":  { as: 3.2, nba: 1.8, nba1: 0.28, yrs:  9.0, ch: 0.25, mvp: 0.015 },
    "11-14": { as: 2.8, nba: 1.6, nba1: 0.20, yrs:  8.0, ch: 0.20, mvp: 0.008 },
    "15-30": { as: 2.2, nba: 1.4, nba1: 0.12, yrs:  6.5, ch: 0.14, mvp: 0.003 },
    "31+":   { as: 1.8, nba: 1.3, nba1: 0.08, yrs:  3.5, ch: 0.06, mvp: 0.001 }
  };
  const AGE_AS  = { u19: 24.1 / 10.9, a19: 23.3 / 10.9, a20: 17.7 / 10.9, a21: 1, a22: 3.5 / 10.9 };
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
    const m = String(ht || "").match(/(\d+)\s*-\s*(\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) * 12 + Number(m[2]) : 0;
  }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function shrink(raw, keep) { return 1 + (raw - 1) * keep; }
  function keepAs(pk)  { return pk <= 5 ? 0.42 : pk <= 14 ? 0.50 : pk <= 30 ? 0.60 : 0.72; }
  // ~4,700 draftees in the file, ~111 NBA players in Springfield. HOF is ~2% of
  // people who played and far rarer among all picks. All-time slot rates (~2.4
  // expected per draft, 34% at #1) overstate that. Scale so a class is ~0.5
  // expected HOFers and no prospect prints as a near-lock.
  const PLAYER = { as: 2.8, nba: 1.35, nba1: 0.30, yrs: 8.5, ch: 0.18, mvp: 0.20 };
  const PLAYER_HOF = 0.010;
  const HOF_CAP = 0.28;
  function ageKey(age) {
    if (age == null || isNaN(age)) return "a21";
    if (age < 19.5) return "u19";
    if (age < 20.5) return "a19";
    if (age < 21.5) return "a20";
    if (age < 22.5) return "a21";
    return "a22";
  }
  function ageLabel(key) {
    return ({ u19: "under 19.5", a19: "19.5-20.5", a20: "20.5-21.5", a21: "21.5-22.5", a22: "22.5+" })[key] || key;
  }
  function deriveFeat(p) {
    const given = p.theoryFeat || {};
    const school = String(p.school || given.school || "");
    const low = school.toLowerCase();
    let cls = "";
    let origin = given.origin || p.origin || "";
    let tier = given.tier || "other";
    const cm = school.match(/\((RS-Fr|RS-So|RS-Jr|RS-Sr|Fr|So|Jr|Sr|HS[^)]*)\.?\)\s*$/i);
    if (cm) {
      const raw = cm[1].replace(/\./g, "");
      if (/^hs/i.test(raw)) { cls = "HS"; origin = origin || "hs"; tier = "hs"; }
      else cls = raw.replace(/^rs-/i, "RS-");
    }
    if (!cls) cls = given.cls || p.cls || "";
    if (!origin) {
      if (/\bhs\b|high school|academy/i.test(low)) { origin = "hs"; cls = cls || "HS"; tier = "hs"; }
      else if (COUNTRY.some(function (c) { return low.indexOf(c) >= 0; }) && !cm) {
        origin = "intl"; cls = cls || "Intl"; tier = "intl";
      } else origin = "college";
    }
    let age = given.age != null ? given.age : (p.draftAge != null ? p.draftAge : p.age);
    if (age === "" || age == null) {
      age = ({ HS: 18, Fr: 19, "RS-Fr": 19, So: 20, "RS-So": 20, Jr: 21, "RS-Jr": 21, Sr: 22, "RS-Sr": 23, Intl: 20 })[cls]
        || (origin === "intl" ? 20 : origin === "hs" ? 18 : 21);
    }
    age = Number(age);
    const ht = given.ht || p.htCombine || p.ht || p.htListed || "";
    const wt = given.wt != null ? given.wt : (p.wt != null ? p.wt : null);
    const wsp = given.wsp || p.wsp || "";
    const reach = given.reach || p.reach || "";
    const pos = String(p.pos || given.pos || "");
    const htIn = inches(ht);
    const guard = /(^|\b)(PG|SG|G)(\b|\/)/i.test(pos);
    const astN = given.ast != null ? Number(given.ast) : NaN;
    let create = 0;
    if (given.create != null && given.create !== "") create = Number(given.create) ? 1 : 0;
    else if (isFinite(astN)) {
      if (astN >= 2.5 && htIn >= 77) create = 1;
      else if (astN >= 2.0 && guard) create = 1;
    }
    return {
      age: isNaN(age) ? null : age, cls: cls || "", origin: origin || "", tier: tier,
      ht: ht, wt: wt, wsp: wsp, reach: reach, pos: pos,
      stash: given.stash || 0, delay: given.delay || 0, never: given.never || 0,
      create: create,
      pts: given.pts, ast: given.ast, stl: given.stl, blk: given.blk,
      fga: given.fga, fta: given.fta, fg3a: given.fg3a
    };
  }
  function glm() { return (window.TR && TR.GLM) || null; }
  function sigmoid(z) { return 1 / (1 + Math.exp(-clamp(z, -20, 20))); }
  function eraMed(y) {
    y = Number(y) || 0;
    if (y <= 1975) return 21.7;
    if (y <= 1988) return 21.4;
    if (y <= 2005) return 21.0;
    return 20.2;
  }
  function posGroup(pos) {
    pos = String(pos || "").toUpperCase();
    if (/C/.test(pos) && !/(PG|SG|SF|G)/.test(pos)) return "C";
    if (/(PG|SG|\bG\b)/.test(pos) && !/(PF|C)/.test(pos)) return "G";
    if (/(SF|PF|\bF\b)/.test(pos)) return "F";
    if (/C/.test(pos)) return "C";
    if (/G/.test(pos)) return "G";
    return "";
  }
  function glmX(feat, year) {
    const G = glm();
    const x = {};
    (G.features || []).forEach(function (k) { x[k] = 0; });
    var age = feat.age;
    if (age != null && !(age >= 17 && age <= 25.5)) age = null;
    var htIn = inches(feat.ht);
    if (htIn && (htIn < 68 || htIn > 94)) htIn = 0;
    var wt = feat.wt != null && feat.wt !== "" ? Number(feat.wt) : null;
    if (wt != null && !(wt >= 150 && wt <= 360)) wt = null;
    var pg = posGroup(feat.pos);
    var posHt = (G.pos_ht || { G: 75, F: 80, C: 83 })[pg];
    var wsp = inches(feat.wsp);
    var ape = (wsp && htIn) ? (wsp - htIn) : null;
    var stl = feat.stl != null && feat.stl !== "" ? Number(feat.stl) : null;
    var blk = feat.blk != null && feat.blk !== "" ? Number(feat.blk) : null;
    var pts = feat.pts != null && feat.pts !== "" ? Number(feat.pts) : null;
    var ast = feat.ast != null && feat.ast !== "" ? Number(feat.ast) : null;
    var rel = (age != null) ? (age - eraMed(year)) : null;
    var dHt = (htIn && posHt) ? (htIn - posHt) : null;
    var raw = {
      rel_age: rel, ht_in: htIn || null, wt: wt, d_ht: dHt, ape: ape,
      pts: pts, ast: ast, stl: stl, blk: blk
    };
    (G.continuous || []).forEach(function (k) {
      var v = raw[k];
      if (v == null || (k === "ht_in" && !htIn)) { x[k] = 0; return; }
      if (G.winsor && G.winsor[k]) {
        v = Math.max(G.winsor[k][0], Math.min(G.winsor[k][1], v));
      }
      var sd = (G.sds && G.sds[k]) || 1;
      x[k] = (v - G.means[k]) / sd;
    });
    if (!htIn) x.ht_in = 0;
    x.origin_hs = feat.origin === "hs" ? 1 : 0;
    x.origin_intl = feat.origin === "intl" ? 1 : 0;
    x.create_tall = (feat.create && htIn >= 79) ? 1 : 0;
    if (x.pos_g !== undefined) x.pos_g = 0;
    if (x.pos_c !== undefined) x.pos_c = 0;
    if (x.swing !== undefined) x.swing = 0;
    (G.missing || []).forEach(function (k) { x[k] = 0; });
    return { x: x, raw: raw, pg: pg, htIn: htIn, age: age };
  }
  function linpred(spec, x) {
    if (!spec || spec.kind === "constant") return Math.log(spec && spec.mu ? spec.mu : 1);
    var s = Number(spec.intercept) || 0;
    var coef = spec.coef || {};
    Object.keys(coef).forEach(function (k) { s += coef[k] * (x[k] || 0); });
    return s;
  }
  function logit(p) {
    p = clamp(p, 1e-6, 1 - 1e-6);
    return Math.log(p / (1 - p));
  }
  function platt(p, spec) {
    if (!spec) return p;
    var sl = spec.slope == null ? 1 : Number(spec.slope);
    var ic = Number(spec.intercept) || 0;
    return sigmoid(ic + sl * logit(p));
  }
  function hurdle(key, x, P) {
    const G = glm();
    P = P || G;
    var ever = (P && P[key + "_ever"]) || (G && G[key + "_ever"]);
    var p = sigmoid(linpred(ever, x));
    p = platt(p, G && G.platt && G.platt[key]);
    var pos = (P && P[key + "_pos"]) || (G && G[key + "_pos"]) || { kind: "constant", mu: 1 };
    var lo = G && G.lam_min != null ? G.lam_min : 1;
    var hi = G && G.lam_max != null ? G.lam_max : 8;
    var lam;
    if (pos.kind === "constant") lam = pos.mu;
    else lam = clamp(Math.exp(linpred(pos, x)), lo, hi);
    return { p: p, lam: lam, exp: p * lam };
  }
  function xSkip(x, keys) {
    var y = {};
    Object.keys(x || {}).forEach(function (k) { y[k] = x[k]; });
    (keys || []).forEach(function (k) { y[k] = 0; });
    return y;
  }
  function scoreX(x, P) {
    const G = glm();
    if (!G && !P) {
      return { expAs: 0.4, expNba: 0.2, expNba1: 0.05, expYrs: 7, expCh: 0.08, expMvp: 0.02, pHof: 0.03, pAs: 0.11, pNba: 0.06 };
    }
    var as = hurdle("as", x, P);
    var nba = hurdle("nba", x, P);
    var mvp = hurdle("mvp", x, P);
    var ch = hurdle("ch", x, P);
    var yrsSpec = (P && P.yrs) || (G && G.yrs);
    var yrs = clamp(linpred(yrsSpec, x) + ((G && G.yrs_shift) || 0), 1.5, 19);
    var skip = (G && G.hof_skip) || ["stl", "blk"];
    var asHof = skip.length ? hurdle("as", xSkip(x, skip), P) : as;
    var pHof;
    var spec = (G && G.hof_from_as) || {};
    if (spec.kind === "mixture") {
      var yes = spec.p_given_as != null ? spec.p_given_as : 0.34;
      var no = spec.p_given_no != null ? spec.p_given_no : 0.004;
      pHof = no + (yes - no) * asHof.p;
    } else if (spec.intercept != null) {
      pHof = sigmoid(spec.intercept + spec.slope * logit(asHof.p));
    } else {
      pHof = 0.004 + 0.34 * asHof.p;
    }
    pHof = clamp(pHof, G && G.hof_floor != null ? G.hof_floor : 0.003, G && G.hof_cap != null ? G.hof_cap : 0.28);
    var expAs = clamp(as.exp, 0.02, 14);
    var expNba = clamp(Math.min(nba.exp, expAs), 0.01, 12);
    var expMvp;
    var mv = (G && G.mvp_from_as) || {};
    if (mv.kind === "mixture") {
      var my = mv.mu_given_as != null ? mv.mu_given_as : 0.155;
      var mn = mv.mu_given_no != null ? mv.mu_given_no : 0;
      expMvp = clamp(mn + (my - mn) * as.p, 0.002, 2.5);
    } else {
      expMvp = clamp(Math.min(mvp.exp, expAs), 0.002, 2.5);
    }
    return {
      pAs: as.p, expAs: expAs,
      pNba: nba.p, expNba: expNba, expNba1: clamp(expNba * 0.22, 0.005, 6),
      expYrs: yrs, expCh: clamp(ch.exp, 0.01, 4), expMvp: expMvp,
      pHof: pHof
    };
  }
  function quantile(arr, q) {
    var a = arr.slice().sort(function (x, y) { return x - y; });
    if (!a.length) return null;
    var i = Math.min(a.length - 1, Math.max(0, Math.floor(q * (a.length - 1))));
    return a[i];
  }
  function bandX(x) {
    const G = glm();
    var boots = (G && G.boot) || [];
    if (boots.length < 10) return null;
    var qs = (G.boot_q && G.boot_q.length === 2) ? G.boot_q : [0.1, 0.9];
    var acc = { expAs: [], expNba: [], expNba1: [], expYrs: [], expCh: [], expMvp: [], pHof: [], pAs: [] };
    for (var i = 0; i < boots.length; i++) {
      var s = scoreX(x, boots[i]);
      acc.expAs.push(s.expAs);
      acc.expNba.push(s.expNba);
      acc.expNba1.push(s.expNba1);
      acc.expYrs.push(s.expYrs);
      acc.expCh.push(s.expCh);
      acc.expMvp.push(s.expMvp);
      acc.pHof.push(s.pHof);
      acc.pAs.push(s.pAs);
    }
    var out = {};
    Object.keys(acc).forEach(function (k) {
      out[k] = { lo: quantile(acc[k], qs[0]), hi: quantile(acc[k], qs[1]) };
    });
    return out;
  }
  function project(p, feat, priors) {
    feat = feat || deriveFeat(p);
    const year = Number(p.year || p.y || feat.year) || 0;
    const G = glm();
    const built = glmX(feat, year);
    const xFull = built.x;
    const raw = built.raw;
    const HREF = {
      age: "./age.html", intl: "./intl.html", size: "./size.html", posht: "./size.html",
      swing: "./size.html", handle: "./handle.html", wingspan: "./wingspan.html",
      prod: "./prod.html", defense: "./defense.html", astu: "./astu.html", rim: "./rim.html"
    };
    const groups = [
      { id: "age", label: "Age", keys: ["rel_age"],
        value: built.age != null ? (feat.age + " " + ageLabel(ageKey(feat.age))) : "unknown" },
      { id: "intl", label: "Origin", keys: ["origin_hs", "origin_intl"],
        value: feat.origin === "hs" ? "high school" : feat.origin === "intl" ? "international" : "college" },
      { id: "size", label: "Height", keys: ["ht_in"],
        value: feat.ht || "missing" },
      { id: "weight", label: "Weight", keys: ["wt"],
        value: feat.wt != null ? (feat.wt + " lbs") : "missing" },
      { id: "posht", label: "Size at position", keys: ["d_ht"],
        value: (feat.ht || "") + (feat.pos ? " / " + feat.pos : "") },
      { id: "handle", label: "Handle x size", keys: ["create_tall"],
        value: xFull.create_tall ? ((feat.ht || "6-7+") + " creator") : (feat.ht || "missing") },
      { id: "prod", label: "College scoring", keys: ["pts"],
        value: raw.pts != null ? (raw.pts + " pts") : "no box score" },
      { id: "astu", label: "Passing", keys: ["ast"],
        value: raw.ast != null ? (raw.ast + " ast") : "no box score" },
      { id: "defense", label: "Steals", keys: ["stl"],
        value: raw.stl != null ? (raw.stl + " stl") : "no box score" },
      { id: "rim", label: "Shot blocking", keys: ["blk"],
        value: raw.blk != null ? (raw.blk + " blk") : "no box score" },
      { id: "wingspan", label: "Wingspan", keys: ["ape"],
        value: feat.wsp || "missing" }
    ];
    const x = {};
    (G && G.features || []).forEach(function (k) { x[k] = 0; });
    var prev = scoreX(x);
    const steps = [];
    groups.forEach(function (g) {
      g.keys.forEach(function (k) { x[k] = xFull[k] || 0; });
      var cur = scoreX(x);
      var dLog = 0;
      if (G && G.as_ever) {
        g.keys.forEach(function (k) { dLog += (G.as_ever.coef[k] || 0) * (xFull[k] || 0); });
      }
      var mAs = Math.exp(dLog);
      var dNba = 0, dMvp = 0, dHof = 0, dYrs = 0;
      if (G) {
        g.keys.forEach(function (k) {
          if (G.nba_ever) dNba += (G.nba_ever.coef[k] || 0) * (xFull[k] || 0);
          if (G.mvp_ever) dMvp += (G.mvp_ever.coef[k] || 0) * (xFull[k] || 0);
          if (G.hof) dHof += (G.hof.coef[k] || 0) * (xFull[k] || 0);
          if (G.yrs) dYrs += (G.yrs.coef[k] || 0) * (xFull[k] || 0);
        });
      }
      steps.push({
        id: g.id, label: g.label, value: g.value,
        mAs: mAs, mNba: Math.exp(dNba), mHof: Math.exp(dHof), mMvp: Math.exp(dMvp),
        mYrs: Math.exp(dYrs / 8),
        why: "", href: HREF[g.id] || "",
        snap: cur, prev: prev
      });
      prev = cur;
    });
    const full = scoreX(xFull);
    const band = bandX(xFull);
    var mAs = 1, mNba = 1, mHof = 1, mMvp = 1, mYrs = 1;
    steps.forEach(function (s) {
      mAs *= s.mAs; mNba *= s.mNba; mHof *= s.mHof; mMvp *= s.mMvp; mYrs *= s.mYrs;
    });
    return {
      slot: "player", slotAs: 1, slotNba: 1, slotHof: full.pHof, slotMvp: full.expMvp,
      pAs: full.pAs, pNba: full.pNba, pHof: full.pHof,
      expAs: full.expAs, expNba: full.expNba, expNba1: full.expNba1,
      expYrs: full.expYrs, expCh: full.expCh, expMvp: full.expMvp,
      band: band,
      mAs: mAs, mNba: mNba, mHof: mHof, mMvp: mMvp, mYrs: mYrs,
      scale: mAs, steps: steps, feat: feat
    };
  }
  function fmtExp(n) {
    if (n == null || isNaN(n)) return "";
    if (Math.abs(n) < 0.005) return "0";
    const abs = Math.abs(n);
    const body = abs >= 10 ? String(Math.round(abs)) : abs >= 1 ? abs.toFixed(1) : abs.toFixed(2);
    return (n < 0 ? "-" : "") + body;
  }
  function fmtPct(n) { return (n == null || !isFinite(Number(n))) ? "" : Math.round(n * 100) + "%"; }
  function fmtMul(m) { return "x" + Number(m == null ? 1 : m).toFixed(2); }
  function fmtBand(lo, hi, pct) {
    if (lo == null || hi == null || !isFinite(Number(lo)) || !isFinite(Number(hi))) return "";
    if (pct) {
      var a = Math.round(Number(lo) * 100), b = Math.round(Number(hi) * 100);
      if (a === b) return "";
      return a + "\u2013" + b + "%";
    }
    var a = fmtExp(lo), b = fmtExp(hi);
    if (!a || !b || a === b) return "";
    return a + "\u2013" + b;
  }
  function bandHtml(lo, hi, pct) {
    var t = fmtBand(lo, hi, pct);
    return t ? '<span class="band">' + t + "</span>" : "";
  }
  // Remaining Hall odds from the career so far. Draft-night pHof is a different
  // number (slot × theories, capped at 10%). This one is: given the resume and
  // whether they are still playing, will Springfield take them?
  //   already in → 100%
  //   retired ~20+ years and not in → 0%
  //   LeBron-tier (MVP + huge All-NBA) → 100% even before induction
  //   no NBA season yet (2026 class) → null, caller uses draft-night pHof
  function careerHofP(p, draftYear, nowYear) {
    if (!p) return null;
    if (Number(p.hof)) return 1;
    const yrs = Number(p.yrs) || 0;
    const g = Number(p.g) || 0;
    const y = Number(draftYear) || 0;
    const now = Number(nowYear) || 2027;
    const last = y + Math.max(yrs, 0);
    const retiredFor = now - last;
    if (yrs === 0 && g === 0 && y >= now - 1) return null;
    if (retiredFor >= 20) return 0;
    if (yrs === 0 && g === 0) return 0;
    const as = Number(p.allStar != null ? p.allStar : p.as) || 0;
    const nba = Number(p.allNba != null ? p.allNba : p.nba) || 0;
    const nba1 = Number(p.nba1) || 0;
    const mvp = Number(p.mvp) || 0;
    const ch = Number(p.champs != null ? p.champs : p.ch) || 0;
    const pts = Number(p.pts) || 0;
    const ws = Number(p.ws) || 0;
    const vorp = Number(p.vorp) || 0;
    const totpts = pts * g;
    let s = mvp * 4.2 + nba1 * 0.55 + nba * 0.50 + as * 0.22 + ch * 0.28
      + Math.max(0, ws) * 0.010 + totpts / 14000 + Math.max(0, vorp) * 0.008;
    const draftAge = Number(p.age != null && p.age !== "" ? p.age : p.draftAge) || 20;
    const ageNow = draftAge + (now - y);
    if (retiredFor <= 1) {
      const runway = clamp(33 - ageNow, 0, 12);
      const denom = Math.max(yrs, 1);
      let extra = (as / denom * 0.22 + nba / denom * 0.50 + mvp / denom * 4.2) * runway * 0.45;
      if (ageNow <= 27 && nba >= 1) extra += 1.6;
      if (ageNow <= 26 && mvp >= 1) extra += 2.5;
      if (ageNow <= 25 && as >= 1 && nba === 0) extra += 0.7;
      s += extra;
    }
    let pr = 1 / (1 + Math.exp(-(s - 4.0)));
    if (mvp >= 1 && (as >= 6 || nba >= 5)) pr = Math.max(pr, 0.97);
    if (mvp >= 2) pr = Math.max(pr, 0.995);
    if (as >= 12 || nba >= 10) pr = Math.max(pr, 0.97);
    if (as >= 15 || (mvp >= 1 && as >= 8)) pr = Math.max(pr, 0.995);
    if (mvp >= 3 || (mvp >= 1 && nba >= 10) || as >= 18) pr = 1;
    if (retiredFor >= 8 && retiredFor < 20) pr *= Math.max(0, 1 - (retiredFor - 8) / 12);
    return clamp(pr, 0, 1);
  }
  function fmtHofRemain(n) {
    if (n == null || !isFinite(Number(n))) return "";
    const p = Number(n);
    if (p <= 0) return "0%";
    if (p >= 0.995) return "100%";
    const pct = Math.round(p * 100);
    return pct === 0 ? "<1%" : pct + "%";
  }
  function fetchTheoryPack(year) {
    year = Number(year);
    function get(url) {
      return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    }
    return Promise.all([
      get("./assets/theory-packs/all.json?v=81").then(function (all) {
        return (all && all[String(year)]) || null;
      }),
      get("./assets/theory-packs/" + year + ".json?v=92")
    ]).then(function (parts) {
      var thin = parts[0], rich = parts[1];
      if (!thin) return rich;
      if (!rich) return thin;
      var by = {};
      (thin.players || []).forEach(function (f) {
        if (f && f.pk != null) by[f.pk] = Object.assign({}, f);
      });
      (rich.players || []).forEach(function (f) {
        if (!f || f.pk == null) return;
        by[f.pk] = Object.assign({}, by[f.pk] || {}, f);
      });
      var pks = Object.keys(by).map(Number).sort(function (a, b) { return a - b; });
      return Object.assign({}, thin, rich, { players: pks.map(function (k) { return by[k]; }) });
    });
  }
  window.TR = window.TR || {};
  TR.Model = { slotBucket: slotBucket, inches: inches, deriveFeat: deriveFeat, project: project, INTENSITY: INTENSITY, PLAYER: PLAYER, HOF_CAP: HOF_CAP, fmtExp: fmtExp, fmtPct: fmtPct, fmtMul: fmtMul, fmtBand: fmtBand, bandHtml: bandHtml, careerHofP: careerHofP, fmtHofRemain: fmtHofRemain };
  TR.deriveFeat = deriveFeat;
  TR.projectPlayer = project;
  TR.bandX = bandX;
  TR.careerHofP = careerHofP;
  TR.fetchTheoryPack = fetchTheoryPack;
})();
