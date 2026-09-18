(function () {
  var TITLE = { over: "Overachieved", under: "Underachieved", diff: "Most different" };
  var PAGE = 20;
  var NOW = 2026;
  var FLOOR = 0.6;
  var W = { as: 1, nba: 2, nba1: 3, ch: 4, mvp: 10, hof: 20, yrs: 0.25 };
  var KICK = {
    over: "Players with a real career (2+ All-Stars or an MVP). Sorted by career ÷ draft-night.",
    under: "Every player in the file. Sorted by how far the career is below the draft-night number. Years that have not happened yet are not counted as a miss.",
    diff: "Largest gap either way, on the same honor score."
  };
  var DELTA_TH = {
    over: "Δ is career ÷ the draft-night model on 1×AS + 2×All-NBA + 3×1st + 4×Chips + 10×MVP + 20×HOF + 0.25×Yrs.",
    under: "Δ is career minus the draft-night model, prorated for seasons that have been played. More negative = more under.",
    diff: "Δ is career ÷ the draft-night model. Sorted by |log fold|."
  };

  var scored = null;
  var lists = { over: [], under: [], diff: [] };
  var page = 0;
  var q = "";

  function keyFromUrl() {
    var query = (new URLSearchParams(location.search).get("list") || "").toLowerCase();
    if (query === "over" || query === "under" || query === "diff") return query;
    var h = (location.hash || "").replace(/^#/, "").toLowerCase();
    if (h === "over" || h === "under" || h === "diff") return h;
    return "over";
  }

  function num(v) {
    var n = Number(v);
    return isFinite(n) ? n : 0;
  }

  function honor(as_, nba, nba1, ch, mvp, hof, yrs) {
    return W.as * as_ + W.nba * nba + W.nba1 * nba1 + W.ch * ch + W.mvp * mvp + W.hof * hof + W.yrs * yrs;
  }

  function scoreRow(r) {
    var y = num(r.y);
    var hof = num(r.hof);
    var ast = num(r.as);
    var mvp = num(r.mvp);
    if (y >= 2005 && hof && ast < 8 && mvp === 0) hof = 0;
    var act = honor(ast, num(r.nba), num(r.nba1), num(r.ch), mvp, hof, num(r.yrs));
    var exp = honor(num(r.eAs), num(r.eNba), num(r.eNba1), num(r.eCh), num(r.eMvp), num(r.pHof), num(r.eYrs));
    var open = Math.max(0, NOW - y);
    var frac = open <= 0 ? 0 : Math.min(1, open / 8);
    var expNow = exp * frac;
    var gap = act - expNow;
    var fold = frac <= 0 ? 1 : act / Math.max(expNow, FLOOR);
    var log = Math.abs(Math.log(Math.max(fold, 1e-6)));
    return {
      n: r.n, y: y, pk: num(r.pk), id: r.id || "", t: r.t || "", pos: r.pos || "", c: r.c || "",
      as: ast, nba1: num(r.nba1), nba: num(r.nba), yrs: num(r.yrs), ch: num(r.ch), mvp: mvp, hof: hof,
      eAs: num(r.eAs), eNba1: num(r.eNba1), eNba: num(r.eNba), eYrs: num(r.eYrs),
      eCh: num(r.eCh), eMvp: num(r.eMvp), eHof: num(r.pHof),
      act: act, exp: exp, expNow: expNow, gap: gap, fold: fold, log: log
    };
  }

  function buildLists(players) {
    scored = (players || []).map(scoreRow).filter(function (r) { return r.y && r.pk; });
    lists.under = scored.slice().sort(function (a, b) { return a.gap - b.gap; });
    lists.over = scored.filter(function (s) { return s.as >= 2 || s.mvp >= 1; })
      .sort(function (a, b) { return b.fold - a.fold; });
    lists.diff = scored.slice().sort(function (a, b) { return b.log - a.log; });
  }

  function fmtSigned(n) {
    if (n == null || isNaN(n) || Math.abs(n) < 0.25) return "0";
    return (n > 0 ? "+" : "\u2212") + Math.abs(n).toFixed(1);
  }

  function vsCell(got, exp) {
    var n = Number(got) || 0;
    var d = n - (Number(exp) || 0);
    var cls = Math.abs(d) < 0.25 ? "even" : d > 0 ? "up" : "down";
    return n + ' <span class="vs ' + cls + '">' + fmtSigned(d) + "</span>";
  }

  function fmtFold(n) {
    if (n == null || !isFinite(Number(n))) return "";
    var v = Number(n);
    if (v >= 10) return "\u00d7" + v.toFixed(0);
    if (v >= 1) return "\u00d7" + v.toFixed(1);
    return "\u00d7" + v.toFixed(2);
  }

  function fmtGap(n) {
    if (n == null || !isFinite(Number(n))) return "";
    var v = Number(n);
    if (Math.abs(v) < 0.05) return "0";
    return (v > 0 ? "+" : "\u2212") + Math.abs(v).toFixed(1);
  }

  function teamOf(t) {
    t = String(t || "").replace(/\s*\(.*?\)\s*/g, "").trim();
    return t || "\u2014";
  }

  function metaOf(r) {
    return [r.pos, r.c].filter(Boolean).join(" \u00b7 ");
  }

  function css() {
    if (document.getElementById("ol-css")) return;
    var s = document.createElement("style");
    s.id = "ol-css";
    s.textContent = [
      ".section:has(.ol-page) .prose{max-width:none}",
      ".ol-page{max-width:none}",
      ".ol-pills{margin:0 0 14px}",
      ".ol-page .table-wrap{margin-top:0}",
      ".ol-page td.pct,.ol-page td.rank,.ol-page th.num{text-align:right;font-variant-numeric:tabular-nums}",
      ".ol-page td.delta{font-family:var(--mono);font-weight:560;text-align:right;white-space:nowrap}",
      ".ol-page td.delta.up{color:var(--lime)}",
      ".ol-page td.delta.down{color:var(--coral)}",
      ".ol-page tr{cursor:pointer}",
      ".vs{display:inline-block;margin-left:6px;font-size:11px;color:var(--muted)}",
      ".vs.up{color:var(--lime)}",
      ".vs.down{color:var(--coral)}",
      ".vs.even{color:var(--gold)}"
    ].join("");
    document.head.appendChild(s);
  }

  function rowHtml(r, list) {
    var href = "./player.html?year=" + encodeURIComponent(r.y) + "&id=" + encodeURIComponent(r.id);
    var under = list === "under";
    var dlt = under ? r.gap : r.fold;
    var dcls = under ? (dlt < -0.25 ? " down" : dlt > 0.25 ? " up" : "") : (dlt >= 1 ? " up" : dlt > 0 ? "" : " down");
    var dtxt = under ? fmtGap(dlt) : fmtFold(dlt);
    var team = teamOf(r.t);
    var meta = metaOf(r);
    return (
      '<tr onclick="location.href=\'' + href + '\'">'
        + '<td class="rank">' + r.y + "</td>"
        + '<td class="rank">' + String(r.pk).padStart(2, "0") + "</td>"
        + '<td><div class="name">' + r.n + "</div>"
        + (meta ? '<div class="meta">' + meta + "</div>" : "")
        + "</td>"
        + "<td>" + team + "</td>"
        + '<td class="pct">' + vsCell(r.as, r.eAs) + "</td>"
        + '<td class="pct">' + vsCell(r.nba1, r.eNba1) + "</td>"
        + '<td class="pct">' + vsCell(r.nba, r.eNba) + "</td>"
        + '<td class="pct">' + vsCell(r.yrs, r.eYrs) + "</td>"
        + '<td class="pct">' + vsCell(r.ch, r.eCh) + "</td>"
        + '<td class="pct">' + vsCell(r.mvp, r.eMvp) + "</td>"
        + '<td class="pct">' + vsCell(r.hof, r.eHof) + "</td>"
        + '<td class="delta' + dcls + '">' + dtxt + "</td>"
      + "</tr>"
    );
  }

  function filtered(list) {
    var rows = lists[list] || [];
    var needle = (q || "").trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(function (r) {
      return String(r.n || "").toLowerCase().indexOf(needle) >= 0
        || String(r.t || "").toLowerCase().indexOf(needle) >= 0
        || String(r.y).indexOf(needle) >= 0
        || String(r.c || "").toLowerCase().indexOf(needle) >= 0;
    });
  }

  function paint(list) {
    css();
    var rows = filtered(list);
    var pages = Math.max(1, Math.ceil(rows.length / PAGE));
    if (page >= pages) page = pages - 1;
    if (page < 0) page = 0;
    var slice = rows.slice(page * PAGE, page * PAGE + PAGE);
    var head = document.getElementById("ol-head");
    var body = document.getElementById("ol-rows");
    var kick = document.getElementById("ol-kicker");
    var pager = document.getElementById("ol-pager");
    if (head) {
      head.innerHTML = "<th>Year</th><th>Pk</th><th>Player</th><th>Team</th>"
        + "<th class=\"num\">AS</th><th class=\"num\">1st</th><th class=\"num\">All-NBA</th>"
        + "<th class=\"num\">Yrs</th><th class=\"num\">Chips</th><th class=\"num\">MVP</th>"
        + "<th class=\"num\">HOF</th>"
        + '<th class="num" title="' + (DELTA_TH[list] || "") + '">Δ</th>';
    }
    if (body) {
      body.innerHTML = slice.length
        ? slice.map(function (r) { return rowHtml(r, list); }).join("")
        : '<tr><td colspan="12" style="color:var(--muted);padding:24px">No rows.</td></tr>';
    }
    if (kick) kick.textContent = KICK[list] || "";
    if (pager) {
      var n = rows.length;
      var from = n ? page * PAGE + 1 : 0;
      var to = Math.min(n, page * PAGE + PAGE);
      pager.innerHTML =
        '<button type="button" class="chip" data-ol-page="prev"' + (page <= 0 ? " disabled" : "") + ">Prev</button>" +
        '<button type="button" class="chip" data-ol-page="next"' + (page >= pages - 1 ? " disabled" : "") + ">Next</button>" +
        '<span class="count">' + from + "\u2013" + to + " of " + n + "</span>";
      pager.querySelectorAll("[data-ol-page]").forEach(function (btn) {
        btn.onclick = function () {
          if (btn.disabled) return;
          page += btn.getAttribute("data-ol-page") === "prev" ? -1 : 1;
          paint(list);
        };
      });
    }
    document.querySelectorAll("[data-ol]").forEach(function (btn) {
      var on = btn.getAttribute("data-ol") === list;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.title = (TITLE[list] || "Outliers") + " | The Draft Model";
  }

  function setList(list) {
    if (list !== "over" && list !== "under" && list !== "diff") list = "over";
    if (location.hash.replace(/^#/, "") !== list) {
      history.replaceState(null, "", location.pathname + location.search + "#" + list);
    }
    page = 0;
    paint(list);
  }

  function bind() {
    document.querySelectorAll("[data-ol]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setList(btn.getAttribute("data-ol"));
      });
    });
    var box = document.getElementById("ol-q");
    if (box && !box.getAttribute("data-ol-bound")) {
      box.setAttribute("data-ol-bound", "1");
      box.addEventListener("input", function () {
        q = box.value || "";
        page = 0;
        paint(keyFromUrl());
      });
    }
    window.addEventListener("hashchange", function () {
      setList(keyFromUrl());
    });
  }

  function mount() {
    var box = document.getElementById("ol-rows");
    if (!box || box.getAttribute("data-ready")) return;
    box.setAttribute("data-ready", "1");
    css();
    fetch("./assets/all-time.json?v=29")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.players) {
          box.innerHTML = '<tr><td colspan="12" style="color:var(--muted);padding:24px">Could not load the lists.</td></tr>';
          return;
        }
        buildLists(data.players);
        bind();
        setList(keyFromUrl());
      })
      .catch(function () {
        box.innerHTML = '<tr><td colspan="12" style="color:var(--muted);padding:24px">Could not load the lists.</td></tr>';
      });
  }

  window.TR = window.TR || {};
  TR.mountOutliers = mount;
  TR.renderOutliers = function (root) {
    if (typeof TR.renderSimple === "function") {
      TR.renderSimple(root, "outliers", "Outliers", "", document.getElementById("app") ? "" : "");
    }
    mount();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
