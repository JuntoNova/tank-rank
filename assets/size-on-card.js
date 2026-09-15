(function () {
  function pct(x) { return (x * 100).toFixed(1) + "%"; }
  function pp(x) {
    if (x == null || Math.abs(x) < 0.05) return "0.0";
    return (x > 0 ? "+" : "\u2212") + Math.abs(x).toFixed(1);
  }
  function mul(m) { return "\u00d7" + Number(m).toFixed(2); }
  function tone(v) {
    if (v > 0.05) return "pos";
    if (v < -0.05) return "neg";
    return "";
  }
  function toneMul(m) {
    if (m > 1.02) return "pos";
    if (m < 0.98) return "neg";
    return "";
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
      ".th-size-note{color:var(--muted);font-size:13px;line-height:1.5;margin:0 0 18px;max-width:760px}" +
      ".th-bin{background:var(--bg-2);border:1px solid var(--line);border-radius:16px;padding:16px 18px;margin:0 0 14px}" +
      ".th-bin .who{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:baseline;margin:0 0 8px}" +
      ".th-bin .who b{font-family:var(--serif);font-size:22px;font-weight:500}" +
      ".th-bin .who span{color:var(--muted);font-size:13px}" +
      ".th-bin .apply{color:var(--cream,#e8e4d9);font-size:13px;line-height:1.45;margin:0 0 12px;max-width:720px}" +
      ".th-bin table{width:100%;border-collapse:collapse;font-size:13px}" +
      ".th-bin th{text-align:left;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:500;padding:4px 8px 8px 0}" +
      ".th-bin td{padding:6px 8px 6px 0;border-top:1px solid var(--line)}" +
      ".th-bin td.num,.th-bin th.num{text-align:right;font-variant-numeric:tabular-nums}" +
      ".th-bin tr.you td{background:rgba(216,255,62,.06)}" +
      ".th-bin .pos{color:var(--lime)}" +
      ".th-bin .neg{color:var(--coral)}" +
      ".th-bin .empty{color:var(--muted);font-size:13px;margin:0}" +
      ".th-bin .subk{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:16px 0 8px}";
    document.head.appendChild(s);
  }
  function row(label, bin, key, dKey, mKey) {
    const base = TR.Size.BASE[key];
    return "<tr>" +
      "<td>" + label + "</td>" +
      "<td class=\"num\">" + pct(bin[key]) + "</td>" +
      "<td class=\"num\">" + pct(base) + "</td>" +
      "<td class=\"num " + tone(bin[dKey]) + "\">" + pp(bin[dKey]) + "</td>" +
      "<td class=\"num " + toneMul(bin[mKey]) + "\">" + mul(bin[mKey]) + "</td>" +
      "</tr>";
  }
  function verb(m, label) {
    if (m > 1.02) return "raises " + label + " by " + mul(m);
    if (m < 0.98) return "cuts " + label + " by " + mul(m);
    return "leaves " + label + " flat";
  }
  function applyLine(kind, measured, bin) {
    return kind + " " + measured + " sits in <b>" + bin.label + "</b> (n = " +
      bin.n.toLocaleString("en-US") + " of 3,074 listed draftees, 1947\u20132018). " +
      "That bin " + verb(bin.mAs, "All-Star") + ", " + verb(bin.mNba, "All-NBA") +
      ", " + verb(bin.mHof, "Hall of Fame") + ", and " + verb(bin.mMvp, "MVP") +
      ". Applied is the shrink of the raw residual so size cannot outrank the pick.";
  }
  function allRows(list, active, cols) {
    return list.map(function (b) {
      const you = active && b.label === active.label;
      const cells = cols.map(function (c) {
        if (c === "label") return "<td>" + (you ? "<b>" + b.label + "</b> \u00b7 this pick" : b.label) + "</td>";
        if (c === "n") return "<td class=\"num\">" + b.n.toLocaleString("en-US") + "</td>";
        if (c === "as") return "<td class=\"num\">" + pct(b.as) + "</td>";
        if (c === "dAs") return "<td class=\"num " + tone(b.dAs) + "\">" + pp(b.dAs) + "</td>";
        if (c === "nba") return "<td class=\"num\">" + pct(b.nba) + "</td>";
        if (c === "dNba") return "<td class=\"num " + tone(b.dNba) + "\">" + pp(b.dNba) + "</td>";
        if (c === "hof") return "<td class=\"num\">" + pct(b.hof) + "</td>";
        if (c === "dHof") return "<td class=\"num " + tone(b.dHof) + "\">" + pp(b.dHof) + "</td>";
        if (c === "mvp") return "<td class=\"num\">" + pct(b.mvp) + "</td>";
        if (c === "dMvp") return "<td class=\"num " + tone(b.dMvp) + "\">" + pp(b.dMvp) + "</td>";
        return "<td></td>";
      }).join("");
      return "<tr class=\"" + (you ? "you" : "") + "\">" + cells + "</tr>";
    }).join("");
  }
  function binCard(kind, measured, bin, list) {
    if (!bin) {
      return '<div class="th-bin"><div class="who"><b>' + kind + "</b></div>" +
        '<p class="empty">No listed or combine ' + kind.toLowerCase() + " on draft night, so /size does not move this pick.</p></div>";
    }
    const n = bin.n.toLocaleString("en-US");
    return '<div class="th-bin">' +
      '<div class="who"><b>' + kind + " " + measured + "</b>" +
      "<span>bin " + bin.label + " \u00b7 n = " + n + "</span></div>" +
      '<p class="apply">' + applyLine(kind, measured, bin) + "</p>" +
      '<div class="table-wrap"><table><thead><tr>' +
      "<th></th><th class=\"num\">This bin</th><th class=\"num\">Draft base</th><th class=\"num\">\u0394</th><th class=\"num\">Applied</th>" +
      "</tr></thead><tbody>" +
      row("All-Star", bin, "as", "dAs", "mAs") +
      row("All-NBA", bin, "nba", "dNba", "mNba") +
      row("Hall of Fame", bin, "hof", "dHof", "mHof") +
      row("MVP", bin, "mvp", "dMvp", "mMvp") +
      "</tbody></table></div>" +
      '<div class="subk">Same table as /size</div>' +
      '<div class="table-wrap"><table><thead><tr>' +
      "<th>" + kind + "</th><th class=\"num\">n</th><th class=\"num\">AS</th><th class=\"num\">\u0394 AS</th>" +
      "<th class=\"num\">All-NBA</th><th class=\"num\">\u0394 NBA</th><th class=\"num\">HOF</th><th class=\"num\">\u0394 HOF</th>" +
      "<th class=\"num\">MVP</th><th class=\"num\">\u0394 MVP</th>" +
      "</tr></thead><tbody>" +
      allRows(list, bin, ["label","n","as","dAs","nba","dNba","hof","dHof","mvp","dMvp"]) +
      "</tbody></table></div></div>";
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
      '<p class="th-size-note">Listed size, picks 1\u201360, 1947\u20132018, n = 3,074. Base is the average draftee in that sample. \u0394 is percentage points versus that base. Applied is the shrink of that residual onto this pick \u2014 size can move the projection, it cannot outrank the slot. Same bins as the size page.</p>' +
      binCard("Height", htLabel, found.height, TR.Size.HT) +
      binCard("Weight", wtLabel, found.weight, TR.Size.WT);
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
})();
