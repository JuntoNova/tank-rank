(function () {
  const items = [
    { title: "Origin", hint: "college / intl / HS", src: "/assets/sth-t-origin.html?v=46" },
    { title: "Arrival delay", hint: "the stash", src: "/assets/sth-t-delay.html?v=46" },
    { title: "International bigs", hint: "PF/C", src: "/assets/sth-t-bigs.html?v=46" },
    { title: "Inside a pick band", hint: "slot", src: "/assets/sth-t-slot.html?v=46" }
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
    "Draft-and-stash cuts risk on swingy international bigs",
    "",
    '<p class="size-note">' + "<strong>Score: lean true on never-arriving risk, unproven as a value edge.</strong> International draftees 1985\u20132018, n = 269. Immediate arrivals are 10.8% All-Star. Two-plus years out are 6.4%. Never appearing in the NBA file is 0.0%. Stashing cuts the chance you burn a roster year on a raw big. It does not, on this sample, turn those picks into extra All-Stars versus college at the same slot." + '</p><div class="acc size-acc">' + rows + '</div>'
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
