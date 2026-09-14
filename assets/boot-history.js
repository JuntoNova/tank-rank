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
        year: year,
        label: year <= 1949 ? year + " BAA Draft" : year + " NBA Draft",
        note: "Selections in official pick order, every round.",
        historic: true,
        players: list.map((r, i) => ({
          id: slug(r.n, year, r.pk || i + 1),
          name: displayName(r.n),
          rank: Number(r.pk) || i + 1,
          catRank: r.rd || i + 1,
          bucket: "college",
          school: r.c || "\u2014",
          team: r.t || "",
          pos: r.pos || "",
          rd: r.rd, yrs: r.yrs, g: r.g, pts: r.pts, ws: r.ws, vorp: r.vorp,
          hof: r.hof || 0, allStar: r.as || 0, nba1: r.nba1 || 0, allNba: r.nba || 0,
          champs: r.ch || 0, mvp: r.mvp || 0,
          ht: r.ht || "", wt: r.wt || "", age: r.age || "",
          pHof: null, pAllNba: null, pAllStar: null, pBust: null,
          expWs: r.ws || null, delta: null,
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
    return loadJSON("./assets/history/" + year + ".json?v=77").then((rows) => {
      if (rows && rows.length) { ingest(rows); return; }
      const dec = String(Math.floor(year / 10) * 10) + "s";
      return loadJSON("./assets/history/" + dec + ".json?v=77").then((all) => {
        const mine = (all || []).filter((r) => Number(r.y) === year);
        if (mine.length) ingest(mine);
      });
    });
  }
  function ensureChips(year) {
    const toolbar = document.querySelector(".toolbar");
    if (!toolbar) return;
    const future = Number(year) >= TANK_RANK.currentYear;
    if (future) {
      toolbar.querySelectorAll("[data-view]").forEach((b) => b.remove());
      return;
    }
    if (!toolbar.querySelector("[data-view]")) {
      toolbar.insertAdjacentHTML("afterbegin",
        '<button type="button" class="chip on" data-view="now">Now</button>' +
        '<button type="button" class="chip" data-view="drafted">When drafted</button>'
      );
    }
  }
  const origBoard = TR.renderBoard;
  const origPlayer = TR.renderPlayer;
  TR.renderBoard = function (root) {
    const y = Number(new URLSearchParams(location.search).get("year")) || TANK_RANK.currentYear;
    return loadYear(y).then(() => origBoard(root)).then(() => ensureChips(y));
  };
  TR.renderPlayer = function (root) {
    const y = Number(new URLSearchParams(location.search).get("year")) || TANK_RANK.currentYear;
    return loadYear(y).then(() => origPlayer(root));
  };
})();
