(function () {
  const items = [
    { title: "Height bins", hint: "5 groups", src: "./assets/size-t-bins.html?v=38" },
    { title: "Height, inch by inch", hint: "5-9 to 7-7", src: "./assets/size-t-inch.html?v=38" },
    { title: "Weight, 10 lb", hint: "16 buckets", src: "./assets/size-t-wt.html?v=38" },
    { title: "Wingspan", hint: "N/A", note: "Combine coverage only. Table lands when the series is filled." },
    { title: "Wingspan \u2212 height", hint: "N/A", note: "Same height, different length. Table lands when wingspan is filled." },
    { title: "Standing reach", hint: "N/A", note: "Combine coverage only. Table lands when the series is filled." },
    { title: "Listed vs combine height", hint: "N/A", note: "How far listed height sits from the stick. Table lands when both series exist on the same player." },
    { title: "Weight per inch", hint: "N/A", note: "Pounds per inch of listed height. Table lands next to the weight board." }
  ];
  const rows = items.map((it, i) => {
    const body = it.src
      ? `<div class="acc-panel" data-src="${it.src}"></div>`
      : `<div class="acc-panel"><p class="size-note">${it.note}</p></div>`;
    return `<section class="acc-item">
      <button class="acc-btn size-acc-btn" type="button" data-acc="${i}">
        <b>${it.title}</b>
        <em>${it.hint} <i>+</i></em>
      </button>
      ${body}
    </section>`;
  }).join("");
  TR.renderSimple(
    document.getElementById("app"),
    "theories",
    "You can't teach size",
    "",
    `<p class="size-note">n = 3,074. Picks 1\u201360, 1947\u20132018. Listed height and weight. Base = average draftee in this sample. AS 15.7% \u00b7 All-NBA 8.6% \u00b7 HOF 4.7% \u00b7 MVP 1.17%. \u0394 is percentage points versus base. n &lt; 8 in grey.</p>
    <div class="acc size-acc">${rows}</div>`
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
