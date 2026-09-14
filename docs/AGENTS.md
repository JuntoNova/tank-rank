# Agent notes — The Draft Model

Read this file before changing nav, homepage doors, About, or `assets/app.js`.
Grok (chat) and Grok bot both ship to `JuntoNova/tank-rank` main. Cloudflare Pages deploys that branch. If you skip this file you will undo the other agent.

Live: https://thedraftmodel.com
Repo: https://github.com/JuntoNova/tank-rank

## Locked IA (do not “fix” back)

- **Menu order:** Historic → Upcoming → Big Board → Methodology
- **Homepage doors:** Historic (Past) on the left / first. Upcoming (Future) on the right / second.
- **About is off the menu.** `about.html` may stay as a direct URL. Do not add About back to `.nav-links`.
- Theories pages stay linked from Methodology / Theories, not from the top nav, unless Andrew asks.

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
