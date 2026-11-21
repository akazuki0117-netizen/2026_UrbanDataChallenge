// PROTOTYPE（使い捨て）— SEJICA の画面案。テストもエラー処理もない。AI は呼ばず台本で返す。
// 決まった案は本実装で書き直すこと。

// ---------- サンプルデータ（すべて架空） ----------
const THEMES = [
  {
    title: '部活動の地域展開',
    desc: '中学校の休日の部活動を、学校の先生ではなく、地域のクラブや団体が受け持つようにしていく動き。',
    stats: [
      { text: '地域クラブの月会費は、平均で約3,000円かかる', src: '〇〇省「地域クラブ活動の実態調査」2025年（架空）' },
      { text: '地域クラブが1つもない市町村は、全体の約4割ある', src: 'e-Stat「〇〇調査」2025年（架空）' },
    ],
    counters: ['家庭の負担が増えて、部活をやめる子が出てしまう', '指導者のいない町では、部活そのものがなくなる'],
    samples: [
      '賛成です。先生が休日も部活を見ていて、授業の準備をする時間が足りていないと思うからです。',
      '会費は確かに心配です。でも、自治体が補助を出せば、続けられる子は多いと思います。',
      '地域によって差が出るのは問題だと思います。だから国が最低限の費用を出したうえで進めるべきです。',
    ],
  },
  {
    title: '18歳未満のSNS利用の制限',
    desc: '18歳未満がSNSを使うときに、年齢の確認や保護者の同意を必須にするかどうか。',
    stats: [
      { text: 'SNSで知り合った人とのトラブルにあった18歳未満は、年に約1,700人いる', src: '〇〇庁「〇〇の現状」2025年（架空）' },
      { text: '中高生の約9割が、毎日SNSを使っている', src: 'e-Stat「〇〇調査」2025年（架空）' },
    ],
    counters: ['友達との連絡までできなくなる', '年齢をごまかす子が増えるだけになる'],
    samples: [
      '反対です。SNSは友達との連絡や、調べものに使っていて、制限されると困るからです。',
      'トラブルが多いのは分かりました。でも、禁止より、学校で使い方を学ぶほうが効果があると思います。',
      '危ない人をブロックする仕組みは必要だと思います。ただ、使うこと自体は制限しないでほしいです。',
    ],
  },
  {
    title: '最低賃金の引き上げ',
    desc: '働いた1時間あたりに払わなければならない、いちばん低い給料を上げるかどうか。',
    stats: [
      { text: '従業員20人未満の会社の約3割が、赤字になっている', src: 'e-Stat「〇〇調査」2025年（架空）' },
      { text: '最低賃金の近くで働く人の約6割が、パート・アルバイト', src: '〇〇省「〇〇白書」2025年（架空）' },
    ],
    counters: ['小さな会社がつぶれて、仕事そのものが減る', '人を雇うのを減らす会社が出る'],
    samples: [
      '賛成です。物の値段が上がっているのに、給料が上がらないと生活できないからです。',
      '小さな会社が苦しいのは分かります。だから、上げた分の一部を国が手伝うのがいいと思います。',
      '一気に上げるのは危ないと思います。数年かけて少しずつ上げるべきです。',
    ],
  },
  { title: '選択的夫婦別姓', desc: '結婚したあとも、夫婦がそれぞれ元の名字を名乗れるようにするかどうか。', stats: [], counters: [], samples: [] },
  { title: '大学の奨学金の返済', desc: '大学で借りた奨学金の返済を、国が一部肩代わりするかどうか。', stats: [], counters: [], samples: [] },
  { title: '消費税の税率', desc: '買い物のときにかかる消費税を、下げるか、今のままにするか。', stats: [], counters: [], samples: [] },
];
const PLAYABLE = [0, 1, 2]; // 試作で台本があるテーマ

const CHARAS = [
  { key: 'kind', name: 'やさしい政治家', ava: '🌸', tone: 'ていねい', edge: '1つの論点をやさしく', mult: 1.0 },
  { key: 'normal', name: 'ふつうの政治家', ava: '📘', tone: 'ふつう', edge: '論点をはっきり', mult: 1.2 },
  { key: 'strict', name: 'きびしい政治家', ava: '🔥', tone: '強め（人格は否定しない）', edge: '弱いところをつく', mult: 1.5 },
];

const LINES = {
  kind: {
    r: (st, c) => `なるほど、そう考えたんですね。ひとつ一緒に考えたいことがあります。${st.text}そうです。これだと「${c}」という心配もありそうですが、どう思いますか？`,
    close: '最後まで自分の言葉で話してくれて、ありがとう。反対の意見も受け止めてから答えていたのが、とても良かったですよ。',
  },
  normal: {
    r: (st, c) => `その主張には一理あります。ただ、${st.text}というデータがあります。「${c}」のではありませんか？`,
    close: '意見がはっきりしていて、議論しがいがありました。数字を使って言い返せると、もっと強くなりますよ。',
  },
  strict: {
    r: (st, c) => `気持ちは分かる。だが、それだけでは根拠が足りない。${st.text}。「${c}」。それでも同じことが言えるか？`,
    close: '……ふん。最後の答えは悪くなかった。次はもっと数字で攻めてこい。',
  },
};

const PARTIES = [
  { name: 'みなも党', color: '#2f8fd8', near: 82, page: 'p.12', x: 0.35, y: 0.55 },
  { name: 'あさひ党', color: '#e8833a', near: 64, page: 'p.8', x: 0.6, y: 0.1 },
  { name: 'いぶき党', color: '#d4a017', near: 41, page: 'p.20', x: -0.15, y: -0.3 },
  { name: 'もりの党', color: '#3c9a5a', near: 23, page: 'p.5', x: -0.6, y: -0.55 },
  { name: 'そよかぜ党', color: '#9b59b6', near: null, page: null, x: -0.3, y: 0.7 },
];
const ME_POS = { x: 0.25, y: 0.4 };

const SCORE = { 根拠: 18, 具体性: 12, 応答: 21, 受け止め: 16 };
const STYLE_OF = { 根拠: 'データ派', 具体性: 'データ派', 応答: '反撃派', 受け止め: '共感派' };
const STYLE_DESC = {
  データ派: '理由や数字で主張を固めるタイプ。',
  反撃派: '反論に正面から言い返すのが得意なタイプ。',
  共感派: '相手の意見の良いところを認めてから話すタイプ。',
};

const PHASES = [
  ['entry', '入口'],
  ['theme', 'テーマ'],
  ['chara', '対戦相手'],
  ['debate', '議論'],
  ['result', '結果'],
  ['type', '3テーマ後'],
];
const VARIANTS = [
  ['A', 'トーク'],
  ['B', '討論ステージ'],
  ['C', '論点ボード'],
];

// ---------- 状態 ----------
const params = new URLSearchParams(location.search);
const state = {
  variant: VARIANTS.some(v => v[0] === params.get('variant')) ? params.get('variant') : 'A',
  phase: PHASES.some(p => p[0] === params.get('phase')) ? params.get('phase') : 'entry',
  theme: 0,
  rerolled: false,
  spin: false,
  chara: 'normal',
  charaIdx: 1,
  log: [],
  typing: false,
  warn: '',
  slide: 0,
  tab: 0,
  shared: false,
  ageNo: false,
};

// ---------- 小物 ----------
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const theme = () => THEMES[state.theme];
const chara = () => CHARAS.find(c => c.key === state.chara);
const myCount = () => state.log.filter(m => m.who === 'me').length;
const done = () => state.log.some(m => m.close);
const round = () => Math.min(myCount() + 1, 3);
const rawTotal = () => Object.values(SCORE).reduce((a, b) => a + b, 0);
const total = () => Math.round(rawTotal() * chara().mult);
const style = () => STYLE_OF[Object.keys(SCORE).sort((a, b) => SCORE[b] - SCORE[a])[0]];
const sample = '<p class="sample-note">政党名・統計・マニフェストのページはすべて架空のサンプルです</p>';
const srcTag = st => `<a class="src" href="#" onclick="return false">${esc(st.src)}</a>`;
const PRIVATE = /\d{2,4}-\d{2,4}-\d{4}|[一-龥]{1,6}(中学校|中学|高校)/;

function composer(ph) {
  const n = myCount();
  const label = n === 0 ? 'あなたの主張' : `あなたの再反論（${n}/2）`;
  return `
    <div class="composer">
      <textarea id="draft" maxlength="200" placeholder="${ph || label + 'を140字以内で'}"></textarea>
      <div class="row">
        <button class="linkbtn" data-act="sample">例文を入れる</button>
        <span id="count">0 / 140</span>
      </div>
      ${state.warn ? `<p class="note" style="color:var(--accent)">${state.warn}</p>` : ''}
      <button class="btn" data-act="send" id="send" disabled>送る</button>
    </div>`;
}

function axisSvg() {
  const P = v => 130 + v * 100;
  const Q = v => 130 - v * 100;
  const dots = PARTIES.map(p => `
    <circle cx="${P(p.x)}" cy="${Q(p.y)}" r="7" fill="${p.color}"/>
    <text x="${P(p.x) + 10}" y="${Q(p.y) + 4}" font-size="11" fill="#1d2230">${p.name}</text>`).join('');
  return `
    <div class="axis"><svg viewBox="0 0 260 260" role="img" aria-label="考えの傾向の図">
      <rect x="0" y="0" width="260" height="260" rx="14" fill="#f6f7f9"/>
      <line x1="20" y1="130" x2="240" y2="130" stroke="#c7ccd6"/>
      <line x1="130" y1="20" x2="130" y2="240" stroke="#c7ccd6"/>
      <text x="236" y="146" font-size="10" text-anchor="end" fill="#6b7385">変える →</text>
      <text x="24" y="146" font-size="10" fill="#6b7385">← 今を保つ</text>
      <text x="136" y="30" font-size="10" fill="#6b7385">↑ 社会で支える</text>
      <text x="136" y="236" font-size="10" fill="#6b7385">↓ 個人や市場にまかせる</text>
      ${dots}
      <text x="${P(ME_POS.x)}" y="${Q(ME_POS.y) + 7}" font-size="22" text-anchor="middle">⭐</text>
      <text x="${P(ME_POS.x)}" y="${Q(ME_POS.y) - 12}" font-size="11" font-weight="700" text-anchor="middle" fill="#d94f3d">あなた</text>
    </svg></div>`;
}

function partyList(withSrc) {
  return PARTIES.map(p => p.near == null
    ? `<div class="party none"><span>${p.name}</span><span>このテーマはマニフェストに記載なし（計算から外しています）</span><span></span></div>`
    : `<div class="party"><span>${p.name}</span><div class="track"><div class="fill" style="width:${p.near}%;background:${p.color}"></div></div><b>${p.near}%</b>
       ${withSrc ? `<a class="src manifesto" href="#" onclick="return false">根拠：${p.name} マニフェスト ${p.page}</a>` : ''}</div>`).join('')
    + '<p class="note">党との近さは参考です。投票先をすすめるものではありません。</p>';
}

function scoreBars() {
  return `<div class="bars">${Object.entries(SCORE).map(([k, v]) =>
    `<div class="bar"><span>${k}</span><div class="track"><div class="fill" style="width:${v * 4}%"></div></div><span>${v}/25</span></div>`).join('')}</div>`;
}

function shareBlock() {
  return `
    <div class="share-card">
      <div class="sub" style="color:#c9c3dd">SEJICA ／ ${chara().name}と議論した</div>
      <div class="s">${total()}点</div>
      <div>話し方のタイプ：<b>${style()}</b></div>
    </div>
    <p class="sub">シェアに入るのは、点数・話し方のタイプ・キャラクター名だけ。党の名前は入りません。</p>
    <button class="btn" data-act="share">${state.shared ? 'シェアしました（試作）' : 'シェアする'}</button>`;
}

function sections(mode) {
  if (mode === 'type') {
    return [
      { label: '党のタイプ', html: `<h2>あなたに向いている党のタイプ</h2><p class="sub">3テーマ（部活動の地域展開・SNSの制限・最低賃金）のやり取り全体から分析しました</p>${partyList(true)}` },
      { label: '考えの傾向', html: `<h2>考えの傾向</h2><p class="sub">⭐があなた。各党はマニフェストの立場から置いています</p>${axisSvg()}` },
      { label: '話し方', html: `<h2>話し方の傾向</h2><p>3回とも <b>${style()}</b> でした。</p><p class="sub">${STYLE_DESC[style()]}</p>${scoreBars()}<p class="sub">（3回の平均）</p>` },
    ];
  }
  return [
    {
      label: '点数', html: `
      <h2>主張点数</h2>
      <div class="bigscore">${total()}<small> 点</small></div>
      <p class="sub">${rawTotal()}点 × ${chara().name}の倍率 ${chara().mult.toFixed(1)}</p>
      ${scoreBars()}
      <p class="note">賛成か反対かでは点数は変わりません。話し方の質だけで決まります。</p>`,
    },
    {
      label: '話し方', html: `
      <h2>話し方のタイプ</h2>
      <p style="font-size:26px;font-weight:900">${style()}</p>
      <p class="sub">${STYLE_DESC[style()]}</p>
      <h3 style="margin-top:14px">議論のなかで、考えが動きました</h3>
      <div class="stance"><span>賛成</span>→<span>どちらかといえば賛成</span></div>
      <p class="sub">反論を受けて考えを動かせるのは、失点ではありません。</p>`,
    },
    { label: '近い党', html: `<h2>このテーマで近い党</h2><p class="sub">「${theme().title}」のやり取り全体から分析しました</p>${partyList(true)}` },
    {
      label: '傾向・シェア', html: `
      <h2>考えの傾向</h2>${axisSvg()}
      <p class="note">あと2テーマ遊ぶと「向いている党のタイプ」がわかります（1/3）</p>
      ${shareBlock()}
      <button class="btn ghost" data-act="again">別のテーマで遊ぶ</button>`,
    },
  ];
}

// ---------- 共通の場面 ----------
function renderEntry() {
  return `
    <div class="entry">
      <div class="logo">SEJICA</div>
      <p><b>きみの主張、政治家に通じるか？</b></p>
      <p class="sub">テーマについて140字で主張して、AI政治家と3ターン議論しよう</p>
      <p class="q">あなたは18歳以下ですか？</p>
      <button class="btn" data-act="age-yes">はい</button>
      <button class="btn ghost" data-act="age-no">いいえ</button>
      ${state.ageNo ? '<p class="note">SEJICA は18歳以下の人のためのアプリです。</p>' : ''}
      <ul>
        <li>書いた文章は保存されません</li>
        <li>名前・学校名・電話番号は書かないでね</li>
        <li>1日5回まで遊べます</li>
      </ul>
    </div>${sample}`;
}

// ---------- A トーク ----------
const A = {
  theme() {
    const t = theme();
    return `
      <p class="chip">今日のテーマ</p>
      <h1 style="margin-top:8px">${t.title}</h1>
      <p>${t.desc}</p>
      <button class="btn" data-act="theme-ok">このテーマで議論する</button>
      <button class="btn ghost" data-act="reroll" ${state.rerolled ? 'disabled' : ''}>${state.rerolled ? '引き直しは使いました' : 'テーマを引き直す（1回だけ）'}</button>${sample}`;
  },
  chara() {
    return `
      <h2>議論する相手を選ぼう</h2>
      <div class="a-list">${CHARAS.map(c => `
        <button class="item ${c.key === state.chara ? 'on' : ''}" data-act="pick-chara" data-key="${c.key}">
          <span class="ava">${c.ava}</span>
          <span><b>${c.name}</b>　<span class="chip">×${c.mult.toFixed(1)}</span><br><span class="sub">${c.tone}・${c.edge}</span></span>
        </button>`).join('')}</div>
      <button class="btn" data-act="chara-ok">この人と議論する</button>`;
  },
  debate() {
    const c = chara();
    const log = state.log.map(m => m.who === 'me'
      ? `<div class="msg me"><div class="bubble">${esc(m.text)}</div></div>`
      : `<div class="msg ai"><div class="who">${c.ava} ${c.name}</div><div class="bubble">${esc(m.text)}</div>${m.st ? srcTag(m.st) : ''}</div>`).join('');
    return `
      <div class="a-head"><span class="ava">${c.ava}</span><div><b>${c.name}</b><div class="t">ターン ${round()}/3</div></div></div>
      <div class="a-theme">テーマ：<b>${theme().title}</b></div>
      <div class="a-log">
        <div class="msg ai"><div class="who">${c.ava} ${c.name}</div><div class="bubble">「${theme().title}」について、きみの考えを聞かせてほしい。</div></div>
        ${log}
        ${state.typing ? `<div class="typing">${c.name}が入力中…</div>` : ''}
      </div>
      ${done() ? '<button class="btn" data-act="to-result">結果を見る</button>' : state.typing ? '' : composer()}`;
  },
  result(mode) {
    return sections(mode).map((s, i) => `<div class="${i ? 'a-section' : ''}">${s.html}</div>`).join('') + sample;
  },
};

// ---------- B 討論ステージ ----------
const B = {
  theme() {
    const t = theme();
    return `
      <p class="b-step">テーマ抽選</p>
      <div class="b-roulette ${state.spin ? 'spin' : ''}">
        <span class="sub" style="color:#ffd9d2">今日のテーマ</span>
        <div class="big">${t.title}</div>
        <p style="font-size:13px">${t.desc}</p>
      </div>
      <button class="btn" data-act="theme-ok">受けて立つ</button>
      <button class="btn ghost" data-act="reroll" ${state.rerolled ? 'disabled' : ''}>${state.rerolled ? 'もう引き直せません' : 'もう一度引く（残り1回）'}</button>${sample}`;
  },
  chara() {
    const c = CHARAS[state.charaIdx];
    return `
      <p class="b-step">対戦相手</p>
      <div class="b-carousel">
        <button data-act="chara-prev" aria-label="前">‹</button>
        <div class="b-chara">
          <div class="ava">${c.ava}</div>
          <h2>${c.name}</h2>
          <p style="opacity:.8;font-size:13px">言い方：${c.tone}<br>反論：${c.edge}</p>
          <div class="mult">点数 ×${c.mult.toFixed(1)}</div>
        </div>
        <button data-act="chara-next" aria-label="次">›</button>
      </div>
      <div class="b-dots">${CHARAS.map((_, i) => i === state.charaIdx ? '<b>●</b>' : '●').join('')}</div>
      <button class="btn" data-act="chara-ok-b">この人に挑む</button>`;
  },
  debate() {
    const c = chara();
    const lastAi = [...state.log].reverse().find(m => m.who === 'ai');
    const lastMe = [...state.log].reverse().find(m => m.who === 'me');
    const say = state.typing ? '……' : lastAi ? esc(lastAi.text) : `「${theme().title}」について、きみの考えを聞かせてもらおう。`;
    const hist = state.log.length ? `
      <details class="b-hist"><summary>これまでのやり取り（${state.log.length}件）</summary>
        ${state.log.map(m => `<p><b>${m.who === 'me' ? 'あなた' : c.name}：</b>${esc(m.text)}</p>`).join('')}
      </details>` : '';
    return `
      <div class="b-stage">
        <div class="b-round">${[1, 2, 3].map(i => `<i class="${i <= round() ? 'on' : ''}"></i>`).join('')}</div>
        <div class="b-pol">${c.ava}</div>
        <div class="b-name">${c.name}　／　${theme().title}</div>
        <div class="b-say">${say}${lastAi && lastAi.st && !state.typing ? `<br>${srcTag(lastAi.st)}` : ''}</div>
      </div>
      <div class="b-podium">
        ${lastMe ? `<div class="b-mine"><b>あなた：</b>${esc(lastMe.text)}</div>` : ''}
        ${done() ? '<button class="btn" data-act="to-result">判定を聞く</button>'
          : state.typing ? '' : `<p class="label" style="margin-top:12px">▶ あなたの番　ラウンド ${round()}/3</p>${composer()}`}
        ${hist}
      </div>`;
  },
  result(mode) {
    const ss = sections(mode);
    const i = Math.min(state.slide, ss.length - 1);
    return `
      <p class="b-step">${i + 1} / ${ss.length}</p>
      <div class="b-slide">${ss[i].html}</div>
      ${i < ss.length - 1 ? `<button class="btn" data-act="slide-next">次へ（${ss[i + 1].label}）</button>` : ''}
      ${i > 0 ? '<button class="btn ghost" data-act="slide-prev">戻る</button>' : ''}${sample}`;
  },
};

// ---------- C 論点ボード ----------
const C = {
  theme() {
    return `
      <h2>テーマのカード</h2>
      <p class="sub">8〜10枚のなかから、ランダムに1枚めくります</p>
      <div class="c-grid">${THEMES.map((t, i) => {
        const open = i === state.theme;
        const used = state.prev === i;
        return `<div class="c-card ${open ? 'open' : ''} ${used ? 'used' : ''}">${open || used ? t.title : '？'}</div>`;
      }).join('')}</div>
      <p class="note"><b>${theme().title}</b><br>${theme().desc}</p>
      <button class="btn" data-act="theme-ok">このテーマで議論する</button>
      <button class="btn ghost" data-act="reroll" ${state.rerolled ? 'disabled' : ''}>${state.rerolled ? '引き直しは使いました' : '別のカードをめくる（1回だけ）'}</button>${sample}`;
  },
  chara() {
    return `
      <h2>対戦相手を比べて選ぶ</h2>
      <table class="c-cmp">
        <tr><th></th><th>言い方</th><th>反論の鋭さ</th><th>倍率</th></tr>
        ${CHARAS.map(c => `<tr class="${c.key === state.chara ? 'on' : ''}">
          <td class="pick" data-act="pick-chara" data-key="${c.key}">${c.ava}<br><b style="font-size:12px">${c.name}</b></td>
          <td class="pick" data-act="pick-chara" data-key="${c.key}">${c.tone}</td>
          <td class="pick" data-act="pick-chara" data-key="${c.key}">${c.edge}</td>
          <td class="pick" data-act="pick-chara" data-key="${c.key}"><b>×${c.mult.toFixed(1)}</b></td></tr>`).join('')}
      </table>
      <button class="btn" data-act="chara-ok">${chara().name}と議論する</button>`;
  },
  debate() {
    const c = chara();
    const mine = state.log.filter(m => m.who === 'me');
    const ais = state.log.filter(m => m.who === 'ai');
    const rows = [0, 1, 2].map(i => {
      const me = mine[i];
      const ai = ais[i];
      const now = !done() && i === myCount();
      return `<tr class="${now ? 'now' : ''}">
        <td class="r">${i + 1}</td>
        <td class="${me ? '' : 'empty'}">${me ? esc(me.text) : now ? '← いま書く' : '—'}</td>
        <td class="${ai ? '' : 'empty'}">${ai ? esc(ai.text) + (ai.st ? '<br>' + srcTag(ai.st) : '') : state.typing && i === myCount() - 1 ? '考え中…' : '—'}</td></tr>`;
    }).join('');
    const usedSrc = ais.map(m => m.st && m.st.src);
    return `
      <div class="c-top">
        <div class="meta"><span>テーマ</span><span>${c.ava} ${c.name}　ラウンド ${round()}/3</span></div>
        <h2 style="margin:2px 0 0">${theme().title}</h2>
      </div>
      <table class="c-board">
        <tr><th style="width:34px"></th><th class="me">あなた</th><th class="ai">${c.name}</th></tr>
        ${rows}
      </table>
      ${done() ? '<button class="btn" data-act="to-result">結果を見る</button>' : state.typing ? '' : composer()}
      <div class="c-stats">
        <h3>政治家が反論に使える統計</h3>
        <p class="sub" style="font-size:11px">政治家はこのリストの統計からだけ反論します。党の方針は言いません。</p>
        <ul>${theme().stats.map(s => `<li class="${usedSrc.includes(s.src) ? 'used' : ''}">${s.text}<br><span class="sub">${s.src}</span></li>`).join('')}</ul>
      </div>${sample}`;
  },
  result(mode) {
    const ss = sections(mode);
    const i = Math.min(state.tab, ss.length - 1);
    const kpis = mode === 'type' ? '' : `
      <div class="c-kpis">
        <div class="c-kpi"><div class="k">主張点数</div><div class="v">${total()}点</div></div>
        <div class="c-kpi"><div class="k">話し方のタイプ</div><div class="v">${style()}</div></div>
      </div>`;
    return `
      ${kpis}
      <div class="c-tabs">${ss.map((s, j) => `<button class="${i === j ? 'on' : ''}" data-act="tab" data-key="${j}">${s.label}</button>`).join('')}</div>
      ${ss[i].html}${sample}`;
  },
};

// ---------- 描画 ----------
const VIEWS = { A, B, C };
function render() {
  const v = VIEWS[state.variant];
  const p = state.phase;
  if (!PLAYABLE.includes(state.theme)) state.theme = 0;
  $app.innerHTML = p === 'entry' ? renderEntry()
    : p === 'result' ? v.result('result')
    : p === 'type' ? v.result('type')
    : v[p]();
  document.getElementById('proto-label').textContent = `${state.variant}（${VARIANTS.find(x => x[0] === state.variant)[1]}）`;
  document.getElementById('proto-phase').value = p;
}

function go(phase) {
  state.phase = phase;
  state.slide = 0;
  state.tab = 0;
  state.warn = '';
  sync();
  render();
  window.scrollTo(0, 0);
}

function sync() {
  const q = new URLSearchParams(location.search);
  q.set('variant', state.variant);
  q.set('phase', state.phase);
  history.replaceState(null, '', '?' + q);
}

function send() {
  const box = document.getElementById('draft');
  const text = box.value.trim();
  if (!text || text.length > 140) return;
  if (PRIVATE.test(text)) {
    state.warn = '名前・学校名・電話番号のようなものが入っているかもしれません。消してから送ってね。（AI には送っていません）';
    render();
    document.getElementById('draft').value = text;
    onInput();
    return;
  }
  state.warn = '';
  state.log.push({ who: 'me', text });
  state.typing = true;
  render();
  setTimeout(() => {
    const n = myCount();
    const lines = LINES[state.chara];
    const t = theme();
    if (n < 3) state.log.push({ who: 'ai', text: lines.r(t.stats[n - 1], t.counters[n - 1]), st: t.stats[n - 1] });
    else state.log.push({ who: 'ai', text: lines.close, close: true });
    state.typing = false;
    render();
  }, 800);
}

function onInput() {
  const box = document.getElementById('draft');
  if (!box) return;
  const n = box.value.length;
  const cnt = document.getElementById('count');
  cnt.textContent = `${n} / 140`;
  cnt.className = n > 140 ? 'over' : '';
  document.getElementById('send').disabled = !box.value.trim() || n > 140;
}

function startDebate() {
  state.log = [];
  go('debate');
}

// ---------- 操作 ----------
const $app = document.getElementById('app');
$app.addEventListener('input', e => { if (e.target.id === 'draft') onInput(); });
$app.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  if (act === 'age-yes') go('theme');
  if (act === 'age-no') { state.ageNo = true; render(); }
  if (act === 'reroll' && !state.rerolled) {
    state.prev = state.theme;
    const others = PLAYABLE.filter(i => i !== state.theme);
    state.theme = others[Math.floor(Math.random() * others.length)];
    state.rerolled = true;
    state.spin = true;
    render();
    state.spin = false;
  }
  if (act === 'theme-ok') go('chara');
  if (act === 'pick-chara') { state.chara = el.dataset.key; render(); }
  if (act === 'chara-prev' || act === 'chara-next') {
    state.charaIdx = (state.charaIdx + (act === 'chara-next' ? 1 : -1) + CHARAS.length) % CHARAS.length;
    state.chara = CHARAS[state.charaIdx].key;
    render();
  }
  if (act === 'chara-ok' || act === 'chara-ok-b') startDebate();
  if (act === 'sample') {
    const box = document.getElementById('draft');
    box.value = theme().samples[Math.min(myCount(), 2)];
    onInput();
  }
  if (act === 'send') send();
  if (act === 'to-result') go('result');
  if (act === 'slide-next') { state.slide++; render(); window.scrollTo(0, 0); }
  if (act === 'slide-prev') { state.slide--; render(); window.scrollTo(0, 0); }
  if (act === 'tab') { state.tab = Number(el.dataset.key); render(); }
  if (act === 'share') { state.shared = true; render(); }
  if (act === 'again') {
    state.theme = PLAYABLE.filter(i => i !== state.theme)[0];
    state.rerolled = false;
    state.prev = undefined;
    state.shared = false;
    state.log = [];
    go('theme');
  }
});

// ---------- 試作の切り替えバー ----------
const phaseSel = document.getElementById('proto-phase');
phaseSel.innerHTML = PHASES.map(([k, l]) => `<option value="${k}">${l}</option>`).join('');
phaseSel.addEventListener('change', () => go(phaseSel.value));

function cycle(d) {
  const i = VARIANTS.findIndex(v => v[0] === state.variant);
  state.variant = VARIANTS[(i + d + VARIANTS.length) % VARIANTS.length][0];
  state.charaIdx = CHARAS.findIndex(c => c.key === state.chara);
  sync();
  render();
}
document.getElementById('proto-bar').addEventListener('click', e => {
  const b = e.target.closest('[data-proto]');
  if (b) cycle(b.dataset.proto === 'next' ? 1 : -1);
});
document.addEventListener('keydown', e => {
  const t = e.target;
  if (t.matches('input, textarea, select, [contenteditable]')) return;
  if (e.key === 'ArrowRight') cycle(1);
  if (e.key === 'ArrowLeft') cycle(-1);
});

state.charaIdx = CHARAS.findIndex(c => c.key === state.chara);
render();
