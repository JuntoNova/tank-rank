(function () {
  function fmtExp(n) {
    if (window.TR && TR.Model) return TR.Model.fmtExp(n);
    if (n == null || isNaN(n)) return "\u2014";
    if (Math.abs(n) < 0.005) return "0";
    var abs = Math.abs(n);
    if (abs >= 10) return String(Math.round(n));
    if (abs >= 1) return Number(n).toFixed(1);
    return Number(n).toFixed(2);
  }
  function fmtPct(n) { return (window.TR && TR.Model && TR.Model.fmtHof) ? TR.Model.fmtHof(n) : ((window.TR && TR.Model ? TR.Model.fmtPct(n) : Math.round((n || 0) * 100) + "%")); }
  function fmtSigned(n) {
    if (n == null || isNaN(n) || Math.abs(n) < 0.25) return "0";
    return (n > 0 ? "+" : "\u2212") + Math.abs(n).toFixed(1);
  }
  // PR-J emergency: full file restored via push_files next; stub replaced immediately
  const FALLBACK_INT = {};
  var sortKey = "rank", sortDir = 1, lastPriors = null, lastYear = null;
  function slotKey(pk) { pk = Number(pk) || 99; if (pk === 1) return "1"; if (pk <= 3) return "2-3"; if (pk <= 5) return "4-5"; if (pk <= 10) return "6-10"; if (pk <= 14) return "11-14"; if (pk <= 30) return "15-30"; return "31+"; }
  console.error("[PR-J] theory-board stub — full plain restore pending");
})();
