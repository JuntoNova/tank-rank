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
  function swapHomeDoors(root) {
    const doors = (root || document).querySelector(".doors");
    if (!doors) return;
    const links = Array.prototype.slice.call(doors.querySelectorAll("a.door"));
    const hist = links.find((a) => (a.getAttribute("href") || "").indexOf("drafts") !== -1);
    const fut = links.find((a) => (a.getAttribute("href") || "").indexOf("upcoming") !== -1);
    if (!hist || !fut) return;
    const k = hist.querySelector(".kicker");
    if (k) k.textContent = "Past";
    doors.innerHTML = "";
    doors.appendChild(hist);
    doors.appendChild(fut);
  }
  function swapNav() {
    document.querySelectorAll(".logo span").forEach((el) => el.remove());
    document.querySelectorAll(".nav-links a, .foot-links a").forEach((a) => {
      const label = a.textContent.trim();
      const href = a.getAttribute("href") || "";
      if (label === "About" || href.indexOf("about.html") !== -1) {
        a.remove();
        return;
      }
      if (label === "Big Board" || href === "./board.html") {
        a.textContent = "Theories";
        a.setAttribute("href", "./theories.html");
      }
      if ((a.getAttribute("href") || "").indexOf("theories.html") !== -1) {
        a.classList.toggle("active", /theories\.html/.test(location.pathname));
      }
    });
    stripFooterLine();
  }
  function swap() {
    swapNav();
    swapHomeDoors(document.getElementById("app"));
    closeFreshAccordionOnce();
  }
  function watch() {
    const root = document.getElementById("app");
    if (!root || window.__tdmNavObs) return;
    window.__tdmNavObs = new MutationObserver(function () {
      swapNav();
      swapHomeDoors(root);
    });
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
  setTimeout(swap, 250);
})();
