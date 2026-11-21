"""プロダクトバックログ.md の「完了日」から、バーンダウンチャート（バーンダウン.png）を描き直す。

使い方（app/planning/scripts で）：python burndown.py
  引数なし：../プロダクトバックログ.md を読み、../バーンダウン.png に書く。今日の日付で描く
  python burndown.py <md> <png> <今日 YYYY-MM-DD> と指定もできる
要るもの：Python と matplotlib（pip install matplotlib）
"""
import io, os, sys
from datetime import date, timedelta
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as md

here = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "..", "プロダクトバックログ.md")
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(here, "..", "バーンダウン.png")
today = date.fromisoformat(sys.argv[3]) if len(sys.argv) > 3 else date.today()
rows = []
head = None
for line in io.open(src, encoding="utf-8"):
    if not line.startswith("|"):
        head = None
        continue
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    if cells[0] == "タイトル":
        head = cells
    elif head and not set(cells[0]) <= set("- "):
        rows.append(dict(zip(head, cells)))
total = len(rows)
# 始まり（リポジトリを作った日）・理想の線の終わり・本応募の締切
start, end, submit = date(2026, 11, 14), date(2026, 12, 27), date(2026, 12, 27)
doneby = [date(2026, *map(int, r["完了日"].split("/"))) for r in rows if r.get("完了日")]
undated = [r["タイトル"] for r in rows if r["状態"] == "完了" and not r.get("完了日")]

doneby += [today] * len(undated)
days = [start + timedelta(d) for d in range((today - start).days + 1)]
actual = [total - sum(1 for d in doneby if d <= x) for x in days]

plt.rcParams["font.family"] = ["Meiryo", "Yu Gothic", "sans-serif"]
INK, MUTED, GRID, ACC = "#1F2328", "#6B7280", "#E5E7EB", "#004E64"
fig, ax = plt.subplots(figsize=(11, 5.6), dpi=150)
fig.patch.set_facecolor("white")

ax.plot([start, end], [total, 0], color="#9CA3AF", lw=2, ls=(0, (5, 4)), zorder=2)
ax.plot(days, actual, color=ACC, lw=2.5, marker="o", ms=5, zorder=3,
        markeredgecolor="white", markeredgewidth=1.5)

ax.annotate(f"残り {actual[-1]}件（今日 {today.month}/{today.day}）", (today, actual[-1]), xytext=(10, 8),
            textcoords="offset points", color=INK, fontsize=11, fontweight="bold")
ideal_today = total * (1 - (today - start).days / (end - start).days)
ax.annotate(f"理想なら残り {ideal_today:.0f}件", (today, ideal_today), xytext=(10, 6),
            textcoords="offset points", color=MUTED, fontsize=10)
ax.text(date(2026, 12, 1), total * 0.07, "理想の線（12/27 の本応募で 0）", color=MUTED, fontsize=10)

for d, label in [(date(2026, 11, 15), "11/15 概要エントリー"), (submit, "12/27 本応募")]:
    ax.axvline(d, color=GRID, lw=1.2, zorder=1)
    ax.text(d, total + 1.2, label, ha="right" if d == submit else "center", color=MUTED, fontsize=9)

ax.set_xlim(start - timedelta(0.5), submit + timedelta(0.5))
ax.set_ylim(0, total + 3)
ax.xaxis.set_major_locator(md.DayLocator(interval=4))
ax.xaxis.set_major_formatter(md.DateFormatter("%m/%d"))
ax.set_ylabel("残りの項目（件）", color=MUTED)
ax.grid(axis="y", color=GRID, lw=0.8)
for s in ("top", "right"):
    ax.spines[s].set_visible(False)
for s in ("left", "bottom"):
    ax.spines[s].set_color(GRID)
ax.tick_params(colors=MUTED, labelsize=9)
ax.set_title(f"Politica バーンダウン（バックログ {total}件、件数ベース）", loc="left",
             color=INK, fontsize=14, fontweight="bold", pad=24)
fig.text(0.01, 0.01, f"出典：app/planning/プロダクトバックログ.md の完了日。項目の大きさは区別していない。完了日が空の完了 {len(undated)}件は描いた日に終えたものとして数えた", color=MUTED, fontsize=8)
fig.tight_layout(rect=(0, 0.04, 1, 1))
fig.savefig(out)
print(total, actual[-1], round(ideal_today, 1), undated)
