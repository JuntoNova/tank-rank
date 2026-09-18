#!/usr/bin/env python3
"""Pull career PPG / RPG / APG / BPG from Basketball-Reference draft pages."""
from __future__ import annotations

import json
import os
import re
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HIST = os.path.join(ROOT, "assets", "history")
UA = "Mozilla/5.0 (compatible; TheDraftModel/1.0; +https://thedraftmodel.com)"

STAT = re.compile(
    r'<t[dh][^>]*data-stat="(pick_overall|pts_per_g|trb_per_g|ast_per_g|blk_per_g|bpm|g|seasons)"[^>]*>(.*?)</t[dh]>',
    re.I | re.S,
)
NUM = re.compile(r"-?\d+(?:\.\d+)?")


def cell_num(inner: str):
    inner = re.sub(r"<[^>]+>", "", inner).strip()
    if inner in ("", "-"):
        return None
    m = NUM.search(inner)
    return float(m.group(0)) if m else None


def parse_draft(html: str) -> dict:
    html = html.replace("<!--", "").replace("-->", "")
    out = {}
    for m in re.finditer(r"<tr[^>]*>(.*?)</tr>", html, re.S | re.I):
        row = m.group(1)
        if "pick_overall" not in row:
            continue
        got = {}
        for sm in STAT.finditer(row):
            got[sm.group(1)] = cell_num(sm.group(2))
        pk = got.get("pick_overall")
        if pk is None:
            continue
        rec = {}
        if got.get("pts_per_g") is not None:
            rec["pts"] = got["pts_per_g"]
        if got.get("trb_per_g") is not None:
            rec["trb"] = got["trb_per_g"]
        if got.get("ast_per_g") is not None:
            rec["ast"] = got["ast_per_g"]
        if got.get("blk_per_g") is not None:
            rec["blk"] = got["blk_per_g"]
        if got.get("bpm") is not None:
            rec["bpm"] = got["bpm"]
        if got.get("g") is not None:
            rec["g"] = int(got["g"])
        if rec:
            out[int(pk)] = rec
    return out


def fetch(year: int) -> dict:
    url = f"https://www.basketball-reference.com/draft/NBA_{year}.html"
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            html = r.read().decode("utf-8", "replace")
    except Exception as e:
        print("fail", year, e)
        return {}
    return parse_draft(html)


def main():
    merged = 0
    # Blocks are official from 1973-74. Earlier years stay blank.
    years = [y for y in range(1974, 2027) if os.path.exists(os.path.join(HIST, f"{y}.json"))]
    for i, y in enumerate(years):
        by = fetch(y)
        path = os.path.join(HIST, f"{y}.json")
        hist = json.load(open(path))
        n = 0
        with_blk = 0
        for h in hist:
            rec = by.get(h.get("pk"))
            if not rec:
                continue
            if rec.get("blk") is not None:
                h["blk"] = rec["blk"]
                with_blk += 1
            n += 1
        json.dump(hist, open(path, "w"), separators=(",", ":"))
        merged += n
        print(y, "rows", n, "blk", with_blk, "of", len(hist))
        if i + 1 < len(years):
            time.sleep(1.15)
    print("merged", merged)


if __name__ == "__main__":
    main()
