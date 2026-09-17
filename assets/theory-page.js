(function () {
  function row(it) {
    return '<div class="acc-item theory-acc"><div class="theory-row">' +
      '<button class="theory-plus" data-acc type="button" aria-label="Toggle">+</button>' +
      '<span class="theory-name">' + it.title + "</span></div>" +
      '<div class="acc-panel" data-src="' + it.src + '"></div></div>';
  }
  function bind() {
    document.querySelectorAll("[data-group]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var item = btn.closest(".group-acc");
        item.classList.toggle("open");
        var icon = btn.querySelector("i");
        if (icon) icon.textContent = item.classList.contains("open") ? "\u2212" : "+";
      });
    });
    document.querySelectorAll("[data-acc]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var item = btn.closest(".theory-acc");
        item.classList.toggle("open");
        btn.textContent = item.classList.contains("open") ? "\u2212" : "+";
        var panel = item.querySelector(".acc-panel");
        if (item.classList.contains("open") && panel && panel.dataset.src && !panel.dataset.loaded) {
          fetch(panel.dataset.src).then(function (r) { return r.text(); }).then(function (html) {
            panel.innerHTML = html;
            panel.dataset.loaded = "1";
          });
        }
      });
    });
  }
  TR.renderTheoryPage = function (title, groups, lede) {
    groups = groups || [];
    var html = "";
    if (lede) html += '<p class="theory-lede">' + lede + "</p>";
    if (groups.length > 1) {
      html += '<div class="acc theory-families">' + groups.map(function (g, i) {
        return '<section class="acc-item group-acc"><button class="acc-btn group-acc-btn" type="button" data-group="' + i + '"><b>' +
          g.label + "</b><em><i>+</i></em></button><div class=\"acc-panel\"><div class=\"acc theory-list\">" +
          g.items.map(row).join("") + "</div></div></section>";
      }).join("") + "</div>";
    } else if (groups.length === 1 && groups[0].items && groups[0].items.length) {
      html += '<div class="acc theory-list theory-families">' + groups[0].items.map(row).join("") + "</div>";
    }
    var back = '<p class="theory-back"><a class="btn" href="/theories.html">All theories</a></p>';
    TR.renderSimple(document.getElementById("app"), "theories", title, "", back + html + back);
    bind();
  };
})();
