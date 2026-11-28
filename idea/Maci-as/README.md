# Politica アプリ企画・モック

[企画書 APP_IDEAS.md](APP_IDEAS.md) に10案の詳細、対応課題、勝ち筋、ペルソナ、利用の流れ、公開データの出典を掲載しています。

## モックの起動

ブラウザで `mock/index.html` を開き、メニューでアプリ案を選びます。選択式の2問と、自由記述のどちらでも分析結果の見本を確認できます。「入力例を入れる」で案ごとの例文が入ります。

モックはサンプルデータを使用します。選択式は用意した結果、自由記述は文字列の一致で選んだ結果を表示します。生成AI APIと実データ自動取得は未接続です。

| # | アプリ案 | モック |
|---|---|---|
| 1 | 返事の地図 | [開く](mock/index.html#idea-1) |
| 2 | 校則の変更履歴 | [開く](mock/index.html#idea-2) |
| 3 | まちの予算ドラフト | [開く](mock/index.html#idea-3) |
| 4 | 同じ発言、逆の印象 | [開く](mock/index.html#idea-4) |
| 5 | 初投票の逆算カレンダー | [開く](mock/index.html#idea-5) |
| 6 | 公報の余白 | [開く](mock/index.html#idea-6) |
| 7 | 15分の議会授業 | [開く](mock/index.html#idea-7) |
| 8 | まだ決めてない会議 | [開く](mock/index.html#idea-8) |
| 9 | 誰に入れたか聞かないカード | [開く](mock/index.html#idea-9) |
| 10 | 選挙のない日の参加ナビ | [開く](mock/index.html#idea-10) |

## ファイル構成

- `APP_IDEAS.md` — 企画書
- `mock/index.html` — 起動ページ
- `mock/styles.css` — 共通スタイル
- `mock/app.js` — 企画の切り替えと基本情報
- `mock/analysis.js` — 選択式と自由記述の分析画面、サンプルデータ、出典

各案の冒頭にペルソナ別の利用シーンがあります。画面の下部では選択式と自由記述の分析を試せます。

- `mock/scenes.js` — 各案の利用シーンと専用操作
