# The Draft Model

Public-facing prototype for [The Draft Model](https://thedraftmodel.com) — data-first NBA rankings.

Live: https://thedraftmodel.com

## Pages
- `index.html` — two doors: upcoming drafts and historic drafts
- `board.html` — filterable big board
- `player.html` — probability card
- `methodology.html` — ranking philosophy
- `rankings.html` — expansion map
- `about.html` — project status

Numbers on the board are **illustrative placeholders** until the ranking engine is connected.

## Local
Open `index.html` in a browser, or:

```bash
python3 -m http.server 8080
```

## Stack next
Static HTML now so the product can be judged in a browser today. Next.js + a JSON/API board can replace these files without changing the information architecture.
