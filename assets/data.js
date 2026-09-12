(function () {
  function load(url) {
    var x = new XMLHttpRequest();
    x.open("GET", url, false);
    x.send();
    return x.responseText;
  }
  // PR-D packs assembled from split parts (blank 2028/2029 odds + living-2027-bios load).
  var src = "";
  src += load("assets/data-part1.js");
  src += load("assets/data-part2.js");
  src += load("assets/data-part3.js");
  src += load("assets/data-part4.js");
  eval(src);
})();
