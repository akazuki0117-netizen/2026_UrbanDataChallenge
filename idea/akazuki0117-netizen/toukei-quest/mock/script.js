// とうけいクエスト（モック）。町のデータはすべて仮。
(() => {
  "use strict";

  // ---- 仮の町のデータ（本番は e-Stat・SSDSE・気象庁・自治体のオープンデータ） ----
  const TOWNS = {
    sakura: { name: "さくら市", desc: "人が多い、にぎやかな市", facilities: { 図書館: 4, 公園: 38, 公民館: 12, プール: 3, 児童館: 9 }, temps: [5, 6, 10, 15, 20, 23, 27, 28, 24, 18, 12, 7] },
    minato: { name: "みなと町", desc: "海が近い、港の町", facilities: { 図書館: 2, 公園: 15, 公民館: 6, プール: 1, 児童館: 4 }, temps: [7, 8, 11, 16, 20, 23, 27, 28, 25, 20, 14, 9] },
    yamano: { name: "やまの村", desc: "山に囲まれた、すずしい村", facilities: { 図書館: 1, 公園: 5, 公民館: 8, プール: 0, 児童館: 2 }, temps: [-1, 0, 4, 10, 16, 20, 24, 25, 20, 13, 7, 1] },
  };
  const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  // ---- 計算 ----
  const sum = a => a.reduce((s, x) => s + x, 0);
  const mean = a => sum(a) / a.length;
  const median = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  const fmt = n => (Math.round(n * 10) / 10).toString();
  const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);

  // ---- 単元 ----
  // kind: "category"（項目と数）か "number"（数の並び）。advanced の町のデータと自分のデータの両方を持つ
  const UNITS = [
    {
      id: "mode", icon: "1", color: "var(--main)", title: "いちばん多いのは？", sub: "最頻値（さいひんち）", kind: "category",
      slides: [
        { emoji: "🍛", big: "クラスで「好きな給食」を聞いたよ", small: "カレー、からあげ、あげパン、ラーメン…" },
        { emoji: "🏆", big: "いちばん多いものを<br>「最頻値（さいひんち）」というよ", small: "「さいひん」は「いちばんよく出てくる」という意味" },
        { emoji: "📊", big: "グラフなら、<br>いちばん高い棒をさがせばOK", small: "数をくらべるだけ。計算はいらないよ" },
      ],
      basic: () => {
        const data = { カレー: 12, からあげ: 9, あげパン: 6, ラーメン: 3 };
        return { data, q: "このクラスの「好きな給食」の最頻値は？", choices: Object.keys(data), answer: "カレー", why: "カレーが12人でいちばん多いから、最頻値はカレー。" };
      },
      townQ: t => {
        const f = t.facilities, top = Object.keys(f).reduce((a, b) => (f[a] >= f[b] ? a : b));
        return { data: f, q: `${t.name}で、いちばん多い施設は？（最頻値）`, choices: Object.keys(f), answer: top, why: `${top}が${f[top]}か所でいちばん多い。` };
      },
      selfLabel: ["しらべたもの（例：好きな給食）", "人数"],
      selfSample: [["カレー", 5], ["からあげ", 7], ["あげパン", 3]],
      selfStats: rows => { const top = rows.reduce((a, b) => (b[1] > a[1] ? b : a), rows[0]); return [["最頻値", top ? top[0] : "-"], ["ぜんぶの数", sum(rows.map(r => r[1]))]]; },
    },
    {
      id: "mean", icon: "2", color: "var(--blue)", title: "ならすといくつ？", sub: "平均（へいきん）", kind: "number",
      slides: [
        { emoji: "📚", big: "5人が1か月に読んだ本は<br>3冊・5冊・4冊・2冊・6冊", small: "人によってばらばら" },
        { emoji: "🧮", big: "ぜんぶたして、人数でわると<br>「平均（へいきん）」", small: "(3+5+4+2+6) ÷ 5 = 20 ÷ 5 = 4" },
        { emoji: "🏞️", big: "平均は、でこぼこを<br>ならした高さ", small: "グラフの棒を、たいらにしたイメージ" },
      ],
      basic: () => {
        const data = { Aさん: 3, Bさん: 5, Cさん: 4, Dさん: 2, Eさん: 6 };
        return { data, q: "5人が読んだ本の冊数の平均は？", choices: ["3冊", "4冊", "5冊", "20冊"], answer: "4冊", why: "3+5+4+2+6=20。20÷5=4 だから、平均は4冊。", line: 4 };
      },
      townQ: t => {
        const m = Math.round(mean(t.temps)), data = Object.fromEntries(MONTHS.map((mm, i) => [mm, t.temps[i]]));
        const ch = shuffle([m, m + 5, m - 5, Math.max(...t.temps)]).map(x => `${x}度`);
        return { data, q: `${t.name}の1年の平均気温は、だいたい何度？`, choices: [...new Set(ch)], answer: `${m}度`, why: `12か月の気温をぜんぶたすと${sum(t.temps)}度。12でわると約${fmt(mean(t.temps))}度。`, line: mean(t.temps) };
      },
      selfLabel: ["名前・日など（例：月曜日）", "数（例：歩数）"],
      selfSample: [["月", 6200], ["火", 8100], ["水", 5400], ["木", 7300], ["金", 9000]],
      selfStats: rows => { const v = rows.map(r => r[1]); return [["平均", v.length ? fmt(mean(v)) : "-"], ["いちばん大きい", v.length ? Math.max(...v) : "-"], ["いちばん小さい", v.length ? Math.min(...v) : "-"]]; },
    },
    {
      id: "median", icon: "3", color: "var(--purple)", title: "まん中はどれ？", sub: "中央値（ちゅうおうち）", kind: "number",
      slides: [
        { emoji: "🧍", big: "小さい順にならべて、<br>まん中にくる数が「中央値」", small: "2, 3, 4, 5, 9 のまん中は 4" },
        { emoji: "🐘", big: "ひとつだけすごく大きい数があっても<br>中央値はあまり動かない", small: "平均は大きい数に引っぱられることがある" },
        { emoji: "✌️", big: "数が偶数個なら、<br>まん中の2つの平均", small: "2, 4, 6, 8 なら (4+6)÷2 = 5" },
      ],
      basic: () => {
        const data = { Aさん: 2, Bさん: 9, Cさん: 3, Dさん: 5, Eさん: 4 };
        return { data, q: "5人の点数「2, 9, 3, 5, 4」の中央値は？", choices: ["3", "4", "5", "9"], answer: "4", why: "小さい順にならべると 2, 3, 4, 5, 9。まん中は4。" };
      },
      townQ: t => {
        const md = median(t.temps), data = Object.fromEntries(MONTHS.map((mm, i) => [mm, t.temps[i]]));
        const ans = `${fmt(md)}度`;
        const ch = [...new Set(shuffle([ans, `${fmt(md + 4)}度`, `${fmt(md - 4)}度`, `${Math.min(...t.temps)}度`]))];
        return { data, q: `${t.name}の12か月の気温を低い順にならべたとき、中央値は？`, choices: ch, answer: ans, why: `12か月は偶数なので、6番目と7番目の平均。${[...t.temps].sort((a, b) => a - b).join(", ")} → 中央値は${fmt(md)}度。` };
      },
      selfLabel: ["名前など（例：Aさん）", "数（例：通学の分）"],
      selfSample: [["Aさん", 10], ["Bさん", 15], ["Cさん", 8], ["Dさん", 40], ["Eさん", 12]],
      selfStats: rows => { const v = rows.map(r => r[1]); return [["中央値", v.length ? fmt(median(v)) : "-"], ["平均", v.length ? fmt(mean(v)) : "-"]]; },
    },
  ];
  const STEPS = [["see", "見る"], ["basic", "基礎"], ["adv", "発展"]];
  const XP = { see: 10, basic: 20, adv: 30 };

  // ---- 進み具合（ブラウザにだけ保存） ----
  const KEY = "toukei-quest-mock";
  let S = { town: null, done: {}, xp: 0 };
  try { S = Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { /* 保存できない環境でも動く */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 無視 */ } };
  const isDone = (u, st) => !!(S.done[u] && S.done[u][st]);
  const markDone = (u, st) => { S.done[u] = S.done[u] || {}; if (!S.done[u][st]) { S.done[u][st] = true; S.xp += XP[st]; save(); } };
  const unlocked = i => i === 0 || isDone(UNITS[i - 1].id, "basic");

  // ---- 部品 ----
  const app = document.getElementById("app");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function chart(data, opt = {}) {
    const keys = Object.keys(data), vals = keys.map(k => data[k]);
    const W = 640, H = 260, L = 36, B = 36, T = 24, bw = (W - L - 10) / keys.length;
    const max = Math.max(1, ...vals), min = Math.min(0, ...vals), span = max - min || 1;
    const y = v => T + (H - T - B) * (max - v) / span;
    const top = Math.max(...vals);
    const bars = keys.map((k, i) => {
      const v = data[k], x = L + i * bw + bw * 0.15, w = bw * 0.7, y0 = y(Math.max(0, v)), h = Math.abs(y(v) - y(0));
      const color = opt.highlightMax && v === top ? "var(--main)" : (opt.color || "var(--blue)");
      return `<rect x="${x}" y="${y0}" width="${w}" height="${Math.max(h, 1)}" rx="6" fill="${color}"/>
        <text x="${x + w / 2}" y="${(v >= 0 ? y0 : y(v) + 14) - 6}" text-anchor="middle" font-size="14" font-weight="700">${esc(v)}</text>
        <text x="${x + w / 2}" y="${H - 12}" text-anchor="middle" font-size="${keys.length > 8 ? 11 : 14}">${esc(k)}</text>`;
    }).join("");
    const line = opt.line != null ? `<line x1="${L}" x2="${W - 6}" y1="${y(opt.line)}" y2="${y(opt.line)}" stroke="var(--red)" stroke-width="3" stroke-dasharray="8 6"/>
      <text x="${W - 8}" y="${y(opt.line) - 6}" text-anchor="end" font-size="13" font-weight="700" fill="var(--red)">平均 ${fmt(opt.line)}</text>` : "";
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.label || "グラフ")}">
      <line class="axis" x1="${L}" x2="${W - 6}" y1="${y(0)}" y2="${y(0)}"/>${bars}${line}</svg>`;
  }

  function header() {
    document.getElementById("town-chip").textContent = S.town ? `📍 ${TOWNS[S.town].name}` : "📍 町をえらんでね";
    document.getElementById("xp").textContent = `⭐ ${S.xp} XP`;
  }

  // ---- 画面：町えらび ----
  function viewTown(back) {
    app.innerHTML = `<h1>きみの町は、<br>数字で見るとどんな町？</h1>
      <p class="lead">さいしょに、きみの町をえらんでね。「発展」の問題が、その町のデータで出てくるよ。</p>
      <div class="card"><h2>町をえらぶ</h2>
        <div class="towns">${Object.entries(TOWNS).map(([k, t]) => `<button type="button" class="town" data-town="${k}" aria-pressed="${S.town === k}"><b>${t.name}</b><span>${t.desc}</span></button>`).join("")}</div>
        <p class="note">モックなので3つの町だけ（データは仮）。本番は都道府県 → 市区町村からえらぶ。</p>
      </div>`;
    app.querySelectorAll(".town").forEach(b => b.addEventListener("click", () => { S.town = b.dataset.town; save(); header(); back ? back() : viewHome(); }));
  }

  // ---- 画面：ホーム（単元の一覧） ----
  function viewHome() {
    if (!S.town) return viewTown();
    header();
    app.innerHTML = `<h1>クエストをえらぼう</h1>
      <p class="lead">どの単元も「見る → 基礎 → 発展」の3ステップ。発展では、${TOWNS[S.town].name}のデータや、きみが集めたデータで挑戦するよ。</p>
      <div class="units">${UNITS.map((u, i) => {
        const lock = !unlocked(i);
        return `<button type="button" class="unit${lock ? " locked" : ""}" data-i="${i}" ${lock ? 'aria-disabled="true"' : ""}>
          <span class="ico" style="background:${lock ? "var(--lock)" : u.color}">${lock ? "🔒" : u.icon}</span>
          <span><b>${u.title}</b><small>${u.sub}${lock ? "　（ひとつ前の基礎をクリアするとひらく）" : ""}</small></span>
          <span class="steps" aria-label="すすみぐあい">${STEPS.map(([s]) => `<i class="dot${isDone(u.id, s) ? " on" : ""}"></i>`).join("")}</span>
        </button>`;
      }).join("")}</div>
      <div class="row end" style="margin-top:14px"><button type="button" class="btn sub" id="change-town">町をかえる</button></div>`;
    app.querySelectorAll(".unit").forEach(b => b.addEventListener("click", () => { if (unlocked(+b.dataset.i)) viewUnit(+b.dataset.i, "see"); }));
    document.getElementById("change-town").addEventListener("click", () => viewTown());
  }

  // ---- 画面：単元 ----
  function viewUnit(i, step) {
    const u = UNITS[i];
    const can = { see: true, basic: isDone(u.id, "see"), adv: isDone(u.id, "basic") };
    app.innerHTML = `<p class="note" style="margin:0">クエスト ${u.icon}</p><h1>${u.title}<br><small style="font-size:16px;color:var(--sub)">${u.sub}</small></h1>
      <nav class="tabs" aria-label="ステップ">${STEPS.map(([s, n], k) => `<button type="button" class="tab${isDone(u.id, s) ? " done" : ""}" data-s="${s}" ${step === s ? 'aria-current="step"' : ""} ${can[s] ? "" : "disabled"}>${k + 1}. ${n}</button>`).join("")}</nav>
      <section id="step"></section>`;
    app.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => viewUnit(i, b.dataset.s)));
    const box = document.getElementById("step");
    if (step === "see") stepSee(box, u, i);
    if (step === "basic") stepQuiz(box, u, i, u.basic(), "basic");
    if (step === "adv") stepAdv(box, u, i);
  }

  function stepSee(box, u, i) {
    let p = 0;
    const draw = () => {
      const s = u.slides[p];
      box.innerHTML = `<div class="card"><div class="slide"><div class="emoji" aria-hidden="true">${s.emoji}</div><div class="big">${s.big}</div><div class="note">${s.small}</div></div>
        <p class="pager">${p + 1} / ${u.slides.length}</p>
        <div class="row end"><button type="button" class="btn sub" id="prev" ${p === 0 ? "disabled" : ""}>もどる</button>
        <button type="button" class="btn" id="next">${p === u.slides.length - 1 ? "わかった！基礎へ" : "つぎへ"}</button></div>
        <p class="note">本番は、ここが30秒くらいの動画かスライドになる。</p></div>`;
      box.querySelector("#prev").addEventListener("click", () => { p--; draw(); });
      box.querySelector("#next").addEventListener("click", () => {
        if (p < u.slides.length - 1) { p++; draw(); return; }
        markDone(u.id, "see"); header(); viewUnit(i, "basic");
      });
    };
    draw();
  }

  function stepQuiz(box, u, i, Q, stepKey, extraTop = "") {
    const isNum = u.kind === "number";
    box.innerHTML = `${extraTop}<div class="card">
      ${chart(Q.data, { highlightMax: false, color: stepKey === "adv" ? "var(--green)" : "var(--blue)", label: Q.q })}
      <p class="q">${esc(Q.q)}</p>
      <div class="choices">${Q.choices.map(c => `<button type="button" class="choice">${esc(c)}</button>`).join("")}</div>
      <div id="fb"></div></div>`;
    box.querySelectorAll(".choice").forEach(b => b.addEventListener("click", () => {
      const ok = b.textContent === Q.answer;
      b.classList.add(ok ? "right" : "wrong");
      const fb = box.querySelector("#fb");
      if (ok) {
        box.querySelectorAll(".choice").forEach(x => x.disabled = true);
        const svg = box.querySelector("svg");
        svg.outerHTML = chart(Q.data, { highlightMax: !isNum, line: Q.line, color: stepKey === "adv" ? "var(--green)" : "var(--blue)", label: Q.q });
        markDone(u.id, stepKey); header();
        fb.innerHTML = `<div class="feedback ok">⭕ せいかい！ +${XP[stepKey]} XP<p>${esc(Q.why)}</p></div>
          <div class="row end" style="margin-top:10px">${stepKey === "basic" ? `<button type="button" class="btn" id="go">発展に挑戦！</button>` : `<button type="button" class="btn" id="go">つぎへ</button>`}</div>`;
        fb.querySelector("#go").addEventListener("click", () => stepKey === "basic" ? viewUnit(i, "adv") : stepSelf(document.getElementById("step"), u, i, true));
      } else {
        fb.innerHTML = `<div class="feedback ng">❌ おしい！もういちど考えてみよう<p>ヒント：${u.id === "mode" ? "いちばん高い棒はどれ？" : u.id === "mean" ? "ぜんぶたして、数でわってみよう" : "小さい順にならべて、まん中を見よう"}</p></div>`;
      }
    }));
  }

  function stepAdv(box, u, i) {
    const t = TOWNS[S.town];
    const top = `<div class="card"><span class="badge">発展</span>
      <h2 style="margin-top:8px">あなたの周りのデータで挑戦してみよう！</h2>
      <div class="mode-switch"><button type="button" class="btn" id="m-town">📍 ${t.name}のデータ</button><button type="button" class="btn sub" id="m-self">✏️ 自分で集めたデータ</button></div>
      <p class="note">${t.name}のデータは仮。本番は e-Stat・気象庁・自治体のオープンデータから出す。</p></div>`;
    stepQuiz(box, u, i, u.townQ(t), "adv", top);
    box.querySelector("#m-self").addEventListener("click", () => stepSelf(box, u, i, false));
  }

  function stepSelf(box, u, i, fromQuiz) {
    let rows = u.selfSample.map(r => [...r]);
    const draw = () => {
      const valid = rows.filter(r => String(r[0]).trim() && Number.isFinite(r[1]));
      const data = Object.fromEntries(valid.map(r => [r[0], r[1]]));
      const stats = u.selfStats(valid);
      const line = u.id === "mean" && valid.length ? mean(valid.map(r => r[1])) : null;
      box.innerHTML = `<div class="card"><span class="badge">発展</span>
        <h2 style="margin-top:8px">✏️ 自分で集めたデータでグラフを作ろう</h2>
        <p class="note">クラスで聞いたこと、家で数えたことを入れてみよう。入れるとすぐグラフになるよ。</p>
        <div class="entry note"><span>${u.selfLabel[0]}</span><span>${u.selfLabel[1]}</span><span></span></div>
        ${rows.map((r, k) => `<div class="entry"><input aria-label="${u.selfLabel[0]} ${k + 1}" data-k="${k}" data-f="0" value="${esc(r[0])}"><input aria-label="${u.selfLabel[1]} ${k + 1}" data-k="${k}" data-f="1" type="number" inputmode="decimal" value="${esc(r[1])}"><button type="button" class="x" data-del="${k}" aria-label="${k + 1}行目を消す">×</button></div>`).join("")}
        <div class="row" style="margin:8px 0"><button type="button" class="btn sub" id="add">＋ 行をふやす</button></div>
        ${valid.length ? chart(data, { highlightMax: u.id === "mode", line, color: "var(--green)", label: "自分で集めたデータのグラフ" }) : '<p class="note">データを入れるとグラフが出るよ</p>'}
        <div class="result-box">${stats.map(([k, v]) => `<div class="stat"><small>${k}</small><b>${esc(v)}</b></div>`).join("")}</div>
        <div class="row end" style="margin-top:12px"><button type="button" class="btn" id="finish">できた！クエストクリア</button></div>
        <p class="note">入れたデータは、このブラウザの外には送らない。自由研究や統計グラフコンクールの練習にも使える。</p></div>`;
      box.querySelectorAll(".entry input").forEach(inp => inp.addEventListener("change", () => {
        const k = +inp.dataset.k;
        rows[k][+inp.dataset.f] = inp.dataset.f === "1" ? (inp.value === "" ? NaN : Number(inp.value)) : inp.value;
        draw();
      }));
      box.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => { rows.splice(+b.dataset.del, 1); draw(); }));
      box.querySelector("#add").addEventListener("click", () => { rows.push(["", NaN]); draw(); });
      box.querySelector("#finish").addEventListener("click", () => { markDone(u.id, "adv"); header(); viewClear(i); });
    };
    draw();
  }

  function viewClear(i) {
    const u = UNITS[i], next = UNITS[i + 1];
    app.innerHTML = `<div class="card clear"><div class="emoji" aria-hidden="true">🎉</div>
      <h1>クエスト${u.icon} クリア！</h1><p>「${u.sub}」をマスターしたよ。いまのけいけんちは ⭐ ${S.xp} XP</p>
      <div class="row" style="justify-content:center">${next ? `<button type="button" class="btn" id="next">つぎのクエストへ</button>` : ""}<button type="button" class="btn sub" id="home">クエストいちらんへ</button></div></div>`;
    if (next) document.getElementById("next").addEventListener("click", () => viewUnit(i + 1, "see"));
    document.getElementById("home").addEventListener("click", viewHome);
  }

  document.getElementById("go-home").addEventListener("click", viewHome);
  header();
  viewHome();
})();
