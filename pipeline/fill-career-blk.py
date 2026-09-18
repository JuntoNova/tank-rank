#!/usr/bin/env python3
"""Career BPG from BBRef season totals (official from 1973-74). Draft pages have no blk column."""
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
CACHE = os.path.join(ROOT, "pipeline", ".bbref-cache")
OUT = os.path.join(ROOT, "pipeline", "career-blk.json")
UA = "Mozilla/5.0 (compatible; TheDraftModel/1.0; +https://thedraftmodel.com)"
NUM = re.compile(r"-?\d+(?:\.\d+)?")
HREF = re.compile(r"""href=['"]/players/[a-z]/([a-z0-9]+)\.html['"]""", re.I)


def cell_num(inner: str):
    inner = re.sub(r"<[^>]+>", "", inner).strip()
    if inner in ("", "-"):
        return None
    m = NUM.search(inner)
    return float(m.group(0)) if m else None


def get(url: str, cache_name: str) -> str:
    os.makedirs(CACHE, exist_ok=True)
    fp = os.path.join(CACHE, cache_name)
    if os.path.exists(fp) and os.path.getsize(fp) > 1000:
        return open(fp).read()
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                html = r.read().decode("utf-8", "replace")
            open(fp, "w").write(html)
            time.sleep(2.2)
            return html
        except urllib.error.HTTPError as e:
            print("http", e.code, url, "sleep", 20 * (attempt + 1))
            time.sleep(20 * (attempt + 1))
        except Exception as e:
            print("fail", url, e)
            time.sleep(8)
    return ""


def season_blk(html: str) -> dict:
    html = html.replace("<!--", "").replace("-->", "")
    by = defaultdict(list)
    for m in re.finditer(r"<tr[^>]*>(.*?)</tr>", html, re.S | re.I):
        row = m.group(1)
        slug_m = re.search(r'data-append-csv="([^"]+)"', row) or HREF.search(row)
        if not slug_m:
            continue
        slug = slug_m.group(1)
        tm = re.search(r'data-stat="team_name_abbr"[^>]*>(.*?)</t[dh]>', row, re.S | re.I)
        team = re.sub(r"<[^>]+>", "", tm.group(1)).strip() if tm else ""
        gm = re.search(r'data-stat="games"[^>]*>(.*?)</t[dh]>', row, re.S | re.I)
        bm = re.search(r'data-stat="blk"[^>]*>(.*?)</t[dh]>', row, re.S | re.I)
        g = cell_num(gm.group(1)) if gm else None
        blk = cell_num(bm.group(1)) if bm else None
        if g is None or blk is None:
            continue
        by[slug].append({"g": g, "blk": blk, "tot": team == "TOT"})
    out = {}
    for slug, rows in by.items():
        tots = [r for r in rows if r["tot"]]
        use = tots[0] if tots else rows[0]
        out[slug] = (use["g"], use["blk"])
    return out


def draft_slugs(html: str) -> dict:
    html = html.replace("<!--", "").replace("-->", "")
    out = {}
    for m in re.finditer(r"<tr[^>]*>(.*?)</tr>", html, re.S | re.I):
        row = m.group(1)
        if "pick_overall" not in row:
            continue
        pk_m = re.search(r'data-stat="pick_overall"[^>]*>(.*?)</t[dh]>', row, re.S | re.I)
        if not pk_m:
            continue
        pk = cell_num(pk_m.group(1))
        href = HREF.search(row)
        if pk is None or not href:
            continue
        out[int(pk)] = href.group(1)
    return out


def main():
    # copy any already-downloaded 2020 draft html
    src = "/tmp/draft2020.html"
    dst = os.path.join(CACHE, "draft_2020.html")
    if os.path.exists(src) and not os.path.exists(dst):
        os.makedirs(CACHE, exist_ok=True)
        open(dst, "w").write(open(src).read())

    career = defaultdict(lambda: [0.0, 0.0])
    for y in range(1974, 2027):
        html = get(
            f"https://www.basketball-reference.com/leagues/NBA_{y}_totals.html",
            f"totals_{y}.html",
        )
        if not html:
            print("skip season", y)
            continue
        n = 0
        for slug, (g, blk) in season_blk(html).items():
            career[slug][0] += g
            career[slug][1] += blk
            n += 1
        print("season", y, "rows", n, "slugs", len(career))

    bpg = {}
    for slug, (g, blk) in career.items():
        if g >= 1:
            bpg[slug] = round(blk / g, 2)
    json.dump(bpg, open(OUT, "w"))
    print("wrote", OUT, "n", len(bpg), "AD", bpg.get("davisan02"), "Gobert", bpg.get("goberru01"), "LaMelo", bpg.get("ballla01"))

    filled = 0
    years = [y for y in range(1973, 2027) if os.path.exists(os.path.join(HIST, f"{y}.json"))]
    for y in years:
        html = get(
            f"https://www.basketball-reference.com/draft/NBA_{y}.html",
            f"draft_{y}.html",
        )
        if not html:
            print("skip draft", y)
            continue
        slugs = draft_slugs(html)
        path = os.path.join(HIST, f"{y}.json")
        hist = json.load(open(path))
        n = 0
        for h in hist:
            slug = slugs.get(h.get("pk"))
            if not slug or slug not in bpg:
                continue
            h["blk"] = bpg[slug]
            n += 1
        json.dump(hist, open(path, "w"), separators=(",", ":"))
        filled += n
        print("draft", y, "slugs", len(slugs), "blk", n, "of", len(hist))
    print("filled", filled)


if __name__ == "__main__":
    main()
