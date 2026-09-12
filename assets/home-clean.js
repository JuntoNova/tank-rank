(function () {
  if (!window.TR || typeof TR.renderHome !== "function") return;
  const orig = TR.renderHome;
  TR.renderHome = function (root) {
    orig(root);
    root.querySelectorAll(".doors .door p").forEach(function (p) { p.remove(); });
  };
})();
