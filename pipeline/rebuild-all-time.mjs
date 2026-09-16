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
  r.eAs = round(proj.expAs, 3);
  r.eNba1 = round(proj.expNba1, 3);
  r.eNba = round(proj.expNba, 3);
  r.eYrs = round(proj.expYrs, 2);
  r.eCh = round(proj.expCh, 3);
  r.eMvp = round(proj.expMvp, 3);
  r.pHof = round(proj.pHof, 4);
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
