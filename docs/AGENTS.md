# Agent notes — The Draft Model

Read this file before changing nav, homepage doors, About, or `assets/app.js`.
Grok (chat) and Grok bot both ship to `JuntoNova/tank-rank` main. Cloudflare Pages deploys that branch. If you skip this file you will undo the other agent.

Live: https://thedraftmodel.com
Repo: https://github.com/JuntoNova/tank-rank

## Locked IA (do not “fix” back)

- **Menu order:** Historic → Upcoming → Big Board → Methodology
- **Homepage doors:** Historic (Past) on the left / first. Upcoming (Future) on the right / second.
- **Homepage door blurbs:** Historic `1947–2026.` Upcoming `2027 board, plus 2028 and 2029.` Do not use “living”, “every completed class”, or “every round” on the home doors.
- **Historic board banner:** none. Do not restore “Theory-adjusted estimates…” on completed classes.
- **Historic year boards:** keep a `← Historic drafts` button to `drafts.html` in `.section-head`.
- **About is off the menu.** `about.html` may stay as a direct URL. Do not add About back to `.nav-links`.
- Theories pages stay linked from Methodology / Theories, not from the top nav, unless Andrew asks.

## Living boards

- 2027 / 2028 / 2029 public boards target **at least 100 prospects**.
- Depth overlays: `assets/board-2027-depth.js`, `board-2028-depth.js`, `board-2029-depth.js`.
- Keep existing top-of-board order. Append public-consensus names. No invented honor odds.
- 2028/2029 are HS-heavy. Rank is working consensus, not official pick order.

## Why this keeps breaking

`assets/app.js` on main is a **wrapper**. It `GET`s a pinned CDN blob:

`https://cdn.jsdelivr.net/gh/JuntoNova/tank-rank@4d2b1729cda9b9a40965b36e5c5f5ce51b72951a/assets/app.js`

then string-replaces and `eval`s it. That blob still has Upcoming-first doors and an About link. Patching only the local `tank-rank-site/assets/app.js` copy does nothing on production. Replacing the wrapper with a full app.js also fights the other agent if they still patch the CDN blob.

`assets/nav-swap.js` is the runtime lock. It reorders doors + nav and strips About after every render. Leave that lock in place.

## How to ship a UI change

1. Read this file and the latest commit message.
2. Change the wrapper patches in `assets/app.js` **and** keep `assets/nav-swap.js` enforcing the same rule.
3. Bump `?v=` on every HTML file that loads those scripts (index, drafts, upcoming, board, about, player, methodology at minimum).
4. Append a line to the changelog below in the same commit.
5. Do not reintroduce About, Prototype badge, betting language, DBA/NBA footer lines, or Upcoming-first doors.

## Changelog

- 2026-09-13 (Grok chat): Andrew reported Historic/Upcoming swapped on home + menu, and About back in the nav. Locked Historic-first / Upcoming-second. Stripped About from `.nav-links`. Added this file so the two agents stop overwriting IA.
- 2026-09-13 (Grok chat): 2027 board to 100 via `assets/board-2027-depth.js` (Tankathon remainder + BR Wasserman Aug 2026).
- 2026-09-13 (Grok chat): 2028 board to 100 via `assets/board-2028-depth.js` (ESPN 2027 SC Next remainder after existing 1–20).
- 2026-09-13 (Grok chat): 2029 board to 100 via `assets/board-2029-depth.js` (keep 1–14; ESPN 2029 SC Next + On3/Rivals 2029; then ESPN 2028 SC Next names not already on the 2028 board).
- 2026-09-13 (Grok chat): Homepage doors no longer say “every completed class”, “every round”, or “living”. Historic blurb is `1947–2026.` Upcoming blurb is `2027 board, plus 2028 and 2029.`
- 2026-09-13 (Grok chat): Historic board pages (year < currentYear) have no methodology banner. 2026 Yrs is 0 (class has not played an NBA season).
- 2026-09-13 (Grok chat): Historic year boards (incl. 2026) show a ← Historic drafts button back to /drafts.
- 2026-09-13 (Grok chat): 2026 player pages load theory-card + combine/listed/pre-draft. Dybantsa (1) has combine 6-8.5 / 217 / 7-0.5 / 8-10 and BYU 2025-26 line. Player.html was missing theory-card.js.
- 2026-09-13 (Grok chat): 2024 board career yrs/g/ws/vorp joined from Basketball-Reference; outcomes/2020s.json 2024 filled (0 AS / All-NBA). 58 picks is correct (two 2nds forfeited).
- 2026-09-13 (Grok chat): 2021 Yrs column was stuck at 1 for the whole class. Replaced with Basketball-Reference seasons (Cade 5). Kept AS/All-NBA counts.
- 2026-09-13 (Grok chat): 2023 Yrs column was empty. Joined Basketball-Reference seasons (Wemby 3). Kept his AS/All-NBA.
