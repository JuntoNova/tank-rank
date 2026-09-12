(function () {
  function scrub() {
    document.querySelectorAll("footer .copy div, footer p, .foot .copy div").forEach(function (el) {
      var t = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (/DBA of Junto Nova/i.test(t) || /Not affiliated with, endorsed by, or sponsored by the NBA/i.test(t)) el.remove();
    });
  }
  scrub();
  setInterval(scrub, 400);
})();
