(function () {
  const items = [
    { title: "Do taller guys turn out better?", hint: "the actual claim", src: "./assets/size-t-bins.html?v=39" },
    { title: "Does every extra inch help?", hint: "5-9 through 7-7", src: "./assets/size-t-inch.html?v=39" },
    { title: "Do heavier guys turn out better?", hint: "listed weight", src: "./assets/size-t-wt.html?v=39" },
    { title: "Did the listed number match the scale?", hint: "weight only so far", src: "./assets/size-t-lvw.html?v=40" },
    { title: "Listed height vs combine height", hint: "not yet", note: "We do not have listed height and combine height on the same players yet. That is not the same thing as shoes versus no shoes." },
    { title: "Long arms", hint: "different argument", src: "./assets/size-t-wsp.html?v=39" },
    { title: "Arms minus height", hint: "different argument", src: "./assets/size-t-ape.html?v=39" },
    { title: "How high he can reach", hint: "different argument", src: "./assets/size-t-reach.html?v=39" },
    { title: "Pounds per inch", hint: "different argument", src: "./assets/size-t-wpi.html?v=39" }
  ];
  function row(it, i) {
    var body = it.src
      ? '<div class="acc-panel" data-src="' + it.src + '"></div>'
      : '<div class="acc-panel"><p class="size-note">' + it.note + "</p></div>";
    return '<section class="acc-item"><button class="acc-btn size-acc-btn" type="button" data-acc="' + i + '"><b>' +
      it.title + "</b><em>" + it.hint + " <i>+</i></em></button>" + body + "</section>";
  }
  var lede = '<p class="size-note">The claim is simple. Taller guys should have better careers than shorter guys. Heavier guys should have better careers than lighter guys. We checked listed height and weight on 3,074 players drafted in the top 60 from 1947 to 2018. Taller is not a straight line up. Seven-footers get more MVPs and Hall of Famers. They are not clearly more likely to become All-Stars. An extra inch does not beat the pick.</p>';
  TR.renderSimple(
    document.getElementById("app"),
    "theories",
    "Bigger is better",
    "",
    lede + '<div class="acc size-acc">' + items.map(row).join("") + "</div>"
  );
  document.querySelectorAll("[data-acc]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var item = btn.closest(".acc-item");
      item.classList.toggle("open");
      var icon = btn.querySelector("i");
      if (icon) icon.textContent = item.classList.contains("open") ? "\u2212" : "+";
      var panel = item.querySelector(".acc-panel");
      if (item.classList.contains("open") && panel && panel.dataset.src && !panel.dataset.loaded) {
        fetch(panel.dataset.src).then(function (r) { return r.text(); }).then(function (html) {
          panel.innerHTML = html;
          panel.dataset.loaded = "1";
        });
      }
    });
  });
})();
