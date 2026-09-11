(function () {
  const items = [
    { title: "Reach \u00d7 vertical", hint: "the claim", src: "/assets/rch-t-quad.html?v=43" },
    { title: "Max vertical", hint: "n = 332", src: "/assets/rch-t-vmax.html?v=43" },
    { title: "Standing vertical", hint: "n = 331", src: "/assets/rch-t-vstand.html?v=43" },
    { title: "Standing reach", hint: "same sample", src: "/assets/rch-t-reach.html?v=43" },
    { title: "Inside a height band", hint: "where it holds", src: "/assets/rch-t-within.html?v=43" }
  ];
  const rows = items.map((it, i) => {
    const body = `<div class="acc-panel" data-src="${it.src}"></div>`;
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
    "Standing reach beats vertical",
    "",
    `<p class="size-note"><strong>Score: false as a general rule. Lean true only at 6-10 and up.</strong> The slogan on the theories list was \u201cfor bigs.\u201d This page does not limit it. Sample is every drafted combine tester with both standing reach and max vertical, 2009\u20132017, n = 332. All positions. Base AS 10.2%, All-NBA 6.9%. \u0394 is percentage points versus that base. n &lt; 20 in grey. Short-reach / high-vert players hit 14.0% All-Star against 6.7% for long-reach / low-vert. Max vertical at 38\u201340.9 in is +8.7 on All-Star. Standing reach is flat until the 9-4 bin (n = 11). Inside 6-10 and up, high reach goes 21.1% All-Star and high vert goes 5.3% \u2014 that is the only band where the original slogan holds, and it is 36 players.</p>
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
