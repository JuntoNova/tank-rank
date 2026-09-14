(function () {
  var BLURB = {
    over: "Biggest surplus versus the theory-adjusted slot projection. All-time, classes 1947–2016.",
    under: "Biggest deficit among lottery picks 1–8, 1989–2017. Careers had time to exist. No bust label — this is the miss versus what that slot usually produces.",
    diff: "Largest gap relative to what the slot expected. Late-round Hall of Famers live here. Classes 1947–2016."
  };
  var TITLE = { over: "Overachieved", under: "Underachieved", diff: "Most different" };

  function keyFromUrl() {
    var q = (new URLSearchParams(location.search).get("list") || "").toLowerCase();
    if (q === "over" || q === "under" || q === "diff") return q;
    var h = (location.hash || "").replace(/^#/, "").toLowerCase();
    if (h === "over" || h === "under" || h === "diff") return h;
    return "over";
  }

  function fmtDelta(n) {
    if (n == null || !isFinite(Number(n))) return "";
    var v = Number(n);
    var sign = v > 0 ? "+" : "";
    return sign + (Math.abs(v) >= 100 ? String(Math.round(v)) : v.toFixed(1));
  }

  function rowHtml(r, i, list) {
    var cls = (r.delta || 0) >= 0 ? "up" : "down";
    var href = "./player.html?year=" + encodeURIComponent(r.y) + "&id=" + encodeURIComponent(r.id);
    var rel = list === "diff" && r.rel != null
      ? '<div class="ol-rel">×' + Number(r.rel).toFixed(1) + " vs slot</div>"
      : "";
    return (
      '<li class="ol-row">' +
        '<div class="ol-rank">' + String(i + 1).padStart(2, "0") + "</div>" +
        '<a class="ol-player" href="' + href + '">' +
          '<div class="name">' + r.n + "</div>" +
          '<div class="meta">' + r.y + " · pick " + r.pk + " · " + (r.note || "") + "</div>" +
          '<div class="ol-model">' + (r.model || "") + "</div>" +
        "</a>" +
        '<div class="ol-score">' +
          '<div class="delta ' + cls + '">' + fmtDelta(r.delta) + "</div>" +
          rel +
        "</div>" +
      "</li>"
    );
  }

  function paint(data, list) {
    var rows = (data && data[list]) || [];
    var blurb = document.getElementById("ol-blurb");
    var root = document.getElementById("ol-list");
    if (blurb) blurb.textContent = BLURB[list] || "";
    if (root) root.innerHTML = rows.map(function (r, i) { return rowHtml(r, i, list); }).join("");
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
    var box = document.getElementById("ol-list");
    if (!box || box.getAttribute("data-ready")) return;
    box.setAttribute("data-ready", "1");
    fetch("./assets/outliers.json?v=1")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) {
          box.innerHTML = '<li class="ol-empty">Could not load the lists.</li>';
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
        box.innerHTML = '<li class="ol-empty">Could not load the lists.</li>';
      });
  }

  window.TR = window.TR || {};
  TR.mountOutliers = mount;
  TR.renderOutliers = function (root) {
    if (typeof TR.renderSimple === "function") {
      TR.renderSimple(root, "outliers", "Outliers", "Versus the model", document.getElementById("app") ? "" : "");
    }
    mount();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
