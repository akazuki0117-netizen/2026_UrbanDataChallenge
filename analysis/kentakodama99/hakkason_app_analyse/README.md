# hakkason_app_analyse — ハッカソンで「勝てるアプリ／勝てないアプリ」の分析

東京都「都知事杯オープンデータ・ハッカソン 2026」の全提出作品 486 件を集め、ファイナリスト 24 件とそれ以外を比べた分析。取得日は 2026-11-21。

**まず読むもの**：[`reports/勝てるアプリ分析_2026.md`](reports/勝てるアプリ分析_2026.md)（結論は先頭の 1 画面）

## フォルダとファイル

| 場所 | 中身 |
|---|---|
| [`reports/`](reports/) | 人が読む成果物 |
| 　[`勝てるアプリ分析_2026.md`](reports/勝てるアプリ分析_2026.md) | 分析レポート本体。結論・比較表・仮説検定・事例・チェックリスト |
| 　[`付録_全作品一覧.md`](reports/付録_全作品一覧.md) | 全 486 作品の一覧（ID・作品名・ファイナリスト有無・主な特徴） |
| 　[`figures/`](reports/figures/) | 図（PNG）。`fig01`〜`fig10`。ノートブックを実行すると上書き保存される |
| [`analysis.ipynb`](analysis.ipynb) | 定量分析のノートブック（実行済み）。仮説検定と図。直接は編集せず、`scripts/build_notebook.py` を直して作り直す |
| [`codebook.md`](codebook.md) | 分類基準。作品にどういう基準で特徴を付けたか |
| [`data/`](data/) | 集めたデータと、そこから作ったデータ（下の表） |
| [`scripts/`](scripts/) | 取得・特徴量化・集計・図のスクリプト（下の表） |
| [`ANALYSIS_LOG.md`](ANALYSIS_LOG.md) | 作業の記録。何をして、どう判断したか。新しいものが上 |
| [`progress.md`](progress.md) | 進み具合と、次にやること。中断したらここから再開する |
| [`PROMPT.md`](PROMPT.md) | この分析を Claude Code に頼んだときの指示文 |

## `data/` の中身

「生データ」は取得したままのもので、書き換えない。「加工」はスクリプトで作り直せる。

| ファイル | 種類 | 中身 |
|---|---|---|
| `list_raw.jsonl` | 生データ | 一覧ページから取ったカード情報。3 巡分（1 行 1 件、追記のみ） |
| `details/{id}.json` | 生データ | 詳細ページの内容。1 作品 1 ファイル。サービス内容は原文のまま。メンバーは人数だけ |
| `raw_payload/{id}.txt.gz` | 生データ | 詳細ページの元データ。**メンバー氏名を含む**ので、共有・コミットの前に扱いを決める |
| `works_index.csv` | 加工 | 作品一覧（ID・作品名・チーム名・ファイナリスト・受賞・URL） |
| `finalist_crosscheck.json` | 加工 | ファイナリスト 24 件を 2 つの方法で照合した結果 |
| `failed.txt` | 記録 | 取得に失敗した ID（空＝失敗なし） |
| `features.csv` | 加工 | 全 486 作品の特徴量（62 列）。`codebook.md` の規則で機械的に付与 |
| `manual_coding.csv` | 手作業 | 48 件を本文を読んで手で付けた特徴と、機械付与との対比 |
| `agreement.json` | 加工 | 機械付与と手動付与の一致率 |
| `mock_targets.json` | 記録 | デモを確認した 48 件（ファイナリスト 24 件＋無作為に選んだ 24 件）と乱数シード |
| `mock/{id}.json`、`mock/{id}.png` | 手作業 | デモを開いて確認した結果と、最初の画面のスクリーンショット |
| `mock_summary.csv` | 加工 | デモ確認結果の一覧 |
| `video_streams.json` | 加工 | First Stage の配信 11 本と、各作品の頭出し位置 |
| `analysis_tables.md` | 加工 | 全項目の比較表（件数・割合・リフト） |
| `hypothesis_tests.csv` | 加工 | 16 個の仮説の検定結果（オッズ比・信頼区間・p 値・補正後の p 値） |
| `hypothesis_tests_numeric.csv` | 加工 | 数値の特徴の検定結果 |
| `hypothesis_tests_manual.csv` | 加工 | 手動で付けた特徴での検定結果 |
| `hypothesis_tests_mock.csv` | 加工 | デモ確認結果の検定結果 |
| `logistic_regression.csv` | 加工 | ロジスティック回帰の結果 |

## `scripts/` の中身

| ファイル | やること |
|---|---|
| `common.py` | 共通処理。サイトから 1.5 秒以上の間隔を空けて 1 件ずつ取る |
| `phase1_list.py` | 一覧ページを巡回して全作品の ID を集める |
| `phase2_details.py` | 全作品の詳細ページを取り、`data/details/` に保存する（取得済みは飛ばす） |
| `phase4_features.py` | `codebook.md` の規則で特徴量を付け、`data/features.csv` を作る |
| `phase3_4_manual.py` | デモ確認の結果と手動コーディングを保存し、一致率を出す（判定そのものはこのファイルに書いてある） |
| `phase5_analysis.py` | 比較表 `data/analysis_tables.md` を作る |
| `build_notebook.py` | `analysis.ipynb` を組み立てて実行し、検定結果と図を保存する |
| `nb_figure_cells.py` | ノートブックに入れる図のコード |

## やり直すとき

`hakkason_app_analyse/` で、上から順に実行する。Python 3 と numpy・pandas・scipy・matplotlib・nbformat・nbclient が要る。

```bash
cd scripts
python phase1_list.py        # 一覧（サイトにアクセスする。約 3 分）
python phase2_details.py     # 詳細（サイトにアクセスする。約 16 分。取得済みは飛ばす）
python phase4_features.py    # 特徴量
python phase3_4_manual.py    # デモ確認・手動コーディングの保存と一致率
python phase5_analysis.py    # 比較表
cd ..
python scripts/build_notebook.py   # ノートブックと図（約 2 分）
```

- 特徴量の規則を変えたら、`phase4_features.py` 以降を全部やり直す（一部だけ直さない）
- デモの確認（ブラウザで開いてスクリーンショットを撮る作業）はスクリプトになっていない。Playwright で手作業した
- サイトには負荷をかけない（間隔 1.5 秒以上、同時に複数取らない）

## 読むときの注意

- ファイナリストは 24 件だけなので、**統計的に言い切れることはほとんど無い**（多重比較の補正後に有意な仮説は 0）。レポートの「勝てる条件」は、数字と事例の読み込みが同じ向きを指している傾向として使う
- 分析したのは都知事杯オープンデータ・ハッカソンだけ。審査員や基準が違うコンテストで同じように効くかは確かめていない
- 詳しい限界はレポートの「11. 分析の限界」
