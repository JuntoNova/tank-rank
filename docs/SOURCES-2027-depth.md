# 2027 board depth — sources

Public product: **The Draft Model**. Do not merge until Andrew yeses.

## What this PR adds
- Appends additional **2027 college + international** prospects from the ESPN 2027 top-60 class list who were not already on the living board.
- College returners verified against BartTorvik 2026 advanced stats where a season row exists.
- Freshmen / internationals on that board included with school/club bio only (no invented odds).
- High school and 2028/2029 still wait.
- Probability columns remain unavailable (not invented).

## Sources
- ESPN 2027 mock draft top 60: https://www.espn.com/nba/story/_/id/49101766/2027-nba-mock-draft-no-1-pick-options-top-players-race-picks (retrieved 2026-09-02 for class list; no mock prose pasted into the product)
- BartTorvik 2026 player CSV: https://barttorvik.com/getadvstats.php?year=2026&csv=1
- Off-board class file: `pipeline/current-class-2027.json` on branch `current-class-2027` (research only)

## Not included
- Invented honor probabilities / Exp WS / Δ
- High school prospects
- 2028 / 2029 depth
