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
    return Promise.all([
      loadJSON("./assets/outcomes-legacy.json"),
      loadJSON("./assets/outcomes-extra.json"),
      loadJSON("./assets/slot-priors.json")
    ]).then(([outcomes, extra, priors]) => {
      const pack = Object.assign({}, (outcomes || {})[String(year)] || {}, (extra || {})[String(year)] || {});
      const draft = TANK_RANK.drafts[year];
      if (!draft) return;
      (draft.players || []).forEach((p) => {
        const o = pack[String(p.rank)];
        if (!o) return;
        if (o.hof) p.hof = 1;
        if (o.as) p.allStar = o.as;
        if (o.nba1) p.nba1 = o.nba1;
        if (o.nba) p.allNba = o.nba;
        if (o.yrs) p.yrs = o.yrs;
        if (o.ch) p.champs = o.ch;
        if (o.mvp) p.mvp = o.mvp;
      });
      TANK_RANK.slotPriors = priors || {};
      if (!document.getElementById("hof-style")) {
        const s = document.createElement("style");
        s.id = "hof-style";
        s.textContent = ".hof{display:inline-block;margin-left:6px;padding:1px 6px;border-radius:999px;background:#f0c14b;color:#111;font-family:var(--mono);font-size:10px;letter-spacing:.08em;vertical-align:2px}";
        document.head.appendChild(s);
      }
      const toolbar = document.querySelector(".toolbar");
      const head = document.querySelector("thead tr");
      const body = document.querySelector("#rows");
      const sub = document.querySelector(".section-head .sub");
      if (!toolbar || !head || !body) return;
      const params = new URLSearchParams(location.search);
      let view = (params.get("view") === "then" || params.get("view") === "drafted") ? "drafted" : "now";
      if (!toolbar.querySelector("[data-view]")) {
        toolbar.insertAdjacentHTML("afterbegin",
          '<button class="chip ' + (view === "now" ? "on" : "") + '" data-view="now">Now</button>' +
          '<button class="chip ' + (view === "drafted" ? "on" : "") + '" data-view="drafted">When drafted</button>'
        );
      } else {
        toolbar.querySelectorAll("[data-view]").forEach((b) => {
          if (b.dataset.view === "then") { b.dataset.view = "drafted"; b.textContent = "When drafted"; }
          b.classList.toggle("on", b.dataset.view === view);
        });
      }
      if (sub) {
        sub.innerHTML = 'What actually happened. When drafted is the historical rate for that draft slot \u2014 not a trained model. <a href="./drafts.html">All historic drafts</a>.';
      }
      const pct = (n) => Math.round((n || 0) * 100) + "%";
      const dash = (v) => (v ? v : "\u2014");
      const draw = () => {
        const q = (document.querySelector("#q") || {}).value || "";
        let rows = (draft.players || []).slice();
        if (q) {
          const s = q.toLowerCase();
          rows = rows.filter((p) => (p.name || "").toLowerCase().includes(s) || (p.school || "").toLowerCase().includes(s) || (p.team || "").toLowerCase().includes(s));
        }
        if (view === "drafted") {
          head.innerHTML = "<th>Pk</th><th>Player</th><th>Team</th><th>P(HOF)</th><th>P(AS)</th><th>P(All-NBA)</th>";
          body.innerHTML = rows.map((p) => {
            const slot = (TANK_RANK.slotPriors || {})[slotBucket(p.rank)] || {};
            return '<tr onclick="location.href=\'./player.html?year=' + year + '&id=' + p.id + '\'" style="cursor:pointer">' +
              '<td class="rank">' + String(p.rank).padStart(2, "0") + '</td>' +
              '<td><div class="name">' + p.name + '</div><div class="meta">' + [p.pos, p.school].filter(Boolean).join(" \u00b7 ") + '</div></td>' +
              '<td>' + (p.team || "\u2014") + '</td>' +
              '<td class="pct">' + pct(slot.pHof) + '</td>' +
              '<td class="pct">' + pct(slot.pAs) + '</td>' +
              '<td class="pct">' + pct(slot.pNba) + '</td></tr>';
          }).join("");
        } else {
          head.innerHTML = "<th>Pk</th><th>Player</th><th>Team</th><th>AS</th><th>1st</th><th>All-NBA</th><th>Yrs</th><th>Chips</th><th>MVP</th>";
          body.innerHTML = rows.map((p) => {
            return '<tr onclick="location.href=\'./player.html?year=' + year + '&id=' + p.id + '\'" style="cursor:pointer">' +
              '<td class="rank">' + String(p.rank).padStart(2, "0") + '</td>' +
              '<td><div class="name">' + p.name + (p.hof ? ' <span class="hof">HOF</span>' : '') + '</div><div class="meta">' + [p.pos, p.school].filter(Boolean).join(" \u00b7 ") + '</div></td>' +
              '<td>' + (p.team || "\u2014") + '</td>' +
              '<td class="pct">' + dash(p.allStar) + '</td>' +
              '<td class="pct">' + dash(p.nba1) + '</td>' +
              '<td class="pct">' + dash(p.allNba) + '</td>' +
              '<td class="pct">' + dash(p.yrs) + '</td>' +
              '<td class="pct">' + dash(p.champs) + '</td>' +
              '<td class="pct">' + dash(p.mvp) + '</td></tr>';
          }).join("");
        }
      };
      toolbar.querySelectorAll("[data-view]").forEach((btn) => {
        btn.onclick = () => {
          view = btn.dataset.view === "then" ? "drafted" : btn.dataset.view;
          const url = new URL(location.href);
          if (view === "drafted") url.searchParams.set("view", "drafted");
          else url.searchParams.delete("view");
          history.replaceState({}, "", url);
          toolbar.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("on", b.dataset.view === view));
          draw();
        };
      });
      const search = document.querySelector("#q");
      if (search) search.addEventListener("input", draw);
      draw();
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
    return loadYear(y).then(() => origPlayer(root));
  };
})();
