(function () {
  const items = [
    { title: "Flash vs later jump", hint: "the claim", src: "/assets/jmp-t-claim.html?v=46" },
    { title: "First round", hint: "slot", src: "/assets/jmp-t-fr.html?v=46" },
    { title: "Size of the leap", hint: "pts change", src: "/assets/jmp-t-bins.html?v=46" }
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
    "Sophomore-to-junior jumps beat freshman flashes",
    "",
    '<p class="size-note">' + "<strong>Score: false as a general rule.</strong> College draftees 2003\u20132014 with a box file and a birthdate, n = 456. Freshman flashes are 23.3% All-Star. Players who stayed and jumped +3 pts are 6.6%. A scoring leap in year three is not a cleaner signal than leaving after one season." + '</p><div class="acc size-acc">' + rows + '</div>'
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
