/* Honesty: null/NaN probs and Exp WS render blank, never 0% / 0 / em dash.
   Finite probs that round to 0% display <1% — never paint honor cells as 0%. */
(function () {
  function blankPct(n) {
    if (n == null || !isFinite(Number(n))) return "";
    var p = Math.round(Number(n) * 100);
    return p === 0 ? "<1%" : p + "%";
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
