/* Honesty: null/NaN probs and Exp WS render blank, never 0% / 0 / em dash. Blank is not 0%. */
(function () {
  function blankPct(n) {
    return (n == null || !isFinite(Number(n))) ? "" : Math.round(Number(n) * 100) + "%";
  }
  function blankExp(n) {
    if (n == null || isNaN(n)) return "";
    if (Math.abs(n) < 0.05) return "0";
    if (Math.abs(n) < 0.1) return n < 0 ? "-<0.1" : "<0.1";
    var abs = Math.abs(n);
    return (n < 0 ? "-" : "") + (abs >= 10 ? String(Math.round(abs)) : abs.toFixed(1));
  }
  function apply() {
    window.TR = window.TR || {};
    TR.Model = TR.Model || {};
    TR.Model.fmtPct = blankPct;
    TR.Model.fmtExp = blankExp;
  }
  apply();
  setInterval(apply, 500);
})();
