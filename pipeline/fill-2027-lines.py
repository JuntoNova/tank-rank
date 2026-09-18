#!/usr/bin/env python3
"""Fill 2027 living-board college lines from Sports-Reference CBB.
Never invent. Incoming freshmen with no page stay blank.
"""
from __future__ import annotations

import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACK = os.path.join(ROOT, "assets", "theory-packs", "2027.json")
PRE = os.path.join(ROOT, "assets", "pre-draft", "2027.json")
CACHE = os.path.join(ROOT, "pipeline", ".sr-cache")
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
NUM = re.compile(r"-?\d+(?:\.\d+)?")


def get(url: str, cache_name: str) -> str:
    os.makedirs(CACHE, exist_ok=True)
    fp = os.path.join(CACHE, cache_name)
    if os.path.exists(fp) and os.path.getsize(fp) > 20:
        txt = open(fp, encoding="utf-8", errors="replace").read()
        if txt.startswith("HTTP "):
            return ""
        return txt
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            html = r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        open(fp, "w").write(f"HTTP {e.code}")
        time.sleep(1.0)
        return ""
    except Exception as e:
        print("fail", url, e)
        return ""
    open(fp, "w").write(html)
    time.sleep(2.2)
    return html


def slugify(name: str) -> str:
    s = re.sub(r"\b(jr|sr|iii|ii|iv)\b\.?", "", name.lower())
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def cell(tr: str, stat: str):
    m = re.search(rf'data-stat="{stat}"[^>]*>(.*?)</t[dh]>', tr, re.S | re.I)
    if not m:
        return None
    txt = re.sub(r"<[^>]+>", "", m.group(1)).strip()
    if txt in ("", "-"):
        return None
    n = NUM.search(txt.replace(",", ""))
    if n and re.fullmatch(r"-?\d+(?:\.\d+)?", txt.replace(",", "").replace("%", "").strip()) or n:
        try:
            return float(n.group(0))
        except ValueError:
            return txt
    return txt


def parse_last_season(html: str):
    html = html.replace("<!--", "").replace("-->", "")
    m = re.search(r'<table[^>]*id="players_per_game"[^>]*>(.*?)</table>', html, re.S | re.I)
    if not m:
        return None
    last = None
    for trm in re.finditer(r"<tr[^>]*>(.*?)</tr>", m.group(1), re.S | re.I):
        tr = trm.group(1)
        if 'data-stat="year_id"' not in tr:
            continue
        if "career" in tr.lower() or "awards" in (re.search(r'data-stat="year_id"[^>]*>(.*?)</t[dh]>', tr, re.S | re.I).group(1).lower() if re.search(r'data-stat="year_id"', tr) else ""):
            yr = re.sub(r"<[^>]+>", "", re.search(r'data-stat="year_id"[^>]*>(.*?)</t[dh]>', tr, re.S | re.I).group(1)).strip().lower()
            if "career" in yr or "poss" in yr:
                continue
        pts = cell(tr, "pts_per_g")
        if pts is None:
            continue
        year = re.sub(r"<[^>]+>", "", re.search(r'data-stat="year_id"[^>]*>(.*?)</t[dh]>', tr, re.S | re.I).group(1)).strip()
        if not re.match(r"^\d{4}-\d{2}$", year):
            continue
        if year < "2024-25":
            continue
        last = {
            "season": year,
            "pts": round(float(pts), 1),
            "reb": round(float(cell(tr, "trb_per_g") or 0), 1) if cell(tr, "trb_per_g") is not None else None,
            "ast": round(float(cell(tr, "ast_per_g") or 0), 1) if cell(tr, "ast_per_g") is not None else None,
            "stl": round(float(cell(tr, "stl_per_g") or 0), 1) if cell(tr, "stl_per_g") is not None else None,
            "blk": round(float(cell(tr, "blk_per_g") or 0), 1) if cell(tr, "blk_per_g") is not None else None,
            "mp": round(float(cell(tr, "mp_per_g") or 0), 1) if cell(tr, "mp_per_g") is not None else None,
            "g": int(cell(tr, "games") or 0) or None,
            "fga": round(float(cell(tr, "fga_per_g") or 0), 1) if cell(tr, "fga_per_g") is not None else None,
            "fta": round(float(cell(tr, "fta_per_g") or 0), 1) if cell(tr, "fta_per_g") is not None else None,
            "fg3a": round(float(cell(tr, "fg3a_per_g") or 0), 1) if cell(tr, "fg3a_per_g") is not None else None,
            "fg": cell(tr, "fg_pct"),
            "tp": cell(tr, "fg3_pct"),
            "ft": cell(tr, "ft_pct"),
            "cls": re.sub(r"<[^>]+>", "", re.search(r'data-stat="class"[^>]*>(.*?)</t[dh]>', tr, re.S | re.I).group(1)).strip() if re.search(r'data-stat="class"', tr) else "",
            "team": re.sub(r"<[^>]+>", "", re.search(r'data-stat="team_name_abbr"[^>]*>(.*?)</t[dh]>', tr, re.S | re.I).group(1)).strip() if re.search(r'data-stat="team_name_abbr"', tr) else "",
        }
    return last


def search_player(name: str):
    q = urllib.parse.quote(name)
    html = get(
        f"https://www.sports-reference.com/cbb/search/search.fcgi?search={q}",
        "search_" + slugify(name) + ".html",
    )
    hrefs = re.findall(r'href="(/cbb/players/[a-z0-9\-]+\.html)"', html)
    return hrefs[0] if hrefs else None


def fetch_line(name: str):
    slug = slugify(name)
    for i in (1, 2, 3):
        html = get(
            f"https://www.sports-reference.com/cbb/players/{slug}-{i}.html",
            f"{slug}-{i}.html",
        )
        if html and "College Stats" in html and "Page Not Found" not in html:
            line = parse_last_season(html)
            if line:
                return line
    href = search_player(name)
    if not href:
        return None
    slug2 = href.strip("/").replace("/", "_")
    html = get("https://www.sports-reference.com" + href, slug2)
    return parse_last_season(html) if html else None


def roster():
    names = []
    data = open(os.path.join(ROOT, "assets", "data.js")).read()
    m = re.search(r"pack\(2027,[\s\S]*?\[([\s\S]*?)\]\);", data)
    for sm in re.finditer(r'name:\s*"([^"]+)".*?school:\s*"([^"]+)"', m.group(1)):
        names.append({"n": sm.group(1), "school": sm.group(2)})
    depth = open(os.path.join(ROOT, "assets", "board-2027-depth.js")).read()
    for sm in re.finditer(r'name:\s*"([^"]+)".*?school:\s*"([^"]+)"', depth):
        names.append({"n": sm.group(1), "school": sm.group(2)})
    return names


def apply_line(feat: dict, line: dict):
    feat["pts"] = line["pts"]
    if line.get("reb") is not None:
        feat["reb"] = line["reb"]
    if line.get("ast") is not None:
        feat["ast"] = line["ast"]
    if line.get("stl") is not None:
        feat["stl"] = line["stl"]
    if line.get("blk") is not None:
        feat["blk"] = line["blk"]
    if line.get("fga") is not None:
        feat["fga"] = line["fga"]
    if line.get("fta") is not None:
        feat["fta"] = line["fta"]
    if line.get("fg3a") is not None:
        feat["fg3a"] = line["fg3a"]
    if line.get("ast") is not None and line["ast"] >= 2.2:
        feat["create"] = 1


def main():
    names = roster()
    pack = json.load(open(PACK))
    pre = json.load(open(PRE)) if os.path.exists(PRE) else {"year": 2027, "players": {}}
    players = pack["players"]
    filled = 0
    skipped = 0
    for feat in players:
        pk = feat.get("pk")
        if feat.get("pts") is not None:
            continue
        meta = names[pk - 1] if pk and pk <= len(names) else None
        name = (meta or {}).get("n")
        if not name:
            skipped += 1
            continue
        if feat.get("origin") == "intl":
            print("skip intl", pk, name, flush=True)
            skipped += 1
            continue
        print("try", pk, name, flush=True)
        line = fetch_line(name)
        if not line:
            print("  miss", name, flush=True)
            skipped += 1
            continue
        apply_line(feat, line)
        pre.setdefault("players", {})[str(pk)] = {
            "rows": [{
                "lvl": "College",
                "team": line.get("team") or (meta or {}).get("school"),
                "season": line.get("season"),
                "cls": line.get("cls"),
                "g": line.get("g"),
                "mp": line.get("mp"),
                "pts": line.get("pts"),
                "trb": line.get("reb"),
                "ast": line.get("ast"),
                "stl": line.get("stl"),
                "blk": line.get("blk"),
                "fg": line.get("fg"),
                "tp": line.get("tp"),
                "ft": line.get("ft"),
                "fga": line.get("fga"),
                "fta": line.get("fta"),
            }]
        }
        filled += 1
        print("  ", line.get("season"), line["pts"], "pts", line.get("reb"), "reb", line.get("ast"), "ast", flush=True)
    json.dump(pack, open(PACK, "w"), separators=(",", ":"))
    json.dump(pre, open(PRE, "w"), separators=(",", ":"))
    have = sum(1 for f in players if f.get("pts") is not None)
    print("filled", filled, "still missing", sum(1 for f in players if f.get("pts") is None), "have", have)


if __name__ == "__main__":
    main()
