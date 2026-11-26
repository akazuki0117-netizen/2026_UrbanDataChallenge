'use strict';

const app = document.querySelector('#app');
const dictionary = document.querySelector('#dictionary');
document.querySelector('#close-dictionary').addEventListener('click', () => dictionary.close());
document.querySelector('#close-dictionary-bottom').addEventListener('click', () => dictionary.close());
dictionary.addEventListener('click', e => { if (e.target === dictionary) dictionary.close(); });

// 数値と変化は、ゲーム体験を試すための架空のルール。
const events = [
  { season: '1年目・春', category: '最初の方針', scene: 'town', question: 'このまちで、まず何を大切にしますか？', choices: [
    { text: '暮らしを支える', cost: 15, change: [10, 5, 0], tag: 'life', later: '暮らしを支える方針を選びました。' },
    { text: '将来への備えを進める', cost: 25, change: [0, 0, 10], tag: 'future', later: '将来への備えを進める方針を選びました。' }
  ] },
  { season: '1年目・秋', category: '地域交通', scene: 'bus', question: '利用者が減り、バスの維持費が増えています。', choices: [
    { text: '便数を減らして続ける', cost: 10, change: [-5, -5, 0], tag: 'reduce', later: 'バスの便数を減らして運行を続けました。' },
    { text: '自動運転バスを試す', cost: 30, change: [0, 0, 5], tag: 'bus_test', later: '自動運転バスの実証を始めました。' }
  ] },
  { season: '2年目・春', category: '次の議会', scene: 'building', question: '利用が減った公共施設の今後を考えることになりました。', choices: [
    { text: '必要な修繕を先に行う', cost: 10, change: [0, 0, 5], tag: 'repair', later: '公共施設の必要な修繕を選びました。' },
    { text: '使い方を住民と話し合う', cost: 25, change: [5, 10, 0], tag: 'talk', later: '公共施設の使い方を住民と話し合いました。' }
  ] },
  { season: '3年目・秋', category: 'まちからの声', scene: 'town', question: '大雨に備える対策と、暮らしの支援が求められています。', choices: [
    { text: '今ある支援を続ける', cost: 0, change: [5, 0, 0], tag: 'keep', later: '暮らしの支援を続けることにしました。' },
    { text: '大雨への備えを進める', cost: 25, change: [0, 0, 10], tag: 'rain', later: '大雨への備えを進めることにしました。' }
  ] }
];

let state;
function reset() { state = { step: 0, budget: 100, metrics: [50, 50, 50], history: [], tags: [] }; }
function scene(kind) {
  const bus = '<rect x="80" y="78" width="150" height="57" rx="12" fill="#f7fbfe"/><path d="M89 87h116a15 15 0 0 1 15 15v11H89z" fill="#376a80"/><path d="M80 118h150v15H80z" fill="#75bdb7"/><circle cx="110" cy="137" r="10" fill="#315664"/><circle cx="201" cy="137" r="10" fill="#315664"/><path d="M258 78v69m-32-69h64l-7-12h-50z" fill="none" stroke="#438591" stroke-width="6"/>';
  const building = '<path d="M100 140V83l57-34 57 34v57z" fill="#f6fbfe"/><path d="M88 83l69-41 69 41" fill="none" stroke="#568799" stroke-width="7"/><path d="M119 97h21v19h-21zm55 0h21v19h-21z" fill="#9acbd7"/><path d="M146 113h23v27h-23z" fill="#75bdb7"/>';
  const town = '<path d="M60 141V99l36-28 36 28v42zm132 0V86l34-25 34 25v55z" fill="#f8fcfe"/><path d="M48 100l48-37 48 37m35-13 47-35 46 35" fill="none" stroke="#568799" stroke-width="7"/><path d="M150 145v-37l20-16 19 16v37z" fill="#75bdb7"/>';
  return `<svg viewBox="0 0 320 180" role="img" aria-label="架空のまちのイラスト"><path d="M0 122Q60 65 125 103Q200 48 320 101V180H0Z" fill="#acd7dd"/><path d="M0 146Q70 110 130 145Q230 95 320 132V180H0Z" fill="#d1e8e4"/><path d="M0 151h320v29H0z" fill="#a9c7d3"/>${kind === 'bus' ? bus : kind === 'building' ? building : town}</svg>`;
}
function stat(symbol, label, amount, text) { return `<div class="metric" aria-label="${label} ${text}"><span class="symbol" aria-hidden="true">${symbol}</span><span class="status-label">${label}</span><div class="bar" aria-hidden="true"><span style="width:${Math.max(0, Math.min(100, amount))}%"></span></div></div>`; }
function renderIntro() {
  app.innerHTML = `<section class="screen intro"><span class="eyebrow">架空のまちの意思決定ゲーム</span><h1>もし、あなたが<br>市長なら。</h1><p class="lead">限られた予算で選択を重ね、<br>まちの任期を過ごしてみよう。</p><div class="hero">${scene('town')}</div><button class="primary wide" data-action="start">市長として始める</button><p class="small">登場するまち・政策・結果、予算や指標はすべて架空です。現実の予測や政策評価ではありません。</p></section>`;
}
function renderEvent() {
  const event = events[state.step];
  const buttons = event.choices.map((c, i) => `<button class="choice" data-choice="${i}" ${state.budget < c.cost ? 'disabled' : ''}><span>${c.text}</span><small>${c.cost ? `予算 ${c.cost}` : '予算 0'}</small></button>`).join('');
  app.innerHTML = `<section class="screen"><div class="status" aria-label="現在の状態">${stat('◷', '任期', ((state.step + 1) / events.length) * 100, event.season)}${stat('◉', '予算', state.budget, `残り${state.budget}ポイント`)}${stat('⌂', '暮らし', state.metrics[0], '架空の状態')}${stat('♧', '信頼', state.metrics[1], '架空の状態')}${stat('↗', '将来', state.metrics[2], '架空の状態')}</div><div class="scene">${scene(event.scene)}</div><div class="content"><span class="step-label">${event.season}　｜　${event.category}</span><h1 class="question">${event.question}</h1><div class="choices">${buttons}</div><p class="locked-note">${event.choices.some(c => c.cost > state.budget) ? '予算が足りない選択肢は選べません。' : ''}</p></div><div class="bottom"><span class="fiction">※架空のシナリオ</span><button class="secondary" data-action="dictionary">▤　単語辞書</button></div></section>`;
}
function choose(index) {
  const event = events[state.step];
  const selected = event.choices[index];
  if (!selected || selected.cost > state.budget) return;
  state.budget -= selected.cost;
  state.metrics = state.metrics.map((v, i) => Math.max(0, Math.min(100, v + selected.change[i])));
  state.tags.push(selected.tag);
  state.history.push({ season: event.season, choice: selected.later });
  state.step += 1;
  if (state.step < events.length) renderEvent(); else renderResult();
  window.scrollTo(0, 0);
}
function renderResult() {
  // 前の方針と後の決定が重なった場合の、架空の遅れて生じる出来事。
  const delayed = state.tags.includes('bus_test')
    ? '試した自動運転バスは、任期の終わりに運行方法の検討が続いています。'
    : '便数の減った地域では、移動に不便を感じる住民の声が残りました。';
  const combined = state.tags.includes('future') && state.tags.includes('rain')
    ? '将来への方針と大雨への備えを重ね、準備を進めた任期でした。'
    : state.tags.includes('life') && state.tags.includes('keep')
      ? '暮らしを支える方針と支援の継続を重ねた任期でした。'
      : '限られた予算のなかで、複数の課題へ対応した任期でした。';
  const labels = ['暮らし', '信頼', '将来への備え'];
  const metrics = labels.map((label, i) => `<p><strong>${label}</strong>：${state.metrics[i]} <small>／ 100</small></p>`).join('');
  const timeline = state.history.map(h => `<li><small>${h.season}</small><strong>${h.choice}</strong></li>`).join('');
  const voices = state.tags.includes('reduce')
    ? { positive: '便数は減ったけれど、路線が残って通院に使えています。', negative: '帰りの便が減って、仕事の時間に合わせにくくなりました。' }
    : { positive: '新しい交通手段を試すことで、移動の選択肢が広がるかもしれないと期待しています。', negative: '実証中は利用できる場所や時間が限られ、今まで通り移動できるか不安です。' };
  app.innerHTML = `<section class="result"><span class="eyebrow">任期終了</span><h1>あなたの任期を<br>振り返ろう。</h1><p class="small">ここにある結果・数値は、ゲームのために用意した架空の例です。</p><h2>選んだことの記録</h2><ol class="timeline">${timeline}</ol><div class="result-card"><span class="eyebrow">時間がたって</span><p>${delayed}</p><p>${combined}</p></div><h2>まちの様子</h2><div class="result-card">${metrics}<p class="small">ゲーム内での仮の状態です。現実の政策の良し悪しを評価する点数ではありません。</p></div><h2>住民の視点</h2><div class="result-card"><span class="eyebrow">前向きな声</span><p>「${voices.positive}」</p><span class="eyebrow">困りごと・不安の声</span><p>「${voices.negative}」</p><p class="small">※どちらも、選択に応じて用意した架空の住民の声です。同じ選択でも、立場によって受け止め方は変わります。</p></div><h2>現実には？</h2><div class="result-card"><p>地域の移動を支えるため、自動運転バスを試す取り組みもあります。</p><p><a class="source" href="https://www.mlit.go.jp/statistics/file000004/html/n1211c02.html" target="_blank" rel="noopener noreferrer">国土交通省：自動運転バスの実証事例 ↗</a></p><p class="small">現実の類似事例です。上のゲーム内の選択や結果を再現・予測したものではありません。</p></div><div class="result-actions"><button class="primary" data-action="restart">もう一度選んでみる</button><button class="secondary" data-action="dictionary">▤　単語辞書</button></div></section>`;
}
app.addEventListener('click', e => {
  const target = e.target.closest('button');
  if (!target) return;
  if (target.dataset.action === 'start' || target.dataset.action === 'restart') { reset(); renderEvent(); window.scrollTo(0, 0); }
  else if (target.dataset.action === 'dictionary') dictionary.showModal();
  else if (target.dataset.choice !== undefined) choose(Number(target.dataset.choice));
});
reset(); renderIntro();
