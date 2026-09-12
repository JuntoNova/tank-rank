(function () {
  const items = [
    { title: "Class year", hint: "the claim", src: "/assets/oad-t-claim.html?v=46" },
    { title: "Four buckets", hint: "folded", src: "/assets/oad-t-class.html?v=46" },
    { title: "Freshman vs senior by slot", hint: "control", src: "/assets/oad-t-slot.html?v=46" },
    { title: "Prep-to-pro window", hint: "1995\u20132005", src: "/assets/oad-t-hs.html?v=46" }
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
    "One-and-done beats four-year stars",
    "",
    '<p class="size-note">' + "<strong>Score: lean true on freshman vs senior, slot-dependent.</strong> College draftees 2006\u20132018 with a birthdate, n = 544. Freshmen hit 18.9% All-Star against 5.9% for seniors. A lot of that is pick slot \u2014 teams spend lottery chips on one-and-dones. Inside the same band the freshman edge shrinks. Prep-to-pro 1995\u20132005 is the earlier version of the same claim." + '</p><div class="acc size-acc">' + rows + '</div>'
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
