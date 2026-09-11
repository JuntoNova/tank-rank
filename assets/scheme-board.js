(function () {
  const items = [
    { title: "What is missing", hint: "why N/A", src: "/assets/schm-t-missing.html?v=49" },
    { title: "Nearest published scores", hint: "not the claim", src: "/assets/schm-t-near.html?v=49" }
  ];
  const rows = items.map((it, i) => {
    return '<section class="acc-item"><button class="acc-btn size-acc-btn" type="button" data-acc="' + i + '"><b>' + it.title + '</b><em>' + it.hint + ' <i>+</i></em></button><div class="acc-panel" data-src="' + it.src + '"></div></section>';
  }).join('');
  TR.renderSimple(document.getElementById("app"), "theories", "Scheme fit beats the board at the margin", "",
    '<p class="size-note"><strong>Score: N/A.</strong> There is no draft-night scheme tag, no play-type file, and no way to mark which reaches were fit bets versus talent errors. Opposite claim is on <a href="./develop.html">/develop</a>.</p><div class="acc size-acc">' + rows + '</div>');
  document.querySelectorAll("[data-acc]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const item = btn.closest(".acc-item");
      item.classList.toggle("open");
      const icon = btn.querySelector("i");
      if (icon) icon.textContent = item.classList.contains("open") ? "\u2212" : "+";
      const panel = item.querySelector(".acc-panel");
      if (item.classList.contains("open") && panel && panel.dataset.src && !panel.dataset.loaded) {
        fetch(panel.dataset.src).then((r) => r.text()).then((html) => { panel.innerHTML = html; panel.dataset.loaded = "1"; });
      }
    });
  });
})();
