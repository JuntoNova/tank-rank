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

function draftOf(year) {
  return TANK_RANK.drafts[year] || TANK_RANK.drafts[currentYear()] || { year, players: [] };
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
  document.title = `${year} NBA Draft Big Board | The Draft Model`;

  const apply = () => {
    let rows = playersOf(year);
    if (bucket !== "all") rows = rows.filter((p) => p.bucket === bucket);
    if (q) {
      const s = q.toLowerCase();
      rows = rows.filter((p) => p.name.toLowerCase().includes(s) || (p.school || "").toLowerCase().includes(s));
    }
    root.querySelector("#rows").innerHTML = rows.map((p) => `
      <tr onclick="location.href='./player.html?year=${year}&id=${p.id}'" style="cursor:pointer">
        <td class="rank">${String(p.rank).padStart(2, "0")}</td>
        <td>
          <div class="name">${p.name}</div>
          <div class="meta">${p.pos} · ${p.school} · ${p.ht}</div>
        </td>
        <td><span class="tag">${bucketLabel[p.bucket]}</span></td>
        <td class="pct">${fmtPct(p.pHof)}</td>
        <td class="pct">${fmtPct(p.pAllStar)}</td>
        <td class="pct">${fmtPct(p.pAllNba)}</td>
        <td class="pct">${fmtPct(p.pBust)}</td>
        <td class="pct">${p.expWs.toFixed(1)}</td>
        <td>${deltaHtml(p.delta)}</td>
      </tr>`).join("") || `<tr><td colspan="9" style="color:var(--muted);padding:24px">No players match.</td></tr>`;
  };

  root.innerHTML = `
    ${nav(year >= currentYear() ? "upcoming" : "drafts")}
    <main class="wrap section">
      <div class="banner">${TANK_RANK.disclaimer} ${draft.note || ""}</div>
      <div class="section-head">
        <div>
          <div class="kicker">${year === currentYear() ? "Living board" : year > currentYear() ? "Upcoming class" : year <= 1949 ? "BAA draft" : "Historic draft"}</div>
          <h2>${year} draft</h2>
          <p class="sub">${year >= currentYear() ? `<a href="./upcoming.html">All upcoming drafts</a>` : `<a href="./drafts.html">All historic drafts</a>`}</p>
        </div>
      </div>
      <div class="toolbar">
        ${["all", ...available].map((b) =>
          `<button class="chip ${bucket === b ? "on" : ""}" data-bucket="${b}">${b === "all" ? "All" : bucketLabel[b]}</button>`
        ).join("")}
        <input class="search" id="q" placeholder="Search player or school" value="${q}">
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rk</th><th>Player</th><th>Bucket</th>
              <th>P(HOF)</th><th>P(AS)</th><th>P(All-NBA)</th><th>P(Bust)</th>
              <th>Exp WS</th><th>Δ vs cons.</th>
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
      <div class="kicker">The Draft Model</div>
      <h1>Probabilities,<br>not opinions.</h1>
      <p class="lede">Upcoming boards and completed drafts. That is the whole front door.</p>
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

function renderDrafts(root) {
  document.title = `NBA Draft History ${TANK_RANK.firstYear}–2026 | The Draft Model`;
  const archive = TANK_RANK.historicYears || TANK_RANK.years.filter((y) => y < currentYear());
  const decades = [...new Set(archive.map((y) => Math.floor(y / 10) * 10))];
  const decadeBlocks = decades.map((dec) => {
    const years = archive.filter((y) => Math.floor(y / 10) * 10 === dec);
    return `<section class="decade" data-decade="${dec}">
      <div class="decade-head">${dec}s</div>
      <div class="year-grid">${years.map(yearCard).join("")}</div>
    </section>`;
  }).join("");

  root.innerHTML = `
    ${nav("drafts")}
    <main class="wrap section">
      <div class="kicker">Historic only</div>
      <h2>Every completed draft</h2>
      <p class="sub" style="margin:12px 0 22px">${archive.length} classes, 1947–2026. Upcoming classes live on <a href="./upcoming.html">Upcoming</a>.</p>
      ${decadeBlocks}
    </main>
    ${footer()}`;
  bindNav(root);
}

function renderUpcoming(root) {
  document.title = "Upcoming NBA Drafts 2027–2029 | The Draft Model";
  const years = TANK_RANK.futureYears || [2027, 2028, 2029];
  root.innerHTML = `
    ${nav("upcoming")}
    <main class="wrap section">
      <div class="kicker">Future classes</div>
      <h2>2027, 2028, 2029</h2>
      <p class="sub" style="margin:12px 0 22px">Living and upcoming boards. Completed drafts stay on <a href="./drafts.html">Historic</a>.</p>
      <div class="year-grid">${years.map(yearCard).join("")}</div>
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
    ${nav(year >= currentYear() ? "upcoming" : "drafts")}
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

window.TR = { renderHome, renderBoard, renderPlayer, renderSimple, renderDrafts, renderUpcoming };
