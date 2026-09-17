(function () {
  var TITLE = { over: "Overachieved", under: "Underachieved", diff: "Most different" };
  var DELTA_TH = "Δ is career ÷ the draft-night model on 1×AS + 2×All-NBA + 3×1st + 4×Chips + 10×MVP + 20×HOF + 0.25×Yrs. Ranked on that fold, not raw career size.";

  function keyFromUrl() {
    var q = (new URLSearchParams(location.search).get("list") || "").toLowerCase();
    if (q === "over" || q === "under" || q === "diff") return q;
    var h = (location.hash || "").replace(/^#/, "").toLowerCase();
    if (h === "over" || h === "under" || h === "diff") return h;
    return "over";
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

  function fmtDelta(n) {
    if (n == null || !isFinite(Number(n))) return "";
    var v = Number(n);
    if (v >= 10) return "×" + v.toFixed(0);
    if (v >= 1) return "×" + v.toFixed(1);
    return "×" + v.toFixed(2);
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

  function rowHtml(r) {
    var href = "./player.html?year=" + encodeURIComponent(r.y) + "&id=" + encodeURIComponent(r.id);
    var dlt = Number(r.delta) || 0;
    var dcls = dlt >= 1 ? " up" : dlt > 0 ? "" : " down";
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
        + '<td class="delta' + dcls + '">' + fmtDelta(dlt) + "</td>"
      + "</tr>"
    );
  }

  function paint(data, list) {
    css();
    var rows = (data && data[list]) || [];
    var head = document.getElementById("ol-head");
    var body = document.getElementById("ol-rows");
    if (head) {
      head.innerHTML = "<th>Year</th><th>Pk</th><th>Player</th><th>Team</th>"
        + "<th class=\"num\">AS</th><th class=\"num\">1st</th><th class=\"num\">All-NBA</th>"
        + "<th class=\"num\">Yrs</th><th class=\"num\">Chips</th><th class=\"num\">MVP</th>"
        + "<th class=\"num\">HOF</th>"
        + '<th class="num" title="' + DELTA_TH + '">Δ</th>';
    }
    if (body) {
      body.innerHTML = rows.length
        ? rows.map(rowHtml).join("")
        : '<tr><td colspan="12" style="color:var(--muted);padding:24px">No rows.</td></tr>';
    }
    document.querySelectorAll("[data-ol]").forEach(function (btn) {
      var on = btn.getAttribute("data-ol") === list;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.title = (TITLE[list] || "Outliers") + " | The Draft Model";
  }

  function setList(list, data) {
    if (list !== "over" && list !== "under" && list !== "diff") list = "over";
    if (location.hash.replace(/^#/, "") !== list) {
      history.replaceState(null, "", location.pathname + location.search + "#" + list);
    }
    paint(data, list);
  }

  function mount() {
    var box = document.getElementById("ol-rows");
    if (!box || box.getAttribute("data-ready")) return;
    box.setAttribute("data-ready", "1");
    css();
    fetch("./assets/outliers.json?v=11")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) {
          box.innerHTML = '<tr><td colspan="12" style="color:var(--muted);padding:24px">Could not load the lists.</td></tr>';
          return;
        }
        setList(keyFromUrl(), data);
        document.querySelectorAll("[data-ol]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            setList(btn.getAttribute("data-ol"), data);
          });
        });
        window.addEventListener("hashchange", function () {
          setList(keyFromUrl(), data);
        });
      })
      .catch(function () {
        box.innerHTML = '<tr><td colspan="12" style="color:var(--muted);padding:24px">Could not load the lists.</td></tr>';
      });
  }

  window.TR = window.TR || {};
  TR.mountOutliers = mount;
  TR.renderOutliers = function (root) {
    if (typeof TR.renderSimple === "function") {
      TR.renderSimple(root, "outliers", "Outliers", DELTA_TH, document.getElementById("app") ? "" : "");
    }
    mount();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
