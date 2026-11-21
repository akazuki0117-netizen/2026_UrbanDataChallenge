"""定量分析ノートブック（analysis.ipynb）を組み立てて実行する。

使い方: python scripts/build_notebook.py   （hakkason_app_analyse/ で実行）
ノートブックの中身を直したいときは、このファイルのセルを直して再実行する。
"""
from pathlib import Path

import nbformat as nbf
import nb_figure_cells as FIG
from nbclient import NotebookClient

ROOT = Path(__file__).resolve().parent.parent
nb = nbf.v4.new_notebook()
C = []


def md(s):
    C.append(nbf.v4.new_markdown_cell(s.strip()))


def code(s):
    C.append(nbf.v4.new_code_cell(s.strip()))


md("""
# 定量分析：ファイナリストと非ファイナリストの差の仮説検定

- 対象：都知事杯オープンデータ・ハッカソン 2026 の全提出作品 486 件（ファイナリスト 24 件・非ファイナリスト 462 件）
- 入力：`data/features.csv`（[`codebook.md`](codebook.md) の規則で機械付与した特徴量）、`data/manual_coding.csv`（手動コーディング 48 件）
- 出力：`data/hypothesis_tests.csv`、`data/hypothesis_tests_numeric.csv`、`reports/figures/fig01〜fig10_*.png`（分析 1 つにつき図を 1 枚以上）
- このノートブックは `scripts/build_notebook.py` から生成・実行している

## 検定の方針

| 項目 | 決めたこと |
|---|---|
| 帰無仮説 | 「その特徴の有無と、ファイナリストに選ばれるかどうかは無関係」 |
| 二値の特徴 | Fisher の正確検定（両側）。ファイナリストが 24 件と少なく、期待度数が 5 を下回るセルが多いため、カイ二乗検定は使わない |
| 効果の大きさ | オッズ比（条件付き最尤推定）と 95% 正確信頼区間 |
| 数値の特徴 | Mann-Whitney の U 検定（両側）。分布が歪んでいるため t 検定は使わない |
| 多カテゴリ（主テーマ・人数帯） | カイ二乗統計量の並べ替え検定（10 万回） |
| 有意水準 | 5% |
| 多重比較 | 16 個の仮説を同時に検定するので、Holm 法（厳しめ）と Benjamini-Hochberg 法（緩め）で補正した p 値も出す |
| 注意 | 仮説 H1〜H16 は、コードブックの観点から立てたが、**データを一度集計したあとに確定した**。厳密な意味での事前登録された検証ではなく、探索的な検定である |
""")

code("""
import warnings
import numpy as np
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
from scipy import stats, optimize
from scipy.stats.contingency import odds_ratio

warnings.filterwarnings("ignore")
matplotlib.rcParams["font.family"] = ["Yu Gothic", "Meiryo", "MS Gothic", "sans-serif"]
pd.set_option("display.max_colwidth", 60)
pd.set_option("display.width", 200)

df = pd.read_csv("data/features.csv", dtype={"id": str})
df["demo_own_domain"] = (df["demo_host"] == "独自ドメイン・その他").astype(int)
df["data_combine"] = (df["data_use_level"] == 3).astype(int)
df["data_show_only"] = (df["data_use_level"] == 1).astype(int)
df["sol_info"] = df["sol_情報提供・検索"]
df["word_route"] = df["title"].fillna("").str.contains("ルート").astype(int)
import json, glob, re
desc = {json.load(open(p, encoding="utf-8"))["id"]: json.load(open(p, encoding="utf-8"))["service_description"] or "" for p in glob.glob("data/details/*.json")}
df["word_route"] = df["id"].map(lambda i: int("ルート" in desc[i]) ) | df["word_route"]
y = df["is_finalist"].values
nF, nN = int(y.sum()), int((1 - y).sum())
print(f"全体 {len(df)} 件／ファイナリスト {nF} 件／非ファイナリスト {nN} 件／通過率 {nF/len(df):.1%}")
""")

code(FIG.SETUP)

md("""
## 1. 仮説

| 番号 | 仮説（対立仮説） | 使う列 | 予想の向き |
|---|---|---|---|
| H1 | データを結合・計算して新しい指標を作る作品は通過しやすい | `data_use_level == 3` | ＋ |
| H2 | データを表示するだけの作品は通過しにくい | `data_use_level == 1` | − |
| H3 | デモ URL がある作品は通過しやすい | `has_demo` | ＋ |
| H4 | デモを独自ドメイン等で公開している作品は通過しやすい | `demo_host` | ＋ |
| H5 | 3D・AR・PLATEAU を使う作品は通過しやすい | `tech_3d_ar` | ＋ |
| H6 | 機械学習・最適化・シミュレーションを使う作品は通過しやすい | `tech_ml` | ＋ |
| H7 | AI が機能として動く作品は通過しやすい | `ai_in_product` | ＋ |
| H8 | 地図・GIS を使う作品は通過しやすい | `tech_map` | ＋ |
| H9 | 特定の対象者（高齢者・障害者・外国人・子育て・子ども）を持つ作品は通過しやすい | `user_specific` | ＋ |
| H10 | 課題の説明に数字の根拠がある作品は通過しやすい | `problem_number` | ＋ |
| H11 | 行政の制度・施策に言及する作品は通過しやすい | `desc_policy` | ＋ |
| H12 | 都のデータと都以外のデータを併用する作品は通過しやすい | `data_cross` | ＋ |
| H13 | 都のデータを 1 つも使わない作品は通過しにくい | `data_no_tokyo` | − |
| H14 | 1 人チームは通過しにくい | `solo` | − |
| H15 | 情報提供・検索型の作品は通過しにくい | `sol_情報提供・検索` | − |
| H16 | 「ルート」を扱う作品は通過しにくい | 本文・題名に「ルート」 | − |
""")

code("""
H = [
    ("H1", "データを結合・計算して新しい指標を作る", "data_combine", "+"),
    ("H2", "データを表示するだけ", "data_show_only", "-"),
    ("H3", "デモ URL あり", "has_demo", "+"),
    ("H4", "デモが独自ドメイン等", "demo_own_domain", "+"),
    ("H5", "3D・AR・PLATEAU", "tech_3d_ar", "+"),
    ("H6", "機械学習・最適化・シミュレーション", "tech_ml", "+"),
    ("H7", "AI が機能として動く", "ai_in_product", "+"),
    ("H8", "地図・GIS", "tech_map", "+"),
    ("H9", "特定の対象者あり", "user_specific", "+"),
    ("H10", "課題の説明に数字の根拠", "problem_number", "+"),
    ("H11", "行政の制度・施策への言及", "desc_policy", "+"),
    ("H12", "都データと都以外データの併用", "data_cross", "+"),
    ("H13", "都のデータ 0 件", "data_no_tokyo", "-"),
    ("H14", "1 人チーム", "solo", "-"),
    ("H15", "情報提供・検索型", "sol_info", "-"),
    ("H16", "「ルート」を扱う", "word_route", "-"),
]


def holm(p):
    p = np.asarray(p); m = len(p); order = np.argsort(p); adj = np.empty(m); run = 0
    for rank, i in enumerate(order):
        run = max(run, (m - rank) * p[i]); adj[i] = min(1, run)
    return adj


def bh(p):
    p = np.asarray(p); m = len(p); order = np.argsort(p)[::-1]; adj = np.empty(m); run = 1
    for k, i in enumerate(order):
        rank = m - k; run = min(run, p[i] * m / rank); adj[i] = run
    return adj


rows = []
for hid, label, col, sign in H:
    x = df[col].values
    a, b = int(((x == 1) & (y == 1)).sum()), int(((x == 0) & (y == 1)).sum())
    c, d = int(((x == 1) & (y == 0)).sum()), int(((x == 0) & (y == 0)).sum())
    p = stats.fisher_exact([[a, b], [c, d]], alternative="two-sided")[1]
    orr = odds_ratio([[a, b], [c, d]])
    lo, hi = orr.confidence_interval(0.95)
    rows.append(dict(仮説=hid, 特徴=label, 予想=sign, F該当=a, F総数=nF, N該当=c, N総数=nN,
                     F割合=a / nF, N割合=c / nN, 通過率_該当=a / (a + c) if a + c else np.nan,
                     通過率_非該当=b / (b + d), オッズ比=orr.statistic, CI下限=lo, CI上限=hi, p値=p))
T = pd.DataFrame(rows)
T["p_Holm"] = holm(T["p値"]); T["p_BH"] = bh(T["p値"])
T["向き"] = np.where(T["オッズ比"] > 1, "+", "-")
T["予想と一致"] = np.where(T["向き"] == T["予想"], "○", "×")
T["判定"] = np.select([T["p_Holm"] < 0.05, T["p値"] < 0.05], ["補正後も有意", "補正前のみ有意"], "有意でない")
T.to_csv("data/hypothesis_tests.csv", index=False, encoding="utf-8-sig")
show = T.copy()
for c in ["F割合", "N割合", "通過率_該当", "通過率_非該当"]:
    show[c] = (show[c] * 100).round(1).astype(str) + "%"
for c in ["オッズ比", "CI下限", "CI上限"]:
    show[c] = show[c].round(2)
for c in ["p値", "p_Holm", "p_BH"]:
    show[c] = show[c].round(3)
show[["仮説", "特徴", "F該当", "N該当", "F割合", "N割合", "通過率_該当", "通過率_非該当", "オッズ比", "CI下限", "CI上限", "p値", "p_Holm", "p_BH", "予想と一致", "判定"]]
""")

md("""
## 2. 二値の特徴：Fisher の正確検定

上の表が結果。読み方：

- **オッズ比** が 1 より大きければ、その特徴を持つ作品のほうが通過しやすい。95% 信頼区間が 1 をまたぐなら、「差がある」とは言えない
- **p 値** は補正前。**p_Holm** は 16 個を同時に検定したことを踏まえた補正後の値
""")

code(FIG.FIG_RATES)
code(FIG.FIG_FOREST)
code(FIG.FIG_PVALUES)

md("""
## 3. 数値の特徴：Mann-Whitney の U 検定
""")

code("""
NUM = [("メンバー数", "member_count"), ("利用データ数（合計）", "n_data_total"), ("都のデータ数", "n_data_tokyo_any"),
       ("都以外のデータ数", "n_data_external"), ("単位つき数字の個数", "desc_num_count"), ("説明文の文字数", "desc_len"),
       ("該当テーマ数", "theme_count"), ("タイトル文字数", "title_len")]
rows = []
for label, col in NUM:
    a, b = df.loc[y == 1, col], df.loc[y == 0, col]
    u, p = stats.mannwhitneyu(a, b, alternative="two-sided")
    auc = u / (len(a) * len(b))  # ファイナリストの値のほうが大きい確率（0.5 なら差なし）
    rows.append(dict(項目=label, F中央値=a.median(), N中央値=b.median(), F平均=round(a.mean(), 2), N平均=round(b.mean(), 2), 優越確率=round(auc, 3), p値=round(p, 3)))
Tn = pd.DataFrame(rows); Tn["p_Holm"] = holm(Tn["p値"]).round(3)
Tn.to_csv("data/hypothesis_tests_numeric.csv", index=False, encoding="utf-8-sig")
Tn
""")

code(FIG.FIG_NUMERIC)

md("""
「優越確率」は、ファイナリスト 1 件と非ファイナリスト 1 件を無作為に選んだとき、ファイナリストの値のほうが大きい確率。0.5 なら差が無い。

## 4. 多カテゴリの特徴：並べ替え検定

主テーマ（13 区分）とチーム人数帯（4 区分）について、「区分によって通過率が違う」かを調べる。期待度数が小さいので、カイ二乗統計量の分布を並べ替え（ファイナリストのラベルを 10 万回シャッフル）で求める。
""")

code("""
rng = np.random.default_rng(20261121)


def perm_chi2(col, n_perm=100_000):
    codes = pd.Categorical(df[col]).codes; k = codes.max() + 1
    tot = np.bincount(codes, minlength=k); exp = tot * nF / len(df)

    def stat(yy):
        obs = np.bincount(codes[yy == 1], minlength=k)
        return (((obs - exp) ** 2) / exp).sum()

    s0 = stat(y); cnt = 0; yy = y.copy()
    for _ in range(n_perm):
        rng.shuffle(yy); cnt += stat(yy) >= s0
    return s0, (cnt + 1) / (n_perm + 1)


for label, col in [("主テーマ", "theme_primary"), ("チーム人数帯", "team_size_band")]:
    s, p = perm_chi2(col)
    print(f"{label}: カイ二乗統計量 = {s:.2f}、並べ替え p = {p:.3f}")
pd.crosstab(df["theme_primary"], df["is_finalist"]).rename(columns={0: "非ファイナリスト", 1: "ファイナリスト"}).assign(通過率=lambda t: (t["ファイナリスト"] / t.sum(axis=1) * 100).round(1)).sort_values("通過率", ascending=False)
""")

code(FIG.FIG_THEME)

md("""
## 5. 検出力：この件数で、どのくらいの差なら見つけられるか

ファイナリストが 24 件しかないので、小さな差は検定で見つけられない。「非ファイナリストでの割合」が 10%・30%・50% の特徴について、ファイナリストでの割合が何 % なら、Fisher の正確検定（両側 5%）で 80% の確率で有意になるかをシミュレーションで求める。
""")

code("""
def power(p_n, p_f, n_sim=4000):
    a = rng.binomial(nF, p_f, n_sim); c = rng.binomial(nN, p_n, n_sim); hit = 0; cache = {}
    for ai, ci in zip(a, c):
        if (ai, ci) not in cache:
            cache[(ai, ci)] = stats.fisher_exact([[ai, nF - ai], [ci, nN - ci]])[1] < 0.05
        hit += cache[(ai, ci)]
    return hit / n_sim


rows = []
for p_n in [0.10, 0.30, 0.50]:
    need = next((p_f for p_f in np.arange(p_n, 1.0001, 0.02) if power(p_n, p_f) >= 0.8), np.nan)
    rows.append(dict(非ファイナリストでの割合=f"{p_n:.0%}", 検出に必要なファイナリストでの割合=f"{need:.0%}", 必要なリフト=round(need / p_n, 2)))
pd.DataFrame(rows)
""")

code(FIG.FIG_POWER)

md("""
## 6. 多変量：ロジスティック回帰

特徴どうしは重なっている（例：3D を使う作品はシミュレーションもしやすい）。H1・H4・H5・H6 と、人数（H14）を同時に入れて、互いの影響を除いても効果が残るかを見る。ファイナリスト 24 件に対して説明変数は 5 個までに絞った（1 変数あたり約 5 件で、推定は不安定。参考値）。
""")

code("""
X_cols = [("データを結合・新指標", "data_combine"), ("デモが独自ドメイン等", "demo_own_domain"), ("3D・AR・PLATEAU", "tech_3d_ar"),
          ("機械学習・最適化・シミュレーション", "tech_ml"), ("1 人チーム", "solo")]
X = np.column_stack([np.ones(len(df))] + [df[c].values for _, c in X_cols]).astype(float)


def nll(b):
    z = X @ b
    return np.sum(np.logaddexp(0, z) - y * z)


res = optimize.minimize(nll, np.zeros(X.shape[1]), method="BFGS")
b = res.x; p_hat = 1 / (1 + np.exp(-(X @ b)))
cov = np.linalg.inv((X * (p_hat * (1 - p_hat))[:, None]).T @ X); se = np.sqrt(np.diag(cov)); z = b / se
ll1 = -nll(b); ll0 = -nll(np.r_[np.log(nF / nN), np.zeros(X.shape[1] - 1)])
lr = 2 * (ll1 - ll0); p_lr = stats.chi2.sf(lr, X.shape[1] - 1)
R = pd.DataFrame(dict(変数=["（切片）"] + [l for l, _ in X_cols], 係数=b.round(3), 調整オッズ比=np.exp(b).round(2),
                      CI下限=np.exp(b - 1.96 * se).round(2), CI上限=np.exp(b + 1.96 * se).round(2), p値=(2 * stats.norm.sf(abs(z))).round(3)))
R.to_csv("data/logistic_regression.csv", index=False, encoding="utf-8-sig")
print(f"尤度比検定（5 変数まとめて効果があるか）: χ² = {lr:.2f}、自由度 5、p = {p_lr:.4f}")
auc = stats.mannwhitneyu(p_hat[y == 1], p_hat[y == 0]).statistic / (nF * nN)
print(f"当てはまり（AUC・学習データ上）: {auc:.3f}")
R
""")

code(FIG.FIG_LOGIT)

md("""
## 7. 合成スコア：勝ち筋の特徴をいくつ持つか

H1・H4・H5・H6 の 4 つ（データの結合・独自ドメイン・3D・最適化やシミュレーション）のうち、いくつ当てはまるかを数える。数が増えるほど通過率が上がるかを、Cochran-Armitage の傾向検定に相当する並べ替え検定で調べる。

**注意**：この 4 つは、§2 で結果が良かった特徴を選んで組み合わせたものである。同じデータで選んで同じデータで検定しているので、ここの p 値は実際より小さく出る（過大評価）。別の年度のデータで確かめるまでは、仮説として扱う。
""")

code("""
df["score"] = df[["data_combine", "demo_own_domain", "tech_3d_ar", "tech_ml"]].sum(axis=1)
tab = df.groupby("score")["is_finalist"].agg(作品数="count", ファイナリスト="sum")
tab["通過率"] = (tab["ファイナリスト"] / tab["作品数"] * 100).round(1).astype(str) + "%"
s = df["score"].values; obs = (s * y).sum(); yy = y.copy(); cnt = 0; n_perm = 100_000
for _ in range(n_perm):
    rng.shuffle(yy); cnt += (s * yy).sum() >= obs
print(f"傾向の並べ替え検定（片側）: p = {(cnt + 1) / (n_perm + 1):.5f}")
rho, p_s = stats.spearmanr(s, y)
print(f"Spearman の順位相関: ρ = {rho:.3f}、p = {p_s:.4f}")
tab
""")

code(FIG.FIG_SCORE)

md("""
## 8. 頑健性の確認：手動コーディングで同じ向きになるか

機械付与は「データの使い方」「課題の具体性」「特定の対象者」で読み違いがある（一致率 65〜77%）。ファイナリスト 24 件と、無作為に選んだ対照群 24 件について、本文を読んで手で付けた値で同じ検定を行い、向きが変わらないかを確かめる。
""")

code("""
m = pd.read_csv("data/manual_coding.csv", dtype={"id": str})
g = (m["group"] == "finalist").astype(int).values
checks = [("データを結合・新指標（手動）", (m["manual_data_use_level"] == 3).astype(int)),
          ("データを表示するだけ（手動）", (m["manual_data_use_level"] == 1).astype(int)),
          ("課題の具体性 3（手動）", (m["manual_problem_specificity"] == 3).astype(int)),
          ("課題の具体性 1（手動）", (m["manual_problem_specificity"] == 1).astype(int)),
          ("特定の対象者あり（手動）", m["manual_user_specific"]),
          ("AI が機能として動く（手動）", m["manual_ai_in_product"]),
          ("地図・GIS（手動）", m["manual_tech_map"])]
rows = []
for label, x in checks:
    x = x.values
    a, b = int(((x == 1) & (g == 1)).sum()), int(((x == 0) & (g == 1)).sum())
    c, d = int(((x == 1) & (g == 0)).sum()), int(((x == 0) & (g == 0)).sum())
    rows.append(dict(特徴=label, ファイナリスト=f"{a}/24", 対照群=f"{c}/24", オッズ比=round(odds_ratio([[a, b], [c, d]]).statistic, 2),
                     p値=round(stats.fisher_exact([[a, b], [c, d]])[1], 3)))
Tm = pd.DataFrame(rows); Tm.to_csv("data/hypothesis_tests_manual.csv", index=False, encoding="utf-8-sig"); Tm
""")

code(FIG.FIG_MANUAL)

md("""
## 8.5 デモ（モック）の確認結果と、コーディングの一致率

ファイナリスト 24 件と対照群 24 件のデモを開いて確認した結果を、Fisher の正確検定で比べる。件数が 24 対 24 と少ないので参考値。
""")

code(FIG.FIG_MOCK)

md("""
## 9. まとめ

- 16 個の仮説のうち、補正前に有意（p < 0.05）になったものと、Holm 補正後も有意なものは、下のセルの出力のとおり
- 検出力の計算（§5）が示すように、この件数では **リフトが 2〜3 倍以上ある大きな差しか検定で拾えない**。「有意でない」は「差が無い」という意味ではなく、「この件数では差があるとは言えない」という意味である
- 個々の特徴では弱くても、勝ち筋の特徴を重ねて持つ作品ほど通過率が上がる傾向（§7）が見える。ただし特徴の選び方が結果を見たあとなので、p 値は過大評価であり、別の年度での確認が要る
- 機械付与と手動付与で向きが逆になった特徴がある（特定の対象者：機械ではオッズ比 1 未満、手動では 1 超）。この特徴については結論を出さない
""")

code("""
print("補正前に有意（p < 0.05）:", "、".join(f"{r.仮説} {r.特徴}（p={r.p値:.3f}）" for r in T[T["p値"] < 0.05].itertuples()) or "なし")
print("Holm 補正後も有意:", "、".join(f"{r.仮説} {r.特徴}" for r in T[T["p_Holm"] < 0.05].itertuples()) or "なし")
print("BH 補正後に有意（FDR 5%）:", "、".join(f"{r.仮説} {r.特徴}" for r in T[T["p_BH"] < 0.05].itertuples()) or "なし")
print("予想と向きが逆だった仮説:", "、".join(f"{r.仮説} {r.特徴}（オッズ比 {r.オッズ比:.2f}）" for r in T[T["予想と一致"] == "×"].itertuples()) or "なし")
""")

nb["cells"] = C
nb.metadata["kernelspec"] = {"display_name": "Python 3", "language": "python", "name": "python3"}
NotebookClient(nb, timeout=900, kernel_name="python3", resources={"metadata": {"path": str(ROOT)}}).execute()
nbf.write(nb, ROOT / "analysis.ipynb")
print("written:", ROOT / "analysis.ipynb")
