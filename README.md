# The Draft Model

Public site for [The Draft Model](https://thedraftmodel.com) — data-first NBA rankings.

Live: https://thedraftmodel.com

**Agents (Grok chat + Grok bot): read [docs/AGENTS.md](docs/AGENTS.md) before changing nav, homepage doors, or About.**

## Pages
- `index.html` — two doors: historic drafts first, upcoming drafts second
- `board.html` — filterable big board
- `player.html` — probability card
- `methodology.html` — ranking philosophy
- `rankings.html` — expansion map
- `about.html` — project status (not in the top nav)

## Local
Open `index.html` in a browser, or:

```bash
python3 -m http.server 8080
```

## Stack next
Static HTML now so the product can be judged in a browser today. Next.js + a JSON/API board can replace these files without changing the information architecture.
