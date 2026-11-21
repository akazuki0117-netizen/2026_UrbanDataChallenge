"""Phase 1: 一覧ページを巡回して全作品 ID を集める。

掲載順がランダムなので、新規 ID が連続 2 巡で 0 件になるまで巡回する。
list_raw.jsonl は追記のみ。再実行すると既存分を読み込んで続きから巡回する。
使い方: python phase1_list.py [最大巡回数] [追加クエリ 例: finalist=true]
"""
import json
import re
import sys
from datetime import datetime, timezone

from common import BASE, DATA, fetch, rsc_payload

sys.stdout.reconfigure(encoding="utf-8")
MAX_PASSES = int(sys.argv[1]) if len(sys.argv) > 1 else 6
EXTRA = sys.argv[2] if len(sys.argv) > 2 else ""
OUT = DATA / ("list_raw.jsonl" if not EXTRA else "list_raw_filtered.jsonl")
DATA.mkdir(exist_ok=True)

CARD = re.compile(r'\{"id":"(\d+)","award":("(?:[^"\\]|\\.)*"|"\$undefined"|null)[^{}]*?\}')


def parse_cards(html: str):
    payload = rsc_payload(html)
    cards = []
    for m in re.finditer(r'\{"id":"\d+","award":[^{}]*\}', payload):
        try:
            cards.append(json.loads(m.group(0)))
        except json.JSONDecodeError:
            cards.append({"id": re.search(r'"id":"(\d+)"', m.group(0)).group(1), "_raw": m.group(0)})
    pages = [int(x) for x in re.findall(r'aria-label="Go to page (\d+)"', html)]
    return cards, (max(pages) if pages else 1)


seen = set()
start_pass = 1
if OUT.exists():
    for line in OUT.open(encoding="utf-8"):
        r = json.loads(line)
        seen.add(r["id"])
        start_pass = max(start_pass, r["pass"] + 1)

zero_streak = 0
for p in range(start_pass, start_pass + MAX_PASSES):
    new_in_pass, total_pages, page, rows = 0, 1, 1, 0
    while page <= total_pages:
        url = f"{BASE}/collection/?year=2026&page={page}" + (f"&{EXTRA}" if EXTRA else "")
        html = fetch(url)
        cards, tp = parse_cards(html)
        total_pages = max(total_pages, tp)
        with OUT.open("a", encoding="utf-8") as f:
            for c in cards:
                rec = {
                    "id": c["id"],
                    "title": c.get("serviceName"),
                    "team": c.get("team"),
                    "award": c.get("award"),
                    "finalist": c.get("finalist"),
                    "detail_url": f"{BASE}/collection/{c['id']}/?year=2026",
                    "pass": p,
                    "page": page,
                    "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                }
                if "_raw" in c:
                    rec["_raw"] = c["_raw"]
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
                rows += 1
                if c["id"] not in seen:
                    seen.add(c["id"])
                    new_in_pass += 1
        page += 1
    print(f"pass {p}: pages={total_pages} rows={rows} new={new_in_pass} unique_total={len(seen)}", flush=True)
    zero_streak = zero_streak + 1 if new_in_pass == 0 else 0
    if zero_streak >= 2:
        print("DONE: 連続 2 巡で新規 0 件")
        break
