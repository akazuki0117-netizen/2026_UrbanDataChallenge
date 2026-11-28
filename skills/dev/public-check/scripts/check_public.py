"""public のリポジトリに push する前に、個人情報と秘密の値が入っていないかを調べる。

使い方（リポジトリのいちばん上で）：
  python skills/dev/public-check/scripts/check_public.py          これから push する変更とコミットしていない変更
  python skills/dev/public-check/scripts/check_public.py --all    追跡している全ファイル
NG が1つでもあれば終了コード 1 を返す。
"""
import io
import os
import re
import subprocess
import sys

# 載っていてよいメールアドレス（コンテストの事務局など、公開されているもの）
ALLOWED_EMAILS = re.compile(
    r"(@users\.noreply\.github\.com$|^noreply@|^udc-office@aigid\.jp$|^urbandata\.challenge@gmail\.com$|@example\.(com|org|jp)$)",
    re.I,
)
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}")
PHONE = re.compile(r"(?<!\d)0\d{1,4}-\d{1,4}-\d{3,4}(?!\d)")
SECRETS = [
    ("OpenAI 系のキー", re.compile(r"sk-[A-Za-z0-9_-]{20,}")),
    ("Anthropic のキー", re.compile(r"sk-ant-[A-Za-z0-9_-]{20,}")),
    ("AWS のアクセスキー", re.compile(r"AKIA[0-9A-Z]{16}")),
    ("GitHub のトークン", re.compile(r"(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}")),
    ("Google の API キー", re.compile(r"AIza[0-9A-Za-z_-]{35}")),
    ("Slack のトークン", re.compile(r"xox[abposr]-[A-Za-z0-9-]{10,}")),
    ("秘密鍵", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("値の入った秘密の設定", re.compile(r"(?i)\b(api[_-]?key|secret|password|passwd|token|access[_-]?key)\b\s*[:=]\s*[\"'][A-Za-z0-9_\-/+=.]{12,}[\"']")),
]
BAD_FILES = re.compile(r"(^|/)(\.env(\.(?!example$)[^/]+)?|[^/]*\.pem|[^/]*\.key|credentials[^/]*\.json|\.private-words\.txt)$")
TEXT_EXT = (".md", ".html", ".htm", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".css", ".py", ".json", ".txt",
            ".toml", ".yml", ".yaml", ".csv", ".tsv", ".sh", ".svg", ".ipynb", ".env", ".example", ".xml")
# 他の人が公開している作品データ（第三者の公開情報）は、実名の語のチェックだけ外す
THIRD_PARTY = ("analysis/kentakodama99/hakkason_app_analyse/data/",)


def git(*args):
    r = subprocess.run(["git", *args], capture_output=True)
    return r.stdout.decode("utf-8", "replace")


def private_words():
    p = ".private-words.txt"
    if not os.path.exists(p):
        return []
    words = []
    for line in io.open(p, encoding="utf-8"):
        w = line.strip()
        if w and not w.startswith("#"):
            words.append(w)
    return words


def target_files(all_files):
    if all_files:
        return [f for f in git("ls-files", "-z").split("\0") if f]
    files = set()
    upstream = git("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}").strip()
    if upstream:
        files |= set(git("diff", "--name-only", "-z", upstream + "...HEAD").split("\0"))
    else:  # まだ push したことがないブランチは全部見る
        files |= set(git("ls-files", "-z").split("\0"))
    files |= set(git("diff", "--name-only", "-z", "HEAD").split("\0"))
    files |= set(git("ls-files", "--others", "--exclude-standard", "-z").split("\0"))
    return sorted(f for f in files if f and os.path.exists(f))


def unpushed_authors():
    upstream = git("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}").strip()
    rng = (upstream + "..HEAD") if upstream else "HEAD"
    out = git("log", "--format=%h%x09%an%x09%ae%x09%cn%x09%ce", rng)
    return [l.split("\t") for l in out.splitlines() if l.strip()]


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass
    all_files = "--all" in sys.argv
    words = private_words()
    ng, warn = [], []

    if not words:
        warn.append(("-", 0, ".private-words.txt が無いので、実名のチェックをしていない（SKILL.md の説明を見て作る）"))

    for f in target_files(all_files):
        if BAD_FILES.search(f):
            ng.append((f, 0, "入れてはいけないファイル（.env・鍵・認証情報など）"))
            continue
        if not f.lower().endswith(TEXT_EXT) and not os.path.basename(f).startswith(".env"):
            continue
        try:
            text = io.open(f, encoding="utf-8").read()
        except (UnicodeDecodeError, OSError):
            continue
        third = f.startswith(THIRD_PARTY)
        for n, line in enumerate(text.splitlines(), 1):
            for m in EMAIL.finditer(line):
                addr = m.group(0)
                if not ALLOWED_EMAILS.search(addr) and not third:
                    ng.append((f, n, f"メールアドレス：{addr}"))
            if PHONE.search(line) and not third:
                warn.append((f, n, f"電話番号らしきもの：{PHONE.search(line).group(0)}"))
            for label, rx in SECRETS:
                if rx.search(line):
                    ng.append((f, n, f"秘密の値らしきもの（{label}）"))
            if not third:
                for w in words:
                    if w in line:
                        ng.append((f, n, f"登録した語（実名など）：{w}"))

    for h, an, ae, cn, ce in unpushed_authors():
        for who, addr in (("作者", ae), ("コミッター", ce)):
            if not addr.endswith("@users.noreply.github.com"):
                ng.append((f"commit {h}", 0, f"{who}のメールアドレスが noreply ではない：{addr}"))
        for w in words:
            if w in an or w in cn:
                ng.append((f"commit {h}", 0, f"コミットの名前に登録した語：{w}"))

    for f, n, msg in warn:
        print(f"要確認  {f}:{n}  {msg}")
    for f, n, msg in ng:
        print(f"NG      {f}:{n}  {msg}")
    if ng:
        print(f"\nNG が {len(ng)} 件。直してから push してください（docs/公開のルール.md）。")
        return 1
    print("OK  個人情報・秘密の値は見つかりませんでした（画像・PDF の中身は目で確かめる）。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
