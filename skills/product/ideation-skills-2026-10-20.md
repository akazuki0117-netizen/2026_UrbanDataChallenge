# アイデア出し用スキルまとめ（2026-10-20）

アイデアコンテスト向けに、Web で調べたスキルの一覧。検索結果とページ説明が根拠で、リポジトリの中身は未確認。入れる前に SKILL.md を読むこと。Codex 用の手順は推定。

## 1. 用途別のおすすめ

| 用途 | スキル | 特徴 |
|---|---|---|
| 最初の1本 | Superpowers の brainstorming（obra/superpowers） | 質問を重ねて課題を絞り込む。2〜3案をトレードオフ付きで出し、設計書にする |
| ユニークさ重視 | **generative-thinking**（oaustegard） | 発想の型（リフレーミング、ランダム刺激、SCAMPER、逆転）を1回に1つ実行し、ありがちな案を落とす |
| 発想法を広く | Creative Director（nexu-io/open-design） | SCAMPER、TRIZ など20以上の手法を使い、案を採点する |
| 偶然の刺激 | oblique-skill（jakedahn） | ランダムな発想カードを4枚引いて、1枚を課題に当てはめる |
| 水平思考 | Lateral Think（MauroProto） | ド・ボノの水平思考。前提を疑い、視点を変える |
| 手法の選択も任せる | ideation（NousResearch/hermes-agent） | 状況に応じて SCAMPER や Oblique Strategies を選ぶ |
| 行き詰まり | jwynia の brainstorming | 診断用の質問で、詰まっている原因を特定する |
| チームの発想会 | BMAD brainstorming | 3モード。質問だけをするファシリテーター専用モードもある |
| 調査寄り | Brainstorming Research Ideas（orchestra-research） | 10種類のフレームワークを使う |
| ルーター型 | thought patterns（markpitt） | 発散、水平、連想、類推のパターンに振り分ける。単体では弱め |

「ユニーク」を狙うなら generative-thinking が最有力。2024年の CHI の研究では、AI が例を出すと人の発想が固定され、独創性が下がるとされている。このスキルは具体例を出さず、抽象的な問いを投げる作り。

## 2. 導入方法

| スキル | Claude Code | Codex（推定） |
|---|---|---|
| generative-thinking | `npx skills add oaustegard/claude-skills --skill generative-thinking --agent claude-code` | 同じコマンドの `--agent` を `codex` にする |
| ideation | `npx skills add nousresearch/hermes-agent --skill ideation --agent claude-code` | 同じコマンドの `--agent` を `codex` にする |
| oblique-skill | `/plugin marketplace add jakedahn/oblique-skill`、続けて `/plugin install oblique-skills@jakedahn/oblique-skill` | プラグイン形式のため入らない。`skills/oblique/SKILL.md` だけをコピーし、コマンドは使えない |
| Lateral Think | SKILL.md を `%USERPROFILE%\.claude\skills\lateral-think\` に置き、再起動 | SKILL.md を Codex のスキル置き場に置く |
| Superpowers | `/plugin marketplace add obra/superpowers-marketplace`、続けて `/plugin install superpowers@superpowers-marketplace` | 未確認 |
| thought patterns | 導入手順が見つからなかった | 同じ |
| Creative Director、BMAD、jwynia、研究系 | claudemarketplaces.com の各ページに導入コマンドがある（未取得） | 未確認 |

置き場所:

- `npx skills add` は、実行したフォルダの `.claude/skills/` に入る。全プロジェクトで使うなら `~/.claude/skills/` に置く。
- Codex の置き場は、個人用が `~/.codex/skills/<スキル名>/`、プロジェクト用が `.codex/skills/` または `.agents/skills/`（版によって違う可能性がある）。
- `--agent codex` が通るかは `npx skills add --help` で確かめる。

## 3. このリポジトリにある現物

2026-10-20 に9本を `skills/product/` に取得済み（Creative Director と Scientific Brainstorming は該当の SKILL.md が見つからず未取得）。取得元・コミット・ライセンスは各フォルダの `SOURCE.md`。上の導入コマンドを使わなくても、「`skills/product/generative-thinking/SKILL.md` を読んで案を出して」のようにパスを示せば使える（`skills/README.md` の置き方）。

## 4. 利用の注意点

2026-10-20 に、指示文の検索と実行コードの読みで安全性を確認した。悪意のある記述は見つからなかった。数の多い Markdown（手法集など）は全文を読んでいない。

1. **Superpowers の brainstorming はローカルでサーバを立てる**（`brainstorming/scripts/`）。
   - `127.0.0.1` に限定し、セッションごとの秘密キーで認証する。ブラウザで開くのは、ユーザーが承認したときだけ。
   - `--host 0.0.0.0` は付けない（ネットワークに公開される）。
   - 一時ファイルは `/tmp/brainstorm` に置かれる。
2. **同じサーバが、ロゴ画像を `primeradiant.com` から読み込む。** 画面を開くと、ブラウザがバージョン情報つきで取りにいく。画面を使うなら先に `DISABLE_TELEMETRY=1` を設定する。
3. **bmad-brainstorming は、`bmad` が未導入だと `npx skills add bmad-code-org/BMAD-METHOD --skill bmad` の導入を提案する。** 提案に従うかはそのとき判断し、うのみにして実行しない。
4. **oblique は `allowed-tools: Bash` を要求し、`scripts/pick-strategies.sh` を実行する。** 中身はランダムに文言を選んで表示するだけ。Windows では Git Bash で動かす。
5. **jwynia-brainstorming は Deno で `constraint-entropy.ts` を動かす（`--allow-read`、読み取りのみ）。** Deno が無ければ使わなくてよい。
6. **ライセンス**：jwynia-brainstorming と thought-patterns は LICENSE が見つからない。チームの外に出す前に確認する。
7. **外から取ったものは、更新で中身が変わりうる。** 取得したコミットは `SOURCE.md` に書いてある。新しい版に差し替えるときは、もう一度中身を読む。
8. **AI の案は発想を固定しやすい**（CHI 2024）。AI に例を出させる前に、まず自分たちで問いを立てる。

## 5. 次の一手

- まず generative-thinking を使い、観光テーマで試す。
- 課題の絞り込みには Superpowers の brainstorming を組み合わせる。
- 観光向けに型を絞った専用スキルを自作する手もある。

## Sources

- [generative-thinking（openskillindex）](https://openskillindex.com/skills/oaustegard-claude-skills-generative-thinking)
- [generative-thinking リリースノート](https://newreleases.io/project/github/oaustegard/claude-skills/release/generative-thinking-v0.3.0)
- [oblique-skill README](https://cdn.jsdelivr.net/gh/jakedahn/oblique-skill@main/README.md)
- [Lateral Think](https://claudskills.com/skills/lateral-think/)
- [ideation（hermes-agent）](https://claudeskills.info/skills/nousresearch/hermes-agent/ideation/)
- [thought patterns](https://skillselion.com/skills/markpitt/claude-skills/thought-patterns)
- [Creative Director](https://claudemarketplaces.com/skills/nexu-io/open-design/creative-director)
- [jwynia brainstorming](https://claudemarketplaces.com/skills/jwynia/agent-skills/brainstorming)
- [BMAD brainstorming](https://claudemarketplaces.com/skills/bmad-code-org/bmad-method/bmad-brainstorming)
- [Brainstorming Research Ideas](https://claudemarketplaces.com/skills/orchestra-research/ai-research-skills/brainstorming-research-ideas)
- [Superpowers deep dive](https://www.heyuan110.com/posts/ai/2026-02-01-superpowers-deep-dive/)
