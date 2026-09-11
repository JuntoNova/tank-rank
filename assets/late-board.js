(function () {
  const items = [
    { title: "Age \u00d7 last-year scoring", hint: "the claim", src: "/assets/late-t-claim.html?v=46" },
    { title: "High-scorers inside a slot", hint: "control", src: "/assets/late-t-slot.html?v=46" },
    { title: "Age alone", hint: "1985\u20132018", src: "/assets/late-t-age.html?v=46" }
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
    "Late bloomers get left on the board",
    "",
    '<p class="size-note">' + "<strong>Score: false as a general rule.</strong> Older draftees do not beat younger ones on career honors, and older high-scorers in the 2002\u20132014 college join do not beat younger high-scorers. The board already sends older players later. Once the slot is fixed, the extra year of college scoring does not buy more All-Stars. Opposite page: younger is better at the same pick." + '</p><div class="acc size-acc">' + rows + '</div>'
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
