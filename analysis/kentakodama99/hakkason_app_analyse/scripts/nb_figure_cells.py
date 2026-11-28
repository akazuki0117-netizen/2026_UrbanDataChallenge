"""analysis.ipynb に入れる図のセル。build_notebook.py から読み込む。

方針: 分析 1 つにつき図を 1 枚以上出し、reports/figures/ に PNG で保存する。
配色: ファイナリスト＝青 #2a78d6、非ファイナリスト・対照群＝橙 #eb6834（色覚特性でも区別できる組として検証済み）。
"""

SETUP = '''
import os
os.makedirs("reports/figures", exist_ok=True)
NL = chr(10)
BLUE, ORANGE, INK, MUTED, GRID = "#2a78d6", "#eb6834", "#0b0b0b", "#52514e", "#e6e6e6"


def style(ax, grid_axis="x"):
    ax.grid(axis=grid_axis, color=GRID, lw=0.8); ax.set_axisbelow(True)
    for s in ["top", "right"]:
        ax.spines[s].set_visible(False)
    ax.spines["left"].set_color("#b5b5b5"); ax.spines["bottom"].set_color("#b5b5b5")
    ax.tick_params(colors=MUTED, length=0)


def save(fig, name):
    path = f"reports/figures/{name}.png"
    fig.savefig(path, dpi=150, facecolor="white"); print("保存:", path)
'''

FIG_RATES = '''
# 図 1: 16 仮説それぞれの「その特徴を持つ作品の割合」を 2 群で比べる
o = T.assign(diff=T["F割合"] - T["N割合"]).sort_values("diff")
fig, ax = plt.subplots(figsize=(9, 6.4)); yp = np.arange(len(o))
ax.hlines(yp, o["N割合"] * 100, o["F割合"] * 100, color="#c9c9c9", lw=2, zorder=1)
ax.scatter(o["N割合"] * 100, yp, s=70, color=ORANGE, edgecolor="white", linewidth=2, zorder=3, label="非ファイナリスト（462 件）")
ax.scatter(o["F割合"] * 100, yp, s=70, color=BLUE, edgecolor="white", linewidth=2, zorder=3, label="ファイナリスト（24 件）")
ax.set_yticks(yp); ax.set_yticklabels([f"{h} {l}" for h, l in zip(o["仮説"], o["特徴"])], color=INK)
for yy, (_, r) in zip(yp, o.iterrows()):
    ax.text(104, yy, f"{r['diff'] * 100:+.0f} ポイント", va="center", fontsize=9, color=INK, clip_on=False)
ax.set_xlim(0, 100); ax.set_xlabel("その特徴を持つ作品の割合（%）", color=MUTED)
fig.suptitle("図 1　特徴を持つ作品の割合：ファイナリストと非ファイナリスト", x=0.01, ha="left", color=INK, fontsize=12)
ax.legend(loc="lower left", bbox_to_anchor=(0, 1.0), ncol=2, frameon=False, fontsize=9); style(ax)
fig.subplots_adjust(left=0.36, right=0.86, bottom=0.09, top=0.88); save(fig, "fig01_feature_rates"); plt.show()
'''

FIG_FOREST = '''
# 図 2: オッズ比と 95% 信頼区間
order = T.sort_values("オッズ比")
fig, ax = plt.subplots(figsize=(9, 6.4)); ypos = np.arange(len(order))
orv = order["オッズ比"].clip(lower=0.03).values; lo = order["CI下限"].clip(lower=0.03).values; hi = order["CI上限"].clip(upper=60).values
ax.hlines(ypos, lo, hi, color=BLUE, lw=2, zorder=2)
ax.scatter(orv, ypos, s=70, color=BLUE, edgecolor="white", linewidth=2, zorder=3)
ax.axvline(1, color="#8a8a8a", lw=1, zorder=1)
ax.set_xscale("log"); ax.set_xlim(0.03, 60)
ax.set_xticks([0.05, 0.1, 0.25, 0.5, 1, 2, 4, 10, 30]); ax.set_xticklabels(["0.05", "0.1", "0.25", "0.5", "1", "2", "4", "10", "30"])
ax.set_yticks(ypos); ax.set_yticklabels([f"{h} {l}" for h, l in zip(order["仮説"], order["特徴"])], color=INK)
for yy, (_, r) in zip(ypos, order.iterrows()):
    ax.text(72, yy, f"{r['オッズ比']:.2f}（p={r['p値']:.3f}）", va="center", ha="left", fontsize=9, color=INK, clip_on=False)
ax.set_xlabel("オッズ比（対数目盛）。1 より右＝その特徴を持つ作品のほうが通過しやすい", color=MUTED)
ax.set_title("図 2　特徴の有無とファイナリスト選出の関係（オッズ比と 95% 信頼区間）", loc="left", color=INK, fontsize=12)
style(ax); ax.spines["left"].set_visible(False)
fig.text(0.01, 0.005, "線は 95% 正確信頼区間。1 をまたぐ線は「差があるとは言えない」。「ルート」はファイナリストに該当 0 件のためオッズ比 0（左端）。", fontsize=8, color=MUTED)
fig.subplots_adjust(left=0.36, right=0.83, bottom=0.11, top=0.93); save(fig, "fig02_odds_ratio"); plt.show()
'''

FIG_PVALUES = '''
# 図 3: p 値（補正前）と多重比較の補正後
o = T.sort_values("p値", ascending=False); yp = np.arange(len(o))
fig, ax = plt.subplots(figsize=(9, 6.2))
ax.hlines(yp, o["p値"], o["p_Holm"], color="#c9c9c9", lw=2, zorder=1)
ax.scatter(o["p値"], yp, s=70, color=BLUE, edgecolor="white", linewidth=2, zorder=3, label="補正前の p 値")
ax.scatter(o["p_Holm"], yp, s=70, color=ORANGE, marker="s", edgecolor="white", linewidth=2, zorder=3, label="Holm 補正後の p 値")
ax.axvline(0.05, color=INK, lw=1, ls="--"); ax.text(0.052, len(o) - 0.4, "有意水準 0.05", fontsize=9, color=INK)
ax.set_xscale("log"); ax.set_xlim(0.01, 1.3); ax.set_xticks([0.01, 0.05, 0.1, 0.5, 1]); ax.set_xticklabels(["0.01", "0.05", "0.1", "0.5", "1"])
ax.set_yticks(yp); ax.set_yticklabels([f"{h} {l}" for h, l in zip(o["仮説"], o["特徴"])], color=INK)
ax.set_xlabel("p 値（対数目盛）。破線より左なら有意", color=MUTED)
ax.set_title("図 3　多重比較の補正：補正後に有意な仮説は無い", loc="left", color=INK, fontsize=12)
ax.legend(loc="lower left", frameon=False, fontsize=9); style(ax)
fig.subplots_adjust(left=0.36, right=0.97, bottom=0.09, top=0.93); save(fig, "fig03_pvalues_correction"); plt.show()
'''

FIG_NUMERIC = '''
# 図 4: 数値の特徴の分布（各群の中での割合）
items = [("メンバー数", "member_count", [1, 2, 3, 4, 5, 6], "6 人以上"), ("利用データ数（合計）", "n_data_total", [0, 2, 4, 6, 8, 10], None),
         ("都以外のデータ数", "n_data_external", [0, 1, 2, 3, 4, 5], "5 件以上"), ("単位つき数字の個数", "desc_num_count", [0, 1, 2, 3, 4], "4 個以上")]
fig, axes = plt.subplots(2, 2, figsize=(10, 6.6))
for ax, (label, col, edges, last) in zip(axes.ravel(), items):
    if col == "n_data_total":
        bins = [(0, 1), (2, 3), (4, 5), (6, 7), (8, 9), (10, 99)]; names = ["0-1", "2-3", "4-5", "6-7", "8-9", "10"]
    else:
        bins = [(e, e) for e in edges[:-1]] + [(edges[-1], 999)]; names = [str(e) for e in edges[:-1]] + [last]
    x = np.arange(len(bins)); w = 0.38
    for k, (grp, color, name) in enumerate([(1, BLUE, "ファイナリスト"), (0, ORANGE, "非ファイナリスト")]):
        v = df.loc[y == grp, col]; share = [((v >= a) & (v <= b)).mean() * 100 for a, b in bins]
        ax.bar(x + (k - 0.5) * (w + 0.03), share, w, color=color, label=name)
    r = Tn.set_index("項目").loc[label]
    ax.set_title(f"{label}　中央値 {r['F中央値']:g} 対 {r['N中央値']:g}（p={r['p値']:.3f}）", loc="left", fontsize=10, color=INK)
    ax.set_xticks(x); ax.set_xticklabels(names); ax.set_ylabel("各群の中での割合（%）", color=MUTED, fontsize=9); style(ax, "y")
axes[0, 0].legend(frameon=False, fontsize=9)
fig.suptitle("図 4　数値の特徴の分布：どれも 2 群でほぼ重なる", x=0.01, ha="left", color=INK, fontsize=12)
fig.tight_layout(rect=(0, 0, 1, 0.95)); save(fig, "fig04_numeric_distributions"); plt.show()
'''

FIG_THEME = '''
# 図 5: 主テーマ別・人数帯別の通過率
fig, (a1, a2) = plt.subplots(1, 2, figsize=(11, 5.4), gridspec_kw={"width_ratios": [1.6, 1]})
t = df.groupby("theme_primary")["is_finalist"].agg(["sum", "count"]); t["rate"] = t["sum"] / t["count"] * 100; t = t.sort_values("rate")
a1.barh(t.index, t["rate"], color=BLUE, height=0.62)
for i, (_, r) in enumerate(t.iterrows()):
    a1.text(r["rate"] + 0.9, i, f"{int(r['sum'])}/{int(r['count'])} 件", va="center", fontsize=9, color=INK)
a1.axvline(nF / len(df) * 100, color=INK, lw=1, ls="--"); a1.text(nF / len(df) * 100 + 0.3, -0.75, "全体平均 4.9%", fontsize=9, color=INK)
a1.set_xlim(0, 30); a1.set_xlabel("通過率（%）", color=MUTED); a1.set_title("主テーマ別（並べ替え検定 p=0.050）", loc="left", fontsize=10, color=INK); style(a1)
order_b = ["1人", "2-3人", "4-5人", "6人以上"]
b = df.groupby("team_size_band")["is_finalist"].agg(["sum", "count"]).loc[order_b]; b["rate"] = b["sum"] / b["count"] * 100
a2.bar(order_b, b["rate"], color=BLUE, width=0.6)
for i, (_, r) in enumerate(b.iterrows()):
    a2.text(i, r["rate"] + 0.25, f"{int(r['sum'])}/{int(r['count'])} 件", ha="center", fontsize=9, color=INK)
a2.axhline(nF / len(df) * 100, color=INK, lw=1, ls="--"); a2.set_ylim(0, 10)
a2.set_ylabel("通過率（%）", color=MUTED); a2.set_title("チーム人数別（並べ替え検定 p=0.970）", loc="left", fontsize=10, color=INK); style(a2, "y")
fig.suptitle("図 5　主テーマ別・チーム人数別の通過率（テーマは機械付与。一致率 63% のため参考）", x=0.01, ha="left", color=INK, fontsize=12)
fig.tight_layout(rect=(0, 0, 1, 0.94)); save(fig, "fig05_theme_teamsize"); plt.show()
'''

FIG_POWER = '''
# 図 6: 検出力曲線
fig, axes = plt.subplots(1, 3, figsize=(11, 3.8), sharey=True)
for ax, p_n in zip(axes, [0.10, 0.30, 0.50]):
    xs = np.arange(p_n, 1.0001, 0.05); xs = np.clip(xs, 0, 1); ps = [power(p_n, v, 3000) * 100 for v in xs]
    ax.plot(xs * 100, ps, color=BLUE, lw=2); ax.axhline(80, color=INK, lw=1, ls="--")
    ax.set_title(f"非ファイナリストでの割合が {p_n:.0%} の特徴", loc="left", fontsize=10, color=INK)
    ax.set_xlabel("ファイナリストでの割合（%）", color=MUTED); ax.set_ylim(0, 100); style(ax, "y")
axes[0].set_ylabel("有意になる確率＝検出力（%）", color=MUTED); axes[0].text(axes[0].get_xlim()[0] + 2, 83, "検出力 80%", fontsize=9, color=INK)
fig.suptitle("図 6　検出力：ファイナリスト 24 件では、大きな差しか見つけられない", x=0.01, ha="left", color=INK, fontsize=12)
fig.tight_layout(rect=(0, 0, 1, 0.92)); save(fig, "fig06_power"); plt.show()
'''

FIG_LOGIT = '''
# 図 7: ロジスティック回帰の調整オッズ比と、単独で見たときのオッズ比
Rv = R.iloc[1:].reset_index(drop=True); uni = T.set_index("特徴")
names_map = {"データを結合・新指標": "データを結合・計算して新しい指標を作る", "デモが独自ドメイン等": "デモが独自ドメイン等", "3D・AR・PLATEAU": "3D・AR・PLATEAU",
             "機械学習・最適化・シミュレーション": "機械学習・最適化・シミュレーション", "1 人チーム": "1 人チーム"}
fig, ax = plt.subplots(figsize=(9, 3.8)); yp = np.arange(len(Rv))[::-1]
for yy, (_, r) in zip(yp, Rv.iterrows()):
    u = uni.loc[names_map[r["変数"]]]
    ax.hlines(yy + 0.16, u["CI下限"], u["CI上限"], color=ORANGE, lw=2); ax.scatter(u["オッズ比"], yy + 0.16, s=60, color=ORANGE, marker="s", edgecolor="white", linewidth=2, zorder=3)
    ax.hlines(yy - 0.16, r["CI下限"], r["CI上限"], color=BLUE, lw=2); ax.scatter(r["調整オッズ比"], yy - 0.16, s=60, color=BLUE, edgecolor="white", linewidth=2, zorder=3)
    ax.text(16, yy, f"調整後 {r['調整オッズ比']:.2f}（p={r['p値']:.3f}）", va="center", fontsize=9, color=INK, clip_on=False)
ax.scatter([], [], s=60, color=ORANGE, marker="s", label="単独で見たオッズ比"); ax.scatter([], [], s=60, color=BLUE, label="他の 4 つを調整したオッズ比")
ax.axvline(1, color="#8a8a8a", lw=1); ax.set_xscale("log"); ax.set_xlim(0.3, 13); ax.set_xticks([0.5, 1, 2, 4, 10]); ax.set_xticklabels(["0.5", "1", "2", "4", "10"])
ax.set_yticks(yp); ax.set_yticklabels(Rv["変数"], color=INK); ax.set_xlabel("オッズ比（対数目盛）と 95% 信頼区間", color=MUTED)
fig.suptitle("図 7　ロジスティック回帰：互いの影響を除いたオッズ比", x=0.01, ha="left", color=INK, fontsize=12)
ax.legend(loc="lower left", bbox_to_anchor=(0, 1.0), ncol=2, frameon=False, fontsize=9); style(ax)
fig.subplots_adjust(left=0.33, right=0.76, bottom=0.15, top=0.8); save(fig, "fig07_logistic"); plt.show()
'''

FIG_SCORE = '''
# 図 8: 勝ち筋の特徴を持つ個数と通過率
fig, ax = plt.subplots(figsize=(7.5, 4.2))
rate = tab["ファイナリスト"] / tab["作品数"] * 100
ax.bar([f"{k} 個" for k in tab.index], rate, color=BLUE, width=0.6)
for i, (k, r) in enumerate(tab.iterrows()):
    ax.text(i, max(rate.iloc[i], nF / len(df) * 100) + 0.8, f"{rate.iloc[i]:.1f}%（{int(r['ファイナリスト'])}/{int(r['作品数'])} 件）", ha="center", fontsize=9, color=INK)
ax.axhline(nF / len(df) * 100, color=INK, lw=1, ls="--"); ax.text(2.5, nF / len(df) * 100 + 0.8, "全体平均 4.9%", fontsize=9, color=INK, ha="center")
ax.set_ylim(0, 46); ax.set_ylabel("通過率（%）", color=MUTED)
ax.set_xlabel("4 つの特徴（データの結合・独自ドメイン・3D・最適化やシミュレーション）のうち当てはまる数", color=MUTED)
ax.set_title("図 8　勝ち筋の特徴を重ねて持つほど通過率が上がる（p 値は過大評価。本文参照）", loc="left", color=INK, fontsize=11)
style(ax, "y"); fig.tight_layout(); save(fig, "fig08_score_trend"); plt.show()
'''

FIG_MANUAL = '''
# 図 9: 手動コーディング（48 件）での割合
fig, ax = plt.subplots(figsize=(9, 4.4)); yp = np.arange(len(Tm))[::-1]
fa = Tm["ファイナリスト"].str.split("/").str[0].astype(int) / 24 * 100; ca = Tm["対照群"].str.split("/").str[0].astype(int) / 24 * 100
ax.hlines(yp, ca, fa, color="#c9c9c9", lw=2, zorder=1)
ax.scatter(ca, yp, s=70, color=ORANGE, edgecolor="white", linewidth=2, zorder=3, label="対照群（非ファイナリストから無作為 24 件）")
ax.scatter(fa, yp, s=70, color=BLUE, edgecolor="white", linewidth=2, zorder=3, label="ファイナリスト（24 件）")
for yy, (_, r) in zip(yp, Tm.iterrows()):
    ax.text(104, yy, f"オッズ比 {r['オッズ比']:.2f}（p={r['p値']:.3f}）", va="center", fontsize=9, color=INK, clip_on=False)
ax.set_yticks(yp); ax.set_yticklabels(Tm["特徴"], color=INK); ax.set_xlim(0, 100); ax.set_xlabel("その特徴を持つ作品の割合（%）", color=MUTED)
fig.suptitle("図 9　本文を読んで手で付けた特徴での比較", x=0.01, ha="left", color=INK, fontsize=12)
ax.legend(loc="lower left", bbox_to_anchor=(0, 1.0), ncol=2, frameon=False, fontsize=9); style(ax)
fig.subplots_adjust(left=0.27, right=0.78, bottom=0.13, top=0.83); save(fig, "fig09_manual_coding"); plt.show()
'''

FIG_MOCK = '''
# 図 10: デモ（モック）の確認結果と、機械付与と手動付与の一致率
mk = pd.read_csv("data/mock_summary.csv", dtype={"id": str})
items = [("デモ URL あり", mk["status"] != "デモURLなし"), ("開いて動く", mk["status"] == "動く"), ("5 秒で用途が分かる", mk["clear_in_5s"].str.startswith("はい")),
         ("実用レベル", mk["maturity"] == "実用レベル"), ("独自ドメイン", mk["note"].str.contains("独自ドメイン")), ("リンク切れ・資料のみ", mk["status"].str.startswith(("リンク切れ", "資料")))]
rows_m = []
fig, (a1, a2) = plt.subplots(1, 2, figsize=(12, 4.6), gridspec_kw={"width_ratios": [1.25, 1]})
x = np.arange(len(items)); w = 0.38
for k, (grp, color, name) in enumerate([("finalist", BLUE, "ファイナリスト（24 件）"), ("control", ORANGE, "対照群（24 件）")]):
    v = [int(cond[mk["group"] == grp].sum()) for _, cond in items]
    a1.bar(x + (k - 0.5) * (w + 0.03), v, w, color=color, label=name)
    for xi, vi in zip(x, v):
        a1.text(xi + (k - 0.5) * (w + 0.03), vi + 0.4, str(vi), ha="center", fontsize=9, color=INK)
for label, cond in items:
    a_, c_ = int(cond[mk["group"] == "finalist"].sum()), int(cond[mk["group"] == "control"].sum())
    rows_m.append(dict(項目=label, ファイナリスト=f"{a_}/24", 対照群=f"{c_}/24", p値=round(stats.fisher_exact([[a_, 24 - a_], [c_, 24 - c_]])[1], 3)))
a1.set_xticks(x); a1.set_xticklabels(["デモ URL"+NL+"あり", "開いて"+NL+"動く", "5 秒で用途"+NL+"が分かる", "実用"+NL+"レベル", "独自"+NL+"ドメイン", "リンク切れ・"+NL+"資料のみ"], fontsize=9); a1.set_ylim(0, 27); a1.set_ylabel("件数（各 24 件中）", color=MUTED)
a1.set_title("デモの確認結果", loc="left", fontsize=10, color=INK); a1.legend(frameon=False, fontsize=9, loc="upper right"); style(a1, "y")
ag = pd.read_json("data/agreement.json").T
lab = {"theme_primary": "主テーマ", "user_specific": "特定の対象者", "user_gov": "行政職員向け", "problem_specificity": "課題の具体性", "data_use_level": "データの使い方",
       "ai_in_product": "AI が機能として動く", "tech_map": "地図・GIS", "sol_ゲーム化・体験": "ゲーム化・体験"}
ag = ag.assign(rate=ag["all_rate"].astype(float) * 100, name=[lab[i] for i in ag.index]).sort_values("rate")
a2.barh(ag["name"], ag["rate"], color=BLUE, height=0.6)
for i, (_, r) in enumerate(ag.iterrows()):
    a2.text(r["rate"] + 1, i, f"{r['rate']:.0f}%（{r['all']}）", va="center", fontsize=9, color=INK)
a2.set_xlim(0, 125); a2.set_xticks([0, 25, 50, 75, 100]); a2.set_xlabel("機械付与と手動付与の一致率（%）", color=MUTED)
a2.set_title("コーディングの一致率（48 件）", loc="left", fontsize=10, color=INK); style(a2)
fig.suptitle("図 10　デモの確認結果と、特徴量の付与の精度", x=0.01, ha="left", color=INK, fontsize=12)
fig.tight_layout(rect=(0, 0, 1, 0.93)); save(fig, "fig10_mock_agreement"); plt.show()
Tk = pd.DataFrame(rows_m); Tk.to_csv("data/hypothesis_tests_mock.csv", index=False, encoding="utf-8-sig"); Tk
'''
