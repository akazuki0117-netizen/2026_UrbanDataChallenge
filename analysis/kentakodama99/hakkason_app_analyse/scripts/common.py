"""共通処理: 取得 (間隔つき・直列) と Next.js RSC ペイロードの復元。"""
import json
import re
import time
import urllib.request
from pathlib import Path

BASE = "https://odhackathon.metro.tokyo.lg.jp"
UA = "Mozilla/5.0 (compatible; hackathon-research-bot; low-rate, sequential)"
ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
INTERVAL = 1.5  # リクエスト間隔 (秒)

_last = [0.0]


def fetch(url: str, retries: int = 3) -> str:
    """1.5 秒以上の間隔を空けて直列に取得する。"""
    for attempt in range(retries):
        wait = INTERVAL - (time.time() - _last[0])
        if wait > 0:
            time.sleep(wait)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=40) as r:
                body = r.read().decode("utf-8", errors="replace")
            _last[0] = time.time()
            return body
        except Exception:
            _last[0] = time.time()
            if attempt == retries - 1:
                raise
            time.sleep(5 * (attempt + 1))
    raise RuntimeError("unreachable")


_PUSH = re.compile(r'self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)')


def rsc_payload(html: str) -> str:
    """HTML 内の self.__next_f.push([1,"..."]) を連結して RSC 文字列に戻す。"""
    return "".join(json.loads(m.group(1)) for m in _PUSH.finditer(html))
