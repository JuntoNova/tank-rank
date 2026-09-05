#!/usr/bin/env node
/**
 * The Draft Model — score 2027 current-class college rows (off the live board).
 *
 * Loads pipeline/current-class-2027.json plus the EXISTING feature model and
 * slot model. Writes pipeline/output/current-class-2027.json.
 * Does not re-fit the historical mapping. Does not import assets/data.js.
 * Research pipeline only. Not live board odds. Not wired to the public board.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fitAndWrite, loadModel } from "./fit.mjs";
import { fitFeatureModel, loadFeatureModel, predictFromCollege } from "./features.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = join(__dirname, "current-class-2027.json");
const OUTPUT_DIR = join(__dirname, "output");
const OUTPUT_PATH = join(OUTPUT_DIR, "current-class-2027.json");
const MODEL_PATH = join(OUTPUT_DIR, "model.json");
const FEATURE_MODEL_PATH = join(OUTPUT_DIR, "feature-model.json");

const RESEARCH_NOTE =
  "Research pipeline only. Not live board odds. Not wired to the public board. Historical mapping n=28 R^2 still low (~0.16). Slot prior stays the baseline.";

export function loadCurrentClass() {
  const doc = JSON.parse(readFileSync(SOURCE_PATH, "utf8"));
  if (!Array.isArray(doc.players) || doc.players.length === 0) {
    throw new Error("current-class-2027.json needs matched college rows");
  }
  if (doc.players.length !== doc.meta.n) {
    throw new Error("current-class meta.n must match players.length");
  }
  return doc;
}

export function scoreCurrentClass(slotModel, featureModel, doc = loadCurrentClass()) {
  const players = doc.players.map((row) => {
    const scored = predictFromCollege(slotModel, featureModel, row);
    return {
      name: row.name,
      school: row.school,
      bpm: scored.bpm,
      usg: scored.usg,
      efg: scored.efg,
      min_pct: scored.min_pct,
      implied_pick: scored.implied_pick,
      p_all_star: scored.p_all_star,
      p_all_nba: scored.p_all_nba,
      p_hof: scored.p_hof,
      p_bust: scored.p_bust,
      note: RESEARCH_NOTE,
    };
  });
  players.sort((a, b) => a.implied_pick - b.implied_pick);
  return {
    meta: {
      product: "The Draft Model",
      draft_year: 2027,
      season: 2026,
      n: players.length,
      feature_model_n: featureModel.n,
      feature_model_r_squared: featureModel.r_squared,
      note: RESEARCH_NOTE,
    },
    players,
  };
}

export function scoreAndWrite() {
  if (!existsSync(MODEL_PATH)) fitAndWrite();
  if (!existsSync(FEATURE_MODEL_PATH)) fitFeatureModel();
  const slotModel = loadModel();
  const featureModel = loadFeatureModel();
  if (featureModel.n !== 28) {
    throw new Error("expected existing historical feature model n=28");
  }
  const out = scoreCurrentClass(slotModel, featureModel);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 2) + "\n");
  return { out, outputPath: OUTPUT_PATH, featureModel };
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  const { out, outputPath, featureModel } = scoreAndWrite();
  const picks = out.players.map((p) => p.implied_pick);
  const min = Math.min(...picks);
  const max = Math.max(...picks);
  const sorted = [...picks].sort((a, b) => a - b);
  const mid =
    sorted.length % 2
      ? sorted[(sorted.length - 1) / 2]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  console.log("research pipeline — not live board odds");
  console.log(
    `n=${out.players.length}  implied_pick min=${min.toFixed(2)} median=${mid.toFixed(2)} max=${max.toFixed(2)}`
  );
  console.log(`feature model n=${featureModel.n} r_squared=${featureModel.r_squared}`);
  console.log(`wrote ${outputPath}`);
}
