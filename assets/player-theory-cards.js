(function () {
  var CLAIM = {
    age: "The younger guy at the same pick is the better bet",
    onedone: "One year of college is enough if you are a star",
    intl: "Foreign players are a different kind of bet",
    stash: "Leave a raw foreign player overseas until he is ready",
    size: "Taller guys perform better",
    height: "Taller guys perform better",
    weight: "Heavier guys perform better",
    handle: "Tall guys who can dribble are rare",
    wingspan: "Longer arms help",
    reach: "Higher standing reach helps"
  };
  function css() {
    if (document.getElementById("player-theory-cards-css")) return;
    var s = document.createElement("style");
    s.id = "player-theory-cards-css";
    s.textContent =
      ".th-ledger{display:none!important}" +
      ".th-size{display:none!important}" +
      ".th-apply{margin:4px 0 36px}.th-apply .kicker{margin:0 0 14px}" +
      ".th-bin{background:var(--bg-2);border:1px solid var(--line);border-radius:16px;padding:18px 20px;margin:0 0 14px}" +
      ".th-bin .who{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:baseline;margin:0 0 12px}" +
      ".th-bin .who b{font-family:var(--serif);font-size:22px;font-weight:500}" +
      ".th-bin .who span{color:var(--muted);font-size:13px}" +
      ".th-bin table{width:100%;max-width:420px;border-collapse:collapse;font-size:13px}" +
      ".th-bin th{text-align:left;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:500;padding:4px 8px 8px 0}" +
      ".th-bin td{padding:6px 8px 6px 0;border-top:1px solid var(--line)}" +
      ".th-bin td.num,.th-bin th.num{text-align:right;font-variant-numeric:tabular-nums}" +
      ".th-bin .pos{color:var(--lime)}.th-bin .neg{color:var(--coral)}" +
      ".th-bin .more{margin:14px 0 0;font-size:12px}" +
      ".th-bin .more a{color:var(--lime);text-decoration:none}";
    document.head.appendChild(s);
  }
  function moved(s) {
    return Math.abs((s.mAs || 1) - 1) >= 0.02
      || Math.abs((s.mNba || 1) - 1) >= 0.02
      || Math.abs((s.mHof || 1) - 1) >= 0.02
      || Math.abs((s.mMvp || 1) - 1) >= 0.02;
  }
  function keep(s) {
    if (!s || s.id === "slot") return false;
    var val = String(s.value || "");
    if (val === "-" || val === "missing" || val === "unknown") return false;
    if (s.id === "age" || s.id === "size" || s.id === "height" || s.id === "weight") return true;
    return moved(s);
  }
  function mul(m) { return "\u00d7" + Number(m == null ? 1 : m).toFixed(2); }
  function tone(m) {
    m = Number(m == null ? 1 : m);
    if (m > 1.02) return "pos";
    if (m < 0.98) return "neg";
    return "";
  }
  function word(m) {
    m = Number(m == null ? 1 : m);
    if (m > 1.02) return "up";
    if (m < 0.98) return "down";
    return "even";
  }
  function row(label, m) {
    return "<tr><td>" + label + '</td><td class="' + tone(m) + '">' + word(m) + '</td><td class="num ' + tone(m) + '">' + mul(m) + "</td></tr>";
  }
  function card(s) {
    var title = CLAIM[s.id] || s.label || s.id;
    var fact = (s.value && s.value !== "-" && s.value !== "missing") ? String(s.value) : "";
    var href = s.href ? '<p class="more"><a href="' + s.href + '">' + title + "</a></p>" : "";
    return '<div class="th-bin"><div class="who"><b>' + title + "</b>" +
      (fact ? "<span>" + fact + "</span>" : "") + "</div>" +
      '<table><thead><tr><th></th><th>This player</th><th class="num">Applied</th></tr></thead><tbody>' +
      row("All-Star", s.mAs) + row("All-NBA", s.mNba) + row("Hall of Fame", s.mHof) + row("MVP", s.mMvp) +
      "</tbody></table>" + href + "</div>";
  }
  function restyle(root) {
    css();
    var y = Number(new URLSearchParams(location.search).get("year"));
    var id = new URLSearchParams(location.search).get("id");
    var draft = window.TANK_RANK && TANK_RANK.drafts[y];
    if (!draft || !root) return;
    var list = draft.players || [];
    var p = list.find(function (x) { return x.id === id; }) || list[0];
    if (!p || !p.proj) return;
    var box = root.querySelector(".th-player");
    if (!box) return;
    box.className = "section th-player th-apply";
    box.innerHTML = '<div class="kicker">Theories</div>' + (p.proj.steps || []).filter(keep).map(card).join("");
    var size = root.querySelector(".th-size");
    if (size) size.remove();
  }
  var prev = window.TR && TR.renderPlayer;
  if (typeof prev === "function") {
    TR.renderPlayer = function (root) {
      return Promise.resolve(prev.apply(this, arguments)).then(function () {
        restyle(root);
      });
    };
  }
})();
