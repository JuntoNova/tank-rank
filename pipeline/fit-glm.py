#!/usr/bin/env python3
"""Pick-free hurdle GLM.

Identification
  Draft-night traits only. No pick. No NBA career box scores.
  Age outside 17–25.5 is missing, not a prodigy.
  Packs join on pick number, not array index.

Nested evaluation
  Hyperparameters (L2 C, Poisson alpha, Ridge alpha, intercept shift)
  are chosen on an inner slice 1995–2004. The model is then refit on
  1947–2004. 2005–2014 is locked and only used to report.

Missing production
  Coefficients for pts/ast/stl/blk/ape are estimated on observed rows
  (miss dummies in train). At predict those dummies are zero — the theory
  does not fire. Production is centered on a typical college draftee line
  (16 / 2.5 / 1.2 / 0.7), not on the star-selected subset we have typed.
  Extreme college lines are winsorized.
  High school box scores are a different unit. Skip them at predict
  (theory-model.js). Do not refit origin_hs on the leftover Kobe/KG/LeBron
  residual — that would mint every prep-to-pro.

Uncertainty
  80 train-resamples, same frozen hyperparameters. Player intervals are
  the 10th–90th percentile of those draws.

Train 1947–2004. Inner 1995–2004. Holdout 2005–2014. HOF train 1947–1998.
"""
from __future__ import annotations

import json
import math
import os
import re

import numpy as np
from sklearn.linear_model import LogisticRegression, PoissonRegressor, Ridge
from sklearn.metrics import log_loss, roc_auc_score
from sklearn.model_selection import KFold, StratifiedKFold

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
BOOT_B = 80
BOOT_SEED = 1
C_GRID = [0.2, 0.4, 0.8, 1.5, 3.0]
PO_GRID = [3.0, 10.0, 30.0]
RIDGE_GRID = [0.3, 1.0, 3.0, 10.0]


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


def pack_linear(kind, intercept, coef, names, nd=6):
    return {
        "kind": kind,
        "intercept": round(float(intercept), nd),
        "coef": {k: round(float(v), nd) for k, v in zip(names, coef)},
    }


def pack_boot_spec(kind, intercept, coef, names):
    return pack_linear(kind, intercept, coef, names, nd=4)


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
    """δ such that mean(sigmoid(logit(p)+δ)) ≈ rate. Slope stays 1."""
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


def y_of(rows, key):
    return np.asarray([r[key] for r in rows], float)


def auc_of(z, p):
    z = np.asarray(z)
    p = np.asarray(p)
    if z.min() == z.max():
        return 0.5
    return float(roc_auc_score(z, p))


def report(name, p, z, extra=None):
    p = np.asarray(p, float)
    z = np.asarray(z, float)
    out = {
        "name": name,
        "auc": round(auc_of(z, p), 3),
        "brier": round(float(np.mean((p - z) ** 2)), 4),
        "logloss": round(float(log_loss(z, np.clip(p, 1e-6, 1 - 1e-6))), 3) if z.min() != z.max() else None,
        "mean_p": round(float(p.mean()), 3),
        "rate": round(float(z.mean()), 3),
        "spearman": None if spearman(z, p) is None else round(spearman(z, p), 3),
    }
    if extra:
        out.update(extra)
    return out


def oof_logit_shift(X, z, C, n_splits=5, seed=1):
    """Intercept shift from out-of-fold train predictions. Holdout is not used."""
    z = np.asarray(z, int)
    oof = np.zeros(len(z), float)
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=seed)
    for tr, va in skf.split(X, z):
        lg = fit_logit(X[tr], z[tr], C)
        oof[va] = lg.predict_proba(X[va])[:, 1]
    return intercept_shift(oof, z.mean()), oof


def oof_ridge_shift(X, y, alpha, n_splits=5, seed=1):
    y = np.asarray(y, float)
    oof = np.zeros(len(y), float)
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=seed)
    for tr, va in kf.split(X):
        rd = Ridge(alpha=alpha)
        rd.fit(X[tr], y[tr])
        oof[va] = np.clip(rd.predict(X[va]), 0, 22)
    return float(y.mean() - oof.mean())


def select_logit_C(Xfit, zfit, Xval, zval):
    if zfit.min() == zfit.max() or len(Xfit) < 20:
        return 1.0, 0.5, 0.0
    best = None
    for C in C_GRID:
        lg = LogisticRegression(C=C, max_iter=900, solver="lbfgs")
        lg.fit(Xfit, zfit)
        p = lg.predict_proba(Xval)[:, 1]
        brier = float(np.mean((p - zval) ** 2))
        auc = auc_of(zval, p)
        score = -brier + 0.01 * auc
        if best is None or score > best[0]:
            best = (score, C, auc, brier, lg)
    return best[1], best[2], best[3]


def select_poisson_alpha(Xfit, yfit, Xval, yval):
    pos_fit = np.where(yfit > 0)[0]
    pos_val = np.where(yval > 0)[0]
    if len(pos_fit) < 40:
        return None, float(yfit[pos_fit].mean()) if len(pos_fit) else 1.0, None
    bestp = None
    for a in PO_GRID:
        po = PoissonRegressor(alpha=a, max_iter=900)
        po.fit(Xfit[pos_fit], yfit[pos_fit])
        if len(pos_val) >= 8:
            pred = np.clip(po.predict(Xval[pos_val]), LAM_MIN, LAM_MAX)
            mae = float(np.mean(np.abs(pred - yval[pos_val])))
        else:
            pred = np.clip(po.predict(Xfit[pos_fit]), LAM_MIN, LAM_MAX)
            mae = float(np.mean(np.abs(pred - yfit[pos_fit])))
        if bestp is None or mae < bestp[0]:
            bestp = (mae, a, po)
    mu = float(yfit[pos_fit].mean())
    return bestp[1], mu, bestp[0]


def select_ridge_alpha(Xfit, yfit, Xval, yval):
    best = None
    for a in RIDGE_GRID:
        rd = Ridge(alpha=a)
        rd.fit(Xfit, yfit)
        pred = np.clip(rd.predict(Xval), 0, 22)
        mae = float(np.mean(np.abs(pred - yval)))
        if best is None or mae < best[0]:
            best = (mae, a, rd)
    return best[1], best[0]


def fit_logit(X, z, C):
    lg = LogisticRegression(C=C, max_iter=900, solver="lbfgs")
    lg.fit(X, z)
    return lg


def subset_X(X, names, keep):
    idx = [i for i, k in enumerate(names) if k in keep]
    if not idx:
        return np.zeros((len(X), 1))
    return X[:, idx]


def main():
    rows = load_rows()
    names = feature_names()
    train = [r for r in rows if r["y"] <= 2004]
    inner_fit = [r for r in rows if r["y"] <= 1994]
    inner_val = [r for r in rows if 1995 <= r["y"] <= 2004]
    test = [r for r in rows if 2005 <= r["y"] <= 2014]
    hof_train = [r for r in rows if r["y"] <= 1998]
    means, sds = moments(train)

    Xtr = design(train, means, sds, predict=False)
    Xtr_p = design(train, means, sds, predict=True)
    Xin = design(inner_fit, means, sds, predict=False)
    Xval = design(inner_val, means, sds, predict=True)
    Xte = design(test, means, sds, predict=True)
    Xall = design(rows, means, sds, predict=True)
    Xhof = design(hof_train, means, sds, predict=True)

    metrics = {}
    models = {}
    platt = {}
    inner_notes = {}

    def fit_hurdle(key, min_pos=40, do_shift=False):
        yin = y_of(inner_fit, key)
        yval = y_of(inner_val, key)
        ytr = y_of(train, key)
        yte = y_of(test, key)
        zin, zval, ztr, zte = (yin > 0).astype(int), (yval > 0).astype(int), (ytr > 0).astype(int), (yte > 0).astype(int)

        C, auc_inner, brier_inner = select_logit_C(Xin, zin, Xval, zval)
        po_alpha, mu_pos, po_mae = select_poisson_alpha(Xin, yin, Xval, yval)
        if len(np.where(ytr > 0)[0]) < min_pos:
            po_alpha = None

        lg = fit_logit(Xtr, ztr, C)
        spec = None
        if do_shift:
            spec, _ = oof_logit_shift(Xtr, ztr, C)
        pos_idx = np.where(ytr > 0)[0]
        mu_pos = float(ytr[pos_idx].mean()) if len(pos_idx) else 1.0
        pos_model = None
        pos_mae_tr = None
        if po_alpha is not None and len(pos_idx) >= min_pos:
            po = PoissonRegressor(alpha=po_alpha, max_iter=900)
            po.fit(Xtr[pos_idx], ytr[pos_idx])
            pos_model = po
            te_pos = np.where(yte > 0)[0]
            if len(te_pos) >= 8:
                pred = np.clip(po.predict(Xte[te_pos]), LAM_MIN, LAM_MAX)
                pos_mae_tr = float(np.mean(np.abs(pred - yte[te_pos])))

        p_te_raw = lg.predict_proba(Xte)[:, 1]
        p_te = platt_apply(p_te_raw, spec)
        p_all = platt_apply(lg.predict_proba(Xall)[:, 1], spec)
        if pos_model is not None:
            lam_all = np.clip(pos_model.predict(Xall), LAM_MIN, LAM_MAX)
            lam_te = np.clip(pos_model.predict(Xte), LAM_MIN, LAM_MAX)
        else:
            lam_all = np.full(len(rows), mu_pos)
            lam_te = mu_pos
        exp = p_all * lam_all
        sp = spearman(yte, p_te * lam_te)

        metrics[key] = {
            "C": C,
            "C_source": "inner 1995–2004 Brier",
            "inner_auc": round(auc_inner, 3),
            "inner_brier": round(brier_inner, 4),
            "holdout_auc": round(auc_of(zte, p_te), 3),
            "holdout_logloss": round(float(log_loss(zte, np.clip(p_te, 1e-6, 1 - 1e-6))), 3),
            "holdout_brier": round(float(np.mean((p_te_raw - zte) ** 2)), 4),
            "holdout_brier_cal": round(float(np.mean((p_te - zte) ** 2)), 4),
            "holdout_mean_p": round(float(p_te_raw.mean()), 3),
            "holdout_mean_p_cal": round(float(p_te.mean()), 3),
            "holdout_rate": round(float(zte.mean()), 3),
            "holdout_spearman": None if sp is None else round(sp, 3),
            "mu_pos": round(mu_pos, 3),
            "pos_alpha": po_alpha,
            "pos_mae": None if pos_mae_tr is None else round(float(pos_mae_tr), 3),
            "n_train": len(train),
            "n_inner_fit": len(inner_fit),
            "n_inner_val": len(inner_val),
            "n_holdout": len(test),
            "n_pos": int(ztr.sum()),
            "platt": spec,
            "platt_source": "5-fold OOF on 1947–2004, C frozen" if spec else None,
        }
        inner_notes[key] = {"C": C, "inner_auc": round(auc_inner, 3)}
        if spec:
            platt[key] = spec
        lebron = next((i for i, r in enumerate(rows) if r["n"] == "LeBron James"), None)
        print(key, "C", C, "inner_auc", round(auc_inner, 3),
              "holdout_auc", round(auc_of(zte, p_te), 3),
              "mean_p", round(float(p_te.mean()), 3), "rate", round(float(zte.mean()), 3),
              "LeBron", None if lebron is None else round(float(exp[lebron]), 2))
        models[key + "_ever"] = lg
        models[key + "_pos"] = pos_model
        models[key + "_mu"] = mu_pos
        models[key + "_C"] = C
        models[key + "_po_alpha"] = po_alpha
        return exp, p_all

    e_as, p_as = fit_hurdle("as", do_shift=True)
    e_nba, _ = fit_hurdle("nba", do_shift=True)
    e_mvp, _ = fit_hurdle("mvp", min_pos=80, do_shift=False)
    e_ch, _ = fit_hurdle("ch", min_pos=80, do_shift=False)

    y_in, y_val, ytr, yte = y_of(inner_fit, "yrs"), y_of(inner_val, "yrs"), y_of(train, "yrs"), y_of(test, "yrs")
    yrs_alpha, yrs_inner_mae = select_ridge_alpha(Xin, y_in, Xval, y_val)
    yrs_shift = oof_ridge_shift(Xtr, ytr, yrs_alpha)
    rd = Ridge(alpha=yrs_alpha)
    rd.fit(Xtr, ytr)
    pred_te = np.clip(rd.predict(Xte), 0, 22)
    mae_te = float(np.mean(np.abs(pred_te + yrs_shift - yte)))
    models["yrs"] = rd
    models["yrs_alpha"] = yrs_alpha
    metrics["yrs"] = {
        "alpha": yrs_alpha,
        "alpha_source": "inner 1995–2004 MAE",
        "inner_mae": round(yrs_inner_mae, 3),
        "holdout_mae": round(float(np.mean(np.abs(pred_te - yte))), 3),
        "holdout_mae_cal": round(mae_te, 3),
        "holdout_mean_actual": round(float(yte.mean()), 3),
        "holdout_mean_pred": round(float(pred_te.mean()), 3),
        "shift": round(yrs_shift, 3),
        "shift_source": "5-fold OOF on 1947–2004, alpha frozen",
        "holdout_mean_pred_cal": round(float(pred_te.mean() + yrs_shift), 3),
    }
    print("yrs", "alpha", yrs_alpha, "shift", round(yrs_shift, 3), "holdout_mae_cal", round(mae_te, 3))

    p_as_hof = platt_apply(models["as_ever"].predict_proba(Xhof)[:, 1], platt.get("as"))
    yhof = y_of(hof_train, "hof")
    p_given_as = float(np.mean([r["hof"] for r in hof_train if r["as"] > 0]))
    p_given_no = float(np.mean([r["hof"] for r in hof_train if r["as"] == 0]))
    p_hof = np.clip(p_given_no + (p_given_as - p_given_no) * p_as_hof, HOF_FLOOR, HOF_CAP)
    hof_from_as = {"kind": "mixture", "p_given_as": p_given_as, "p_given_no": p_given_no}
    as_yes = y_of(train, "as") > 0
    mvp_y = y_of(train, "mvp")
    mu_mvp_as = float(mvp_y[as_yes].mean()) if as_yes.any() else 0.155
    mu_mvp_no = float(mvp_y[~as_yes].mean()) if (~as_yes).any() else 0.0
    mvp_from_as = {"kind": "mixture", "mu_given_as": mu_mvp_as, "mu_given_no": mu_mvp_no}
    metrics["mvp_from_as"] = {
        "from": "E[MVP]=P(AS)·E[MVP|AS]. 31 MVPs in 1947–2004, all All-Stars.",
        "mu_given_as": round(mu_mvp_as, 4),
        "mu_given_no": round(mu_mvp_no, 4),
        "n_mvp": int((mvp_y > 0).sum()),
        "n_as": int(as_yes.sum()),
    }
    print("mvp_from_as", "E[MVP|AS]", round(mu_mvp_as, 3), "n_mvp", int((mvp_y > 0).sum()))
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
          "P(HOF|AS)", round(p_given_as, 3))

    # Locked-holdout baselines. None of these touch C or the product model.
    zte_as = (y_of(test, "as") > 0).astype(int)
    p_full = platt_apply(models["as_ever"].predict_proba(Xte)[:, 1], platt.get("as"))
    baselines = []
    rate = float(zte_as.mean())
    baselines.append(report("intercept only", np.full(len(test), rate), zte_as))

    body_keep = set(BODY)
    Xb_in = subset_X(Xin, names, body_keep)
    Xb_te = subset_X(Xte, names, body_keep)
    lg_body = fit_logit(Xb_in, (y_of(inner_fit, "as") > 0).astype(int), 1.0)
    baselines.append(report("age + size", lg_body.predict_proba(Xb_te)[:, 1], zte_as))

    prod_keep = set(PROD + ["miss_" + k for k in PROD])
    Xp_in = subset_X(Xin, names, prod_keep)
    Xp_te = subset_X(Xte, names, prod_keep)
    lg_prod = fit_logit(Xp_in, (y_of(inner_fit, "as") > 0).astype(int), 1.0)
    baselines.append(report("college box score", lg_prod.predict_proba(Xp_te)[:, 1], zte_as))

    baselines.append(report("full model (no pick)", p_full, zte_as))

    pk_in = np.log(np.maximum([float(r.get("pk") or 60) for r in inner_fit], 1.0)).reshape(-1, 1)
    pk_te = np.log(np.maximum([float(r.get("pk") or 60) for r in test], 1.0)).reshape(-1, 1)
    lg_pk = fit_logit(pk_in, (y_of(inner_fit, "as") > 0).astype(int), 1.0)
    baselines.append(report("pick (forbidden oracle)", lg_pk.predict_proba(pk_te)[:, 1], zte_as,
                            extra={"note": "Not in the product. Identification cost."}))
    metrics["baselines_holdout_as"] = baselines
    print("baselines (holdout ever-AS)")
    for b in baselines:
        print(" ", b["name"], "auc", b["auc"], "brier", b["brier"], "mean_p", b["mean_p"])

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

    def boot_one(idx):
        samp = [train[i] for i in idx]
        Xs = design(samp, means, sds, predict=False)
        draw = {}
        for key in ("as", "nba", "mvp", "ch"):
            ys = y_of(samp, key)
            zs = (ys > 0).astype(int)
            if zs.min() == zs.max():
                return None
            C = models[key + "_C"]
            lg = fit_logit(Xs, zs, C)
            draw[key + "_ever"] = pack_boot_spec("logistic", lg.intercept_[0], lg.coef_[0], names)
            po_alpha = models[key + "_po_alpha"]
            pos_idx = np.where(ys > 0)[0]
            if po_alpha is not None and models[key + "_pos"] is not None and len(pos_idx) >= 40:
                po = PoissonRegressor(alpha=po_alpha, max_iter=900)
                po.fit(Xs[pos_idx], ys[pos_idx])
                draw[key + "_pos"] = pack_boot_spec("poisson", po.intercept_, po.coef_, names)
            else:
                mu = float(ys[pos_idx].mean()) if len(pos_idx) else models[key + "_mu"]
                draw[key + "_pos"] = {"kind": "constant", "mu": round(mu, 4)}
        ys = y_of(samp, "yrs")
        rd_b = Ridge(alpha=models["yrs_alpha"])
        rd_b.fit(Xs, ys)
        draw["yrs"] = pack_boot_spec("linear", rd_b.intercept_, rd_b.coef_, names)
        return draw

    rng = np.random.RandomState(BOOT_SEED)
    boots = []
    tries = 0
    while len(boots) < BOOT_B and tries < BOOT_B * 4:
        tries += 1
        idx = rng.randint(0, len(train), size=len(train))
        try:
            draw = boot_one(idx)
        except Exception:
            draw = None
        if draw:
            boots.append(draw)
    print("bootstrap", len(boots), "of", BOOT_B, "tries", tries)

    coefs = {
        "method": "hurdle GLM, nested: C/alpha/shift on 1995–2004, refit 1947–2004, report 2005–2014",
        "identification": "No draft pick. Draft-night traits only. Age clipped to 17–25.5. Missing production skipped at predict and centered on a typical college line. Swing and position flags dropped after they stacked with scoring.",
        "train": [1947, 2004],
        "inner": [1995, 2004],
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
        "hof_skip": ["stl", "blk"],
        "mvp_from_as": mvp_from_as,
        "yrs_shift": yrs_shift,
        "hof_floor": HOF_FLOOR,
        "hof_cap": HOF_CAP,
        "boot_q": [0.1, 0.9],
        "boot_B": len(boots),
        "boot": boots,
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
    print("wrote", OUT_JSON, OUT_JS, "js bytes", os.path.getsize(OUT_JS))


if __name__ == "__main__":
    main()
