# 2026_UrbanDataChallenge — アーバンデータチャレンジ2026

チーム開発リポジトリ。オープンデータを使って地域の課題を解く作品のコンテスト「[アーバンデータチャレンジ2026](https://urbandata-challenge.jp/udc2026_entry)」（UDC2026）向け。

**作品のタイプ：アプリケーション／作品のテーマ：教育・政治**
概要・日程・審査基準は [`docs/contest.md`](docs/contest.md)。

---

## 作っているもの：Politica（ポリティカ）

**未成年の、選挙権をまだ持たない人をターゲットにして、政治への参画を目指すアプリケーションを作る。**

（中身はアイデア出しのあとに書く。アイデアは [`idea/`](idea/README.md)）

## いまの予定（2026-11-14 時点）

| 日付 | やること |
|---|---|
| **11/15（日）23:59** | **作品概要エントリーの締切**（[応募フォーム](https://forms.gle/tTcc9dGwGGtA4NoAA)） |
| 11月末 | 事務局から、概要エントリーの代表者に作品本応募の案内が届く |
| **12/27（日）23:59** | **作品本応募・作品提出の締切** |
| 2027/2/20（土） | 最終審査会（ファイナルシンポジウム、東京大学駒場リサーチキャンパスの予定。オンライン登壇も可） |

## どこを見ればいいか

| 知りたいこと | 場所 |
|---|---|
| コンテストの概要・日程・審査基準 | [docs/contest.md](docs/contest.md) |
| やることと進み具合 | [プロダクトバックログ](app/planning/プロダクトバックログ.md)（ここだけで管理する） |
| 会議の決定と議事録 | [meeting/README.md](meeting/README.md)（一覧） |
| アイデア | [idea/README.md](idea/README.md) |
| 分析・調査 | [analysis/README.md](analysis/README.md)、[survey/README.md](survey/README.md) |
| アプリの起動・コマンド | [app/README.md](app/README.md) |
| チームのスキル | [skills/README.md](skills/README.md) |

---

## 体制

| メンバー | 役割 | 主な担当 |
|---|---|---|
| 秋元 | （決まったら書く） | |
| 河村 | （決まったら書く） | |
| 兒玉 | （決まったら書く） | |
| 玉澤 | （決まったら書く） | |
| 金久保（仮） | （決まったら書く） | |

---

## 📁 ディレクトリ構成

```
2026_UrbanDataChallenge/
├─ README.md     ← いまここ
├─ docs/         資料（contest.md＝コンテストの概要、体制図、アピール資料）
├─ meeting/      🗒 会議（1会議＝1フォルダ `YYYYMMDD_会議名/`。議事録・アジェンダ・質問案）
├─ idea/         💡 アイデア置き場（メンバー5人のフォルダ。1案＝1フォルダ）
├─ analysis/     📊 定量分析（メンバーごとのサブフォルダ）
├─ survey/       🔍 一次資料・既存サービスの調査（主権者教育・若者の政治参加など）
├─ app/          🛠 本実装
│  ├─ src/           ソースコード
│  ├─ design-drafts/ 設計書
│  ├─ planning/      バックログ・バーンダウン・ガントチャート
│  └─ ui-import/     デザインのモック
└─ skills/       🧰 チームのスキル（design／dev／analysis／research／meeting／product／review／presentation）
```

- ブランチ：開発は `develop`、提出する版と資料は `main`
- 使うオープンデータは、データ提供者の利用規約を確かめてから入れる。出典（URL・取得日）を必ず残す
