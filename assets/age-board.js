(function () {
  const items = [
    { title: "Age at draft", hint: "the claim", src: "/assets/age-t-claim.html?v=46" },
    { title: "Inside a pick band", hint: "slot", src: "/assets/age-t-slot.html?v=46" },
    { title: "First round", hint: "picks 1\u201330", src: "/assets/age-t-fr.html?v=46" },
    { title: "Inside an era", hint: "prep vs one-and-done", src: "/assets/age-t-era.html?v=46" }
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
    "Younger is better at the same pick",
    "",
    '<p class="size-note">' + "<strong>Score: lean true.</strong> Drafted players 1985\u20132018 with a parsed birthdate, n = 1555. Base All-Star 12.7%. Under 19.5 is 24.1% All-Star / 17.9% All-NBA. 22.5 and up is 3.5% / 1.4%. The same slope shows up inside pick bands and inside eras. Opposite page: late bloomers." + '</p><div class="acc size-acc">' + rows + '</div>'
  );
  document.querySelectorAll("[data-acc]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const item = btn.closest(".acc-item");
      item.classList.toggle("open");
      const icon = btn.querySelector("i");
      if (icon) icon.textContent = item.classList.contains("open") ? "\\u2212" : "+";
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
