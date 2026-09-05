(function () {
  function stripFooterLine() {
    document.querySelectorAll(".foot .copy div").forEach((el) => {
      if (/Probabilities, not opinions|v0\.5\.0-prototype|Updated 2026-09-02/.test(el.textContent || "")) {
        el.remove();
      }
    });
  }
  function closeFreshAccordion() {
    if (!document.getElementById("acc-root")) return;
    const q = document.getElementById("archive-q");
    if (q && q.value.trim()) return;
    document.querySelectorAll(".acc-item.open").forEach((item) => {
      item.classList.remove("open");
      const icon = item.querySelector("i");
      if (icon) icon.textContent = "+";
    });
  }
  function swap() {
    document.querySelectorAll(".logo span").forEach((el) => el.remove());
    document.querySelectorAll(".nav-links a").forEach((a) => {
      const label = a.textContent.trim();
      if (label === "Big Board" || a.getAttribute("href") === "./board.html") {
        a.textContent = "Theories";
        a.setAttribute("href", "./theories.html");
      }
      if (a.getAttribute("href") === "./theories.html") {
        const onTheories = /theories\.html/.test(location.pathname);
        a.classList.toggle("active", onTheories);
      }
    });
    stripFooterLine();
    closeFreshAccordion();
  }
  function watch() {
    const root = document.getElementById("app");
    if (!root || window.__tdmNavObs) return;
    window.__tdmNavObs = new MutationObserver(swap);
    window.__tdmNavObs.observe(root, { childList: true, subtree: true });
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
  setTimeout(swap, 200);
  setTimeout(swap, 800);
})();
