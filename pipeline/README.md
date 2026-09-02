# The Draft Model — college probability pipeline

Historical outcomes in, probabilities out.

This folder fits **P(outcome | draft pick)** from college first-round draftees. It is a slot prior — pick 1 has a different All-Star rate than pick 25. It does **not** score college box-score features yet, and it is **not** wired to the live site board.

The public board on [thedraftmodel.com](https://thedraftmodel.com) is still illustrative placeholders (`assets/data.js`). Never present these slot priors as live board odds.

## What is real

- `historical-outcomes.json` — binary labels for well-known college-to-NBA first-round outcomes through the 2023-24 NBA season and Hall of Fame class of 2024.
- `fit.mjs` / `predict.mjs` — pick-band frequencies (Laplace-smoothed) for P(All-Star), P(All-NBA), P(HOF), P(bust) using draft pick as the first baseline feature.
- `output/slot-priors.json` — picks 1–30, numbers from the fit, not from `data.js`.

**Bust** means: did not last as a rotation player for approximately 4 NBA seasons. Injury-shortened careers that fail that bar are labeled bust under this definition.

HOF is fit only on players drafted in 2003 or earlier, so recent stars labeled `hof=0` (not yet eligible) do not drag the prior down.

## What is still placeholder

- Live board identities and odds in `assets/data.js`
- No college-stat model
- No Top 100/150 scoring without a pick
- No wiring from `output/` into the site UI

## Run

```bash
node pipeline/fit.mjs
node pipeline/predict.mjs 1
node pipeline/test.mjs
```

`predict.mjs 1` prints P(All-Star), P(All-NBA), P(HOF), and P(bust) for that pick, each in (0, 1).

## Next

College box-score features so a Top 100/150 can be scored without a pick. Slot priors stay the baseline, not the product.
