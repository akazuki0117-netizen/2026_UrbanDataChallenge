"""Phase 4: コードブック（codebook.md）の規則に従い、全作品へ同じ基準で特徴量を付与する。

入力: data/details/*.json   出力: data/features.csv
規則を変えたらこのスクリプトを再実行して全件を付け直す（部分更新はしない）。
"""
import csv
import glob
import json
import re
import sys
from urllib.parse import urlparse

from common import DATA

sys.stdout.reconfigure(encoding="utf-8")

# ---- テーマ領域（複数ラベル可。主テーマ = ヒット語数が最多のもの。同数なら上にあるもの） ----
THEMES = {
    "防災": r"防災|災害|避難|地震|震災|浸水|洪水|水害|ハザード|火災|帰宅困難|備蓄|津波|土砂",
    "福祉・介護": r"介護|高齢者|シニア|障害|障がい|車椅子|車いす|バリアフリー|福祉|認知症|見守り|ヤングケアラー|要配慮",
    "子育て": r"子育て|保育|育児|ベビーカー|乳幼児|親子|保護者|妊娠|妊婦|産後|ママ|パパ|子連れ",
    "教育": r"教育|学習|学校|授業|生徒|児童|探究|教材|教員|不登校|放課後|部活",
    "観光・おでかけ": r"観光|旅行|インバウンド|訪日|散歩|さんぽ|街歩き|まち歩き|おでかけ|お出かけ|文化財|巡り|めぐり",
    "交通・移動": r"交通|バス|鉄道|電車|駅|経路|ルート|自転車|渋滞|道路|GTFS|歩行|移動",
    "環境・暑さ": r"環境|脱炭素|CO2|ごみ|リサイクル|暑さ|熱中症|緑地|街路樹|生物|気候|エネルギー|省エネ|太陽光|涼|水道水",
    "健康・医療": r"医療|病院|健康|救急|AED|受診|診療|感染症|フレイル|メンタル|薬|発熱|健診|運動",
    "行政・政策": r"手続|申請|窓口|補助金|助成|支援制度|給付|行政職員|自治体職員|庁内|議会|政策|施策|予算|公共調達|EBPM",
    "まちづくり・住まい": r"まちづくり|都市計画|再開発|空き家|不動産|地価|住まい|引越|引っ越|商店街|公園|街路|建築|土地",
    "地域コミュニティ・共生": r"コミュニティ|町会|自治会|ボランティア|孤独|孤立|居場所|つながり|多文化|共生|外国人|やさしい日本語",
    "防犯・安全": r"防犯|犯罪|詐欺|交通事故|不審者|治安|クマ|熊|野生",
}

# ---- 想定ユーザー（複数可。どれも無ければ「都民一般」） ----
USERS = {
    "高齢者": r"高齢者|シニア|高齢の",
    "障害者": r"障害|障がい|車椅子|車いす|視覚|聴覚",
    "外国人": r"外国人|訪日|インバウンド|多言語|やさしい日本語|在留",
    "子育て世帯": r"子育て|保護者|ベビーカー|乳幼児|親子|育児|妊娠|妊婦|ママ|パパ|子連れ",
    "子ども・学生": r"小学生|中学生|高校生|大学生|学生|生徒|児童|若者|10代|子どもが|子どもたち",
    "行政職員": r"行政職員|自治体職員|職員|庁内|自治体が|行政が|自治体向け|行政向け|政策立案|養護教諭|救急隊",
    "事業者": r"事業者|店舗|商店|企業|中小|オーナー|運営者|事業主|農家",
}

# ---- 解決の形（複数可） ----
SOLUTIONS = {
    "情報提供・検索": r"検索|探せ|探す|確認でき|一覧|ナビ|案内|絞り込|まとめて|届ける|通知",
    "可視化・地図": r"可視化|地図|マップ|ダッシュボード|見える化|色分け|3D|三次元",
    "マッチング": r"マッチング|つなぐ|つなげ|結びつけ|募集",
    "意思決定支援": r"比較|シミュレ|診断|スコア|推定|予測|最適|判定|おすすめ|提案する|算出|試算",
    "ゲーム化・体験": r"ゲーム|クエスト|RPG|クイズ|スタンプ|バッジ|育成|探検|冒険|封印|キャラ|楽しみながら|疑似体験",
    "行動変容": r"行動を促|習慣|きっかけ|行動変容|促す|後押し|一歩",
    "基盤・API・行政業務": r"API|MCP|基盤|プラットフォーム|庁内|業務|事務|職員",
    "参加型・投稿": r"投稿|参加型|口コミ|市民が|都民参加|共有でき|レポート",
}

TECH = {
    "tech_map": r"地図|マップ|MapLibre|Leaflet|Mapbox|Google Maps|GIS|地理院|PMTiles|OpenStreetMap|deck\.gl",
    "tech_3d_ar": r"3D|三次元|\bAR\b|\bVR\b|PLATEAU|Cesium|Three\.js|デジタルツイン|点群",
    "tech_ml": r"機械学習|予測モデル|学習モデル|回帰|クラスタ|XGBoost|LightGBM|最適化|IDW|数理|シミュレーション|シミュレータ",
    "tech_native": r"Flutter|Swift|iOS|Android|React Native|ネイティブ|Expo|Kotlin",
    "tech_line": r"LINE",
    "tech_voice": r"音声|読み上げ|ボイス",
    "tech_cloudflare": r"Cloudflare|Workers",
}
# 生成 AI: プロダクトの機能として動いているか／開発工程で使っただけか
AI_ANY = r"生成AI|LLM|GPT|Claude|Gemini|Copilot|Codex|VLM|Vision AI|Workers AI|Qwen|GLM|OpenCode|Cursor|\bAI\b|AI"
AI_PRODUCT = (r"AIが|AIで[^開実コ]|AIによる|AIに(?!よる開発)|AIを組み合わせ|AI(要約|解析|診断|分析|チャット|エージェント|コンシェルジュ|アシスタント|相談|ナビ|都民|ペルソナ)|"
              r"VLM|Vision AI|Workers AI|Gemini API|OpenAI API|Claude API|LLM|RAG|MCP|画像解析|画像認識|対話型|チャットボット|"
              r"(要約|翻訳|生成|言語化|回答|解説|説明)(し|する|させ)[^。]{0,12}(AI|生成AI)|(AI|生成AI)[^。]{0,15}(要約|翻訳|言語化|回答|解説|説明する|提案|判定|抽出|生成する|生成し)")
AI_DEV = (r"Claude Code|Codex|Copilot|Cursor|OpenCode|Antigravity|Kiro|Devin|バイブコーディング|"
          r"(開発|実装|コード|デバッグ|壁打ち|設計|企画|要件|調査|整形|レビュー)[^。]{0,25}(活用|使用|利用|用い|併用|補助|行っ)|で開発")

PROBLEM_MARK = r"課題に対応|課題に対し|課題意識|という課題|に着目|という問題|課題を解決"
NUM_EVIDENCE = r"[0-9０-９][0-9０-９,，\.]*\s*(%|％|人|件|万|割|倍|時間|日|円|台|本|施設|か所|箇所|地点|分|億|兆|世帯|校|体|種|年分|km)"
POLICY = r"都の|東京都の(施策|計画|戦略|事業|取組)|2050|条例|未来の東京|ビジョン|国の|制度|施策|政策|ガイドライン|法|行政計画|提言"
SUSTAIN = r"運用|持続|収益|ビジネスモデル|有償|横展開|他地域|他自治体|導入|連携|実証|展開を見据|拡張|継続|マネタイズ|無料"
COMBINE = r"掛け合わせ|組み合わせ|重ね|統合|結合|独自|スコア化|スコアで|指数|指標|Index|推定|算出|予測|最適|試算|シミュレ"
PROCESS = r"集計|解析|分析|変換|構造化|抽出|分類|言語化|整形|可視化|色分け"
STUDENT = r"学生|大学|高校|高専|中学|ゼミ|研究室|University|Univ|塾|KEIO|高等学校|学園"

NATIONAL = re.compile(r"(\.go\.jp|e-stat|plateau|geospatial\.jp|gsi\.go|mlit)")
OSM_PRIVATE = re.compile(r"(openstreetmap|mapillary|odpt|overpass|open-meteo|google|wikipedia|wikidata)")
TOKYO_ANY = re.compile(r"metro\.tokyo")


def host_type(u):
    if not u:
        return "なし"
    h = urlparse(u).netloc.lower()
    for key, name in [("tokyo-odh", "大会提供Workers"), ("workers.dev", "Cloudflare"), ("pages.dev", "Cloudflare"),
                      ("vercel.app", "Vercel"), ("netlify", "Netlify"), ("github.io", "GitHub Pages"),
                      ("github.com", "GitHubリポジトリ"), ("drive.google", "Googleドライブ"), ("docs.google", "Googleドキュメント"),
                      ("youtu", "YouTube"), ("run.app", "Cloud Run"), ("web.app", "Firebase"), ("firebaseapp", "Firebase"),
                      ("streamlit", "Streamlit"), ("hf.space", "HuggingFace"), ("apps.apple", "アプリストア"),
                      ("play.google", "アプリストア"), ("canva", "Canva等資料"), ("figma", "Figma"), ("surge.sh", "その他静的ホスト"),
                      ("onrender", "Render"), ("azure", "Azure"), ("amazonaws", "AWS"), ("cloudfront", "AWS"), ("glide", "ノーコード"),
                      ("bubble", "ノーコード"), ("replit", "Replit"), ("lovable", "AIビルダー"), ("v0.", "AIビルダー")]:
        if key in h:
            return name
    return "独自ドメイン・その他"


def hits(pat, text):
    return len(re.findall(pat, text))


def code(d):
    desc = d.get("service_description") or ""
    text = (d.get("title") or "") + "。" + desc
    f = {"id": d["id"], "title": d["title"], "team": d["team"], "is_finalist": int(d["is_finalist"]),
         "awards": "・".join(d.get("awards") or [])}
    # テーマ
    th = {k: hits(p, text) for k, p in THEMES.items()}
    labels = [k for k, v in th.items() if v]
    f["theme_primary"] = max(th, key=lambda k: th[k]) if labels else "その他"
    f["theme_all"] = "|".join(labels)
    f["theme_count"] = len(labels)
    # ユーザー
    us = [k for k, p in USERS.items() if re.search(p, text)]
    f["users"] = "|".join(us) if us else "都民一般"
    f["user_specific"] = int(any(u in us for u in ["高齢者", "障害者", "外国人", "子育て世帯", "子ども・学生"]))
    f["user_gov"] = int("行政職員" in us)
    f["user_business"] = int("事業者" in us)
    # 課題の具体性
    pm = re.search(PROBLEM_MARK, desc)
    head = desc[:pm.end()] if pm else desc[:150]
    num_in_problem = bool(re.search(NUM_EVIDENCE, head))
    f["problem_marker"] = int(bool(pm))
    f["problem_number"] = int(num_in_problem)
    f["problem_specificity"] = 1 + int(bool(pm) and (num_in_problem or bool(us))) + int(bool(pm) and num_in_problem and bool(us))
    f["first_person_origin"] = int(bool(re.search(r"実体験|経験から|経験をもと|自身の|当事者|聞き取り|ヒアリング|インタビュー|現場の声", desc)))
    # 解決の形
    so = [k for k, p in SOLUTIONS.items() if re.search(p, text)]
    f["solutions"] = "|".join(so)
    for k in SOLUTIONS:
        f["sol_" + k] = int(k in so)
    # データ
    items = d.get("open_data_items") or []
    urls = [(it.get("url") or "") for it in items]
    f["n_data_total"] = len(items)
    f["n_data_tokyo_catalog"] = len(d.get("open_data_urls") or [])
    f["n_data_tokyo_any"] = sum(bool(TOKYO_ANY.search(u)) for u in urls)
    f["n_data_external"] = len(items) - f["n_data_tokyo_any"]
    f["data_national"] = int(any(NATIONAL.search(u) for u in urls))
    f["data_osm_private"] = int(any(OSM_PRIVATE.search(u) for u in urls))
    f["data_cross"] = int(f["n_data_tokyo_any"] > 0 and f["n_data_external"] > 0)
    f["data_no_tokyo"] = int(f["n_data_tokyo_any"] == 0)
    f["data_use_level"] = 3 if re.search(COMBINE, desc) else (2 if re.search(PROCESS, desc) else 1)
    f["desc_big_number"] = int(bool(re.search(r"[0-9]{1,3}(,[0-9]{3})+|[0-9]+万|[0-9]{4,}(件|地点|本|施設|人|体)", desc)))
    # 技術
    for k, p in TECH.items():
        f[k] = int(bool(re.search(p, text)))
    ai_any = bool(re.search(AI_ANY, desc))
    ai_prod = bool(re.search(AI_PRODUCT, desc))
    ai_dev = bool(re.search(AI_DEV, desc)) and ai_any
    f["ai_any"] = int(ai_any)
    f["ai_in_product"] = int(ai_prod)
    f["ai_dev_only"] = int(ai_any and not ai_prod)
    f["ai_dev_mentioned"] = int(ai_dev)
    f["ai_restraint"] = int(bool(re.search(r"幻覚|ハルシネ|AIは[^。]{0,20}(限定|使わ|行わ)|使わなかった|診断[^。]{0,10}行わない|根拠|出典|検証|誠実|判定は行わ", desc)))
    # 提出物
    f["has_demo"] = int(bool(d.get("demo_url")))
    f["demo_host"] = host_type(d.get("demo_url"))
    f["has_video"] = int(bool(d.get("video_url")))
    f["image_count"] = d.get("image_count", 0)
    # 説明文
    f["desc_len"] = len(desc)
    f["desc_num_count"] = hits(NUM_EVIDENCE, desc)
    f["desc_policy"] = int(bool(re.search(POLICY, desc)))
    f["desc_sustain"] = int(bool(re.search(SUSTAIN, desc)))
    f["title_has_tagline"] = int(len(d.get("title") or "") >= 16 or bool(re.search(r"[～〜—\-：:（(！!。、]", d.get("title") or "")))
    f["title_len"] = len(d.get("title") or "")
    # チーム
    f["member_count"] = d.get("member_count", 0)
    f["solo"] = int(d.get("member_count", 0) <= 1)
    f["team_size_band"] = "1人" if f["member_count"] <= 1 else ("2-3人" if f["member_count"] <= 3 else ("4-5人" if f["member_count"] <= 5 else "6人以上"))
    f["student_hint"] = int(bool(re.search(STUDENT, (d.get("team") or "") + desc)) or "学生賞" in f["awards"])
    f["team_eq_title"] = int((d.get("team") or "").strip() == (d.get("title") or "").strip())
    return f


if __name__ == "__main__":
    rows = [code(json.load(open(p, encoding="utf-8"))) for p in sorted(glob.glob(str(DATA / "details" / "*.json")))]
    with (DATA / "features.csv").open("w", encoding="utf-8-sig", newline="") as fp:
        w = csv.DictWriter(fp, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print("features:", len(rows), "cols:", len(rows[0]))
