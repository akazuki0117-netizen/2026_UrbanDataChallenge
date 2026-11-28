"""千葉県 県立高校の学校別の志願倍率（一般入学者選抜・志願者確定数）を CSV にする。

出典：千葉県教育委員会「令和8年度 千葉県公立高等学校 一般入学者選抜等 志願者確定数一覧」
  https://www.pref.chiba.lg.jp/kyouiku/shidou/nyuushi/koukou/r8/r8kakuteiitiran.html
取得：PDF をダウンロードし、pypdf で文字を取り出して 1行＝1学科 の表にする。

実行方法（リポジトリの直下で）：
  python analysis/src/fetch/chiba_shigan_ratio.py

出力：analysis/dataset/processed/chiba/r8_shigan_ratio.csv
  列：mark（＊などの印）, no（学校番号）, school（学校名）, course（学科）,
      teiin（募集定員）, boshu（募集人員）, shigan（志願者確定数）, ratio（倍率）
注意：県のサイトは「無断で複製・転用はできない」としている。PDF そのものは保存しない（作業用の一時ファイルのみ）。
      倍率などの数値（事実）だけを表にし、出典を必ず書く。
"""
import csv
import io
import re
import sys
import urllib.request
from pathlib import Path

import pypdf

URL = "https://www.pref.chiba.lg.jp/kyouiku/shidou/nyuushi/koukou/r8/documents/r8kakuteiippan.pdf"
OUT = Path(__file__).resolve().parents[2] / "dataset" / "processed" / "chiba" / "r8_shigan_ratio.csv"
ROW = re.compile(r"^(?:(\S+)\s)?(\d+)\s(\S+)\s(\S+)\s(\d+)\s(\d+)\s(\d+)\s([\d.]+)$")


def main() -> None:
    with urllib.request.urlopen(URL, timeout=60) as res:
        data = res.read()
    reader = pypdf.PdfReader(io.BytesIO(data))
    rows = []
    for page in reader.pages:
        for line in (page.extract_text() or "").splitlines():
            m = ROW.match(line.strip())
            if m:
                rows.append(["" if g is None else g for g in m.groups()])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["mark", "no", "school", "course", "teiin", "boshu", "shigan", "ratio"])
        w.writerows(rows)
    print(f"{len(rows)} 行を {OUT} に書いた", file=sys.stderr)


if __name__ == "__main__":
    main()
