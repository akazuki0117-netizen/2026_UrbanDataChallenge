// 人生ルート逆算アプリ（モック）。数字はすべて仮。本番はオープンデータから作る。
(() => {
  "use strict";

  // ---- 仮のデータ（万円） ----
  // 住む場所ごとの、家の値段（買う）と家賃（年）。本番は不動産情報ライブラリ・住宅・土地統計調査
  const AREAS = {
    toshin: { name: "都心（港区・世田谷区など）", house: 12000, mansion: 8000, rent: 180, commute: 30 },
    kogai: { name: "郊外（八王子市など）", house: 4000, mansion: 3500, rent: 96, commute: 80 },
    chiho: { name: "地方都市", house: 3000, mansion: 2500, rent: 72, commute: 25 },
  };
  // 業界ごとの年収（25・30・35・40・45歳）。本番は賃金構造基本統計調査・EDINET
  const ROUTES = {
    kinyu: { name: "金融", pay: [480, 650, 800, 900, 950] },
    consul: { name: "コンサル", pay: [550, 800, 1000, 1150, 1250] },
    it: { name: "IT", pay: [450, 600, 720, 820, 880] },
    maker: { name: "メーカー", pay: [420, 540, 640, 720, 780] },
    koumuin: { name: "公務員", pay: [380, 480, 580, 660, 720] },
  };
  // 子ども1人の教育費（年）。本番は文部科学省「子供の学習費調査」
  const EDU = { koritsu: 50, shiritsu: 130 };

  // ---- 条件（年代ごと） ----
  const STATE = {
    area: "toshin", home30: "house", marry: "yes", kids: 2, school: "shiritsu", save40: 1000,
    route: "kinyu",
    policies: { jidou: false, mushou: false, jutaku: false },
  };
  const CONDITIONS = [
    { decade: "20代", rows: [
      { key: "area", label: "住む場所", options: Object.entries(AREAS).map(([v, a]) => [v, a.name]) },
      { key: "marry", label: "結婚", options: [["yes", "20代のうちに"], ["no", "しない・まだ"]] },
    ] },
    { decade: "30代", rows: [
      { key: "home30", label: "30歳の住まい", options: [["house", "戸建てを買う"], ["mansion", "マンションを買う"], ["rent", "賃貸のまま"]] },
      { key: "kids", label: "子ども", options: [[0, "なし"], [1, "1人"], [2, "2人"], [3, "3人"]] },
    ] },
    { decade: "40代", rows: [
      { key: "school", label: "子どもの学校", options: [["koritsu", "公立"], ["shiritsu", "私立"]] },
      { key: "save40", label: "40歳の貯金", options: [[300, "300万"], [1000, "1000万"], [2000, "2000万"]] },
    ] },
  ];
  const POLICIES = [
    { key: "jidou", name: "児童手当（拡充）", desc: "子ども1人あたり年 12万円を受け取る（仮）", effect: s => s.kids * 12 },
    { key: "mushou", name: "高校の授業料の無償化（私立も）", desc: "私立の教育費が1人あたり年 40万円下がる（仮）", effect: s => s.school === "shiritsu" ? s.kids * 40 : 0 },
    { key: "jutaku", name: "自治体の住宅取得の支援", desc: "住まいの費用が年 20万円下がる（仮）", effect: s => s.home30 === "rent" ? 0 : 20 },
  ];

  // ---- 計算 ----
  const TAKE_HOME = 0.75; // 額面から手取りの割合（仮）
  const yen = n => `${Math.round(n).toLocaleString("ja-JP")}万円`;

  function need(s, age) {
    const a = AREAS[s.area];
    // 住まい（年）：買うなら 35年ローン（金利込みで 1.25 倍・頭金 1割）、20代は賃貸
    let housing;
    if (age < 30) housing = a.rent * 0.7; // 20代は1人暮らしの部屋
    else if (s.home30 === "rent") housing = a.rent * (s.marry === "yes" ? 1.3 : 1);
    else housing = (a[s.home30] * 0.9 * 1.25) / 35;
    let living = 240 + (s.marry === "yes" && age >= 28 ? 120 : 0) + (age >= 32 ? s.kids * 60 : 0);
    let edu = age >= 40 ? s.kids * EDU[s.school] : age >= 35 ? s.kids * EDU.koritsu * 0.6 : 0;
    const saving = s.save40 / 18; // 22〜40歳で貯める
    let support = 0;
    for (const p of POLICIES) if (s.policies[p.key] && age >= 32) support += p.effect(s);
    const takeHome = housing + living + edu + saving - support;
    return { gross: takeHome / TAKE_HOME, housing, living, edu, saving, support };
  }

  const AGES = [25, 30, 35, 40, 45];
  function judge(pay, req) {
    const r = pay / req;
    if (r >= 1) return ["ok", "届く"];
    if (r >= 0.85) return ["warn", "ギリギリ"];
    return ["ng", "ピンチ"];
  }
  function tip(s, age, n) {
    if (age >= 40 && s.school === "shiritsu" && s.kids > 0) return `子どもの学費が年 ${yen(n.edu)}。ここが山場`;
    if (age >= 30 && s.home30 !== "rent") return `家のローンが年 ${yen(n.housing)}`;
    if (age < 30) return `家賃が年 ${yen(n.housing)}`;
    return `生活費が年 ${yen(n.living)}`;
  }

  // ---- 描画 ----
  const $ = id => document.getElementById(id);

  function chip(group, value, label, checked, onPick) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = label;
    b.setAttribute("role", "radio"); b.setAttribute("aria-checked", String(checked));
    b.addEventListener("click", () => onPick(value));
    group.appendChild(b);
  }

  function renderConditions() {
    const box = $("conditions"); box.innerHTML = "";
    for (const d of CONDITIONS) {
      const wrap = document.createElement("div"); wrap.className = "decade";
      wrap.innerHTML = `<h3>${d.decade}のうちに</h3>`;
      for (const r of d.rows) {
        const row = document.createElement("div"); row.className = "row";
        row.innerHTML = `<div class="k">${r.label}</div>`;
        const g = document.createElement("div"); g.className = "chips";
        g.setAttribute("role", "radiogroup"); g.setAttribute("aria-label", r.label);
        for (const [v, l] of r.options) chip(g, v, l, STATE[r.key] === v, val => { STATE[r.key] = val; render(); });
        row.appendChild(g); wrap.appendChild(row);
      }
      box.appendChild(wrap);
    }
  }

  function renderRoutes() {
    const g = $("routes"); g.innerHTML = "";
    for (const [v, r] of Object.entries(ROUTES)) chip(g, v, `${r.name}ルート`, STATE.route === v, val => { STATE.route = val; render(); });
  }

  function renderResult() {
    const route = ROUTES[STATE.route];
    const reqs = AGES.map(a => need(STATE, a));
    const peak = Math.max(...reqs.map(n => n.gross));
    const peakAge = AGES[reqs.findIndex(n => n.gross === peak)];
    const ngCount = AGES.filter((a, i) => judge(route.pay[i], reqs[i].gross)[0] === "ng").length;

    $("summary").innerHTML = `
      <div class="stat"><div class="l">この人生に要る年収（いちばん多いとき）</div><div class="v">${yen(peak)}<small>（${peakAge}歳）</small></div></div>
      <div class="stat"><div class="l">${route.name}ルートの ${peakAge}歳の年収</div><div class="v">${yen(route.pay[AGES.indexOf(peakAge)])}</div></div>
      <div class="stat"><div class="l">ピンチの時期</div><div class="v">${ngCount === 0 ? "なし" : ngCount + "回"}</div></div>`;

    $("timeline").innerHTML = AGES.map((age, i) => {
      const n = reqs[i], pay = route.pay[i];
      const [cls, word] = judge(pay, n.gross);
      const pct = Math.min(100, Math.round((pay / n.gross) * 100));
      return `<div class="step ${cls}">
        <div class="age">${age}歳</div>
        <div>
          <div class="msg">${word}：要る年収 ${yen(n.gross)} ／ ${route.name}ルート ${yen(pay)}</div>
          <div class="detail">${tip(STATE, age, n)}${n.support ? `。制度で年 ${yen(n.support)} 軽くなる` : ""}</div>
          <div class="bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
        </div>
      </div>`;
    }).join("");

    // 業界ごとの比較
    const rows = Object.entries(ROUTES).map(([k, r]) => {
      const marks = AGES.map((a, i) => ({ ok: "○", warn: "△", ng: "×" })[judge(r.pay[i], reqs[i].gross)[0]]);
      return `<tr${k === STATE.route ? ' style="font-weight:700"' : ""}><td>${r.name}</td>${marks.map(m => `<td class="c">${m}</td>`).join("")}</tr>`;
    }).join("");
    const alt = altPlan(reqs, route);
    $("compare").innerHTML = `<h3>ほかのルートだと？（○届く △ギリギリ ×ピンチ）</h3>
      <table><thead><tr><th>業界</th>${AGES.map(a => `<th class="c">${a}歳</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>
      <p class="note">${alt}</p>`;
  }

  function altPlan(reqs, route) {
    const bad = AGES.filter((a, i) => judge(route.pay[i], reqs[i].gross)[0] === "ng");
    if (!bad.length) return "このルートで、送りたい人生に届きそう。";
    const ideas = [];
    if (STATE.area === "toshin") ideas.push("住む場所を郊外にする（通勤は片道 約" + AREAS.kogai.commute + "分）");
    if (STATE.home30 === "house") ideas.push("30歳はマンションにする");
    if (STATE.school === "shiritsu") ideas.push("子どもの学校を公立にする");
    if (!STATE.policies.mushou && STATE.school === "shiritsu") ideas.push("（制度）高校の無償化があると楽になる");
    return `${bad.join("・")}歳がピンチ。たとえば：${ideas.join("／") || "業界を変える"}`;
  }

  function renderPolicies() {
    const box = $("policies"); box.innerHTML = "";
    for (const p of POLICIES) {
      const l = document.createElement("label"); l.className = "policy-item";
      l.innerHTML = `<input type="checkbox" ${STATE.policies[p.key] ? "checked" : ""}><div><b>${p.name}</b><span>${p.desc}</span></div>`;
      l.querySelector("input").addEventListener("change", e => { STATE.policies[p.key] = e.target.checked; renderResult(); });
      box.appendChild(l);
    }
  }

  function render() { renderConditions(); renderRoutes(); renderResult(); }
  render(); renderPolicies();
})();
