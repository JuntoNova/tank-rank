# Agent notes — The Draft Model

Read this file before changing nav, homepage doors, About, or `assets/app.js`.
Grok (chat) and Grok bot both ship to `JuntoNova/tank-rank` main. Cloudflare Pages deploys that branch. If you skip this file you will undo the other agent.

Live: https://thedraftmodel.com
Repo: https://github.com/JuntoNova/tank-rank

## Locked IA (do not “fix” back)

- **Menu order:** Historic → Upcoming → Theories. Nothing else in `.nav-links`.
- **Homepage doors:** Historic (Past) on the left / first. Upcoming (Future) on the right / second.
- **Homepage door blurbs:** Historic `1947–2026.` Upcoming `2027 board, plus 2028 and 2029.` Do not use “living”, “every completed class”, or “every round” on the home doors.
- **Historic hub** is `drafts.html` with three pills: Drafts (default, year accordion) / All-time (`?view=alltime`, Now / When drafted, sortable columns, search, decade/pos/pick filters, 20 per page) / Outliers (`?view=outliers`). Do not put Outliers or Methodology back in the top nav.
- **Methodology** lives as a link at the bottom of `theories.html` only. `methodology.html` stays as a URL.
- **Historic board banner:** none. Do not restore “Theory-adjusted estimates…” on completed classes.
- **Historic year boards:** keep a `← Historic drafts` button to `drafts.html` in `.section-head`.
- **About is off the menu.** `about.html` may stay as a direct URL. Do not add About back to `.nav-links`.
- **Theories is on the menu.** Hub is `theories.html`. Do not drop it. Individual theory pages (`size.html`, `age.html`, …) stay off the top nav and highlight Theories.
- **Outliers is a Historic pill, not a nav item.** Data lives in `assets/outliers.json`; rebuild with `pipeline/score-outliers.py` after `all-time.json`. Page is a board table (Year / Pk / Player / Team / AS / 1st / All-NBA / Yrs / Chips / MVP / HOF / Δ). Δ is career ÷ the draft-night model on 1×AS + 2×All-NBA + 3×1st + 4×Chips + 10×MVP + 20×HOF + 0.25×Yrs. Ranked on that fold, not raw career size. Over = largest fold, 1989–2018, 2+ All-Stars or an MVP. Under = fold < 1 among lottery picks the model liked (eAs ≥ 3, pk ≤ 14). Diff = largest |log fold|. Do not restore the ranked-list copy or the hidden win-share term.
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
- 2026-09-17 (Grok chat): Do not skip international lines. Center them on a typical pro line (10/2/1/0.8), not NCAA. Same 8–12 ppg: college 5.6 yrs 8.5% AS; Rubio/Giannis/Jokić 12 yrs 67% AS. Pick-slot intl theory is gone.
- 2026-09-17 (Grok chat): Empty intl files were minting fake overs (Jokić/Giannis/Luka/Parker/Manu). Last-season-against-men lines filled. Jokić Mega 11.4 and Giannis Greek A2 9.5 are real overs. Luka EuroLeague 16/4.3 and Parker Paris 14.7/5.6 move. Over ∩ top-20 HOF/MVP is still empty — those boards are Trae/Durant/Yao, not the Over names.
- 2026-09-17 (Grok chat): Yao’s 2001-02 Shanghai line (32.4/19/2.9/1.5/4.8) was missing. Intl against men now scores. He is 4.3 expected All-Stars, off Over. Duncan’s Wake Forest line was already in; 14.7 reb is on the card but boards are not a live feature (refitting them cut points/blocks). Duncan stays 2.6 AS / ×7.5 because 21 points is not Robinson’s 28.
- 2026-09-17 (Grok chat): High school box scores are not college box scores. Kobe 30.8 / KG 25 / LeBron 31.6 no longer fire the college scoring theory. Age, size, and the HS flag still fire. Kobe is 1.5 AS / 11% Hall, not the 28% cap. Iverson (Georgetown) stays ahead of him. Did not refit origin_hs on the leftover residual — that would mint every prep-to-pro.
- 2026-09-16 (Grok chat): Empty college packs were minting fake overachievers (Payton 0.28 AS / ×19). Last-season pts/ast/stl/blk filled from Sports-Reference for 1986–2026 college draftees. Payton is 3.5 AS, off Over. HS/intl still skip. Under requires fold < 1 so LeBron is not an underachiever.
- 2026-09-16 (Grok chat): Hall of Fame is not a second All-Star column. Steals and blocks do not feed P(HOF). Mosley is not 25% Springfield for 4.3 blocks.
- 2026-09-16 (Grok chat): All-time opens on When drafted. Now is career totals. MVP follows P(All-Star)×0.155 because 31 MVPs is not a 17-feature ranking. Nash’s Santa Clara senior line is in the pack; the old 14th was career MVPs on Now.
- 2026-09-16 (Grok chat): All-time opens on When drafted. Now is career totals. MVP follows P(All-Star)×0.155 because 31 MVPs is not a 17-feature ranking. Nash’s Santa Clara senior line is in the pack; the old 14th was career MVPs on Now.
- 2026-09-16 (Grok chat): Historic year boards were scoring age and size only. all.json has birthdates and no college line; the year pack has the line. Load both and let the year pack win, so Fultz is 3.2 on the 2017 board the same as on his page.
- 2026-09-16 (Grok chat): Historic year boards were scoring age and size only. all.json has birthdates and no college line; the year pack has the line. Load both and let the year pack win, so Fultz is 3.2 on the 2017 board the same as on his page.
- 2026-09-16 (Grok chat): Nested evaluation, baseline table, bootstrap intervals. C and the intercept shift are frozen before 2005–2014. Holdout AUC 0.68 vs pick-oracle 0.77. Grey 10–90 range on draft-night cells from 80 train resamples.
- 2026-09-16 (Grok chat): Scoring is a fitted hurdle GLM, not typed multipliers. Train 1947–2004, holdout 2005–2014, AUC 0.68, mean P(All-Star) matches the holdout rate. HOF is logistic of P(All-Star), not a 20-feature logistic. Pick still out. Missing box scores skip. College lines centered on a typical draftee, not the packed-star mean. Swing and position flags dropped after they stacked with scoring.
- 2026-09-16 (Grok chat): Pick is out of the projection. Missing box scores no longer get a 1.70 cap, which was punishing everyone we hadn't typed stats for.
- 2026-09-16 (Grok chat): Pre-2000 stars were invisible because 22 in 1969 was treated like 22 in 2015, and college stats were missing. Age is relative to the era. Kareem, Magic, Bird, Jordan, Shaq, Oscar, etc. have their draft-year lines. Magic 4th, Shaq 6th, Bird 15th.
- 2026-09-16 (Grok chat): All-time table on phones was table-layout:fixed at 100% width so names, teams, and stats painted on top of each other. Phone view now scrolls sideways, sticks the name, and puts year/pick under the player.
- 2026-09-16 (Grok chat): Barrett 5th / Fultz 7th / Drummond 8th / Ariza 12th was youth × freshman × create × scoring × passing, then squared. Age and freshman no longer double. A 2.7-ast wing is not a 6-8 creator. Barrett 11th, Drummond 18th, Ariza 89th.
- 2026-09-16 (Grok chat): Chips were a 0.32 cap so Cam Christie and Rocco Zikarsky tied LeBron. Titles follow All-Star quality. LeBron 0.83, Cam 0.18, Rocco 0.10.
- 2026-09-16 (Grok chat): Drummond 3rd in MVP. Youth × wingspan × stocks × blocks, and blocks counted twice. Non-creating bigs do not get MVP credit. Stocks and rim no longer double-count. Drummond is 0.05, ~38th. LeBron 0.32.
- 2026-09-16 (Grok chat): Dakari Johnson was tied with LeBron on MVP because every young 7-footer stacked size 1.80 × weight 1.55 × one-spot 1.18, then hit the same cap. Size MVP is 1.22. Weight MVP is shrunk. 5-point scorers do not get MVP credit. Dakari is ~0.02, rank ~700.
- 2026-09-16 (Grok chat): Rebuilt all-time.json so When drafted years use the 19-year ceiling. Flagg is not the max. LeBron 19, Wemby 18.
- 2026-09-16 (Grok chat): Size-at-position and swing sit under Body on the player page, same as Theories. Projection uses height and weight vs the position, and a listed two-spot vs locked-to-one-spot.
- 2026-09-16 (Grok chat): Years. 10 was the ceiling because it only moved with age off 8.5. Stars scale with the rest of the projection now. LeBron 19, Wemby 18, Olowokandi 5. Cap 19.
- 2026-09-16 (Grok chat): Outliers ranked on career ÷ model, not raw career size. Nash / Manu / Jokic rise. Kareem is not #1 just for being Kareem. Δ paints as ×fold.

- 2026-09-16 (Grok chat): LaMelo 14 All-Stars was age × passing × 6-7 handle × tall-PG, then squared. Passing already owns creation. Young pro does not stack on age 18. All-Star is 0.50 × mAs², cap 12. He is ~5.6 now. LeBron 12.
- 2026-09-16 (Grok chat): All-time. Filters next to search. First sort is high to low. Headers keep their width. Now is career vs the draft-night number, same as the boards.
- 2026-09-16 (Grok chat): Josh Jackson. Age 20.4 plus old-freshman ×0.72 was the same birthday twice. Freshman 20–21 is 1.00 now. He is ~3.1 AS. Tatum is 19.3.
- 2026-09-16 (Grok chat): Amir Johnson 19% HOF was age ×2 * fake HS handle * extra HS bump, then squared. Handle now needs a box score. HS origin is 1.10. No stats caps the multiplier. Amir is ~3.5% now.
- 2026-09-16 (Grok chat): 2017 pack. Lonzo 14.6/7.6/1.8, create, 6-6 PG/SG. Fultz Tatum Fox and the rest of that lottery too. Passing actually fires now.
- 2026-09-16 (Grok chat): Size at the position, and swing. +3 inches vs the usual guy at that spot shows up. Listed at two spots shows up. 6-5 to 6-9 by itself does not.
- 2026-09-16 (Grok chat): All-time has Now / When drafted, sortable columns, search, and filters (decade / pos / pick). 20 a page.
- 2026-09-16 (Grok chat): LaMelo. An 18-year-old who already played against men is not the overseas-stash cut. Skinny guard weight does not cut a 6-7 passer. 7 assists is 1.32.
- 2026-09-16 (Grok chat): Nav is Historic / Upcoming / Theories. Methodology sits under Theories. Historic pills: Drafts / All-time / Outliers.
- 2026-09-16 (Grok chat): AS / All-NBA / 1st team are star-tailed. 1st team is cubic in quality. Most of a class prints 0. LeBron 8.5 / 1.2 firsts. Joe Alexander <0.1.
- 2026-09-16 (Grok chat): Robinson 1987. Navy line was missing (28.2/4.5 POY). Senior does not stack on age 21.9. Centers are not taxed for 1 assist. 7-1 at 235 is not a weight cut.
- 2026-09-16 (Grok chat): Draft-night HOF is 1% × quality², cap 28%. A class is ~1 expected Hall of Famer, not 16% for every lottery pick.
- 2026-09-16 (Grok chat): Rubio 2009. File was empty except age + international. ACB 10.0/6.1/2.2, 6-4, creation tag. Passing counts under 6-5.
- 2026-09-16 (Grok chat): Projections are the player file, not the pick. Slot is ×1. Old freshman (Bennett) is a cut. LeBron 10 AS / Brand 3.4 / Bennett 2.2.
- 2026-09-16 (Grok chat): LeBron vs Brand. Age uses the actual year (18.5 ≠ 20.3). Prep-to-pro #1 is a boost, not a 0.95 haircut. 7-0 wingspan is not short. Expected All-Stars are slot × player, not pinned at 5.1 for every #1.
- 2026-09-16 (Grok chat): Wemby draft-night MVP. 7-3+ uses the seven-footer MVP bump (not 0-for-17). Intl #1 is not a Darko veto on MVP. Long 6-10+ wingspan moves MVP. #1 slot prior 0.25 MVPs.
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
