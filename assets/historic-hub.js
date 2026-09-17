(function () {
  var PAGE = 20;
  var allTime = null;
  var at = {
    when: "now",
    sort: "as",
    dir: -1,
    q: "",
    dec: "",
    pos: "",
    rd: "",
    page: 0,
    painted: false
  };

  function viewOf() {
    var v = (new URLSearchParams(location.search).get("view") || "drafts").toLowerCase();
    if (v === "all-time" || v === "alltime" || v === "all") return "alltime";
    if (v === "outliers" || v === "outlier") return "outliers";
    return "drafts";
  }

  function whenOf() {
    var w = (new URLSearchParams(location.search).get("when") || "").toLowerCase();
    if (w === "now") return "now";
    return "drafted";
  }

  function css() {
    if (document.getElementById("hist-hub-css")) return;
    var s = document.createElement("style");
    s.id = "hist-hub-css";
    s.textContent = [
      ".hist-pills{margin:0 0 18px}",
      ".hist-pills a.chip{text-decoration:none}",
      "#hist-alltime .table-wrap,#hist-outliers .table-wrap{margin-top:0;-webkit-overflow-scrolling:touch}",
      "#hist-alltime table{table-layout:fixed;width:100%;min-width:1080px}",
      "#hist-alltime td.pct,#hist-alltime td.rank,#hist-alltime th.num{text-align:right;font-variant-numeric:tabular-nums}",
      "#hist-alltime th.num{white-space:nowrap}",
      "#hist-alltime td.pct{white-space:normal}",
      "#hist-alltime th:nth-child(1),#hist-alltime td:nth-child(1){width:3rem}",
      "#hist-alltime th:nth-child(2),#hist-alltime td:nth-child(2){width:3.6rem}",
      "#hist-alltime th:nth-child(3),#hist-alltime td:nth-child(3){width:3rem}",
      "#hist-alltime th:nth-child(4),#hist-alltime td:nth-child(4){width:14rem;overflow:hidden}",
      "#hist-alltime th:nth-child(5),#hist-alltime td:nth-child(5){width:8rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      "#hist-alltime td .name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      "#hist-alltime td .meta{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      "#hist-alltime td .meta-full{display:none}",
      "#hist-alltime tr{cursor:pointer}",
      "#hist-alltime th[data-k]{cursor:pointer;user-select:none;padding-right:16px}",
      "#hist-alltime th[data-k]:after{content:' \\25be';font-size:10px;visibility:hidden;display:inline-block;width:10px}",
      "#hist-alltime th[data-k].on:after{visibility:visible}",
      "#hist-alltime th[data-k].asc:after{content:' \\25b4';visibility:visible}",
      ".hist-pager{display:flex;gap:8px;align-items:center;margin:14px 0 0;flex-wrap:wrap}",
      ".hist-pager .chip{cursor:pointer}",
      ".hist-pager .count{color:var(--muted);font-size:13px;margin-left:auto}",
      ".at-tools{align-items:center}",
      ".at-tools .at-right{margin-left:auto;display:flex;gap:8px;align-items:center;flex:1;min-width:0;justify-content:flex-end}",
      ".at-tools .search{margin-left:0;min-width:160px;flex:1;max-width:280px}",
      ".at-filters{display:flex;flex-wrap:wrap;gap:8px;margin:-4px 0 14px}",
      ".at-filters[hidden]{display:none !important}",
      ".at-filters .lab{color:var(--muted);font-size:12px;letter-spacing:.12em;text-transform:uppercase;align-self:center;margin:0 4px 0 8px}",
      ".at-filters .lab:first-child{margin-left:0}",
      "#hist-alltime .at-kicker{color:var(--muted);font-size:13px;margin:0 0 12px;max-width:52rem;line-height:1.4}",
      "button.chip[disabled]{opacity:.35;cursor:default}",
      "#hist-alltime td.pct .band{display:block;font-size:11px;color:var(--muted);font-weight:400;line-height:1.15;margin-top:1px;white-space:nowrap}",
      "#hist-alltime .vs{display:inline-block;margin-left:6px;font-size:11px;color:var(--muted)}",
      "#hist-alltime .vs.up{color:var(--lime)}",
      "#hist-alltime .vs.down{color:var(--coral)}",
      "#hist-alltime .vs.even{color:var(--gold)}",
      "@media (max-width:860px){",
      "#hist-alltime .table-wrap{overflow-x:auto;max-height:none}",
      "#hist-alltime table{min-width:720px}",
      "#hist-alltime th:nth-child(2),#hist-alltime td:nth-child(2),#hist-alltime th:nth-child(3),#hist-alltime td:nth-child(3),#hist-alltime th:nth-child(5),#hist-alltime td:nth-child(5){display:none}",
      "#hist-alltime td .meta-full{display:block}",
      "#hist-alltime td .meta-desk{display:none}",
      "#hist-alltime th:nth-child(1),#hist-alltime td:nth-child(1),#hist-alltime th:nth-child(4),#hist-alltime td:nth-child(4){position:sticky;background:var(--bg-2)}",
      "#hist-alltime th:nth-child(1),#hist-alltime td:nth-child(1){left:0;z-index:4;width:2.6rem}",
      "#hist-alltime th:nth-child(4),#hist-alltime td:nth-child(4){left:2.6rem;z-index:3;width:9.5rem;box-shadow:8px 0 12px -8px rgba(0,0,0,.55)}",
      "#hist-alltime thead th:nth-child(1),#hist-alltime thead th:nth-child(4){z-index:9}",
      "#hist-alltime td.pct{padding-left:8px;padding-right:10px}",
      "#hist-alltime td.pct .vs{display:block;margin-left:0;font-size:10px}",
      ".at-tools{align-items:stretch}",
      ".at-tools .at-right{margin-left:0;flex-basis:100%;justify-content:stretch}",
      ".at-tools .search{max-width:none;min-width:0;width:100%}",
      "}"
    ].join("");
    document.head.appendChild(s);
  }

  function fmt(n) {
    if (n == null || isNaN(n)) return "";
    if (Math.abs(n) < 0.005) return "0";
    var abs = Math.abs(n);
    if (abs >= 10) return String(Math.round(Math.abs(n)));
    if (abs >= 1) return abs.toFixed(1);
    return abs.toFixed(2);
  }
  function fmtPct(n) {
    if (window.TR && TR.Model && TR.Model.fmtPct) return TR.Model.fmtPct(n);
    if (n == null || !isFinite(Number(n))) return "";
    var p = Math.round(Number(n) * 100);
    return p === 0 ? "<1%" : p + "%";
  }
  function fmtInt(n) {
    n = Number(n) || 0;
    return n ? String(n) : "0";
  }
  function fmtSigned(n) {
    if (n == null || isNaN(n) || Math.abs(n) < 0.25) return "0";
    return (n > 0 ? "+" : "\u2212") + Math.abs(n).toFixed(1);
  }
  function bandCell(r, k, pct) {
    var loKey = ({ eAs: "asL", eNba1: "n1L", eNba: "nbaL", eYrs: "yL", eCh: "chL", eMvp: "mL", pHof: "hL" })[k];
    var hiKey = ({ eAs: "asH", eNba1: "n1H", eNba: "nbaH", eYrs: "yH", eCh: "chH", eMvp: "mH", pHof: "hH" })[k];
    var head = pct ? fmtPct(r[k]) : fmt(r[k]);
    if (loKey == null || r[loKey] == null || r[hiKey] == null) return head;
    var t;
    if (pct) {
      var a = Math.round(Number(r[loKey]) * 100), b = Math.round(Number(r[hiKey]) * 100);
      t = a === b ? "" : a + "\u2013" + b + "%";
    } else {
      var a = fmt(r[loKey]), b = fmt(r[hiKey]);
      t = (!a || !b || a === b) ? "" : a + "\u2013" + b;
    }
    return t ? head + '<span class="band">' + t + "</span>" : head;
  }
  function vsCell(got, exp) {
    var n = Number(got) || 0;
    var d = n - (Number(exp) || 0);
    var cls = Math.abs(d) < 0.25 ? "even" : d > 0 ? "up" : "down";
    return n + ' <span class="vs ' + cls + '">' + fmtSigned(d) + "</span>";
  }
  function hofNowOf(r) {
    if (Number(r.hof)) return 1;
    var now = 2027;
    var yrs = Number(r.yrs) || 0;
    if (yrs === 0 && r.y >= now - 1) return Number(r.pHof) || 0;
    var last = r.y + yrs;
    var retiredFor = now - last;
    if (retiredFor >= 20 || yrs === 0) return 0;
    var as = Number(r.as) || 0, nba = Number(r.nba) || 0, nba1 = Number(r.nba1) || 0;
    var mvp = Number(r.mvp) || 0, ch = Number(r.ch) || 0;
    var s = mvp * 4.2 + nba1 * 0.55 + nba * 0.50 + as * 0.22 + ch * 0.28;
    var pr = 1 / (1 + Math.exp(-(s - 4.0)));
    if (mvp >= 1 && (as >= 6 || nba >= 5)) pr = Math.max(pr, 0.97);
    if (mvp >= 2) pr = Math.max(pr, 0.995);
    if (as >= 12 || nba >= 10) pr = Math.max(pr, 0.97);
    if (as >= 15 || (mvp >= 1 && as >= 8)) pr = Math.max(pr, 0.995);
    if (mvp >= 3 || (mvp >= 1 && nba >= 10) || as >= 18) pr = 1;
    if (retiredFor >= 8 && retiredFor < 20) pr *= Math.max(0, 1 - (retiredFor - 8) / 12);
    if (pr < 0) pr = 0;
    if (pr > 1) pr = 1;
    return pr;
  }
  function hofVs(r) {
    var nowP = r.hofNow != null ? r.hofNow : hofNowOf(r);
    var draftP = Number(r.pHof) || 0;
    var d = (nowP - draftP) * 100;
    var cls = Math.abs(d) < 1 ? "even" : d > 0 ? "up" : "down";
    var signed = Math.abs(d) < 1 ? "0" : ((d > 0 ? "+" : "\u2212") + String(Math.round(Math.abs(d))));
    var label = nowP >= 0.995 ? "100%" : nowP <= 0 ? "0%" : fmtPct(nowP);
    return label + ' <span class="vs ' + cls + '">' + signed + "</span>";
  }

  function injectPills(main, view) {
    if (document.getElementById("hist-pills")) return;
    var bar = document.createElement("div");
    bar.id = "hist-pills";
    bar.className = "toolbar hist-pills";
    bar.setAttribute("role", "tablist");
    bar.innerHTML =
      '<a class="chip' + (view === "drafts" ? " on" : "") + '" href="./drafts">Drafts</a>' +
      '<a class="chip' + (view === "alltime" ? " on" : "") + '" href="./drafts?view=alltime">All-time</a>' +
      '<a class="chip' + (view === "outliers" ? " on" : "") + '" href="./drafts?view=outliers">Outliers</a>';
    main.insertBefore(bar, main.firstChild);
  }

  function ensurePanels(main) {
    if (!document.getElementById("hist-drafts")) {
      var wrap = document.createElement("div");
      wrap.id = "hist-drafts";
      while (main.children.length > 1) wrap.appendChild(main.children[1]);
      main.appendChild(wrap);
    }
    if (!document.getElementById("hist-alltime")) {
      var box = document.createElement("div");
      box.id = "hist-alltime";
      box.hidden = true;
      box.innerHTML =
        '<div class="toolbar at-tools" role="tablist">' +
          '<button type="button" class="chip" data-when="now">Now</button>' +
          '<button type="button" class="chip" data-when="drafted">When drafted</button>' +
          '<div class="at-right">' +
            '<button type="button" class="chip" id="at-filter-btn">Filters</button>' +
            '<input class="search" id="at-q" type="search" placeholder="Search a player, team, or year" autocomplete="off">' +
          "</div>" +
        "</div>" +
        '<div class="at-filters" id="at-filters" hidden>' +
          '<span class="lab">Decade</span>' +
          '<button type="button" class="chip on" data-dec="">All</button>' +
          [1940,1950,1960,1970,1980,1990,2000,2010,2020].map(function (d) {
            return '<button type="button" class="chip" data-dec="' + d + '">' + d + "s</button>";
          }).join("") +
          '<span class="lab">Pos</span>' +
          '<button type="button" class="chip on" data-pos="">All</button>' +
          '<button type="button" class="chip" data-pos="G">G</button>' +
          '<button type="button" class="chip" data-pos="F">F</button>' +
          '<button type="button" class="chip" data-pos="C">C</button>' +
          '<span class="lab">Pick</span>' +
          '<button type="button" class="chip on" data-rd="">All</button>' +
          '<button type="button" class="chip" data-rd="lot">Lottery</button>' +
          '<button type="button" class="chip" data-rd="r1">First</button>' +
          '<button type="button" class="chip" data-rd="r2">Second</button>' +
        "</div>" +
        '<p class="at-kicker" id="at-kicker"></p>' +
        '<div class="table-wrap"><table><thead><tr id="at-head"></tr></thead><tbody id="at-rows"></tbody></table></div>' +
        '<div class="hist-pager" id="at-pager"></div>';
      main.appendChild(box);
      bindAllTime(box);
    }
    if (!document.getElementById("hist-outliers")) {
      var ol = document.createElement("div");
      ol.id = "hist-outliers";
      ol.hidden = true;
      ol.innerHTML =
        '<div class="ol-page">' +
          '<div class="toolbar ol-pills" role="tablist" aria-label="Outlier lists">' +
            '<button type="button" class="chip on" data-ol="over" role="tab" aria-selected="true">Overachieved</button>' +
            '<button type="button" class="chip" data-ol="under" role="tab" aria-selected="false">Underachieved</button>' +
            '<button type="button" class="chip" data-ol="diff" role="tab" aria-selected="false">Most different</button>' +
          "</div>" +
          '<div class="table-wrap"><table><thead><tr id="ol-head"></tr></thead><tbody id="ol-rows"></tbody></table></div>' +
        "</div>";
      main.appendChild(ol);
    }
  }

  function posGroup(pos) {
    pos = String(pos || "").toUpperCase();
    if (/C/.test(pos) && !/(PG|SG|SF)/.test(pos)) return "C";
    if (/\bC\b/.test(pos) && !/G/.test(pos)) return "C";
    if (/PG|SG|\bG\b|G\//.test(pos) && !/PF|C/.test(pos)) return "G";
    if (/SF|PF|\bF\b/.test(pos)) return "F";
    if (/C/.test(pos)) return "C";
    if (/G/.test(pos)) return "G";
    return "";
  }

  function valOf(r, key) {
    if (key === "n") return String(r.n || "").toLowerCase();
    if (key === "t") return String(r.t || "").toLowerCase();
    return Number(r[key]) || 0;
  }

  function filtered() {
    var rows = (allTime && allTime.players) || [];
    var q = at.q.trim().toLowerCase();
    return rows.filter(function (r) {
      if (at.dec && String(Math.floor(r.y / 10) * 10) !== String(at.dec)) return false;
      if (at.pos && posGroup(r.pos) !== at.pos) return false;
      if (at.rd === "lot" && r.pk > 14) return false;
      if (at.rd === "r1" && r.pk > 30) return false;
      if (at.rd === "r2" && r.pk <= 30) return false;
      if (!q) return true;
      return (r.n || "").toLowerCase().indexOf(q) >= 0
        || (r.t || "").toLowerCase().indexOf(q) >= 0
        || (r.c || "").toLowerCase().indexOf(q) >= 0
        || String(r.y).indexOf(q) >= 0
        || String(r.pk) === q;
    });
  }

  function sorted(rows) {
    var key = at.sort;
    var dir = at.dir;
    var copy = rows.slice();
    copy.sort(function (a, b) {
      var av = valOf(a, key), bv = valOf(b, key);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      if (a.y !== b.y) return b.y - a.y;
      return a.pk - b.pk;
    });
    return copy;
  }

  function cols() {
    if (at.when === "drafted") {
      return [
        { k: "eAs", label: "AS" },
        { k: "eNba1", label: "1st" },
        { k: "eNba", label: "All-NBA" },
        { k: "eYrs", label: "Yrs" },
        { k: "eCh", label: "Chips" },
        { k: "eMvp", label: "MVP" },
        { k: "pHof", label: "HOF" }
      ];
    }
    return [
      { k: "as", e: "eAs", label: "AS" },
      { k: "nba1", e: "eNba1", label: "1st" },
      { k: "nba", e: "eNba", label: "All-NBA" },
      { k: "yrs", e: "eYrs", label: "Yrs" },
      { k: "ch", e: "eCh", label: "Chips" },
      { k: "mvp", e: "eMvp", label: "MVP" },
      { k: "hofNow", e: "pHof", label: "HOF", hof: true }
    ];
  }

  function cell(r, c) {
    if (at.when === "drafted") {
      if (c.k === "pHof") return bandCell(r, "pHof", true);
      return bandCell(r, c.k, false);
    }
    if (c.hof) return hofVs(r);
    return vsCell(r[c.k], r[c.e]);
  }

  function syncWhenUrl() {
    var url = new URL(location.href);
    if (at.when === "now") url.searchParams.set("when", "now");
    else url.searchParams.delete("when");
    history.replaceState({}, "", url);
  }

  function paintAllTime(page) {
    var body = document.getElementById("at-rows");
    var head = document.getElementById("at-head");
    var pager = document.getElementById("at-pager");
    if (!allTime || !body) return;
    var rows = sorted(filtered());
    var n = rows.length;
    var pages = Math.max(1, Math.ceil(n / PAGE));
    if (page == null) page = at.page;
    if (page < 0) page = 0;
    if (page > pages - 1) page = pages - 1;
    at.page = page;
    var slice = rows.slice(page * PAGE, page * PAGE + PAGE);
    var honor = cols();
    if (head) {
      head.innerHTML = '<th class="num">Rk</th>'
        + '<th data-k="y">Year</th><th class="num" data-k="pk">Pk</th><th data-k="n">Player</th><th data-k="t">Team</th>'
        + honor.map(function (c) {
          var cls = "num" + (at.sort === c.k ? (at.dir > 0 ? " on asc" : " on") : "");
          return '<th class="' + cls + '" data-k="' + c.k + '">' + c.label + "</th>";
        }).join("");
      head.querySelectorAll("[data-k]").forEach(function (th) {
        if (th.getAttribute("data-k") === at.sort) th.classList.add(at.dir > 0 ? "asc" : "on");
        th.onclick = function () {
          var k = th.getAttribute("data-k");
          if (at.sort === k) at.dir *= -1;
          else { at.sort = k; at.dir = (k === "n" || k === "t" || k === "pk") ? 1 : -1; }
          paintAllTime(0);
        };
      });
    }
    body.innerHTML = slice.length ? slice.map(function (r, i) {
      var rk = page * PAGE + i + 1;
      var pad = String(r.pk).padStart(2, "0");
      var href = "./player.html?year=" + encodeURIComponent(r.y) + "&id=" + encodeURIComponent(r.id);
      var meta = [r.pos, r.c].filter(Boolean).join(" \u00b7 ");
      var mobileMeta = r.y + " \u00b7 #" + pad + (meta ? " \u00b7 " + meta : "");
      return '<tr onclick="location.href=\'' + href + '\'">'
        + '<td class="rank">' + rk + "</td>"
        + '<td class="rank">' + r.y + "</td>"
        + '<td class="rank">' + pad + "</td>"
        + '<td><div class="name">' + r.n + "</div>"
        + '<div class="meta meta-full">' + mobileMeta + "</div>"
        + (meta ? '<div class="meta meta-desk">' + meta + "</div>" : "") + "</td>"
        + "<td>" + (r.t || "\u2014") + "</td>"
        + honor.map(function (c) { return '<td class="pct">' + cell(r, c) + "</td>"; }).join("")
        + "</tr>";
    }).join("") : '<tr><td colspan="12" style="color:var(--muted);padding:24px">No players match.</td></tr>';
    if (pager) {
      var from = n ? page * PAGE + 1 : 0;
      var to = Math.min(n, (page + 1) * PAGE);
      pager.innerHTML =
        '<button type="button" class="chip" data-at="prev"' + (page === 0 ? " disabled" : "") + ">Prev</button>" +
        '<button type="button" class="chip" data-at="next"' + (page >= pages - 1 ? " disabled" : "") + ">Next</button>" +
        '<span class="count">' + from + "\u2013" + to + " of " + n + "</span>";
      pager.querySelectorAll("[data-at]").forEach(function (btn) {
        btn.onclick = function () {
          if (btn.disabled) return;
          paintAllTime(btn.getAttribute("data-at") === "prev" ? at.page - 1 : at.page + 1);
        };
      });
    }
    document.querySelectorAll("[data-when]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-when") === at.when);
    });
    var filterBtn = document.getElementById("at-filter-btn");
    if (filterBtn) filterBtn.classList.toggle("on", !!(at.dec || at.pos || at.rd));
    var kick = document.getElementById("at-kicker");
    if (kick) {
      kick.textContent = at.when === "drafted"
        ? "Draft night from age, size, and the college line. Not the pick. Not the NBA career."
        : "Career totals. Green and red are versus what the file said on draft night.";
    }
    at.painted = true;
  }

  function setWhen(when) {
    at.when = when === "drafted" ? "drafted" : "now";
    if (at.when === "drafted") {
      var map = { as: "eAs", nba1: "eNba1", nba: "eNba", yrs: "eYrs", ch: "eCh", mvp: "eMvp", hofNow: "pHof", hof: "pHof" };
      if (map[at.sort]) at.sort = map[at.sort];
    } else {
      var back = { eAs: "as", eNba1: "nba1", eNba: "nba", eYrs: "yrs", eCh: "ch", eMvp: "mvp", pHof: "hofNow" };
      if (back[at.sort]) at.sort = back[at.sort];
    }
    at.dir = -1;
    syncWhenUrl();
    paintAllTime(0);
  }

  function bindAllTime(root) {
    if (root.getAttribute("data-bound")) return;
    root.setAttribute("data-bound", "1");
    root.addEventListener("click", function (ev) {
      var when = ev.target.closest("[data-when]");
      if (when) { setWhen(when.getAttribute("data-when")); return; }
      if (ev.target.id === "at-filter-btn" || ev.target.closest("#at-filter-btn")) {
        var pan = document.getElementById("at-filters");
        if (pan) pan.hidden = !pan.hidden;
        return;
      }
      var dec = ev.target.closest("[data-dec]");
      if (dec && dec.hasAttribute("data-dec")) {
        at.dec = dec.getAttribute("data-dec");
        root.querySelectorAll("[data-dec]").forEach(function (b) { b.classList.toggle("on", b === dec); });
        paintAllTime(0);
        return;
      }
      var pos = ev.target.closest("[data-pos]");
      if (pos && pos.hasAttribute("data-pos")) {
        at.pos = pos.getAttribute("data-pos");
        root.querySelectorAll("[data-pos]").forEach(function (b) { b.classList.toggle("on", b === pos); });
        paintAllTime(0);
        return;
      }
      var rd = ev.target.closest("[data-rd]");
      if (rd && rd.hasAttribute("data-rd")) {
        at.rd = rd.getAttribute("data-rd");
        root.querySelectorAll("[data-rd]").forEach(function (b) { b.classList.toggle("on", b === rd); });
        paintAllTime(0);
      }
    });
    var q = root.querySelector("#at-q");
    if (q) {
      q.addEventListener("input", function () {
        at.q = q.value || "";
        paintAllTime(0);
      });
    }
  }

  function loadAllTime() {
    if (!at.inited) {
      at.when = whenOf();
      at.sort = at.when === "drafted" ? "eAs" : "as";
      at.dir = -1;
      at.inited = true;
    }
    if (allTime) { paintAllTime(at.painted ? at.page : 0); return; }
    fetch("./assets/all-time.json?v=21")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        allTime = data || { players: [] };
        (allTime.players || []).forEach(function (r) { r.hofNow = hofNowOf(r); });
        paintAllTime(0);
      })
      .catch(function () {
        var body = document.getElementById("at-rows");
        if (body) body.innerHTML = '<tr><td colspan="12" style="color:var(--muted);padding:24px">Could not load the list.</td></tr>';
      });
  }

  function apply(view) {
    var drafts = document.getElementById("hist-drafts");
    var box = document.getElementById("hist-alltime");
    var ol = document.getElementById("hist-outliers");
    if (drafts) drafts.hidden = view !== "drafts";
    if (box) box.hidden = view !== "alltime";
    if (ol) ol.hidden = view !== "outliers";
    var q = document.getElementById("archive-q");
    if (q) q.hidden = view !== "drafts";
    if (view === "alltime") loadAllTime();
    if (view === "outliers" && window.TR && typeof TR.mountOutliers === "function") {
      var rows = document.getElementById("ol-rows");
      if (rows) rows.removeAttribute("data-ready");
      TR.mountOutliers();
    }
    document.title = (view === "alltime" ? "All-time" : view === "outliers" ? "Outliers" : "NBA Draft History 1947–2026") + " | The Draft Model";
  }

  function isDraftsPage() {
    var path = location.pathname || "";
    var href = location.href || "";
    return /\/drafts(\.html)?\/?$/i.test(path) || /\/drafts(\.html)?(\?|#|$)/i.test(href) || !!document.getElementById("archive-q") || !!document.getElementById("acc-root");
  }

  function mount() {
    if (!isDraftsPage()) return;
    var main = document.querySelector("main.section") || document.querySelector("main.wrap.section") || document.querySelector("main.wrap");
    if (!main) return;
    css();
    var view = viewOf();
    injectPills(main, view);
    ensurePanels(main);
    apply(view);
  }

  function wrapRender() {
    var fn = window.TR && TR.renderDrafts;
    if (typeof fn !== "function" || fn.__histHub) return;
    TR.renderDrafts = function () {
      var r = fn.apply(this, arguments);
      if (r && typeof r.then === "function") return r.then(function (x) { mount(); return x; });
      mount();
      setTimeout(mount, 0);
      setTimeout(mount, 200);
      return r;
    };
    TR.renderDrafts.__histHub = true;
  }

  function tryMount() {
    wrapRender();
    if (document.querySelector("main")) mount();
  }

  var obs = new MutationObserver(function () { tryMount(); });
  if (document.getElementById("app")) obs.observe(document.getElementById("app"), { childList: true, subtree: false });
  document.addEventListener("DOMContentLoaded", tryMount);
  setTimeout(tryMount, 0);
  setTimeout(tryMount, 300);
})();
