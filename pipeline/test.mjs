#!/usr/bin/env node
/**
 * The Draft Model — pipeline tests.
 * Proves historical labels, slot priors, college BPM+USG+eFG+Min% features, and that this does not touch the live board.
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fitAndWrite, loadHistorical, loadModel, predictPick } from "./fit.mjs";
import { fitFeatureModel, impliedPickFromCollege, loadCollegeBoxscores, predictFromCollege } from "./features.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function sourceOf(name) {
  return readFileSync(join(__dirname, name), "utf8");
}

function inOpenUnit(p) {
  return p > 0 && p < 1;
}

// no import of assets/data.js
function hasLiveBoardImport(src) {
  return /(?:import|require)\s*(?:\(|from)?\s*['"][^'"]*assets\/data\.js['"]/.test(src);
}
for (const name of ["fit.mjs", "predict.mjs", "test.mjs", "features.mjs"]) {
  const src = sourceOf(name);
  assert.equal(hasLiveBoardImport(src), false, `${name} must not import the live board data file`);
}

const hist = loadHistorical();
const duncan = hist.players.find((p) => p.name === "Tim Duncan");
assert.ok(duncan, "historical file must contain Tim Duncan");
assert.equal(duncan.all_star, 1);
assert.equal(duncan.school, "Wake Forest");
assert.equal(duncan.draft_year, 1997);
assert.equal(duncan.pick, 1);
assert.equal(duncan.all_nba, 1);
assert.equal(duncan.hof, 1);
assert.equal(duncan.bust, 0);
assert.ok(hist.players.length >= 35, "need at least ~35 college first-round rows");
assert.ok(
  hist.players.every((p) => p.pick >= 1 && p.pick <= 30),
  "sample is first-round college draftees"
);

const required = [
  { name: "Anthony Bennett", school: "UNLV", draft_year: 2013, pick: 1, bust: 1 },
  { name: "Hasheem Thabeet", school: "UConn", draft_year: 2009, pick: 2, bust: 1 },
  { name: "Adam Morrison", school: "Gonzaga", draft_year: 2006, pick: 3, bust: 1 },
  { name: "Jonny Flynn", school: "Syracuse", draft_year: 2009, pick: 6, bust: 1 },
];
for (const want of required) {
  const row = hist.players.find((p) => p.name === want.name);
  assert.ok(row, `historical file must contain ${want.name}`);
  assert.equal(row.school, want.school);
  assert.equal(row.draft_year, want.draft_year);
  assert.equal(row.pick, want.pick);
  assert.equal(row.bust, want.bust);
}

const { priors, priorsPath } = fitAndWrite();
assert.ok(existsSync(priorsPath), "pipeline/output/slot-priors.json must exist after fit");
assert.ok(
  existsSync(join(__dirname, "output", "slot-priors.json")),
  "slot-priors.json path"
);
assert.equal(priors.picks.length, 30);

const slotModel = loadModel();
const p1 = predictPick(slotModel, 1);
const p25 = predictPick(slotModel, 25);

assert.ok(
  p1.p_all_star > p25.p_all_star,
  `P(All-Star|1)=${p1.p_all_star} should exceed P(All-Star|25)=${p25.p_all_star}`
);

for (const row of [p1, p25, ...priors.picks]) {
  for (const key of ["p_all_star", "p_all_nba", "p_hof", "p_bust"]) {
    assert.ok(inOpenUnit(row[key]), `${key} for pick ${row.pick} must be in (0,1), got ${row[key]}`);
  }
}

const box = loadCollegeBoxscores();
assert.ok(box.players.length >= 20, "need Torvik-era college rows");
assert.ok(
  box.players.every((p) => Number.isFinite(p.bpm) && Number.isFinite(p.usg) && Number.isFinite(p.efg) && Number.isFinite(p.min_pct)),
  "each college row needs BPM, USG, eFG, Min%"
);
const davisBox = box.players.find((p) => p.id === "anthony-davis");
const goodwinBox = box.players.find((p) => p.id === "archie-goodwin");
assert.ok(davisBox && goodwinBox, "box-score table must include Anthony Davis and Archie Goodwin");
assert.ok(davisBox.bpm > goodwinBox.bpm, "Davis last-season BPM should exceed Goodwin");

const { featureModel, featureModelPath } = fitFeatureModel();
assert.ok(existsSync(featureModelPath), "pipeline/output/feature-model.json must exist after fit");
assert.ok(featureModel.bpm_coef < 0, "higher BPM must map to an earlier implied slot");
assert.equal(featureModel.n, box.players.length, "fit n is the Torvik box-score sample");
assert.ok(["usg_coef", "efg_coef", "min_pct_coef"].every((k) => Number.isFinite(featureModel[k])), "mapping uses USG, eFG, Min%");

const model = loadModel();
const davisFeat = predictFromCollege(model, featureModel, davisBox);
const goodwinFeat = predictFromCollege(model, featureModel, goodwinBox);
assert.ok(
  davisFeat.implied_pick < goodwinFeat.implied_pick,
  `Davis implied ${davisFeat.implied_pick} should be earlier than Goodwin ${goodwinFeat.implied_pick}`
);
assert.ok(
  davisFeat.p_all_star > goodwinFeat.p_all_star,
  `P(All-Star|Davis box) ${davisFeat.p_all_star} should exceed P(All-Star|Goodwin box) ${goodwinFeat.p_all_star}`
);
for (const row of [davisFeat, goodwinFeat]) {
  for (const key of ["p_all_star", "p_all_nba", "p_hof", "p_bust"]) {
    assert.ok(inOpenUnit(row[key]), `${key} from college features must be in (0,1)`);
  }
}
assert.equal(
  impliedPickFromCollege(featureModel, davisBox) < impliedPickFromCollege(featureModel, goodwinBox),
  true
);

console.log("ok — pipeline tests passed");
console.log(
  `Tim Duncan all_star=${duncan.all_star}; P(All-Star|1)=${p1.p_all_star.toFixed(3)} > P(All-Star|25)=${p25.p_all_star.toFixed(3)}`
);
