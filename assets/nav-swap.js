(function () {
  var NAV_ORDER = [
    { match: /drafts\.html/i, label: /^historic$/i },
    { match: /upcoming\.html/i, label: /^upcoming$/i },
    { match: /board\.html/i, label: /^big board$/i },
    { match: /theories\.html/i, label: /^theories$/i },
    { match: /methodology\.html/i, label: /^methodology$/i }
  ];
  var THEORY_PATH = /(theories|size|wingspan|handle|reach|combine|age|late|onedone|jump|stash|prod|ftrate|three|astu|defense|rim|schools|intl|develop|switch|march|scheme|medical|character)\.html/i;

  function stripFooterLine() {
    document.querySelectorAll(".foot .copy div").forEach((el) => {
      if (/Probabilities, not opinions|v0\.5\.0-prototype|Updated 2026-09-02/.test(el.textContent || "")) {
        el.remove();
      }
    });
  }

  function closeFreshAccordionOnce() {
    if (window.__tdmAccClosed) return;
    const root = document.getElementById("acc-root");
    if (!root) return;
    const q = document.getElementById("archive-q");
    if (q && q.value.trim()) return;
    document.querySelectorAll(".acc-item.open").forEach((item) => {
      item.classList.remove("open");
      const icon = item.querySelector("i");
      if (icon) icon.textContent = "+";
    });
    window.__tdmAccClosed = true;
  }

  function stripAbout(nav) {
    nav.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const text = (a.textContent || "").replace(/\s+/g, " ").trim();
      if (/about\.html/i.test(href) || /^about$/i.test(text)) a.remove();
    });
  }

  function ensureTheories(nav) {
    var has = Array.from(nav.querySelectorAll("a")).some(function (a) {
      return /theories\.html/i.test(a.getAttribute("href") || "") || /^theories$/i.test((a.textContent || "").trim());
    });
    if (!has) {
      var a = document.createElement("a");
      a.href = "./theories.html";
      a.textContent = "Theories";
      nav.appendChild(a);
    }
    if (THEORY_PATH.test(location.pathname || "") || THEORY_PATH.test(location.href || "")) {
      nav.querySelectorAll("a").forEach(function (a) {
        a.classList.toggle("active", /theories\.html/i.test(a.getAttribute("href") || "") || /^theories$/i.test((a.textContent || "").trim()));
      });
    }
  }

  function orderNav(nav) {
    const links = Array.from(nav.querySelectorAll("a"));
    NAV_ORDER.forEach((rule) => {
      const el = links.find((a) => rule.match.test(a.getAttribute("href") || "") || rule.label.test((a.textContent || "").trim()));
      if (el) nav.appendChild(el);
    });
  }

  function orderDoors() {
    const doors = document.querySelector(".doors");
    if (!doors) return;
    const historic = Array.from(doors.querySelectorAll("a")).find((a) => /drafts\.html/i.test(a.getAttribute("href") || ""));
    const upcoming = Array.from(doors.querySelectorAll("a")).find((a) => /upcoming\.html/i.test(a.getAttribute("href") || ""));
    if (historic && upcoming && doors.children[0] !== historic) {
      doors.insertBefore(historic, upcoming);
    }
    doors.querySelectorAll("a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var p = a.querySelector("p");
      if (!p) return;
      if (/drafts\.html/i.test(href)) p.textContent = "1947\u20132026.";
      if (/upcoming\.html/i.test(href)) p.textContent = "2027 board, plus 2028 and 2029.";
    });
  }

  function hideHistoricBanner() {
    var y = Number(new URLSearchParams(location.search).get("year")) || (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
    var cur = (window.TANK_RANK && TANK_RANK.currentYear) || 2027;
    if (y < cur) {
      document.querySelectorAll(".banner").forEach(function (el) { el.remove(); });
    }
  }

  function lockIA() {
    const nav = document.querySelector(".nav-links");
    if (nav) {
      stripAbout(nav);
      ensureTheories(nav);
      orderNav(nav);
    }
    orderDoors();
    hideHistoricBanner();
  }

  function swapNav() {
    // Keep Big Board → board.html. Do not strip .logo span.
    stripFooterLine();
    lockIA();
  }

  function swap() {
    swapNav();
    closeFreshAccordionOnce();
  }

  function watch() {
    const root = document.getElementById("app");
    if (!root || window.__tdmNavObs) return;
    window.__tdmNavObs = new MutationObserver(function () {
      swapNav();
    });
    window.__tdmNavObs.observe(root, { childList: true, subtree: false });
  }

  ["renderHome", "renderBoard", "renderDrafts", "renderUpcoming", "renderSimple", "renderPlayer"].forEach((name) => {
    const fn = window.TR && TR[name];
    if (typeof fn !== "function") return;
    TR[name] = function () {
      const r = fn.apply(this, arguments);
      watch();
      if (r && typeof r.then === "function") return r.then((x) => { swap(); return x; });
      swap();
      return r;
    };
  });
  watch();
  document.addEventListener("DOMContentLoaded", function () { watch(); swap(); });
  setTimeout(swap, 0);
  setTimeout(swap, 250);
})();
