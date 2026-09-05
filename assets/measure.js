(function () {
  const FILES = [
    "./assets/measurements-listed.json?v=38",
    "./assets/measurements-combine.json?v=38"
  ];
  function dash(v) { return (v === 0 || v) ? String(v) : "\u2014"; }
  function toInches(ht) {
    const m = String(ht || "").trim().match(/^(\d+)-(\d+(?:\.\d+)?)$/);
    if (!m) return null;
    return Number(m[1]) * 12 + Number(m[2]);
  }
  function fmtIn(n) {
    if (n == null || Number.isNaN(n)) return "\u2014";
    const sign = n > 0 ? "+" : "";
    const whole = Math.round(n * 4) / 4;
    return sign + whole + " in";
  }
  function apply(map) {
    if (!map || !window.TANK_RANK) return;
    Object.keys(TANK_RANK.drafts || {}).forEach((ys) => {
      const year = Number(ys);
      const draft = TANK_RANK.drafts[year];
      (draft.players || []).forEach((p) => {
        const byPick = map[year + "-" + p.rank];
        const byName = map[year + ":" + String(p.name || "").toLowerCase()];
        const m = byPick || byName;
        if (!m) return;
        if (m.src === "listed") {
          if (m.ht) { p.htListed = m.ht; if (!p.ht) p.ht = m.ht; }
          if (m.wt) { p.wtListed = m.wt; if (!p.wt) p.wt = m.wt; }
        } else if (m.src === "combine") {
          if (m.ht) p.htCombine = m.ht;
          if (m.wt) p.wtCombine = m.wt;
          if (m.wsp) p.wsp = m.wsp;
          if (m.reach) p.reach = m.reach;
          if (m.ht && !p.ht) p.ht = m.ht;
          if (m.wt && !p.wt) p.wt = m.wt;
        } else {
          if (m.ht) p.ht = m.ht;
          if (m.wt) p.wt = m.wt;
          if (m.wsp) p.wsp = m.wsp;
          if (m.reach) p.reach = m.reach;
        }
        if (m.src) p.sizeSrc = m.src;
      });
    });
  }
  function load() {
    if (TANK_RANK._measures) {
      apply(TANK_RANK._measures);
      return Promise.resolve();
    }
    return Promise.all(FILES.map((f) => fetch(f).then((r) => (r.ok ? r.json() : {})).catch(() => ({}))))
      .then((parts) => {
        TANK_RANK._measures = Object.assign({}, ...parts);
        apply(TANK_RANK._measures);
      });
  }
  function cell(label, value) {
    return "<div><label>" + label + "</label><b>" + value + "</b></div>";
  }
  function paintSize() {
    const params = new URLSearchParams(location.search);
    const year = Number(params.get("year")) || (window.TANK_RANK && TANK_RANK.currentYear);
    const id = params.get("id");
    const draft = TANK_RANK.drafts && TANK_RANK.drafts[year];
    if (!draft) return;
    const p = (draft.players || []).find((x) => x.id === id) || draft.players[0];
    if (!p) return;
    const htIn = toInches(p.htListed || p.ht);
    const wspIn = toInches(p.wsp);
    const listedIn = toInches(p.htListed);
    const combIn = toInches(p.htCombine);
    const wt = Number(p.wtListed || p.wt) || 0;
    const ape = (wspIn != null && htIn != null) ? fmtIn(wspIn - htIn) : "\u2014";
    const vs = (listedIn != null && combIn != null) ? fmtIn(combIn - listedIn) : "\u2014";
    const wpi = (wt && htIn) ? (wt / htIn).toFixed(2) : "\u2014";
    const pills = document.querySelector(".pills");
    if (pills) {
      pills.querySelectorAll("[data-size]").forEach((el) => el.remove());
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.setAttribute("data-size", "1");
      tag.textContent = (p.ht || "\u2014") + " / " + (p.wt ? p.wt + " lbs" : "\u2014");
      pills.appendChild(tag);
      if (p.sizeSrc || p.ht || p.wt) {
        const s = document.createElement("span");
        s.className = "tag";
        s.setAttribute("data-size", "1");
        s.textContent = p.sizeSrc === "combine" ? "Combine" : (p.ht || p.wt ? "Listed" : "");
        if (s.textContent) pills.appendChild(s);
      }
    }
    let box = document.getElementById("size-box");
    if (!box) {
      box = document.createElement("div");
      box.id = "size-box";
      box.className = "size-box";
      const hero = document.querySelector(".player-hero > div");
      if (hero) hero.appendChild(box);
    }
    box.innerHTML = "<div class=\"size-grid\">" +
      cell("Height", dash(p.ht)) +
      cell("Weight", p.wt ? p.wt + " lbs" : "\u2014") +
      cell("Wingspan", dash(p.wsp)) +
      cell("Standing reach", dash(p.reach)) +
      cell("Wingspan \u2212 height", ape) +
      cell("Combine vs listed", vs) +
      cell("Lbs / inch", wpi) +
      cell("Source", p.sizeSrc === "combine" ? "Combine" : (p.ht || p.wt ? "Listed" : "\u2014")) +
      "</div>";
  }
  if (!document.getElementById("size-css")) {
    const css = document.createElement("style");
    css.id = "size-css";
    css.textContent = ".size-box{margin-top:22px}.size-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.size-grid div{background:var(--bg-2);border:1px solid var(--line);border-radius:14px;padding:12px 14px}.size-grid label{display:block;color:var(--muted);font-size:11px;letter-spacing:.12em;text-transform:uppercase}.size-grid b{font-family:var(--mono);font-size:18px}@media (max-width:860px){.size-grid{grid-template-columns:1fr 1fr}}";
    document.head.appendChild(css);
  }
  const orig = window.TR && TR.renderPlayer;
  if (typeof orig === "function") {
    TR.renderPlayer = function () {
      const r = orig.apply(this, arguments);
      if (r && typeof r.then === "function") return r.then((x) => load().then(paintSize).then(() => x));
      load().then(paintSize);
      return r;
    };
  }
  const origBoard = window.TR && TR.renderBoard;
  if (typeof origBoard === "function") {
    TR.renderBoard = function () {
      const r = origBoard.apply(this, arguments);
      if (r && typeof r.then === "function") return r.then((x) => { load(); return x; });
      load();
      return r;
    };
  }
  document.addEventListener("DOMContentLoaded", function () { load().then(paintSize); });
})();
