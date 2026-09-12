(function () {
  // Single draft-night engine. Slot is the starting rate, never the final
  // number. Every scored theory that can fire on this player multiplies
  // All-Star, All-NBA, HOF, years, and MVP separately so two #1s with
  // different ages / origins / measurements do not print the same card.
  const COUNTRY = ["spain","france","italy","germany","greece","serbia","croatia","slovenia","lithuania","latvia","russia","ukraine","turkey","israel","australia","brazil","argentina","china","senegal","nigeria","cameroon","congo","mali","montenegro","bosnia","poland","czech","sweden","finland","belgium","netherlands","japan","korea","venezuela","mexico","cuba","haiti","jamaica","bahamas","sudan","egypt","ghana","angola","portugal","hungary","romania","bulgaria","georgia","new zealand","dominican","puerto rico","ivory coast"];

  const INTENSITY = {
    "1":     { as: 5.5, nba: 3.2, nba1: 0.90, yrs: 13.5, ch: 0.55, mvp: 0.12 },
    "2-3":   { as: 4.2, nba: 2.4, nba1: 0.65, yrs: 11.5, ch: 0.40, mvp: 0.06 },
    "4-5":   { as: 3.8, nba: 2.2, nba1: 0.45, yrs: 10.5, ch: 0.32, mvp: 0.03 },
    "6-10":  { as: 3.2, nba: 1.8, nba1: 0.28, yrs:  9.0, ch: 0.25, mvp: 0.015 },
    "11-14": { as: 2.8, nba: 1.6, nba1: 0.20, yrs:  8.0, ch: 0.20, mvp: 0.008 },
    "15-30": { as: 2.2, nba: 1.4, nba1: 0.12, yrs:  6.5, ch: 0.14, mvp: 0.003 },
    "31+":   { as: 1.8, nba: 1.3, nba1: 0.08, yrs:  3.5, ch: 0.06, mvp: 0.001 }
  };

  const AGE_AS  = { u19: 24.1 / 10.9, a19: 23.3 / 10.9, a20: 17.7 / 10.9, a21: 1, a22: 3.5 / 10.9 };
  const AGE_MVP = { u19: 4.14 / 0.53, a19: 3.70 / 0.53, a20: 1.27 / 0.53, a21: 1, a22: 0.20 };

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
  function keepMvp(pk) { return pk <= 5 ? 0.62 : pk <= 14 ? 0.70 : 0.80; }
  function ageKey(age) {
    if (age == null || isNaN(age)) return "a21";
    if (age < 19.5) return "u19";
    if (age < 20.5) return "a19";
    if (age < 21.5) return "a20";
    if (age < 22.5) return "a21";
    return "a22";
  }
  function ageLabel(key) {
    return ({ u19: "under 19.5", a19: "19.5–20.5", a20: "20.5–21.5", a21: "21.5–22.5", a22: "22.5+" })[key] || key;
  }

  function deriveFeat(p) {
    const given = p.theoryFeat || {};
    const school = String(p.school || given.school || "");
    const low = school.toLowerCase();
    let cls = given.cls || p.cls || "";
    let origin = given.origin || p.origin || "";
    let tier = given.tier || "other";
    const cm = school.match(/\((RS-Fr|RS-So|RS-Jr|RS-Sr|Fr|So|Jr|Sr|HS[^)]*)\.?\)\s*$/i);
    if (cm && !cls) {
      const raw = cm[1].replace(/\./g, "");
      if (/^hs/i.test(raw)) { cls = "HS"; origin = origin || "hs"; tier = "hs"; }
      else cls = raw.replace(/^rs-/i, "RS-");
    }
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
    const wing = /(^|\b)(SF|F)(\b|\/)/i.test(pos);
    const create = !!(given.create) || (htIn >= 79 && (guard || wing));
    return {
      age: isNaN(age) ? null : age,
      cls: cls || "",
      origin: origin || "",
      tier: tier,
      ht: ht,
      wt: wt,
      wsp: wsp,
      reach: reach,
      pos: pos,
      stash: given.stash || 0,
      delay: given.delay || 0,
      never: given.never || 0,
      create: create ? 1 : 0
    };
  }

  function project(p, feat, priors) {
    feat = feat || deriveFeat(p);
    const pk = Number(p.rank) || 99;
    const key = slotBucket(pk);
    const slot = (priors || {})[key] || {};
    const inten = INTENSITY[key] || INTENSITY["31+"];
    let mAs = 1, mNba = 1, mHof = 1, mMvp = 1, mYrs = 1;
    const steps = [];

    function add(id, label, value, mas, mmvp, why, extra) {
      extra = extra || {};
      const a = mas == null ? 1 : mas;
      const v = mmvp == null ? a : mmvp;
      const nba = extra.nba == null ? a : extra.nba;
      const hof = extra.hof == null ? a : extra.hof;
      const yrs = extra.yrs == null ? a : extra.yrs;
      mAs *= a; mNba *= nba; mHof *= hof; mMvp *= v; mYrs *= yrs;
      steps.push({
        id: id, label: label, value: value,
        mAs: a, mNba: nba, mHof: hof, mMvp: v, mYrs: yrs,
        why: why
      });
    }

    add("slot", "Draft slot", "Pk " + String(pk).padStart(2, "0") + " · band " + key, 1, 1,
      "Historical rate for this pick. Every row below multiplies this. The pick is the base, not the answer.");

    const ak = ageKey(feat.age);
    const rawAs = AGE_AS[ak];
    const ageAs = clamp(shrink(rawAs, keepAs(pk)), 0.55, 1.45);
    const ageNum = feat.age == null ? 21.5 : feat.age;
    let ageMvpRaw;
    if (ageNum <= 18) ageMvpRaw = 2.10;
    else if (ageNum <= 19) ageMvpRaw = 1.85;
    else if (ageNum <= 20) ageMvpRaw = 1.45;
    else if (ageNum <= 21) ageMvpRaw = 1.10;
    else if (ageNum <= 22) ageMvpRaw = 0.75;
    else ageMvpRaw = 0.40;
    const ageMvp = clamp(1 + (ageMvpRaw - 1) * (pk <= 5 ? 0.85 : pk <= 14 ? 0.95 : 1), 0.30, 2.20);
    add("age", "Age",
      feat.age != null ? feat.age + " · " + ageLabel(ak) : "unknown · treated as 21.5–22.5",
      ageAs, ageMvp,
      "From /age. Under-19.5 is 24.1% All-Star vs 3.5% at 22.5+. Youth still moves a #1 off the all-era 34% HOF prior.",
      { nba: ageAs, hof: clamp(shrink(rawAs, keepAs(pk) * 0.85), 0.72, 1.45), yrs: clamp(shrink(rawAs, 0.25), 0.80, 1.20) });

    const cls = feat.cls || "";
    if (feat.origin === "college") {
      let cAs = 1, cMvp = 1, note = "Sophomore / junior is the middle of /onedone.";
      if (cls === "Fr" || cls === "RS-Fr") {
        if (ak === "u19" || ak === "a19") { cAs = 1.04; cMvp = 1.10; note = "Freshman, already in the young-age bin. Small residual from /onedone (18.9% AS vs 5.9% senior)."; }
        else { cAs = 1.12; cMvp = 1.25; note = "Freshman outside the youngest bins. /onedone lean true."; }
      } else if (cls === "Sr" || cls === "RS-Sr") {
        if (ak === "a22") { cAs = 1; cMvp = 1; note = "Senior bump already counted in the 22.5+ age bin."; }
        else { cAs = 0.88; cMvp = 0.70; note = "Senior, not yet in the old-age bin. /onedone lean true; late bloomers scored false."; }
      } else if (cls === "Jr" || cls === "RS-Jr") {
        cAs = 0.96; cMvp = 0.90; note = "Junior sits between sophomore (11.9% AS) and senior (5.9%).";
      }
      add("onedone", "Class year", cls || "—", cAs, cMvp, note);
    } else if (feat.origin === "hs") {
      add("onedone", "Class year", "HS", 1, 1, "High school is the youth effect, not a second class-year market.");
    } else {
      add("onedone", "Class year", cls || feat.origin || "—", 1, 1, "No college class year.");
    }

    if (feat.origin === "intl") {
      let iAs = 1, iMvp = 1, iNote;
      if (pk <= 5) {
        iAs = 0.69; iMvp = 0.45;
        iNote = "Picks 1–5: international 33% All-Star vs college 48%. MVP in that cell is 0.0% vs 6.0% college.";
      } else if (pk <= 14) {
        iAs = 0.59; iMvp = 0.80;
        iNote = "Picks 6–14: international 10.5% All-Star vs college 17.9%.";
      } else {
        iAs = 1; iMvp = 1;
        iNote = "From pick 15 the college and international All-Star rates converge.";
      }
      add("intl", "Origin", "international · pick " + pk, iAs, iMvp, iNote, { hof: pk <= 5 ? 1.05 : 1 });
      if (feat.never) add("stash", "Stash", "never arrived", 0.05, 0.05, "Never appearing in the NBA file is 0.0% All-Star.");
      else if (feat.stash || (feat.delay || 0) >= 2) add("stash", "Stash", "+" + (feat.delay || 2) + " yr out", 0.59, 0.50, "Two-plus years out: 6.4% All-Star vs 10.8% immediate.");
      else add("stash", "Stash", "immediate", 1, 1, "Arrived without a multi-year stash.");
    } else if (feat.origin === "hs") {
      const hsAs = pk <= 14 ? 0.95 : 1.15;
      const hsMvp = pk <= 5 ? 1.55 : pk <= 14 ? 1.35 : 1.10;
      add("intl", "Origin", "high school · pick " + pk, hsAs, hsMvp,
        "HS itself is a tiny selected sample on /intl. Youth already moved age. MVP bump is the 1–5 HS cell (28.6% vs 6.0% college), n = 7.");
      add("stash", "Stash", "—", 1, 1, "Stash only applies to international picks.");
    } else {
      add("intl", "Origin", "college", 1, 1, "College — no international market adjustment.");
      add("stash", "Stash", "—", 1, 1, "Stash only applies to international picks.");
    }

    const htIn = inches(feat.ht);
    if (feat.create && htIn >= 79) {
      add("handle", "Handle × size", (feat.ht || "6-7+") + " · " + (feat.pos || "wing/guard") + " creation tag",
        1.22, 1.05,
        "6-7+ with creation is 30% All-Star vs 10.9% without on /handle. Tagged from position + listed/combine height, not the 2002–15 assist join. Multiplier is muted because the tag is a proxy.");
    } else if (htIn && htIn < 77 && /(^|\b)(PG|SG|G)(\b|\/)/i.test(feat.pos || "")) {
      add("handle", "Handle × size", (feat.ht || "under 6-5") + " · guard",
        1.08, 1.20,
        "Under 6-5 with creation is 23.9% All-Star on /handle. No college assist number, so this is the short-guard cell at half weight.");
    } else {
      add("handle", "Handle × size",
        feat.ht ? feat.ht + (feat.create ? " · below 6-7 cut" : " · no creation tag") : "no listed/combine height",
        1, 1,
        "Needs 6-7+ and a creation tag (PG/SG/SF), or a short guard. Missing height stays flat.");
    }

    const wspIn = inches(feat.wsp);
    const ape = (wspIn && htIn) ? (wspIn - htIn) : null;
    if (ape == null) {
      add("wingspan", "Wingspan", feat.ht ? (feat.ht + " · no wingspan") : "missing",
        1, 1, "Combine packs start 2000. /wingspan scored lean true on honors; nothing to multiply until we have a wingspan.");
    } else if (htIn >= 82 && ape >= 6) {
      add("wingspan", "Wingspan", feat.wsp + " · +" + ape.toFixed(1) + " in ape · 6-10+",
        1.28, 1.00,
        "6-10 to 7-1 with +6 ape is 28% All-Star vs 7.3% short-armed in the same height band on /wingspan.");
    } else if (ape >= 6) {
      add("wingspan", "Wingspan", feat.wsp + " · +" + ape.toFixed(1) + " in ape",
        1.10, 1.05,
        "+6 ape is 14.9% All-Star vs 8.6–10.4% for shorter arms. Not slot-controlled, so the bump is capped.");
    } else if (ape < 4 && htIn >= 79) {
      add("wingspan", "Wingspan", feat.wsp + " · +" + ape.toFixed(1) + " in ape · short for size",
        0.90, 0.85,
        "Under +4 ape at 6-7+ trails the long-armed cell on /wingspan.");
    } else {
      add("wingspan", "Wingspan", feat.wsp + " · +" + ape.toFixed(1) + " in ape",
        1, 1, "Mid-pack length. No scored bump.");
    }

    const reachIn = inches(feat.reach);
    if (!reachIn) {
      add("reach", "Standing reach", "missing", 1, 1, "/reach scored false as a general rule. Lean true only at 6-10+. No number, no bump.");
    } else if (htIn >= 82) {
      add("reach", "Standing reach", feat.reach + " · 6-10+", 1.06, 1.00,
        "/reach lean true only at 6-10+. Small bump; the page is not a general standing-reach rule.");
    } else {
      add("reach", "Standing reach", feat.reach, 1, 1, "/reach scored false as a general rule outside 6-10+.");
    }

    mAs  = clamp(mAs,  0.20, 2.20);
    mNba = clamp(mNba, 0.20, 2.20);
    mHof = clamp(mHof, 0.20, 1.80);
    mMvp = clamp(mMvp, 0.15, 3.20);
    mYrs = clamp(mYrs, 0.55, 1.35);

    const slotAs  = slot.pAs  || 0;
    const slotNba = slot.pNba || 0;
    const slotHof = slot.pHof || 0;
    const pAs  = clamp(slotAs  * mAs,  0.002, 0.92);
    const pNba = clamp(slotNba * mNba, 0.001, 0.80);
    const pHof = clamp(slotHof * mHof, 0.0005, 0.72);

    return {
      slot: key,
      slotAs: slotAs,
      slotNba: slotNba,
      slotHof: slotHof,
      slotMvp: inten.mvp,
      pAs: pAs, pNba: pNba, pHof: pHof,
      expAs: pAs * inten.as,
      expNba: pNba * inten.nba,
      expNba1: pNba * inten.nba1,
      expYrs: inten.yrs * mYrs,
      expCh: inten.ch * clamp((mAs + mHof) / 2, 0.50, 1.40),
      expMvp: inten.mvp * mMvp,
      mAs: mAs, mNba: mNba, mHof: mHof, mMvp: mMvp, mYrs: mYrs,
      scale: mAs,
      steps: steps,
      feat: feat
    };
  }

  function fmtExp(n) {
    if (n == null || isNaN(n)) return "—";
    if (Math.abs(n) < 0.05) return "0";
    if (Math.abs(n) < 0.1) return n < 0 ? "−<0.1" : "<0.1";
    const abs = Math.abs(n);
    return (n < 0 ? "−" : "") + (abs >= 10 ? String(Math.round(abs)) : abs.toFixed(1));
  }
  function fmtPct(n) { return Math.round((n || 0) * 100) + "%"; }
  function fmtMul(m) {
    if (m == null) return "×1.00";
    return "×" + Number(m).toFixed(2);
  }

  window.TR = window.TR || {};
  TR.Model = { slotBucket: slotBucket, inches: inches, deriveFeat: deriveFeat, project: project, INTENSITY: INTENSITY, fmtExp: fmtExp, fmtPct: fmtPct, fmtMul: fmtMul };
  TR.deriveFeat = deriveFeat;
  TR.projectPlayer = project;
})();
