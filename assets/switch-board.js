(function () {
  const items = [
    { title: "What is missing", hint: "why untested", src: "/assets/sw-t-missing.html?v=49" },
    { title: "Nearest published scores", hint: "not the claim", src: "/assets/sw-t-near.html?v=49" }
  ];
  const rows = items.map((it, i) => {
    return '<section class="acc-item">' +
      '<button class="acc-btn size-acc-btn" type="button" data-acc="' + i + '">' +
      '<b>' + it.title + '</b><em>' + it.hint + ' <i>+</i></em></button>' +
      '<div class="acc-panel" data-src="' + it.src + '"></div></section>';
  }).join('');
  TR.renderSimple(
    document.getElementById("app"),
    "theories",
    "Switchability beats rim protection",
    "",
    '<p class="size-note"><strong>Score: untested.</strong> Switchability here means covering a ball-handler on an island after a screen. That is a tracking and scheme tag. We do not have who switched, how often, or how well before the draft. Wingspan residual is scored on <a href="./wingspan.html">/wingspan</a>. College blocks are scored on <a href="./rim.html">/rim</a>. Neither is this claim.</p><div class="acc size-acc">' + rows + '</div>'
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
