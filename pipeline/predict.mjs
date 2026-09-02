#!/usr/bin/env node
/**
 * The Draft Model — print probabilities from the slot prior.
 *
 * With a pick: P(outcome | pick).
 * With --bpm: map last-college-season BartTorvik BPM to an implied slot,
 * then P(outcome | implied slot). Slot prior stays the baseline.
 *
 * Does not import assets/data.js. Does not claim live board odds.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fitAndWrite, loadModel, predictPick, slotPriors } from "./fit.mjs";
import {
  fitFeatureModel,
  loadFeatureModel,
  predictFromBpm,
} from "./features.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODEL_PATH = join(__dirname, "output", "model.json");
const FEATURE_MODEL_PATH = join(__dirname, "output", "feature-model.json");
const PRIORS_PATH = join(__dirname, "output", "slot-priors.json");

function flag(name) {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

function main() {
  if (!existsSync(MODEL_PATH)) fitAndWrite();
  const model = loadModel();
  const bpmArg = flag("--bpm");

  if (bpmArg !== undefined) {
    if (!existsSync(FEATURE_MODEL_PATH)) fitFeatureModel();
    const featureModel = loadFeatureModel();
    const extra = {};
    if (flag("--min") !== undefined) extra.min_pct = Number(flag("--min"));
    if (flag("--usg") !== undefined) extra.usg = Number(flag("--usg"));
    if (flag("--efg") !== undefined) extra.efg = Number(flag("--efg"));
    const row = predictFromBpm(model, featureModel, bpmArg, extra);
    console.log("research pipeline — not live board odds");
    console.log(`bpm ${row.bpm}`);
    console.log(`implied_pick ${row.implied_pick}`);
    console.log(`p_all_star ${row.p_all_star}`);
    console.log(`p_all_nba ${row.p_all_nba}`);
    console.log(`p_hof ${row.p_hof}`);
    console.log(`p_bust ${row.p_bust}`);
    return;
  }

  const pickArg = process.argv[2];
  if (pickArg === undefined || String(pickArg).startsWith("--")) {
    console.error("usage: node pipeline/predict.mjs <pick>");
    console.error("   or: node pipeline/predict.mjs --bpm <bpm> [--min Min%] [--usg USG] [--efg eFG]");
    process.exit(2);
  }
  const row = predictPick(model, pickArg);
  console.log(`pick ${row.pick}`);
  console.log(`p_all_star ${row.p_all_star}`);
  console.log(`p_all_nba ${row.p_all_nba}`);
  console.log(`p_hof ${row.p_hof}`);
  console.log(`p_bust ${row.p_bust}`);
  mkdirSync(join(__dirname, "output"), { recursive: true });
  writeFileSync(PRIORS_PATH, JSON.stringify(slotPriors(model), null, 2) + "\n");
}

main();
