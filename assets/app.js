const fmtPct = (n) => `${Math.round(n * 100)}%`;
const bucketLabel = { college: "College", "high-school": "High School", international: "International" };

function nav(active) {
  return `
    <header class="nav">
      <div class="wrap nav-inner">
        <a class="logo" href="./index.html"><strong>The Draft Model</strong><span>2026</span></a>
        <nav class="nav-links">
          <a class="${active === "board" ? "active" : ""}" href="./board.html">Big Board</a>
          <a class="${active === "method" ? "active" : ""}" href="./methodology.html">Methodology</a>
          <a class="${active === "rankings" ? "active" : ""}" href="./rankings.html">All Rankings</a>
          <a class="${active === "about" ? "active" : ""}" href="./about.html">About</a>
        </nav>
        <span class="badge">Prototype</span>
      </div>
    </header>`;
}

function footer() {
  return `<footer class="wrap">
    <div class="foot">
      <div class="copy">
        <div><b>© 2026 Junto Nova</b></div>
        <div>The Draft Model is a DBA of Junto Nova.</div>
        <div>Probabilities, not opinions. · Updated ${TANK_RANK.updated} · v${TANK_RANK.version}</div>
      </div>
      <nav class="foot-links">
        <a href="./terms.html">Terms</a>
        <a href="./privacy.html">Privacy</a>
        <a href="https://x.com/jandrewclark" target="_blank" rel="noopener noreferrer">X</a>
        <a href="mailto:andrew@juntonova.com">andrew@juntonova.com</a>
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

function renderBoard(root) {
  const params = new URLSearchParams(location.search);
  let bucket = params.get("bucket") || "all";
  let q = params.get("q") || "";

  const apply = () => {
    let rows = [...TANK_RANK.players].sort((a, b) => a.rank - b.rank);
    if (bucket !== "all") rows = rows.filter((p) => p.bucket === bucket);
    if (q) {
      const s = q.toLowerCase();
      rows = rows.filter((p) => p.name.toLowerCase().includes(s) || p.school.toLowerCase().includes(s));
    }
    root.querySelector("#rows").innerHTML = rows.map((p) => `
      <tr onclick="location.href='./player.html?id=${p.id}'" style="cursor:pointer">
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
    ${nav("board")}
    <main class="wrap section">
      <div class="banner">${TANK_RANK.disclaimer}</div>
      <div class="section-head">
        <div>
          <div class="kicker">Living board</div>
          <h2>The Draft Model Top 300</h2>
          <p class="sub">Prototype slice shown. Full 100 / 100 / 100 arrives with the ranking engine.</p>
        </div>
      </div>
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
  apply();
}

function renderHome(root) {
  const top = [...TANK_RANK.players].sort((a, b) => a.rank - b.rank).slice(0, 8);
  root.innerHTML = `
    ${nav("home")}
    <main class="wrap">
      <section class="hero">
        <div>
          <div class="kicker">NBA rankings without the narrative</div>
          <h1>Probabilities,<br>not opinions.</h1>
          <p class="lede">The Draft Model trains on decades of pre-draft profiles and actual NBA careers — then publishes transparent odds for HOF, All-Star, All-NBA, bust risk, and expected value.</p>
          <div class="cta-row">
            <a class="btn primary" href="./board.html">Open the 2026 board</a>
            <a class="btn ghost" href="./methodology.html">Read the methodology</a>
          </div>
        </div>
        <div class="stat-grid">
          <div class="stat-card"><b>300</b><span>Prospects across three buckets</span></div>
          <div class="stat-card"><b>100 / 100 / 100</b><span>College · High school · International</span></div>
          <div class="stat-card"><b>5</b><span>Probability targets per player</span></div>
          <div class="stat-card"><b>Weekly</b><span>Target update cadence in season</span></div>
        </div>
      </section>
      <section class="section">
        <div class="section-head">
          <h2>Board preview</h2>
          <a class="sub" href="./board.html">See all →</a>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Rk</th><th>Player</th><th>Bucket</th><th>P(AS)</th><th>P(Bust)</th><th>Δ</th></tr></thead>
            <tbody>
              ${top.map((p) => `<tr onclick="location.href='./player.html?id=${p.id}'" style="cursor:pointer">
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
          <article class="card"><div class="kicker">Roadmap</div><h3>Then everything else</h3><p>Same engine, year-round: shoes, GMs, courts, historical classes — automated graphics and a commerce loop.</p></article>
        </div>
      </section>
    </main>
    ${footer()}`;
}

function renderPlayer(root) {
  const id = new URLSearchParams(location.search).get("id");
  const p = TANK_RANK.players.find((x) => x.id === id) || TANK_RANK.players[0];
  root.innerHTML = `
    ${nav("board")}
    <main class="wrap">
      <div class="banner">${TANK_RANK.disclaimer}</div>
      <section class="player-hero">
        <div>
          <div class="kicker">#${p.rank} overall · #${p.catRank} ${bucketLabel[p.bucket]}</div>
          <h1>${p.name}</h1>
          <div class="pills">
            <span class="tag">${bucketLabel[p.bucket]}</span>
            <span class="tag">${p.pos}</span>
            <span class="tag">${p.school}</span>
            <span class="tag">${p.ht} / ${p.wt} lbs</span>
            <span class="tag">Age ${p.age}</span>
          </div>
          <p class="lede">Feature drivers in this prototype card: ${p.features.join(", ")}. Real SHAP-style contributions land when the model is wired in.</p>
        </div>
        <div class="metrics">
          ${
            [
              ["P(Hall of Fame)", p.pHof, false],
              ["P(All-Star)", p.pAllStar, false],
              ["P(All-NBA)", p.pAllNba, false],
              ["P(Bust)", p.pBust, true]
            ].map(([label, val, risk]) => `
            <div class="metric">
              <label>${label}</label>
              <b>${fmtPct(val)}</b>
              <div class="bar ${risk ? "risk" : ""}"><i style="width:${Math.round(val*100)}%"></i></div>
            </div>`).join("")}
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
}

function renderSimple(root, active, title, kicker, html) {
  root.innerHTML = `${nav(active)}<main class="wrap section"><div class="kicker">${kicker}</div><h2>${title}</h2><div class="prose" style="margin-top:18px">${html}</div></main>${footer()}`;
}

window.TR = { renderHome, renderBoard, renderPlayer, renderSimple };
