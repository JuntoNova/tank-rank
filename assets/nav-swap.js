(function () {
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
  function swapNav() {
    // Keep Big Board → board.html. Do not strip .logo span.
    stripFooterLine();
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
