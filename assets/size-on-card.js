(function () {
  function mul(m) { return "\u00d7" + Number(m).toFixed(2); }
  function toneMul(m) {
    if (m > 1.02) return "pos";
    if (m < 0.98) return "neg";
    return "";
  }
  function shiftWord(m) {
    if (m > 1.02) return "up";
    if (m < 0.98) return "down";
    return "even";
  }
  function css() {
    if (document.getElementById("size-on-card-css")) return;
    const s = document.createElement("style");
    s.id = "size-on-card-css";
    s.textContent =
      ".th-size{margin:4px 0 36px}" +
      ".th-size .kicker a{color:var(--lime);text-decoration:none}" +
      ".th-size-head{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin:0 0 10px}" +
      ".th-size-head h2{font-family:var(--serif);font-size:28px;font-weight:500;margin:0}" +
      ".th-size-note{color:var(--muted);font-size:13px;line-height:1.5;margin:0 0 18px;max-width:720px}" +
      ".th-bin{background:var(--bg-2);border:1px solid var(--line);border-radius:16px;padding:18px 20px;margin:0 0 14px}" +
      ".th-bin .who{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:baseline;margin:0 0 8px}" +
      ".th-bin .who b{font-family:var(--serif);font-size:22px;font-weight:500}" +
      ".th-bin .who span{color:var(--muted);font-size:13px}" +
      ".th-bin .apply{color:var(--cream,#e8e4d9);font-size:14px;line-height:1.5;margin:0 0 14px;max-width:680px}" +
      ".th-bin table{width:100%;max-width:420px;border-collapse:collapse;font-size:13px}" +
      ".th-bin th{text-align:left;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:500;padding:4px 8px 8px 0}" +
      ".th-bin td{padding:6px 8px 6px 0;border-top:1px solid var(--line)}" +
      ".th-bin td.num,.th-bin th.num{text-align:right;font-variant-numeric:tabular-nums}" +
      ".th-bin .pos{color:var(--lime)}" +
      ".th-bin .neg{color:var(--coral)}" +
      ".th-bin .empty{color:var(--muted);font-size:13px;margin:0}" +
      ".th-bin .more{margin:14px 0 0;font-size:12px}" +
      ".th-bin .more a{color:var(--lime);text-decoration:none}";
    document.head.appendChild(s);
  }
  function effectRow(label, m) {
    return "<tr>" +
      "<td>" + label + "</td>" +
      "<td class=\"" + toneMul(m) + "\">" + shiftWord(m) + "</td>" +
      "<td class=\"num " + toneMul(m) + "\">" + mul(m) + "</td>" +
      "</tr>";
  }
  function applyCopy(kind, measured, bin) {
    const n = bin.n.toLocaleString("en-US");
    if (kind === "Height") {
      return "He measured <b>" + measured + "</b> on draft night. Historically, listed draftees in the <b>" +
        bin.label + "</b> band (n = " + n + ") move the projection " +
        shiftWord(bin.mAs) + " for All-Star (" + mul(bin.mAs) + "), " +
        shiftWord(bin.mNba) + " for All-NBA (" + mul(bin.mNba) + "), " +
        shiftWord(bin.mHof) + " for Hall of Fame (" + mul(bin.mHof) + "), and " +
        shiftWord(bin.mMvp) + " for MVP (" + mul(bin.mMvp) + "). That is the height adjustment on this pick only.";
    }
    return "He weighed <b>" + measured + "</b>. Historically, listed draftees at <b>" +
      bin.label + "</b> (n = " + n + ") move the projection " +
      shiftWord(bin.mAs) + " for All-Star (" + mul(bin.mAs) + "), " +
      shiftWord(bin.mNba) + " for All-NBA (" + mul(bin.mNba) + "), " +
      shiftWord(bin.mHof) + " for Hall of Fame (" + mul(bin.mHof) + "), and " +
      shiftWord(bin.mMvp) + " for MVP (" + mul(bin.mMvp) + "). That is the weight adjustment on this pick only.";
  }
  function binCard(kind, measured, bin) {
    if (!bin) {
      return '<div class="th-bin"><div class="who"><b>' + kind + "</b></div>" +
        '<p class="empty">No listed or combine ' + kind.toLowerCase() + " on draft night, so size does not move this pick.</p></div>";
    }
    return '<div class="th-bin">' +
      '<div class="who"><b>' + kind + " " + measured + "</b>" +
      "<span>his bin: " + bin.label + " \u00b7 n = " + bin.n.toLocaleString("en-US") + "</span></div>" +
      '<p class="apply">' + applyCopy(kind, measured, bin) + "</p>" +
      '<div class="table-wrap"><table><thead><tr>' +
      "<th></th><th>This player</th><th class=\"num\">Applied</th>" +
      "</tr></thead><tbody>" +
      effectRow("All-Star", bin.mAs) +
      effectRow("All-NBA", bin.mNba) +
      effectRow("Hall of Fame", bin.mHof) +
      effectRow("MVP", bin.mMvp) +
      "</tbody></table></div>" +
      '<p class="more"><a href="./size.html">Full ' + kind.toLowerCase() + " table on /size</a></p></div>";
  }
  function paintSize(root, feat) {
    if (!TR.Size || !root) return;
    css();
    feat = feat || window.__TDM_SIZE_FEAT || {};
    window.__TDM_SIZE_FEAT = feat;
    const found = TR.Size.lookup(feat || {});
    const old = root.querySelector(".th-size");
    if (old) old.remove();
    const sec = document.createElement("section");
    sec.className = "section th-size";
    const htLabel = (feat && feat.ht) ? feat.ht : "\u2014";
    const wtLabel = (feat && feat.wt != null && feat.wt !== "") ? (feat.wt + " lbs") : "\u2014";
    sec.innerHTML =
      '<div class="th-size-head"><h2>You can\'t teach size</h2>' +
      '<div class="kicker"><a href="./size.html">/size</a></div></div>' +
      '<p class="th-size-note">Only this player\u2019s height and weight. The other bins live on the size page.</p>' +
      binCard("Height", htLabel, found.height) +
      binCard("Weight", wtLabel, found.weight);
    const theories = root.querySelector(".th-player");
    const hero = root.querySelector(".player-hero");
    if (theories && theories.parentNode) theories.parentNode.insertBefore(sec, theories.nextSibling);
    else if (hero && hero.parentNode) hero.parentNode.insertBefore(sec, hero.nextSibling);
    else root.appendChild(sec);
  }

  function hookModel() {
    const proj = window.TR && (TR.projectPlayer || (TR.Model && TR.Model.project));
    if (typeof proj !== "function" || proj.__sizeHooked) return;
    function wrapped(p, feat, priors) {
      const full = proj(p, feat, priors);
      if (!TR.Size || !full || !full.steps) return full;
      const hasWt = full.steps.some(function (s) { return s.id === "weight"; });
      if (hasWt) return full;
      const found = TR.Size.lookup(Object.assign({}, feat || {}, (full.feat || {})));
      if (!found.weight) return full;
      const w = found.weight;
      full.steps.push({
        id: "weight", label: "Weight", value: (found.wt || "") + " lbs \u00b7 " + w.label,
        mAs: w.mAs, mNba: w.mNba, mHof: w.mHof, mMvp: w.mMvp, mYrs: 1,
        why: "From /size weight buckets.", href: "./size.html"
      });
      full.mAs *= w.mAs; full.mNba *= w.mNba; full.mHof *= w.mHof; full.mMvp *= w.mMvp;
      return full;
    }
    wrapped.__sizeHooked = true;
    TR.projectPlayer = wrapped;
    if (TR.Model) TR.Model.project = wrapped;
  }

  hookModel();
  window.TR = window.TR || {};
  TR.paintSize = paintSize;

  const origRender = window.TR && TR.renderPlayer;
  if (typeof origRender === "function" && !origRender.__sizePainted) {
    TR.renderPlayer = function (root) {
      const y = Number(new URLSearchParams(location.search).get("year")) || (window.TANK_RANK && TANK_RANK.currentYear);
      const id = new URLSearchParams(location.search).get("id");
      return Promise.resolve(origRender(root)).then(function () {
        const draft = window.TANK_RANK && TANK_RANK.drafts[y];
        if (!draft || !root) return;
        const list = draft.players || [];
        let p = list.find(function (x) { return x.id === id; }) || list[0];
        const feat = Object.assign({}, (p && p.theoryFeat) || {}, p || {});
        paintSize(root, feat);
      });
    };
    TR.renderPlayer.__sizePainted = true;
  }
})();
