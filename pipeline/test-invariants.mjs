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
  const hist = JSON.parse(readFileSync(join(ROOT, "assets/history", year + ".json"), "utf8"));
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
ok(yi.pHof < 0.05, "Yi Hall must stay off the 15% cap (got " + yi.pHof + ")");

const chomche = score(2024, 57);
ok(chomche.expPts == null, "Chomche has no pre-draft points line; PPG must be omitted not imputed (got " + chomche.expPts + ")");
ok(chomche.expReb == null, "Chomche RPG must be omitted");
ok(chomche.expAst == null, "Chomche APG must be omitted");

const method = readFileSync(join(ROOT, "methodology.html"), "utf8");
ok(/capped at 2\.0/.test(method), "methodology must document the block cap");
ok(/0\.14/.test(method), "methodology must show Spearman 0.14");
ok(/Data dictionary/.test(method), "methodology must have a data dictionary");
ok(/Error cases/.test(method), "methodology must list error cases");
ok(/What would change a pick/.test(method), "methodology must say what would change a pick");

const tree = readFileSync(join(ROOT, "assets/player-theory-tree.js"), "utf8");
ok(!/id: "combine"/.test(tree), "player card must not score combine");
ok(!/id: "ftrate"/.test(tree), "player card must not score FT rate");
ok(/Not in this score/.test(tree), "player card must label theories that do not score");

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
