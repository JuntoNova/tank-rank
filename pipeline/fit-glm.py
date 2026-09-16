#!/usr/bin/env python3
"""Pick-free hurdle GLM.

Identification
  Draft-night traits only. No pick. No NBA career box scores.
  Age outside 17–25.5 is missing, not a prodigy.
  Packs join on pick number, not array index.

Missing production
  Coefficients for pts/ast/stl/blk/ape are estimated on observed rows
  (miss dummies in train). At predict those dummies are zero — the theory
  does not fire. Production is centered on a typical college draftee line
  (16 / 2.5 / 1.2 / 0.7), not on the star-selected subset we have typed,
  so "skip" does not impute a 19-point star season. Extreme college lines
  are winsorized so 44 points is not 4× a 22-point season.

What was tried and dropped
  Guard/center flags: stacked with scoring and passing.
  Two-position listing (swing): largest raw coefficient, but it is a proxy
  for "we wrote a scouting report" (27% All-Star vs 8%). After scoring and
  passing are in the model it does not belong in the projection.
  stocks = stl+blk: double-counted blocks with the rim theory.

Outcomes
  Logistic P(ever honor), L2, C picked on holdout Brier.
  Poisson E[count | ever] when the positive sample is large, heavily
  shrunk toward the All-Star mean so a good college line is not 10 AS.
  E[count] = P_cal(ever) × E[count | ever].
  P(ever) for All-Star / All-NBA gets an intercept shift on the holdout
  so the mean matches the rate (ranking preserved).
  Years: ridge, then an intercept shift so holdout mean matches.
  Hall of Fame: logistic of P(All-Star) only (rare-event, one feature).
  Championships stay unshifted — holdout chip labels are incomplete.

Train 1947–2004. Holdout 2005–2014. HOF train 1947–1998.
"""
from __future__ import annotations

import json
import math
import os
import re

import numpy as np
from sklearn.linear_model import LogisticRegression, PoissonRegressor, Ridge
from sklearn.metrics import log_loss, roc_auc_score

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HIST = os.path.join(ROOT, "assets", "history")
PACK = os.path.join(ROOT, "assets", "theory-packs")
OUT_JSON = os.path.join(ROOT, "assets", "glm-coefs.json")
OUT_JS = os.path.join(ROOT, "assets", "glm-coefs.js")

HT_RE = re.compile(r"(\d+)\s*-\s*(\d+(?:\.\d+)?)")
POS_HT = {"G": 75.0, "F": 80.0, "C": 83.0}

PROD_CENTER = {"pts": 16.0, "ast": 2.5, "stl": 1.2, "blk": 0.7}
WINSOR = {
    "pts": (8.0, 28.0),
    "ast": (0.0, 8.0),
    "stl": (0.0, 4.0),
    "blk": (0.0, 4.0),
}
HOF_FLOOR = 0.003
HOF_CAP = 0.28
LAM_MIN = 1.0
LAM_MAX = 8.0


def inches(ht):
    if ht is None:
        return None
    if isinstance(ht, (int, float)) and 60 < float(ht) < 100:
        return float(ht)
    m = HT_RE.search(str(ht))
    if not m:
        return None
    v = int(m.group(1)) * 12 + float(m.group(2))
    return v if 68 <= v <= 94 else None


def era_med(y):
    y = int(y or 0)
    if y <= 1975:
        return 21.7
    if y <= 1988:
        return 21.4
    if y <= 2005:
        return 21.0
    return 20.2


def pos_group(pos):
    pos = str(pos or "").upper()
    if re.search(r"C", pos) and not re.search(r"PG|SG|SF|G", pos):
        return "C"
    if re.search(r"PG|SG|\bG\b", pos) and not re.search(r"PF|C", pos):
        return "G"
    if re.search(r"SF|PF|\bF\b", pos):
        return "F"
    if "C" in pos:
        return "C"
    if "G" in pos:
        return "G"
    return ""


def num(x):
    if x is None or x == "":
        return None
    try:
        v = float(x)
        return v if math.isfinite(v) else None
    except (TypeError, ValueError):
        return None


def clean_age(age):
    if age is None:
        return None
    return age if 17.0 <= age <= 25.5 else None


def winsor(k, v):
    if v is None:
        return None
    lo, hi = WINSOR[k]
    return min(hi, max(lo, v))


def load_rows():
    rows = []
    for fn in sorted(os.listdir(HIST)):
        if not re.match(r"^\d{4}\.json$", fn):
            continue
        year = int(fn[:4])
        if year > 2018:
            continue
        hist = json.load(open(os.path.join(HIST, fn)))
        ppath = os.path.join(PACK, fn)
        pack = json.load(open(ppath)) if os.path.exists(ppath) else {"players": []}
        plist = pack.get("players") or []
        by_pk = {f.get("pk"): f for f in plist if isinstance(f, dict)}
        for i, h in enumerate(hist):
            feat = by_pk.get(h.get("pk"))
            if not isinstance(feat, dict):
                feat = plist[i] if i < len(plist) and isinstance(plist[i], dict) else {}
            age = clean_age(num(feat.get("age") if feat.get("age") not in (None, "") else h.get("age")))
            ht = inches(feat.get("ht") or h.get("ht"))
            wt = num(feat.get("wt") if feat.get("wt") not in (None, "") else h.get("wt"))
            if wt is not None and not (150 <= wt <= 360):
                wt = None
            pos = feat.get("pos") or h.get("pos") or ""
            origin = feat.get("origin") or ""
            pts = num(feat.get("pts"))
            ast = num(feat.get("ast"))
            stl = num(feat.get("stl"))
            blk = num(feat.get("blk"))
            wsp = inches(feat.get("wsp"))
            ape = (wsp - ht) if (wsp and ht) else None
            create = 1.0 if feat.get("create") else 0.0
            pg = pos_group(pos)
            d_ht = (ht - POS_HT[pg]) if (ht and pg in POS_HT) else None
            rows.append({
                "y": year, "n": h.get("n"), "pk": h.get("pk"),
                "as": float(h.get("as") or 0),
                "nba": float(h.get("nba") or h.get("allNba") or 0),
                "yrs": float(h.get("yrs") or 0),
                "ch": float(h.get("ch") or 0),
                "mvp": float(h.get("mvp") or 0),
                "hof": 1.0 if h.get("hof") else 0.0,
                "rel_age": (age - era_med(year)) if age is not None else None,
                "ht_in": ht, "wt": wt, "d_ht": d_ht, "ape": ape,
                "origin_hs": 1.0 if origin == "hs" else 0.0,
                "origin_intl": 1.0 if origin == "intl" else 0.0,
                "create_tall": 1.0 if create and ht and ht >= 79 else 0.0,
                "pts": pts, "ast": ast, "stl": stl, "blk": blk,
            })
    return rows


BODY = ["rel_age", "ht_in", "wt", "d_ht", "ape"]
PROD = ["pts", "ast", "stl", "blk"]
CONT = BODY + PROD
BIN = ["origin_hs", "origin_intl", "create_tall"]
MISS_USE = ["pts", "ast", "stl", "blk", "ape"]

THEORY_MAP = {
    "rel_age": "age",
    "origin_hs": "intl",
    "origin_intl": "intl",
    "ht_in": "size",
    "wt": "weight",
    "d_ht": "posht",
    "create_tall": "handle",
    "pts": "prod",
    "miss_pts": "prod",
    "ast": "astu",
    "miss_ast": "astu",
    "stl": "defense",
    "miss_stl": "defense",
    "blk": "rim",
    "miss_blk": "rim",
    "ape": "wingspan",
    "miss_ape": "wingspan",
}


def feature_names():
    return CONT + BIN + ["miss_" + k for k in MISS_USE]


def moments(rows):
    means, sds = {}, {}
    for k in BODY:
        xs = [r[k] for r in rows if r.get(k) is not None]
        a = np.asarray(xs, dtype=float) if xs else np.array([0.0])
        means[k] = float(a.mean())
        sds[k] = float(a.std()) or 1.0
    for k in PROD:
        xs = [winsor(k, r[k]) for r in rows if r.get(k) is not None]
        a = np.asarray(xs, dtype=float) if xs else np.array([1.0])
        means[k] = float(PROD_CENTER[k])
        sds[k] = float(a.std()) or 1.0
    return means, sds


def design(rows, means, sds, predict=False):
    X = []
    for r in rows:
        v = []
        for k in CONT:
            x = r.get(k)
            if x is None:
                v.append(0.0)
                continue
            if k in WINSOR:
                x = winsor(k, x)
            v.append((x - means[k]) / (sds[k] or 1.0))
        for k in BIN:
            v.append(float(r.get(k) or 0.0))
        for k in MISS_USE:
            if predict:
                v.append(0.0)
            else:
                v.append(1.0 if r.get(k) is None else 0.0)
        X.append(v)
    return np.asarray(X, dtype=float)


def pack_linear(kind, intercept, coef, names):
    return {
        "kind": kind,
        "intercept": float(intercept),
        "coef": {k: float(v) for k, v in zip(names, coef)},
    }


def sigmoid(z):
    z = np.clip(z, -20, 20)
    return 1.0 / (1.0 + np.exp(-z))


def logit(p):
    p = np.clip(p, 1e-6, 1 - 1e-6)
    return np.log(p / (1.0 - p))


def spearman(a, b):
    a = np.asarray(a, float)
    b = np.asarray(b, float)
    if a.size < 5:
        return None
    ra = a.argsort().argsort().astype(float)
    rb = b.argsort().argsort().astype(float)
    ra = (ra - ra.mean()) / (ra.std() or 1)
    rb = (rb - rb.mean()) / (rb.std() or 1)
    return float(np.mean(ra * rb))


def intercept_shift(p_raw, rate, lo=-4.0, hi=4.0, steps=40):
    """δ such that mean(sigmoid(logit(p)+δ)) ≈ holdout rate. Slope stays 1."""
    p_raw = np.asarray(p_raw, float)
    target = float(rate)
    best = (abs(p_raw.mean() - target), 0.0)
    for i in range(steps):
        mid = (lo + hi) / 2
        m = float(sigmoid(logit(p_raw) + mid).mean())
        err = abs(m - target)
        if err < best[0]:
            best = (err, mid)
        if m > target:
            hi = mid
        else:
            lo = mid
    return {"intercept": float(best[1]), "slope": 1.0}


def platt_apply(p_raw, spec):
    p_raw = np.asarray(p_raw, float)
    if not spec:
        return p_raw
    return sigmoid(spec["intercept"] + spec["slope"] * logit(p_raw))


def main():
    rows = load_rows()
    names = feature_names()
    train = [r for r in rows if r["y"] <= 2004]
    test = [r for r in rows if 2005 <= r["y"] <= 2014]
    hof_train = [r for r in rows if r["y"] <= 1998]
    means, sds = moments(train)
    Xtr = design(train, means, sds, predict=False)
    Xte = design(test, means, sds, predict=True)
    Xall = design(rows, means, sds, predict=True)
    Xhof = design(hof_train, means, sds, predict=True)
    metrics = {}
    models = {}
    platt = {}

    def fit_hurdle(key, min_pos=40, do_shift=False):
        ytr = np.asarray([r[key] for r in train], float)
        yte = np.asarray([r[key] for r in test], float)
        ztr = (ytr > 0).astype(int)
        zte = (yte > 0).astype(int)
        best = None
        for C in [0.2, 0.4, 0.8, 1.5, 3.0]:
            lg = LogisticRegression(C=C, max_iter=900, solver="lbfgs")
            lg.fit(Xtr, ztr)
            pte = lg.predict_proba(Xte)[:, 1]
            auc = float(roc_auc_score(zte, pte)) if zte.min() != zte.max() else 0.5
            ll = float(log_loss(zte, np.clip(pte, 1e-6, 1 - 1e-6)))
            brier = float(np.mean((pte - zte) ** 2))
            score = -brier + 0.01 * auc
            if best is None or score > best[0]:
                best = (score, C, lg, auc, ll, brier, pte)
        _, C, lg, auc, ll, brier, pte = best
        spec = intercept_shift(pte, zte.mean()) if do_shift else None
        pte_cal = platt_apply(pte, spec)
        brier_cal = float(np.mean((pte_cal - zte) ** 2))
        pos_idx = np.where(ytr > 0)[0]
        mu_pos = float(ytr[pos_idx].mean()) if len(pos_idx) else 1.0
        pos_model = None
        pos_alpha = None
        pos_mae = None
        if len(pos_idx) >= min_pos:
            yp = ytr[pos_idx]
            Xp = Xtr[pos_idx]
            bestp = None
            for a in [3.0, 10.0, 30.0]:
                po = PoissonRegressor(alpha=a, max_iter=900)
                po.fit(Xp, yp)
                te_pos = np.where(yte > 0)[0]
                if len(te_pos) >= 10:
                    pred = np.clip(po.predict(Xte[te_pos]), LAM_MIN, LAM_MAX)
                    mae = float(np.mean(np.abs(pred - yte[te_pos])))
                else:
                    mae = float(np.mean(np.abs(np.clip(po.predict(Xp), LAM_MIN, LAM_MAX) - yp)))
                if bestp is None or mae < bestp[0]:
                    bestp = (mae, a, po)
            pos_model, pos_alpha, pos_mae = bestp[2], bestp[1], bestp[0]
        p_all = platt_apply(lg.predict_proba(Xall)[:, 1], spec)
        if pos_model is not None:
            lam = np.clip(pos_model.predict(Xall), LAM_MIN, LAM_MAX)
        else:
            lam = np.full(len(rows), mu_pos)
        exp = p_all * lam
        te_lam = (
            np.clip(pos_model.predict(Xte), LAM_MIN, LAM_MAX)
            if pos_model is not None else mu_pos
        )
        sp = spearman(yte, pte_cal * te_lam)
        metrics[key] = {
            "C": C,
            "holdout_auc": round(auc, 3),
            "holdout_logloss": round(ll, 3),
            "holdout_brier": round(brier, 4),
            "holdout_brier_cal": round(brier_cal, 4),
            "holdout_mean_p": round(float(pte.mean()), 3),
            "holdout_mean_p_cal": round(float(pte_cal.mean()), 3),
            "holdout_rate": round(float(zte.mean()), 3),
            "holdout_spearman": None if sp is None else round(sp, 3),
            "mu_pos": round(mu_pos, 3),
            "pos_alpha": pos_alpha,
            "pos_mae": None if pos_mae is None else round(float(pos_mae), 3),
            "n_train": len(train),
            "n_pos": int(ztr.sum()),
            "platt": spec,
        }
        if spec:
            platt[key] = spec
        lebron = next((i for i, r in enumerate(rows) if r["n"] == "LeBron James"), None)
        print(key, "auc", round(auc, 3), "C", C, "brier", round(brier, 4),
              "cal", round(brier_cal, 4), "mu_pos", round(mu_pos, 2),
              "maxE", round(float(exp.max()), 2),
              "LeBron", None if lebron is None else round(float(exp[lebron]), 2))
        models[key + "_ever"] = lg
        models[key + "_pos"] = pos_model
        models[key + "_mu"] = mu_pos
        return exp, p_all

    e_as, p_as = fit_hurdle("as", do_shift=True)
    e_nba, _ = fit_hurdle("nba", do_shift=True)
    e_mvp, _ = fit_hurdle("mvp", min_pos=80, do_shift=False)
    e_ch, _ = fit_hurdle("ch", min_pos=80, do_shift=False)

    ytr = np.asarray([r["yrs"] for r in train], float)
    yte = np.asarray([r["yrs"] for r in test], float)
    best = None
    for a in [0.3, 1.0, 3.0, 10.0]:
        rd = Ridge(alpha=a)
        rd.fit(Xtr, ytr)
        pred = np.clip(rd.predict(Xte), 0, 22)
        mae = float(np.mean(np.abs(pred - yte)))
        if best is None or mae < best[0]:
            best = (mae, a, rd, pred)
    mae, a, rd, pred = best
    yrs_shift = float(yte.mean() - pred.mean())
    models["yrs"] = rd
    metrics["yrs"] = {
        "alpha": a,
        "holdout_mae": round(mae, 3),
        "holdout_mean_actual": round(float(yte.mean()), 3),
        "holdout_mean_pred": round(float(pred.mean()), 3),
        "shift": round(yrs_shift, 3),
        "holdout_mean_pred_cal": round(float(pred.mean() + yrs_shift), 3),
    }
    print("yrs", "mae", round(mae, 3), "alpha", a, "shift", round(yrs_shift, 3))

    p_as_hof = platt_apply(models["as_ever"].predict_proba(Xhof)[:, 1], platt.get("as"))
    yhof = np.asarray([r["hof"] for r in hof_train], float)
    p_given_as = float(np.mean([r["hof"] for r in hof_train if r["as"] > 0]))
    p_given_no = float(np.mean([r["hof"] for r in hof_train if r["as"] == 0]))
    # Law of total probability: P(HOF) = P(HOF|AS) P(AS) + P(HOF|no) (1-P(AS)).
    # P(AS) is the model's calibrated probability, not the career label.
    p_hof = np.clip(p_given_no + (p_given_as - p_given_no) * p_as_hof, HOF_FLOOR, HOF_CAP)
    hof_from_as = {
        "kind": "mixture",
        "p_given_as": p_given_as,
        "p_given_no": p_given_no,
    }
    metrics["hof"] = {
        "from": "P(HOF|AS) P(AS) + P(HOF|no) (1-P(AS))",
        "p_given_as": round(p_given_as, 4),
        "p_given_no": round(p_given_no, 4),
        "train_rate": round(float(yhof.mean()), 4),
        "train_mean_pred": round(float(p_hof.mean()), 4),
        "train_brier": round(float(np.mean((p_hof - yhof) ** 2)), 4),
        "n_train": len(hof_train),
    }
    print("hof", "rate", metrics["hof"]["train_rate"], "mean_pred", metrics["hof"]["train_mean_pred"],
          "brier", metrics["hof"]["train_brier"], "P(HOF|AS)", round(p_given_as, 3))

    print("top E[AS]")
    top = sorted(zip(e_as, rows), key=lambda t: -t[0])[:20]
    for p, r in top:
        print(f"  {r['y']} #{r['pk']:2} {r['n']:24} E[AS] {p:.2f} act {r['as']:.0f}")

    named = [
        "LeBron James", "Kobe Bryant", "Michael Jordan", "Magic Johnson", "Larry Bird",
        "Kareem Abdul-Jabbar", "Tim Duncan", "Shaquille O'Neal", "Pete Maravich",
        "Markelle Fultz", "Adonal Foyle", "Elton Brand", "Anthony Bennett",
        "Luka Dončić", "David Robinson", "Bill Walton", "Oscar Robertson",
        "Kevin Durant", "Anthony Davis", "Allen Iverson",
    ]
    print("named")
    by_name = {r["n"]: (e_as[i], p_as[i], rows[i]) for i, r in enumerate(rows)}
    for n in named:
        if n not in by_name:
            print(f"  {n:24} (not in 1947–2018 fit file)")
            continue
        e, p, r = by_name[n]
        print(f"  {n:24} E[AS] {e:.2f} p {p:.2f} act {r['as']:.0f} {r['y']} #{r['pk']}")

    coefs = {
        "method": "hurdle GLM: L2 logistic P(ever) × shrunk Poisson E[count|ever]; Ridge years; HOF = logistic of P(AS)",
        "identification": "No draft pick. Draft-night traits only. Age clipped to 17–25.5. Missing production skipped at predict and centered on a typical college line, not the packed-star mean. Swing and position flags dropped after they stacked with scoring.",
        "train": [1947, 2004],
        "holdout": [2005, 2014],
        "hof_train": [1947, 1998],
        "features": names,
        "continuous": CONT,
        "binary": BIN,
        "missing": ["miss_" + k for k in MISS_USE],
        "theory_map": THEORY_MAP,
        "means": {k: round(v, 6) for k, v in means.items()},
        "sds": {k: round(v, 6) for k, v in sds.items()},
        "winsor": {k: [lo, hi] for k, (lo, hi) in WINSOR.items()},
        "prod_center": PROD_CENTER,
        "lam_min": LAM_MIN,
        "lam_max": LAM_MAX,
        "metrics": metrics,
        "n": len(rows),
        "pos_ht": POS_HT,
        "platt": platt,
        "hof_from_as": hof_from_as,
        "yrs_shift": yrs_shift,
        "hof_floor": HOF_FLOOR,
        "hof_cap": HOF_CAP,
    }
    for key in ("as", "nba", "mvp", "ch"):
        lg = models[key + "_ever"]
        coefs[key + "_ever"] = pack_linear("logistic", lg.intercept_[0], lg.coef_[0], names)
        po = models[key + "_pos"]
        if po is not None:
            coefs[key + "_pos"] = pack_linear("poisson", po.intercept_, po.coef_, names)
        else:
            coefs[key + "_pos"] = {"kind": "constant", "mu": models[key + "_mu"]}
    coefs["yrs"] = pack_linear("linear", models["yrs"].intercept_, models["yrs"].coef_, names)

    json.dump(coefs, open(OUT_JSON, "w"), indent=2)
    with open(OUT_JS, "w") as f:
        f.write("window.TR=window.TR||{};TR.GLM=")
        json.dump(coefs, f)
        f.write(";\n")
    print("wrote", OUT_JSON, OUT_JS)


if __name__ == "__main__":
    main()
