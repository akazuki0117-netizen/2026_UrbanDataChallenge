"""Phase 2: 全作品の詳細ページを取得し data/details/{id}.json に保存する。

- 取得済み ID はスキップ（中断・再開可）。
- 生の RSC ペイロードは data/raw_payload/{id}.txt.gz に保存（再解析用。メンバー氏名を含むため共有時は注意）。
- メンバー氏名は details には保存せず人数のみ。
使い方: python phase2_details.py [件数上限] [--reparse]
"""
import csv
import gzip
import json
import re
import sys
from datetime import datetime, timezone

from common import BASE, DATA, ROOT, fetch, rsc_payload

sys.stdout.reconfigure(encoding="utf-8")
args = [a for a in sys.argv[1:] if not a.startswith("--")]
LIMIT = int(args[0]) if args else 10**9
REPARSE = "--reparse" in sys.argv
DET = DATA / "details"
RAW = DATA / "raw_payload"
DET.mkdir(exist_ok=True)
RAW.mkdir(exist_ok=True)

TOKYO_CATALOG = re.compile(r"(catalog\.data\.metro\.tokyo\.lg\.jp|portal\.data\.metro\.tokyo\.lg\.jp|opendata-catalogue\.metro\.tokyo)")


def parse_rows(payload: str):
    """RSC の 'id:値' 行を辞書にする。T チャンク（長文テキスト）にも対応。"""
    rows, i, n = {}, 0, len(payload)
    b = payload.encode("utf-8")
    pos = 0
    while pos < len(b):
        m = re.match(rb"([0-9a-f]+):", b[pos:])
        if not m:
            nl = b.find(b"\n", pos)
            if nl < 0:
                break
            pos = nl + 1
            continue
        key = m.group(1).decode()
        pos += m.end()
        if b[pos:pos + 1] == b"T":
            c = b.find(b",", pos)
            length = int(b[pos + 1:c], 16)
            rows[key] = b[c + 1:c + 1 + length].decode("utf-8", errors="replace")
            pos = c + 1 + length
        else:
            nl = b.find(b"\n", pos)
            if nl < 0:
                nl = len(b)
            rows[key] = b[pos:nl].decode("utf-8", errors="replace")
            pos = nl + 1
    return rows


def flatten(node, out):
    """要素ツリーを文書順に props の列へ。"""
    if isinstance(node, list):
        if len(node) == 4 and node[0] == "$" and isinstance(node[3], dict):
            out.append(node[3])
            flatten(node[3].get("children"), out)
        else:
            for x in node:
                flatten(x, out)


def text_of(children, rows):
    if isinstance(children, str):
        m = re.fullmatch(r"\$([0-9a-f]+)", children)
        if m and isinstance(rows.get(m.group(1)), str) and not rows[m.group(1)].startswith(("[", "{", "I[")):
            return rows[m.group(1)]
        return children
    if isinstance(children, list) and all(isinstance(x, (str, int)) for x in children):
        return "".join(str(x) for x in children)
    return None


def parse_detail(wid: str, payload: str):
    rows = parse_rows(payload)
    notes = []
    main = None
    for v in rows.values():
        if v.startswith("[") and '"breadCrumbs"' in v and '"サービス内容"' in v:
            main = v
            break
    if main is None:
        for v in rows.values():
            if v.startswith("[") and '"breadCrumbs"' in v:
                main = v
                break
    if main is None:
        return None, "main row not found"
    tree = json.loads(main)
    flat = []
    flatten(tree, flat)

    d = {
        "title": None, "team": None, "member_count": 0, "is_finalist": False, "awards": [],
        "service_description": None, "open_data_items": [], "open_data_urls": [],
        "external_data_urls": [], "demo_url": None, "submission_items": [],
        "video_url": None, "image_count": 0, "other_sections": {},
    }
    subtitles, section = [], None
    for p in flat:
        if p.get("award"):
            d["awards"] = [a for a in re.split(r"[、,/・]\s*", p["award"]) if a] if isinstance(p["award"], str) else []
        ch = p.get("children")
        if ch == "ファイナリスト":
            d["is_finalist"] = True
        if p.get("alt") == "Service Image":
            d["image_count"] += 1
        var = p.get("variant")
        if var == "h1":
            d["title"] = text_of(ch, rows)
        elif var == "subtitle1":
            subtitles.append(text_of(ch, rows))
        elif var == "h2":
            section = text_of(ch, rows)
        elif "items" in p and isinstance(p["items"], list) and section:
            items = [{"name": it.get("name"), "url": it.get("url")} for it in p["items"] if isinstance(it, dict)]
            if "オープンデータ" in section:
                d["open_data_items"] += items
            elif "提出作品" in section:
                d["submission_items"] += items
            else:
                d["other_sections"].setdefault(section, []).extend(items)
        elif section and var is None and isinstance(ch, str) and "sx" in p and "lineHeight" in str(p.get("sx")):
            t = text_of(ch, rows)
            if section == "サービス内容":
                d["service_description"] = t
            else:
                d["other_sections"].setdefault(section, []).append(t)
        href = p.get("href")
        if isinstance(href, str) and re.search(r"youtu\.?be", href):
            d["video_url"] = href

    if subtitles:
        d["team"] = subtitles[0]
        # メンバー氏名は保存しない。人数のみ（1 要素に複数名が区切り文字で入る場合も数える）
        cnt = 0
        for s in subtitles[1:]:
            if s:
                cnt += len([x for x in re.split(r"[、,，/／\n]+", s) if x.strip()])
        d["member_count"] = cnt
    for it in d["open_data_items"]:
        u = it.get("url") or ""
        (d["open_data_urls"] if TOKYO_CATALOG.search(u) else d["external_data_urls"]).append(u)
    demo = [it for it in d["submission_items"] if it.get("url")]
    if demo:
        d["demo_url"] = demo[0]["url"]
    if d["service_description"] is None:
        m = re.search(r'"name":"description","content":("(?:[^"\\]|\\.)*")', payload)
        if m:
            d["service_description"] = json.loads(m.group(1))
            notes.append("service_description は meta description から取得")
    for k, label in [("service_description", "サービス内容"), ("demo_url", "提出作品URL"), ("video_url", "動画URL")]:
        if not d[k]:
            notes.append(f"{label} なし")
    if not d["open_data_items"]:
        notes.append("利用データ URL なし")
    if not d["other_sections"]:
        del d["other_sections"]
    return d, "; ".join(notes)


def write_progress(done, total, failed):
    (ROOT / "progress.md").write_text(
        f"# progress（{datetime.now().isoformat(timespec='seconds')} 更新）\n\n"
        f"- 現在の Phase: 2（詳細ページ収集）\n- 完了件数: {done} / {total}\n- 失敗: {failed} 件（data/failed.txt）\n"
        f"- Phase 1: 完了（ユニーク 486 件、ファイナリスト 24 件を 2 系統で照合済み）\n"
        f"- 次にやること: Phase 2 を最後まで → failed 再試行 → Phase 3（モック確認）\n"
        f"- 再開方法: `python scripts/phase2_details.py`（取得済みはスキップ）\n- 未解決の問題: なし\n",
        encoding="utf-8")


ids = [r for r in csv.DictReader((DATA / "works_index.csv").open(encoding="utf-8-sig"))]
failed, done, fetched = [], 0, 0
for r in ids:
    wid = r["id"]
    out = DET / f"{wid}.json"
    rawf = RAW / f"{wid}.txt.gz"
    if out.exists() and not REPARSE:
        done += 1
        continue
    if fetched >= LIMIT:
        break
    url = f"{BASE}/collection/{wid}/?year=2026"
    try:
        if rawf.exists():
            payload = gzip.open(rawf, "rt", encoding="utf-8").read()
            fetched_at = json.loads(out.read_text(encoding="utf-8"))["fetched_at"] if out.exists() else None
        else:
            payload = rsc_payload(fetch(url))
            with gzip.open(rawf, "wt", encoding="utf-8") as f:
                f.write(payload)
            fetched_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
            fetched += 1
        d, notes = parse_detail(wid, payload)
        if d is None:
            raise ValueError(notes)
        rec = {"id": wid, "url": url, "fetched_at": fetched_at, **d, "notes": notes}
        if rec["title"] != r["title"] or int(rec["is_finalist"]) != int(r["is_finalist"]):
            rec["notes"] = (rec["notes"] + "; " if rec["notes"] else "") + f"一覧との不一致: list_title={r['title']} list_finalist={r['is_finalist']}"
        out.write_text(json.dumps(rec, ensure_ascii=False, indent=1), encoding="utf-8")
        done += 1
    except Exception as e:  # noqa: BLE001
        failed.append(f"{wid}\t{type(e).__name__}: {e}")
    if (done + len(failed)) % 10 == 0:
        write_progress(done, len(ids), len(failed))
        print(f"{done}/{len(ids)} failed={len(failed)}", flush=True)

(DATA / "failed.txt").write_text("\n".join(failed) + ("\n" if failed else ""), encoding="utf-8")
write_progress(done, len(ids), len(failed))
print(f"END done={done} failed={len(failed)}")
