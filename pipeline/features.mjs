#!/usr/bin/env node
/**
 * The Draft Model — college box-score features.
 *
 * Last-college-season BartTorvik BPM, usage, eFG, and minutes.
 * BPM maps to an implied first-round slot. That slot is then scored
 * with the existing P(outcome | pick) prior. The slot prior stays the
 * baseline. This is not live board odds. It is not wired to the site.
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

export function loadCollegeBoxscores() {
  const doc = JSON.parse(readFileSync(BOX_PATH, "utf8"));
  if (!Array.isArray(doc.players) || doc.players.length < 20) {
    throw new Error("college-boxscores.json needs Torvik-era rows");
  }
  return doc;
}

/** Simple OLS: pick = intercept + bpm_coef * BPM. */
export function fitBpmToPick(rows) {
  const n = rows.length;
  const mx = rows.reduce((s, r) => s + r.bpm, 0) / n;
  const my = rows.reduce((s, r) => s + r.pick, 0) / n;
  let num = 0;
  let den = 0;
  for (const r of rows) {
    num += (r.bpm - mx) * (r.pick - my);
    den += (r.bpm - mx) ** 2;
  }
  if (den === 0) throw new Error("BPM has no variance");
  const bpmCoef = num / den;
  const intercept = my - bpmCoef * mx;
  if (!(bpmCoef < 0)) {
    throw new Error("BPM coefficient must be negative (higher BPM, earlier slot)");
  }
  return {
    method: "OLS implied first-round slot from last-college-season BartTorvik BPM",
    feature: "bpm",
    intercept,
    bpm_coef: bpmCoef,
    n,
    bpm_mean: mx,
    pick_mean: my,
    note: "Implied slot is clipped to 1..30, then scored with the slot prior. Usage, eFG, and Min% are stored on each row and not in this mapping yet. Not live board odds.",
  };
}

export function impliedPickFromBpm(featureModel, bpm) {
  const x = Number(bpm);
  if (!Number.isFinite(x)) throw new Error("bpm must be a number");
  const raw = featureModel.intercept + featureModel.bpm_coef * x;
  return Math.min(30, Math.max(1, raw));
}

export function predictFromBpm(slotModel, featureModel, bpm, extra = {}) {
  const implied_pick = impliedPickFromBpm(featureModel, bpm);
  const prior = predictPick(slotModel, implied_pick);
  return {
    product: "The Draft Model",
    note: "Research pipeline. College BPM mapped to an implied slot, then P(outcome | implied slot) from the slot prior. Not live board odds. Not a public ranking.",
    bpm: Number(bpm),
    min_pct: extra.min_pct ?? null,
    usg: extra.usg ?? null,
    efg: extra.efg ?? null,
    implied_pick,
    p_all_star: prior.p_all_star,
    p_all_nba: prior.p_all_nba,
    p_hof: prior.p_hof,
    p_bust: prior.p_bust,
  };
}

export function fitFeatureModel() {
  const doc = loadCollegeBoxscores();
  const featureModel = fitBpmToPick(doc.players);
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
  const { featureModel } = fitFeatureModel();
  const slotModel = loadModel();
  const davis = predictFromBpm(slotModel, featureModel, 16.6);
  const goodwin = predictFromBpm(slotModel, featureModel, 0.92);
  console.log(
    `fitted n=${featureModel.n}  intercept=${featureModel.intercept.toFixed(3)}  bpm_coef=${featureModel.bpm_coef.toFixed(3)}`
  );
  console.log(
    `Anthony Davis BPM 16.6 implied ${davis.implied_pick.toFixed(1)}  P(All-Star)=${davis.p_all_star.toFixed(3)}`
  );
  console.log(
    `Archie Goodwin BPM 0.92 implied ${goodwin.implied_pick.toFixed(1)}  P(All-Star)=${goodwin.p_all_star.toFixed(3)}`
  );
  console.log(`wrote ${FEATURE_MODEL_PATH}`);
}
