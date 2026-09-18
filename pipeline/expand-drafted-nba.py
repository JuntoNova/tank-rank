#!/usr/bin/env python3
"""Backfill career BPG on every existing draftee, and add later-round
picks who actually played. The 60-pick cap dropped Mark Eaton (1979 #107).
"""
from __future__ import annotations

import json
import os
import re
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HIST = os.path.join(ROOT, "assets", "history")
CACHE = os.path.join(ROOT, "pipeline", ".bbref-cache")
BPG = json.load(open(os.path.join(ROOT, "pipeline", "career-blk.json")))
UA = "Mozilla/5.0 (compatible; TheDraftModel/1.0; +https://thedraftmodel.com)"
NUM = re.compile(r"-?\d+(?:\.\d+)?")
HREF = re.compile(r"""href=['"]/players/[a-z]/([a-z0-9]+)\.html['"]""", re.I)
TD = re.compile(
    r'data-stat="(pick_overall|player|team_id|college_name|seasons|g|pts_per_g|trb_per_g|ast_per_g|bpm)"[^>]*>(.*?)</t[dh]>',
    re.I | re.S,
)


def cell_num(inner: str):
    inner = re.sub(r"<[^>]+>", "", inner).strip()
    if inner in ("", "-"):
        return None
    m = NUM.search(inner)
    return float(m.group(0)) if m else None


def get(year: int) -> str:
    os.makedirs(CACHE, exist_ok=True)
    fp = os.path.join(CACHE, f"draft_{year}.html")
    if os.path.exists(fp) and os.path.getsize(fp) > 1000:
        return open(fp, encoding="utf-8", errors="replace").read()
    url = f"https://www.basketball-reference.com/draft/NBA_{year}.html"
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            html = r.read().decode("utf-8", "replace")
        open(fp, "w").write(html)
        time.sleep(2.2)
        return html
    except Exception as e:
        print("fail", year, e)
        return ""


def slugify(name: str, year: int, pk: int) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (name or "").lower()).strip("-")
    return f"{s}-{year}-{pk}"


def parse_draft(html: str) -> list:
    html = html.replace("<!--", "").replace("-->", "")
    out = []
    for m in re.finditer(r"<tr[^>]*>(.*?)</tr>", html, re.S | re.I):
        row = m.group(1)
        if "pick_overall" not in row:
            continue
        got = {}
        for sm in TD.finditer(row):
            key, inner = sm.group(1), sm.group(2)
            if key in ("player", "team_id", "college_name"):
                got[key] = re.sub(r"<[^>]+>", "", inner).strip()
            else:
                got[key] = cell_num(inner)
        pk = got.get("pick_overall")
        if pk is None:
            continue
        href = HREF.search(row)
        rec = {
            "pk": int(pk),
            "n": got.get("player") or "",
            "t": got.get("team_id") or "",
            "c": got.get("college_name") or "",
            "slug": href.group(1) if href else None,
        }
        if got.get("seasons") is not None:
            rec["yrs"] = int(got["seasons"])
        if got.get("g") is not None:
            rec["g"] = int(got["g"])
        if got.get("pts_per_g") is not None:
            rec["pts"] = got["pts_per_g"]
        if got.get("trb_per_g") is not None:
            rec["trb"] = got["trb_per_g"]
        if got.get("ast_per_g") is not None:
            rec["ast"] = got["ast_per_g"]
        if got.get("bpm") is not None:
            rec["bpm"] = got["bpm"]
        if rec["slug"] and rec["slug"] in BPG:
            rec["blk"] = BPG[rec["slug"]]
        out.append(rec)
    return out


def apply_year(year: int):
    path = os.path.join(HIST, f"{year}.json")
    if not os.path.exists(path):
        return 0, 0
    html = get(year)
    if not html:
        print("skip", year)
        return 0, 0
    parsed = parse_draft(html)
    hist = json.load(open(path))
    by_pk = {h.get("pk"): h for h in hist if h.get("pk") is not None}
    added = filled = 0
    for rec in parsed:
        h = by_pk.get(rec["pk"])
        if h is None:
            if not rec.get("g"):
                continue
            row = {"y": year, "pk": rec["pk"], "n": rec["n"]}
            for k in ("t", "c", "yrs", "g", "pts", "trb", "ast", "bpm", "blk"):
                if rec.get(k) not in (None, ""):
                    row[k] = rec[k]
            hist.append(row)
            by_pk[rec["pk"]] = row
            added += 1
            continue
        if rec.get("blk") is not None and h.get("blk") is None:
            h["blk"] = rec["blk"]
            filled += 1
        for k in ("pts", "trb", "ast", "g", "yrs"):
            if h.get(k) in (None, "") and rec.get(k) not in (None, ""):
                h[k] = rec[k]
    hist.sort(key=lambda r: r.get("pk") or 0)
    json.dump(hist, open(path, "w"), separators=(",", ":"))
    print(year, "picks", len(hist), "added", added, "blk", filled, flush=True)
    return added, filled


def sync_all_time():
    at_path = os.path.join(ROOT, "assets", "all-time.json")
    blob = json.load(open(at_path))
    players = blob["players"]
    have = {(r["y"], r["pk"]) for r in players}
    new_at = 0
    for year in range(1947, 2027):
        path = os.path.join(HIST, f"{year}.json")
        if not os.path.exists(path):
            continue
        for h in json.load(open(path)):
            key = (h.get("y") or year, h.get("pk"))
            if key in have or key[1] is None:
                continue
            row = {
                "y": key[0],
                "pk": key[1],
                "n": h.get("n") or "",
                "id": slugify(h.get("n") or "", key[0], key[1]),
                "t": h.get("t") or "",
                "c": h.get("c") or "",
                "pos": h.get("pos") or "",
                "yrs": h.get("yrs") or 0,
            }
            for k in ("as", "nba", "nba1", "ch", "mvp", "hof", "g", "pts", "trb", "ast", "blk", "bpm"):
                if h.get(k) not in (None, ""):
                    row[k] = h[k]
            players.append(row)
            have.add(key)
            new_at += 1
    blob["n"] = len(players)
    json.dump(blob, open(at_path, "w"), separators=(",", ":"))
    print("all-time added", new_at, "n", len(players), flush=True)


def main():
    import sys
    years = [int(x) for x in sys.argv[1:]] if len(sys.argv) > 1 else list(range(1973, 2027))
    added = filled = 0
    for year in years:
        a, f = apply_year(year)
        added += a
        filled += f
    print("history added", added, "blk filled", filled, flush=True)
    sync_all_time()


if __name__ == "__main__":
    main()
