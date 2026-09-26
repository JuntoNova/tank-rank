(function () {
  var STATUS = {
    "You can't teach size": "In the model. Height, weight, length, size at the position, and swing move the player score.",
    "Tall guys who can dribble are rare": "In the model. Raw assists and the 6-7+ creator flag move the player score.",
    "Workout numbers do not mean much": "Looked at. Combine drills are not a GLM feature.",
    "Drafting younger is better": "In the model. Relative age changes years played and the chance of an All-Star selection.",
    "College stats tell you who will be good": "In the model. Points and assists move the player score. Blocks are capped at 2.0 for honors.",
    "Guys who get fouled a lot can get to the rim": "Looked at. Free-throw rate is not a GLM feature.",
    "Taking a lot of threes matters more than a hot percentage": "Looked at. Three-point volume is not a GLM feature.",
    "Passing travels better than scoring": "In the model. Raw assists move the player score. Assist-to-usage does not.",
    "College defense does not tell you anything": "In the model. Steals are capped at 2.5 for honors. They do not feed Hall.",
    "You still need a big who can block shots": "In the model. Blocks are capped at 2.0 for honors.",
    "Great shooters stay shooters": "In the model. College FT% is skip-missing. The claim that holds is the shot, not the All-Star chance.",
    "Elite high school players overcome a bad college year": "In the model. McDonald's All-American is a binary from 1977 on. Pre-1977 is missing. High school points are not college points.",
    "The best players come from the best colleges": "Looked at. School is not a GLM feature.",
    "A pro line is not a college line": "In the model. International lines are kept and centered on a typical pro line.",
    "The team that drafts him matters as much as the player": "Looked at. Team logo is not a GLM feature.",
    "Leave a raw foreign player overseas until he is ready": "Looked at. Stash is not a GLM feature.",
    "Older guys have a higher floor": "Disproven. Not in the player score.",
    "Some players get good late, and teams miss them": "Disproven. Not in the player score.",
    "Getting better in year two means more than a huge freshman year": "Disproven. Not in the player score.",
    "Guarding every position matters more than blocking shots": "Not yet. No pre-draft switch tag.",
    "Tournament games show you who is clutch": "Not yet. No player-matched NCAA tournament box.",
    "He only works in our system": "Not yet. No draft-night scheme tag.",
    "Hidden injuries change everything": "Not yet. No public imaging series.",
    "Off-court warning signs predict busts": "Not yet. No public character-flag list.",
    "How high he can reach beats how high he jumps": "In the model. Standing reach moves the player score when we have it.",
    "Long arms help on defense": "In the model. Wingspan and ape move the player score when we have them.",
    "One year of college is enough if you are a star": "Looked at. Not a GLM feature."
  };
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
    var status = STATUS[title];
    var top = [status, lede].filter(Boolean).join(" ");
    if (top) html += '<p class="theory-lede">' + top + "</p>";
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
