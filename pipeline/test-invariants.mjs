#!/usr/bin/env node
/** Credibility invariants. Scoring is theory-model.js + glm-coefs.js, not app.js. */
import { readFileSync, existsSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const fail = [];
function ok(cond, msg) { if (!cond) fail.push(msg); }

const glmPath = join(ROOT, "assets/glm-coefs.js");
const modelPath = join(ROOT, "assets/theory-model.js");
ok(existsSync(glmPath), "glm-coefs.js missing");
ok(existsSync(modelPath), "theory-model.js missing");
ok(existsSync(join(ROOT, "assets/app.pinned.js")), "app.pinned.js missing — do not load jsDelivr at runtime");

const app = readFileSync(join(ROOT, "assets/app.js"), "utf8");
ok(!/cdn\.jsdelivr\.net/.test(app) || /app\.pinned\.js/.test(app), "app.js still evals jsDelivr");
ok(/app\.pinned\.js/.test(app), "app.js must load local app.pinned.js");

const sandbox = { console };
sandbox.window = sandbox;
sandbox.TR = {};
createContext(sandbox);
runInContext(readFileSync(glmPath, "utf8"), sandbox);
runInContext(readFileSync(modelPath, "utf8"), sandbox);
const G = sandbox.TR.GLM;
const TR = sandbox.TR;

ok(G, "TR.GLM missing");
ok(!(G.features || []).includes("pick") && !(G.features || []).includes("pk"), "pick leaked into features");
ok(G.honor_winsor && G.honor_winsor.blk && G.honor_winsor.blk[1] === 2, "honor_winsor.blk must be 2.0");
ok(Array.isArray(G.hof_skip) && G.hof_skip.indexOf("blk") >= 0, "Hall must skip stocks");

function score(year, pk) {
  const pack = JSON.parse(readFileSync(join(ROOT, "assets/theory-packs", year + ".json"), "utf8"));
  const histPath = join(ROOT, "assets/history", year + ".json");
  const hist = existsSync(histPath) ? JSON.parse(readFileSync(histPath, "utf8")) : [];
  const feat = (pack.players || []).find(function (x) { return x.pk === pk; }) || {};
  const h = (hist || []).find(function (x) { return x.pk === pk; }) || {};
  const p = {
    year: year, rank: pk, pos: feat.pos || h.pos, ht: feat.ht || h.ht, wt: feat.wt || h.wt,
    age: feat.age || h.age, origin: feat.origin, theoryFeat: feat, name: h.n
  };
  return TR.projectPlayer(p, TR.deriveFeat(p), {});
}

const magic = score(1979, 1);
const griffin = score(2001, 7);
const yi = score(2007, 6);
const nash = score(1996, 15);
const fultz = score(2017, 1);
const jokic = score(2014, 41);

ok(magic.expAs > griffin.expAs, "Magic E[AS] must exceed Griffin (got " + magic.expAs + " vs " + griffin.expAs + ")");
ok(griffin.expAs < 2.2, "Griffin E[AS] must stay under 2.2 after the block cap (got " + griffin.expAs + ")");
ok(nash.pHof < 0.01, "Nash draft-night HOF must be <1% (got " + nash.pHof + ")");
ok(jokic.expAs < 1.2, "Jokić draft-night E[AS] is an honest miss, not a star projection (got " + jokic.expAs + ")");
ok(fultz.expAs > 2, "Fultz 23-and-6 must still score as production, not get hand-tuned down (got " + fultz.expAs + ")");
ok(yi.pHof < 0.10, "Yi Hall must stay off the 15% cap (got " + yi.pHof + ")");

const chomche = score(2024, 57);
ok(chomche.expPts == null, "Chomche has no pre-draft points line; PPG must be omitted not imputed (got " + chomche.expPts + ")");
ok(chomche.expReb == null, "Chomche RPG must be omitted");
ok(chomche.expAst == null, "Chomche APG must be omitted");
ok(chomche.expBlk == null, "Chomche has no pre-draft block line; BPG must be omitted");

const lamelo = score(2020, 3);
ok(lamelo.expBlk != null && lamelo.expBlk < 1.2, "LaMelo 0.1 NBL blocks is not 2 BPG (got " + lamelo.expBlk + ")");

const at = JSON.parse(readFileSync(join(ROOT, "assets/all-time.json"), "utf8"));
const eaton = (at.players || []).find(function (p) { return p.n === "Mark Eaton" && p.y === 1979; });
const elmore = (at.players || []).find(function (p) { return p.n === "Elmore Smith"; });
const gj = (at.players || []).find(function (p) { return p.n === "George Johnson" && p.y === 1970 && p.pk === 79; });
ok(eaton && eaton.blk >= 3.4, "Mark Eaton 1979 #107 must be in the index with ~3.5 BPG (got " + (eaton && eaton.blk) + ")");
ok(elmore && elmore.blk >= 2.8, "Elmore Smith 1971 must have career BPG (got " + (elmore && elmore.blk) + ")");
ok(gj && gj.blk >= 2.4, "George Johnson 1970 #79 must have career BPG (got " + (gj && gj.blk) + ")");

const method = readFileSync(join(ROOT, "methodology.html"), "utf8");
ok(/capped at 2\.0/.test(method), "methodology must document the block cap");
ok(/0\.13/.test(method), "methodology must show Spearman 0.13");
ok(/Data dictionary/.test(method), "methodology must have a data dictionary");
ok(/Error cases/.test(method), "methodology must list error cases");
ok(/What would change a pick/.test(method), "methodology must say what would change a pick");

const lebron = score(2003, 1);
ok(lebron.expPts == null, "LeBron HS points must not mint college PPG (got " + lebron.expPts + ")");
ok(lebron.expAst == null, "LeBron HS assists must not mint college APG");
const kobe = score(1996, 13);
ok(kobe.expPts == null, "Kobe HS points must not mint college PPG (got " + kobe.expPts + ")");
const stokes = score(2027, 1);
ok(stokes.expPts == null, "Stokes freshman has no college line; PPG must be omitted");
ok((G.features || []).indexOf("hs_elite") >= 0, "hs_elite must be a GLM feature");
ok((G.features || []).indexOf("ft") >= 0, "ft must be a GLM feature");
ok((G.features || []).indexOf("hs_pts") < 0, "hs_pts must not be a GLM feature");
ok((G.binary || []).indexOf("hs_elite") >= 0, "hs_elite is a binary, not a counting stat");
ok(stokes.steps && stokes.steps.some(function (s) { return s.id === "hselite" && /McDonald/.test(s.value || ""); }), "Stokes McD AA must show on the elite-HS step");
ok(lebron.steps && lebron.steps.some(function (s) { return s.id === "hselite" && /McDonald/.test(s.value || "") && /HS pts/.test(s.value || ""); }), "LeBron HS pts belong on the elite-HS step, not college scoring");
ok(lebron.steps && lebron.steps.some(function (s) { return s.id === "prod" && /not college/.test(s.value || ""); }), "LeBron college scoring step must say not college");

const tree = readFileSync(join(ROOT, "assets/player-theory-tree.js"), "utf8");
ok(!/id: "combine"/.test(tree), "player card must not score combine");
ok(!/id: "ftrate"/.test(tree), "player card must not score FT rate");
ok(/Not in this score/.test(tree), "player card must label theories that do not score");
ok(/id: "hselite"/.test(tree), "player card must include elite HS");
ok(/id: "shoot"/.test(tree), "player card must include shooter stickiness");

const hub = readFileSync(join(ROOT, "theories.html"), "utf8");
ok(/Great shooters stay shooters/.test(hub), "hub must include shooter stickiness");
ok(/Elite high school players overcome a bad college year/.test(hub), "hub must include elite HS");
ok(!/Shooting can be taught/.test(hub), "hub must not still say shooting can be taught");

if (fail.length) {
  console.error("FAIL " + fail.length);
  fail.forEach(function (m) { console.error(" - " + m); });
  process.exit(1);
}
console.log("ok", fail.length, "invariants",
  "Magic", magic.expAs.toFixed(2),
  "Griffin", griffin.expAs.toFixed(2),
  "Yi hof", yi.pHof.toFixed(3),
  "Nash hof", nash.pHof.toFixed(3));
