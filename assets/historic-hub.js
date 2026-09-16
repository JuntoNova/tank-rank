(function () {
  var PAGE = 20;
  var allTime = null;
  var allPage = 0;

  function viewOf() {
    var v = (new URLSearchParams(location.search).get("view") || "drafts").toLowerCase();
    if (v === "all-time" || v === "alltime" || v === "all") return "alltime";
    if (v === "outliers" || v === "outlier") return "outliers";
    return "drafts";
  }

  function css() {
    if (document.getElementById("hist-hub-css")) return;
    var s = document.createElement("style");
    s.id = "hist-hub-css";
    s.textContent = [
      ".hist-pills{margin:0 0 18px}",
      ".hist-pills a.chip{text-decoration:none}",
      "#hist-alltime .table-wrap,#hist-outliers .table-wrap{margin-top:0}",
      "#hist-alltime td.pct,#hist-alltime td.rank,#hist-alltime th.num{text-align:right;font-variant-numeric:tabular-nums}",
      "#hist-alltime tr{cursor:pointer}",
      ".hist-pager{display:flex;gap:8px;align-items:center;margin:14px 0 0;flex-wrap:wrap}",
      ".hist-pager .chip{cursor:pointer}",
      ".hist-pager .count{color:var(--muted);font-size:13px;margin-left:auto}"
    ].join("");
    document.head.appendChild(s);
  }

  function fmt(n) {
    if (window.TR && TR.Model && TR.Model.fmtExp) return TR.Model.fmtExp(n);
    if (n == null || isNaN(n)) return "";
    if (Math.abs(n) < 0.05) return "0";
    if (Math.abs(n) < 0.1) return "<0.1";
    return Math.abs(n) >= 10 ? String(Math.round(n)) : Number(n).toFixed(1);
  }
  function fmtPct(n) {
    if (window.TR && TR.Model && TR.Model.fmtPct) return TR.Model.fmtPct(n);
    if (n == null || !isFinite(Number(n))) return "";
    var p = Math.round(Number(n) * 100);
    return p === 0 ? "<1%" : p + "%";
  }

  function hrefFor(v) {
    if (v === "drafts") return "./drafts";
    if (v === "alltime") return "./drafts?view=alltime";
    return "./drafts?view=outliers";
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
      var at = document.createElement("div");
      at.id = "hist-alltime";
      at.hidden = true;
      at.innerHTML = '<div class="table-wrap"><table><thead><tr id="at-head"></tr></thead><tbody id="at-rows"></tbody></table></div><div class="hist-pager" id="at-pager"></div>';
      main.appendChild(at);
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

  function paintAllTime(page) {
    var data = allTime;
    var body = document.getElementById("at-rows");
    var head = document.getElementById("at-head");
    var pager = document.getElementById("at-pager");
    if (!data || !body) return;
    var rows = data.players || [];
    var n = rows.length;
    var pages = Math.max(1, Math.ceil(n / PAGE));
    if (page < 0) page = 0;
    if (page > pages - 1) page = pages - 1;
    allPage = page;
    var slice = rows.slice(page * PAGE, page * PAGE + PAGE);
    if (head) {
      head.innerHTML = "<th>Rk</th><th>Year</th><th>Pk</th><th>Player</th><th>Team</th>"
        + '<th class="num">AS</th><th class="num">1st</th><th class="num">All-NBA</th>'
        + '<th class="num">MVP</th><th class="num">HOF</th>';
    }
    body.innerHTML = slice.map(function (r, i) {
      var rk = page * PAGE + i + 1;
      var href = "./player.html?year=" + encodeURIComponent(r.y) + "&id=" + encodeURIComponent(r.id);
      var team = String(r.t || "").replace(/\s*\(.*?\)\s*/g, "").trim() || "\u2014";
      var meta = [r.pos, r.c].filter(Boolean).join(" \u00b7 ");
      return '<tr onclick="location.href=\'' + href + '\'">'
        + '<td class="rank">' + rk + "</td>"
        + '<td class="rank">' + r.y + "</td>"
        + '<td class="rank">' + String(r.pk).padStart(2, "0") + "</td>"
        + '<td><div class="name">' + r.n + "</div>" + (meta ? '<div class="meta">' + meta + "</div>" : "") + "</td>"
        + "<td>" + team + "</td>"
        + '<td class="pct">' + fmt(r.eAs) + "</td>"
        + '<td class="pct">' + fmt(r.eNba1) + "</td>"
        + '<td class="pct">' + fmt(r.eNba) + "</td>"
        + '<td class="pct">' + fmt(r.eMvp) + "</td>"
        + '<td class="pct">' + fmtPct(r.pHof) + "</td>"
        + "</tr>";
    }).join("");
    if (pager) {
      var from = n ? page * PAGE + 1 : 0;
      var to = Math.min(n, (page + 1) * PAGE);
      pager.innerHTML =
        '<button type="button" class="chip" data-at="prev"' + (page === 0 ? " disabled" : "") + ">Prev</button>" +
        '<button type="button" class="chip" data-at="next"' + (page >= pages - 1 ? " disabled" : "") + ">Next</button>" +
        '<span class="count">' + from + "\u2013" + to + " of " + n + "</span>";
      pager.querySelectorAll("[data-at]").forEach(function (btn) {
        btn.onclick = function () {
          if (btn.getAttribute("data-at") === "prev") paintAllTime(allPage - 1);
          else paintAllTime(allPage + 1);
        };
      });
    }
  }

  function loadAllTime() {
    if (allTime) { paintAllTime(0); return; }
    fetch("./assets/all-time.json?v=1")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        allTime = data || { players: [] };
        paintAllTime(0);
      })
      .catch(function () {
        var body = document.getElementById("at-rows");
        if (body) body.innerHTML = '<tr><td colspan="10" style="color:var(--muted);padding:24px">Could not load the list.</td></tr>';
      });
  }

  function apply(view) {
    var drafts = document.getElementById("hist-drafts");
    var at = document.getElementById("hist-alltime");
    var ol = document.getElementById("hist-outliers");
    if (drafts) drafts.hidden = view !== "drafts";
    if (at) at.hidden = view !== "alltime";
    if (ol) ol.hidden = view !== "outliers";
    var q = document.getElementById("archive-q");
    if (q) q.hidden = view !== "drafts";
    if (view === "alltime") loadAllTime();
    if (view === "outliers" && window.TR && typeof TR.mountOutliers === "function") {
      var box = document.getElementById("ol-rows");
      if (box) box.removeAttribute("data-ready");
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
