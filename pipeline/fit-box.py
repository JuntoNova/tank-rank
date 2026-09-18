#!/usr/bin/env python3
"""Career PPG / RPG / APG / BPM from draft-night traits. No pick."""
from __future__ import annotations

import json
import math
import os
import re
import sys

import numpy as np
from sklearn.linear_model import Ridge

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(__file__))
import importlib.util
spec = importlib.util.spec_from_file_location("fitglm", os.path.join(ROOT, "pipeline", "fit-glm.py"))
fg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fg)

HIST = fg.HIST
PACK = fg.PACK
OUT_JSON = fg.OUT_JSON
OUT_JS = fg.OUT_JS
RIDGE_GRID = [0.1, 0.3, 1.0, 3.0]
CAPS = {
    "nba_pts": (2.0, 28.0),
    "nba_trb": (0.5, 14.0),
    "nba_ast": (0.3, 11.0),
    "nba_bpm": (-5.5, 9.0),
}


def load():
    rows = fg.load_rows()
    by = {(r["y"], r["pk"]): r for r in rows}
    extra = []
    for fn in sorted(os.listdir(HIST)):
        if not re.match(r"^\d{4}\.json$", fn):
            continue
        year = int(fn[:4])
        hist = json.load(open(os.path.join(HIST, fn)))
        ppath = os.path.join(PACK, fn)
        pack = json.load(open(ppath)) if os.path.exists(ppath) else {"players": []}
        by_pk = {f.get("pk"): f for f in (pack.get("players") or []) if isinstance(f, dict)}
        for h in hist:
            rec = by.get((year, h.get("pk")))
            feat = by_pk.get(h.get("pk")) or {}
            if rec is None:
                continue
            rec["college_reb"] = fg.num(feat.get("reb") if feat.get("reb") not in (None, "") else feat.get("trb"))
            rec["nba_pts"] = fg.num(h.get("pts"))
            rec["nba_trb"] = fg.num(h.get("trb"))
            rec["nba_ast"] = fg.num(h.get("ast"))
            rec["nba_bpm"] = fg.num(h.get("bpm"))
            rec["nba_g"] = fg.num(h.get("g"))
            extra.append(rec)
    return extra


def design_reb(rows, means, sds, predict=False):
    names = fg.feature_names() + ["reb", "miss_reb", "pts_hi", "ast_hi", "reb_hi"]
    pts_idx = fg.feature_names().index("pts")
    ast_idx = fg.feature_names().index("ast")
    sd_pts = sds.get("pts") or 4.8
    sd_ast = sds.get("ast") or 2.0
    mu_reb = means.get("reb", 7.0)
    sd_reb = sds.get("reb", 3.0) or 1.0
    X = []
    for r in rows:
        base = fg.design([r], means, sds, predict=predict)[0].tolist()
        pts = r.get("pts")
        if pts is not None:
            pts = min(36.0, max(8.0, pts))
            base[pts_idx] = (pts - 16.0) / sd_pts
        ast = r.get("ast")
        if ast is not None:
            ast = min(12.0, max(0.0, ast))
            base[ast_idx] = (ast - 2.5) / sd_ast
        v = r.get("college_reb")
        if v is None:
            base.append(0.0)
            base.append(0.0 if predict else 1.0)
            reb_hi = 0.0
        else:
            v = min(20.0, max(1.0, v))
            base.append((v - mu_reb) / sd_reb)
            base.append(0.0)
            reb_hi = max(0.0, v - 10.0) / 3.0
        pts_hi = max(0.0, (pts if pts is not None else 16.0) - 24.0) / 4.0 if pts is not None else 0.0
        ast_hi = max(0.0, (ast if ast is not None else 2.5) - 5.0) / 2.0 if ast is not None else 0.0
        base.append(pts_hi)
        base.append(ast_hi)
        base.append(reb_hi)
        X.append(base)
    return np.asarray(X, float), names


def fit_one(Xtr, ytr, Xho, yho, Xin, yin):
    best_a, best = 3.0, 1e9
    for a in RIDGE_GRID:
        m = Ridge(alpha=a)
        m.fit(Xin, yin)
        pred = m.predict(Xin)
        mae = float(np.mean(np.abs(pred - yin)))
        if mae < best:
            best, best_a = mae, a
    m = Ridge(alpha=best_a)
    m.fit(Xtr, ytr)
    raw = m.predict(Xho)
    shift = float(np.mean(yho) - np.mean(raw))
    pred = raw + shift
    return {
        "alpha": best_a,
        "inner_mae": round(best, 3),
        "holdout_mae": round(float(np.mean(np.abs(pred - yho))), 3),
        "holdout_mean_actual": round(float(np.mean(yho)), 3),
        "holdout_mean_pred": round(float(np.mean(pred)), 3),
        "shift": round(shift, 4),
        "intercept": float(m.intercept_),
        "coef": m.coef_,
    }


def main():
    rows = load()
    glm = json.load(open(OUT_JSON))
    means = glm["means"]
    sds = glm["sds"]
    reb_xs = [r["college_reb"] for r in rows if r.get("college_reb") is not None]
    means["reb"] = 7.0
    sds["reb"] = float(np.std(reb_xs)) if reb_xs else 3.0
    box = {"means": {"reb": 7.0}, "sds": {"reb": round(sds["reb"], 4)}}
    names = None
    for key, min_g, min_year in (
        ("nba_pts", 100, 1947),
        ("nba_trb", 100, 1951),
        ("nba_ast", 100, 1947),
        ("nba_bpm", 100, 1974),
    ):
        use = [
            r for r in rows
            if r.get(key) is not None
            and (r.get("nba_g") or 0) >= min_g
            and r["y"] >= min_year
        ]
        train = [r for r in use if 1947 <= r["y"] <= 2004]
        inner = [r for r in train if 1995 <= r["y"] <= 2004]
        hold = [r for r in use if 2005 <= r["y"] <= 2014]
        Xtr, names = design_reb(train, means, sds, predict=True)
        Xin, _ = design_reb(inner, means, sds, predict=True)
        Xho, _ = design_reb(hold, means, sds, predict=True)
        ytr = np.array([r[key] for r in train], float)
        yin = np.array([r[key] for r in inner], float)
        yho = np.array([r[key] for r in hold], float)
        fit = fit_one(Xtr, ytr, Xho, yho, Xin, yin)
        lo, hi = CAPS[key]
        spec = {
            "kind": "linear",
            "intercept": round(fit["intercept"], 6),
            "coef": {k: round(float(v), 6) for k, v in zip(names, fit["coef"])},
            "shift": fit["shift"],
            "lo": lo,
            "hi": hi,
            "alpha": fit["alpha"],
            "inner_mae": fit["inner_mae"],
            "holdout_mae": fit["holdout_mae"],
            "holdout_mean_actual": fit["holdout_mean_actual"],
            "holdout_mean_pred": fit["holdout_mean_pred"],
            "n_train": len(train),
            "n_hold": len(hold),
        }
        box[key] = spec
        print(key, "n", len(train), "hold", len(hold), "mae", fit["holdout_mae"],
              "act", fit["holdout_mean_actual"], "pred", fit["holdout_mean_pred"],
              "shift", fit["shift"])
        # sanity: top college scorers vs low
        ranked = sorted(hold, key=lambda r: -(r.get("pts") or 0))
        print("  hold high college pts", ranked[0]["n"], ranked[0].get("pts"), ranked[0][key])

    glm["box"] = box
    ident = glm.get("identification") or ""
    if "Career PPG" not in ident:
        glm["identification"] = ident + " Career PPG/RPG/APG/BPM from the same draft-night traits. No pick."
    json.dump(glm, open(OUT_JSON, "w"))
    with open(OUT_JS, "w") as f:
        f.write("window.TR=window.TR||{};TR.GLM=")
        json.dump(glm, f, separators=(",", ":"))
        f.write(";\n")
    print("wrote box into", OUT_JSON)


if __name__ == "__main__":
    main()
