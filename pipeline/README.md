# The Draft Model — college probability pipeline

Historical outcomes in, probabilities out.

`fit.mjs` still fits **P(outcome | draft pick)** from college first-round draftees. That slot prior is the baseline.

`features.mjs` adds a **college box-score slice**: last-college-season BartTorvik BPM, usage, eFG, and minutes. BPM maps to an implied first-round slot. That implied slot is then scored with the slot prior, so a prospect can be scored without a draft pick. Usage, eFG, and minutes live on the row for the next expansion; they are not in the slot mapping yet.

This folder is **not** wired to the live site board. The public board on [thedraftmodel.com](https://thedraftmodel.com) is still illustrative placeholders (`assets/data.js`). Never present slot priors or these college-feature numbers as live board odds.

## What is real

- `historical-outcomes.json` — binary labels for well-known college-to-NBA first-round outcomes through the 2023-24 NBA season and Hall of Fame class of 2024.
- `fit.mjs` / `predict.mjs` — pick-band frequencies (Laplace-smoothed) for P(All-Star), P(All-NBA), P(HOF), P(bust).
- `college-boxscores.json` — last-college-season BartTorvik BPM, USG, eFG, Min% for Torvik-era players in the historical file (2008+; 28 rows). Pulled from `barttorvik.com/getadvstats.php?year=YYYY&csv=1`. Pre-2008 labels stay on the slot prior only.
- `features.mjs` — OLS implied slot from BPM, then the slot prior. Tests: Anthony Davis last-season BPM maps earlier than Archie Goodwin, and P(All-Star) from that path is higher.

**Bust** means: did not last as a rotation player for approximately 4 NBA seasons. Injury-shortened careers that fail that bar are labeled bust under this definition.

HOF is fit only on players drafted in 2003 or earlier, so recent stars labeled `hof=0` (not yet eligible) do not drag the prior down.

## What is still placeholder

- Live board identities and odds in `assets/data.js`
- No wiring from `output/` into the site UI
- No Top 100/150 public ranking from college features
- Usage, eFG, and Min% are stored, not yet in the implied-slot regression
- Pre-2008 draftees have outcomes, not Torvik box-score rows (Torvik files begin in 2008; the 2007 endpoint currently returns 2026 data)

## Run

```bash
node pipeline/fit.mjs
node pipeline/features.mjs
node pipeline/predict.mjs 1
node pipeline/predict.mjs --bpm 16.6
node pipeline/test.mjs
```

`predict.mjs 1` prints P(All-Star), P(All-NBA), P(HOF), and P(bust) for that pick.

`predict.mjs --bpm 16.6` prints an implied slot from college BPM, then those same probabilities. Optional `--min`, `--usg`, `--efg` are recorded on the row and do not change the mapping yet.

## Next

Richer college-feature mapping (usage, eFG, minutes, and a current-class file) still off the live board. Slot priors stay the baseline, not the product.
