(function () {
  // Listed-size sample on /size: picks 1–60, 1947–2018, n = 3,074.
  // Base = average draftee in that sample.
  const BASE = { as: 0.156, nba: 0.086, hof: 0.047, mvp: 0.0117, n: 3074 };
  const HT = [
    { lo: 0, hi: 73, label: "Under 6-1", n: 132, as: 0.182, nba: 0.098, hof: 0.068, mvp: 0.0076,
      dAs: 2.5, dNba: 1.2, dHof: 2.1, dMvp: -0.41, mAs: 1.09, mNba: 1.08, mHof: 1.25, mMvp: 0.81 },
    { lo: 73, hi: 79, label: "6-1 to 6-6", n: 1364, as: 0.156, nba: 0.090, hof: 0.045, mvp: 0.0081,
      dAs: 0.0, dNba: 0.4, dHof: -0.2, dMvp: -0.36, mAs: 0.99, mNba: 1.04, mHof: 0.97, mMvp: 0.74 },
    { lo: 79, hi: 84, label: "6-7 to 6-11", n: 1369, as: 0.156, nba: 0.078, hof: 0.043, mvp: 0.0124,
      dAs: 0.0, dNba: -0.8, dHof: -0.4, dMvp: 0.07, mAs: 1.00, mNba: 0.92, mHof: 0.93, mMvp: 1.05 },
    { lo: 84, hi: 87, label: "7-0 to 7-2", n: 192, as: 0.146, nba: 0.094, hof: 0.057, mvp: 0.0365,
      dAs: -1.1, dNba: 0.8, dHof: 1.0, dMvp: 2.47, mAs: 0.97, mNba: 1.05, mHof: 1.11, mMvp: 1.80 },
    { lo: 87, hi: 120, label: "7-3 and up", n: 17, as: 0.176, nba: 0.118, hof: 0.176, mvp: 0.000,
      dAs: 2.0, dNba: 3.2, dHof: 12.9, dMvp: -1.17, mAs: 1.05, mNba: 1.15, mHof: 1.80, mMvp: 1.80 }
  ];
  const WT = [
    { lo: 0, hi: 160, label: "under 160", n: 8, as: 0.250, nba: 0.125, hof: 0.125, mvp: 0.000,
      dAs: 9.3, dNba: 3.9, dHof: 7.8, dMvp: -1.17, mAs: 1.08, mNba: 1.06, mHof: 1.20, mMvp: 0.70 },
    { lo: 160, hi: 170, label: "160–169", n: 46, as: 0.196, nba: 0.087, hof: 0.065, mvp: 0.0217,
      dAs: 3.9, dNba: 0.1, dHof: 1.8, dMvp: 1.00, mAs: 1.08, mNba: 1.01, mHof: 1.10, mMvp: 1.20 },
    { lo: 170, hi: 180, label: "170–179", n: 199, as: 0.156, nba: 0.101, hof: 0.055, mvp: 0.0050,
      dAs: -0.1, dNba: 1.5, dHof: 0.8, dMvp: -0.67, mAs: 1.00, mNba: 1.08, mHof: 1.05, mMvp: 0.80 },
    { lo: 180, hi: 190, label: "180–189", n: 369, as: 0.149, nba: 0.076, hof: 0.041, mvp: 0.0027,
      dAs: -0.8, dNba: -1.0, dHof: -0.6, dMvp: -0.90, mAs: 0.97, mNba: 0.94, mHof: 0.96, mMvp: 0.70 },
    { lo: 190, hi: 200, label: "190–199", n: 404, as: 0.161, nba: 0.082, hof: 0.052, mvp: 0.0074,
      dAs: 0.4, dNba: -0.4, dHof: 0.5, dMvp: -0.43, mAs: 1.01, mNba: 0.98, mHof: 1.03, mMvp: 0.85 },
    { lo: 200, hi: 210, label: "200–209", n: 363, as: 0.160, nba: 0.083, hof: 0.036, mvp: 0.0110,
      dAs: 0.3, dNba: -0.3, dHof: -1.1, dMvp: -0.07, mAs: 1.01, mNba: 0.98, mHof: 0.94, mMvp: 0.97 },
    { lo: 210, hi: 220, label: "210–219", n: 471, as: 0.149, nba: 0.085, hof: 0.055, mvp: 0.0127,
      dAs: -0.8, dNba: -0.1, dHof: 0.8, dMvp: 0.10, mAs: 0.97, mNba: 0.99, mHof: 1.05, mMvp: 1.04 },
    { lo: 220, hi: 230, label: "220–229", n: 426, as: 0.174, nba: 0.073, hof: 0.042, mvp: 0.0070,
      dAs: 1.7, dNba: -1.3, dHof: -0.5, dMvp: -0.47, mAs: 1.05, mNba: 0.93, mHof: 0.96, mMvp: 0.85 },
    { lo: 230, hi: 240, label: "230–239", n: 282, as: 0.128, nba: 0.085, hof: 0.057, mvp: 0.0106,
      dAs: -2.9, dNba: -0.1, dHof: 1.0, dMvp: -0.11, mAs: 0.91, mNba: 0.99, mHof: 1.06, mMvp: 0.96 },
    { lo: 240, hi: 250, label: "240–249", n: 220, as: 0.186, nba: 0.095, hof: 0.041, mvp: 0.0227,
      dAs: 3.0, dNba: 1.0, dHof: -0.6, dMvp: 1.10, mAs: 1.08, mNba: 1.05, mHof: 0.96, mMvp: 1.25 },
    { lo: 250, hi: 260, label: "250–259", n: 144, as: 0.160, nba: 0.118, hof: 0.042, mvp: 0.0347,
      dAs: 0.3, dNba: 3.2, dHof: -0.5, dMvp: 2.30, mAs: 1.01, mNba: 1.16, mHof: 0.96, mMvp: 1.55 },
    { lo: 260, hi: 270, label: "260–269", n: 69, as: 0.072, nba: 0.058, hof: 0.014, mvp: 0.000,
      dAs: -8.4, dNba: -2.8, dHof: -3.2, dMvp: -1.17, mAs: 0.80, mNba: 0.88, mHof: 0.80, mMvp: 0.55 },
    { lo: 270, hi: 280, label: "270–279", n: 38, as: 0.158, nba: 0.105, hof: 0.053, mvp: 0.0263,
      dAs: 0.1, dNba: 2.0, dHof: 0.6, dMvp: 1.46, mAs: 1.00, mNba: 1.10, mHof: 1.04, mMvp: 1.30 },
    { lo: 280, hi: 290, label: "280–289", n: 21, as: 0.190, nba: 0.190, hof: 0.000, mvp: 0.0952,
      dAs: 3.4, dNba: 10.5, dHof: -4.7, dMvp: 8.35, mAs: 1.08, mNba: 1.30, mHof: 0.75, mMvp: 1.80 },
    { lo: 290, hi: 300, label: "290–299", n: 3, as: 0.000, nba: 0.000, hof: 0.000, mvp: 0.000,
      dAs: -15.7, dNba: -8.6, dHof: -4.7, dMvp: -1.17, mAs: 1.00, mNba: 1.00, mHof: 1.00, mMvp: 1.00 },
    { lo: 300, hi: 500, label: "300+", n: 9, as: 0.222, nba: 0.222, hof: 0.222, mvp: 0.1111,
      dAs: 6.6, dNba: 13.7, dHof: 17.5, dMvp: 9.94, mAs: 1.10, mNba: 1.25, mHof: 1.40, mMvp: 1.60 }
  ];

  function inches(ht) {
    const m = String(ht || "").match(/(\d+)\s*-\s*(\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) * 12 + Number(m[2]) : 0;
  }
  function pick(list, x) {
    if (x == null || isNaN(x)) return null;
    for (let i = 0; i < list.length; i++) {
      if (x >= list[i].lo && x < list[i].hi) return list[i];
    }
    return list[list.length - 1];
  }
  function lookup(feat) {
    const htIn = inches(feat && (feat.ht || feat.htListed || feat.htCombine));
    const wt = feat && feat.wt != null && feat.wt !== "" ? Number(feat.wt) : NaN;
    return {
      base: BASE,
      htIn: htIn || null,
      wt: isNaN(wt) ? null : wt,
      height: htIn ? pick(HT, htIn) : null,
      weight: !isNaN(wt) ? pick(WT, wt) : null
    };
  }

  window.TR = window.TR || {};
  TR.Size = { BASE: BASE, HT: HT, WT: WT, inches: inches, lookup: lookup };
})();
