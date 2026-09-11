(function () {
  const items = [
    { title: "Free-throw rate", hint: "the claim", src: "/assets/ftr-t-rate.html?v=48" },
    { title: "Field-goal percentage", hint: "the opposite", src: "/assets/ftr-t-fg.html?v=48" },
    { title: "Rate × FG%", hint: "interaction", src: "/assets/ftr-t-cross.html?v=48" }
  ];
  const rows = items.map((it, i) => {
    const body = '<div class="acc-panel" data-src="' + it.src + '"></div>';
    return '<section class="acc-item">' +
      '<button class="acc-btn size-acc-btn" type="button" data-acc="' + i + '">' +
      '<b>' + it.title + '</b><em>' + it.hint + ' <i>+</i></em></button>' +
      body + '</section>';
  }).join("");
  TR.renderSimple(
    document.getElementById("app"),
    "theories",
    "Free-throw rate beats field-goal percentage",
    "",
    '<p class="size-note">' + "<strong>Score: lean true.</strong> Getting to the line separates later honors. High college FTA/FGA is 16.8% All-Star vs 8.3% for the low tertile, n = 581. Field-goal percentage is almost flat (12.4 / 12.4 / 10.8)." + '</p><div class="acc size-acc">' + rows + '</div>'
  );
  document.querySelectorAll("[data-acc]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const item = btn.closest(".acc-item");
      item.classList.toggle("open");
      const icon = btn.querySelector("i");
      if (icon) icon.textContent = item.classList.contains("open") ? "\u2212" : "+";
      const panel = item.querySelector(".acc-panel");
      if (item.classList.contains("open") && panel && panel.dataset.src && !panel.dataset.loaded) {
        fetch(panel.dataset.src).then((r) => r.text()).then((html) => {
          panel.innerHTML = html;
          panel.dataset.loaded = "1";
        });
      }
    });
  });
})();
