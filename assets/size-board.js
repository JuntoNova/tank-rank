(function () {
  const items = [
    { title: "Height bins", hint: "5 groups", src: "./assets/size-t-bins.html?v=39" },
    { title: "Height, inch by inch", hint: "5-9 to 7-7", src: "./assets/size-t-inch.html?v=39" },
    { title: "Weight, 10 lb", hint: "16 buckets", src: "./assets/size-t-wt.html?v=39" },
    { title: "Wingspan", hint: "n = 716", src: "./assets/size-t-wsp.html?v=39" },
    { title: "Wingspan \u2212 height", hint: "n = 716", src: "./assets/size-t-ape.html?v=39" },
    { title: "Standing reach", hint: "n = 715", src: "./assets/size-t-reach.html?v=39" },
    { title: "Listed vs combine height", hint: "N/A", note: "Needs the listed-height series on the same players. Not the same as shoes vs no shoes." },
    { title: "Weight per inch", hint: "n = 715", src: "./assets/size-t-wpi.html?v=39" }
  ];
  const rows = items.map((it, i) => {
    const body = it.src
      ? `<div class=\"acc-panel\" data-src=\"${it.src}\"></div>`
      : `<div class=\"acc-panel\"><p class=\"size-note\">${it.note}</p></div>`;
    return `<section class=\"acc-item\">\n      <button class=\"acc-btn size-acc-btn\" type=\"button\" data-acc=\"${i}\">\n        <b>${it.title}</b>\n        <em>${it.hint} <i>+</i></em>\n      </button>\n      ${body}\n    </section>`;
  }).join("");
  TR.renderSimple(
    document.getElementById("app"),
    "theories",
    "You can't teach size",
    "",
    `<p class=\"size-note\">Height / weight tables: listed size, picks 1\u201360, 1947\u20132018, n = 3,074. Wingspan / reach / lbs-per-inch: combine drafted players, 2000\u20132018, n = 716. Base is the average draftee in that sample. \u0394 is percentage points versus that base. n &lt; 20 in grey.</p>\n    <div class=\"acc size-acc\">${rows}</div>`
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
