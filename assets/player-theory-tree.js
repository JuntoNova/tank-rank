(function () {
  var TREE = [
    {
      label: "You can't teach size",
      kids: [
        {
          name: "Height",
          kids: [
            { id: "inch", name: "Every extra inch helps" }
          ]
        },
        {
          name: "Weight",
          kids: [
            { id: "weight", name: "Heavier guys perform better" },
            { id: "wpi", name: "More pounds per inch helps" }
          ]
        },
        {
          name: "Length",
          kids: [
            { id: "wingspan", name: "Longer arms help" },
            { id: "ape", name: "Arms longer than height help" },
            { id: "reach", name: "Higher standing reach helps" }
          ]
        },
        { id: "posht", name: "Bigger than the position helps" },
        { id: "swing", name: "Guys who can play more than one position do better" }
      ]
    },
    {
      label: "Tall guys who can dribble are rare",
      kids: [
        { id: "astu", name: "Passers perform better" },
        { id: "handle", name: "Tall passers perform better" }
      ]
    },
    {
      label: "Drafting younger is better",
      kids: [
        { id: "age-yrs", name: "They last longer" },
        { id: "age-stars", name: "They become stars more often" }
      ]
    },
    {
      label: "Past performance predicts future performance",
      kids: [
        { id: "prod", name: "College stats tell you who will be good" },
        { id: "astu", name: "Passing travels better than scoring" },
        { id: "defense", name: "College defense does not tell you anything" },
        { id: "rim", name: "You still need a big who can block shots" }
      ]
    },
    {
      label: "School, country, and team",
      kids: [
        { id: "intl", name: "A pro line is not a college line" }
      ]
    }
  ];

  var NOT_IN = [
    { name: "Workout numbers do not mean much", why: "Looked at. Combine drills are not a GLM feature." },
    { name: "Guys who get fouled a lot can get to the rim", why: "Looked at. Free-throw rate is not a GLM feature." },
    { name: "Taking a lot of threes matters more than a hot percentage", why: "Looked at. Three-point volume is not a GLM feature." },
    { name: "The best players come from the best colleges", why: "Looked at. School is not a GLM feature." },
    { name: "The team that drafts him matters as much as the player", why: "Looked at. Team logo is not a GLM feature." },
    { name: "Leave a raw foreign player overseas until he is ready", why: "Looked at. Stash is not a GLM feature." },
    { name: "Older guys have a higher floor", why: "Disproven. Not in the player score." }
  ];

  function css() {
    if (document.getElementById("player-theory-tree-css")) return;
    var s = document.createElement("style");
    s.id = "player-theory-tree-css";
    s.textContent =
      ".th-ledger,.th-size{display:none!important}" +
      ".th-apply{margin:8px 0 40px}.th-apply .kicker{margin:0 0 8px}" +
      ".th-apply .theory-list .theory-list{border-top:1px solid var(--line)}" +
      ".th-apply .theory-acc .theory-acc .theory-name{font-size:18px}" +
      ".th-apply .theory-acc .theory-acc .theory-acc .theory-name{font-size:17px}" +
      ".th-bin{margin:4px 0 8px}" +
      ".th-bin table{width:100%;max-width:420px;border-collapse:collapse;font-size:13px}" +
      ".th-bin th{text-align:left;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:500;padding:4px 8px 8px 0}" +
      ".th-bin td{padding:6px 8px 6px 0;border-top:1px solid var(--line)}" +
      ".th-bin td.num,.th-bin th.num{text-align:right}" +
      ".th-bin .pos{color:var(--lime)}.th-bin .neg{color:var(--coral)}" +
      ".th-bin .empty{color:var(--muted);font-size:13px;margin:0}" +
      ".th-bin .who{color:var(--muted);font-size:13px;margin:0 0 10px}" +
      ".th-dn{margin:0 0 22px}.th-dn table{width:100%;max-width:560px;border-collapse:collapse;font-size:13px}" +
      ".th-dn th{text-align:left;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:500;padding:4px 12px 8px 0}" +
      ".th-dn td{padding:6px 12px 6px 0;border-top:1px solid var(--line)}" +
      ".th-dn td.num{text-align:right;font-family:var(--mono)}";
    document.head.appendChild(s);
  }
  function inches(ht) {
    var m = String(ht || "").match(/(\d+)\s*-\s*(\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) * 12 + Number(m[2]) : 0;
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
  function cleanFact(v) {
    v = String(v || "").replace(/\s*22\.5\+\s*$/, "").replace(/\s*u19\s*$/i, "").trim();
    if (v === "-" || v === "missing" || v === "unknown") return "";
    return v;
  }
  function applied(spec) {
    if (!spec || spec.mAs == null) {
      return '<div class="th-bin"><p class="empty">No measurement</p></div>';
    }
    var fact = spec.fact ? '<p class="who">' + spec.fact + "</p>" : "";
    var show = spec.show;
    function want(k) { return !show || show.indexOf(k) >= 0; }
    var body = "";
    if (want("yrs")) body += row("Years", spec.mYrs);
    if (want("as")) body += row("All-Star", spec.mAs);
    if (want("nba")) body += row("All-NBA", spec.mNba);
    if (want("hof")) body += row("Hall of Fame", spec.mHof);
    if (want("mvp")) body += row("MVP", spec.mMvp);
    return '<div class="th-bin">' + fact +
      '<table><thead><tr><th></th><th>This player</th><th class="num">Applied</th></tr></thead><tbody>' +
      body + "</tbody></table></div>";
  }
  function fromStep(steps, id) {
    var s = (steps || []).find(function (x) { return x.id === id; });
    if (!s) return null;
    var val = cleanFact(s.value);
    if (!val) return null;
    return { fact: val, mAs: s.mAs, mNba: s.mNba, mHof: s.mHof, mMvp: s.mMvp, mYrs: s.mYrs };
  }
  function resolve(id, p) {
    var steps = (p.proj && p.proj.steps) || [];
    if (id === "inch") return fromStep(steps, "size");
    if (id === "age" || id === "age-yrs" || id === "age-stars") {
      var ageStep = fromStep(steps, "age") || { fact: "no age", mAs: 1, mNba: 1, mHof: 1, mMvp: 1, mYrs: 1 };
      if (id === "age-yrs") ageStep = Object.assign({}, ageStep, { show: ["yrs"] });
      if (id === "age-stars") ageStep = Object.assign({}, ageStep, { show: ["as", "nba", "hof", "mvp"] });
      return ageStep;
    }
    if (id === "astu" || id === "passers") return fromStep(steps, "astu") || { fact: "no assist line", mAs: 1, mNba: 1, mHof: 1, mMvp: 1 };
    return fromStep(steps, id);
  }
  function plusRow(name, inner) {
    return '<div class="acc-item theory-acc"><div class="theory-row">' +
      '<button class="theory-plus" data-acc type="button" aria-label="Toggle">+</button>' +
      '<span class="theory-name">' + name + "</span></div>" +
      '<div class="acc-panel">' + inner + "</div></div>";
  }
  function renderNode(node, p) {
    if (node.kids && node.kids.length) {
      var list = '<div class="acc theory-list">';
      node.kids.forEach(function (k) { list += renderNode(k, p); });
      list += "</div>";
      return plusRow(node.name || node.label, list);
    }
    return plusRow(node.name, applied(resolve(node.id, p)));
  }
  function draftNight(p, y) {
    var full = p.proj;
    if (!full) return "";
    var fmtPct = (window.TR && TR.Model && TR.Model.fmtPct) ? TR.Model.fmtPct : function (n) { return Math.round((n || 0) * 100) + "%"; };
    var fmtExp = (window.TR && TR.Model && TR.Model.fmtExp) ? TR.Model.fmtExp : function (n) { return String(n); };
    var fmtHof = (window.TR && TR.Model && TR.Model.fmtHofRemain) ? TR.Model.fmtHofRemain : fmtPct;
    var cur = (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
    var now = "";
    if (y < cur) {
      var hofFn = window.TR && (TR.careerHofP || (TR.Model && TR.Model.careerHofP));
      var hofNow = hofFn ? hofFn(p, y, cur) : null;
      if (hofNow != null) now = "<tr><td>Hall of Fame now</td><td class=\"num\">" + fmtHof(hofNow) + "</td></tr>";
    }
    var fmtBpm = function (n) {
      if (n == null || !isFinite(Number(n))) return "";
      n = Number(n);
      if (Math.abs(n) < 0.05) return "0.0";
      return (n > 0 ? "+" : "\u2212") + Math.abs(n).toFixed(1);
    };
    return '<div class="th-dn"><div class="kicker">Draft night</div><table><tbody>' +
      "<tr><td>All-Star</td><td class=\"num\">" + fmtExp(full.expAs) + "</td></tr>" +
      "<tr><td>All-NBA</td><td class=\"num\">" + fmtExp(full.expNba) + "</td></tr>" +
      "<tr><td>Years</td><td class=\"num\">" + fmtExp(full.expYrs) + "</td></tr>" +
      "<tr><td>PPG</td><td class=\"num\">" + fmtExp(full.expPts) + "</td></tr>" +
      "<tr><td>RPG</td><td class=\"num\">" + fmtExp(full.expReb) + "</td></tr>" +
      "<tr><td>APG</td><td class=\"num\">" + fmtExp(full.expAst) + "</td></tr>" +
      "<tr><td>Box +/−</td><td class=\"num\">" + fmtBpm(full.expBpm) + "</td></tr>" +
      "<tr><td>MVP</td><td class=\"num\">" + fmtExp(full.expMvp) + "</td></tr>" +
      "<tr><td>Hall of Fame then</td><td class=\"num\">" + (TR.Model && TR.Model.fmtHof ? TR.Model.fmtHof(full.pHof) : fmtPct(full.pHof)) + "</td></tr>" +
      now + "</tbody></table></div>";
  }
  function restyle(root) {
    css();
    var y = Number(new URLSearchParams(location.search).get("year"));
    var id = new URLSearchParams(location.search).get("id");
    var draft = window.TANK_RANK && TANK_RANK.drafts[y];
    if (!draft || !root) return;
    var list = draft.players || [];
    var p = list.find(function (x) { return x.id === id; }) || list[0];
    if (!p) return;
    if (!p.proj && window.TR && typeof TR.projectPlayer === "function") {
      p.proj = TR.projectPlayer(p, Object.assign({}, TR.deriveFeat ? TR.deriveFeat(p) : {}, p.theoryFeat || {}), {});
    }
    var box = root.querySelector(".th-player");
    if (!box) return;
    var html = '<div class="kicker">In the model</div><p class="who">These levers move this player\u2019s score. Combine, school, FT rate, and stash are tables. They are not here.</p><div class="acc theory-families">';
    TREE.forEach(function (g, gi) {
      var inner = '<div class="acc theory-list">';
      (g.kids || []).forEach(function (k) { inner += renderNode(k, p); });
      inner += "</div>";
      html += '<section class="acc-item group-acc"><button class="acc-btn group-acc-btn" type="button" data-group="' + gi + '"><b>' +
        g.label + '</b><em><i>+</i></em></button><div class="acc-panel">' + inner + "</div></section>";
    });
    var notInner = '<div class="acc theory-list">';
    NOT_IN.forEach(function (t) {
      notInner += plusRow(t.name, '<div class="th-bin"><p class="empty">' + t.why + "</p></div>");
    });
    notInner += "</div>";
    html += '<section class="acc-item group-acc"><button class="acc-btn group-acc-btn" type="button" data-group="not"><b>Not in this score</b><em><i>+</i></em></button><div class="acc-panel">' + notInner + "</div></section>";
    html += "</div>";
    box.className = "section th-player th-apply";
    box.innerHTML = html;
    var size = root.querySelector(".th-size");
    if (size) size.remove();
    box.querySelectorAll("[data-group]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var item = btn.closest(".group-acc");
        item.classList.toggle("open");
        var icon = btn.querySelector("i");
        if (icon) icon.textContent = item.classList.contains("open") ? "\u2212" : "+";
      });
    });
    box.querySelectorAll("[data-acc]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var item = btn.closest(".theory-acc");
        item.classList.toggle("open");
        btn.textContent = item.classList.contains("open") ? "\u2212" : "+";
      });
    });
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
