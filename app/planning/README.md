# planning/ — 計画と進み具合

> **位置づけ**：作品本応募（12/27）までの日程と、やることの一覧・進み具合を置く場所。

| ファイル | 中身 | 直し方 |
|---|---|---|
| [`プロダクトバックログ.md`](プロダクトバックログ.md) | 機能開発・UI・分析のやることと、担当・状態・完了日（バーンダウンも載せる） | 各自が自分の担当の行を直す。まとめて直すときは [`skills/product/backlog-update/`](../../skills/product/backlog-update/SKILL.md) |
| `バーンダウン.png` | 残りの件数の推移 | `scripts/burndown.py` で描き直す（下） |
| `scripts/burndown.py` | バックログの「完了日」からバーンダウンを描くスクリプト | — |

## バーンダウンの描き直し方

```bash
cd app/planning/scripts
python burndown.py
```

- 要るもの：Python と matplotlib（`pip install matplotlib`）
- 今日の日付で描く。日付を指定するときは `python burndown.py ../プロダクトバックログ.md ../バーンダウン.png 2026-11-20`
- 数えるのはバックログの全行。完了日が空の「完了」は、描いた日に終えたものとして数える
- 理想の線は 11/14 から 12/27（本応募の締切）で 0
