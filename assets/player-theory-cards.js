(function () {
  var GROUPS = [
    { label: "Body", items: [
      { id: "inch", claim: "Every extra inch helps", href: "./size.html" },
      { id: "weight", claim: "Heavier guys perform better", href: "./size.html" },
      { id: "wpi", claim: "More pounds per inch helps", href: "./size.html" },
      { id: "wingspan", claim: "Longer arms help", href: "./wingspan.html" },
      { id: "ape", claim: "Arms longer than height help", href: "./size.html" },
      { id: "reach", claim: "Higher standing reach helps", href: "./reach.html" },
      { id: "handle", claim: "Tall guys who can dribble are rare", href: "./handle.html" },
      { id: "combine", claim: "Workout numbers do not mean much", href: "./combine.html" }
    ]},
    { label: "Age", items: [
      { id: "age", claim: "How old he is on draft night", href: "./age.html" },
      { id: "late", claim: "Some players get good late, and teams miss them", href: "./late.html" },
      { id: "onedone", claim: "One year of college is enough if you are a star", href: "./onedone.html" },
      { id: "jump", claim: "Getting better in year two means more than a huge freshman year", href: "./jump.html" },
      { id: "stash", claim: "Leave a raw foreign player overseas until he is ready", href: "./stash.html" }
    ]},
    { label: "How he plays", items: [
      { id: "prod", claim: "College stats tell you who will be good", href: "./prod.html" },
      { id: "ftrate", claim: "Guys who get fouled a lot can get to the rim", href: "./ftrate.html" },
      { id: "three", claim: "Taking a lot of threes matters more than a hot percentage", href: "./three.html" },
      { id: "astu", claim: "Passing travels better than scoring", href: "./astu.html" },
      { id: "defense", claim: "College defense does not tell you anything", href: "./defense.html" },
      { id: "rim", claim: "You still need a big who can block shots", href: "./rim.html" }
    ]},
    { label: "School, country, and team", items: [
      { id: "schools", claim: "The best players come from the best colleges", href: "./schools.html" },
      { id: "intl", claim: "Foreign players are a different kind of bet", href: "./intl.html" },
      { id: "develop", claim: "The team that drafts him matters as much as the player", href: "./develop.html" }
    ]}
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
    "7-3":{mAs:0,mNba:0,mHof:2.66,mMvp:0},"7-4":{mAs:4.28,mNba:3.87,mHof:7.09,mMvp:0},
    "7-5":{mAs:0,mNba:0,mHof:0,mMvp:0},"7-6":{mAs:3.21,mNba:5.81,mHof:10.64,mMvp:0},
    "7-7":{mAs:0,mNba:0,mHof:0,mMvp:0}
  };
  var WPI = [
    { lo: 0, hi: 2.40, label: "Under 2.40", mAs: 0.71, mNba: 0.65, mHof: 0, mMvp: 2.38 },
    { lo: 2.40, hi: 2.60, label: "2.40\u20132.59", mAs: 0.51, mNba: 0.58, mHof: 0, mMvp: 1.23 },
    { lo: 2.60, hi: 2.80, label: "2.60\u20132.79", mAs: 0.84, mNba: 1.08, mHof: 0.36, mMvp: 0.72 },
    { lo: 2.80, hi: 3.00, label: "2.80\u20132.99", mAs: 0.78, mNba: 0.92, mHof: 0.45, mMvp: 0.45 },
    { lo: 3.00, hi: 9, label: "3.00+", mAs: 0.85, mNba: 1.22, mHof: 0, mMvp: 0.75 }
  ];
  var WSP = [
    { lo: 0, hi: 80, label: "Under 6-8", mAs: 0.96, mNba: 0.91, mHof: 0.50, mMvp: 1.10 },
    { lo: 80, hi: 84, label: "6-8 to 6-11", mAs: 1.03, mNba: 1.01, mHof: 0.74, mMvp: 1.15 },
    { lo: 84, hi: 87, label: "7-0 to 7-2", mAs: 0.79, mNba: 0.80, mHof: 1.57, mMvp: 0.66 },
    { lo: 87, hi: 90, label: "7-3 to 7-5", mAs: 1.26, mNba: 1.30, mHof: 1.94, mMvp: 1.10 },
    { lo: 90, hi: 120, label: "7-6 and up", mAs: 1.60, mNba: 2.31, mHof: 0, mMvp: 0 }
  ];
  var APE = [
    { lo: -20, hi: 0, label: "Short arms", mAs: 0, mNba: 0, mHof: 0, mMvp: 0 },
    { lo: 0, hi: 2, label: "0 to 1.9 in", mAs: 0.62, mNba: 0.44, mHof: 0, mMvp: 1.80 },
    { lo: 2, hi: 4, label: "2 to 3.9 in", mAs: 1.01, mNba: 1.10, mHof: 1.11, mMvp: 0 },
    { lo: 4, hi: 6, label: "4 to 5.9 in", mAs: 0.79, mNba: 0.88, mHof: 1.11, mMvp: 0.90 },
    { lo: 6, hi: 30, label: "6 in and up", mAs: 1.32, mNba: 1.21, mHof: 1.11, mMvp: 1.70 }
  ];
  var REACH = [
    { lo: 0, hi: 102, label: "Under 8-6", mAs: 1.04, mNba: 1.11, mHof: 1.11, mMvp: 1.15 },
    { lo: 102, hi: 108, label: "8-6 to 8-11", mAs: 0.91, mNba: 0.86, mHof: 0.65, mMvp: 1.00 },
    { lo: 108, hi: 112, label: "9-0 to 9-3", mAs: 1.00, mNba: 1.00, mHof: 2.04, mMvp: 0.83 },
    { lo: 112, hi: 140, label: "9-4 and up", mAs: 1.77, mNba: 1.54, mHof: 0, mMvp: 0 }
  ];

  function css() {
    if (document.getElementById("player-theory-cards-css")) return;
    var s = document.createElement("style");
    s.id = "player-theory-cards-css";
    s.textContent =
      ".th-ledger,.th-size{display:none!important}" +
      ".th-apply{margin:8px 0 36px}.th-apply .kicker{margin:0 0 8px}" +
      ".th-apply .group-acc > .acc-btn b{font-size:28px}" +
      ".th-apply .theory-name{font-size:20px}" +
      ".th-apply .acc-panel .th-bin{margin:0 0 12px}" +
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
    v = v.replace(/\s*\u00b7\s*.+$/, "");
    if (v === "-" || v === "missing" || v === "unknown") return "";
    return v;
  }
  function applied(spec) {
    if (!spec || spec.mAs == null) {
      return '<div class="th-bin"><p class="empty">No measurement</p></div>';
    }
    var fact = spec.fact ? '<p class="who">' + spec.fact + "</p>" : "";
    return '<div class="th-bin">' + fact +
      "<table><thead><tr><th></th><th>This player</th><th class=\"num\">Applied</th></tr></thead><tbody>" +
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
    var feat = Object.assign({}, p.theoryFeat || {}, { ht: p.ht || (p.theoryFeat && p.theoryFeat.ht), wt: p.wt || (p.theoryFeat && p.theoryFeat.wt), wsp: p.wsp || (p.theoryFeat && p.theoryFeat.wsp), reach: p.reach || (p.theoryFeat && p.theoryFeat.reach) });
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
    if (id === "inch") {
      var key = String(ht || "").replace(/\s+/g, "");
      var inch = INCH[key];
      if (inch && ht) return { fact: ht, mAs: inch.mAs, mNba: inch.mNba, mHof: inch.mHof, mMvp: inch.mMvp };
      return null;
    }
    if (id === "weight") {
      var wband = found && found.weight;
      if (wband && !isNaN(wt)) return { fact: wt + " lbs \u00b7 " + wband.label, mAs: wband.mAs, mNba: wband.mNba, mHof: wband.mHof, mMvp: wband.mMvp };
      return fromStep(steps, "weight");
    }
    if (id === "wpi") {
      if (!htIn || isNaN(wt)) return null;
      var ratio = wt / htIn;
      var rowW = pick(WPI, ratio);
      if (!rowW) return null;
      return { fact: ratio.toFixed(2) + " \u00b7 " + rowW.label, mAs: rowW.mAs, mNba: rowW.mNba, mHof: rowW.mHof, mMvp: rowW.mMvp };
    }
    if (id === "wingspan") {
      var wspIn = inches(feat.wsp);
      if (!wspIn) return fromStep(steps, "wingspan");
      var ws = pick(WSP, wspIn);
      return ws ? { fact: feat.wsp + " \u00b7 " + ws.label, mAs: ws.mAs, mNba: ws.mNba, mHof: ws.mHof, mMvp: ws.mMvp } : fromStep(steps, "wingspan");
    }
    if (id === "ape") {
      var aHt = htIn, aWs = inches(feat.wsp);
      if (!aHt || !aWs) return null;
      var ape = aWs - aHt;
      var ar = pick(APE, ape);
      return ar ? { fact: (ape >= 0 ? "+" : "") + ape.toFixed(1) + " in \u00b7 " + ar.label, mAs: ar.mAs, mNba: ar.mNba, mHof: ar.mHof, mMvp: ar.mMvp } : null;
    }
    if (id === "reach") {
      var rIn = inches(feat.reach);
      if (!rIn) return fromStep(steps, "reach");
      var rr = pick(REACH, rIn);
      return rr ? { fact: feat.reach + " \u00b7 " + rr.label, mAs: rr.mAs, mNba: rr.mNba, mHof: rr.mHof, mMvp: rr.mMvp } : fromStep(steps, "reach");
    }
    return fromStep(steps, id);
  }
  function itemRow(it, spec) {
    return '<div class="acc-item theory-acc"><div class="theory-row">' +
      '<button class="theory-plus" data-acc type="button" aria-label="Toggle">+</button>' +
      '<span class="theory-name">' + it.claim + "</span></div>" +
      '<div class="acc-panel">' + applied(spec) + "</div></div>";
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
    GROUPS.forEach(function (g, gi) {
      html += '<section class="acc-item group-acc"><button class="acc-btn group-acc-btn" type="button" data-group="' + gi + '"><b>' +
        g.label + "</b><em><i>+</i></em></button><div class=\"acc-panel\"><div class=\"acc theory-list\">";
      g.items.forEach(function (it) { html += itemRow(it, resolve(it.id, p)); });
      html += "</div></div></section>";
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
