(function () {
  const items = [
    { title: "Stocks", hint: "the missed signal", src: "/assets/def-t-stocks.html?v=48" },
    { title: "Stocks × scoring", hint: "interaction", src: "/assets/def-t-cross.html?v=48" }
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
    "Defense doesn't show up until the league",
    "",
    '<p class="size-note">' + "<strong>Score: false.</strong> College defense already shows up if you use stocks. High steal+block tertile is 16.6% All-Star vs 8.5% for low, n = 581. High-stock / low-scoring players still hit 12.1%. Scoring-only profiles are the ones that fail." + '</p><div class="acc size-acc">' + rows + '</div>'
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
