# 2027 board populate — sources

Public product name: **The Draft Model**. Do not merge until Andrew yeses.

## What this PR does
- Living **2027** board stays college + international only (no high school; 2028/2029 wait).
- Ranks keep the existing working-consensus order already on the board.
- Bio fields kept (school/club, pos, age, ht, wt) as previously published board facts.
- **Probability / Exp WS / Δ columns are unavailable** — invented defaults removed for 2027 rows; UI shows em dash when null.
- Does **not** wire pipeline odds from `pipeline/output/` into the live board.

## Sources (cited, not scraped mock prose)
- ESPN 2027 draft board / top players context: https://www.espn.com/nba/story/_/id/49101766/2027-nba-mock-draft-no-1-pick-options-top-players-race-picks (retrieved earlier for class list research; this PR does not paste mock essay text).
- BartTorvik 2026 college advanced stats (research / college-returner verification off-board): https://barttorvik.com/getadvstats.php?year=2026&csv=1
- Prior off-board research file (not wired as live odds): PR #5 `current-class-2027` / `pipeline/output/current-class-2027.json`

## Out of scope
- High school prospects
- 2028 / 2029 populate
- Publishing invented honor probabilities
- Merging without Andrew yes
