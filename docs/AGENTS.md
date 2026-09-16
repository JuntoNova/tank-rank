# Agent notes — The Draft Model

Read this file before changing nav, homepage doors, About, or `assets/app.js`.
Grok (chat) and Grok bot both ship to `JuntoNova/tank-rank` main. Cloudflare Pages deploys that branch. If you skip this file you will undo the other agent.

Live: https://thedraftmodel.com
Repo: https://github.com/JuntoNova/tank-rank

## Locked IA (do not “fix” back)

- **Menu order:** Historic → Upcoming → Theories → Outliers → Methodology
- **Homepage doors:** Historic (Past) on the left / first. Upcoming (Future) on the right / second.
- **Homepage door blurbs:** Historic `1947–2026.` Upcoming `2027 board, plus 2028 and 2029.` Do not use “living”, “every completed class”, or “every round” on the home doors.
- **Historic board banner:** none. Do not restore “Theory-adjusted estimates…” on completed classes.
- **Historic year boards:** keep a `← Historic drafts` button to `drafts.html` in `.section-head`.
- **About is off the menu.** `about.html` may stay as a direct URL. Do not add About back to `.nav-links`.
- **Theories is on the menu.** Hub is `theories.html`. Do not drop it. Individual theory pages (`size.html`, `age.html`, …) stay off the top nav and highlight Theories.
- **Outliers is on the menu.** Hub is `outliers.html`. Three pills: Overachieved / Underachieved / Most different. Do not drop it. Data lives in `assets/outliers.json`; rebuild with `pipeline/score-outliers.py`. Page is a board table (Year / Pk / Player / Team / AS / 1st / All-NBA / Yrs / Chips / MVP / HOF / Δ). No commentary blurbs. Δ = 1×AS + 2×All-NBA + 3×1st + 4×Chips + 10×MVP + 20×HOF + 0.25×Yrs − the draft-night model on those same columns. Over = largest Δ (1947–2016). Under = smallest Δ among picks 1–8, 1989–2017. Diff = largest |Δ| / model. Do not restore the ranked-list copy or the hidden win-share term.
- **Big Board is off the menu.** It duplicates Upcoming. `board.html?year=` stays as the board URL. Do not put Big Board back in `.nav-links`. About stays off the menu.

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
- 2026-09-16 (Grok chat): Upcoming boards (2027–2029) show expected counts for AS / 1st / All-NBA / Yrs / Chips / MVP, same as historic. Only HOF is a percent.
- 2026-09-16 (Grok chat): Historic theory packs for 1947–2026. Class year from the school suffix. Create tag from assists, not from being a 6-7 forward. Bennett UNLV line is 16.1/8.1 as a freshman.

- 2026-09-16 (Grok chat): Player page Theories accordion now mirrors /theories: Body / Age / How he plays / School, country, and team / Arguments we cannot check yet. Body → five claims. Bigger is better → Height / Weight / Length. Height → Taller guys perform better (7-0 band: AS down, All-NBA / HOF / MVP up).
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
- 2026-09-13 (Grok chat): When-drafted Yrs was a slot constant (every #1 rounded to 17). featOf forced every college player to Fr/19.5; class AS multipliers leaked into years; fmtExp rounded >=10 to an integer. Years now slot prior x age/origin/stash only, one decimal. 2022 lottery has draft-night ages so Paolo != Murray != Agbaji.
- 2026-09-13 (Grok chat): 2022 player cards were empty (no yrs/size/pre-draft). Joined BR career yrs for the class. Keegan Murray (4) has Iowa 2020-22 lines, listed 6-8 / 225 / 6-11, NBA yrs 4.
- 2026-09-13 (Grok chat): 1977 Marques Johnson player card was empty. Joined BR career yrs for the 1977 class (Marques 11). UCLA 1973-77 lines, listed 6-7 / 218, draft age 21.3 Sr. Honors kept (5 AS, 3 All-NBA).
- 2026-09-13 (Grok chat): 1979 Yrs column empty except Magic. Joined Basketball-Reference seasons (Magic 13). Honors unchanged.
- 2026-09-13 (Grok chat): 1979 James Bailey player card was empty. Rutgers 1975-79 lines, listed 6-9 / 220, draft age 22.1 Sr, NBA yrs 9.
- 2026-09-13 (Grok chat): 2019 Yrs column empty. Joined Basketball-Reference seasons (Zion 6, Ja 7). Honors kept.
- 2026-09-13 (Grok chat): Andrew asked Theories back in the top nav (central to the projections). Order is Historic → Upcoming → Big Board → Theories → Methodology. nav-swap injects the link if the CDN blob omits it. About stays off.
- 2026-09-13 (Grok chat): 2024 Zaccharie Risacher player card was empty. Combine 6-8.5 / 195 / 6-9.5 / 8-11. JL Bourg 2023-24 10.1/3.8, EuroCup 11.3. Age 19.2 intl, NBA yrs 2.
- 2026-09-13 (Grok chat): 1967 Mel Daniels player card was empty. NBA table had yrs=1 (11 Nets games); career is 9 ABA/NBA seasons, 18.4 ppg, HOF. New Mexico 1964-67 lines, listed 6-9 / 220, age 22.8 Sr.
- 2026-09-13 (Grok chat): 1997 Yrs column empty except Duncan. Joined Basketball-Reference seasons (Duncan 19). Honors unchanged.
- 2026-09-13 (Grok chat): 1997 Tony Battie player card was empty. Texas Tech 1994-97 lines (Jr 18.8/11.8/2.5), listed 6-11 / 230, age 21.4 Jr, NBA yrs 14.
- 2026-09-13 (Grok chat): 1977 Greg Ballard player card was empty. Oregon 1973-77 lines (Sr 21.7/9.8/2.5), listed 6-7 / 215, age 22.4 Sr, NBA yrs 11, 1978 title.
- 2026-09-13 (Grok chat): 1984 board was empty (no Yrs, honors only in a 9-player overlay). Joined Basketball-Reference seasons (Jordan 15, Olajuwon 18, Stockton 19) and stamped HOF/AS/All-NBA/titles onto the class. Oscar Schmidt HOF kept at pick 131.
- 2026-09-13 (Grok chat): Drafts index showed “Akeem Olajuwon” for 1984. Display name is Hakeem. history-index.json + nav-swap lock.
- 2026-09-13 (Grok chat): 1980 Yrs column empty except McHale. Joined Basketball-Reference seasons (Carroll 10, McHale 13). Honors kept. Do not overwrite 1984 in outcomes/1980s.json.
- 2026-09-13 (Grok chat): 1980 Don Collins player card was empty. Washington State 1976-80 lines (Sr 23.1/6.0/2.7 stl, Pac-10 POY), listed 6-6 / 190, age 21.5 Sr, NBA yrs 6.
- 2026-09-13 (Grok chat): Andrew said Big Board on the main menu is redundant with Upcoming. Removed it. Order is Historic → Upcoming → Theories → Methodology. board.html stays as a URL.
- 2026-09-14 (Grok chat): 1974 Leon Benbow player card was empty. Jacksonville 1971-74 lines (Sr 20.6/6.0), listed 6-4 / 185, age 23.8 Sr, NBA yrs 2 / 5.5 ppg.
- 2026-09-14 (Grok chat): 2003 board was empty (no Yrs, honors only in a 9-player overlay). Joined Basketball-Reference seasons (LeBron 23, Melo 19, Wade 16) and stamped AS/All-NBA/HOF/titles. Do not overwrite 2007 in outcomes/2000s.json.
- 2026-09-14 (Grok chat): 1948 Andy Tonkovich player card was empty. Marshall 1944-48 lines (Sr 13.0, 1947 NAIB champ), listed 6-1 / 185, age 25.5 Sr, BAA 17 games / 2.6 ppg.
- 2026-09-14 (Grok chat): 1996 board was empty (no Yrs, honors only in a 9-player overlay). Joined Basketball-Reference seasons (Iverson 14, Kobe 20, Ray Allen 18) and stamped HOF/AS/All-NBA/MVP/titles. Do not overwrite 1997 in outcomes/1990s.json.
- 2026-09-14 (Grok chat): 2008 board was empty (no Yrs; Patrick Ewing Jr. had his father's honors). Joined Basketball-Reference seasons (Rose 15, Westbrook 18, Love 18). Stamped real AS/All-NBA/MVP/titles. Stripped Ewing Jr. HOF/AS. Do not overwrite 2003/2007 in outcomes/2000s.json.
- 2026-09-14 (Grok bot): PR-F — honor pct honesty (`<1%` / blank, never `0%`); pack vs depth disclose for 2027 (features 1–62; 63–100 slot×origin only). No read-2027 SEO page. Stokes create/HOF and Daniels SE Melbourne Phoenix untouched.
- 2026-09-14 (Grok chat): Bulk-filled Yrs for every historic class 1947–2026 from Basketball-Reference draft tables (seasons/G/PTS/WS). Existing honors kept. Incomplete BAA tables (1947–49, 1952–53) only overlay matching picks then 0 for the rest. Do not wipe decade overlays when filling a single year. 1947 now has history/1947.json (was only 1940s.json).
- 2026-09-14 (Grok chat): Mobile top-right Menu was broken — .nav-inner was a 64px row so the dropdown could not wrap under the hamburger. Flex-wrap + full-width sheet, hide logo year on small screens, rebind Menu click in nav-swap.
- 2026-09-14 (Grok chat): New Outliers menu page (`outliers.html`). Three pills: Overachieved (all-time surplus vs theory-adjusted slot), Underachieved (lottery 1–8, 1989–2017), Most different (relative |delta|/expected). Order is Historic → Upcoming → Outliers → Theories → Methodology. Rebuild lists with `pipeline/score-outliers.py`. Do not invent honors. Do not put Big Board or About back.
- 2026-09-14 (Grok chat): Menu order is Historic → Upcoming → Theories → Outliers → Methodology. Theories sits above Outliers. Big Board and About stay off. Do not swap Theories/Outliers back.
- 2026-09-14 (Grok chat): Yrs and awards are ABA+NBA combined. NBA draft-table seasons plus ABA 1967-68–1975-76 totals. All-Star = NBA AS + ABA AS (do not double-count if overlay already combined). ABA MVPs and documented ABA titles count. Erving is 16 yrs / 16 AS / 4 MVP / 3 titles. Do not overwrite with NBA-only BR draft Yrs.
- 2026-09-14 (Grok chat): Historic player pages were a prospect shell (empty Age / lbs pills, slot-prior “17 years”, hidden career). theory-card now paints career Yrs/G/PTS/WS/AS/All-NBA/MVP/titles/HOF, strips empty pills and empty size boxes, and does not show slot-prior projection grids on completed classes. Fill college/listed when asked; the card must still read from history JSON for everyone.
- 2026-09-14 (Grok chat): Player pages for every historic pick now ingest listed size, draft age, and position from the Basketball-Reference player index (ht/wt/age on ~3,470 NBA/ABA draftees). boot-history copies those fields instead of wiping them. Awards from decade overlays are stamped onto history (Zion/Ja 2019 AS, etc.). College per-game tables filled for ~740 players (2002–2015 bulk + SR CBB pages we already had). Sports-Reference rate-limits the rest; do not wipe existing pre-draft rows. Duncan 1997 stays 19 yrs / 1,392 G / 6-11 / age 21.2 / Wake Forest 1993–97.
- 2026-09-14 (Grok chat): Board tables freeze the column header (Pk / Player / Yrs / AS / …) while you scroll. Desktop sticks the row under the nav; phone keeps it at the top of the scrolling table. Do not drop overflow-x on small screens.
- 2026-09-14 (Grok chat): HOF still too hot after the first cut (Dybantsa 15%). ~4,700 draftees vs ~111 NBA players in Springfield. Scale slot pHof by 0.20, cap 10%. A class is ~0.5 expected HOFers. Late first and second round mostly <1%. Size 7-3 still lifts relative to the same pick. Do not restore 34% or 15% #1 HOF.
- 2026-09-14 (Grok chat): Outliers is a board table, not a ranked list with blurbs. Same columns as the drafts (Year/Pk/Player/Team/AS/1st/All-NBA/Yrs/Chips/MVP/HOF) plus Δ. Each honor cell is career vs the draft-night model. Δ = 1×AS + 2×All-NBA + 3×1st + 4×Chips + 10×MVP + 20×HOF + 0.25×Yrs − model. No win shares in the index. No intro copy, no per-tab blurb. Rebuild with `pipeline/score-outliers.py`.
- 2026-09-14 (Grok chat): One player-page format for every year. Top-right boxes are **Career** (Yrs/G/PTS/WS/AS/All-NBA/MVP/Titles/HOF%). HOF is remaining odds, not Yes/No: already in → 100%; retired ~20+ years and not in → 0%; LeBron-tier still playing → 100%; 2026 with no NBA season yet uses draft-night pHof. Theories table always uses board columns. Do not restore the projectionHero fork (2026 showing draft-night AS/Yrs in those boxes). Simmons 2016 has LSU 2015-16; do not wipe other pre-draft rows.
- 2026-09-15 (Grok chat): Historic board Now HOF is remaining Hall odds vs draft-night pHof, not 0/1 induction. Same careerHofP as player cards (Edwards ~85% now vs 8% drafted). Delta is percentage points. When drafted stays draft-night %. Do not restore vsCell(hof?1:0).
- 2026-09-15 (Grok chat): Player-page size block is this pick only. Height 6-4 / weight 225 show the applied AS/All-NBA/HOF/MVP multipliers for that player. Drop the full /size bin tables from the card. Link out to size.html for the rest.
- 2026-09-15 (Grok chat): Theories hub copy is plain-English front-office arguments. Families: Body / Age / How he plays / School, country, and team / Arguments we cannot check yet. Pills are Checked / Not yet. Added shooting-can-be-taught, motor, feel, BPA-not-need as qualitative. Do not restore analyst jargon titles on the hub.
- 2026-09-15 (Grok chat): /size title is Bigger is better, not You can't teach size. First rows are claims (taller guys, extra inch, heavier guys), not Height bins. Player-card heading matches.
