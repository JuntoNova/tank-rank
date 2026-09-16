#!/usr/bin/env python3
"""Score drafted careers vs the live draft-night model in all-time.json.

Ranked on fold = career / model, not raw career size. A 41st pick who
becomes an MVP outranks a #1 who was supposed to be great.

    career = 1×AS + 2×All-NBA + 3×1st + 4×Chips + 10×MVP + 20×HOF + 0.25×Yrs
    model  = the same weights on the draft-night columns
    fold   = career / max(model, 0.6)

Over: largest fold, 1989–2018, at least 2 All-Stars or an MVP.
Under: smallest fold among lottery picks the model liked (eAs ≥ 3, pk ≤ 14).
Diff: largest |log fold| in that same modern window.
"""
from __future__ import annotations

import json
import math
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

W_AS, W_NBA, W_NBA1, W_CH, W_MVP, W_HOF, W_YRS = 1, 2, 3, 4, 10, 20, 0.25
FLOOR = 0.6
N = 20


def honor(as_, nba, nba1, ch, mvp, hof, yrs):
    return (
        W_AS * as_
        + W_NBA * nba
        + W_NBA1 * nba1
        + W_CH * ch
        + W_MVP * mvp
        + W_HOF * hof
        + W_YRS * yrs
    )


def num(v, default=0.0):
    try:
        if v is None or v == "":
            return default
        return float(v)
    except (TypeError, ValueError):
        return default


def row_out(r):
    return {
        "n": r["n"],
        "y": r["y"],
        "pk": r["pk"],
        "id": r["id"],
        "t": r["t"],
        "pos": r["pos"],
        "c": r["c"],
        "as": r["as"],
        "nba1": r["nba1"],
        "nba": r["nba"],
        "yrs": r["yrs"],
        "ch": r["ch"],
        "mvp": r["mvp"],
        "hof": r["hof"],
        "eAs": round(r["eAs"], 2),
        "eNba1": round(r["eNba1"], 2),
        "eNba": round(r["eNba"], 2),
        "eYrs": round(r["eYrs"], 2),
        "eCh": round(r["eCh"], 2),
        "eMvp": round(r["eMvp"], 2),
        "eHof": round(r["eHof"], 4),
        "delta": round(r["fold"], 2),
        "act": round(r["act"], 1),
        "exp": round(r["exp"], 1),
    }


def main():
    blob = json.loads((ASSETS / "all-time.json").read_text())
    scored = []
    for r in blob.get("players") or []:
        y = int(r.get("y") or 0)
        pk = int(r.get("pk") or 0)
        if not y or not pk:
            continue
        hof = num(r.get("hof"))
        ast = num(r.get("as"))
        mvp = num(r.get("mvp"))
        # Name collisions (Bobby Jones 2006, Hardaway Jr) inherit a HOF flag.
        if y >= 2005 and hof and ast < 8 and mvp == 0:
            hof = 0.0
        act = honor(
            ast, num(r.get("nba")), num(r.get("nba1")),
            num(r.get("ch")), mvp, hof, num(r.get("yrs")),
        )
        exp = honor(
            num(r.get("eAs")), num(r.get("eNba")), num(r.get("eNba1")),
            num(r.get("eCh")), num(r.get("eMvp")), num(r.get("pHof")), num(r.get("eYrs")),
        )
        fold = act / max(exp, FLOOR)
        scored.append({
            "n": r.get("n") or "",
            "y": y,
            "pk": pk,
            "id": r.get("id") or "",
            "t": r.get("t") or "",
            "pos": r.get("pos") or "",
            "c": r.get("c") or "",
            "as": int(ast),
            "nba1": int(num(r.get("nba1"))),
            "nba": int(num(r.get("nba"))),
            "yrs": int(num(r.get("yrs"))),
            "ch": int(num(r.get("ch"))),
            "mvp": int(mvp),
            "hof": int(hof),
            "eAs": num(r.get("eAs")),
            "eNba1": num(r.get("eNba1")),
            "eNba": num(r.get("eNba")),
            "eYrs": num(r.get("eYrs")),
            "eCh": num(r.get("eCh")),
            "eMvp": num(r.get("eMvp")),
            "eHof": num(r.get("pHof")),
            "act": act,
            "exp": exp,
            "fold": fold,
            "log": abs(math.log(max(fold, 1e-6))),
        })

    over_pool = [s for s in scored if 1989 <= s["y"] <= 2018 and (s["as"] >= 2 or s["mvp"] >= 1)]
    under_pool = [s for s in scored if 1989 <= s["y"] <= 2018 and s["eAs"] >= 3 and s["pk"] <= 14]
    diff_pool = [s for s in scored if 1989 <= s["y"] <= 2018 and (s["as"] >= 2 or (s["eAs"] >= 3 and s["pk"] <= 14))]

    over = sorted(over_pool, key=lambda s: -s["fold"])[:N]
    under = sorted(under_pool, key=lambda s: s["fold"])[:N]
    diff = sorted(diff_pool, key=lambda s: -s["log"])[:N]

    out = {
        "updated": date.today().isoformat(),
        "score": "Δ is career ÷ the draft-night model. Ranked on that fold, not raw career size.",
        "over": [row_out(s) for s in over],
        "under": [row_out(s) for s in under],
        "diff": [row_out(s) for s in diff],
    }
    dest = ASSETS / "outliers.json"
    dest.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    print("OVER")
    for s in over:
        print(f"  {s['n']:24} {s['y']} #{s['pk']:<3} ×{s['fold']:5.1f}  AS {s['as']:2}/{s['eAs']:.1f} MVP {s['mvp']} HOF {s['hof']}")
    print("UNDER")
    for s in under:
        print(f"  {s['n']:24} {s['y']} #{s['pk']:<3} ×{s['fold']:5.2f}  AS {s['as']:2}/{s['eAs']:.1f}")
    print("DIFF")
    for s in diff[:12]:
        print(f"  {s['n']:24} {s['y']} #{s['pk']:<3} ×{s['fold']:5.1f}")
    print("wrote", dest)


if __name__ == "__main__":
    main()
