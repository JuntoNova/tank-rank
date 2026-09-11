(function () {
  const items = [
    { title: "Height \u00d7 creation", hint: "the claim", src: "/assets/hdl-t-claim.html?v=45" },
    { title: "Inside a height band", hint: "control", src: "/assets/hdl-t-within.html?v=45" },
    { title: "First round \u00d7 height", hint: "slot", src: "/assets/hdl-t-fr.html?v=45" },
    { title: "College assists", hint: "handle alone", src: "/assets/hdl-t-ast.html?v=45" },
    { title: "Height", hint: "size alone", src: "/assets/hdl-t-ht.html?v=45" }
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
    "Ball-handling size is the hole in the market",
    "",
    `<p class="size-note"><strong>Score: lean true on career honors.</strong> The slogan is point-guard skills in a 6-foot-8 body. Rooms almost never list those players as point guards, so this page uses college assists per game as the handle and combine/barefoot height as the body. Sample is drafted players 2002\u20132015 who join a college box file by name and year, n = 305. Base All-Star 15.7%. 6-7+ with 2.2+ ast is 30.0% All-Star / 20.0% All-NBA. 6-7+ with under 1.5 ast is 10.9% / 10.9%. Short high-creation guards are 23.9%. Height alone is almost flat. Creation alone already moves honors. The hole is the cell where both show up. No usage-rate series, so this is ast/g, not ast/usg. The literal 6-8 point-guard label is too rare to score.</p>
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
