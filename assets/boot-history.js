(function () {
  if (!window.TR || !window.TANK_RANK) return;
  const DISPLAY = {
    "Akeem Olajuwon": "Hakeem Olajuwon",
    "Lew Alcindor": "Kareem Abdul-Jabbar",
    "Chris Jackson": "Mahmoud Abdul-Rauf",
    "Ron Artest": "Metta World Peace"
  };
  function displayName(name) {
    const raw = String(name || "").replace(/[\^~*+#]+/g, "").trim();
    return DISPLAY[raw] || raw;
  }
  function slug(name, year, pick) {
    return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + year + "-" + (pick || 0);
  }
  function ingest(rows) {
    const byYear = {};
    (rows || []).forEach((r) => {
      if (!r || !r.n) return;
      (byYear[r.y] || (byYear[r.y] = [])).push(r);
    });
    Object.keys(byYear).forEach((ys) => {
      const year = Number(ys);
      const list = byYear[year].slice().sort((a, b) => (Number(a.pk) || 9999) - (Number(b.pk) || 9999));
      TANK_RANK.drafts[year] = {
        year,
        label: year <= 1949 ? year + " BAA Draft" : year + " NBA Draft",
        note: "Selections in official pick order, every round.",
        historic: true,
        players: list.map((r, i) => ({
          id: slug(displayName(r.n), year, r.pk || i + 1),
          name: displayName(r.n),
          rank: Number(r.pk) || i + 1,
          catRank: r.rd || i + 1,
          bucket: "college",
          school: r.c || "\u2014",
          team: r.t || "",
          pos: r.pos || "",
          rd: r.rd,
          yrs: r.yrs,
          hof: r.hof || 0,
          allStar: r.as || 0,
          nba1: r.nba1 || 0,
          allNba: r.nba || 0,
          champs: r.ch || 0,
          mvp: r.mvp || 0,
          ht: "", wt: "", age: "",
          pHof: 0, pAllNba: 0, pAllStar: 0, pBust: 0,
          expWs: r.ws || 0, delta: 0,
          features: ["Draft slot", "College", "Career WS"]
        }))
      };
    });
  }
  function loadJSON(path) {
    return fetch(path).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  }
  function loadYear(year) {
    year = Number(year);
    if (!year || year >= TANK_RANK.currentYear) return Promise.resolve();
    if (TANK_RANK.drafts[year] && (TANK_RANK.drafts[year].players || []).length) return Promise.resolve();
    return loadJSON("./assets/history/" + year + ".json").then((rows) => {
      if (rows && rows.length) { ingest(rows); return; }
      const dec = String(Math.floor(year / 10) * 10) + "s";
      return loadJSON("./assets/history/" + dec + ".json").then((all) => {
        const mine = (all || []).filter((r) => Number(r.y) === year);
        if (mine.length) ingest(mine);
      });
    });
  }
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
  function paintSettled(year) {
    if (!year || year >= TANK_RANK.currentYear) return Promise.resolve();
    const dec = String(Math.floor(Number(year) / 10) * 10) + "s";
    return Promise.all([
      loadJSON("./assets/outcomes-legacy.json"),
      loadJSON("./assets/outcomes-extra.json"),
      loadJSON("./assets/outcomes/" + dec + ".json"),
      loadJSON("./assets/slot-priors.json")
    ]).then(([outcomes, extra, decade, priors]) => {
      const pack = Object.assign({}, (outcomes || {})[String(year)] || {}, (extra || {})[String(year)] || {}, (decade || {})[String(year)] || {});
      const draft = TANK_RANK.drafts[year];
      if (!draft) return;
      (draft.players || []).forEach((p) => {
        const o = pack[String(p.rank)];
        if (!o) return;
        if (o.hof) p.hof = 1;
        if (o.as != null) p.allStar = o.as;
        if (o.nba1 != null) p.nba1 = o.nba1;
        if (o.nba != null) p.allNba = o.nba;
        if (o.yrs != null) p.yrs = o.yrs;
        if (o.ch != null) p.champs = o.ch;
        if (o.mvp != null) p.mvp = o.mvp;
      });
      TANK_RANK.slotPriors = priors || {};
    });
  }
  const origBoard = TR.renderBoard;
  const origPlayer = TR.renderPlayer;
  TR.renderBoard = function (root) {
    const y = Number(new URLSearchParams(location.search).get("year")) || TANK_RANK.currentYear;
    return loadYear(y).then(() => origBoard(root)).then(() => paintSettled(y));
  };
  TR.renderPlayer = function (root) {
    const y = Number(new URLSearchParams(location.search).get("year")) || TANK_RANK.currentYear;
    return loadYear(y).then(() => origPlayer(root)).then(() => paintSettled(y));
  };
})();
