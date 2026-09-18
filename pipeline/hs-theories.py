#!/usr/bin/env python3
"""Elite HS (McDonald's AA) and shooting stickiness (college FT% → NBA FT%).

HS box scores are stored as hs_* and never copied onto college pts.
Pre-1977 drafts skip hs_elite (the game did not exist).
"""
from __future__ import annotations

import json
import os
import re
import time
import urllib.error
import urllib.request
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HIST = os.path.join(ROOT, "assets", "history")
PACK = os.path.join(ROOT, "assets", "theory-packs")
PRE = os.path.join(ROOT, "assets", "pre-draft")
CACHE = os.path.join(ROOT, "pipeline", ".bbref-cache")
TDR_CACHE = os.path.join(ROOT, "pipeline", ".tdr-cache")
UA = "Mozilla/5.0 (compatible; TheDraftModel/1.0; +https://thedraftmodel.com)"
HREF = re.compile(r"""href=['"]/players/[a-z]/([a-z0-9]+)\.html['"]""", re.I)
NUM = re.compile(r"-?\d+(?:\.\d+)?")


def get(url, dest):
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if os.path.exists(dest) and os.path.getsize(dest) > 800:
        return open(dest, encoding="utf-8", errors="replace").read()
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            html = r.read().decode("utf-8", "replace")
    except Exception as e:
        print("fail", url, e, flush=True)
        return ""
    open(dest, "w").write(html)
    time.sleep(2.0)
    return html


def norm(s):
    s = re.sub(r"\b(jr|sr|iii|ii|iv)\b\.?", "", str(s or "").lower())
    return re.sub(r"[^a-z0-9]+", "", s)


def cell_num(inner):
    inner = re.sub(r"<[^>]+>", "", inner).strip()
    if inner in ("", "-"):
        return None
    m = NUM.search(inner.replace(",", ""))
    return float(m.group(0)) if m else None


def parse_mcdonalds():
    html = get(
        "https://www.basketball-reference.com/awards/mcdonalds.html",
        os.path.join(CACHE, "mcdonalds.html"),
    )
    html = html.replace("<!--", "").replace("-->", "")
    out = []
    for y in range(1977, 2027):
        m = re.search(rf'<table[^>]*id="rsci-rankings-{y}"[^>]*>(.*?)</table>', html, re.S)
        if not m:
            continue
        for trm in re.finditer(r"<tr[^>]*>(.*?)</tr>", m.group(1), re.S):
            row = trm.group(1)
            nm = re.search(r'data-stat="player"[^>]*>(.*?)</t[dh]>', row, re.S)
            if not nm:
                continue
            name = re.sub(r"<[^>]+>", "", nm.group(1)).strip()
            if not name or name.lower() == "player":
                continue
            slug_m = re.search(r'data-append-csv="([^"]+)"', row) or HREF.search(row)
            hs = re.search(r'data-stat="hs_name"[^>]*>(.*?)</t[dh]>', row, re.S)
            out.append({
                "hs_year": y,
                "n": name,
                "slug": slug_m.group(1) if slug_m else None,
                "hs": re.sub(r"<[^>]+>", "", hs.group(1)).strip() if hs else "",
            })
    return out


def draft_slugs():
    by_slug = {}
    by_name = defaultdict(list)
    for y in range(1947, 2027):
        fp = os.path.join(CACHE, f"draft_{y}.html")
        path = os.path.join(HIST, f"{y}.json")
        if not os.path.exists(path):
            continue
        hist = {h.get("pk"): h for h in json.load(open(path))}
        html = ""
        if os.path.exists(fp):
            html = open(fp, encoding="utf-8", errors="replace").read().replace("<!--", "").replace("-->", "")
        for h in hist.values():
            by_name[norm(h.get("n"))].append((y, h.get("pk"), h))
        if not html:
            continue
        for trm in re.finditer(r"<tr[^>]*>(.*?)</tr>", html, re.S):
            row = trm.group(1)
            if "pick_overall" not in row:
                continue
            pk_m = re.search(r'data-stat="pick_overall"[^>]*>(.*?)</t[dh]>', row, re.S)
            href = HREF.search(row)
            if not pk_m or not href:
                continue
            pk = cell_num(pk_m.group(1))
            if pk is None:
                continue
            slug = href.group(1)
            h = hist.get(int(pk))
            if h:
                by_slug[slug] = (y, int(pk), h)
    return by_slug, by_name


def match_aa(aa, by_slug, by_name):
    matched = 0
    for rec in aa:
        hit = None
        if rec.get("slug") and rec["slug"] in by_slug:
            hit = by_slug[rec["slug"]]
        else:
            cands = by_name.get(norm(rec["n"])) or []
            window = [c for c in cands if rec["hs_year"] <= c[0] <= rec["hs_year"] + 5]
            if len(window) == 1:
                hit = window[0]
            elif window:
                hit = min(window, key=lambda c: c[0])
        if hit:
            rec["y"], rec["pk"], rec["hist"] = hit
            matched += 1
    print("mcdonalds", len(aa), "matched drafted", matched, flush=True)
    return aa


def load_college():
    """pk,year → {pts, ft, tp, fg} from pack + pre-draft."""
    out = {}
    for y in range(1947, 2030):
        pp = os.path.join(PACK, f"{y}.json")
        pr = os.path.join(PRE, f"{y}.json")
        pack = json.load(open(pp)) if os.path.exists(pp) else {"players": []}
        pre = json.load(open(pr)) if os.path.exists(pr) else {"players": {}}
        by_pk = {f.get("pk"): f for f in pack.get("players") or []}
        for pk, f in by_pk.items():
            rec = {"pts": f.get("pts"), "ft": f.get("ft"), "tp": f.get("tp"), "fg": f.get("fg")}
            entry = (pre.get("players") or {}).get(str(pk))
            if entry:
                rows = entry.get("rows") if isinstance(entry, dict) else entry
                row = (rows or [None])[0] if isinstance(rows, list) else rows
                if row:
                    if rec["ft"] is None and row.get("ft") is not None:
                        rec["ft"] = row["ft"]
                    if rec["pts"] is None and row.get("pts") is not None:
                        rec["pts"] = row["pts"]
                    if rec["tp"] is None and row.get("tp") is not None:
                        rec["tp"] = row["tp"]
            # ft stored as 774 or 0.774
            if rec["ft"] is not None:
                v = float(rec["ft"])
                rec["ft"] = v / 1000.0 if v > 2 else (v / 100.0 if v > 1.5 else v)
            out[(y, pk)] = rec
    return out


def nba_ft_from_totals():
    """slug → career NBA FT% from cached season totals."""
    career = defaultdict(lambda: [0.0, 0.0])
    for y in range(1974, 2027):
        fp = os.path.join(CACHE, f"totals_{y}.html")
        if not os.path.exists(fp):
            continue
        html = open(fp, encoding="utf-8", errors="replace").read().replace("<!--", "").replace("-->", "")
        by = defaultdict(list)
        for trm in re.finditer(r"<tr[^>]*>(.*?)</tr>", html, re.S):
            row = trm.group(1)
            slug_m = re.search(r'data-append-csv="([^"]+)"', row) or HREF.search(row)
            if not slug_m:
                continue
            slug = slug_m.group(1)
            tm = re.search(r'data-stat="team_name_abbr"[^>]*>(.*?)</t[dh]>', row, re.S)
            team = re.sub(r"<[^>]+>", "", tm.group(1)).strip() if tm else ""
            ft = None
            fta = None
            fm = re.search(r'data-stat="ft"[^>]*>(.*?)</t[dh]>', row, re.S)
            fam = re.search(r'data-stat="fta"[^>]*>(.*?)</t[dh]>', row, re.S)
            if fm:
                ft = cell_num(fm.group(1))
            if fam:
                fta = cell_num(fam.group(1))
            if ft is None or fta is None:
                continue
            by[slug].append({"ft": ft, "fta": fta, "tot": team == "TOT"})
        for slug, rows in by.items():
            tots = [r for r in rows if r["tot"]]
            use = tots[0] if tots else rows[0]
            career[slug][0] += use["ft"]
            career[slug][1] += use["fta"]
    out = {}
    for slug, (ft, fta) in career.items():
        if fta >= 50:
            out[slug] = round(ft / fta, 3)
    print("nba ft slugs", len(out), flush=True)
    return out


def scrape_tdr_hs(aa):
    """Senior HS counting stats from TheDraftReview McD pages. Not college."""
    by_norm = {norm(r["n"]) + str(r["hs_year"]): r for r in aa}
    filled = 0
    for start in range(0, 50, 5):
        idx = get(
            f"https://www.thedraftreview.com/mcds-aa?start={start}" if start else "https://www.thedraftreview.com/mcds-aa",
            os.path.join(TDR_CACHE, f"index_{start}.html"),
        )
        years = re.findall(r'href="(/mcds-aa/(\d{4})-mcdonalds-all-american-team)"', idx)
        for href, ys in years:
            y = int(ys)
            html = get("https://www.thedraftreview.com" + href, os.path.join(TDR_CACHE, f"{y}.html"))
            if not html:
                continue
            for trm in re.finditer(r"<tr[^>]*>(.*?)</tr>", html, re.S | re.I):
                row = trm.group(1)
                if "PPG" not in row:
                    continue
                name = re.sub(r"<[^>]+>", "", re.search(r"<a[^>]*>(.*?)</a>", row).group(1) if re.search(r"<a[^>]*>(.*?)</a>", row) else "")
                name = name.replace("*", "").strip()
                stat = re.search(r"Senior Season \(HS\):\s*([^<]+)", row)
                if not stat:
                    continue
                line = stat.group(1)
                rec = by_norm.get(norm(name) + str(y))
                if not rec:
                    continue
                def grab(unit):
                    m = re.search(rf"([\d.]+)\s*{unit}", line)
                    return float(m.group(1)) if m else None
                rec["hs_pts"] = grab("PPG")
                rec["hs_reb"] = grab("RPG")
                rec["hs_ast"] = grab("APG")
                rec["hs_blk"] = grab("BPG")
                rec["hs_stl"] = grab("SPG")
                filled += 1
    print("tdr hs lines", filled, flush=True)


def dlt_pp(x, mu, pct=True):
    d = (x - mu) * (100 if pct else 1)
    if abs(d) < 0.45:
        extra = ""
        txt = "0.0" if not pct else "0.0"
    elif d > 0:
        extra = "pos"
        txt = f"+{d:.1f}"
    else:
        extra = "neg"
        txt = f"−{abs(d):.1f}"
    return txt, extra


def write_table(path, col0, headers, rows):
    th = "".join(f"<th>{h}</th>" for h in [col0] + headers)
    body = []
    for label, cells in rows:
        tds = [f"<td>{label}</td>"]
        for i, v in enumerate(cells):
            extra = ""
            if isinstance(v, tuple):
                v, extra = v
            cls = "num" + ((" " + extra) if extra else "")
            tds.append(f'<td class="{cls}">{v}</td>')
        body.append("<tr>" + "".join(tds) + "</tr>")
    html = (
        '<div class="table-scroll"><table class="inch-grid"><thead><tr>'
        + th + "</tr></thead><tbody>\n" + "\n".join(body) + "\n</tbody></table></div>\n"
    )
    open(path, "w").write(html)


def rate(rows, key="as"):
    if not rows:
        return 0.0
    return sum(1 for r in rows if r.get(key)) / len(rows)


def mean(rows, key):
    xs = [float(r.get(key) or 0) for r in rows]
    return sum(xs) / len(xs) if xs else 0.0


def tag_packs(aa):
    by = defaultdict(list)
    for rec in aa:
        if rec.get("y") and rec.get("pk") is not None:
            by[rec["y"]].append(rec)
        rec.setdefault("hist", None)
    # 2027-2029 living names
    living = {}
    data = open(os.path.join(ROOT, "assets", "data.js")).read()
    for year, blob in re.findall(r"pack\((\d{4}),[\s\S]*?\[([\s\S]*?)\]\);", data):
        y = int(year)
        i = 0
        for sm in re.finditer(r'name:\s*"([^"]+)"', blob):
            i += 1
            living[(y, i)] = sm.group(1)
    extra_js = open(os.path.join(ROOT, "assets", "board-2027-depth.js")).read()
    i = 62
    for sm in re.finditer(r'name:\s*"([^"]+)"', extra_js):
        i += 1
        living[(2027, i)] = sm.group(1)
    aa_names = {(r["hs_year"], norm(r["n"])) for r in aa}
    aa_names |= {(r["hs_year"] + 1, norm(r["n"])) for r in aa}

    tagged = 0
    for y in range(1977, 2030):
        pp = os.path.join(PACK, f"{y}.json")
        if not os.path.exists(pp):
            continue
        pack = json.load(open(pp))
        hits = {r["pk"]: r for r in by.get(y, [])}
        for f in pack.get("players") or []:
            pk = f.get("pk")
            rec = hits.get(pk)
            name = living.get((y, pk))
            elite = 0
            if rec:
                elite = 1
            elif name:
                for hy in range(y - 5, y + 1):
                    if (hy, norm(name)) in aa_names:
                        elite = 1
                        break
            if elite:
                f["hs_elite"] = 1
                tagged += 1
                if rec and rec.get("hs_pts") is not None:
                    f["hs_pts"] = rec["hs_pts"]
                    if rec.get("hs_reb") is not None:
                        f["hs_reb"] = rec["hs_reb"]
                    if rec.get("hs_ast") is not None:
                        f["hs_ast"] = rec["hs_ast"]
                    if rec.get("hs_blk") is not None:
                        f["hs_blk"] = rec["hs_blk"]
            else:
                f.pop("hs_elite", None)
            # copy ft from pre-draft
            pre_p = os.path.join(PRE, f"{y}.json")
            if os.path.exists(pre_p) and f.get("ft") is None:
                pre = json.load(open(pre_p))
                entry = (pre.get("players") or {}).get(str(pk))
                if entry:
                    rows = entry.get("rows") if isinstance(entry, dict) else entry
                    row = (rows or [None])[0] if isinstance(rows, list) else rows
                    if row and row.get("ft") is not None:
                        v = float(row["ft"])
                        f["ft"] = round(v / 1000.0 if v > 2 else (v / 100.0 if v > 1.5 else v), 3)
        json.dump(pack, open(pp, "w"), separators=(",", ":"))
    print("tagged hs_elite", tagged, flush=True)


def main():
    aa = parse_mcdonalds()
    by_slug, by_name = draft_slugs()
    match_aa(aa, by_slug, by_name)
    scrape_tdr_hs(aa)
    college = load_college()
    nba_ft = nba_ft_from_totals()

    # ----- elite HS tables, pick-free, 1978–2018 drafted -----
    drafted = []
    for y in range(1978, 2019):
        path = os.path.join(HIST, f"{y}.json")
        if not os.path.exists(path):
            continue
        aa_pks = {r["pk"] for r in aa if r.get("y") == y}
        for h in json.load(open(path)):
            if not h.get("g") and not h.get("yrs"):
                continue
            col = college.get((y, h.get("pk"))) or {}
            drafted.append({
                "y": y, "pk": h.get("pk"), "n": h.get("n"),
                "as": 1 if (h.get("as") or 0) else 0,
                "nba": 1 if (h.get("nba") or 0) else 0,
                "hof": 1 if h.get("hof") else 0,
                "mvp": 1 if (h.get("mvp") or 0) else 0,
                "yrs": float(h.get("yrs") or 0),
                "pts": col.get("pts"),
                "ft": col.get("ft"),
                "aa": 1 if h.get("pk") in aa_pks else 0,
            })
    mu_as = rate(drafted, "as")
    mu_nba = rate(drafted, "nba")
    mu_hof = rate(drafted, "hof")
    mu_mvp = rate(drafted, "mvp")
    mu_yrs = mean(drafted, "yrs")

    def honor_row(label, rows):
        return (label, [
            str(len(rows)),
            f"{100*rate(rows,'as'):.1f}%", dlt_pp(rate(rows,'as'), mu_as),
            f"{100*rate(rows,'nba'):.1f}%", dlt_pp(rate(rows,'nba'), mu_nba),
            f"{100*rate(rows,'hof'):.1f}%", dlt_pp(rate(rows,'hof'), mu_hof),
            f"{100*rate(rows,'mvp'):.1f}%", dlt_pp(rate(rows,'mvp'), mu_mvp),
        ])

    aa_yes = [r for r in drafted if r["aa"]]
    aa_no = [r for r in drafted if not r["aa"]]
    write_table(
        os.path.join(ROOT, "assets", "hs-t-aa.html"),
        "McDonald's AA",
        ["n", "AS", "Δ AS", "All-NBA", "Δ NBA", "HOF", "Δ HOF", "MVP", "Δ MVP"],
        [honor_row("McDonald's All-American", aa_yes), honor_row("Not", aa_no)],
    )

    modest = [r for r in drafted if r.get("pts") is not None and r["pts"] < 14]
    write_table(
        os.path.join(ROOT, "assets", "hs-t-modest.html"),
        "College line under 14 pts",
        ["n", "AS", "Δ AS", "All-NBA", "Δ NBA", "HOF", "Δ HOF", "MVP", "Δ MVP"],
        [
            honor_row("McDonald's AA, modest college", [r for r in modest if r["aa"]]),
            honor_row("Not AA, modest college", [r for r in modest if not r["aa"]]),
        ],
    )
    missing_pts = [r for r in drafted if r.get("pts") is None]
    write_table(
        os.path.join(ROOT, "assets", "hs-t-noline.html"),
        "No college scoring line",
        ["n", "AS", "Δ AS", "All-NBA", "Δ NBA", "HOF", "Δ HOF", "MVP", "Δ MVP"],
        [
            honor_row("McDonald's AA, no college line", [r for r in missing_pts if r["aa"]]),
            honor_row("Not AA, no college line", [r for r in missing_pts if not r["aa"]]),
        ],
    )

    # ----- shooting stickiness: college FT% vs NBA FT% -----
    pairs = []
    for rec in aa:
        slug = rec.get("slug")
        col = college.get((rec.get("y"), rec.get("pk"))) or {}
        cft = col.get("ft")
        nft = nba_ft.get(slug) if slug else None
        if cft is not None and nft is not None:
            pairs.append((cft, nft, rec))
    # also any drafted with college ft + nba ft via slug map
    for slug, (y, pk, h) in by_slug.items():
        col = college.get((y, pk)) or {}
        cft = col.get("ft")
        nft = nba_ft.get(slug)
        if cft is None or nft is None:
            continue
        if not (1978 <= y <= 2018):
            continue
        pairs.append((cft, nft, {"n": h.get("n"), "y": y}))
    # unique by (y,n)
    seen = set()
    uniq = []
    for cft, nft, meta in pairs:
        k = (meta.get("y"), norm(meta.get("n")))
        if k in seen:
            continue
        seen.add(k)
        uniq.append((cft, nft, meta))
    pairs = uniq
    print("ft pairs", len(pairs), flush=True)

    def ft_band(lo, hi, label):
        rows = [p for p in pairs if lo <= p[0] < hi]
        if not rows:
            return (label, ["0", "—", "—", "—"])
        nba = sum(p[1] for p in rows) / len(rows)
        col = sum(p[0] for p in rows) / len(rows)
        return (label, [
            str(len(rows)),
            f"{100*col:.1f}%",
            f"{100*nba:.1f}%",
            f"{nba-col:+.3f}".replace("-", "−"),
        ])
    write_table(
        os.path.join(ROOT, "assets", "hs-t-ft.html"),
        "College FT%",
        ["n", "College FT%", "NBA FT%", "NBA − college"],
        [
            ft_band(0.85, 1.01, "85% and up"),
            ft_band(0.75, 0.85, "75–85%"),
            ft_band(0.65, 0.75, "65–75%"),
            ft_band(0.0, 0.65, "Under 65%"),
        ],
    )

    # honors by college FT% (pick-free, has a line)
    ft_rows = []
    for r in drafted:
        if r.get("ft") is None:
            continue
        ft_rows.append(r)
    mu_as2 = rate(ft_rows, "as") if ft_rows else mu_as
    mu_nba2 = rate(ft_rows, "nba") if ft_rows else mu_nba
    def ft_honor(lo, hi, label):
        rows = [r for r in ft_rows if lo <= (r["ft"] or 0) < hi]
        return honor_row(label, rows)
    write_table(
        os.path.join(ROOT, "assets", "hs-t-ftas.html"),
        "College FT%",
        ["n", "AS", "Δ AS", "All-NBA", "Δ NBA", "HOF", "Δ HOF", "MVP", "Δ MVP"],
        [
            ft_honor(0.85, 1.01, "85% and up"),
            ft_honor(0.75, 0.85, "75–85%"),
            ft_honor(0.65, 0.75, "65–75%"),
            ft_honor(0.0, 0.65, "Under 65%"),
        ],
    )

    # persist aa file
    slim = []
    for r in aa:
        slim.append({k: r[k] for k in r if k != "hist" and r[k] not in (None, "")})
    json.dump(slim, open(os.path.join(ROOT, "assets", "mcdonalds-aa.json"), "w"))
    tag_packs(aa)
    print("wrote theory tables", flush=True)


if __name__ == "__main__":
    main()
