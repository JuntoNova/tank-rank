#!/usr/bin/env python3
"""Fill last-college-season pts/ast/stl/blk on theory packs + pre-draft cards.

Sources, in order. Never invent. Never overwrite a number we already typed.
  1. assets/pre-draft/*.json (Sports-Reference CBB rows already on player cards)
  2. Basketball-Reference player pages (college table, last season before Career)
  3. Optional local dumps (sshleifer colData 2002–14, JasonG draft_db) if still empty

HS and international origin are skipped. Missing steals/blocks stay missing
(NCAA did not keep them until 1985-86). 0 is a real zero, not a skip.

Usage:
  python3 pipeline/fill-college-lines.py --local
  python3 pipeline/fill-college-lines.py --scrape --years 1989-2018
  python3 pipeline/fill-college-lines.py --scrape --years 1947-2026
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import subprocess
import time
import unicodedata
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
PACKS = ASSETS / "theory-packs"
PRE = ASSETS / "pre-draft"
HIST = ASSETS / "history"
CACHE = Path("/tmp/cbb-src/br-cache")
DUMPS = Path("/tmp/cbb-src")
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
SLEEP = 3.2


def fnum(v):
    if v is None or v == "":
        return None
    try:
        x = float(str(v).replace(",", "").replace("%", ""))
        if x != x:
            return None
        return x
    except (TypeError, ValueError):
        return None


def r1(v):
    return None if v is None else round(float(v), 1)


def r3(v):
    if v is None:
        return None
    x = float(v)
    return round(x, 3) if x <= 1 else round(x, 1)


def norm_name(s):
    s = unicodedata.normalize("NFKD", str(s or "")).encode("ascii", "ignore").decode()
    s = s.lower()
    s = re.sub(r"\b(jr|sr|iii|ii|iv)\b\.?", "", s)
    s = re.sub(r"[^a-z0-9]+", "", s)
    return s


def school_of(c):
    c = re.sub(r"\s*\((Fr|So|Jr|Sr|HS|Intl)\.?\)\s*$", "", str(c or ""), flags=re.I)
    return c.strip()


def inches(ht):
    m = re.match(r"^\s*(\d+)\s*-\s*(\d+(?:\.\d+)?)\s*$", str(ht or ""))
    if not m:
        return None
    return int(m.group(1)) * 12 + float(m.group(2))


def is_guard(pos):
    return bool(re.search(r"(^|\b)(PG|SG|G)(\b|/)", str(pos or ""), re.I))


def want_create(feat, ast):
    if feat.get("create"):
        return 1
    ht = inches(feat.get("ht"))
    if ast is None:
        return int(bool(feat.get("create")))
    if ht and ast >= 2.5 and ht >= 77:
        return 1
    if ast >= 2.0 and is_guard(feat.get("pos")):
        return 1
    return int(bool(feat.get("create")))


def last_college_from_pre(entry):
    if not entry:
        return None
    rows = entry.get("rows") if isinstance(entry, dict) else (entry if isinstance(entry, list) else [entry])
    for r in rows or []:
        if not r:
            continue
        lvl = str(r.get("lvl") or "college").lower()
        if "hs" in lvl or "high" in lvl or "intl" in lvl or "pro" in lvl:
            continue
        if r.get("pts") is not None:
            return r
    return None


def line_from_row(row):
    if not row:
        return None
    pts = fnum(row.get("pts"))
    if pts is None:
        return None
    out = {
        "pts": r1(pts),
        "ast": r1(fnum(row.get("ast"))),
        "stl": r1(fnum(row.get("stl"))),
        "blk": r1(fnum(row.get("blk"))),
        "tov": r1(fnum(row.get("tov"))),
        "mp": r1(fnum(row.get("mp"))),
        "g": int(fnum(row.get("g")) or 0) or None,
        "trb": r1(fnum(row.get("trb"))),
        "fg": r3(fnum(row.get("fg"))),
        "tp": r3(fnum(row.get("tp"))),
        "ft": r3(fnum(row.get("ft"))),
        "team": row.get("team") or "",
        "season": row.get("season") or "",
        "cls": row.get("cls") or "",
        "src": "pre-draft",
    }
    return out


def get_cached(url, dest: Path, force=False):
    dest.parent.mkdir(parents=True, exist_ok=True)

    def usable(txt):
        if not txt or len(txt) < 800:
            return False
        low = txt.lower()
        if "just a moment" in txt or "captcha" in low:
            return False
        if "too many requests" in low or "429 too many" in low:
            return False
        if "<title>error" in low:
            return False
        return True

    if dest.exists() and dest.stat().st_size > 800 and not force:
        txt = dest.read_text(encoding="utf-8", errors="replace")
        if usable(txt):
            return txt
        dest.unlink(missing_ok=True)
    for attempt in range(8):
        wait = SLEEP if attempt == 0 else min(90, 20 + attempt * 12)
        time.sleep(wait)
        try:
            r = subprocess.run(
                [
                    "curl", "-sL", "--max-time", "30",
                    "-A", UA,
                    "-H", "Accept-Language: en-US,en;q=0.9",
                    "-H", "Referer: https://www.basketball-reference.com/draft/",
                    "-o", str(dest),
                    "-w", "%{http_code}",
                    url,
                ],
                capture_output=True, text=True, check=False,
            )
        except OSError as e:
            print("  curl missing", e)
            return None
        code = (r.stdout or "").strip()
        txt = dest.read_text(encoding="utf-8", errors="replace") if dest.exists() else ""
        if code == "429":
            print("  HTTP 429 backoff", url)
            dest.unlink(missing_ok=True)
            time.sleep(45 + attempt * 15)
            continue
        if code == "404":
            print("  HTTP 404", url)
            dest.unlink(missing_ok=True)
            return None
        if code not in ("200", "304") or not usable(txt):
            print("  HTTP", code, url)
            dest.unlink(missing_ok=True)
            continue
        return txt
    return None


def parse_draft(html):
    soup = BeautifulSoup(html, "lxml")
    t = soup.find("table", id="stats")
    out = {}
    if not t:
        return out
    for tr in t.find_all("tr"):
        pk_el = tr.find(["th", "td"], {"data-stat": "pick_overall"})
        if not pk_el:
            continue
        m = re.search(r"\d+", pk_el.get_text(strip=True) or "")
        if not m:
            continue
        pk = int(m.group())
        a = tr.find("a", href=re.compile(r"^/players/"))
        col = tr.find("td", {"data-stat": "college_name"})
        out[pk] = {
            "href": a.get("href") if a else None,
            "name": a.get_text(strip=True) if a else None,
            "college": col.get_text(strip=True) if col else "",
        }
    return out


def extract_commented_table(html, table_id):
    for m in re.finditer(r"<!--(.*?)-->", html, re.S):
        block = m.group(1)
        if f'id="{table_id}"' in block:
            return BeautifulSoup(block, "lxml").find("table", id=table_id)
    soup = BeautifulSoup(html, "lxml")
    return soup.find("table", id=table_id)


def last_college_from_br(html):
    t = extract_commented_table(html, "all_college_stats")
    if not t:
        return None
    seasons = []
    for tr in t.find_all("tr"):
        stats = {}
        for el in tr.find_all(["th", "td"]):
            k = el.get("data-stat")
            if k:
                stats[k] = el.get_text(strip=True)
        if re.match(r"^\d{4}-\d{2}$", stats.get("season") or ""):
            seasons.append(stats)
    if not seasons:
        return None
    s = seasons[-1]
    g = fnum(s.get("g"))

    def per(key_pg, key_tot):
        if s.get(key_pg) not in (None, ""):
            return r1(fnum(s.get(key_pg)))
        if g and s.get(key_tot) not in (None, ""):
            return r1(fnum(s.get(key_tot)) / g)
        return None

    pts = per("pts_per_g", "pts")
    if pts is None:
        return None
    stl = None
    if s.get("stl") not in (None, "") and g:
        stl = r1(fnum(s.get("stl")) / g)
    blk = None
    if s.get("blk") not in (None, "") and g:
        blk = r1(fnum(s.get("blk")) / g)
    tov = None
    if s.get("tov") not in (None, "") and g:
        tov = r1(fnum(s.get("tov")) / g)
    team = s.get("college_id") or ""
    return {
        "pts": pts,
        "ast": per("ast_per_g", "ast"),
        "stl": stl,
        "blk": blk,
        "tov": tov,
        "mp": per("mp_per_g", "mp"),
        "g": int(g) if g else None,
        "trb": per("trb_per_g", "trb"),
        "fg": r3(fnum(s.get("fg_pct"))),
        "tp": r3(fnum(s.get("fg3_pct"))),
        "ft": r3(fnum(s.get("ft_pct"))),
        "team": team,
        "season": s.get("season") or "",
        "cls": "",
        "src": "basketball-reference",
    }


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def load_history(year):
    p = HIST / f"{year}.json"
    if not p.exists():
        return {}
    rows = load_json(p)
    if isinstance(rows, dict):
        rows = rows.get("players") or []
    return {int(r.get("pk") or 0): r for r in rows if r.get("pk")}


def load_pre(year):
    p = PRE / f"{year}.json"
    if not p.exists():
        return {"year": year, "src": "Sports-Reference CBB", "players": {}}
    d = load_json(p)
    players = d.get("players")
    if not isinstance(players, dict):
        players = {k: v for k, v in d.items() if str(k).isdigit()}
        d = {"year": year, "src": d.get("src") or "Sports-Reference CBB", "players": players}
    return d


def apply_line(feat, line, overwrite=False):
    """Copy missing counting stats onto a pack row. Returns True if anything changed."""
    if not line:
        return False
    changed = False
    for k in ("pts", "ast", "stl", "blk", "tov"):
        if line.get(k) is None:
            continue
        if overwrite or feat.get(k) in (None, ""):
            if feat.get(k) != line[k]:
                feat[k] = line[k]
                changed = True
    if line.get("ast") is not None:
        c = want_create(feat, line["ast"])
        if c and not feat.get("create"):
            feat["create"] = 1
            changed = True
    return changed


def pre_row_from_line(line, feat, hist):
    team = line.get("team") or school_of((hist or {}).get("c"))
    if team and re.match(r"^[A-Z0-9]+$", team) and hist:
        team = school_of(hist.get("c")) or team
    cls = feat.get("cls") or line.get("cls") or ""
    row = {
        "lvl": "College",
        "team": team,
        "season": line.get("season") or "",
        "cls": cls,
    }
    for k in ("g", "mp", "pts", "trb", "ast", "stl", "blk", "tov", "fg", "tp", "ft"):
        if line.get(k) is not None:
            row[k] = line[k]
    return row


def load_ssh_index():
    p = DUMPS / "ssh_colData.csv"
    if not p.exists():
        return {}
    idx = {}
    with p.open(newline="", encoding="utf-8", errors="replace") as f:
        for r in csv.DictReader(f):
            y = int(fnum(r.get("year")) or 0)
            key = (norm_name(r.get("Name")), y)
            idx.setdefault(key, []).append(r)
    return idx


def line_from_ssh(rows):
    if not rows:
        return None
    rows = sorted(rows, key=lambda r: fnum(r.get("GP")) or 0)
    r = rows[-1]
    pts = fnum(r.get("PTs/g") or r.get("Pts"))
    if pts is None:
        return None
    return {
        "pts": r1(pts),
        "ast": r1(fnum(r.get("Ast/g") or r.get("Asts"))),
        "stl": r1(fnum(r.get("STL/g") or r.get("Stls"))),
        "blk": r1(fnum(r.get("BK/g") or r.get("Blks"))),
        "tov": r1(fnum(r.get("TOs"))),
        "mp": r1(fnum(r.get("Min"))),
        "g": int(fnum(r.get("GP")) or 0) or None,
        "trb": r1(fnum(r.get("TOT"))),
        "team": r.get("Team") or "",
        "season": f"{int(r['year'])-1}-{str(r['year'])[2:]}",
        "src": "colData",
    }


def load_jason_index():
    p = DUMPS / "jason_draft_db.csv"
    if not p.exists():
        return {}
    idx = {}
    with p.open(newline="", encoding="utf-8", errors="replace") as f:
        for r in csv.DictReader(f):
            season = r.get("Season") or ""
            m = re.match(r"(\d{4})-(\d{2})", season)
            if not m:
                continue
            end = int(m.group(1)[:2] + m.group(2)) if int(m.group(2)) < 50 else int("19" + m.group(2))
            # 2017-18 → 2018
            start = int(m.group(1))
            end = start + 1
            idx.setdefault(norm_name(r.get("Name")), []).append((end, r))
    return idx


def line_from_jason(entries, draft_year):
    if not entries:
        return None
    # last college season ending in draft year, else closest prior
    cand = [e for e in entries if e[0] == draft_year] or [e for e in entries if e[0] <= draft_year]
    if not cand:
        return None
    end, r = sorted(cand, key=lambda x: x[0])[-1]
    g = fnum(r.get("G"))
    mp = fnum(r.get("MP"))
    if not g or not mp or mp < 20:
        return None
    mpg = mp / g if mp > 50 else mp  # totals vs already-per-game
    def per40(col):
        v = fnum(r.get(col))
        if v is None:
            return None
        return r1(v * mpg / 40.0)
    pts = per40("PTS/40")
    if pts is None:
        return None
    return {
        "pts": pts,
        "ast": per40("AST/40"),
        "stl": per40("STL/40"),
        "blk": per40("BLK/40"),
        "tov": per40("TOV/40"),
        "mp": r1(mpg),
        "g": int(g) if g else None,
        "trb": per40("TRB/40"),
        "fg": r3(fnum(r.get("FG%"))),
        "tp": r3(fnum(r.get("3FG%"))),
        "ft": r3(fnum(r.get("FT%"))),
        "team": r.get("School") or "",
        "season": r.get("Season") or "",
        "cls": r.get("Class") or "",
        "src": "realgm-dump",
    }


def parse_years(spec):
    if not spec:
        return list(range(1947, 2027))
    out = []
    for part in spec.split(","):
        part = part.strip()
        if "-" in part:
            a, b = part.split("-", 1)
            out.extend(range(int(a), int(b) + 1))
        else:
            out.append(int(part))
    return out


def scrape_draft_map(year):
    dest = CACHE / "drafts" / f"{year}.html"
    urls = []
    if year <= 1949:
        urls.append(f"https://www.basketball-reference.com/draft/BAA_{year}.html")
    urls.append(f"https://www.basketball-reference.com/draft/NBA_{year}.html")
    html = None
    for url in urls:
        html = get_cached(url, dest)
        if html:
            break
    if not html:
        return {}
    return parse_draft(html)


def scrape_player_line(href):
    if not href:
        return None
    slug = href.strip("/").replace("/", "_")
    dest = CACHE / "players" / f"{slug}.html"
    html = get_cached("https://www.basketball-reference.com" + href, dest)
    if not html:
        return None
    return last_college_from_br(html)


def fill_year(year, scrape=False, ssh=None, jason=None, draft_map=None):
    pack_p = PACKS / f"{year}.json"
    if not pack_p.exists():
        return {"year": year, "skip": True}
    pack = load_json(pack_p)
    hist = load_history(year)
    pre = load_pre(year)
    pre_players = pre.setdefault("players", {})
    stats = {
        "year": year,
        "n": 0,
        "had": 0,
        "filled": 0,
        "skip_origin": 0,
        "still": 0,
        "src": {},
    }
    changed_pack = False
    changed_pre = False
    for feat in pack.get("players") or []:
        pk = feat.get("pk")
        if pk is None:
            continue
        stats["n"] += 1
        origin = (feat.get("origin") or "college").lower()
        if origin in ("hs", "intl"):
            stats["skip_origin"] += 1
            if feat.get("pts") not in (None, ""):
                stats["had"] += 1
            continue
        missing = feat.get("pts") in (None, "")
        if not missing and year >= 1986:
            missing = any(feat.get(k) in (None, "") for k in ("ast", "stl", "blk"))
        elif not missing:
            missing = feat.get("ast") in (None, "")
        if not missing:
            stats["had"] += 1
            continue
        h = hist.get(int(pk)) or {}
        line = None
        # 1. pre-draft
        line = line_from_row(last_college_from_pre(pre_players.get(str(pk)) or pre_players.get(pk)))
        # 2. BR
        if scrape:
            info = (draft_map or {}).get(int(pk)) or {}
            need_br = line is None or (
                year >= 1986 and any(line.get(k) is None for k in ("pts", "ast", "stl", "blk"))
            )
            if need_br and info.get("href"):
                if stats["filled"] % 10 == 0:
                    print(f"  {year} #{pk} {info.get('name') or ''}", flush=True)
                br = scrape_player_line(info.get("href"))
                if br:
                    if line is None:
                        line = br
                    else:
                        for k, v in br.items():
                            if k in ("pts", "ast", "stl", "blk", "tov", "mp", "trb", "g", "fg", "tp", "ft", "team", "season") and line.get(k) is None and v is not None:
                                line[k] = v
                        line["src"] = line.get("src") or "basketball-reference"
        # 3. dumps
        name = h.get("n") or ""
        if line is None and ssh is not None:
            line = line_from_ssh(ssh.get((norm_name(name), year)) or [])
        if line is None and jason is not None:
            line = line_from_jason(jason.get(norm_name(name)) or [], year)
        if not line or line.get("pts") is None:
            stats["still"] += 1
            continue
        if apply_line(feat, line):
            changed_pack = True
            stats["filled"] += 1
            stats["src"][line.get("src") or "?"] = stats["src"].get(line.get("src") or "?", 0) + 1
        else:
            stats["had"] += 1
        # player card: do not wipe existing multi-year tables
        if str(pk) not in pre_players and pk not in pre_players:
            pre_players[str(pk)] = {"rows": [pre_row_from_line(line, feat, h)]}
            changed_pre = True
            pre["src"] = "Sports-Reference CBB / Basketball-Reference college table"
    if changed_pack:
        pack["v"] = int(pack.get("v") or 1) + 1
        save_json(pack_p, pack)
    if changed_pre and pre_players:
        pre["year"] = year
        save_json(PRE / f"{year}.json", pre)
    return stats


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--local", action="store_true")
    ap.add_argument("--scrape", action="store_true")
    ap.add_argument("--years", default="1947-2026")
    ap.add_argument("--dumps", action="store_true", help="use local csv dumps as last resort")
    args = ap.parse_args()
    years = parse_years(args.years)
    ssh = load_ssh_index() if args.dumps else None
    jason = load_jason_index() if args.dumps else None
    CACHE.mkdir(parents=True, exist_ok=True)
    total = {"filled": 0, "still": 0, "had": 0, "n": 0, "src": {}}
    for y in years:
        draft_map = scrape_draft_map(y) if args.scrape else None
        if args.scrape:
            print(f"{y} scraping {len(draft_map or {})} BR draft links", flush=True)
        st = fill_year(y, scrape=args.scrape, ssh=ssh, jason=jason, draft_map=draft_map)
        if st.get("skip"):
            continue
        total["filled"] += st["filled"]
        total["still"] += st["still"]
        total["had"] += st["had"]
        total["n"] += st["n"]
        for k, v in st["src"].items():
            total["src"][k] = total["src"].get(k, 0) + v
        print(f"{y} n={st['n']} had={st['had']} filled={st['filled']} still={st['still']} src={st['src']}")
    print("TOTAL", total)


if __name__ == "__main__":
    main()
