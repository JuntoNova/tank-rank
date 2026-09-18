// theories hub render
const groups = window.__THEORY_GROUPS;
    function row(t) {
      var title = t.href
        ? '<a class="theory-name" href="' + t.href + '">' + t.name + '</a>'
        : '<span class="theory-name">' + t.name + '</span>';
      var plus = '<button class="theory-plus" data-acc type="button" aria-label="Toggle">+</button>';
      var factors = t.cuts.map(function (c) {
        return '<div class="factor"><span>' + c + '</span></div>';
      }).join('');
      var panel = '<div class="acc-panel"><div class="factor-list">' + factors + '</div></div>';
      return '<div class="acc-item theory-acc"><div class="theory-row">' + plus + title +
        '<span class="theory-pill ' + t.cls + '">' + t.pill + '</span></div>' + panel + '</div>';
    }

    function groupHint(g) {
      if (g.kind === "qual") return g.items.length + " not yet";
      if (g.kind === "dead") return g.items.length + " disproven";
      if (g.kind === "look") return g.items.length + " looked at";
      var n = g.items.filter(function (t) { return t.pill === "In model"; }).length;
      var look = g.items.filter(function (t) { return t.pill === "Looked at"; }).length;
      if (n && look) return n + " in the model, " + look + " looked at";
      if (n) return n + " in the model";
      if (look) return look + " looked at";
      return g.items.length + " checked";
    }

    var html = '<p class="theory-lede">Four pills. <b>In the model</b> means the lever moves every player score that has the data. <b>Looked at</b> is a table. It is not a coefficient. <b>Disproven</b> is a table we will not score. <b>Not yet</b> has no file. If it is not in the GLM, it is not on the card.</p><div class="acc theory-families">' + groups.map(function (g, i) {
      if (g.items.length === 1 && g.items[0].name === g.label) {
        return row(g.items[0]);
      }
      return '<section class="acc-item group-acc"><button class="acc-btn group-acc-btn" type="button" data-group="' + i + '"><b>' +
        g.label + '</b><em>' + groupHint(g) + ' <i>+</i></em></button><div class="acc-panel"><div class="acc theory-list">' +
        g.items.map(row).join('') + '</div></div></section>';
    }).join('') + '</div><p class="theory-method"><a href="./methodology.html">Methodology</a></p>';

    TR.renderSimple(
      document.getElementById("app"),
      "theories",
      "Theories",
      "",
      html
    );
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
      });
    });
