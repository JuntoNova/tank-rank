/*! Historic hub glue — plain sync JS. Wraps drafts render with Drafts / All-time / Outliers. */
(function () {
  var H = window.__HH;
  if (!H) {
    console.error("[PR-J] historic-hub-lib missing");
    return;
  }

  var viewOf = H.viewOf;
  var whenOf = H.whenOf;
  var css = H.css;
  var injectPills = H.injectPills;
  var ensurePanels = H.ensurePanels;
  var filtered = H.filtered;
  var sorted = H.sorted;
  var cols = H.cols;
  var cell = H.cell;
  var syncWhenUrl = H.syncWhenUrl;
  var hofNowOf = H.hofNowOf;

  window.__HH_bindAllTime = function bindAllTime(root) {
    if (!root || root.getAttribute("data-bound")) return;
    root.setAttribute("data-bound", "1");

    root.addEventListener("click", function (ev) {
      var whenBtn = ev.target.closest("[data-when]");
      if (whenBtn) {
        var w = whenBtn.getAttribute("data-when");
        H.at.when = w === "drafted" ? "drafted" : "now";
        if (H.at.when === "drafted") {
          var toDraft = {
            as: "eAs", nba1: "eNba1", nba: "eNba", yrs: "eYrs",
            ch: "eCh", mvp: "eMvp", hofNow: "pHof", hof: "pHof",
            pts: "ePts", trb: "eReb", ast: "eAst", blk: "eBlk"
          };
          if (toDraft[H.at.sort]) H.at.sort = toDraft[H.at.sort];
        } else {
          var toNow = {
            eAs: "as", eNba1: "nba1", eNba: "nba", eYrs: "yrs",
            eCh: "ch", eMvp: "mvp", pHof: "hofNow",
            ePts: "pts", eReb: "trb", eAst: "ast", eBlk: "blk"
          };
          if (toNow[H.at.sort]) H.at.sort = toNow[H.at.sort];
        }
        H.at.dir = -1;
        syncWhenUrl();
        paintAllTime(0);
        return;
      }

      if (ev.target.id === "at-filter-btn" || ev.target.closest("#at-filter-btn")) {
        var filters = document.getElementById("at-filters");
        if (filters) filters.hidden = !filters.hidden;
        return;
      }

      var dec = ev.target.closest("[data-dec]");
      if (dec && dec.hasAttribute("data-dec")) {
        H.at.dec = dec.getAttribute("data-dec");
        root.querySelectorAll("[data-dec]").forEach(function (el) {
          el.classList.toggle("on", el === dec);
        });
        paintAllTime(0);
        return;
      }

      var pos = ev.target.closest("[data-pos]");
      if (pos && pos.hasAttribute("data-pos")) {
        H.at.pos = pos.getAttribute("data-pos");
        root.querySelectorAll("[data-pos]").forEach(function (el) {
          el.classList.toggle("on", el === pos);
        });
        paintAllTime(0);
        return;
      }

      var rd = ev.target.closest("[data-rd]");
      if (rd && rd.hasAttribute("data-rd")) {
        H.at.rd = rd.getAttribute("data-rd");
        root.querySelectorAll("[data-rd]").forEach(function (el) {
          el.classList.toggle("on", el === rd);
        });
        paintAllTime(0);
      }
    });

    var q = root.querySelector("#at-q");
    if (q) {
      q.addEventListener("input", function () {
        H.at.q = q.value || "";
        paintAllTime(0);
      });
    }
  };

  function paintAllTime(page) {
    var body = document.getElementById("at-rows");
    var head = document.getElementById("at-head");
    var pager = document.getElementById("at-pager");
    if (!H.allTime || !body) return;

    var rows = sorted(filtered());
    var n = rows.length;
    var pages = Math.max(1, Math.ceil(n / H.PAGE));
    if (page == null) page = H.at.page;
    if (page < 0) page = 0;
    if (page > pages - 1) page = pages - 1;
    H.at.page = page;

    var slice = rows.slice(page * H.PAGE, page * H.PAGE + H.PAGE);
    var colDefs = cols();

    if (head) {
      head.innerHTML =
        '<th class="num">Rk</th>' +
        '<th data-k="y">Year</th>' +
        '<th class="num" data-k="pk">Pk</th>' +
        '<th data-k="n">Player</th>' +
        '<th data-k="t">Team</th>' +
        colDefs.map(function (col) {
          var on = H.at.sort === col.k;
          var cls = "num" + (on ? (H.at.dir > 0 ? " on asc" : " on") : "");
          return (
            '<th class="' + cls + '" data-k="' + col.k + '"' +
            (col.title ? ' title="' + col.title + '"' : "") +
            ">" + col.label + "</th>"
          );
        }).join("");

      head.querySelectorAll("[data-k]").forEach(function (th) {
        if (th.getAttribute("data-k") === H.at.sort) {
          th.classList.add(H.at.dir > 0 ? "asc" : "on");
        }
        th.onclick = function () {
          var k = th.getAttribute("data-k");
          if (H.at.sort === k) H.at.dir *= -1;
          else {
            H.at.sort = k;
            H.at.dir = k === "n" || k === "t" || k === "pk" ? 1 : -1;
          }
          paintAllTime(0);
        };
      });
    }

    body.innerHTML = slice.length
      ? slice.map(function (p, i) {
          var rk = page * H.PAGE + i + 1;
          var pk = String(p.pk).padStart(2, "0");
          var href =
            "./player.html?year=" +
            encodeURIComponent(p.y) +
            "&id=" +
            encodeURIComponent(p.id);
          var metaBits = [p.pos, p.c].filter(Boolean).join(" · ");
          var metaFull = p.y + " · #" + pk + (metaBits ? " · " + metaBits : "");
          return (
            '<tr onclick="location.href=\'' + href + '\'">' +
            '<td class="rank">' + rk + "</td>" +
            '<td class="rank">' + p.y + "</td>" +
            '<td class="rank">' + pk + "</td>" +
            "<td><div class=\"name\">" + p.n + "</div>" +
            '<div class="meta meta-full">' + metaFull + "</div>" +
            (metaBits ? '<div class="meta meta-desk">' + metaBits + "</div>" : "") +
            "</td>" +
            "<td>" + (p.t || "—") + "</td>" +
            colDefs.map(function (col) {
              return '<td class="pct">' + cell(p, col) + "</td>";
            }).join("") +
            "</tr>"
          );
        }).join("")
      : '<tr><td colspan="16" style="color:var(--muted);padding:24px">No players match.</td></tr>';

    if (pager) {
      var from = n ? page * H.PAGE + 1 : 0;
      var to = Math.min(n, (page + 1) * H.PAGE);
      pager.innerHTML =
        '<button type="button" class="chip" data-at="prev"' +
        (page === 0 ? " disabled" : "") +
        ">Prev</button>" +
        '<button type="button" class="chip" data-at="next"' +
        (page >= pages - 1 ? " disabled" : "") +
        ">Next</button>" +
        '<span class="count">' + from + "–" + to + " of " + n + "</span>";
      pager.querySelectorAll("[data-at]").forEach(function (btn) {
        btn.onclick = function () {
          if (btn.disabled) return;
          paintAllTime(
            btn.getAttribute("data-at") === "prev" ? H.at.page - 1 : H.at.page + 1
          );
        };
      });
    }

    document.querySelectorAll("[data-when]").forEach(function (el) {
      el.classList.toggle("on", el.getAttribute("data-when") === H.at.when);
    });
    var filterBtn = document.getElementById("at-filter-btn");
    if (filterBtn) {
      filterBtn.classList.toggle("on", !!(H.at.dec || H.at.pos || H.at.rd));
    }
    var kicker = document.getElementById("at-kicker");
    if (kicker) kicker.textContent = "";
    H.at.painted = true;
  }

  function showView(view) {
    var drafts = document.getElementById("hist-drafts");
    var alltime = document.getElementById("hist-alltime");
    var outliers = document.getElementById("hist-outliers");
    if (drafts) drafts.hidden = view !== "drafts";
    if (alltime) alltime.hidden = view !== "alltime";
    if (outliers) outliers.hidden = view !== "outliers";

    var archiveQ = document.getElementById("archive-q");
    if (archiveQ) archiveQ.hidden = view !== "drafts";

    if (view === "alltime") {
      if (!H.at.inited) {
        H.at.when = whenOf();
        H.at.sort = H.at.when === "drafted" ? "eAs" : "as";
        H.at.dir = -1;
        H.at.inited = true;
      }
      if (H.allTime) {
        paintAllTime(H.at.painted ? H.at.page : 0);
      } else {
        fetch("./assets/all-time.json?v=34")
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (data) {
            H.allTime = data || { players: [] };
            (H.allTime.players || []).forEach(function (p) {
              p.hofNow = hofNowOf(p);
            });
            paintAllTime(0);
          })
          .catch(function () {
            var rows = document.getElementById("at-rows");
            if (rows) {
              rows.innerHTML =
                '<tr><td colspan="12" style="color:var(--muted);padding:24px">Could not load the list.</td></tr>';
            }
          });
      }
    }

    if (view === "outliers" && window.TR && typeof TR.mountOutliers === "function") {
      var ol = document.getElementById("ol-rows");
      if (ol) ol.removeAttribute("data-ready");
      TR.mountOutliers();
    }

    document.title =
      (view === "alltime"
        ? "All-time"
        : view === "outliers"
          ? "Outliers"
          : "NBA Draft History 1947–2026") + " | The Draft Model";
  }

  function boot() {
    var path = location.pathname || "";
    var href = location.href || "";
    var onDrafts =
      /\/drafts(\.html)?\/?$/i.test(path) ||
      /\/drafts(\.html)?(\?|#|$)/i.test(href) ||
      document.getElementById("archive-q") ||
      document.getElementById("acc-root");
    if (!onDrafts) return;

    var main =
      document.querySelector("main.section") ||
      document.querySelector("main.wrap.section") ||
      document.querySelector("main.wrap");
    if (!main) return;

    css();
    var view = viewOf();
    injectPills(main, view);
    ensurePanels(main);
    showView(view);
  }

  function wrapRender() {
    var prev = window.TR && TR.renderDrafts;
    if (typeof prev !== "function" || prev.__histHub) {
      if (document.querySelector("main")) boot();
      return;
    }
    TR.renderDrafts = function () {
      var out = prev.apply(this, arguments);
      if (out && typeof out.then === "function") {
        return out.then(function (v) {
          boot();
          return v;
        });
      }
      boot();
      setTimeout(boot, 0);
      setTimeout(boot, 200);
      return out;
    };
    TR.renderDrafts.__histHub = true;
    if (document.querySelector("main")) boot();
  }

  var obs = new MutationObserver(function () { wrapRender(); });
  if (document.getElementById("app")) {
    obs.observe(document.getElementById("app"), { childList: true, subtree: false });
  }
  document.addEventListener("DOMContentLoaded", wrapRender);
  setTimeout(wrapRender, 0);
  setTimeout(wrapRender, 300);
})();
