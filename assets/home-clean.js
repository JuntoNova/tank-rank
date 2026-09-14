(function () {
  function scrub() {
    document.querySelectorAll("footer .copy div, footer p, .foot .copy div").forEach(function (el) {
      var t = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (/DBA of Junto Nova/i.test(t) || /Not affiliated with, endorsed by, or sponsored by the NBA/i.test(t)) el.remove();
    });
    document.querySelectorAll(".doors a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var p = a.querySelector("p");
      if (!p) return;
      if (/drafts\.html/i.test(href)) p.textContent = "1947\u20132026.";
      if (/upcoming\.html/i.test(href)) p.textContent = "2027 board, plus 2028 and 2029.";
    });
  }
  scrub();
  setInterval(scrub, 400);
})();
