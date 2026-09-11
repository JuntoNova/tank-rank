(function () {
  const items = [
    { title: "Wingspan \u2212 height", hint: "the claim", src: "/assets/wsp-t-ape.html?v=42" },
    { title: "Combine height", hint: "same sample", src: "/assets/wsp-t-ht.html?v=42" },
    { title: "Raw wingspan", hint: "n = 736", src: "/assets/wsp-t-wsp.html?v=42" },
    { title: "Length inside a height band", hint: "control", src: "/assets/wsp-t-within.html?v=42" }
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
    "Wingspan beats height on defense",
    "",
    `<p class="size-note"><strong>Score: lean true on career honors. Defense: untested.</strong> Combine drafted players with both height and wingspan, year packs 2000\u201317 and 2019\u201320, n = 736. No 2018 pack. Base is the average player in that sample. \u0394 is percentage points versus that base. n &lt; 20 in grey. All-Star rate is almost flat across height bins (10.6\u201312.0%). The 6-inch-plus ape index is +3.8 on All-Star and +2.1 on All-NBA. Long arms also win inside a height band, including the 6-10 to 7-1 group (28.0% vs 7.3% All-Star). That is honors, not steals or All-Defense \u2014 the defensive half of the claim still needs those series.</p>
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
