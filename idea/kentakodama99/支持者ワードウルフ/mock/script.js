// PROTOTYPE（使い捨て）— 支持者ワードウルフの画面案。テストもエラー処理もない。
// 決まった案は本実装で書き直すこと。

// ---------- サンプルデータ（すべて架空） ----------
const PARTY = {
  A: { name: 'あさひ党', color: '#e8833a', soft: '#fdebdc' },
  B: { name: 'みなも党', color: '#2f8fd8', soft: '#dcecfa' },
};

// <m>…</m> が「ズレている部分」
const THEMES = [
  { key: 'price', label: '物価', A: '消費税を2年間だけ<m>5%に下げる</m>', B: '<m>食料品の</m>消費税を2年間だけ<m>0%にする</m>' },
  { key: 'edu', label: '教育', A: '<m>高校</m>の授業料を<m>所得に関係なく</m>無償にする', B: '<m>大学</m>の授業料を<m>所得に応じて</m>無償にする' },
  { key: 'sns', label: 'SNS', A: '18歳未満のSNS利用に<m>保護者の同意を必須</m>にする', B: '18歳未満のSNS利用は<m>学校の授業で使い方を学ぶ</m>ことで守る' },
  { key: 'club', label: '部活', A: '部活動の地域展開に<m>国が費用を出す</m>', B: '部活動の地域展開は<m>自治体の判断に任せる</m>' },
];

const QUOTES = {
  A: { who: 'あさひ党 山田〇〇 議員', where: '第2XX回国会 財務金融委員会', text: '物価高で一番苦しいのは子育て世帯です。消費税の時限的な引き下げで、家計を直接支えるべきだと考えます。' },
  B: { who: 'みなも党 佐藤〇〇 議員', where: '第2XX回国会 予算委員会', text: '全品目の減税は高所得の方ほど得をします。食料品に絞ることで、本当に必要な家庭に届けるべきです。' },
};

const PLAYERS = [
  { id: 0, name: 'あなた', party: 'A' },
  { id: 1, name: 'ゆうと', party: 'A' },
  { id: 2, name: 'さき', party: 'B' },
  { id: 3, name: 'はると', party: 'A' },
  { id: 4, name: 'みお', party: 'B' },
  { id: 5, name: 'そうた', party: 'A' },
];
const ME = PLAYERS[0];
const VOTES = { 0: 2, 1: 2, 2: 3, 3: 2, 4: 1, 5: 4 }; // 誰が誰に入れたか（結果画面用）

const PHASES = [
  ['match', 'マッチング'],
  ['card', '支持者カード'],
  ['talk', '話し合い'],
  ['vote', '投票'],
  ['result', '結果'],
  ['review', '振り返り'],
];
const VARIANTS = [
  ['A', '円卓'],
  ['B', '通話'],
  ['C', 'カードゲーム'],
];

// ---------- 状態 ----------
const params = new URLSearchParams(location.search);
const state = {
  variant: VARIANTS.some(v => v[0] === params.get('variant')) ? params.get('variant') : 'A',
  phase: PHASES.some(p => p[0] === params.get('phase')) ? params.get('phase') : 'match',
  flipped: false,
  sheetOpen: false,
  selected: null,
  muted: new Set(),
  reported: new Set(),
  tab: 'price',
  secs: 180,
  waitSecs: 60,
  joined: 1,
  speaking: 1,
  cardIndex: 0,
};

// ---------- 小物 ----------
const strip = s => s.replace(/<\/?m>/g, '');
const marked = s => s.replace(/<m>/g, '<mark>').replace(/<\/m>/g, '</mark>');
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const roleNote = '<p class="role-note">これは<b>役</b>として配られた支持者です。あなた自身の考えではありません。</p>';
const sample = '<p class="sample-note">政党名・主張・発言はすべて架空のサンプルです</p>';
const wolfCount = n => (n >= 6 ? 2 : 1);
const tally = () => {
  const t = {};
  Object.values(VOTES).forEach(v => { t[v] = (t[v] || 0) + 1; });
  return t;
};
const exiled = () => {
  const t = tally();
  return Number(Object.keys(t).sort((a, b) => t[b] - t[a])[0]);
};
function avatar(p, opts = {}) {
  const reveal = opts.reveal;
  const bg = reveal ? PARTY[p.party].color : '#5b6170';
  const cls = ['av'];
  if (opts.speaking) cls.push('speaking');
  if (opts.selected) cls.push('selected');
  return `<span class="${cls.join(' ')}" style="background:${bg}">${p.name[0]}</span>`;
}

// ---------- A 円卓 ----------
const VariantA = {
  seat(i, n, r) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return `left:calc(50% + ${Math.cos(a) * r}px);top:calc(50% + ${Math.sin(a) * r}px)`;
  },
  table(center, seatFn) {
    return `<div class="va-table"><div class="va-felt"></div>
      ${PLAYERS.map((p, i) => `<div class="va-seat" style="${this.seat(i, PLAYERS.length, 128)}">${seatFn(p)}</div>`).join('')}
      <div class="va-center">${center}</div></div>`;
  },
  cardFace() {
    const p = PARTY[ME.party];
    return `<div class="va-card" style="--pc:${p.color};--ps:${p.soft}">
      <div class="va-card-head">あなたは <b>${p.name}</b> の支持者</div>
      <ol>${THEMES.map(t => `<li><span class="tag">${t.label}</span>${strip(t[ME.party])}</li>`).join('')}</ol>
      <a class="src" href="#">出典：${p.name} マニフェスト（2026年衆院選）</a></div>`;
  },
  render(ph) {
    const head = t => `<header class="va-head"><span>支持者ワードウルフ</span><b>${t}</b></header>`;
    if (ph === 'match') {
      const n = 8;
      const seats = Array.from({ length: n }, (_, i) => `<div class="va-seat" style="${this.seat(i, n, 128)}"><span class="av ${i < state.joined ? '' : 'empty'}">${i < state.joined ? '●' : ''}</span></div>`).join('');
      return `${head('マッチング中')}<div class="va-table"><div class="va-felt"></div>${seats}
        <div class="va-center"><div class="big">${state.joined}<small>/8人</small></div><div>あと ${mmss(state.waitSecs)}</div></div></div>
        <p class="va-hint">3人そろえば始まります。60秒で集まらなければトップに戻ります</p>
        <button class="btn ghost" data-act="next">（デモ）そろったことにする</button>`;
    }
    if (ph === 'card') {
      const center = state.flipped ? '' : `<button class="va-back" data-act="flip">タップしてカードをめくる</button>`;
      return `${head('カード配布')}${this.table(center, p => avatar(p))}
        ${state.flipped ? `<div class="va-overlay">${this.cardFace()}${roleNote}<button class="btn" data-act="next">話し合いへ</button></div>` : ''}
        <p class="va-hint">6人なのでウルフは${wolfCount(6)}人。あなたがウルフかどうかは分かりません</p>`;
    }
    if (ph === 'talk') {
      const pct = (state.secs / 180) * 100;
      const center = `<div class="va-ring" style="--p:${pct}"><span>${mmss(state.secs)}</span></div>
        <button class="chip" data-act="sheet">カードを見る</button>`;
      return `${head('話し合い')}${this.table(center, p => `${avatar(p, { speaking: state.speaking === p.id })}<small>${p.name}${state.muted.has(p.id) ? ' 🔇' : ''}</small>`)}
        <div class="va-mic"><button class="mic on">🎙 話す</button><span>長押しで個別にミュート・通報</span></div>
        ${state.sheetOpen ? `<div class="va-overlay" data-act="sheet">${this.cardFace()}<p class="va-hint">タップで閉じる</p></div>` : ''}
        <button class="btn ghost" data-act="next">（デモ）時間切れにする</button>`;
    }
    if (ph === 'vote') {
      const center = state.selected == null ? '<div>ウルフだと思う人を<br>タップ</div>' : `<div><b>${PLAYERS[state.selected].name}</b> に投票</div>`;
      return `${head('投票')}${this.table(center, p => p.id === 0 ? `${avatar(p)}<small>あなた</small>` : `<button class="seatbtn" data-act="vote:${p.id}">${avatar(p, { selected: state.selected === p.id })}<small>${p.name}</small></button>`)}
        <p class="va-hint">投票は1回だけ。同数ならウルフの勝ち</p>
        <button class="btn" data-act="next" ${state.selected == null ? 'disabled' : ''}>投票する</button>`;
    }
    if (ph === 'result') {
      const ex = exiled();
      const win = PLAYERS[ex].party === 'B';
      const t = tally();
      return `${head('結果')}<div class="va-banner ${win ? 'win' : 'lose'}">${win ? '多数派の勝ち！' : 'ウルフの勝ち！'}</div>
        ${this.table(`<div>${PARTY.A.name}<br>vs<br>${PARTY.B.name}</div>`, p => `${avatar(p, { reveal: true })}<small>${p.name} ${t[p.id] ? `🗳${t[p.id]}` : ''}</small>`)}
        <p class="va-hint">ウルフは <b style="color:${PARTY.B.color}">さき・みお（${PARTY.B.name}）</b> でした</p>
        <button class="btn" data-act="next">どこがズレていたか見る</button>`;
    }
    // review: 左右2列の比較表
    return `${head('振り返り')}<div class="va-compare">
      <div class="va-col-head" style="background:${PARTY.A.color}">${PARTY.A.name}<small>多数派</small></div>
      <div class="va-col-head" style="background:${PARTY.B.color}">${PARTY.B.name}<small>ウルフ</small></div>
      ${THEMES.map(t => `<div class="va-row-label">${t.label}</div><div class="va-cell">${marked(t.A)}</div><div class="va-cell">${marked(t.B)}</div>`).join('')}
      </div>
      <h3 class="sec">国会ではこう言っていた（物価）</h3>
      ${['A', 'B'].map(k => `<blockquote class="quote" style="border-color:${PARTY[k].color}"><p>${QUOTES[k].text}</p><cite>${QUOTES[k].who}／${QUOTES[k].where}　<a href="#">会議録で前後を読む</a></cite></blockquote>`).join('')}
      ${sample}<button class="btn" data-act="restart">もう一度マッチング</button>`;
  },
};

// ---------- B 通話 ----------
const VariantB = {
  callHead(title, right = '') {
    return `<header class="vb-head"><div><small>支持者ワードウルフ</small><b>${title}</b></div>${right}</header>`;
  },
  sheet() {
    const p = PARTY[ME.party];
    const body = state.sheetOpen
      ? `<ul>${THEMES.map(t => `<li><span class="tag">${t.label}</span>${strip(t[ME.party])}</li>`).join('')}</ul><a class="src" href="#">出典：${p.name} マニフェスト</a>`
      : `<p class="vb-peek">${strip(THEMES[0][ME.party])} ほか${THEMES.length - 1}つ</p>`;
    return `<section class="vb-sheet ${state.sheetOpen ? 'open' : ''}" style="--pc:${p.color}">
      <button class="vb-grip" data-act="sheet" aria-label="カードを開く"></button>
      <div class="vb-sheet-title">あなたの支持者カード：<b>${p.name}</b></div>${body}</section>`;
  },
  render(ph) {
    if (ph === 'match') {
      const names = PLAYERS.slice(0, state.joined);
      return `${this.callHead('マッチング中', `<span class="pill">${mmss(state.waitSecs)}</span>`)}
        <div class="vb-progress"><div style="width:${(state.joined / 8) * 100}%"></div></div>
        <p class="vb-sub">${state.joined}人 参加中（3〜8人で開始）</p>
        <ul class="vb-list">${names.map(p => `<li>${avatar(p)}<span>${p.id === 0 ? 'あなた' : '参加者' + p.id}</span><span class="ok">マイクOK</span></li>`).join('')}
        ${Array.from({ length: 8 - state.joined }, () => '<li class="ghost-row"><span class="av empty"></span><span>待機中…</span></li>').join('')}</ul>
        <button class="btn ghost" data-act="next">（デモ）そろったことにする</button>`;
    }
    if (ph === 'card') {
      const p = PARTY[ME.party];
      return `${this.callHead('カードが配られました')}
        <div class="vb-deal" style="--pc:${p.color};--ps:${p.soft}">
          <div class="vb-deal-party">${p.name}</div><p>の支持者として話してください</p>
          <ul>${THEMES.map(t => `<li><span class="tag">${t.label}</span>${strip(t[ME.party])}</li>`).join('')}</ul>
          <a class="src" href="#">出典：${p.name} マニフェスト（2026年衆院選）</a></div>
        ${roleNote}<p class="vb-sub">6人中、ウルフは${wolfCount(6)}人。話し合い中も下からカードを見返せます</p>
        <button class="btn" data-act="next">通話に入る</button>`;
    }
    if (ph === 'talk') {
      return `${this.callHead('話し合い', `<span class="pill red">● ${mmss(state.secs)}</span>`)}
        <div class="vb-timebar"><div style="width:${(state.secs / 180) * 100}%"></div></div>
        <div class="vb-grid">${PLAYERS.map(p => `<div class="vb-tile ${state.speaking === p.id ? 'speaking' : ''}">
          ${avatar(p)}<span>${p.name}</span>
          ${p.id === 0 ? '<span class="vb-me">マイクON</span>' : `<div class="vb-tile-acts"><button data-act="mute:${p.id}">${state.muted.has(p.id) ? '🔇' : '🔈'}</button><button data-act="report:${p.id}">${state.reported.has(p.id) ? '通報済' : '⚑'}</button></div>`}
          </div>`).join('')}</div>
        <div class="vb-controls"><button class="round on">🎙</button><button class="round" data-act="next">（デモ）終了</button></div>
        ${this.sheet()}`;
    }
    if (ph === 'vote') {
      return `${this.callHead('投票', '<span class="pill">1回だけ</span>')}
        <p class="vb-sub">一人だけ違う党の支持者は誰？（6人なのでウルフは2人）</p>
        <ul class="vb-list vote">${PLAYERS.filter(p => p.id !== 0).map(p => `<li><label><input type="radio" name="v" data-act="vote:${p.id}" ${state.selected === p.id ? 'checked' : ''}>${avatar(p)}<span>${p.name}</span></label></li>`).join('')}</ul>
        <button class="btn" data-act="next" ${state.selected == null ? 'disabled' : ''}>この人に投票する</button>
        <p class="vb-sub">同数ならウルフの勝ちです</p>`;
    }
    if (ph === 'result') {
      const ex = exiled();
      const win = PLAYERS[ex].party === 'B';
      const t = tally();
      return `${this.callHead('結果')}
        <div class="vb-result ${win ? 'win' : 'lose'}"><b>${win ? '多数派の勝ち' : 'ウルフの勝ち'}</b><span>${PLAYERS[ex].name} が最多票（${t[ex]}票）</span></div>
        <ul class="vb-list">${PLAYERS.map(p => `<li>${avatar(p, { reveal: true })}<span>${p.name}</span><span class="role" style="background:${PARTY[p.party].soft};color:${PARTY[p.party].color}">${PARTY[p.party].name}${p.party === 'B' ? '・ウルフ' : ''}</span><span class="votes">${t[p.id] || 0}票</span></li>`).join('')}</ul>
        <button class="btn" data-act="next">振り返る</button>`;
    }
    // review: テーマごとのタブ、VSで縦に並べる
    const th = THEMES.find(t => t.key === state.tab);
    return `${this.callHead('振り返り')}
      <nav class="vb-tabs">${THEMES.map(t => `<button data-act="tab:${t.key}" class="${t.key === state.tab ? 'on' : ''}">${t.label}</button>`).join('')}</nav>
      <div class="vb-vs">
        <div class="vb-claim" style="--pc:${PARTY.A.color}"><small>${PARTY.A.name}（多数派）</small><p>${marked(th.A)}</p></div>
        <div class="vb-vs-mark">VS</div>
        <div class="vb-claim" style="--pc:${PARTY.B.color}"><small>${PARTY.B.name}（ウルフ）</small><p>${marked(th.B)}</p></div>
      </div>
      ${th.key === 'price' ? `<details class="vb-quotes" open><summary>国会ではこう言っていた</summary>${['A', 'B'].map(k => `<blockquote class="quote" style="border-color:${PARTY[k].color}"><p>${QUOTES[k].text}</p><cite>${QUOTES[k].who}／${QUOTES[k].where}　<a href="#">会議録で前後を読む</a></cite></blockquote>`).join('')}</details>` : '<p class="vb-sub">（サンプルでは「物価」にだけ国会での発言を入れています）</p>'}
      ${sample}<button class="btn" data-act="restart">もう一度マッチング</button>`;
  },
};

// ---------- C カードゲーム ----------
const VariantC = {
  render(ph) {
    const p = PARTY[ME.party];
    const top = label => `<header class="vc-head"><span>${label}</span><span class="vc-dots">${PHASES.map(x => `<i class="${x[0] === ph ? 'on' : ''}"></i>`).join('')}</span></header>`;
    if (ph === 'match') {
      return `${top('デッキを準備中')}
        <div class="vc-fan">${Array.from({ length: 8 }, (_, i) => `<div class="vc-back ${i < state.joined ? 'in' : ''}" style="--r:${(i - 3.5) * 9}deg"></div>`).join('')}</div>
        <div class="vc-count">${state.joined}<small> / 8 人</small></div>
        <p class="vc-sub">あと ${mmss(state.waitSecs)}。3人そろえば配ります</p>
        <button class="btn ghost" data-act="next">（デモ）そろったことにする</button>`;
    }
    if (ph === 'card') {
      return `${top('あなたのカード')}
        <button class="vc-big ${state.flipped ? 'flipped' : ''}" data-act="flip" style="--pc:${p.color};--ps:${p.soft}">
          <span class="vc-big-back">？<small>タップしてめくる</small></span>
          <span class="vc-big-front"><small>あなたは</small><b>${p.name}</b><small>の支持者</small>
            <span class="vc-mini-row">${THEMES.map(t => `<span class="vc-mini">${t.label}</span>`).join('')}</span></span>
        </button>
        ${state.flipped ? `${roleNote}<button class="btn" data-act="next">手札を見て話し合いへ</button>` : '<p class="vc-sub">6人中、ウルフは2人</p>'}`;
    }
    if (ph === 'talk') {
      return `${top('話し合い')}
        <div class="vc-players">${PLAYERS.map(q => `<span class="vc-chip ${state.speaking === q.id ? 'speaking' : ''}">${avatar(q)}${q.name}</span>`).join('')}</div>
        <div class="vc-timer">${mmss(state.secs)}</div>
        <p class="vc-sub">手札（左右にスワイプ）— 主張を1枚ずつ話そう</p>
        <div class="vc-hand">${THEMES.map((t, i) => `<div class="vc-claim" style="--pc:${p.color};--ps:${p.soft}"><span class="vc-claim-n">${i + 1}/${THEMES.length}</span><span class="tag">${t.label}</span><p>${strip(t[ME.party])}</p><small>${p.name} マニフェストより</small></div>`).join('')}</div>
        <div class="vc-bottom"><button class="round on">🎙</button><span>話している人は上で光ります</span><button class="btn ghost small" data-act="next">（デモ）終了</button></div>`;
    }
    if (ph === 'vote') {
      return `${top('ウルフはどのカード？')}
        <div class="vc-grid">${PLAYERS.filter(q => q.id !== 0).map(q => `<button class="vc-pcard ${state.selected === q.id ? 'sel' : ''}" data-act="vote:${q.id}"><span class="vc-pcard-q">？</span>${q.name}</button>`).join('')}</div>
        <p class="vc-sub">1枚だけ選んで投票。同数ならウルフの勝ち</p>
        <button class="btn" data-act="next" ${state.selected == null ? 'disabled' : ''}>このカードに投票</button>`;
    }
    if (ph === 'result') {
      const ex = exiled();
      const win = PLAYERS[ex].party === 'B';
      return `${top(win ? '多数派の勝ち！' : 'ウルフの勝ち！')}
        <div class="vc-grid reveal">${PLAYERS.map(q => `<div class="vc-pcard open ${q.id === ex ? 'sel' : ''}" style="--pc:${PARTY[q.party].color};--ps:${PARTY[q.party].soft}"><b>${PARTY[q.party].name}</b>${q.name}${q.party === 'B' ? '<em>ウルフ</em>' : ''}</div>`).join('')}</div>
        <button class="btn" data-act="next">ズレを探す</button>`;
    }
    // review: 2枚のカードを重ねて「ズレ」を見せる。左右スワイプでテーマ切替
    const t = THEMES[state.cardIndex];
    return `${top('ズレ探し')}
      <p class="vc-sub">${t.label}（${state.cardIndex + 1}/${THEMES.length}）</p>
      <div class="vc-stack">
        <div class="vc-claim wide" style="--pc:${PARTY.A.color};--ps:${PARTY.A.soft}"><span class="tag">${PARTY.A.name}</span><p>${marked(t.A)}</p></div>
        <div class="vc-claim wide offset" style="--pc:${PARTY.B.color};--ps:${PARTY.B.soft}"><span class="tag">${PARTY.B.name}</span><p>${marked(t.B)}</p></div>
      </div>
      <div class="vc-nav"><button class="btn ghost small" data-act="card:-1">← 前</button><button class="btn ghost small" data-act="card:1">次 →</button></div>
      ${t.key === 'price' ? `<details class="vc-flip"><summary>カードを裏返す：国会での発言</summary>${['A', 'B'].map(k => `<blockquote class="quote" style="border-color:${PARTY[k].color}"><p>${QUOTES[k].text}</p><cite>${QUOTES[k].who}／${QUOTES[k].where}　<a href="#">会議録で前後を読む</a></cite></blockquote>`).join('')}</details>` : ''}
      ${sample}<button class="btn" data-act="restart">もう一度</button>`;
  },
};

const RENDERERS = { A: VariantA, B: VariantB, C: VariantC };

// ---------- 描画と操作 ----------
const app = document.getElementById('app');
function render() {
  app.className = `phone v${state.variant}`;
  app.innerHTML = RENDERERS[state.variant].render(state.phase);
  const v = VARIANTS.find(x => x[0] === state.variant);
  document.getElementById('proto-label').textContent = `${v[0]}（${v[1]}）`;
  document.getElementById('proto-phase').value = state.phase;
}
function syncUrl() {
  const u = new URL(location.href);
  u.searchParams.set('variant', state.variant);
  u.searchParams.set('phase', state.phase);
  history.replaceState(null, '', u);
}
function go(phase) {
  state.phase = phase;
  state.sheetOpen = false;
  if (phase === 'match') { state.joined = 1; state.waitSecs = 60; }
  if (phase === 'card') state.flipped = false;
  if (phase === 'talk') state.secs = 180;
  if (phase === 'vote') state.selected = null;
  if (phase === 'review') { state.tab = 'price'; state.cardIndex = 0; }
  syncUrl();
  render();
}
function cycleVariant(d) {
  const i = VARIANTS.findIndex(v => v[0] === state.variant);
  state.variant = VARIANTS[(i + d + VARIANTS.length) % VARIANTS.length][0];
  syncUrl();
  render();
}

app.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const [act, arg] = el.dataset.act.split(':');
  if (act === 'next') {
    const i = PHASES.findIndex(p => p[0] === state.phase);
    go(PHASES[Math.min(i + 1, PHASES.length - 1)][0]);
    return;
  }
  if (act === 'restart') { go('match'); return; }
  if (act === 'flip') state.flipped = true;
  if (act === 'sheet') state.sheetOpen = !state.sheetOpen;
  if (act === 'vote') state.selected = Number(arg);
  if (act === 'mute') { const id = Number(arg); state.muted.has(id) ? state.muted.delete(id) : state.muted.add(id); }
  if (act === 'report') state.reported.add(Number(arg));
  if (act === 'tab') state.tab = arg;
  if (act === 'card') state.cardIndex = (state.cardIndex + Number(arg) + THEMES.length) % THEMES.length;
  render();
});

// 時間の経過（マッチングの人数、話し合いのタイマー、話している人）
setInterval(() => {
  if (state.phase === 'match') {
    state.waitSecs = Math.max(0, state.waitSecs - 1);
    if (state.waitSecs % 3 === 0 && state.joined < 6) state.joined++;
    render();
  } else if (state.phase === 'talk' && !state.sheetOpen) {
    state.secs = Math.max(0, state.secs - 1);
    if (state.secs % 2 === 0) state.speaking = 1 + Math.floor(Math.random() * 5);
    // 手札の横スクロール位置を保つ
    const hand = app.querySelector('.vc-hand');
    const x = hand ? hand.scrollLeft : 0;
    render();
    const hand2 = app.querySelector('.vc-hand');
    if (hand2) hand2.scrollLeft = x;
  }
}, 1000);

// ---------- 案の切り替えバー（プロトタイプ用。本実装には持ち込まない） ----------
const phaseSel = document.getElementById('proto-phase');
phaseSel.innerHTML = PHASES.map(p => `<option value="${p[0]}">${p[1]}</option>`).join('');
phaseSel.addEventListener('change', () => go(phaseSel.value));
document.getElementById('proto-bar').addEventListener('click', e => {
  const b = e.target.closest('[data-proto]');
  if (b) cycleVariant(b.dataset.proto === 'next' ? 1 : -1);
});
document.addEventListener('keydown', e => {
  if (e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (e.key === 'ArrowRight') cycleVariant(1);
  if (e.key === 'ArrowLeft') cycleVariant(-1);
});

syncUrl();
render();
