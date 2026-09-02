#!/usr/bin/env node
/**
 * The Draft Model — college box-score features.
 *
 * Last-college-season BartTorvik BPM, usage, eFG, and minutes map to an
 * implied first-round slot. That slot is then scored with the existing
 * P(outcome | pick) prior. The slot prior stays the baseline.
 * This is not live board odds. It is not wired to the site.
 *
 * Does not import assets/data.js.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fitAndWrite, loadModel, predictPick } from "./fit.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BOX_PATH = join(__dirname, "college-boxscores.json");
const OUTPUT_DIR = join(__dirname, "output");
const FEATURE_MODEL_PATH = join(OUTPUT_DIR, "feature-model.json");
const FEATURES = ["bpm", "usg", "efg", "min_pct"];

export function loadCollegeBoxscores() {
  const doc = JSON.parse(readFileSync(BOX_PATH, "utf8"));
  if (!Array.isArray(doc.players) || doc.players.length < 20) {
    throw new Error("college-boxscores.json needs Torvik-era rows");
  }
  return doc;
}

function solve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => row.concat([b[i]]));
  for (let i = 0; i < n; i++) {
    let max = i;
    for (let r = i + 1; r < n; r++) {
      if (Math.abs(M[r][i]) > Math.abs(M[max][i])) max = r;
    }
    const tmp = M[i];
    M[i] = M[max];
    M[max] = tmp;
    const piv = M[i][i];
    if (Math.abs(piv) < 1e-12) throw new Error("college-feature matrix is singular");
    for (let j = i; j <= n; j++) M[i][j] /= piv;
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const f = M[r][i];
      for (let j = i; j <= n; j++) M[r][j] -= f * M[i][j];
    }
  }
  return M.map((row) => row[n]);
}

function ols(X, y) {
  const n = y.length;
  const k = X[0].length;
  const XtX = Array.from({ length: k }, () => Array(k).fill(0));
  const Xty = Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < k; a++) {
      Xty[a] += X[i][a] * y[i];
      for (let b = 0; b < k; b++) XtX[a][b] += X[i][a] * X[i][b];
    }
  }
  return solve(XtX, Xty);
}

function requireFeatures(row) {
  const out = {};
  for (const key of FEATURES) {
    const v = Number(row[key]);
    if (!Number.isFinite(v)) throw new Error(`${key} must be a number`);
    out[key] = v;
  }
  return out;
}

/** OLS: pick = intercept + bpm + usg + efg + min_pct. */
export function fitCollegeToPick(rows) {
  const ready = rows.filter((r) => FEATURES.every((k) => Number.isFinite(Number(r[k])) && Number.isFinite(Number(r.pick))));
  if (ready.length < 20) throw new Error("need at least 20 rows with BPM, USG, eFG, Min%");
  const X = ready.map((r) => [1, Number(r.bpm), Number(r.usg), Number(r.efg), Number(r.min_pct)]);
  const y = ready.map((r) => Number(r.pick));
  const coef = ols(X, y);
  const [intercept, bpmCoef, usgCoef, efgCoef, minCoef] = coef;
  if (!(bpmCoef < 0)) {
    throw new Error("BPM coefficient must be negative (higher BPM, earlier slot)");
  }
  const yMean = y.reduce((s, v) => s + v, 0) / y.length;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < y.length; i++) {
    const hat = X[i][0] * intercept + X[i][1] * bpmCoef + X[i][2] * usgCoef + X[i][3] * efgCoef + X[i][4] * minCoef;
    ssTot += (y[i] - yMean) ** 2;
    ssRes += (y[i] - hat) ** 2;
  }
  return {
    method: "OLS implied first-round slot from last-college-season BartTorvik BPM, USG, eFG, Min%",
    features: FEATURES.slice(),
    intercept,
    bpm_coef: bpmCoef,
    usg_coef: usgCoef,
    efg_coef: efgCoef,
    min_pct_coef: minCoef,
    n: ready.length,
    r_squared: ssTot === 0 ? 0 : 1 - ssRes / ssTot,
    note: "Implied slot is clipped to 1..30, then scored with the slot prior. Not live board odds.",
  };
}

export function impliedPickFromCollege(featureModel, row) {
  const f = requireFeatures(row);
  const raw =
    featureModel.intercept +
    featureModel.bpm_coef * f.bpm +
    featureModel.usg_coef * f.usg +
    featureModel.efg_coef * f.efg +
    featureModel.min_pct_coef * f.min_pct;
  return Math.min(30, Math.max(1, raw));
}

export function predictFromCollege(slotModel, featureModel, row) {
  const f = requireFeatures(row);
  const implied_pick = impliedPickFromCollege(featureModel, f);
  const prior = predictPick(slotModel, implied_pick);
  return {
    product: "The Draft Model",
    note: "Research pipeline. College BPM, USG, eFG, and Min% mapped to an implied slot, then P(outcome | implied slot) from the slot prior. Not live board odds. Not a public ranking.",
    bpm: f.bpm,
    usg: f.usg,
    efg: f.efg,
    min_pct: f.min_pct,
    implied_pick,
    p_all_star: prior.p_all_star,
    p_all_nba: prior.p_all_nba,
    p_hof: prior.p_hof,
    p_bust: prior.p_bust,
  };
}

/** @deprecated BPM-only path; extra must include usg, efg, min_pct. */
export function impliedPickFromBpm(featureModel, bpm, extra = {}) {
  return impliedPickFromCollege(featureModel, { bpm, ...extra });
}

export function predictFromBpm(slotModel, featureModel, bpm, extra = {}) {
  return predictFromCollege(slotModel, featureModel, { bpm, ...extra });
}

export function fitFeatureModel() {
  const doc = loadCollegeBoxscores();
  const featureModel = fitCollegeToPick(doc.players);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(FEATURE_MODEL_PATH, JSON.stringify(featureModel, null, 2) + "\n");
  return { featureModel, featureModelPath: FEATURE_MODEL_PATH, boxscores: doc };
}

export function loadFeatureModel() {
  return JSON.parse(readFileSync(FEATURE_MODEL_PATH, "utf8"));
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  if (!existsSync(join(__dirname, "output", "model.json"))) fitAndWrite();
  const { featureModel, boxscores } = fitFeatureModel();
  const slotModel = loadModel();
  const davisBox = boxscores.players.find((p) => p.id === "anthony-davis");
  const goodwinBox = boxscores.players.find((p) => p.id === "archie-goodwin");
  const davis = predictFromCollege(slotModel, featureModel, davisBox);
  const goodwin = predictFromCollege(slotModel, featureModel, goodwinBox);
  console.log(
    `fitted n=${featureModel.n}  intercept=${featureModel.intercept.toFixed(3)}  bpm=${featureModel.bpm_coef.toFixed(3)}  usg=${featureModel.usg_coef.toFixed(3)}  efg=${featureModel.efg_coef.toFixed(3)}  min=${featureModel.min_pct_coef.toFixed(3)}  r2=${featureModel.r_squared.toFixed(3)}`
  );
  console.log(
    `Anthony Davis implied ${davis.implied_pick.toFixed(1)}  P(All-Star)=${davis.p_all_star.toFixed(3)}`
  );
  console.log(
    `Archie Goodwin implied ${goodwin.implied_pick.toFixed(1)}  P(All-Star)=${goodwin.p_all_star.toFixed(3)}`
  );
  console.log(`wrote ${FEATURE_MODEL_PATH}`);
}
