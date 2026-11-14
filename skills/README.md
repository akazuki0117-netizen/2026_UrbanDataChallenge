# skills/ — チームのスキル置き場

作業の手順・観点・型を「スキル」としてまとめておく場所。

| フォルダ | 用途 | 入れるスキルの例 |
|---|---|---|
| [`design/`](design/README.md)（デザイン用） | 画面の方針と、デザインのレビュー | 中高生向けUIの観点（タップ数・文字・スクロールなしで見える）、配色・警戒色のルール、Figma に貼るボードの作り方、デザイン提案30〜50件の出し方 |
| [`dev/`](dev/README.md)（開発用） | 実装とコミット前の確認 | コミット前の検査（自動テスト）、ローカルでの起動、ブランチ・PR・マージの手順、コードの書き方の約束 |
| [`analysis/`](analysis/README.md)（分析用） | 定量分析の進め方 | `ANALYSIS_LOG.md`・`分析方針.md` の書き方、統計書・オープンデータの取り込み、出典の残し方、仮説を検証する手順 |
| [`research/`](research/README.md)（調査用） | 一次資料の集め方 | 市・県の資料や議会会議録の収集、既存アプリ・競合（政治・主権者教育のアプリやサービス）の調査、資料カタログへの登録 |
| [`meeting/`](meeting/README.md)（会議用） | 会議の前後 | アジェンダ・進行表（判定シート付き）、議事録（トランスクリプトや OneNote から）、レビュー資料（概要・操作概要・スイムレーン） |
| [`product/`](product/README.md)（企画用） | 何を作るかを決める | ペルソナ・ユースケース・「なぜ必要か」の整理、企画書テンプレート、ユースケース図・業務フロー |
| [`review/`](review/README.md)（レビュー用） | 横断的な見直し | アプリ全体の不備・改善を30〜50件洗い出す、残課題リストへの登録・優先度づけ |
| [`presentation/`](presentation/README.md)（発表用） | 外に見せるもの | 発表スライド、デモの台本、提出物のチェックリスト |

## いまあるスキル

| スキル | 分類 | いつ使うか |
|---|---|---|
| [`meeting/gijiroku/`](meeting/gijiroku/SKILL.md) | 会議 | 議事録を `meeting/` の形式で書く（OneNote・トランスクリプトから） |
| [`meeting/agenda/`](meeting/agenda/SKILL.md) | 会議 | アジェンダ・進行表を、判定シート（入力フォーム）つきの HTML で作る |
| [`product/persona-usecase/`](product/persona-usecase/SKILL.md) | 企画 | ペルソナ → 場面 → ユースケース → 機能ごとの「なぜ必要か」を整理する |
| [`product/backlog-update/`](product/backlog-update/SKILL.md) | 企画 | チャットや報告から `app/planning/プロダクトバックログ.md` を更新し、バーンダウンを描き直す |
| `product/` のアイデア出し9本（外部から取得） | 企画 | ユニークな案を出す・発想を広げる。一覧は [`product/README.md`](product/README.md) |

## 置き方

- **1スキル＝1フォルダ**：`skills/<分類>/<スキル名>/SKILL.md`（必要なら同じフォルダに `scripts/`・`templates/` などを置く）
- `SKILL.md` の先頭に、`name`（スキル名）と `description`（いつ使うか）を書く
- **`skills/` は自分たちで作ったスキルの置き場**。Claude に使わせるときは「`skills/meeting/gijiroku/SKILL.md` を読んで議事録を作って」のようにパスを示す
- 新しいスキルを足したら、分類フォルダの README の一覧に1行足す
