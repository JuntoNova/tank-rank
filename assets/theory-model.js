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
    const astN = given.ast != null ? Number(given.ast) : (p.ast != null ? Number(p.ast) : NaN);
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
  function project(p, feat, priors) {
    feat = feat || deriveFeat(p);
    const pk = Number(p.rank) || 99;
    const inten = PLAYER;
    let mAs = 1, mNba = 1, mHof = 1, mMvp = 1, mYrs = 1;
    const steps = [];
    function add(id, label, value, mas, mmvp, why, extra) {
      extra = extra || {};
      const a = mas == null ? 1 : mas;
      const v = mmvp == null ? a : mmvp;
      const nba = extra.nba == null ? a : extra.nba;
      const hof = extra.hof == null ? a : extra.hof;
      const yrs = extra.yrs == null ? 1 : extra.yrs;
      mAs *= a; mNba *= nba; mHof *= hof; mMvp *= v; mYrs *= yrs;
      steps.push({ id: id, label: label, value: value, mAs: a, mNba: nba, mHof: hof, mMvp: v, mYrs: yrs, why: why, href: extra.href || HREF[id] || "" });
    }
    const HREF = {
      slot: "./methodology.html",
      age: "./age.html",
      onedone: "./onedone.html",
      intl: "./intl.html",
      stash: "./stash.html",
      size: "./size.html",
      posht: "./size.html",
      swing: "./size.html",
      handle: "./handle.html",
      wingspan: "./wingspan.html",
      reach: "./reach.html",
      prod: "./prod.html",
      ftrate: "./ftrate.html",
      defense: "./defense.html",
      astu: "./astu.html",
      rim: "./rim.html",
      three: "./three.html"
    };
    const year = Number(p.year || p.y || feat.year) || 0;
    const ak = ageKey(feat.age);
    const rawAs = AGE_AS[ak];
    const ageNum = feat.age == null ? 21.5 : feat.age;
    function eraMed(y) {
      y = Number(y) || 0;
      if (y <= 1975) return 21.7;
      if (y <= 1988) return 21.4;
      if (y <= 2005) return 21.0;
      return 20.2;
    }
    var rel = year ? (ageNum - eraMed(year)) : (ageNum - 20.2);
    let ageAsRaw;
    if (rel <= -2.2) ageAsRaw = 1.75;
    else if (rel <= -1.5) ageAsRaw = 1.55;
    else if (rel <= -1.0) ageAsRaw = 1.28;
    else if (rel <= -0.5) ageAsRaw = 1.18;
    else if (rel <= 0.2) ageAsRaw = 1.10;
    else if (rel <= 0.7) ageAsRaw = 1.02;
    else if (rel <= 1.2) ageAsRaw = 0.94;
    else if (rel <= 1.8) ageAsRaw = 0.88;
    else if (rel <= 2.5) ageAsRaw = 0.80;
    else ageAsRaw = 0.68;
    const ageAs = clamp(ageAsRaw, 0.68, 2.10);
    let ageMvpRaw;
    if (rel <= -2.2) ageMvpRaw = 1.50;
    else if (rel <= -1.5) ageMvpRaw = 1.40;
    else if (rel <= -0.7) ageMvpRaw = 1.22;
    else if (rel <= 0.2) ageMvpRaw = 1.08;
    else if (rel <= 1.0) ageMvpRaw = 1.00;
    else ageMvpRaw = 0.70;
    const ageMvp = clamp(ageMvpRaw, 0.30, 2.20);
    let ageYrs = 1;
    if (ageNum < 19) ageYrs = 1.28;
    else if (ageNum < 20) ageYrs = 1.18;
    else if (ageNum < 21) ageYrs = 1.08;
    else if (ageNum < 22) ageYrs = 0.96;
    else ageYrs = 0.80;
    add("age", "Age", feat.age != null ? feat.age + " " + ageLabel(ak) : "unknown",
      ageAs, ageMvp, "From /age. Youth moves All-Star odds more than Hall of Fame.",
      { nba: ageAs, hof: clamp(ageAsRaw, 0.85, 1.25), yrs: clamp(ageYrs, 0.70, 1.25) });
    const cls = feat.cls || "";
    if (feat.origin === "college") {
      let cAs = 1, cMvp = 1, note = "Sophomore / junior is the middle of /onedone.";
      if (cls === "Fr" || cls === "RS-Fr") {
        if (ageNum >= 21) { cAs = 0.88; cMvp = 0.80; note = "Old freshman."; }
        else { cAs = 1; cMvp = 1; note = "Freshman. Age already moved this."; }
      } else if (cls === "Sr" || cls === "RS-Sr") {
        if (year && year <= 2005) { cAs = 1; cMvp = 1; note = "Senior. Normal for the era."; }
        else if (ak === "a21" || ak === "a22") { cAs = 1; cMvp = 1; note = "Senior. Age already moved this."; }
        else { cAs = 0.88; cMvp = 0.70; note = "Young senior."; }
      } else if (cls === "Jr" || cls === "RS-Jr") {
        if (year && year <= 2005) { cAs = 1; cMvp = 1; note = "Junior. Normal for the era."; }
        else { cAs = 0.96; cMvp = 0.90; note = "Junior."; }
      }
      add("onedone", "Class year", cls || "-", cAs, cMvp, note, { yrs: 1, hof: 1 });
    } else {
      if (feat.origin === "intl" && ageNum < 19.5 && !feat.stash && !(feat.delay >= 1)) {
        add("onedone", "Class year", "young pro", 1, 1, "", { yrs: 1, hof: 1 });
      } else {
        add("onedone", "Class year", cls || feat.origin || "-", 1, 1, "No extra class-year market.", { yrs: 1, hof: 1 });
      }
    }
    if (feat.origin === "intl") {
      var youngNow = ageNum <= 19.5 && !feat.stash && !(feat.delay >= 1) && !feat.never;
      add("intl", "Origin", youngNow ? "young pro" : "international", youngNow ? 1 : 0.88, youngNow ? 1 : 0.92, "", { hof: youngNow ? 1 : 1.02, yrs: youngNow ? 1 : 0.94, nba: youngNow ? 1 : 0.88 });
      if (feat.never) add("stash", "Stash", "never arrived", 0.05, 0.05, "Never arrived.", { yrs: 0.10 });
      else if (feat.stash || (feat.delay || 0) >= 2) add("stash", "Stash", "delayed", 0.59, 0.50, "Stash.", { yrs: 0.55 });
      else add("stash", "Stash", "immediate", 1, 1, "Immediate.", { yrs: 0.94 });
    } else if (feat.origin === "hs") {
      add("intl", "Origin", "high school", 1.10, 1.15, "", { nba: 1.08, hof: 1.08 });
      add("stash", "Stash", "-", 1, 1, "Stash is international only.");
    } else {
      add("intl", "Origin", "college", 1, 1, "College.");
      add("stash", "Stash", "-", 1, 1, "Stash is international only.");
    }
    const SIZE_BINS = [
      { lo: 0, hi: 73, label: "under 6-1", as: 1.09, nba: 1.08, hof: 1.25, mvp: 0.81,
        why: "From /size. Under 6-1 is a small AS/HOF bump (n=132). Not a star prior." },
      { lo: 73, hi: 79, label: "6-1 to 6-6", as: 0.99, nba: 1.04, hof: 0.97, mvp: 0.74,
        why: "From /size. Middle of the listed-height sample; near the base rate." },
      { lo: 79, hi: 84, label: "6-7 to 6-11", as: 1.00, nba: 0.92, hof: 0.93, mvp: 1.05,
        why: "From /size. The common wing/big bin. Slightly below the HOF base." },
      { lo: 84, hi: 87, label: "7-0 to 7-2", as: 1.08, nba: 1.05, hof: 1.11, mvp: 1.22,
        why: "From /size. 7-0 to 7-2 is +1.0 HOF pp and the MVP cell (3.65% vs 1.17% base, n=192)." },
      { lo: 87, hi: 120, label: "7-3 and up", as: 1.15, nba: 1.15, hof: 1.20, mvp: 1.25,
        why: "From /size. 7-3+ is a tiny sample. Seven-footers get more MVPs; 7-4 is not a downgrade from 7-1." }
    ];
    const htIn = inches(feat.ht);
    let sizeRow = null;
    if (htIn) {
      for (let i = 0; i < SIZE_BINS.length; i++) {
        if (htIn >= SIZE_BINS[i].lo && htIn < SIZE_BINS[i].hi) { sizeRow = SIZE_BINS[i]; break; }
      }
    }
    if (!sizeRow) {
      add("size", "Height", feat.ht ? String(feat.ht) : "missing", 1, 1,
        "No listed or combine height, so /size does not move this pick.", { hof: 1, nba: 1, yrs: 1 });
    } else {
      add("size", "Height", (feat.ht || "") + " · " + sizeRow.label, sizeRow.as, sizeRow.mvp, sizeRow.why,
        { nba: sizeRow.nba, hof: sizeRow.hof, yrs: 1 });
    }
    var wtFound = (window.TR && TR.Size && TR.Size.lookup)
      ? TR.Size.lookup({ ht: feat.ht, wt: feat.wt })
      : { weight: null, wt: feat.wt };
    if (wtFound && wtFound.weight) {
      var w = wtFound.weight;
      var wAs = w.mAs, wMvp = w.mMvp, wNba = w.mNba, wHof = w.mHof;
      var guard = /(^|\b)(PG|SG|G)(\b|\/)/i.test(feat.pos || "");
      if (htIn >= 84 && feat.wt != null && Number(feat.wt) >= 225 && wAs < 1) wAs = 1;
      if (guard && htIn && htIn < 81 && wAs < 1) { wAs = 1; wNba = Math.max(wNba, 1); }
      if (guard && htIn && htIn < 81 && wMvp < 1) wMvp = 1;
      if (wMvp > 1) wMvp = 1 + (wMvp - 1) * 0.30;
      add("weight", "Weight", (wtFound.wt != null ? wtFound.wt : feat.wt) + " lbs · " + w.label,
        wAs, wMvp, "", { nba: wNba < 1 && (htIn >= 84 || (guard && htIn < 81)) ? 1 : wNba, hof: wHof, yrs: 1 });
    } else {
      add("weight", "Weight", (feat.wt != null && feat.wt !== "") ? (feat.wt + " lbs") : "missing",
        1, 1, "", { hof: 1, nba: 1, yrs: 1 });
    }
    var madeCreate = feat.create && (feat.ast != null || feat.pts != null);
    var astN = feat.ast != null ? Number(feat.ast) : null;
    var passCreate = astN != null && astN >= 5;
    var realCreate = astN != null && astN >= 3.5;
    if (madeCreate && htIn >= 79) {
      var hAs = passCreate ? 1.10 : realCreate ? 1.22 : 1.08;
      var hMvp = passCreate ? 1.06 : realCreate ? 1.08 : 1.04;
      add("handle", "Handle x size", (feat.ht || "6-7+") + (passCreate ? " passer" : realCreate ? " creator" : " creation tag"),
        hAs, hMvp, "", { hof: passCreate ? 1 : realCreate ? 1.04 : 1 });
    } else if (madeCreate) {
      var gAs = passCreate ? 1.06 : realCreate ? 1.14 : 1.08;
      add("handle", "Handle x size", (feat.ht || "guard") + (passCreate ? " passer" : " creation tag"),
        gAs, passCreate ? 1.08 : 1.10, "", { hof: 1 });
    } else if (htIn && htIn < 77 && /(PG|SG|G)/i.test(feat.pos || "")) {
      add("handle", "Handle x size", (feat.ht || "short") + " guard", 1.08, 1.20, "", { hof: 1 });
    } else if (/(C|PF)/i.test(feat.pos || "") && !feat.create) {
      add("handle", "Handle x size", feat.ht || "big", 1, 0.68, "", { hof: 1 });
    } else {
      add("handle", "Handle x size", feat.ht ? feat.ht : "missing", 1, 1, "", { hof: 1 });
    }
    const wspIn = inches(feat.wsp);
    const ape = (wspIn && htIn) ? (wspIn - htIn) : null;
    if (ape == null) add("wingspan", "Wingspan", "missing", 1, 1, "No wingspan.", { hof: 1 });
    else if (htIn >= 82 && ape >= 6) add("wingspan", "Wingspan", feat.wsp + " long 6-10+", 1.12, 1.06, "/wingspan 6-10+ long.", { hof: 1 });
    else if (ape >= 6) add("wingspan", "Wingspan", feat.wsp + " +6 ape", 1.10, 1.05, "+6 ape.", { hof: 1 });
    else if (ape < 2 && htIn >= 79 && htIn < 84) add("wingspan", "Wingspan", feat.wsp + " short for size", 0.90, 0.85, "Short arms at 6-7 to 6-11.", { hof: 1 });
    else add("wingspan", "Wingspan", feat.wsp || "mid", 1, 1, "Mid-pack length.", { hof: 1 });
    const reachIn = inches(feat.reach);
    if (!reachIn) add("reach", "Standing reach", "missing", 1, 1, "/reach needs a number.", { hof: 1 });
    else if (htIn >= 82) add("reach", "Standing reach", feat.reach + " 6-10+", 1.06, 1.00, "Lean true only at 6-10+.", { hof: 1 });
    else add("reach", "Standing reach", feat.reach, 1, 1, "False as a general rule.", { hof: 1 });
    var prim = "";
    var pU = String(feat.pos || "").toUpperCase();
    if (/PG/.test(pU)) prim = "PG";
    else if (/SG/.test(pU)) prim = "SG";
    else if (/SF/.test(pU)) prim = "SF";
    else if (/PF/.test(pU)) prim = "PF";
    else if (/\bC\b/.test(pU) || pU === "C" || /^C/.test(pU)) prim = "C";
    else if (/\bG\b/.test(pU) || pU[0] === "G") prim = "G";
    else if (/\bF\b/.test(pU) || pU[0] === "F") prim = "F";
    var POS_MED = { PG: 74, SG: 77, SF: 80, PF: 81, C: 82, G: 75, F: 79 };
    var POS_WT = { PG: 185, SG: 205, SF: 220, PF: 240, C: 250, G: 195, F: 225 };
    var dPos = (prim && htIn && POS_MED[prim]) ? Math.round(htIn - POS_MED[prim]) : null;
    var dWt = (prim && feat.wt != null && feat.wt !== "" && POS_WT[prim]) ? Math.round(Number(feat.wt) - POS_WT[prim]) : null;
    if (prim && (dPos != null || dWt != null)) {
      var phAs = 1, phNba = 1, phHof = 1, phMvp = 1;
      var bits = [];
      if (dPos != null) bits.push((dPos >= 0 ? "+" : "") + dPos + " in vs " + prim);
      if (dWt != null) bits.push((dWt >= 0 ? "+" : "") + dWt + " lbs vs " + prim);
      if (dPos != null && dPos >= 3) { phAs = 1.10; phNba = 1.12; phHof = 1.14; phMvp = 1.25; }
      else if (dPos != null && dPos >= 1) { phAs = 1.04; phNba = 1.05; phHof = 1.00; phMvp = 1.05; }
      else if (dPos != null && dPos <= -3) { phAs = 1.00; phNba = 0.96; phHof = 1.05; phMvp = 0.85; }
      else if (dPos != null && dPos <= -1) { phAs = 0.97; phNba = 0.96; phHof = 0.96; phMvp = 0.95; }
      if (dWt != null && dWt >= 20 && (dPos == null || dPos >= 0)) {
        phAs = +(phAs * 1.06).toFixed(3);
        phNba = +(phNba * 1.05).toFixed(3);
        phMvp = +(phMvp * 1.08).toFixed(3);
      } else if (dWt != null && dWt <= -25 && (dPos == null || dPos <= 0)) {
        phAs = +(phAs * 0.96).toFixed(3);
        phNba = +(phNba * 0.96).toFixed(3);
        phMvp = +(phMvp * 0.94).toFixed(3);
      }
      add("posht", "Size at position", (feat.ht || "") + (feat.wt != null ? " / " + feat.wt : "") + " · " + bits.join(", "),
        phAs, phMvp, "", { nba: phNba, hof: phHof });
    } else {
      add("posht", "Size at position", feat.ht ? String(feat.ht) : "missing", 1, 1, "", { nba: 1, hof: 1 });
    }
    var listedSwing = /[\/]/.test(feat.pos || "") || /(G.+F|F.+G|F.+C|C.+F|SF.+PF|PF.+SF|PG.+SG|SG.+PG)/i.test(feat.pos || "");
    if (listedSwing) {
      add("swing", "Swing", (feat.pos || "") + " two spots", 1.10, 1.12, "", { nba: 1.10, hof: 1.08 });
    } else if (htIn && (htIn < 73 || htIn >= 84)) {
      add("swing", "Swing", (feat.ht || "") + " locked to one spot", 1, 1, "", { nba: 1, hof: htIn >= 84 ? 1.10 : 1.08 });
    } else {
      add("swing", "Swing", feat.pos ? (feat.pos + " one spot") : "one spot", 1, 1, "", { nba: 1, hof: 1 });
    }
    function num(x) {
      if (x == null || x === "") return null;
      var n = Number(x);
      return isFinite(n) ? n : null;
    }
    var pts = num(feat.pts);
    var ast = num(feat.ast);
    var stl = num(feat.stl);
    var blk = num(feat.blk);
    var fga = num(feat.fga);
    var fta = num(feat.fta);
    var fg3a = num(feat.fg3a);
    if (pts != null) {
      var pAsP = pts >= 28 ? 1.40 : pts >= 24 ? 1.28 : pts >= 18 ? 1.18 : pts >= 16 ? 1.12 : pts >= 10 ? 1.00 : 0.86;
      var pMvp = pts >= 28 ? 1.32 : pts >= 24 ? 1.22 : pts >= 18 ? 1.12 : pts >= 16 ? 1.08 : pts >= 10 ? 1.00 : 0.42;
      if (htIn >= 84 && pts >= 22) { pAsP = Math.max(pAsP, 1.35); pMvp = Math.max(pMvp, 1.25); }
      add("prod", "College scoring", pts + " pts", pAsP, pMvp, "", { nba: pAsP, hof: 1 });
    }
    if (fga && fga > 0 && fta != null) {
      var ftr = fta / fga;
      var fAs = ftr >= 0.40 ? 1.22 : ftr >= 0.25 ? 1.06 : 0.88;
      if (ast != null && ast >= 5 && fAs < 1) fAs = 1;
      add("ftrate", "Free-throw rate", ftr.toFixed(2) + " FTA/FGA", fAs, fAs, "", { nba: fAs, hof: 1 });
    }
    var isBig = /(C|PF)/i.test(feat.pos || "") && !/(PG|SG|SF)/i.test(feat.pos || "");
    if (stl != null || blk != null) {
      var stocks = (stl || 0) + (blk || 0);
      var rimWill = blk != null && isBig;
      if (!(rimWill && stl == null)) {
        var stockN = rimWill ? stl : stocks;
        var sAs;
        if (rimWill) sAs = stockN >= 1.2 ? 1.08 : stockN > 0 ? 1.00 : 0.88;
        else sAs = stockN >= 3.5 ? 1.12 : stockN >= 2.2 ? 1.10 : stockN >= 1.2 ? 1.06 : stockN > 0 ? 1.00 : 0.88;
        add("defense", "Steals and blocks", stocks.toFixed(1) + " stocks", sAs, sAs, "", { nba: sAs, hof: 1 });
      }
    }
    if (ast != null) {
      var aAs = ast >= 7 ? 1.32 : ast >= 5 ? 1.22 : ast >= 3.5 ? 1.14 : ast >= 2.0 ? 1.04 : 1;
      add("astu", "Passing", ast + " ast", aAs, aAs, "", { nba: aAs, hof: 1 });
    }
    if (blk != null && isBig) {
      var rAs = blk >= 3.0 ? 1.22 : blk >= 1.5 ? 1.16 : blk >= 0.8 ? 1.06 : 0.92;
      add("rim", "Shot blocking", blk + " blk", rAs, rAs, "", { nba: rAs, hof: 1 });
    }
    if (fga && fga > 0 && fg3a != null) {
      var vol = fg3a / fga;
      var tAs = vol >= 0.40 ? 1.02 : 1;
      add("three", "Three-point volume", vol.toFixed(2) + " 3PA/FGA", tAs, 1, "", { nba: tAs, hof: 1 });
    }
    mAs = clamp(mAs, 0.18, 5.00); mNba = clamp(mNba, 0.18, 5.00);
    mHof = clamp(mHof, 0.35, 2.40); mMvp = clamp(mMvp, 0.12, 5.00); mYrs = clamp(mYrs, 0.45, 1.50);
    const pAs = clamp(0.22 * mAs, 0.01, 0.97);
    const pNba = clamp(0.12 * mNba, 0.005, 0.90);
    const pHof = clamp(PLAYER_HOF * mAs * mAs * mHof, 0.002, HOF_CAP);
    return {
      slot: "player", slotAs: 1, slotNba: 1, slotHof: PLAYER_HOF, slotMvp: inten.mvp,
      pAs: pAs, pNba: pNba, pHof: pHof,
      expAs: clamp(0.50 * mAs * mAs, 0.02, 12),
      expNba: clamp(0.20 * mNba * mNba, 0.01, 12),
      expNba1: clamp(0.028 * mNba * mNba * mNba, 0.005, 6),
      expYrs: clamp(4.5 * mYrs + 2.8 * mAs, 1.5, 19),
      expCh: clamp(0.033 * mAs * mAs, 0.01, 2.50),
      expMvp: clamp(0.014 * mMvp * mMvp, 0.002, 1.20), mAs: mAs, mNba: mNba, mHof: mHof, mMvp: mMvp, mYrs: mYrs,
      scale: mAs, steps: steps, feat: feat
    };
  }
  function fmtExp(n) {
    if (n == null || isNaN(n)) return "";
    if (Math.abs(n) < 0.05) return "0";
    if (Math.abs(n) < 0.1) return n < 0 ? "-<0.1" : "<0.1";
    const abs = Math.abs(n);
    return (n < 0 ? "-" : "") + (abs >= 100 ? String(Math.round(abs)) : abs.toFixed(1));
  }
  function fmtPct(n) { return (n == null || !isFinite(Number(n))) ? "" : Math.round(n * 100) + "%"; }
  function fmtMul(m) { return "x" + Number(m == null ? 1 : m).toFixed(2); }
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
  window.TR = window.TR || {};
  TR.Model = { slotBucket: slotBucket, inches: inches, deriveFeat: deriveFeat, project: project, INTENSITY: INTENSITY, PLAYER: PLAYER, HOF_CAP: HOF_CAP, fmtExp: fmtExp, fmtPct: fmtPct, fmtMul: fmtMul, careerHofP: careerHofP, fmtHofRemain: fmtHofRemain };
  TR.deriveFeat = deriveFeat;
  TR.projectPlayer = project;
  TR.careerHofP = careerHofP;
})();
