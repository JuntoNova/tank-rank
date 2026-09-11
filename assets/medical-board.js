(function () {
  const items = [
    { title: "What is missing", hint: "why N/A", src: "/assets/med-t-missing.html?v=49" }
  ];
  const rows = items.map((it, i) => {
    return '<section class="acc-item"><button class="acc-btn size-acc-btn" type="button" data-acc="' + i + '"><b>' + it.title + '</b><em>' + it.hint + ' <i>+</i></em></button><div class="acc-panel" data-src="' + it.src + '"></div></section>';
  }).join('');
  TR.renderSimple(document.getElementById("app"), "theories", "Teams overweight medical, media underweights it", "",
    '<p class="size-note"><strong>Score: N/A.</strong> Front offices have imaging. Public boards do not. There is no player-matched pre-draft medical grade, surgery flag, or team-doctor note in the files we publish, so you cannot score whether rooms overweight medical relative to media.</p><div class="acc size-acc">' + rows + '</div>');
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
