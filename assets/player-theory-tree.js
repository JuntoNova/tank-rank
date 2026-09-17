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
            }
          ]
        },
        { id: "posht", name: "Bigger than the position helps" },
        { id: "swing", name: "Guys who can play more than one position do better" },
        { id: "wingspan", name: "Long arms help on defense" },
        { id: "handle", name: "Tall guys who can dribble are rare" },
        { id: "reach", name: "How high he can reach beats how high he jumps" },
        { id: "combine", name: "Workout numbers do not mean much" },
        { id: "age", name: "Drafting younger is better" }
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
        { id: "rim", name: "You still need a big who can block shots" },
        { id: "late", name: "Some players get good late, and teams miss them" },
        { id: "onedone", name: "One year of college is enough if you are a star" },
        { id: "jump", name: "Getting better in year two means more than a huge freshman year" }
      ]
    },
    {
      label: "School, country, and team",
      kids: [
        { id: "schools", name: "The best players come from the best colleges" },
        { id: "intl", name: "Foreign players are a different kind of bet" },
        { id: "develop", name: "The team that drafts him matters as much as the player" },
        { id: "stash", name: "Leave a raw foreign player overseas until he is ready" }
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

  var INCH = {
    "5-9":{mAs:2.75,mNba:3.33,mHof:3.04,mMvp:0},"5-10":{mAs:0.92,mNba:1.66,mHof:1.51,mMvp:0},
    "5-11":{mAs:1.28,mNba:0,mHof:1.06,mMvp:0},"6-0":{mAs:0.96,mNba:1.2,mHof:1.47,mMvp:0.98},
    "6-1":{mAs:1.21,mNba:1.09,mHof:1.51,mMvp:0.68},"6-2":{mAs:0.98,mNba:1.14,mHof:0.34,mMvp:0.47},
    "6-3":{mAs:0.90,mNba:0.91,mHof:0.64,mMvp:0.63},"6-4":{mAs:1.15,mNba:1.24,mHof:1.43,mMvp:0.38},
    "6-5":{mAs:0.74,mNba:0.84,mHof:0.85,mMvp:0.62},"6-6":{mAs:1.15,mNba:1.15,mHof:1.13,mMvp:1.21},
    "6-7":{mAs:1.13,mNba:0.85,mHof:1.17,mMvp:0.52},"6-8":{mAs:0.79,mNba:0.85,mHof:0.81,mMvp:0},
    "6-9":{mAs:1.07,mNba:0.99,mHof:0.81,mMvp:1.88},"6-10":{mAs:0.96,mNba:0.90,mHof:0.81,mMvp:0.73},
    "6-11":{mAs:1.02,mNba:0.99,mHof:1.09,mMvp:2.91},"7-0":{mAs:0.70,mNba:0.93,mHof:0.62,mMvp:1.87},
    "7-1":{mAs:1.48,mNba:1.49,mHof:2.72,mMvp:6.57},"7-2":{mAs:1.60,mNba:1.45,mHof:2.66,mMvp:5.34},
    "7-3":{mAs:0,mNba:0,mHof:2.66,mMvp:1.80},"7-4":{mAs:4.28,mNba:3.87,mHof:7.09,mMvp:1.80},
    "7-5":{mAs:0,mNba:0,mHof:0,mMvp:1.80},"7-6":{mAs:3.21,mNba:5.81,mHof:10.64,mMvp:1.80},
    "7-7":{mAs:0,mNba:0,mHof:0,mMvp:1.80}
  };
  var WPI = [
    { lo: 0, hi: 2.40, label: "Under 2.40", mAs: 0.71, mNba: 0.65, mHof: 0, mMvp: 2.38 },
    { lo: 2.40, hi: 2.60, label: "2.40\u20132.59", mAs: 0.51, mNba: 0.58, mHof: 0, mMvp: 1.23 },
    { lo: 2.60, hi: 2.80, label: "2.60\u20132.79", mAs: 0.84, mNba: 1.08, mHof: 0.36, mMvp: 0.72 },
    { lo: 2.80, hi: 3.00, label: "2.80\u20132.99", mAs: 0.78, mNba: 0.92, mHof: 0.45, mMvp: 0.45 },
    { lo: 3.00, hi: 9, label: "3.00+", mAs: 0.85, mNba: 1.22, mHof: 0, mMvp: 0.75 }
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
  function pick(list, x) {
    if (x == null || isNaN(x)) return null;
    for (var i = 0; i < list.length; i++) if (x >= list[i].lo && x < list[i].hi) return list[i];
    return list[list.length - 1];
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
      var sizeStep = fromStep(steps, "size");
      if (sizeStep) return sizeStep;
      var band = found && found.height;
      if (band) return { fact: (ht || "") + " \u00b7 " + band.label, mAs: band.mAs, mNba: band.mNba, mHof: band.mHof, mMvp: band.mMvp };
      return null;
    }
    if (id === "inch") {
      var inchStep = fromStep(steps, "size");
      if (inchStep) return inchStep;
      var key = String(ht || "").replace(/\s+/g, "");
      var inch = INCH[key];
      if (inch && ht) return { fact: ht, mAs: inch.mAs, mNba: inch.mNba, mHof: inch.mHof, mMvp: inch.mMvp };
      return null;
    }
    if (id === "weight") {
      var wtStep = fromStep(steps, "weight");
      if (wtStep) return wtStep;
      var wband = found && found.weight;
      if (wband && !isNaN(wt)) return { fact: wt + " lbs \u00b7 " + wband.label, mAs: wband.mAs, mNba: wband.mNba, mHof: wband.mHof, mMvp: wband.mMvp };
      return null;
    }
    if (id === "wpi") {
      var wpiStep = fromStep(steps, "wpi");
      if (wpiStep) return wpiStep;
      if (!htIn || isNaN(wt)) return null;
      var ratio = wt / htIn;
      var rowW = pick(WPI, ratio);
      if (!rowW) return null;
      return { fact: ratio.toFixed(2) + " \u00b7 " + rowW.label, mAs: rowW.mAs, mNba: rowW.mNba, mHof: rowW.mHof, mMvp: rowW.mMvp };
    }
    if (id === "wingspan") {
      var wsStep = fromStep(steps, "wingspan");
      if (wsStep) return wsStep;
      if (!feat.wsp) return { fact: "missing", mAs: 1, mNba: 1, mHof: 1, mMvp: 1 };
      return { fact: feat.wsp, mAs: 1, mNba: 1, mHof: 1, mMvp: 1 };
    }
    if (id === "ape") {
      var apeStep = fromStep(steps, "ape");
      if (apeStep) return apeStep;
      var aHt = htIn, aWs = inches(feat.wsp);
      if (!aHt || !aWs) return { fact: "missing", mAs: 1, mNba: 1, mHof: 1, mMvp: 1 };
      var ape = aWs - aHt;
      return { fact: (ape >= 0 ? "+" : "") + ape.toFixed(1) + " in", mAs: 1, mNba: 1, mHof: 1, mMvp: 1 };
    }
    if (id === "reach") {
      var rStep = fromStep(steps, "reach");
      if (rStep) return rStep;
      if (!feat.reach) return { fact: "missing", mAs: 1, mNba: 1, mHof: 1, mMvp: 1 };
      return { fact: feat.reach, mAs: 1, mNba: 1, mHof: 1, mMvp: 1 };
    }
    if (id === "posht") {
      var ph = fromStep(steps, "posht");
      if (ph) return ph;
      var pos = String(feat.pos || p.pos || "");
      if (!ht && !pos) return { fact: "No listed size or position", mAs: 1, mNba: 1, mHof: 1, mMvp: 1 };
      return { fact: (ht || "") + (pos ? " · " + pos : ""), mAs: 1, mNba: 1, mHof: 1, mMvp: 1 };
    }
    if (id === "swing") {
      var sw = fromStep(steps, "swing");
      if (sw) return sw;
      var sp = String(feat.pos || p.pos || "");
      return { fact: sp ? sp : "No listed position", mAs: 1, mNba: 1, mHof: 1, mMvp: 1 };
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
    return '<div class="th-dn"><div class="kicker">Draft night</div><table><tbody>' +
      "<tr><td>All-Star</td><td class=\"num\">" + fmtExp(full.expAs) + "</td></tr>" +
      "<tr><td>All-NBA</td><td class=\"num\">" + fmtExp(full.expNba) + "</td></tr>" +
      "<tr><td>Years</td><td class=\"num\">" + fmtExp(full.expYrs) + "</td></tr>" +
      "<tr><td>MVP</td><td class=\"num\">" + fmtExp(full.expMvp) + "</td></tr>" +
      "<tr><td>Hall of Fame then</td><td class=\"num\">" + fmtPct(full.pHof) + "</td></tr>" +
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
