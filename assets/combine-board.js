(function () {
  const items = [
    { title: "Showed up vs skipped", hint: "the skip cut", src: "/assets/cmb-t-skip.html?v=44" },
    { title: "Skip inside a pick band", hint: "slot control", src: "/assets/cmb-t-slot.html?v=44" },
    { title: "Lane agility", hint: "the clock", src: "/assets/cmb-t-agi.html?v=44" },
    { title: "Three-quarter sprint", hint: "n = 330", src: "/assets/cmb-t-spr.html?v=44" },
    { title: "Bench press", hint: "n = 222", src: "/assets/cmb-t-bench.html?v=44" },
    { title: "Athletic composite", hint: "vert + clock", src: "/assets/cmb-t-comp.html?v=44" },
    { title: "Max vertical", hint: "the exception", src: "/assets/cmb-t-vmax.html?v=44" }
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
    "Combine testing is mostly noise",
    "",
    `<p class="size-note"><strong>Score: lean true on the clock and the bench. False on max vertical. Skipping is mostly slot.</strong> Two cuts. Athletic tests: drafted combine testers 2009–2017. Skip: every drafted player in years with a measurement pack (2000–17 and 2019–20, no 2018 pack), n = 1,191. Lane agility does not line up bin by bin. Bench runs the wrong way. Three-quarter sprint only steps up under 3.30s. Max vertical at 38–40.9 in is +8.7 All-Star — that drill is on /reach. A three-test composite still only moves All-Star from 6.5% in the bottom quarter to 14.0% in the top. Lottery skippers match attenders on All-Star and trail on All-NBA. Second-round skippers are worse, not hidden stars.</p>
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
