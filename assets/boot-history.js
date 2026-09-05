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

  function loadJSON(path) {
    return fetch(path).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  }

  function loadYear(year) {
    year = Number(year);
    if (!year || year >= TANK_RANK.currentYear) return Promise.resolve();
    if (TANK_RANK.drafts[year] && (TANK_RANK.drafts[year].players || []).length) return Promise.resolve();
    return loadJSON("./assets/history/" + year + ".json").then((rows) => {
      if (rows && rows.length) ingest(rows);
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
    if (year > 1999 || year >= TANK_RANK.currentYear) return Promise.resolve();
    return Promise.all([
      loadJSON("./assets/outcomes-legacy.json"),
      loadJSON("./assets/slot-priors.json")
    ]).then(([outcomes, priors]) => {
      const pack = (outcomes || {})[String(year)] || {};
      const draft = TANK_RANK.drafts[year];
      if (!draft) return;
      (draft.players || []).forEach((p) => {
        const o = pack[String(p.rank)];
        if (!o) return;
        if (o.hof) p.hof = 1;
        if (o.as) p.allStar = o.as;
        if (o.nba1) p.nba1 = o.nba1;
        if (o.nba) p.allNba = o.nba;
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

      let view = new URLSearchParams(location.search).get("view") === "then" ? "then" : "now";
      if (!toolbar.querySelector("[data-view]")) {
        toolbar.insertAdjacentHTML("afterbegin",
          '<button class="chip ' + (view === "now" ? "on" : "") + '" data-view="now">Now</button>' +
          '<button class="chip ' + (view === "then" ? "on" : "") + '" data-view="then">Then</button>'
        );
      }
      if (sub) {
        sub.innerHTML = 'What actually happened. Then is the historical rate for that draft slot \u2014 not a trained model. <a href="./drafts.html">All historic drafts</a>.';
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
        if (view === "then") {
          head.innerHTML = "<th>Pk</th><th>Player</th><th>Team</th><th>P(HOF)</th><th>P(AS)</th><th>P(All-NBA)</th><th>P(Bust)</th>";
          body.innerHTML = rows.map((p) => {
            const slot = (TANK_RANK.slotPriors || {})[slotBucket(p.rank)] || {};
            return '<tr onclick="location.href=\'./player.html?year=' + year + '&id=' + p.id + '\'" style="cursor:pointer">' +
              '<td class="rank">' + String(p.rank).padStart(2, "0") + '</td>' +
              '<td><div class="name">' + p.name + '</div><div class="meta">' + [p.pos, p.school].filter(Boolean).join(" \u00b7 ") + '</div></td>' +
              '<td>' + (p.team || "\u2014") + '</td>' +
              '<td class="pct">' + pct(slot.pHof) + '</td>' +
              '<td class="pct">' + pct(slot.pAs) + '</td>' +
              '<td class="pct">' + pct(slot.pNba) + '</td>' +
              '<td class="pct">' + pct(slot.pBust) + '</td></tr>';
          }).join("");
        } else {
          head.innerHTML = "<th>Pk</th><th>Player</th><th>Team</th><th>HOF</th><th>AS</th><th>1st</th><th>All-NBA</th><th>Yrs</th>";
          body.innerHTML = rows.map((p) => {
            return '<tr onclick="location.href=\'./player.html?year=' + year + '&id=' + p.id + '\'" style="cursor:pointer">' +
              '<td class="rank">' + String(p.rank).padStart(2, "0") + '</td>' +
              '<td><div class="name">' + p.name + (p.hof ? ' <span class="hof">HOF</span>' : '') + '</div><div class="meta">' + [p.pos, p.school].filter(Boolean).join(" \u00b7 ") + '</div></td>' +
              '<td>' + (p.team || "\u2014") + '</td>' +
              '<td>' + (p.hof ? "Yes" : "\u2014") + '</td>' +
              '<td class="pct">' + dash(p.allStar) + '</td>' +
              '<td class="pct">' + dash(p.nba1) + '</td>' +
              '<td class="pct">' + dash(p.allNba) + '</td>' +
              '<td class="pct">' + (p.yrs ?? "\u2014") + '</td></tr>';
          }).join("");
        }
      };

      toolbar.querySelectorAll("[data-view]").forEach((btn) => {
        btn.onclick = () => {
          view = btn.dataset.view;
          const url = new URL(location.href);
          if (view === "then") url.searchParams.set("view", "then");
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
