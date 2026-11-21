"""Phase 5: ファイナリスト群 vs 非ファイナリスト群の比較表を data/analysis_tables.md に出す。"""
import csv
import glob
import itertools
import json
import re
import statistics as st
import sys
from collections import Counter

from scipy.stats import fisher_exact, mannwhitneyu

from common import DATA

sys.stdout.reconfigure(encoding="utf-8")
R = list(csv.DictReader(open(DATA / "features.csv", encoding="utf-8-sig")))
F = [r for r in R if r["is_finalist"] == "1"]
N = [r for r in R if r["is_finalist"] == "0"]
nF, nN = len(F), len(N)
base = nF / len(R)
out = []
P = out.append


def row_bin(label, fF, fN):
    a, c = sum(map(fF, F)), sum(map(fN, N))
    rf, rn = a / nF, c / nN
    lift = (rf / rn) if rn else float("inf")
    p = fisher_exact([[a, nF - a], [c, nN - c]])[1]
    winrate = a / (a + c) if a + c else 0
    return (label, a, rf, c, rn, lift, p, winrate)


def table(title, rows, note=""):
    P(f"\n### {title}\n")
    if note:
        P(note + "\n")
    P("| 特徴 | ファイナリスト（24 件中） | 非ファイナリスト（462 件中） | リフト | この特徴を持つ作品の通過率 | Fisher p |")
    P("|---|---|---|---|---|---|")
    for (label, a, rf, c, rn, lift, p, wr) in rows:
        P(f"| {label} | {a} 件（{rf:.0%}） | {c} 件（{rn:.0%}） | {lift:.2f} | {a}/{a + c}＝{wr:.1%} | {p:.3f} |")


P(f"# 集計表（自動生成。scripts/phase5_analysis.py）\n\n全体 {len(R)} 件／ファイナリスト {nF} 件（{base:.1%}）／非ファイナリスト {nN} 件。受賞 {sum(1 for r in R if r['awards'])} 件。")
P("\nリフト＝ファイナリスト群での割合 ÷ 非ファイナリスト群での割合。通過率の全体平均は 4.9%。Fisher p は参考値（多数の項目を同時に見ているので、0.05 未満でも偶然の可能性がある）。")

BIN = [
    ("デモ URL あり", "has_demo"), ("動画リンクあり", "has_video"), ("画像 3 枚", lambda r: r["image_count"] == "3"),
    ("特定の対象者あり（高齢者・障害者・外国人・子育て・子ども）", "user_specific"), ("行政職員向け", "user_gov"), ("事業者向け", "user_business"),
    ("課題の言い回しあり", "problem_marker"), ("課題の説明に数字の根拠あり", "problem_number"),
    ("課題の具体性 3", lambda r: r["problem_specificity"] == "3"), ("課題の具体性 1（抽象的）", lambda r: r["problem_specificity"] == "1"),
    ("実体験・聞き取りへの言及", "first_person_origin"),
    ("データの使い方 3（結合・新指標）", lambda r: r["data_use_level"] == "3"), ("データの使い方 1（表示のみ）", lambda r: r["data_use_level"] == "1"),
    ("扱ったデータ量の大きな数字あり", "desc_big_number"),
    ("都のデータ URL が 0 件", "data_no_tokyo"), ("都データ×都以外データの併用", "data_cross"), ("国のデータあり", "data_national"), ("OSM・民間データあり", "data_osm_private"),
    ("利用データ 1 件以下", lambda r: int(r["n_data_total"]) <= 1), ("利用データ 5 件以上", lambda r: int(r["n_data_total"]) >= 5), ("利用データ 10 件（上限）", lambda r: int(r["n_data_total"]) >= 10),
    ("AI への言及あり", "ai_any"), ("AI が機能として動く", "ai_in_product"), ("AI は開発に使っただけ", "ai_dev_only"), ("AI の抑制・検証・根拠への言及", "ai_restraint"),
    ("地図・GIS", "tech_map"), ("3D・AR・PLATEAU", "tech_3d_ar"), ("機械学習・最適化・シミュレーション", "tech_ml"), ("ネイティブアプリ", "tech_native"), ("LINE", "tech_line"), ("音声", "tech_voice"), ("Cloudflare", "tech_cloudflare"),
    ("行政の制度・施策への言及", "desc_policy"), ("運用・持続・展開への言及", "desc_sustain"),
    ("タイトルに副題・説明つき", "title_has_tagline"), ("チーム名＝作品名", "team_eq_title"),
    ("1 人チーム", "solo"), ("4 人以上のチーム", lambda r: int(r["member_count"]) >= 4), ("学生らしき手がかり", "student_hint"),
    ("デモが独自ドメイン・その他", lambda r: r["demo_host"] == "独自ドメイン・その他"), ("デモが大会提供 Workers", lambda r: r["demo_host"] == "大会提供Workers"),
    ("デモが Google ドライブ・YouTube・資料類", lambda r: r["demo_host"] in ("Googleドライブ", "Googleドキュメント", "YouTube", "Canva等資料", "Figma", "GitHubリポジトリ")),
]
SOLS = [c for c in R[0] if c.startswith("sol_")]
for s in SOLS:
    BIN.append((f"解決の形：{s[4:]}", s))


def fn(x):
    return x if callable(x) else (lambda r, k=x: r[k] == "1")


rows = [row_bin(l, fn(k), fn(k)) for l, k in BIN]
table("観点別の比較（二値の特徴）", sorted(rows, key=lambda t: -t[5]))

# カテゴリ
for title, key in [("主テーマ別", "theme_primary"), ("チーム人数別", "team_size_band"), ("デモのホスト別", "demo_host"), ("課題の具体性", "problem_specificity"), ("データの使い方", "data_use_level")]:
    vals = sorted({r[key] for r in R})
    rows = [row_bin(v, lambda r, v=v: r[key] == v, lambda r, v=v: r[key] == v) for v in vals]
    table(title, sorted(rows, key=lambda t: -(t[1] + t[3])))

# テーマ（複数ラベル）
allth = sorted({t for r in R for t in r["theme_all"].split("|") if t})
table("テーマ（複数ラベル。1 作品が複数に該当しうる）", sorted([row_bin(t, lambda r, t=t: t in r["theme_all"].split("|"), lambda r, t=t: t in r["theme_all"].split("|")) for t in allth], key=lambda t: -(t[1] + t[3])))
allus = sorted({t for r in R for t in r["users"].split("|") if t})
table("想定ユーザー（複数可）", sorted([row_bin(t, lambda r, t=t: t in r["users"].split("|"), lambda r, t=t: t in r["users"].split("|")) for t in allus], key=lambda t: -(t[1] + t[3])))

# 数値
P("\n### 数値の比較（中央値）\n\n| 項目 | ファイナリスト中央値（平均） | 非ファイナリスト中央値（平均） | Mann-Whitney p |\n|---|---|---|---|")
for label, k in [("メンバー数", "member_count"), ("利用データ数（合計）", "n_data_total"), ("都カタログのデータ数", "n_data_tokyo_catalog"), ("都のデータ数（metro.tokyo 全体）", "n_data_tokyo_any"), ("都以外のデータ数", "n_data_external"), ("説明文の文字数", "desc_len"), ("単位つき数字の個数", "desc_num_count"), ("画像枚数", "image_count"), ("該当テーマ数", "theme_count"), ("タイトル文字数", "title_len")]:
    a = [float(r[k]) for r in F]
    b = [float(r[k]) for r in N]
    P(f"| {label} | {st.median(a):g}（{st.mean(a):.1f}） | {st.median(b):g}（{st.mean(b):.1f}） | {mannwhitneyu(a, b).pvalue:.3f} |")

# 組み合わせ
P("\n### 組み合わせ（2 つの特徴を同時に持つ作品の通過率。該当 12 件以上、ファイナリスト 3 件以上のみ）\n\n| 組み合わせ | 該当数 | うちファイナリスト | 通過率 | 全体平均（4.9%）比 |\n|---|---|---|---|---|")
C = [("デモあり", "has_demo"), ("独自ドメイン", lambda r: r["demo_host"] == "独自ドメイン・その他"), ("特定対象者", "user_specific"), ("行政職員向け", "user_gov"), ("課題に数字", "problem_number"), ("課題具体性3", lambda r: r["problem_specificity"] == "3"),
     ("データ結合・新指標", lambda r: r["data_use_level"] == "3"), ("データ量の大きな数字", "desc_big_number"), ("都×都以外の併用", "data_cross"), ("都データ0件", "data_no_tokyo"), ("データ5件以上", lambda r: int(r["n_data_total"]) >= 5),
     ("AIが機能", "ai_in_product"), ("AI抑制・根拠", "ai_restraint"), ("地図", "tech_map"), ("3D", "tech_3d_ar"), ("ML・最適化", "tech_ml"), ("ゲーム化", "sol_ゲーム化・体験"), ("意思決定支援", "sol_意思決定支援"),
     ("基盤・API", "sol_基盤・API・行政業務"), ("参加型", "sol_参加型・投稿"), ("可視化・地図", "sol_可視化・地図"), ("1人", "solo"), ("2人以上", lambda r: r["solo"] == "0"), ("制度・施策言及", "desc_policy")]
combos = []
for (l1, k1), (l2, k2) in itertools.combinations(C, 2):
    f1, f2 = fn(k1), fn(k2)
    sel = [r for r in R if f1(r) and f2(r)]
    a = sum(r["is_finalist"] == "1" for r in sel)
    if len(sel) >= 12 and a >= 3:
        combos.append((a / len(sel), l1 + " × " + l2, len(sel), a))
for wr, l, n, a in sorted(combos, reverse=True)[:25]:
    P(f"| {l} | {n} | {a} | {wr:.1%} | {wr / base:.1f} 倍 |")
P("\n通過率が低い組み合わせ（該当 25 件以上）\n\n| 組み合わせ | 該当数 | うちファイナリスト | 通過率 |\n|---|---|---|---|")
low = []
for (l1, k1), (l2, k2) in itertools.combinations(C + [("デモなし", lambda r: r["has_demo"] == "0"), ("課題具体性1", lambda r: r["problem_specificity"] == "1"), ("データ表示のみ", lambda r: r["data_use_level"] == "1"), ("AIは開発のみ", "ai_dev_only"), ("データ1件以下", lambda r: int(r["n_data_total"]) <= 1)], 2):
    f1, f2 = fn(k1), fn(k2)
    sel = [r for r in R if f1(r) and f2(r)]
    a = sum(r["is_finalist"] == "1" for r in sel)
    if len(sel) >= 25:
        low.append((a / len(sel), l1 + " × " + l2, len(sel), a))
for wr, l, n, a in sorted(low)[:15]:
    P(f"| {l} | {n} | {a} | {wr:.1%} |")

# テーマ × 解決の形
P("\n### 主テーマ × 解決の形（ファイナリスト数／該当数）\n")
sols = [s[4:] for s in SOLS]
P("| 主テーマ | " + " | ".join(sols) + " |\n|---|" + "---|" * len(sols))
for th in sorted({r["theme_primary"] for r in R}, key=lambda t: -sum(r["theme_primary"] == t for r in R)):
    cells = []
    for s in sols:
        sel = [r for r in R if r["theme_primary"] == th and r["sol_" + s] == "1"]
        a = sum(r["is_finalist"] == "1" for r in sel)
        cells.append(f"{a}/{len(sel)}" + ("★" if a >= 2 else ""))
    P(f"| {th} | " + " | ".join(cells) + " |")

# テキスト比較
D = {json.load(open(p, encoding="utf-8"))["id"]: json.load(open(p, encoding="utf-8")) for p in glob.glob(str(DATA / "details" / "*.json"))}
TOK = re.compile(r"[ァ-ヴー]{3,}|[一-龥々]{2,}|[A-Za-z][A-Za-z0-9\.\+#/-]{1,}")


def toks(i):
    return set(TOK.findall(D[i]["service_description"] or ""))


dfF = Counter(t for r in F for t in toks(r["id"]))
dfN = Counter(t for r in N for t in toks(r["id"]))
P("\n### 説明文の語の比較（その語を含む作品の割合）\n\nファイナリストに相対的に多い語（ファイナリスト 4 件以上）\n\n| 語 | ファイナリスト | 非ファイナリスト | リフト |\n|---|---|---|---|")
cand = [(((dfF[t] / nF) / ((dfN[t] + 0.5) / nN)), t) for t in dfF if dfF[t] >= 4]
for lift, t in sorted(cand, reverse=True)[:40]:
    P(f"| {t} | {dfF[t]}（{dfF[t] / nF:.0%}） | {dfN[t]}（{dfN[t] / nN:.0%}） | {lift:.1f} |")
P("\n非ファイナリストに多く、ファイナリストに少ない語（非ファイナリスト 30 件以上）\n\n| 語 | ファイナリスト | 非ファイナリスト | リフト |\n|---|---|---|---|")
cand = [(((dfF[t] / nF) / (dfN[t] / nN)), t) for t in dfN if dfN[t] >= 30]
for lift, t in sorted(cand)[:40]:
    P(f"| {t} | {dfF[t]}（{dfF[t] / nF:.0%}） | {dfN[t]}（{dfN[t] / nN:.0%}） | {lift:.2f} |")

(DATA / "analysis_tables.md").write_text("\n".join(out) + "\n", encoding="utf-8")
print("\n".join(out))
