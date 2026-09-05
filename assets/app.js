const fmtPct = (n) => `${Math.round(n * 100)}%`;
const bucketLabel = { college: "College", "high-school": "High School", international: "International" };

function currentYear() {
  return TANK_RANK.currentYear;
}

function parseYear() {
  const y = Number(new URLSearchParams(location.search).get("year"));
  if (TANK_RANK.drafts[y]) return y;
  if ((TANK_RANK.historicYears || []).includes(y)) return y;
  if ((TANK_RANK.futureYears || []).includes(y)) return y;
  return currentYear();
}

function isHistoric(year) {
  return year < currentYear();
}

function slugName(name, year, pick) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + year + "-" + (pick || 0);
}

function ingestHistoryRows(rows) {
  const byYear = {};
  rows.forEach((r) => {
    (byYear[r.y] || (byYear[r.y] = [])).push(r);
  });
  Object.keys(byYear).forEach((ys) => {
    const year = Number(ys);
    const list = byYear[year].slice().sort((a, b) => (a.pk || 999) - (b.pk || 999));
    TANK_RANK.drafts[year] = {
      year,
      label: year <= 1949 ? year + " BAA Draft" : year + " NBA Draft",
      note: "Full historic draft. Career counting stats included where known.",
      historic: true,
      players: list.map((r, i) => ({
        id: slugName(r.n, year, r.pk),
        name: r.n,
        rank: r.pk || i + 1,
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
  TANK_RANK.historyLoaded = true;
}

function loadJSON(path) {
  return fetch(path).then((r) => (r.ok ? r.json() : null)).catch(() => null);
}

function decadeOf(year) {
  return Math.floor(Number(year) / 10) * 10;
}

function playerIndex() {
  if (TANK_RANK.playerIndex) return Promise.resolve(TANK_RANK.playerIndex);
  return loadJSON("./assets/player-index.json").then((rows) => {
    TANK_RANK.playerIndex = rows || [];
    return TANK_RANK.playerIndex;
  });
}

function loadHistory() {
  if (TANK_RANK.historyLoaded) return Promise.resolve();
  const decades = [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
  return Promise.all(decades.map((d) => loadJSON("./assets/history/" + d + "s.json")))
    .then((chunks) => {
      const rows = chunks.filter(Boolean).flat();
      if (rows.length) {
        ingestHistoryRows(rows);
        return;
      }
      return playerIndex().then((idx) => {
        if (idx && idx.length) ingestHistoryRows(idx);
      });
    });
}

function loadYearHistory(year) {
  if (TANK_RANK.drafts[year] && (TANK_RANK.drafts[year].players || []).length) {
    return Promise.resolve();
  }
  if (year >= currentYear()) return Promise.resolve();
  const dec = decadeOf(year);
  return loadJSON("./assets/history/" + dec + "s.json").then((rows) => {
    if (rows && rows.length) {
      ingestHistoryRows(rows);
      return;
    }
    return playerIndex().then((idx) => {
      ingestHistoryRows((idx || []).filter((r) => Number(r.y) === Number(year)));
    });
  });
}

function draftOf(year) {
  return TANK_RANK.drafts[year] || { year, players: [], label: year + " draft", historic: year < currentYear() };
}

function playersOf(year) {
  return [...(draftOf(year).players || [])].sort((a, b) => a.rank - b.rank);
}

function nextYear() {
  return TANK_RANK.nextYear || currentYear() + 1;
}

function bucketsFor(year) {
  const present = new Set(playersOf(year).map((p) => p.bucket));
  return TANK_RANK.buckets.filter((b) => present.has(b));
}

function yearChipLabel(y) {
  if (y === currentYear()) return `${y} · live`;
  if (y === nextYear()) return `${y} · next`;
  return String(y);
}

function nav(active) {
  const y = currentYear();
  return `
    <header class="nav">
      <div class="wrap nav-inner">
        <a class="logo" href="./index.html">
          <img class="mark" src="./assets/mark.svg" width="28" height="28" alt="">
          <strong>The Draft Model</strong><span>${y}</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-label="Open menu">Menu</button>
        <nav class="nav-links">
          <a class="${active === "upcoming" ? "active" : ""}" href="./upcoming.html">Upcoming</a>
          <a class="${active === "drafts" ? "active" : ""}" href="./drafts.html">Historic</a>
          <a class="${active === "board" ? "active" : ""}" href="./board.html">Big Board</a>
          <a class="${active === "method" ? "active" : ""}" href="./methodology.html">Methodology</a>
          <a class="${active === "about" ? "active" : ""}" href="./about.html">About</a>
        </nav>
        <span class="badge">Prototype</span>
      </div>
    </header>`;
}

function bindNav(root) {
  const header = root.querySelector(".nav");
  const toggle = root.querySelector(".nav-toggle");
  if (!header || !toggle) return;
  toggle.onclick = () => {
    const open = header.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Menu";
  };
}

function footer() {
  return `<footer class="wrap">
    <div class="foot">
      <div class="copy">
        <div><b>© 2026 Junto Nova</b></div>
        <div>The Draft Model is a DBA of Junto Nova.</div>
        <div>Not affiliated with, endorsed by, or sponsored by the NBA, the NBA Draft, or any NBA team.</div>
        <div>Probabilities, not opinions. · Updated ${TANK_RANK.updated} · v${TANK_RANK.version}</div>
      </div>
      <nav class="foot-links">
        <a href="./terms.html">Terms</a>
        <a href="./privacy.html">Privacy</a>
        <a href="https://x.com/jandrewclark" target="_blank" rel="noopener noreferrer">X</a>
        <a class="icon-link" href="mailto:andrew@juntonova.com" aria-label="Email The Draft Model">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13Zm2.5-.5a.5.5 0 0 0-.5.5v.3l7 4.4 7-4.4V5.5a.5.5 0 0 0-.5-.5h-13Zm13.5 2.86-6.62 4.14a1.5 1.5 0 0 1-1.76 0L4 7.86V18.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V7.86Z"/>
          </svg>
        </a>
      </nav>
    </div>
  </footer>`;
}

function deltaHtml(d) {
  if (!d) return `<span class="delta">—</span>`;
  const cls = d > 0 ? "up" : "down";
  const sign = d > 0 ? "+" : "";
  return `<span class="delta ${cls}">${sign}${d}</span>`;
}

function metricHtml(label, val, risk) {
  return `<div class="metric"><label>${label}</label><b>${fmtPct(val)}</b><div class="bar ${risk ? "risk" : ""}"><i style="width:${Math.round(val * 100)}%"></i></div></div>`;
}

function renderBoard(root) {
  const params = new URLSearchParams(location.search);
  const year = parseYear();
  const draft = draftOf(year);
  const available = bucketsFor(year);
  let bucket = params.get("bucket") || "all";
  if (bucket !== "all" && !available.includes(bucket)) bucket = "all";
  let q = params.get("q") || "";
  document.title = `${year} NBA Draft ${isHistoric(year) ? "Results" : "Big Board"} | The Draft Model`;
  const historic = isHistoric(year);

  const apply = () => {
    let rows = playersOf(year);
    if (!historic && bucket !== "all") rows = rows.filter((p) => p.bucket === bucket);
    if (q) {
      const s = q.toLowerCase();
      rows = rows.filter((p) => p.name.toLowerCase().includes(s) || (p.school || "").toLowerCase().includes(s) || (p.team || "").toLowerCase().includes(s));
    }
    if (historic) {
      root.querySelector("#rows").innerHTML = rows.map((p) => `
        <tr onclick="location.href='./player.html?year=${year}&id=${p.id}'" style="cursor:pointer">
          <td class="rank">${String(p.rank).padStart(2, "0")}</td>
          <td>
            <div class="name">${p.name}</div>
            <div class="meta">${[p.pos, p.school].filter(Boolean).join(" · ")}</div>
          </td>
          <td>${p.team || "—"}</td>
          <td>${p.rd || "—"}</td>
          <td class="pct">${p.yrs ?? "—"}</td>
          <td class="pct">${p.g ?? "—"}</td>
          <td class="pct">${p.pts ?? "—"}</td>
          <td class="pct">${p.ws ?? "—"}</td>
          <td class="pct">${p.vorp ?? "—"}</td>
        </tr>`).join("") || `<tr><td colspan="9" style="color:var(--muted);padding:24px">No players match.</td></tr>`;
      return;
    }
    root.querySelector("#rows").innerHTML = rows.map((p) => `
      <tr onclick="location.href='./player.html?year=${year}&id=${p.id}'" style="cursor:pointer">
        <td class="rank">${String(p.rank).padStart(2, "0")}</td>
        <td>
          <div class="name">${p.name}</div>
          <div class="meta">${p.pos} · ${p.school} · ${p.ht}</div>
        </td>
        <td><span class="tag">${bucketLabel[p.bucket] || p.bucket}</span></td>
        <td class="pct">${fmtPct(p.pHof)}</td>
        <td class="pct">${fmtPct(p.pAllStar)}</td>
        <td class="pct">${fmtPct(p.pAllNba)}</td>
        <td class="pct">${fmtPct(p.pBust)}</td>
        <td class="pct">${(p.expWs || 0).toFixed(1)}</td>
        <td>${deltaHtml(p.delta)}</td>
      </tr>`).join("") || `<tr><td colspan="9" style="color:var(--muted);padding:24px">No players match.</td></tr>`;
  };

  root.innerHTML = `
    ${nav(year === currentYear() ? "board" : "drafts")}
    <main class="wrap section">
      <div class="banner">${TANK_RANK.disclaimer} ${draft.note || ""}</div>
      <div class="section-head">
        <div>
          <div class="kicker">${year === currentYear() ? "Living board" : year > currentYear() ? "Upcoming class" : year <= 1949 ? "BAA draft" : "Historic draft"}</div>
          <h2>${year === currentYear() ? year + " Top 300" : year + " draft"}</h2>
          <p class="sub">${year === currentYear() ? `College and international only. High school opens on the <a href="./upcoming.html">upcoming boards</a>.` : year > currentYear() ? `Upcoming class. High school included. <a href="./board.html">Back to ${currentYear()}</a>.` : `${(draft.players || []).length} selections across every round. <a href="./drafts.html">All historic drafts</a>.`}</p>
        </div>
      </div>
      <div class="toolbar">
        ${historic ? "" : ["all", ...available].map((b) =>
          `<button class="chip ${bucket === b ? "on" : ""}" data-bucket="${b}">${b === "all" ? "All" : bucketLabel[b]}</button>`
        ).join("")}
        <input class="search" id="q" placeholder="Search player, school, or team" value="${q}">
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              ${historic
                ? "<th>Pk</th><th>Player</th><th>Team</th><th>Rd</th><th>Yrs</th><th>G</th><th>PTS</th><th>WS</th><th>VORP</th>"
                : "<th>Rk</th><th>Player</th><th>Bucket</th><th>P(HOF)</th><th>P(AS)</th><th>P(All-NBA)</th><th>P(Bust)</th><th>Exp WS</th><th>Δ vs cons.</th>"}
            </tr>
          </thead>
          <tbody id="rows"></tbody>
        </table>
      </div>
    </main>
    ${footer()}`;

  root.querySelectorAll("[data-bucket]").forEach((btn) => {
    btn.onclick = () => {
      bucket = btn.dataset.bucket;
      root.querySelectorAll("[data-bucket]").forEach((b) => b.classList.toggle("on", b === btn));
      apply();
    };
  });
  root.querySelector("#q").oninput = (e) => { q = e.target.value; apply(); };
  bindNav(root);
  apply();
}

function renderHome(root) {
  document.title = "NBA Draft Boards | The Draft Model";
  root.innerHTML = `
    ${nav("home")}
    <main class="wrap home">
      <div class="doors">
        <a class="door" href="./upcoming.html">
          <div class="kicker">Future</div>
          <h2>Upcoming drafts</h2>
          <p>Living 2027 board, plus 2028 and 2029.</p>
          <span class="go">Open upcoming →</span>
        </a>
        <a class="door" href="./drafts.html">
          <div class="kicker">Archive</div>
          <h2>Historic drafts</h2>
          <p>Every completed class, 1947–2026. Every round.</p>
          <span class="go">Open history →</span>
        </a>
      </div>
    </main>
    ${footer()}`;
  bindNav(root);
}

function yearCard(y) {
  const d = draftOf(y);
  const top = playersOf(y)[0];
  const tag = y === currentYear() ? "Live" : y > currentYear() ? "Upcoming" : y <= 1949 ? "BAA" : "Archive";
  return `<a class="year-card" href="./board.html?year=${y}">
    <div class="kicker">${tag}</div>
    <h3>${y}</h3>
    <p>${top ? `#1 ${top.name}` : "Board incoming"}</p>
    <span class="sub">${(d.players || []).length} players →</span>
  </a>`;
}

function cleanName(n) {
  return String(n || "").replace(/[\^~*+]+/g, "").trim();
}

function historyMeta() {
  if (TANK_RANK.historyIndex) return Promise.resolve(TANK_RANK.historyIndex);
  return loadJSON("./assets/history-index.json").then((idx) => {
    TANK_RANK.historyIndex = idx || {};
    return TANK_RANK.historyIndex;
  });
}

function renderDrafts(root) {
  document.title = `NBA Draft History ${TANK_RANK.firstYear}–2026 | The Draft Model`;
  const archive = TANK_RANK.historicYears || TANK_RANK.years.filter((y) => y < currentYear());
  const decades = [...new Set(archive.map(decadeOf))];

  const paint = (meta) => {
    const yearLine = (y, highlight) => {
      const info = meta[y] || {};
      return `<a class="year-row ${highlight === y ? "on" : ""}" href="./board.html?year=${y}">
        <b>${y}</b>
        <span>${cleanName(info.top) || "Board incoming"}</span>
        <span class="count">${info.n ? info.n + " selected" : ""}</span>
      </a>`;
    };

    const accordion = (openDec, highlightYear, filterYears) => {
      const visible = filterYears ? archive.filter((y) => filterYears.has(y)) : archive;
      const decs = decades.filter((dec) => visible.some((y) => decadeOf(y) === dec));
      return `<div class="acc">${decs.map((dec) => {
        const years = visible.filter((y) => decadeOf(y) === dec);
        const open = dec === openDec || (filterYears && years.length);
        return `<section class="acc-item ${open ? "open" : ""}" data-decade="${dec}">
          <button class="acc-btn" type="button" data-toggle="${dec}">
            <b>${dec}s</b>
            <em>${years.length} drafts <i>${open ? "–" : "+"}</i></em>
          </button>
          <div class="acc-panel">${years.map((y) => yearLine(y, highlightYear)).join("")}</div>
        </section>`;
      }).join("")}</div>`;
    };

    root.innerHTML = `
      ${nav("drafts")}
      <main class="wrap section">
        <input class="archive-search" id="archive-q" placeholder="Search a year, decade, or player" autocomplete="off">
        <div id="hits" class="hits" hidden></div>
        <div id="acc-root">${accordion(2020)}</div>
      </main>
      ${footer()}`;
    bindNav(root);

    const accRoot = root.querySelector("#acc-root");
    const hits = root.querySelector("#hits");
    const input = root.querySelector("#archive-q");

    accRoot.onclick = (e) => {
      const btn = e.target.closest("[data-toggle]");
      if (!btn) return;
      const item = btn.closest(".acc-item");
      item.classList.toggle("open");
      const icon = btn.querySelector("i");
      if (icon) icon.textContent = item.classList.contains("open") ? "–" : "+";
    };

    const run = () => {
      const raw = (input.value || "").trim();
      const q = raw.toLowerCase();
      if (!q) {
        hits.hidden = true;
        hits.innerHTML = "";
        accRoot.innerHTML = accordion(2020);
        return;
      }

      const yearMatch = archive.find((y) => String(y) === q || String(y).slice(2) === q.replace(/^'/, ""));
      const decadeMatch = decades.find((d) => {
        return q === String(d) + "s" || q === String(d) || q === String(d).slice(2) + "s" || q === String(d).slice(2);
      });

      if (yearMatch) {
        hits.hidden = true;
        accRoot.innerHTML = accordion(decadeOf(yearMatch), yearMatch);
        return;
      }
      if (decadeMatch) {
        hits.hidden = true;
        accRoot.innerHTML = accordion(decadeMatch);
        return;
      }

      playerIndex().then((rows) => {
        const found = rows.filter((r) => cleanName(r.n).toLowerCase().includes(q)).slice(0, 40);
        if (!found.length) {
          hits.hidden = false;
          hits.innerHTML = `<p class="sub">No drafts or players match “${raw}”.</p>`;
          accRoot.innerHTML = accordion(2020);
          return;
        }
        const years = new Set(found.map((r) => r.y));
        hits.hidden = false;
        hits.innerHTML = found.map((r) => `
          <a class="hit" href="./board.html?year=${r.y}&q=${encodeURIComponent(cleanName(r.n))}">
            <span class="name">${cleanName(r.n)}</span>
            <span class="meta">${r.y} · pick ${r.pk || "—"}</span>
          </a>`).join("");
        accRoot.innerHTML = accordion(decadeOf(found[0].y), found[0].y, years);
      });
    };

    input.oninput = run;
  };

  historyMeta().then(paint);
}

function renderUpcoming(root) {
  document.title = "Upcoming NBA Drafts 2027–2029 | The Draft Model";
  const years = TANK_RANK.futureYears || [2027, 2028, 2029];
  root.innerHTML = `
    ${nav("upcoming")}
    <main class="wrap section">
      <div class="kicker">Future classes</div>
      <div class="year-grid" style="margin-top:18px">${years.map(yearCard).join("")}</div>
    </main>
    ${footer()}`;
  bindNav(root);
}

function renderPlayer(root) {
  const params = new URLSearchParams(location.search);
  const year = TANK_RANK.drafts[Number(params.get("year"))] ? Number(params.get("year")) : currentYear();
  const id = params.get("id");
  const p = playersOf(year).find((x) => x.id === id) || playersOf(year)[0];
  document.title = `${p.name} ${year} NBA Draft Prospect | The Draft Model`;
  root.innerHTML = `
    ${nav(year === currentYear() ? "board" : "drafts")}
    <main class="wrap">
      <div class="banner">${TANK_RANK.disclaimer}</div>
      <section class="player-hero">
        <div>
          <div class="kicker">${year} · #${p.rank} overall · #${p.catRank} ${bucketLabel[p.bucket]}</div>
          <h1>${p.name}</h1>
          <div class="pills">
            <span class="tag">${year}</span>
            <span class="tag">${bucketLabel[p.bucket]}</span>
            <span class="tag">${p.pos}</span>
            <span class="tag">${p.school}</span>
            <span class="tag">${p.ht} / ${p.wt} lbs</span>
            <span class="tag">Age ${p.age}</span>
          </div>
          <p class="lede">Feature drivers in this prototype card: ${p.features.join(", ")}. Real SHAP-style contributions land when the model is wired in.</p>
          <div class="cta-row">
            <a class="btn ghost" href="./board.html?year=${year}">Back to ${year} board</a>
          </div>
        </div>
        <div class="metrics">
          ${metricHtml("P(Hall of Fame)", p.pHof, false)}
          ${metricHtml("P(All-Star)", p.pAllStar, false)}
          ${metricHtml("P(All-NBA)", p.pAllNba, false)}
          ${metricHtml("P(Bust)", p.pBust, true)}
        </div>
      </section>
    </main>
    ${footer()}`;
  bindNav(root);
}

function renderSimple(root, active, title, kicker, html) {
  root.innerHTML = `${nav(active)}<main class="wrap section"><div class="kicker">${kicker}</div><h2>${title}</h2><div class="prose" style="margin-top:18px">${html}</div></main>${footer()}`;
  bindNav(root);
}

window.TR = {
  renderHome,
  renderBoard: (root) => loadYearHistory(parseYear()).then(() => renderBoard(root)),
  renderPlayer: (root) => {
    const y = Number(new URLSearchParams(location.search).get("year")) || currentYear();
    return loadYearHistory(y).then(() => renderPlayer(root));
  },
  renderSimple,
  renderDrafts,
  renderUpcoming
};
