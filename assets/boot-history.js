(function () {
  if (!window.TR || !window.TANK_RANK) return;

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
          id: slug(r.n, year, r.pk || i + 1),
          name: String(r.n || "").replace(/[\^~*+#]+/g, "").trim(),
          rank: Number(r.pk) || i + 1,
          catRank: r.rd || i + 1,
          bucket: "college",
          school: r.c || "—",
          team: r.t || "",
          pos: r.pos || "",
          rd: r.rd,
          yrs: r.yrs,
          g: r.g,
          pts: r.pts,
          ws: r.ws,
          vorp: r.vorp,
          hof: r.hof || 0,
          allStar: r.as || 0,
          nba1: r.nba1 || 0,
          allNba: r.nba || 0,
          ht: "",
          wt: "",
          age: "",
          pHof: 0, pAllNba: 0, pAllStar: 0, pBust: 0,
          expWs: r.ws || 0,
          delta: 0,
          features: ["Draft slot", "College", "Career WS"]
        }))
      };
    });
  }

  function loadYear(year) {
    year = Number(year);
    if (!year || year >= TANK_RANK.currentYear) return Promise.resolve();
    if (TANK_RANK.drafts[year] && (TANK_RANK.drafts[year].players || []).length) return Promise.resolve();
    return fetch("./assets/history/" + year + ".json")
      .then((r) => (r.ok ? r.json() : null))
      .then((rows) => { if (rows && rows.length) ingest(rows); });
  }

  const origBoard = TR.renderBoard;
  const origPlayer = TR.renderPlayer;
  TR.renderBoard = function (root) {
    const y = Number(new URLSearchParams(location.search).get("year")) || TANK_RANK.currentYear;
    return loadYear(y).then(() => origBoard(root));
  };
  TR.renderPlayer = function (root) {
    const y = Number(new URLSearchParams(location.search).get("year")) || TANK_RANK.currentYear;
    return loadYear(y).then(() => origPlayer(root));
  };
})();
