#!/usr/bin/env python3
"""Score drafted careers vs theory-adjusted slot projections. Writes assets/outliers.json.

Δ is career minus the draft-night model on the same columns the boards use:

    1×AS + 2×All-NBA + 3×1st + 4×Chips + 10×MVP + 20×HOF + 0.25×Yrs

No hidden win-share term. HOF is 0/1 vs the same scaled Hall rate the boards paint
(slot × 0.20, cap 10%). Over = largest Δ, 1947–2016. Under = smallest Δ among
picks 1–8, 1989–2017. Diff = largest |Δ| / max(model, 4) so late picks can outrank #1s.
"""
from __future__ import annotations

import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

DISPLAY = {
    "Akeem Olajuwon": "Hakeem Olajuwon",
    "Lew Alcindor": "Kareem Abdul-Jabbar",
    "Chris Jackson": "Mahmoud Abdul-Rauf",
    "Ron Artest": "Metta World Peace",
}

COUNTRY = [
    "spain", "france", "italy", "germany", "greece", "serbia", "croatia",
    "slovenia", "lithuania", "latvia", "russia", "ukraine", "turkey", "israel",
    "australia", "brazil", "argentina", "china", "senegal", "nigeria", "cameroon",
    "congo", "mali", "montenegro", "bosnia", "poland", "czech", "sweden",
    "finland", "belgium", "netherlands", "japan", "korea", "venezuela", "mexico",
    "cuba", "haiti", "jamaica", "bahamas", "sudan", "egypt", "ghana", "angola",
    "portugal", "hungary", "romania", "bulgaria", "georgia", "new zealand",
    "dominican", "puerto rico", "ivory coast",
]

INTENSITY = {
    "1":     {"as": 5.5, "nba": 3.2, "nba1": 0.90, "yrs": 13.5, "ch": 0.55, "mvp": 0.12},
    "2-3":   {"as": 4.2, "nba": 2.4, "nba1": 0.65, "yrs": 11.5, "ch": 0.40, "mvp": 0.06},
    "4-5":   {"as": 3.8, "nba": 2.2, "nba1": 0.45, "yrs": 10.5, "ch": 0.32, "mvp": 0.03},
    "6-10":  {"as": 3.2, "nba": 1.8, "nba1": 0.28, "yrs":  9.0, "ch": 0.25, "mvp": 0.015},
    "11-14": {"as": 2.8, "nba": 1.6, "nba1": 0.20, "yrs":  8.0, "ch": 0.20, "mvp": 0.008},
    "15-30": {"as": 2.2, "nba": 1.4, "nba1": 0.12, "yrs":  6.5, "ch": 0.14, "mvp": 0.003},
    "31+":   {"as": 1.8, "nba": 1.3, "nba1": 0.08, "yrs":  3.5, "ch": 0.06, "mvp": 0.001},
}
AGE_AS = {"u19": 24.1 / 10.9, "a19": 23.3 / 10.9, "a20": 17.7 / 10.9, "a21": 1, "a22": 3.5 / 10.9}
CLS_AGE = {
    "HS": 18, "Fr": 19, "RS-Fr": 19, "So": 20, "RS-So": 20,
    "Jr": 21, "RS-Jr": 21, "Sr": 22, "RS-Sr": 23, "Intl": 20,
}
CLS_RE = re.compile(r"\((RS-Fr|RS-So|RS-Jr|RS-Sr|Fr|So|Jr|Sr|HS[^)]*)\.?\)\s*$", re.I)

# Same Hall scale the boards paint. ~4,700 draftees vs ~111 NBA Springfield members.
HOF_SLOT = 0.20
HOF_CAP = 0.10

# Integer weights on the board columns. 1 All-Star = 1.
W_AS, W_NBA, W_NBA1, W_CH, W_MVP, W_HOF, W_YRS = 1, 2, 3, 4, 10, 20, 0.25


def clamp(n, lo, hi):
    return max(lo, min(hi, n))


def shrink(raw, keep):
    return 1 + (raw - 1) * keep


def keep_as(pk):
    if pk <= 5:
        return 0.42
    if pk <= 14:
        return 0.50
    if pk <= 30:
        return 0.60
    return 0.72


def slot_bucket(pk):
    pk = int(pk or 99)
    if pk == 1:
        return "1"
    if pk <= 3:
        return "2-3"
    if pk <= 5:
        return "4-5"
    if pk <= 10:
        return "6-10"
    if pk <= 14:
        return "11-14"
    if pk <= 30:
        return "15-30"
    return "31+"


def age_key(age):
    if age is None or (isinstance(age, float) and math.isnan(age)):
        return "a21"
    if age < 19.5:
        return "u19"
    if age < 20.5:
        return "a19"
    if age < 21.5:
        return "a20"
    if age < 22.5:
        return "a21"
    return "a22"


def derive_feat(p):
    school = str(p.get("c") or p.get("school") or "")
    low = school.lower()
    cls = ""
    origin = ""
    m = CLS_RE.search(school)
    if m:
        raw = re.sub(r"\.", "", m.group(1))
        if re.match(r"^hs", raw, re.I):
            cls = "HS"
            origin = "hs"
        else:
            cls = re.sub(r"^rs-", "RS-", raw, flags=re.I)
            if cls.startswith("rs-"):
                cls = "RS-" + cls[3:4].upper() + cls[4:]
            elif len(cls) == 2:
                cls = cls[0].upper() + cls[1].lower()
            else:
                cls = cls[0].upper() + cls[1:]
    if not origin:
        if re.search(r"\bhs\b|high school|academy", low):
            origin = "hs"
            cls = cls or "HS"
        elif any(c in low for c in COUNTRY) and not m:
            origin = "intl"
            cls = cls or "Intl"
        else:
            origin = "college"
    age = p.get("draftAge") if p.get("draftAge") is not None else p.get("age")
    if age in ("", None):
        age = CLS_AGE.get(cls)
        if age is None:
            age = 20 if origin == "intl" else 18 if origin == "hs" else 21
    try:
        age = float(age)
    except (TypeError, ValueError):
        age = 21.0
    return {"age": age, "cls": cls, "origin": origin}


def project(p, priors):
    feat = derive_feat(p)
    pk = int(p.get("pk") or p.get("rank") or 99)
    key = slot_bucket(pk)
    slot = priors.get(key) or {}
    inten = INTENSITY.get(key) or INTENSITY["31+"]
    m_as = m_nba = m_hof = m_mvp = m_yrs = 1.0

    def add(mas=1, mmvp=None, nba=None, hof=None, yrs=1):
        nonlocal m_as, m_nba, m_hof, m_mvp, m_yrs
        a = 1 if mas is None else mas
        v = a if mmvp is None else mmvp
        nb = a if nba is None else nba
        hf = a if hof is None else hof
        m_as *= a
        m_nba *= nb
        m_hof *= hf
        m_mvp *= v
        m_yrs *= yrs

    ak = age_key(feat["age"])
    raw_as = AGE_AS[ak]
    age_as = clamp(shrink(raw_as, keep_as(pk)), 0.55, 1.45)
    age_num = feat["age"] if feat["age"] is not None else 21.5
    if age_num <= 18:
        age_mvp_raw = 2.10
    elif age_num <= 19:
        age_mvp_raw = 1.85
    elif age_num <= 20:
        age_mvp_raw = 1.45
    elif age_num <= 21:
        age_mvp_raw = 1.10
    elif age_num <= 22:
        age_mvp_raw = 0.75
    else:
        age_mvp_raw = 0.40
    age_mvp = clamp(1 + (age_mvp_raw - 1) * (0.85 if pk <= 5 else 0.95 if pk <= 14 else 1), 0.30, 2.20)
    if age_num < 19:
        age_yrs = 1.18
    elif age_num < 20:
        age_yrs = 1.12
    elif age_num < 21:
        age_yrs = 1.04
    elif age_num < 22:
        age_yrs = 0.96
    else:
        age_yrs = 0.80
    add(
        age_as, age_mvp, nba=age_as,
        hof=clamp(shrink(raw_as, keep_as(pk) * 0.40), 0.82, 1.18),
        yrs=clamp(age_yrs, 0.70, 1.25),
    )

    cls = feat["cls"] or ""
    if feat["origin"] == "college":
        c_as = c_mvp = 1.0
        if cls in ("Fr", "RS-Fr"):
            if ak in ("u19", "a19"):
                c_as, c_mvp = 1.04, 1.10
            else:
                c_as, c_mvp = 1.12, 1.25
        elif cls in ("Sr", "RS-Sr"):
            if ak != "a22":
                c_as, c_mvp = 0.88, 0.70
        elif cls in ("Jr", "RS-Jr"):
            c_as, c_mvp = 0.96, 0.90
        add(c_as, c_mvp, yrs=1, hof=1)
    else:
        add(1, 1, yrs=1, hof=1)

    if feat["origin"] == "intl":
        if pk <= 5:
            i_as, i_mvp = 0.69, 0.45
        elif pk <= 14:
            i_as, i_mvp = 0.59, 0.80
        else:
            i_as, i_mvp = 1.0, 1.0
        add(i_as, i_mvp, hof=1.05 if pk <= 5 else 1, yrs=0.92 if pk <= 5 else 0.88)
        add(1, 1, yrs=0.94)
    elif feat["origin"] == "hs":
        add(0.95 if pk <= 14 else 1.15, 1.55 if pk <= 5 else 1.35)
        add(1, 1)
    else:
        add(1, 1)
        add(1, 1)

    m_as = clamp(m_as, 0.20, 2.20)
    m_nba = clamp(m_nba, 0.20, 2.20)
    m_hof = clamp(m_hof, 0.35, 1.80)
    m_mvp = clamp(m_mvp, 0.15, 3.20)
    m_yrs = clamp(m_yrs, 0.55, 1.35)
    slot_as = float(slot.get("pAs") or 0)
    slot_nba = float(slot.get("pNba") or 0)
    slot_hof = float(slot.get("pHof") or 0) * HOF_SLOT
    p_as = clamp(slot_as * m_as, 0.002, 0.92)
    p_nba = clamp(slot_nba * m_nba, 0.001, 0.80)
    p_hof = clamp(slot_hof * m_hof, 0.0005, HOF_CAP)
    return {
        "pAs": p_as, "pNba": p_nba, "pHof": p_hof,
        "expAs": p_as * inten["as"],
        "expNba": p_nba * inten["nba"],
        "expNba1": p_nba * inten["nba1"],
        "expYrs": inten["yrs"] * m_yrs,
        "expCh": inten["ch"] * clamp((m_as + m_hof) / 2, 0.50, 1.40),
        "expMvp": inten["mvp"] * m_mvp,
    }


def honor_score(hof, mvp, ch, nba1, nba, ast, yrs):
    return (
        W_HOF * hof + W_MVP * mvp + W_CH * ch + W_NBA1 * nba1
        + W_NBA * nba + W_AS * ast + W_YRS * yrs
    )


def expected_score(proj):
    return honor_score(
        proj["pHof"], proj["expMvp"], proj["expCh"], proj["expNba1"],
        proj["expNba"], proj["expAs"], proj["expYrs"],
    )


def slug(name, year, pick):
    s = re.sub(r"[^a-z0-9]+", "-", (name or "").lower()).strip("-")
    return f"{s}-{year}-{pick or 0}"


def num(v, default=0):
    try:
        if v is None or v == "":
            return default
        return float(v)
    except (TypeError, ValueError):
        return default


def merge_overlays():
    honors = {}

    def absorb(blob):
        if not isinstance(blob, dict):
            return
        for ys, pack in blob.items():
            if not isinstance(pack, dict):
                continue
            year = str(ys)
            honors.setdefault(year, {})
            for pk, h in pack.items():
                if not isinstance(h, dict):
                    continue
                honors[year].setdefault(str(pk), {}).update(h)

    absorb(json.loads((ASSETS / "outcomes-legacy.json").read_text()))
    extra = ASSETS / "outcomes-extra.json"
    if extra.exists():
        absorb(json.loads(extra.read_text()))
    for p in sorted((ASSETS / "outcomes").glob("*s.json")):
        absorb(json.loads(p.read_text()))
    return honors


def load_history():
    rows = []
    for p in sorted((ASSETS / "history").glob("*.json")):
        if p.name.endswith("s.json"):
            continue
        data = json.loads(p.read_text())
        if isinstance(data, list):
            rows.extend(data)
    return rows


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
        "delta": round(r["delta"], 1),
    }


def main():
    priors = json.loads((ASSETS / "slot-priors.json").read_text())
    honors = merge_overlays()
    scored = []
    for r in load_history():
        y = int(r.get("y") or 0)
        pk = int(r.get("pk") or 0)
        raw = str(r.get("n") or "").replace("^", "").replace("*", "").strip()
        if not raw or not y or not pk:
            continue
        name = DISPLAY.get(raw, raw)
        ov = honors.get(str(y), {}).get(str(pk), {}) or {}
        h = {
            "hof": 1.0 if max(num(r.get("hof")), num(ov.get("hof"))) else 0.0,
            "mvp": max(num(r.get("mvp")), num(ov.get("mvp"))),
            "ch": max(num(r.get("ch")), num(ov.get("ch"))),
            "nba1": max(num(r.get("nba1")), num(ov.get("nba1"))),
            "nba": max(num(r.get("nba")), num(ov.get("nba"))),
            "as": max(num(r.get("as")), num(ov.get("as"))),
            "yrs": max(num(r.get("yrs")), num(ov.get("yrs"))),
        }
        proj = project(r, priors)
        act = honor_score(h["hof"], h["mvp"], h["ch"], h["nba1"], h["nba"], h["as"], h["yrs"])
        exp = expected_score(proj)
        delta = act - exp
        scored.append({
            "n": name, "y": y, "pk": pk, "id": slug(name, y, pk),
            "t": str(r.get("t") or r.get("team") or ""),
            "pos": str(r.get("pos") or ""),
            "c": str(r.get("c") or r.get("school") or ""),
            "delta": delta, "act": act, "exp": exp,
            "rel": abs(delta) / max(exp, 4.0),
            "as": int(h["as"]), "nba1": int(h["nba1"]), "nba": int(h["nba"]),
            "yrs": int(h["yrs"]), "ch": int(h["ch"]), "mvp": int(h["mvp"]),
            "hof": int(h["hof"]),
            "eAs": proj["expAs"], "eNba1": proj["expNba1"], "eNba": proj["expNba"],
            "eYrs": proj["expYrs"], "eCh": proj["expCh"], "eMvp": proj["expMvp"],
            "eHof": proj["pHof"],
        })

    over_pool = [s for s in scored if s["y"] <= 2016]
    under_pool = [s for s in scored if 1989 <= s["y"] <= 2017 and s["pk"] <= 8]
    diff_pool = [s for s in scored if s["y"] <= 2016]

    over = sorted(over_pool, key=lambda s: -s["delta"])[:10]
    under = sorted(under_pool, key=lambda s: s["delta"])[:10]
    diff = sorted(diff_pool, key=lambda s: -s["rel"])[:10]

    out = {
        "updated": "2026-09-14",
        "score": "Δ = 1×AS + 2×All-NBA + 3×1st + 4×Chips + 10×MVP + 20×HOF + 0.25×Yrs − the draft-night model on those same columns.",
        "over": [row_out(s) for s in over],
        "under": [row_out(s) for s in under],
        "diff": [row_out(s) for s in diff],
    }
    dest = ASSETS / "outliers.json"
    dest.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    print("OVER")
    for s in over:
        print(f"  {s['n']:24} {s['y']} #{s['pk']:<3} Δ{s['delta']:+7.1f}  AS {s['as']} NBA {s['nba']} MVP {s['mvp']} HOF {s['hof']}")
    print("UNDER")
    for s in under:
        print(f"  {s['n']:24} {s['y']} #{s['pk']:<3} Δ{s['delta']:+7.1f}  AS {s['as']} NBA {s['nba']} yrs {s['yrs']}")
    print("DIFF")
    for s in diff:
        print(f"  {s['n']:24} {s['y']} #{s['pk']:<3} rel {s['rel']:5.2f} Δ{s['delta']:+7.1f}  AS {s['as']} HOF {s['hof']}")
    print("wrote", dest)


if __name__ == "__main__":
    main()
