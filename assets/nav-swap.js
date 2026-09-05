(function () {
  function stripFooterLine() {
    document.querySelectorAll(".foot .copy div").forEach((el) => {
      if (/Probabilities, not opinions|v0\.5\.0-prototype|Updated 2026-09-02/.test(el.textContent || "")) {
        el.remove();
      }
    });
  }
  function swap() {
    document.querySelectorAll(".nav-links a").forEach((a) => {
      if (a.textContent.trim() === "Big Board") {
        a.textContent = "Theories";
        a.setAttribute("href", "./theories.html");
      }
      if (a.getAttribute("href") === "./theories.html") {
        const onTheories = /theories\.html/.test(location.pathname);
        a.classList.toggle("active", onTheories);
      }
    });
    stripFooterLine();
  }
  ["renderHome", "renderBoard", "renderDrafts", "renderUpcoming", "renderSimple", "renderPlayer"].forEach((name) => {
    const fn = window.TR && TR[name];
    if (typeof fn !== "function") return;
    TR[name] = function () {
      const r = fn.apply(this, arguments);
      if (r && typeof r.then === "function") return r.then((x) => { swap(); return x; });
      swap();
      return r;
    };
  });
  document.addEventListener("DOMContentLoaded", swap);
  setTimeout(swap, 0);
})();
