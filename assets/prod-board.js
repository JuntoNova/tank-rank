(function () {
  const items = [
    { title: "College scoring", hint: "the claim", src: "/assets/prd-t-pts.html?v=48" },
    { title: "First round only", hint: "slot", src: "/assets/prd-t-fr.html?v=48" },
    { title: "College vs HS vs intl", hint: "path", src: "/assets/prd-t-origin.html?v=48" }
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
    "College production is the best signal",
    "",
    '<p class="size-note">' + "<strong>Score: false as a general rule.</strong> Last-season college points per game barely moves career honors among players who already got drafted. High-scoring tertile 13.1% All-Star vs 11.7% for the low tertile, n = 581 drafted college players 2002–2015 joined by name and year. First-round-only is also flat (20.0 / 17.6 / 18.3). Getting drafted already selected for production." + '</p><div class="acc size-acc">' + rows + '</div>'
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
