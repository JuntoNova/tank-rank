#!/usr/bin/env node
/**
 * The Draft Model — slot-prior fit.
 *
 * Historical outcomes in, P(outcome | draft pick) out.
 * Pick-band frequencies with Laplace smoothing (and a monotone pass so
 * All-Star / All-NBA / HOF do not rise with pick). This is an honest
 * SLOT PRIOR from college first-round draftees. It does not score
 * current college stats. It is not live board odds.
 *
 * Bust definition (must match historical-outcomes.json):
 *   did not last as a rotation player for approximately 4 NBA seasons.
 *   Injury-shortened careers that fail this bar are labeled bust under
 *   this definition, not a separate injury class.
 *
 * Does not import assets/data.js.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HISTORICAL_PATH = join(__dirname, "historical-outcomes.json");
const OUTPUT_DIR = join(__dirname, "output");
const MODEL_PATH = join(OUTPUT_DIR, "model.json");
const PRIORS_PATH = join(OUTPUT_DIR, "slot-priors.json");

/** Hall labels are only trustworthy for players with enough calendar time. */
export const HOF_MAX_DRAFT_YEAR = 2003;

export const BUST_DEFINITION =
  "Did not last as a rotation player for approximately 4 NBA seasons. Injury-shortened careers that fail this bar are labeled bust under this definition.";

/** Lottery top / rest of lottery / late first round. */
export const BANDS = [
  { lo: 1, hi: 5 },
  { lo: 6, hi: 14 },
  { lo: 15, hi: 30 },
];

export function clampUnit(p) {
  return Math.min(1 - 1e-12, Math.max(1e-12, p));
}

/** Laplace / add-one so every band probability stays in (0, 1). */
export function laplaceRate(rows, key) {
  const n = rows.length;
  const k = rows.reduce((s, r) => s + Number(r[key] || 0), 0);
  return { p: (k + 1) / (n + 2), n, k };
}

export function fitBandRates(players, key, direction) {
  const raw = BANDS.map((b) => {
    const rows = players.filter((r) => r.pick >= b.lo && r.pick <= b.hi);
    const { p, n, k } = laplaceRate(rows, key);
    return { lo: b.lo, hi: b.hi, mid: (b.lo + b.hi) / 2, p, n, k };
  });
  const rates = [];
  if (direction === "decreasing") {
    let cap = 1;
    for (const row of raw) {
      cap = Math.min(cap, row.p);
      rates.push({ ...row, p: clampUnit(cap) });
    }
  } else {
    let floor = 0;
    for (const row of raw) {
      floor = Math.max(floor, row.p);
      rates.push({ ...row, p: clampUnit(floor) });
    }
  }
  return { direction, bands: rates };
}

export function interpolateBands(fit, pick) {
  const bands = fit.bands;
  if (pick <= bands[0].mid) return bands[0].p;
  const last = bands[bands.length - 1];
  if (pick >= last.mid) return last.p;
  for (let i = 0; i < bands.length - 1; i++) {
    const a = bands[i];
    const b = bands[i + 1];
    if (pick <= b.mid) {
      const t = (pick - a.mid) / (b.mid - a.mid);
      return a.p + t * (b.p - a.p);
    }
  }
  return last.p;
}

export function loadHistorical() {
  const doc = JSON.parse(readFileSync(HISTORICAL_PATH, "utf8"));
  if (!Array.isArray(doc.players) || doc.players.length < 35) {
    throw new Error("historical-outcomes.json needs at least ~35 college first-round rows");
  }
  return doc;
}

export function fitModels(doc) {
  const players = doc.players;
  const hofRows = players.filter((r) => r.draft_year <= HOF_MAX_DRAFT_YEAR);
  return {
    method: "pick-band frequencies with Laplace smoothing",
    feature: "draft_pick",
    note: "P(outcome | draft pick) from a college first-round historical sample. Slot prior only. Does not use college box-score features. Not live board odds.",
    label_horizon: doc.meta.label_horizon,
    bust_definition: BUST_DEFINITION,
    hof_trained_on: `draft_year <= ${HOF_MAX_DRAFT_YEAR} (enough time for Hall class 2024)`,
    sample_size: players.length,
    all_star: fitBandRates(players, "all_star", "decreasing"),
    all_nba: fitBandRates(players, "all_nba", "decreasing"),
    hof: fitBandRates(hofRows, "hof", "decreasing"),
    bust: fitBandRates(players, "bust", "increasing"),
  };
}

export function probability(fit, pick) {
  return clampUnit(interpolateBands(fit, pick));
}

export function predictPick(model, pick) {
  const p = Number(pick);
  if (!Number.isFinite(p) || p < 1 || p > 60) {
    throw new Error("pick must be a number in 1..60");
  }
  return {
    pick: p,
    p_all_star: probability(model.all_star, p),
    p_all_nba: probability(model.all_nba, p),
    p_hof: probability(model.hof, p),
    p_bust: probability(model.bust, p),
  };
}

export function slotPriors(model) {
  const picks = [];
  for (let pick = 1; pick <= 30; pick++) picks.push(predictPick(model, pick));
  return {
    product: "The Draft Model",
    generated_from: "pipeline/fit.mjs",
    method: model.method,
    note: "Slot prior P(outcome | draft pick) from college first-round historical labels. Not live board odds. Never present these as the public board.",
    bust_definition: BUST_DEFINITION,
    picks,
  };
}

export function fitAndWrite() {
  const doc = loadHistorical();
  const model = fitModels(doc);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(MODEL_PATH, JSON.stringify(model, null, 2) + "\n");
  const priors = slotPriors(model);
  writeFileSync(PRIORS_PATH, JSON.stringify(priors, null, 2) + "\n");
  return { model, priors, modelPath: MODEL_PATH, priorsPath: PRIORS_PATH };
}

export function loadModel() {
  return JSON.parse(readFileSync(MODEL_PATH, "utf8"));
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  const { model, priors } = fitAndWrite();
  const p1 = priors.picks[0];
  const p25 = priors.picks[24];
  console.log(
    `fitted n=${model.sample_size}  P(All-Star|pick 1)=${p1.p_all_star.toFixed(3)}  P(All-Star|pick 25)=${p25.p_all_star.toFixed(3)}`
  );
  console.log(`wrote ${MODEL_PATH}`);
  console.log(`wrote ${PRIORS_PATH}`);
}
