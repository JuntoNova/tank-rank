/* PR-L: year-aware board head tags (title, description, og:title, og:description, og:url, canonical).
   Runs right after data.js, before the board paints. Year and Results / Big Board split match parseYear / isHistoric in app.pinned.js. */
(function () {
  var ORIGIN = "https://thedraftmodel.com";
  function T() { return window.TANK_RANK || {}; }
  function cur() { return T().currentYear || 2027; }
  function yearOf() {
    var y = Number(new URLSearchParams(location.search).get("year"));
    var t = T();
    if (t.drafts && t.drafts[y]) return y;
    if ((t.historicYears || []).indexOf(y) >= 0) return y;
    if ((t.futureYears || []).indexOf(y) >= 0) return y;
    return cur();
  }
  function tag(sel, make) {
    var el = document.head.querySelector(sel);
    if (!el) { el = make(); document.head.appendChild(el); }
    return el;
  }
  function meta(attr, key, content) {
    tag('meta[' + attr + '="' + key + '"]', function () {
      var m = document.createElement("meta");
      m.setAttribute(attr, key);
      return m;
    }).setAttribute("content", content);
  }
  function apply() {
    var year = yearOf();
    var historic = year < cur();
    var title = year + " NBA Draft " + (historic ? "Results" : "Big Board") + " | The Draft Model";
    var desc = historic
      ? year + " NBA draft results, with each pick's career so far next to the model's draft-night expected All-Star and All-NBA selections and Hall of Fame chance."
      : year + " NBA draft big board, with each prospect's expected All-Star and All-NBA selections and Hall of Fame chance.";
    var url = ORIGIN + "/board?year=" + year;
    document.title = title;
    meta("name", "description", desc);
    meta("property", "og:title", title);
    meta("property", "og:description", desc);
    meta("property", "og:url", url);
    tag('link[rel="canonical"]', function () {
      var l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    }).setAttribute("href", url);
  }
  apply();
})();
