(function () {
  function load(url) {
    var x = new XMLHttpRequest();
    x.open("GET", url, false);
    x.send();
    return x.responseText;
  }
  var src = load("https://cdn.jsdelivr.net/gh/JuntoNova/tank-rank@4d2b1729cda9b9a40965b36e5c5f5ce51b72951a/assets/app.js");
  src = src.replace(
    '<div class="kicker">Archive</div>',
    '<div class="kicker">Past</div>'
  );
  var future = src.match(/<a class="door" href=\"\.\/upcoming\.html\">[\s\S]*?<\/a>/);
  var historic = src.match(/<a class="door" href=\"\.\/drafts\.html\">[\s\S]*?<\/a>/);
  if (future && historic) {
    src = src.replace(future[0] + "\n        " + historic[0], historic[0] + "\n        " + future[0]);
  }
  eval(src);
})();
