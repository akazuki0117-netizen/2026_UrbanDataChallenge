# progress（2026-11-21 更新）

- 現在の Phase: **全 Phase 完了**（任意の「過去年度との比較」は未実施）
- 完了件数: 一覧 486 / 486、詳細 486 / 486（failed.txt は空）、モック確認 48 / 48（ファイナリスト 24＋対照群 24）
- 成果物: `reports/勝てるアプリ分析_2026.md`、`reports/付録_全作品一覧.md`、`analysis.ipynb`（仮説検定と図。結果はレポート §4.6）、`reports/figures/`（図 10 枚）、`README.md`
- 次にやること（やる場合）:
  - First Stage の 2 分プレゼン動画を、ファイナリスト分だけでも視聴・文字起こしして構成を比べる（`data/video_streams.json` に配信 11 本と頭出し位置あり）
  - 過去年度（`/collection/2025/` 〜 `/collection/2021/`）のファイナリストで同じ手順を簡易に行う
  - 機械付与の精度が低い 3 項目（テーマ・課題の具体性・データの使い方）を、人が全件読んで付け直す
- 再実行の方法: `scripts/` で `phase1_list.py` → `phase2_details.py` → `phase4_features.py` → `phase3_4_manual.py` → `phase5_analysis.py`。ノートブックは hakkason_app_analyse/ で `python scripts/build_notebook.py`
- 未解決の問題: なし
- 注意: `data/raw_payload/` は詳細ページの生データで、メンバー氏名を含む。共有・コミットする場合は扱いを決めること
