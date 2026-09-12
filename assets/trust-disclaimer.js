/* Honesty: keep banner visible; enforce exact Hitch disclaimer string. */
(function () {
  var exact = "Prototype board. Not live betting odds. Probability columns unavailable until the published model is connected.";
  if (window.TANK_RANK) TANK_RANK.disclaimer = exact;
})();
