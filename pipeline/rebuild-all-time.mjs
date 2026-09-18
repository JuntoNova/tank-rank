#!/usr/bin/env node
/** Re-score assets/all-time.json with the live JS GLM. */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const sandbox = { console };
sandbox.window = sandbox;
sandbox.TR = {};
createContext(sandbox);
runInContext(readFileSync(join(ROOT, "assets/glm-coefs.js"), "utf8"), sandbox);
runInContext(readFileSync(join(ROOT, "assets/theory-model.js"), "utf8"), sandbox);
const TR = sandbox.TR;

const packCache = {};
function packByPk(year) {
  if (packCache[year] !== undefined) return packCache[year];
  const fp = join(ROOT, "assets/theory-packs", year + ".json");
  const by = {};
  if (existsSync(fp)) {
    const doc = JSON.parse(readFileSync(fp, "utf8"));
    (doc.players || []).forEach(function (f) { if (f && f.pk != null) by[f.pk] = f; });
  }
  packCache[year] = by;
  return by;
}
const histCache = {};
function histByPk(year) {
  if (histCache[year] !== undefined) return histCache[year];
  const fp = join(ROOT, "assets/history", year + ".json");
  const by = {};
  if (existsSync(fp)) {
    JSON.parse(readFileSync(fp, "utf8")).forEach(function (h) { if (h && h.pk != null) by[h.pk] = h; });
  }
  histCache[year] = by;
  return by;
}

function round(n, d) {
  const m = Math.pow(10, d);
  return Math.round(Number(n) * m) / m;
}

const blob = JSON.parse(readFileSync(join(ROOT, "assets/all-time.json"), "utf8"));
const players = blob.players || [];
for (let i = 0; i < players.length; i++) {
  const r = players[i];
  const feat = Object.assign({}, packByPk(r.y)[r.pk] || {});
  const p = {
    year: r.y,
    y: r.y,
    rank: r.pk,
    pos: feat.pos || r.pos,
    school: r.c,
    ht: feat.ht,
    wt: feat.wt,
    age: feat.age,
    origin: feat.origin,
    theoryFeat: feat,
    name: r.n,
    id: r.id
  };
  const proj = TR.projectPlayer(p, TR.deriveFeat(p), {});
  const h = histByPk(r.y)[r.pk] || {};
  if (h.pts != null) r.pts = h.pts;
  if (h.trb != null) r.trb = h.trb;
  if (h.ast != null) r.ast = h.ast;
  if (h.bpm != null) r.bpm = h.bpm;
  r.eAs = round(proj.expAs, 3);
  r.eNba1 = round(proj.expNba1, 3);
  r.eNba = round(proj.expNba, 3);
  r.eYrs = round(proj.expYrs, 2);
  r.eCh = round(proj.expCh, 3);
  r.eMvp = round(proj.expMvp, 3);
  r.pHof = round(proj.pHof, 4);
  if (proj.expPts != null) r.ePts = round(proj.expPts, 2);
  if (proj.expReb != null) r.eReb = round(proj.expReb, 2);
  if (proj.expAst != null) r.eAst = round(proj.expAst, 2);
  if (proj.expBpm != null) r.eBpm = round(proj.expBpm, 2);
  const band = proj.band;
  if (band) {
    r.asL = round(band.expAs.lo, 2); r.asH = round(band.expAs.hi, 2);
    r.n1L = round(band.expNba1.lo, 2); r.n1H = round(band.expNba1.hi, 2);
    r.nbaL = round(band.expNba.lo, 2); r.nbaH = round(band.expNba.hi, 2);
    r.yL = round(band.expYrs.lo, 1); r.yH = round(band.expYrs.hi, 1);
    r.chL = round(band.expCh.lo, 2); r.chH = round(band.expCh.hi, 2);
    r.mL = round(band.expMvp.lo, 2); r.mH = round(band.expMvp.hi, 2);
    r.hL = round(band.pHof.lo, 3); r.hH = round(band.pHof.hi, 3);
    if (band.expPts) { r.ptsL = round(band.expPts.lo, 1); r.ptsH = round(band.expPts.hi, 1); }
    if (band.expReb) { r.rbL = round(band.expReb.lo, 1); r.rbH = round(band.expReb.hi, 1); }
    if (band.expAst) { r.astL = round(band.expAst.lo, 1); r.astH = round(band.expAst.hi, 1); }
    if (band.expBpm) { r.bpL = round(band.expBpm.lo, 1); r.bpH = round(band.expBpm.hi, 1); }
  }
}

blob.n = players.length;
blob.updated = new Date().toISOString().slice(0, 10);
writeFileSync(join(ROOT, "assets/all-time.json"), JSON.stringify(blob));

const top = players.slice().sort(function (a, b) { return b.eAs - a.eAs; }).slice(0, 20);
console.log("top E[AS]");
top.forEach(function (r, i) {
  console.log(String(i + 1).padStart(2), r.y, "#" + String(r.pk).padStart(2), (r.n + "                    ").slice(0, 24), "eAs", r.eAs, "pHof", r.pHof);
});
console.log("wrote", join(ROOT, "assets/all-time.json"), players.length);
