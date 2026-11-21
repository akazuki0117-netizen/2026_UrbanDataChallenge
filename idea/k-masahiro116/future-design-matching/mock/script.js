'use strict';

/* ==========================================================
   AIと考える将来設計と政治マッチング（モック）
   AIの応答・政党・制度・金額はすべて架空のルールで作っている
   ========================================================== */

const STORE_KEY = 'future-design-matching-mock';
const END_AGE = 65;
const CELL = 34;
const LABEL_W = 96;
const BASE_YEAR = new Date().getFullYear();
const DATA_AS_OF = '2026年11月時点（架空）';

const WISHES = [
  { id: 'marriage', label: '結婚したい', icon: '💍' },
  { id: 'child', label: '子どもを育てたい', icon: '👶' },
  { id: 'house', label: '家を買いたい', icon: '🏠' },
  { id: 'startup', label: '起業したい', icon: '🚀' },
  { id: 'passion', label: '好きなことを仕事に', icon: '🎨' },
  { id: 'travel', label: '世界一周したい', icon: '✈️' },
  { id: 'abroad', label: '海外で暮らしたい', icon: '🌏' },
  { id: 'local', label: '地元で働きたい', icon: '🏡' },
  { id: 'fire', label: '早めにリタイア', icon: '🏖️' },
  { id: 'social', label: '社会の役に立ちたい', icon: '🤝' },
];

const VALUES = [
  { id: 'freedom', label: '自由', desc: '時間と場所を自分で決める' },
  { id: 'stability', label: '安定', desc: '不安なく暮らせる' },
  { id: 'challenge', label: '挑戦', desc: '大きなことに挑む' },
  { id: 'bond', label: 'つながり', desc: '家族・仲間・地域' },
  { id: 'money', label: 'お金', desc: '経済的に豊かになる' },
  { id: 'growth', label: '成長', desc: 'できることを増やす' },
];

const KEYWORDS = [
  [/起業|会社を(作|つく)|社長|独立|お店|店を|開きたい/, 'startup'],
  [/海外|留学|移住/, 'abroad'],
  [/世界一周|旅|絶景/, 'travel'],
  [/結婚|パートナー|家族と/, 'marriage'],
  [/子ども|子供|育て/, 'child'],
  [/家を|マイホーム|持ち家/, 'house'],
  [/地元|地方|田舎|恩返し/, 'local'],
  [/好き|趣味|音楽|絵|ゲーム|料理|カフェ/, 'passion'],
  [/FIRE|リタイア|早期退職/i, 'fire'],
  [/貢献|ボランティア|社会|誰かの役/, 'social'],
];

/* 予定の種類ごとに、資金シミュレーションでの扱いと、手動追加したときの初期値 */
const EVENT_KINDS = [
  { key: 'job', re: /就職|入社|いまの仕事/, text: '就職：この年から給料が入ります' },
  { key: 'career', re: /キャリア|昇進|転職/, text: 'キャリアアップ：期間中は年収が約40万円上がります' },
  { key: 'startup', re: /起業|独立|事業/, text: '起業：期間中は事業の収入で計算します', cost: 300 },
  { key: 'fire', re: /リタイア|退職/, text: '早期リタイア：この年から収入が大きく減ります' },
  { key: 'marriage', re: /結婚/, text: '結婚：この年から世帯の収入と生活費が変わります', cost: 300 },
  { key: 'child', re: /子育て|出産|子ども|子供/, text: '子育て：期間中、毎年の支出が増えます', cost: 50, yearly: 100 },
  { key: 'house', re: /住宅|家を買|マイホーム/, text: '住宅購入：頭金と毎年のローンがかかります', cost: 400, yearly: 40 },
  { key: 'scholar', re: /奨学金/, text: '奨学金の返済：期間中、毎年返済します', yearly: 20 },
  { key: 'abroad', re: /海外/, text: '海外生活：期間中、生活費が年60万円増えます', cost: 150 },
  { key: 'local', re: /Uターン|地元|移住/, text: '地元へUターン：引っ越し費用がかかります', cost: 50 },
  { key: 'passion', re: /副業/, text: '副業：毎年のお金をマイナスにすると収入になります', cost: 30, yearly: -20 },
];
const KIND_DEFAULT_TEXT = 'お金の計算：開始時のお金と、期間中に毎年のお金を反映します';

const THEMES = {
  scholar: '奨学金', child: '子育て', house: '住まい', startup: '起業・創業', local: '地方・移住',
  fire: '資産・税', passion: '働き方', marriage: '結婚・新生活', all: '税・社会保険', money: '資産・税', freedom: '働き方',
};

/* ===== 架空の政党・政策 ===== */
const PARTIES = [
  { id: 'A', name: '政党A（架空）', color: '#e64980', vision: '若者と子育て世代に投資する国', values: ['bond', 'stability'] },
  { id: 'B', name: '政党B（架空）', color: '#4c6ef5', vision: '挑戦する人が報われる国', values: ['challenge', 'freedom', 'money', 'growth'] },
  { id: 'C', name: '政党C（架空）', color: '#12b886', vision: '誰も取り残さない安心の国', values: ['stability', 'bond'] },
];

const span = (from, to, amount) => {
  const m = {};
  for (let a = from; a <= to; a++) m[a] = amount;
  return m;
};

const POLICIES = [
  {
    id: 'a1', party: 'A', title: '奨学金返済の所得控除', tags: ['scholar'],
    calc: c => c.ev.scholar && span(c.ev.scholar.start, c.ev.scholar.end, 6),
    merit: '返済中の手取りが増え、20〜30代の貯金や結婚資金に回せる。',
    fiscal: '歳出の見直しと国債（架空）',
    demerit: '返済を終えた人・借りていない人との公平性。国債は将来世代の負担になる。',
  },
  {
    id: 'a2', party: 'A', title: '児童手当の拡充（月1.5万円上乗せ）', tags: ['child'],
    calc: c => c.ev.child && span(c.ev.child.start, c.ev.child.end, 18),
    merit: '子育て期間の家計の赤字を小さくできる。',
    fiscal: '社会保険料への上乗せ（架空）',
    demerit: '子育てをしない世帯も含め、社会保険料の負担が増える。',
  },
  {
    id: 'a3', party: 'A', title: '若者の住宅取得減税の拡大', tags: ['house'],
    calc: c => c.ev.house && span(c.ev.house.start, Math.min(END_AGE, c.ev.house.start + 12), 10),
    merit: 'ローン返済が重い時期の税負担が軽くなる。',
    fiscal: '租税特別措置の組み替え（架空）',
    demerit: '住宅価格を押し上げる可能性がある。賃貸で暮らす人には恩恵がない。',
  },
  {
    id: 'b1', party: 'B', title: 'スタートアップ創業補助', tags: ['startup'],
    calc: c => c.ev.startup && { [c.ev.startup.start]: 150 },
    merit: '起業した年の資金不足を補える。',
    fiscal: '法人税の上振れ分（架空）',
    demerit: '補助を受けられるのは審査を通った一部。失敗したときの保障はない。',
  },
  {
    id: 'b2', party: 'B', title: '所得税の基礎控除の引き上げ', tags: ['all'],
    calc: c => span(c.workFrom, END_AGE, 4),
    merit: '働いている人全員の手取りが少しずつ増える。',
    fiscal: '公共事業・補助金の削減（架空）',
    demerit: '社会保障や行政サービスの縮小につながる可能性がある。',
  },
  {
    id: 'b3', party: 'B', title: '副業・兼業の規制緩和', tags: ['passion', 'freedom'],
    calc: () => null,
    merit: '好きなことを副業で試しやすくなる。',
    fiscal: '財源は不要（規制の見直し）',
    demerit: '長時間労働を招くおそれがある。',
  },
  {
    id: 'c1', party: 'C', title: '20代の社会保険料の軽減', tags: ['all'],
    calc: c => c.workFrom <= 29 && span(c.workFrom, 29, 8),
    merit: '働き始めの手取りが増え、早いうちから貯金しやすい。',
    fiscal: '金融所得課税の強化（架空）',
    demerit: '30代以降の人には恩恵がない。財源として投資収益への課税が重くなる。',
  },
  {
    id: 'c2', party: 'C', title: '地方移住・Uターン支援金', tags: ['local'],
    calc: c => c.ev.local && { [c.ev.local.start]: 100 },
    merit: '地元に戻るときの引っ越し・住まいの費用を補える。',
    fiscal: '地方創生の交付金（架空）',
    demerit: '対象の地域や条件が限られる。移住先の仕事は自分で見つける必要がある。',
  },
  {
    id: 'c3', party: 'C', title: '金融所得課税の強化', tags: ['fire', 'money'],
    calc: () => span(40, END_AGE, -6),
    merit: '格差の是正や、社会保障の財源になる。',
    fiscal: '（この政策自体が他の政策の財源）',
    demerit: 'NISA枠を超える投資収益の手取りが減る。資産運用で早期リタイアする計画に影響する。',
  },
];

const LAWS = [
  { title: '奨学金返済支援法案（架空）', status: '国会で審議中（架空）', tags: ['scholar'], body: '奨学金を返済中の人の所得税を軽くする内容の法案の例。成立すると返済中の手取りが増える。' },
  { title: '子ども・子育て支援の制度（例示）', status: '現行の制度（例示）', tags: ['child'], body: '児童手当や保育の支援など、子育て世帯を支える仕組み。拡充か縮小かが選挙の争点になりやすい。' },
  { title: '住宅ローン減税（例示）', status: '現行の制度（例示）', tags: ['house'], body: 'ローン残高に応じて税が軽くなる仕組み。期限や控除率は税制改正で変わる。' },
  { title: 'スタートアップ育成法案（架空）', status: '提出予定（架空）', tags: ['startup'], body: '創業時の補助や、失敗後の再挑戦を支える内容の法案の例。' },
  { title: '最低賃金の引き上げ（例示）', status: '毎年改定（例示）', tags: ['all'], body: '働き始めの年収や、アルバイトの収入に直接関わる。' },
];

const PEOPLE = [
  { name: '青木 さくら', party: 'A', role: '衆議院議員（架空）', tags: ['scholar', 'child'], act: '奨学金返済支援法案の提出者。若者の住まい支援にも取り組む。' },
  { name: '石井 大和', party: 'B', role: '参議院議員（架空）', tags: ['startup', 'passion'], act: 'スタートアップ支援と副業解禁を進める議員連盟に所属。' },
  { name: '上田 みのり', party: 'C', role: '次の選挙の立候補予定者（架空）', tags: ['local', 'child'], act: '地方移住と子育て支援を訴える。元・町役場の職員。' },
  { name: '江藤 拓海', party: 'B', role: '衆議院議員（架空）', tags: ['all', 'money'], act: '所得税の基礎控除の引き上げを主張している。' },
];

const LOCALS = [
  { name: 'みどり市（架空）', hope: 'local', tags: ['scholar', 'local'], title: '奨学金返還支援', body: '市内で就職すると、奨学金の返還額を年最大18万円・最長8年助成。' },
  { name: 'うみかぜ町（架空）', hope: 'local', tags: ['child'], title: '子育て応援パッケージ', body: '第1子から保育料無料。出産祝い金30万円。' },
  { name: 'さくら区（架空）', hope: 'city', tags: ['marriage'], title: '若者・新婚世帯の家賃補助', body: '新婚世帯に家賃を月2万円・3年間補助。' },
  { name: 'ひかり市（架空）', hope: 'city', tags: ['startup', 'passion'], title: '創業支援補助金', body: '創業費用を最大200万円補助。市のコワーキングスペースを1年間無料で利用できる。' },
  { name: 'やまなみ村（架空）', hope: 'local', tags: ['local', 'house'], title: '移住支援金・空き家改修補助', body: '移住支援金（単身60万円・世帯100万円）と、空き家の改修費を最大150万円補助。' },
];

/* ===== AIヒアリングの台本 ===== */
const HEARING = [
  { q: 'こんにちは！まずは雑談から。\n最近、時間を忘れて夢中になったことはありますか？', quick: ['ゲーム', '料理', '旅行', '特にない'] },
  { q: 'いいですね。\nでは10年後のある休日。どこで、誰と、何をしていたら嬉しいですか？', quick: ['家族とのんびり過ごす', '海外で働いている', '自分のお店に立っている', 'わからない'] },
  { q: '自由・安定・挑戦・つながり・お金・成長。\nこの中で、一番手放したくないものは？', quick: VALUES.map(v => v.label) },
  { q: '最後に。死ぬまでに一度はやってみたいことを、ひとつだけ教えてください。', quick: ['世界一周', '起業', '結婚して子どもを育てる', '地元に恩返し'] },
];

const EDIT_QUICK = ['結婚を3年早めたい', 'もっと貯金を増やしたい', '起業したい', '家は買わない', '元に戻して'];

/* ===== 状態 ===== */
function defaultState() {
  return {
    profile: { age: 20, grade: '大学生', area: '', hope: 'any', scholar: false, scholarAmount: 300 },
    wishes: [],
    wishFree: '',
    freeWishes: [],
    values: [],
    success: '',
    events: [],
    savingRate: 1,
    versions: [],
    applied: [],
    matched: false,
    user: null,
    savedAt: null,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? Object.assign(defaultState(), JSON.parse(raw)) : null;
  } catch (e) {
    return null;
  }
}

let state = load() || defaultState();

function save() {
  state.savedAt = Date.now();
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) { /* 保存できなくてもモックは動かす */ }
}

/* ===== ユーティリティ ===== */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
let uidSeq = Date.now();
const uid = () => `e${(uidSeq++).toString(36)}`;

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmt(v) {
  const n = Math.round(v);
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(1)}億円`;
  return `${n.toLocaleString()}万円`;
}

function range(e) {
  return e.start === e.end ? `${e.start}歳` : `${e.start}〜${e.end}歳`;
}

function clampInt(v, min, max, fallback) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
}

function matchKeywords(text) {
  return KEYWORDS.filter(([re]) => re.test(text)).map(([, id]) => id);
}

const evByKey = key => state.events.find(e => e.key === key);
const valueLabel = id => (VALUES.find(v => v.id === id) || {}).label || '';
const wishLabel = id => (WISHES.find(w => w.id === id) || {}).label || '';

/* ===== AI人生設計（叩き台の生成） ===== */
function jobAgeOf(p) {
  if (p.grade === '社会人') return p.age;
  const base = { 高校生: 22, 専門学校生: 20, 大学生: 22, 大学院生: 24 }[p.grade] || 22;
  return Math.max(p.age, base);
}

function genEvents() {
  const p = state.profile;
  const age = p.age;
  const w = new Set(state.wishes);
  const evs = [];
  const add = (key, name, cat, start, end, cost = 0, yearly = 0) => {
    const s = Math.max(age, start);
    const e = Math.max(s, Math.min(END_AGE, end));
    evs.push({ id: uid(), key, name, cat, start: s, end: e, cost, yearly });
  };

  const jobAge = jobAgeOf(p);
  if (age < jobAge) add('study', p.grade === '高校生' ? '高校・大学' : '学生生活', 'work', age, jobAge - 1);
  add('job', p.grade === '社会人' ? 'いまの仕事' : '就職', 'work', jobAge, w.has('startup') ? 29 : 31);
  if (w.has('startup')) add('startup', '起業・事業運営', 'work', 30, w.has('fire') ? 44 : END_AGE, 300);
  else add('career', 'キャリアアップ・昇進', 'work', 32, w.has('fire') ? 44 : END_AGE);
  if (w.has('fire')) add('fire', '早期リタイア', 'dream', 45, END_AGE);
  if (p.scholar) add('scholar', '奨学金の返済', 'money', jobAge, jobAge + 14, 0, Math.round(p.scholarAmount / 15));
  if (w.has('marriage') || w.has('child')) add('marriage', '結婚', 'life', 28, 28, 300);
  if (w.has('child')) add('child', '子育て', 'life', 30, 47, 50, 100);
  if (w.has('house')) add('house', '住宅購入・ローン', 'money', 35, END_AGE, 400, 40);
  if (w.has('travel')) add('travel', '世界一周', 'dream', 25, 25, 200);
  if (w.has('abroad')) add('abroad', '海外で暮らす', 'dream', 33, 35, 150);
  if (w.has('local')) add('local', '地元へUターン', 'life', 27, 27, 50);
  if (w.has('passion')) add('passion', '好きなことで副業', 'dream', 24, 34, 30, -20);
  if (w.has('social')) add('social', '地域・社会活動', 'dream', 35, END_AGE);
  state.freeWishes.forEach((text, i) => add('free', text.slice(0, 14), 'dream', age + 5 + i * 3, age + 5 + i * 3, 50));

  return evs.sort((a, b) => a.start - b.start);
}

function defaultSuccess() {
  const vals = state.values.map(valueLabel).filter(Boolean);
  const wish = state.wishes.length ? wishLabel(state.wishes[0]).replace(/したい$|たい$/, '') : '';
  if (!vals.length && !wish) return '自分で選んだ道を、自分のペースで進むこと';
  return `${vals.length ? `${vals.join('と')}を大切にしながら、` : ''}${wish ? `『${wishLabel(state.wishes[0])}』を叶える人生` : '自分らしく生きること'}`;
}

/* ===== 収支・資金シミュレーション ===== */
function policyMap(policy) {
  const ctx = {
    ev: Object.fromEntries(state.events.map(e => [e.key, e])),
    workFrom: Math.max(state.profile.age, (evByKey('job') || { start: state.profile.age }).start),
  };
  return policy.calc(ctx) || null;
}

function appliedEffects() {
  const total = {};
  state.applied.forEach(id => {
    const pol = POLICIES.find(p => p.id === id);
    const m = pol && policyMap(pol);
    if (!m) return;
    Object.entries(m).forEach(([a, v]) => { total[a] = (total[a] || 0) + v; });
  });
  return total;
}

function simulate(withPolicies) {
  const age = state.profile.age;
  const job = evByKey('job');
  const jobAge = job ? job.start : age;
  const startup = evByKey('startup');
  const career = evByKey('career');
  const fire = evByKey('fire');
  const marriage = evByKey('marriage');
  const abroad = evByKey('abroad');
  const effects = withPolicies ? appliedEffects() : {};

  let savings = 50;
  const rows = [];
  for (let a = age; a <= END_AGE; a++) {
    let income = a < jobAge ? 70 : Math.min(520, 280 * Math.pow(1.03, a - jobAge));
    const inStartup = startup && a >= startup.start && a <= startup.end;
    if (inStartup) income = Math.min(600, 180 * Math.pow(1.1, a - startup.start));
    else if (career && a >= career.start && a <= career.end && a >= jobAge) income += 40;
    const retired = fire && a >= fire.start;
    if (retired) income = 80;
    const married = marriage && a >= marriage.start;
    if (married && a >= jobAge) income += retired ? 60 : 200;

    let expense = a < jobAge ? 90 : married ? 300 + 0.6 * Math.max(0, income - 400) : 180 + 0.5 * Math.max(0, income - 300);
    if (abroad && a >= abroad.start && a <= abroad.end) expense += 60;
    expense *= state.savingRate;

    let eventCost = 0;
    const names = [];
    state.events.forEach(e => {
      if (e.start === a) {
        eventCost += e.cost || 0;
        names.push(e.name);
      }
      if (a >= e.start && a <= e.end) eventCost += e.yearly || 0;
    });

    const policy = effects[a] || 0;
    const balance = income - expense - eventCost + policy;
    savings += balance;
    rows.push({
      age: a,
      income: Math.round(income),
      eventCost: Math.round(eventCost),
      balance: Math.round(balance),
      savings: Math.round(savings),
      names,
    });
  }
  return rows;
}

function tightestRow(rows) {
  return rows.slice(1).reduce((min, r) => (r.balance < min.balance ? r : min), rows[1] || rows[0]);
}

function withEvents(events, fn) {
  const orig = state.events;
  state.events = events;
  try {
    return fn();
  } finally {
    state.events = orig;
  }
}

function summarize(events = state.events) {
  return withEvents(events, () => {
    const rows = simulate(false);
    const tight = tightestRow(rows);
    return {
      tightAge: tight.age,
      tightBalance: tight.balance,
      s40: (rows.find(r => r.age === 40) || rows[rows.length - 1]).savings,
      s65: rows[rows.length - 1].savings,
    };
  });
}

/* ===== 版の管理（履歴・Undo） ===== */
function snapshot() {
  return JSON.parse(JSON.stringify({
    events: state.events, savingRate: state.savingRate, wishes: state.wishes,
    values: state.values, success: state.success, freeWishes: state.freeWishes, profile: state.profile,
  }));
}

function restoreData(data) {
  Object.assign(state, JSON.parse(JSON.stringify(data)));
}

function commit(label) {
  const last = state.versions[state.versions.length - 1];
  state.versions.push({ v: last ? last.v + 1 : 1, label, at: Date.now(), data: snapshot() });
  save();
  renderAll();
}

function undo() {
  if (state.versions.length < 2) {
    toast('これ以上は戻せません');
    return false;
  }
  const removed = state.versions.pop();
  const prev = state.versions[state.versions.length - 1];
  restoreData(prev.data);
  save();
  renderAll();
  toast(`「${removed.label}」を取り消して v${prev.v} に戻しました`);
  return true;
}

function restoreVersion(v) {
  const target = state.versions.find(x => x.v === v);
  if (!target) return;
  restoreData(target.data);
  commit(`v${v} の状態に戻す`);
  closeSheets();
  toast(`v${v} の状態に戻しました`);
}

/* ===== 画面遷移 ===== */
let currentView = 'onboard';
let backTarget = null;

function showView(name, opts = {}) {
  currentView = name;
  backTarget = opts.back || null;
  $$('.view').forEach(v => v.classList.toggle('active', v.id === `view-${name}`));
  $('#app-title').textContent = $(`#view-${name}`).dataset.title;
  $('#tab-bar').hidden = name === 'onboard' || !!backTarget;
  $('#back-btn').hidden = !backTarget;
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === name));
  $('#screen').scrollTop = 0;
  renderUndo();
  if (name === 'chat') enterChat();
}

function renderUndo() {
  $('#undo-btn').hidden = !(currentView === 'plan' && state.versions.length > 1);
}

/* ===== オンボーディング ===== */
let obStep = 0;

function renderOnboard() {
  $('#wish-chips').innerHTML = WISHES.map(w =>
    `<button class="chip ${state.wishes.includes(w.id) ? 'active' : ''}" data-wish="${w.id}">${w.icon} ${w.label}</button>`).join('');
  $('#wish-free').value = state.wishFree;
  $('#value-grid').innerHTML = VALUES.map(v =>
    `<button class="value-btn ${state.values.includes(v.id) ? 'active' : ''}" data-value="${v.id}"><b>${v.label}</b><small>${v.desc}</small></button>`).join('');
  $('#success-free').value = state.success;
  const p = state.profile;
  $('#p-age').value = p.age;
  $('#p-grade').value = p.grade;
  $('#p-area').value = p.area;
  $('#p-hope').value = p.hope;
  $('#p-scholar').checked = p.scholar;
  $('#p-scholar-amount').value = p.scholarAmount;
  $('#scholar-amount-wrap').hidden = !p.scholar;
}

function setObStep(step) {
  obStep = step;
  $$('.ob-step').forEach(el => el.classList.toggle('active', el.dataset.step === String(step)));
  $$('.step-dot').forEach((d, i) => d.classList.toggle('active', typeof step === 'number' && i <= step));
  $('#steps').hidden = step === 'loading';
  $('#screen').scrollTop = 0;
}

function readOnboard() {
  state.wishFree = $('#wish-free').value.trim();
  state.success = $('#success-free').value.trim();
  state.profile = {
    age: clampInt($('#p-age').value, 15, 40, 20),
    grade: $('#p-grade').value,
    area: $('#p-area').value.trim(),
    hope: $('#p-hope').value,
    scholar: $('#p-scholar').checked,
    scholarAmount: clampInt($('#p-scholar-amount').value, 0, 2000, 300),
  };
}

function absorbFreeText() {
  const texts = state.wishFree.split(/[、,，\n]/).map(t => t.trim()).filter(Boolean);
  texts.forEach(text => {
    const tags = matchKeywords(text);
    if (tags.length) tags.forEach(t => { if (!state.wishes.includes(t)) state.wishes.push(t); });
    else if (!state.freeWishes.includes(text)) state.freeWishes.push(text);
  });
}

function generatePlan() {
  readOnboard();
  absorbFreeText();
  setObStep('loading');
  const msgs = ['やりたいことを年表に並べています…', 'ライフイベントごとのお金を試算しています…', 'あなたの「成功」を言葉にしています…'];
  msgs.forEach((m, i) => setTimeout(() => { $('#loading-text').textContent = m; }, i * 550));
  setTimeout(() => {
    const first = state.versions.length === 0;
    state.events = genEvents();
    state.savingRate = 1;
    state.applied = [];
    if (!state.success) state.success = defaultSuccess();
    commit(first ? 'AIが作った叩き台' : 'プロフィールから作り直し');
    showView('plan');
    toast('人生設計の叩き台ができました');
    flashBars();
  }, 1700);
}

/* ===== 人生設計の描画 ===== */
function renderPlan() {
  if (!state.events.length) return;
  const rows = simulate(false);
  const appliedRows = state.applied.length ? simulate(true) : null;
  const tight = tightestRow(rows);
  const last = state.versions[state.versions.length - 1];

  $('#plan-version').textContent = last ? `v${last.v}` : 'v1';
  $('#success-text').textContent = `「${state.success || defaultSuccess()}」`;
  $('#plan-values').innerHTML = [
    ...state.values.map(v => `<span class="tag">#${esc(valueLabel(v))}</span>`),
    ...state.wishes.map(w => `<span class="tag">${esc(wishLabel(w))}</span>`),
    ...state.freeWishes.map(w => `<span class="tag">${esc(w)}</span>`),
  ].join('');

  const active = state.events.filter(e => tight.age >= e.start && tight.age <= e.end).map(e => e.name);
  $('#tight-card').innerHTML = `<span>⚠️</span><div>あなたの人生で一番お金が厳しいのは <b>${tight.age}歳ごろ</b>${active.length ? `（${esc(active.join('・'))}）` : ''}。年間 <b>${fmt(Math.abs(tight.balance))}の${tight.balance < 0 ? '赤字' : '黒字'}</b> の見込みです。<br><small>政治マッチングで、この時期を支える政策・制度を探せます。</small></div>`;

  renderTimeline(rows, appliedRows, tight);
  renderMoneyList(rows, tight);
}

function renderTimeline(rows, appliedRows, tight) {
  const age = state.profile.age;
  const n = rows.length;
  const trackW = n * CELL;
  const grid = `background-image:linear-gradient(to right,#f1eff7 1px,transparent 1px);background-size:${CELL}px 100%;width:${trackW}px`;

  const head = `<div class="tl-row tl-head"><div class="tl-label">年齢</div><div class="tl-track" style="width:${trackW}px">${
    rows.map((r, i) => `<div class="tl-age ${r.age % 10 === 0 ? 'decade' : ''}" style="left:${i * CELL}px">${r.age}${
      i === 0 ? '<small>いま</small>' : r.age % 5 === 0 ? `<small>${BASE_YEAR + r.age - age}</small>` : ''}</div>`).join('')
  }</div></div>`;

  const evRows = state.events.map(e => {
    const point = e.start === e.end;
    const left = (e.start - age) * CELL + (point ? 6 : 2);
    const width = point ? 22 : (e.end - e.start + 1) * CELL - 4;
    return `<div class="tl-row"><div class="tl-label">${esc(e.name)}</div><div class="tl-track" style="${grid}">
      <button class="tl-bar ${e.cat} ${point ? 'point' : ''}" data-ev="${e.id}" style="left:${left}px;width:${width}px" title="${esc(e.name)}（${range(e)}）">${point ? '●' : esc(e.name)}</button>
    </div></div>`;
  }).join('');

  const finalRows = appliedRows || rows;
  const chart = `<div class="tl-row chart-row"><div class="tl-label">貯蓄残高<b>${fmt(finalRows[n - 1].savings)}</b><span>${END_AGE}歳時点</span></div>
    <div class="tl-track" style="${grid}">${chartSvg(rows, appliedRows, tight)}</div></div>`;

  const tightCol = `<div class="tl-tight" style="left:${LABEL_W + (tight.age - age) * CELL}px"></div>`;

  $('#timeline').style.width = `${LABEL_W + trackW}px`;
  $('#timeline').innerHTML = head + evRows + chart + tightCol;
}

function chartSvg(rows, appliedRows, tight) {
  const H = 150;
  const padT = 20;
  const padB = 20;
  const scale = v => Math.sign(v) * Math.sqrt(Math.abs(v));
  const all = rows.map(r => r.savings).concat(appliedRows ? appliedRows.map(r => r.savings) : []).map(scale);
  const max = Math.max(10, ...all);
  const min = Math.min(0, ...all);
  const y = v => padT + ((max - scale(v)) / (max - min || 1)) * (H - padT - padB);
  const x = i => (i + 0.5) * CELL;
  const path = list => list.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(r.savings).toFixed(1)}`).join(' ');
  const ti = rows.findIndex(r => r.age === tight.age);
  const w = rows.length * CELL;

  const labels = rows.map((r, i) => (r.age % 10 === 0 || i === rows.length - 1)
    ? `<circle cx="${x(i)}" cy="${y(r.savings)}" r="3" fill="#5f3dc4"/><text x="${x(i)}" y="${y(r.savings) - 7}" text-anchor="middle" font-size="9" fill="#1f2333">${Math.round(r.savings).toLocaleString()}</text>`
    : '').join('');

  return `<svg class="chart-svg" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}">
    <line x1="0" x2="${w}" y1="${y(0)}" y2="${y(0)}" stroke="#adb5bd" stroke-dasharray="3 3"/>
    <text x="4" y="${y(0) - 3}" font-size="8" fill="#868e96">0円</text>
    ${appliedRows ? `<path d="${path(appliedRows)}" fill="none" stroke="#2b8a3e" stroke-width="2" stroke-dasharray="5 4"/>` : ''}
    <path d="${path(rows)}" fill="none" stroke="#5f3dc4" stroke-width="2.5" stroke-linejoin="round"/>
    ${labels}
    <circle cx="${x(ti)}" cy="${y(rows[ti].savings)}" r="5" fill="#f03e3e" stroke="#fff" stroke-width="2"/>
    <text x="${x(ti)}" y="${H - 5}" text-anchor="middle" font-size="9" font-weight="700" fill="#e03131">厳しい</text>
    <text x="4" y="12" font-size="8" fill="#868e96">単位：万円（目盛りは平方根）</text>
  </svg>`;
}

function renderMoneyList(rows, tight) {
  const ages = Array.from(new Set(state.events.map(e => e.start).concat([tight.age, END_AGE]))).sort((a, b) => a - b);
  $('#money-list').innerHTML = ages.map(a => {
    const r = rows.find(x => x.age === a);
    if (!r) return '';
    const isTight = a === tight.age;
    const title = [...r.names, isTight ? '⚠️ 一番お金が厳しい時期' : '', a === END_AGE && !r.names.length ? `${END_AGE}歳の時点` : '']
      .filter(Boolean).join('・');
    return `<li class="money-item ${isTight ? 'tight' : ''}">
      <div class="money-age">${a}<small>歳</small><small>${BASE_YEAR + a - state.profile.age}</small></div>
      <div>
        <div class="money-title">${esc(title)}</div>
        <div class="money-nums">
          <div>想定手取り年収<b>${fmt(r.income)}</b></div>
          <div>必要資金<b>${fmt(Math.max(0, r.eventCost))}</b></div>
          <div>貯蓄残高<b class="${r.savings < 0 ? 'neg' : ''}">${fmt(r.savings)}</b></div>
        </div>
      </div>
    </li>`;
  }).join('');
}

function flashBars() {
  $$('.tl-bar').forEach(b => b.classList.add('flash'));
}

/* ===== 予定の手動編集 ===== */
let editingId = null;

let draftId = null;
let amountsTouched = false;

function kindOf(key) {
  return EVENT_KINDS.find(k => k.key === key);
}

function inferKey(name, events, selfId) {
  const kind = EVENT_KINDS.find(k => k.re.test(name) && !events.some(e => e.key === k.key && e.id !== selfId));
  return kind ? kind.key : 'free';
}

function openEventSheet(id) {
  const e = state.events.find(x => x.id === id);
  editingId = e ? e.id : null;
  draftId = e ? e.id : uid();
  amountsTouched = !!e;
  const age = state.profile.age;
  $('#event-sheet-title').textContent = e ? '予定を編集' : '予定を追加';
  $('#ev-name').value = e ? e.name : '';
  $('#ev-cat').value = e ? e.cat : 'dream';
  $('#ev-start').value = e ? e.start : age + 5;
  $('#ev-end').value = e ? e.end : age + 5;
  $('#ev-cost').value = e ? e.cost || 0 : 0;
  $('#ev-yearly').value = e ? e.yearly || 0 : 0;
  $('#ev-delete').hidden = !e;
  renderEventPreview();
  openSheet('#event-sheet');
}

function readEventForm() {
  const age = state.profile.age;
  const start = clampInt($('#ev-start').value, age, END_AGE, age);
  return {
    name: $('#ev-name').value.trim(),
    cat: $('#ev-cat').value,
    start,
    end: Math.max(start, clampInt($('#ev-end').value, age, END_AGE, start)),
    cost: clampInt($('#ev-cost').value, 0, 100000, 0),
    yearly: clampInt($('#ev-yearly').value, -1000, 1000, 0),
  };
}

function draftEvents() {
  const data = readEventForm();
  const events = state.events.map(e => ({ ...e }));
  const target = events.find(e => e.id === draftId);
  if (target) {
    Object.assign(target, data);
    if (target.key === 'free') target.key = inferKey(data.name, events, target.id);
  } else if (data.name) {
    events.push({ id: draftId, key: inferKey(data.name, events, draftId), ...data });
  }
  return events.sort((a, b) => a.start - b.start);
}

function onEventFormInput(ev) {
  if (ev.target.id === 'ev-cost' || ev.target.id === 'ev-yearly') amountsTouched = true;
  if (ev.target.id === 'ev-name' && !editingId && !amountsTouched) {
    const kind = kindOf(inferKey($('#ev-name').value, state.events, draftId));
    $('#ev-cost').value = kind && kind.cost ? kind.cost : 0;
    $('#ev-yearly').value = kind && kind.yearly ? kind.yearly : 0;
  }
  renderEventPreview();
}

function diffCell(before, after, higherIsBetter = true) {
  if (before === after) return `<b class="same">${fmt(after)}（変化なし）</b>`;
  const good = higherIsBetter ? after > before : after < before;
  const d = after - before;
  return `<b class="${good ? 'up' : 'down'}">${fmt(before)} → ${fmt(after)}（${d > 0 ? '+' : ''}${fmt(d)}）</b>`;
}

function renderEventPreview() {
  const events = draftEvents();
  const draft = events.find(e => e.id === draftId);
  const kind = draft && kindOf(draft.key);
  $('#ev-kind').textContent = `計算での扱い：${kind ? kind.text : KIND_DEFAULT_TEXT}`;
  if (!draft) {
    $('#ev-preview').innerHTML = '<h3>この変更で計算結果がどう変わるか</h3><p class="hint" style="margin:0">予定の名前を入れると表示します。</p>';
    return;
  }
  const b = summarize();
  const a = summarize(events);
  $('#ev-preview').innerHTML = `<h3>この変更で計算結果がどう変わるか</h3>
    <div class="preview-row"><span>一番厳しい時期</span><b class="${a.tightAge === b.tightAge && a.tightBalance === b.tightBalance ? 'same' : a.tightBalance > b.tightBalance ? 'up' : 'down'}">${b.tightAge}歳（${fmt(b.tightBalance)}）→ ${a.tightAge}歳（${fmt(a.tightBalance)}）</b></div>
    <div class="preview-row"><span>40歳時点の貯蓄</span>${diffCell(b.s40, a.s40)}</div>
    <div class="preview-row"><span>${END_AGE}歳時点の貯蓄</span>${diffCell(b.s65, a.s65)}</div>`;
}

function commitWithResult(events, label) {
  const before = summarize();
  state.events = events;
  commit(label);
  const after = summarize();
  closeSheets();
  ['.chart-row', '#money-list'].forEach(sel => {
    const el = $(sel);
    if (!el) return;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  });
  const d = after.s65 - before.s65;
  toast(d === 0
    ? '年表を更新しました（貯蓄の見込みは変わりません）'
    : `計算結果を更新：${END_AGE}歳時点の貯蓄 ${fmt(before.s65)} → ${fmt(after.s65)}`);
}

function saveEvent(ev) {
  ev.preventDefault();
  const { name } = readEventForm();
  if (!name) return;
  commitWithResult(draftEvents(), `「${name}」を${editingId ? '手動で編集' : '追加'}`);
}

function deleteEvent() {
  const e = state.events.find(x => x.id === editingId);
  if (!e) return;
  commitWithResult(state.events.filter(x => x.id !== editingId), `「${e.name}」を削除`);
}

function renderHistory() {
  const list = state.versions.slice().reverse();
  const curV = state.versions.length ? state.versions[state.versions.length - 1].v : null;
  $('#history-list').innerHTML = list.map(ver => {
    const d = new Date(ver.at);
    const time = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `<li><span class="badge">v${ver.v}</span><div>${esc(ver.label)}<small>${time}</small></div>${
      ver.v === curV ? '<span class="current">いまの版</span>' : `<button class="mini" data-restore="${ver.v}">この版に戻す</button>`}</li>`;
  }).join('') || '<li>まだ履歴がありません</li>';
}

/* ===== AIと話す ===== */
const chat = {
  mode: 'hearing',
  logs: { hearing: [], edit: [] },
  quick: { hearing: [], edit: [] },
  step: 0,
  answers: [],
  started: { hearing: false, edit: false },
  busy: false,
};
const chatActions = {};
let actionSeq = 0;

function enterChat() {
  $$('#chat-mode .seg').forEach(s => s.classList.toggle('active', s.dataset.mode === chat.mode));
  $('#chat-mode').hidden = backTarget === 'onboard';
  if (!chat.started[chat.mode]) {
    chat.started[chat.mode] = true;
    if (chat.mode === 'hearing') startHearing();
    else startEdit();
  }
  renderChat();
}

function renderChat() {
  const log = chat.logs[chat.mode];
  $('#chat-log').innerHTML = log.map(m => {
    if (m.who === 'action') return `<div class="msg-action">${m.actions.map(a => `<button class="mini" data-action-id="${a}">${esc(chatActions[a].label)}</button>`).join(' ')}</div>`;
    return `<div class="msg ${m.who}${m.typing ? ' typing' : ''}">${esc(m.text)}</div>`;
  }).join('');
  $('#quick-replies').innerHTML = chat.quick[chat.mode].map(q => `<button class="chip" data-quick="${esc(q)}">${esc(q)}</button>`).join('');
  $('#screen').scrollTop = $('#screen').scrollHeight;
}

function aiSay(mode, text, opts = {}) {
  const log = chat.logs[mode];
  const typing = { who: 'ai', text: '…', typing: true };
  log.push(typing);
  chat.quick[mode] = [];
  chat.busy = true;
  renderChat();
  setTimeout(() => {
    log.splice(log.indexOf(typing), 1, { who: 'ai', text });
    if (opts.actions) {
      const ids = opts.actions.map(a => {
        const id = `a${actionSeq++}`;
        chatActions[id] = a;
        return id;
      });
      log.push({ who: 'action', actions: ids });
    }
    chat.quick[mode] = opts.quick || [];
    chat.busy = false;
    if (chat.mode === mode && currentView === 'chat') renderChat();
  }, 650);
}

function userSay(text) {
  if (chat.busy) return;
  chat.logs[chat.mode].push({ who: 'me', text });
  chat.quick[chat.mode] = [];
  renderChat();
  if (chat.mode === 'hearing') onHearing(text);
  else onEdit(text);
}

/* --- やりたいことを見つける（ガイドモード） --- */
function startHearing() {
  chat.step = 0;
  chat.answers = [];
  aiSay('hearing', HEARING[0].q, { quick: HEARING[0].quick });
}

function onHearing(text) {
  if (chat.step >= HEARING.length) {
    aiSay('hearing', 'もう一度最初から話しますか？', { actions: [{ label: 'もう一度話す', fn: startHearing }] });
    return;
  }
  chat.answers.push(text);
  chat.step++;
  if (chat.step < HEARING.length) {
    aiSay('hearing', HEARING[chat.step].q, { quick: HEARING[chat.step].quick });
  } else {
    finishHearing();
  }
}

let hearingResult = null;

function finishHearing() {
  const [hobby, future, value, bucket] = chat.answers;
  const tags = Array.from(new Set(matchKeywords([hobby, future, bucket].join(' '))));
  const v = VALUES.find(x => value.includes(x.label));
  const unknown = /わから|分から|特にない/.test(future);
  const free = tags.length || /わから|分から|特にない/.test(bucket) ? [] : [bucket];
  const success = `${unknown ? '' : `${future.replace(/[。.]$/, '')}——そんな日々を、`}${v ? v.label : '自分のペース'}を大切にしながら送ること`;
  hearingResult = { tags, value: v ? v.id : null, free, success };

  const wishText = [...tags.map(wishLabel), ...free].join('、') || 'まだはっきりしていない（それで大丈夫です）';
  aiSay('hearing',
    `ありがとうございます。お話から見えてきたこと：\n・やりたいこと：${wishText}\n・大事にしたい価値観：${v ? v.label : 'これから見つける'}\n\nあなたにとっての成功は\n「${success}」\nなのかもしれません。`,
    {
      actions: [
        { label: backTarget === 'onboard' ? 'この内容で次へ' : 'この内容を人生設計に反映', fn: applyHearing },
        { label: 'もう一度話す', fn: startHearing },
      ],
    });
}

function applyHearing() {
  if (!hearingResult) return;
  const r = hearingResult;
  r.tags.forEach(t => { if (!state.wishes.includes(t)) state.wishes.push(t); });
  r.free.forEach(f => { if (!state.freeWishes.includes(f)) state.freeWishes.push(f); });
  if (r.value) state.values = [r.value, ...state.values.filter(x => x !== r.value)].slice(0, 2);
  state.success = r.success;

  if (backTarget === 'onboard') {
    renderOnboard();
    showView('onboard');
    setObStep(3);
    toast('AIとの会話の内容を入力しました');
    return;
  }
  state.events = genEvents();
  commit('AIヒアリングの内容を反映');
  showView('plan');
  flashBars();
  toast('人生設計に反映しました（↶で元に戻せます）');
}

/* --- 人生設計を直す（AI修正） --- */
function startEdit() {
  const text = state.events.length
    ? '人生設計をどう変えたいですか？\n「結婚を3年早めたい」のように話しかけてください。年表の予定はタップして直接直すこともできます。'
    : 'まずは「人生設計」で叩き台を作りましょう。';
  aiSay('edit', text, { quick: state.events.length ? EDIT_QUICK : [] });
}

function shiftEvent(key, delta) {
  const e = evByKey(key);
  if (!e) return false;
  const age = state.profile.age;
  const len = e.end - e.start;
  e.start = Math.max(age, Math.min(END_AGE, e.start + delta));
  e.end = Math.min(END_AGE, e.start + len);
  return true;
}

function onEdit(text) {
  if (!state.events.length) {
    startEdit();
    return;
  }
  if (/元に戻|戻して|取り消/.test(text)) {
    const ok = undo();
    aiSay('edit', ok ? 'ひとつ前の版に戻しました。' : 'これ以上は戻せません。', { quick: EDIT_QUICK });
    return;
  }

  const before = tightestRow(simulate(false));
  const s40 = () => (simulate(false).find(r => r.age === 40) || {}).savings;
  const saved40 = s40();
  let reply = null;
  let label = text;
  let m;

  if ((m = text.match(/結婚.*?(\d+)\s*年.*?(早|遅)/)) || /早く結婚|結婚.*早/.test(text) || /結婚.*遅/.test(text)) {
    const n = m ? parseInt(m[1], 10) : 2;
    const sign = (m ? m[2] === '早' : /早/.test(text)) ? -1 : 1;
    if (!evByKey('marriage')) {
      state.wishes.push('marriage');
      state.events.push({ id: uid(), key: 'marriage', name: '結婚', cat: 'life', start: 28 + sign * n, end: 28 + sign * n, cost: 300, yearly: 0 });
      reply = `結婚を ${28 + sign * n}歳 に追加しました。`;
    } else {
      shiftEvent('marriage', sign * n);
      const moved = shiftEvent('child', sign * n);
      const e = evByKey('marriage');
      reply = `結婚を ${e.start}歳 に${sign < 0 ? '早め' : '遅らせ'}ました。${moved ? `子育ての時期も合わせて ${range(evByKey('child'))} に動かしています。` : ''}`;
    }
  } else if (/貯金|貯蓄|ためたい|貯めたい/.test(text) && /増|ため|貯め/.test(text)) {
    state.savingRate = Math.round(state.savingRate * 0.9 * 100) / 100;
    reply = `毎月の生活費を約1割おさえる計画にしました（固定費の見直し・自炊を想定）。\n40歳時点の貯蓄：${fmt(saved40)} → ${fmt(s40())}`;
  } else if (/起業/.test(text)) {
    if (evByKey('startup')) {
      reply = 'すでに起業の予定が入っています。時期を変えたい場合は年表の「起業・事業運営」をタップしてください。';
      label = null;
    } else {
      state.wishes.push('startup');
      state.events = genEvents();
      reply = '30歳で起業する計画を加えました。20代は会社員として経験と資金をためる想定です。';
    }
  } else if (/(家|住宅).*(買わない|やめ|いらない|賃貸)/.test(text)) {
    if (!evByKey('house')) {
      reply = 'いまの計画に住宅購入は入っていません。';
      label = null;
    } else {
      state.events = state.events.filter(e => e.key !== 'house');
      state.wishes = state.wishes.filter(w => w !== 'house');
      reply = '住宅購入をやめ、賃貸で暮らし続ける計画にしました。';
    }
  } else if (/(家|住宅).*(買|欲し)/.test(text)) {
    state.wishes.push('house');
    state.events = genEvents();
    reply = '35歳で住宅を購入する計画を加えました。';
  } else if (/(子ども|子供).*(いらない|持たない|つくらない)/.test(text)) {
    state.events = state.events.filter(e => e.key !== 'child');
    state.wishes = state.wishes.filter(w => w !== 'child');
    reply = '子育ての予定を外しました。';
  } else if (/リタイア|FIRE/i.test(text)) {
    if (!state.wishes.includes('fire')) state.wishes.push('fire');
    state.events = genEvents();
    reply = '45歳で早期リタイアする計画にしました。それまでに資産をつくる必要があります。';
  } else if (/世界一周|旅/.test(text)) {
    if (!state.wishes.includes('travel')) state.wishes.push('travel');
    state.events = genEvents();
    reply = '25歳で世界一周する予定を加えました。';
  } else {
    aiSay('edit', 'ごめんなさい、うまく読み取れませんでした（モックでは決まった言い方にだけ反応します）。\n下の候補から選んでみてください。', { quick: EDIT_QUICK });
    return;
  }

  if (label) {
    state.events.sort((a, b) => a.start - b.start);
    commit(label);
    const after = tightestRow(simulate(false));
    const tightMsg = after.age !== before.age ? `\n一番お金が厳しい時期は ${before.age}歳 → ${after.age}歳 に変わりました。` : '';
    reply += `${tightMsg}\n\n年表を更新しました。気に入らなければ「元に戻して」で戻せます。`;
  }
  aiSay('edit', reply, {
    quick: EDIT_QUICK,
    actions: [{ label: '年表を見る', fn: () => { showView('plan'); flashBars(); } }],
  });
}

/* ===== 政治・自治体マッチング ===== */
function planTags() {
  return new Set([...state.events.map(e => e.key), ...state.values]);
}

function isRelevant(tags, set = planTags()) {
  return tags.some(t => t === 'all' || set.has(t));
}

function relatedText(tags) {
  const parts = tags.map(t => {
    if (t === 'all') return '働いている期間すべて';
    const e = evByKey(t);
    if (e) return `「${e.name}」（${range(e)}）`;
    if (state.values.includes(t)) return `大事にしたい価値観「${valueLabel(t)}」`;
    return null;
  }).filter(Boolean);
  return parts.length ? `あなたの${parts.join('、')}に関わります` : 'あなたの人生設計との直接の関わりは小さい政策です';
}

function effectInfo(map) {
  if (!map) return { cls: 'none', text: '金額の試算なし（制度の変更）', total: 0 };
  const entries = Object.entries(map).map(([a, v]) => [Number(a), v]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const ages = entries.map(([a]) => a);
  const from = Math.min(...ages);
  const to = Math.max(...ages);
  const in30s = entries.filter(([a]) => a >= 30 && a <= 39).reduce((s, [, v]) => s + v, 0);
  if (total < 0) return { cls: 'neg', text: `${from}歳以降の手取りが合計約${fmt(-total)}減る（試算）`, total };
  if (from === to) return { cls: '', text: `${from}歳のときに約${fmt(total)}の支援（試算）`, total };
  if (in30s > 0) return { cls: '', text: `あなたの30代の手取りが約${fmt(in30s)}増える（試算）${in30s !== total ? `／生涯で約${fmt(total)}` : ''}`, total };
  return { cls: '', text: `${from}〜${to}歳の手取りが合計約${fmt(total)}増える（試算）`, total };
}

function partyScore(party, set) {
  const pols = POLICIES.filter(p => p.party === party.id);
  const max = pols.reduce((s, p) => s + (p.tags.includes('all') ? 1 : 2), 0) + 3;
  const score = pols.reduce((s, p) => s + (isRelevant(p.tags, set) ? (p.tags.includes('all') ? 1 : 2) : 0), 0)
    + 1.5 * party.values.filter(v => state.values.includes(v)).length;
  return Math.max(5, Math.min(98, Math.round((score / max) * 100)));
}

function runMatch() {
  const btn = $('#run-match');
  btn.disabled = true;
  btn.lastChild.textContent = '探しています…';
  setTimeout(() => {
    btn.disabled = false;
    btn.lastChild.textContent = '政治マッチング';
    state.matched = true;
    save();
    renderMatch();
    toast('人生設計と関わる政策・制度が見つかりました');
  }, 900);
}

function renderMatch() {
  $('#match-empty').hidden = state.matched;
  $('#match-result').hidden = !state.matched;
  if (!state.matched || !state.events.length) return;

  const set = planTags();
  const tight = tightestRow(simulate(false));

  const parties = PARTIES.map(p => ({ ...p, pct: partyScore(p, set) })).sort((a, b) => b.pct - a.pct);
  $('#mtab-party').innerHTML = `<p class="hint pad">一番お金が厳しい <b>${tight.age}歳ごろ</b> を支える政策には「厳しい時期をカバー」が付きます。政策をタップすると、根拠・財源・デメリットを確認できます。</p>` +
    parties.map(p => {
      const pols = POLICIES.filter(x => x.party === p.id)
        .map(x => ({ ...x, rel: isRelevant(x.tags, set), map: policyMap(x) }))
        .sort((a, b) => b.rel - a.rel);
      return `<div class="card party-card">
        <div class="party-head">
          <div class="party-mark" style="background:${p.color}">${p.id}</div>
          <div class="party-name">${p.name}<small>描く未来：${p.vision}</small></div>
          <div class="rel">関連度<b>${p.pct}%</b></div>
        </div>
        <div class="rel-bar"><span style="width:${p.pct}%;background:${p.color}"></span></div>
        ${pols.map(x => {
          const eff = effectInfo(x.rel ? x.map : null);
          const covers = x.rel && x.map && x.map[tight.age] > 0;
          return `<button class="policy" data-policy="${x.id}">
            <div class="policy-title">${esc(x.title)}${covers ? '<span class="pill tight">厳しい時期をカバー</span>' : ''}${state.applied.includes(x.id) ? '<span class="pill applied">チャートに反映中</span>' : ''}<span class="chev">›</span></div>
            ${x.rel ? `<div class="policy-effect ${eff.cls}">${esc(eff.text)}</div>` : ''}
            <div class="policy-why">${esc(relatedText(x.tags))}</div>
          </button>`;
        }).join('')}
      </div>`;
    }).join('');

  const laws = LAWS.map(l => ({ ...l, rel: isRelevant(l.tags, set) })).sort((a, b) => b.rel - a.rel);
  $('#mtab-law').innerHTML = laws.map(l => `<div class="card info-card">
      <h2>📜 ${esc(l.title)}</h2>
      <span class="badge">${esc(l.status)}</span>
      <p style="margin-top:8px">${esc(l.body)}</p>
      <p class="hint">${esc(l.rel ? relatedText(l.tags) : 'あなたの人生設計との直接の関わりは小さい')}</p>
      <div class="source"><a href="#" data-dummy>国会・省庁の公式ページ（ダミー）</a><span>${DATA_AS_OF}</span></div>
    </div>`).join('');

  const people = PEOPLE.map(p => ({ ...p, rel: isRelevant(p.tags, set) })).sort((a, b) => b.rel - a.rel);
  $('#mtab-people').innerHTML = `<p class="hint pad">あなたの人生設計と関わる分野で活動している議員・候補者です（地域：${esc(state.profile.area || '未入力')}／すべて架空）。</p>` +
    people.map(p => {
      const party = PARTIES.find(x => x.id === p.party);
      return `<div class="card info-card">
        <div class="person"><div class="person-avatar">🧑‍💼</div>
          <div><b>${esc(p.name)}（架空）</b><div class="hint" style="margin:0">${esc(p.role)}／${party.name}</div></div>
        </div>
        <p style="margin-top:8px">${esc(p.act)}</p>
        <div class="info-meta">${p.tags.map(t => `<span class="tag" style="background:#f3f0ff">${esc(THEMES[t] || t)}</span>`).join('')}</div>
        <div class="source" style="margin-top:8px"><a href="#" data-dummy>選挙公報・議員の公式サイト（ダミー）</a><span>${DATA_AS_OF}</span></div>
      </div>`;
    }).join('');

  const hope = state.profile.hope;
  const locals = LOCALS.map(l => ({ ...l, score: l.tags.filter(t => set.has(t)).length * 2 + (hope === l.hope ? 1 : 0) }))
    .sort((a, b) => b.score - a.score);
  $('#mtab-local').innerHTML = `<p class="hint pad">国の政策だけでなく、自治体ごとの独自制度も人生設計を左右します。希望居住エリア：${{ city: '都市部', local: '地元・地方', any: 'こだわらない' }[hope]}</p>` +
    locals.map(l => `<div class="card info-card">
      <h2>🏛️ ${esc(l.name)}</h2>
      <b style="font-size:0.88rem">${esc(l.title)}</b>
      <p>${esc(l.body)}</p>
      <p class="hint">${esc(l.tags.some(t => set.has(t)) ? relatedText(l.tags.filter(t => set.has(t))) : 'あなたの人生設計との直接の関わりは小さい')}</p>
      <div class="source"><a href="#" data-dummy>自治体の公式ページ（ダミー）</a><span>${DATA_AS_OF}</span></div>
    </div>`).join('');
}

function openPolicy(id) {
  const pol = POLICIES.find(p => p.id === id);
  if (!pol) return;
  const party = PARTIES.find(p => p.id === pol.party);
  const rel = isRelevant(pol.tags);
  const map = rel ? policyMap(pol) : null;
  const eff = effectInfo(map);
  const applied = state.applied.includes(id);

  $('#policy-title').textContent = pol.title;
  $('#policy-body').innerHTML = `
    <p class="hint">${party.name}のマニフェスト（架空）</p>
    <div class="detail-block merit"><h3>あなたの人生設計への影響</h3>
      <div class="big-effect ${eff.cls === 'neg' ? 'neg' : ''}" style="color:${eff.cls === 'neg' ? '#e03131' : eff.cls === 'none' ? '#6c7086' : '#2b8a3e'}">${esc(rel ? eff.text : '直接の影響は小さい')}</div>
      <p style="margin-top:4px">${esc(pol.merit)}</p></div>
    <div class="detail-block"><h3>なぜマッチしたのか</h3>${esc(relatedText(pol.tags))}</div>
    <div class="detail-block fiscal"><h3>財源</h3>${esc(pol.fiscal)}</div>
    <div class="detail-block demerit"><h3>デメリット・懸念</h3>${esc(pol.demerit)}</div>
    ${map ? `<button class="${applied ? 'outline' : 'primary'} block" data-apply="${id}">${applied ? 'チャートから外す' : '人生設計のチャートに重ねてみる'}</button>` : ''}
    <div class="source" style="margin-top:14px"><a href="#" data-dummy>${party.name}の公式サイト・選挙公報（ダミー）</a><span>${DATA_AS_OF}</span></div>
    <p class="disclaimer">試算はモック用の仮定にもとづく概算です。実際の制度設計で金額は変わります。</p>`;
  openSheet('#policy-sheet');
}

function toggleApply(id) {
  const on = !state.applied.includes(id);
  state.applied = on ? [...state.applied, id] : state.applied.filter(x => x !== id);
  save();
  renderPlan();
  renderMatch();
  openPolicy(id);
  toast(on ? '人生設計のチャートに緑の点線で重ねました' : 'チャートから外しました');
}

/* ===== シェア ===== */
function renderShare() {
  if (!state.events.length) {
    $('#share-card').innerHTML = '<p>人生設計を作るとシェア用の画像ができます。</p>';
    return;
  }
  const rows = simulate(false);
  const set = planTags();
  const showMoney = $('#sh-money').checked;
  const showTheme = $('#sh-theme').checked;
  const showParty = $('#sh-party').checked;

  const events = state.events.filter(e => e.key !== 'study').slice(0, 6);
  const themes = Array.from(new Set(POLICIES.filter(p => isRelevant(p.tags, set) && !p.tags.includes('all'))
    .flatMap(p => p.tags.filter(t => set.has(t)).map(t => THEMES[t])))).slice(0, 4);
  const top = PARTIES.map(p => ({ ...p, pct: partyScore(p, set) })).sort((a, b) => b.pct - a.pct)[0];
  const r40 = rows.find(r => r.age === 40) || rows[rows.length - 1];

  $('#share-card').innerHTML = `
    <p class="sc-label">AIと作った、私の人生設計</p>
    <p class="sc-success">「${esc(state.success || defaultSuccess())}」</p>
    <ul class="sc-events">${events.map(e => `<li><b>${e.start}歳</b>${esc(e.name)}</li>`).join('')}</ul>
    ${showMoney ? `<div class="sc-box">💰 ${r40.age}歳時点の貯蓄見込み：${fmt(r40.savings)}</div>` : ''}
    ${showTheme && themes.length ? `<div class="sc-box">🗳️ 私の人生と関わりが強い政策テーマ：${esc(themes.join('・'))}</div>` : ''}
    ${showParty ? `<div class="sc-box">📊 関連度が最も高い政党：${top.name}（関連度${top.pct}%・投票先のおすすめではありません）</div>` : ''}
    <p class="sc-foot">#AIと考える将来設計 ／ UDC2026 モック</p>`;
}

/* ===== マイページ ===== */
function renderMypage() {
  if (state.user) {
    $('#account-name').textContent = state.user.name;
    const d = state.savedAt ? new Date(state.savedAt) : null;
    $('#account-sub').textContent = d ? `クラウドに保存済み（最終保存 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}・モック）` : 'クラウドに保存済み（モック）';
    $('#login-btn').textContent = 'ログアウト';
  } else {
    $('#account-name').textContent = 'ゲスト';
    $('#account-sub').textContent = 'ログインすると人生設計をクラウドに保存し、いつでも見直せます';
    $('#login-btn').textContent = 'ログイン / 会員登録（モック）';
  }
}

function renderAll() {
  renderPlan();
  renderMatch();
  renderShare();
  renderMypage();
  renderUndo();
}

/* ===== シート ===== */
function openSheet(sel) {
  $$('.sheet').forEach(s => s.classList.remove('open'));
  $(sel).classList.add('open');
  $(sel).setAttribute('aria-hidden', 'false');
  $('#sheet-backdrop').hidden = false;
}

function closeSheets() {
  $$('.sheet').forEach(s => {
    s.classList.remove('open');
    s.setAttribute('aria-hidden', 'true');
  });
  $('#sheet-backdrop').hidden = true;
}

/* ===== イベント ===== */
function bind() {
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-ob-next],[data-ob-prev],[data-wish],[data-value],[data-ev],[data-policy],[data-apply],[data-dummy],[data-close-sheet],[data-action-id],[data-quick],[data-restore],[data-mtab],[data-mode],.tab');
    if (!t) return;

    if (t.matches('[data-ob-next]')) {
      if (obStep === 1) state.wishFree = $('#wish-free').value.trim();
      setObStep(obStep + 1);
    } else if (t.matches('[data-ob-prev]')) {
      setObStep(Math.max(0, obStep - 1));
    } else if (t.matches('[data-wish]')) {
      const id = t.dataset.wish;
      state.wishes = state.wishes.includes(id) ? state.wishes.filter(x => x !== id) : [...state.wishes, id];
      t.classList.toggle('active');
    } else if (t.matches('[data-value]')) {
      const id = t.dataset.value;
      if (state.values.includes(id)) state.values = state.values.filter(x => x !== id);
      else state.values = [...state.values, id].slice(-2);
      $$('.value-btn').forEach(b => b.classList.toggle('active', state.values.includes(b.dataset.value)));
    } else if (t.matches('[data-ev]')) {
      openEventSheet(t.dataset.ev);
    } else if (t.matches('[data-policy]')) {
      openPolicy(t.dataset.policy);
    } else if (t.matches('[data-apply]')) {
      toggleApply(t.dataset.apply);
    } else if (t.matches('[data-dummy]')) {
      e.preventDefault();
      toast('モックのため、出典リンクはダミーです');
    } else if (t.matches('[data-close-sheet]')) {
      closeSheets();
    } else if (t.matches('[data-action-id]')) {
      const a = chatActions[t.dataset.actionId];
      if (a) a.fn();
    } else if (t.matches('[data-quick]')) {
      userSay(t.dataset.quick);
    } else if (t.matches('[data-restore]')) {
      restoreVersion(Number(t.dataset.restore));
    } else if (t.matches('[data-mtab]')) {
      $$('#match-tabs .seg').forEach(s => s.classList.toggle('active', s === t));
      $$('.mtab').forEach(m => m.classList.toggle('active', m.id === `mtab-${t.dataset.mtab}`));
    } else if (t.matches('[data-mode]')) {
      chat.mode = t.dataset.mode;
      enterChat();
    } else if (t.matches('.tab')) {
      showView(t.dataset.view);
    }
  });

  $('#to-hearing').addEventListener('click', () => {
    state.wishFree = $('#wish-free').value.trim();
    chat.mode = 'hearing';
    chat.started.hearing = false;
    chat.logs.hearing = [];
    showView('chat', { back: 'onboard' });
  });

  $('#back-btn').addEventListener('click', () => {
    const target = backTarget;
    showView(target);
    if (target === 'onboard') setObStep(1);
  });

  $('#p-scholar').addEventListener('change', e => { $('#scholar-amount-wrap').hidden = !e.target.checked; });
  $('#generate-btn').addEventListener('click', generatePlan);

  $('#undo-btn').addEventListener('click', undo);
  $('#add-event-btn').addEventListener('click', () => openEventSheet(null));
  $('#history-btn').addEventListener('click', () => { renderHistory(); openSheet('#history-sheet'); });
  $('#open-history').addEventListener('click', () => { renderHistory(); openSheet('#history-sheet'); });
  $('#event-form').addEventListener('submit', saveEvent);
  $('#event-form').addEventListener('input', onEventFormInput);
  $('#ev-delete').addEventListener('click', deleteEvent);
  $('#sheet-backdrop').addEventListener('click', closeSheets);

  $('#match-cta').addEventListener('click', () => {
    showView('match');
    if (!state.matched) runMatch();
  });
  $('#run-match').addEventListener('click', runMatch);

  $('#chat-form').addEventListener('submit', e => {
    e.preventDefault();
    const text = $('#chat-text').value.trim();
    if (!text) return;
    $('#chat-text').value = '';
    userSay(text);
  });

  ['#sh-money', '#sh-theme', '#sh-party'].forEach(sel => $(sel).addEventListener('change', renderShare));
  $('#share-btn').addEventListener('click', () => toast('画像を保存しました。SNSに投稿できます（モック）'));

  $('#login-btn').addEventListener('click', () => {
    state.user = state.user ? null : { name: 'みらい さん' };
    save();
    renderMypage();
    toast(state.user ? 'ログインしました。人生設計をクラウドに保存します（モック）' : 'ログアウトしました');
  });

  $('#edit-profile').addEventListener('click', () => {
    renderOnboard();
    showView('onboard', { back: 'mypage' });
    setObStep(1);
  });

  $('#reset-btn').addEventListener('click', () => {
    if (!confirm('人生設計・プロフィール・履歴をすべて削除します。よろしいですか？')) return;
    localStorage.removeItem(STORE_KEY);
    location.reload();
  });
}

/* ===== 起動 ===== */
bind();
renderOnboard();
if (state.events.length) {
  renderAll();
  showView('plan');
} else {
  showView('onboard');
  setObStep(0);
}
