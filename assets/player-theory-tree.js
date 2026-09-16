(function () {
  var TREE = [
    {
      label: "Body",
      kids: [
        {
          name: "Bigger is better",
          kids: [
            {
              name: "Height",
              kids: [
                { id: "size", name: "Taller guys perform better" }
              ]
            },
            {
              name: "Weight",
              kids: [
                { id: "weight", name: "Heavier guys perform better" }
              ]
            },
            {
              name: "Length",
              kids: [
                { id: "wingspan", name: "Longer arms help" },
                { id: "ape", name: "Arms longer than height help" },
                { id: "reach", name: "Higher standing reach helps" }
              ]
            }
          ]
        },
        { id: "wingspan", name: "Long arms help on defense" },
        { id: "handle", name: "Tall guys who can dribble are rare" },
        { id: "reach", name: "How high he can reach beats how high he jumps" },
        { id: "combine", name: "Workout numbers do not mean much" }
      ]
    },
    {
      label: "Age",
      kids: [
        { id: "age", name: "The younger guy at the same pick is the better bet" },
        { id: "late", name: "Some players get good late, and teams miss them" },
        { id: "onedone", name: "One year of college is enough if you are a star" },
        { id: "jump", name: "Getting better in year two means more than a huge freshman year" },
        { id: "stash", name: "Leave a raw foreign player overseas until he is ready" }
      ]
    },
    {
      label: "How he plays",
      kids: [
        { id: "prod", name: "College stats tell you who will be good" },
        { id: "ftrate", name: "Guys who get fouled a lot can get to the rim" },
        { id: "three", name: "Taking a lot of threes matters more than a hot percentage" },
        { id: "astu", name: "Passing travels better than scoring" },
        { id: "defense", name: "College defense does not tell you anything" },
        { id: "rim", name: "You still need a big who can block shots" }
      ]
    },
    {
      label: "School, country, and team",
      kids: [
        { id: "schools", name: "The best players come from the best colleges" },
        { id: "intl", name: "Foreign players are a different kind of bet" },
        { id: "develop", name: "The team that drafts him matters as much as the player" }
      ]
    },
    {
      label: "Arguments we cannot check yet",
      kids: [
        { id: "switch", name: "Guarding every position matters more than blocking shots" },
        { id: "march", name: "Tournament games show you who is clutch" },
        { id: "scheme", name: "He only works in our system" },
        { id: "medical", name: "Hidden injuries change everything" },
        { id: "character", name: "Off-court warning signs predict busts" },
        { id: "shoot", name: "Shooting can be taught" },
        { id: "motor", name: "He plays harder than everyone else" },
        { id: "iq", name: "He just knows where to be" },
        { id: "bpa", name: "Always take the best player, not the one you need" },
        { id: "listedht", name: "The listed height is the real height" },
        { id: "keepwt", name: "He can keep the weight on" }
      ]
    }
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
      ".th-bin .who{color:var(--muted);font-size:13px;margin:0 0 10px}";
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
    return '<div class="th-bin">' + fact +
      '<table><thead><tr><th></th><th>This player</th><th class="num">Applied</th></tr></thead><tbody>' +
      row("All-Star", spec.mAs) + row("All-NBA", spec.mNba) + row("Hall of Fame", spec.mHof) + row("MVP", spec.mMvp) +
      "</tbody></table></div>";
  }
  function fromStep(steps, id) {
    var s = (steps || []).find(function (x) { return x.id === id; });
    if (!s) return null;
    var val = cleanFact(s.value);
    if (!val) return null;
    return { fact: val, mAs: s.mAs, mNba: s.mNba, mHof: s.mHof, mMvp: s.mMvp };
  }
  function resolve(id, p) {
    var feat = Object.assign({}, p.theoryFeat || {}, {
      ht: p.ht || (p.theoryFeat && p.theoryFeat.ht),
      wt: p.wt || (p.theoryFeat && p.theoryFeat.wt),
      wsp: p.wsp || (p.theoryFeat && p.theoryFeat.wsp),
      reach: p.reach || (p.theoryFeat && p.theoryFeat.reach)
    });
    var steps = (p.proj && p.proj.steps) || [];
    var ht = feat.ht || p.ht;
    var wt = feat.wt != null && feat.wt !== "" ? Number(feat.wt) : NaN;
    var htIn = inches(ht);
    var found = window.TR && TR.Size ? TR.Size.lookup(feat) : null;
    if (id === "size") {
      var band = found && found.height;
      if (band) return { fact: (ht || "") + " \u00b7 " + band.label, mAs: band.mAs, mNba: band.mNba, mHof: band.mHof, mMvp: band.mMvp };
      return fromStep(steps, "size");
    }
    if (id === "weight") {
      var wband = found && found.weight;
      if (wband && !isNaN(wt)) return { fact: wt + " lbs \u00b7 " + wband.label, mAs: wband.mAs, mNba: wband.mNba, mHof: wband.mHof, mMvp: wband.mMvp };
      return fromStep(steps, "weight");
    }
    if (id === "wingspan") {
      var wspIn = inches(feat.wsp);
      if (!wspIn) return fromStep(steps, "wingspan");
      return fromStep(steps, "wingspan") || { fact: feat.wsp, mAs: 1, mNba: 1, mHof: 1, mMvp: 1 };
    }
    if (id === "ape") {
      var aHt = htIn, aWs = inches(feat.wsp);
      if (!aHt || !aWs) return null;
      var ape = aWs - aHt;
      return fromStep(steps, "wingspan") || { fact: (ape >= 0 ? "+" : "") + ape.toFixed(1) + " in", mAs: 1, mNba: 1, mHof: 1, mMvp: 1 };
    }
    if (id === "reach") {
      if (!inches(feat.reach)) return fromStep(steps, "reach");
      return fromStep(steps, "reach") || { fact: feat.reach, mAs: 1, mNba: 1, mHof: 1, mMvp: 1 };
    }
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
  function restyle(root) {
    css();
    var y = Number(new URLSearchParams(location.search).get("year"));
    var id = new URLSearchParams(location.search).get("id");
    var draft = window.TANK_RANK && TANK_RANK.drafts[y];
    if (!draft || !root) return;
    var list = draft.players || [];
    var p = list.find(function (x) { return x.id === id; }) || list[0];
    if (!p) return;
    var box = root.querySelector(".th-player");
    if (!box) return;
    var html = '<div class="kicker">Theories</div><div class="acc theory-families">';
    TREE.forEach(function (g, gi) {
      var inner = '<div class="acc theory-list">';
      (g.kids || []).forEach(function (k) { inner += renderNode(k, p); });
      inner += "</div>";
      html += '<section class="acc-item group-acc"><button class="acc-btn group-acc-btn" type="button" data-group="' + gi + '"><b>' +
        g.label + '</b><em><i>+</i></em></button><div class="acc-panel">' + inner + "</div></section>";
    });
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
