(function () {
  const groups = [
    {
      label: "Height",
      items: [
        { title: "Taller guys perform better", src: "./assets/size-t-bins.html?v=43" },
        { title: "Every extra inch helps", src: "./assets/size-t-inch.html?v=43" }
      ]
    },
    {
      label: "Weight",
      items: [
        { title: "Heavier guys perform better", src: "./assets/size-t-wt.html?v=43" },
        { title: "More pounds per inch helps", src: "./assets/size-t-wpi.html?v=39" }
      ]
    },
    {
      label: "Length",
      items: [
        { title: "Longer arms help", src: "./assets/size-t-wsp.html?v=43" },
        { title: "Arms longer than height help", src: "./assets/size-t-ape.html?v=43" },
        { title: "Higher standing reach helps", src: "./assets/size-t-reach.html?v=39" }
      ]
    }
  ];
  function row(it) {
    return '<div class="acc-item theory-acc"><div class="theory-row">' +
      '<button class="theory-plus" data-acc type="button" aria-label="Toggle">+</button>' +
      '<span class="theory-name">' + it.title + '</span></div>' +
      '<div class="acc-panel" data-src="' + it.src + '"></div></div>';
  }
  var html = '<div class="acc theory-families">' + groups.map(function (g, i) {
    return '<section class="acc-item group-acc"><button class="acc-btn group-acc-btn" type="button" data-group="' + i + '"><b>' +
      g.label + '</b><em><i>+</i></em></button><div class="acc-panel"><div class="acc theory-list">' +
      g.items.map(row).join('') + '</div></div></section>';
  }).join('') + '</div>';
  TR.renderSimple(document.getElementById("app"), "theories", "Bigger is better", "", html);
  document.querySelectorAll("[data-group]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var item = btn.closest(".group-acc");
      item.classList.toggle("open");
      var icon = btn.querySelector("i");
      if (icon) icon.textContent = item.classList.contains("open") ? "\u2212" : "+";
    });
  });
  document.querySelectorAll("[data-acc]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var item = btn.closest(".theory-acc");
      item.classList.toggle("open");
      btn.textContent = item.classList.contains("open") ? "\u2212" : "+";
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
