const fmtPct = (n) => `${Math.round(n * 100)}%`;
const bucketLabel = { college: "College", "high-school": "High School", international: "International" };

function currentYear() {
  return TANK_RANK.currentYear;
}

function parseYear() {
  const y = Number(new URLSearchParams(location.search).get("year"));
  return TANK_RANK.drafts[y] ? y : currentYear();
}

function draftOf(year) {
  return TANK_RANK.drafts[year] || TANK_RANK.drafts[currentYear()];
}

function playersOf(year) {
  return [...(draftOf(year).players || [])].sort((a, b) => a.rank - b.rank);
}

function nav(active) {
  const y = currentYear();
  return `
    <style>
      .nav-toggle{display:none}
      @media (max-width:860px){
        .nav-toggle{display:inline-flex;margin-left:auto;padding:6px 12px;border:1px solid var(--line);border-radius:999px;color:var(--text);font-size:13px}
        .badge{display:none}
        .nav-inner{flex-wrap:wrap;height:auto;min-height:64px;padding:12px 0}
        .nav-links{display:none;width:100%;flex-direction:column;gap:4px;padding:4px 0 8px}
        .nav-links a{padding:10px 0}
        .nav.open .nav-links{display:flex}
      }
    </style>
    <header class="nav">
      <div class="wrap nav-inner">
        <a class="logo" href="./index.html">
          <img class="mark" src="./assets/mark.svg" width="28" height="28" alt="">
          <strong>The Draft Model</strong><span>${y}</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-label="Open menu">Menu</button>
        <nav class="nav-links">
          <a class="${active === "board" ? "active" : ""}" href="./board.html">Big Board</a>
          <a class="${active === "drafts" ? "active" : ""}" href="./drafts.html">Previous Drafts</a>
          <a class="${active === "method" ? "active" : ""}" href="./methodology.html">Methodology</a>
          <a class="${active === "rankings" ? "active" : ""}" href="./rankings.html">All Rankings</a>
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

function yearBar(year) {
  return `<div class="yearbar">
    ${TANK_RANK.years.map((y) =>
      `<a class="chip ${y === year ? "on" : ""}" href="./board.html?year=${y}">${y}${y === currentYear() ? " · live" : ""}</a>`
    ).join("")}
  </div>`;
}

function renderBoard(root) {
  const params = new URLSearchParams(location.search);
  const year = parseYear();
  const draft = draftOf(year);
  let bucket = params.get("bucket") || "all";
  let q = params.get("q") || "";
  document.title = `${year} NBA Draft Big Board | The Draft Model`;

  const apply = () => {
    let rows = playersOf(year);
    if (bucket !== "all") rows = rows.filter((p) => p.bucket === bucket);
    if (q) {
      const s = q.toLowerCase();
      rows = rows.filter((p) => p.name.toLowerCase().includes(s) || p.school.toLowerCase().includes(s));
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
    ${nav(year === currentYear() ? "board" : "drafts")}
    <main class="wrap section">
      <div class="banner">${TANK_RANK.disclaimer} ${draft.note || ""}</div>
      <div class="section-head">
        <div>
          <div class="kicker">${year === currentYear() ? "Living board" : "Archive board"}</div>
          <h2>${year} Top 300</h2>
          <p class="sub">Prototype slice shown. Full 100 / 100 / 100 arrives with the ranking engine.</p>
        </div>
      </div>
      ${yearBar(year)}
      <div class="toolbar">
        ${["all", ...TANK_RANK.buckets].map((b) =>
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
  const year = currentYear();
  const top = playersOf(year).slice(0, 8);
  document.title = `${year} NBA Draft Big Board & Prospect Rankings | The Draft Model`;
  root.innerHTML = `
    ${nav("home")}
    <main class="wrap">
      <section class="hero">
        <div>
          <div class="kicker">${year} NBA Draft</div>
          <h1>Probabilities,<br>not opinions.</h1>
          <p class="lede">An independent NBA draft big board for fans who want odds, not vibes. The Draft Model trains on decades of pre-draft profiles and actual NBA careers, then publishes transparent probabilities for Hall of Fame, All-Star, All-NBA, bust risk, and expected value.</p>
          <div class="cta-row">
            <a class="btn primary" href="./board.html">Open the ${year} board</a>
            <a class="btn ghost" href="./drafts.html">Previous drafts</a>
          </div>
        </div>
        <div class="stat-grid">
          <div class="stat-card"><b>300</b><span>Prospects across three buckets</span></div>
          <div class="stat-card"><b>100 / 100 / 100</b><span>College · High school · International</span></div>
          <div class="stat-card"><b>11</b><span>Draft classes on the site, ${year - 10}–${year}</span></div>
          <div class="stat-card"><b>Weekly</b><span>Target update cadence in season</span></div>
        </div>
      </section>
      <section class="section">
        <div class="section-head">
          <h2>${year} board preview</h2>
          <a class="sub" href="./board.html">See all →</a>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Rk</th><th>Player</th><th>Bucket</th><th>P(AS)</th><th>P(Bust)</th><th>Δ</th></tr></thead>
            <tbody>
              ${top.map((p) => `<tr onclick="location.href='./player.html?year=${year}&id=${p.id}'" style="cursor:pointer">
                <td class="rank">${String(p.rank).padStart(2,"0")}</td>
                <td><div class="name">${p.name}</div><div class="meta">${p.school}</div></td>
                <td><span class="tag">${bucketLabel[p.bucket]}</span></td>
                <td class="pct">${fmtPct(p.pAllStar)}</td>
                <td class="pct">${fmtPct(p.pBust)}</td>
                <td>${deltaHtml(p.delta)}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>
      <section class="section">
        <div class="grid-3">
          <article class="card"><div class="kicker">Thesis</div><h3>Data first</h3><p>Expert boards are consensus plus narrative. We map measurable pre-draft traits to what actually happened in the NBA.</p></article>
          <article class="card"><div class="kicker">Output</div><h3>Odds, not vibes</h3><p>Every player carries P(HOF), P(All-Star), P(All-NBA), bust risk, expected win shares, comps, and delta vs. consensus.</p></article>
          <article class="card"><div class="kicker">Archive</div><h3>Ten years back</h3><p>The same board format runs ${year - 10} through ${year}. Historical classes stay up so the model can be judged in public.</p></article>
        </div>
      </section>
    </main>
    ${footer()}`;
  bindNav(root);
}

function renderDrafts(root) {
  document.title = "NBA Draft Big Boards 2017–2026 | The Draft Model";
  const cards = TANK_RANK.years.filter((y) => y !== currentYear()).map((y) => {
    const d = draftOf(y);
    const top = playersOf(y)[0];
    return `<a class="year-card" href="./board.html?year=${y}">
      <div class="kicker">${d.label}</div>
      <h3>${y}</h3>
      <p>${top ? `#1 ${top.name}` : "Board incoming"}</p>
      <span class="sub">${d.players.length} prototype players →</span>
    </a>`;
  }).join("");

  root.innerHTML = `
    ${nav("drafts")}
    <main class="wrap section">
      <div class="kicker">Archive</div>
      <h2>Previous drafts</h2>
      <p class="sub" style="margin:12px 0 22px">Ten completed classes, ${currentYear() - 10}–${currentYear() - 1}. Numbers are placeholders until the engine is backfilled.</p>
      <div class="year-grid">${cards}</div>
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
      <section class="section">
        <div class="grid-3">
          <article class="card"><h3>${p.expWs.toFixed(1)}</h3><p>Expected career Win Shares (point estimate, prototype).</p></article>
          <article class="card"><h3>${deltaHtml(p.delta)}</h3><p>Spots above / below a blended expert consensus board.</p></article>
          <article class="card"><h3>${p.features[0]}</h3><p>Largest placeholder feature contribution for this profile.</p></article>
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

window.TR = { renderHome, renderBoard, renderPlayer, renderSimple, renderDrafts };
