# The Draft Model

Public-facing prototype for [The Draft Model](https://thedraftmodel.com) — data-first NBA rankings.

Live: https://thedraftmodel.com

## Pages
- `index.html` — thesis + board preview
- `board.html` — filterable big board
- `player.html` — probability card
- `methodology.html` — ranking philosophy
- `rankings.html` — expansion map
- `about.html` — project status

Numbers on the board are **illustrative placeholders** until the ranking engine is connected.

## Pipeline

`pipeline/` starts a real college probability path: historical outcomes in, probabilities out. It fits P(outcome | draft pick) from college first-round draftees — a slot prior, not a college-stat model. The public board is still placeholders. Slot priors are not live board odds. See `pipeline/README.md`.

```bash
node pipeline/test.mjs
```

## Local
Open `index.html` in a browser, or:

```bash
python3 -m http.server 8080
```

## Stack next
Static HTML now so the product can be judged in a browser today. Next.js + a JSON/API board can replace these files without changing the information architecture.
