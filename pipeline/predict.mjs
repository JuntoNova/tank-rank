#!/usr/bin/env node
/**
 * The Draft Model — print P(outcome | pick) from the fitted slot prior.
 * Later this can accept a feature vector. Today the only feature is draft pick.
 * Does not import assets/data.js. Does not claim to score college stats.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fitAndWrite, loadModel, predictPick, slotPriors } from "./fit.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODEL_PATH = join(__dirname, "output", "model.json");
const PRIORS_PATH = join(__dirname, "output", "slot-priors.json");

function main() {
  if (!existsSync(MODEL_PATH)) fitAndWrite();
  const model = loadModel();
  const pickArg = process.argv[2];
  if (pickArg === undefined) {
    console.error("usage: node pipeline/predict.mjs <pick>");
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
