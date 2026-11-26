'use strict';
const app = document.querySelector('#app');
const SOURCES = {
  diet: 'https://www.shugiin.go.jp/Internet/itdb_gian.nsf/html/gian/keika/1DE342E.htm',
  sweden: 'https://www.oecd.org/en/publications/tax-policy-reforms-2026_43d18a55-en/full-report/tax-policy-reforms_82075677.html',
  vat: 'https://www.oecd.org/en/publications/consumption-tax-trends-2024_dcd4dd36-en/full-report/component-6.html'
};
const tips = [
  { id: 'sweden', title: 'スウェーデンで食料品の税率引き下げ', desc: 'OECDの資料によると、スウェーデンは食料品の付加価値税率を2026年4月から2027年12月まで、12％から6％へ一時的に引き下げました。', source: SOURCES.sweden, sourceName: 'OECD：Tax Policy Reforms 2026', note: '日本とは制度・対象・時期が異なります。似た政策の参考情報であり、同じ効果が生じることを示すものではありません。' },
  { id: 'vat', title: '食料品に軽減税率を使う国も', desc: 'OECDの2024年の報告では、多くの国が食料品などの生活必需品に軽減税率を設けていると説明しています。', source: SOURCES.vat, sourceName: 'OECD：Consumption Tax Trends 2024', note: '国ごとに対象品目や税率は異なります。資料は2024年の報告です。' }
];
let currentTip = 0;
let tipPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentPage = 'home';
let followed = true; // サンプルとして最初から登録済み。端末には保存しない。
let searchTerm = '';
let tipPointerHeld = false;
let topicOrigin = 'home';
// 残りは一覧レイアウトを確認するための架空の表示例。実際の人物や出来事ではない。
const sampleItems = [
  { type:'話題', title:'教育と学ぶ環境', icon:'▤' },
  { type:'政策', title:'子育て支援について', icon:'◉' },
  { type:'人', title:'国会議員A（架空）', icon:'♙' },
  { type:'公約', title:'働き方に関する公約', icon:'▣' }
];
function bottom(active = 'ホーム') { return `<nav class="bottom" aria-label="メインメニュー"><button data-action="home" class="${active === 'ホーム' ? 'active' : ''}"><b>⌂</b>ホーム</button><button data-action="follow" class="${active === 'フォロー' ? 'active' : ''}"><b>♡</b>フォロー</button><button data-action="about" class="${active === 'マイページ' ? 'active' : ''}"><b>☻</b>マイページ</button></nav>`; }
function header() { return '<header class="header"><h1>政治のつづき</h1><span class="badge">お試し画面</span></header>'; }
function tipBanner() { const tip=tips[currentTip]; return `<div id="tips-area" class="compact-tips"><span class="tips-label">Tips</span><button class="tip-banner" data-action="tip" data-id="${tip.id}"><span class="tip-title">${tip.title}</span><span aria-hidden="true">›</span></button><div class="dots" aria-label="Tipsの切り替え">${tips.map((_,i)=>`<button data-action="dot" data-index="${i}" class="${i === currentTip ? 'active' : ''}" aria-label="Tips ${i+1}を表示" aria-current="${i === currentTip}"></button>`).join('')}</div></div>`; }
function renderHome() {
  currentPage='home';
  app.innerHTML=`<div class="shell">${header()}<div class="page-heading"><div><span class="eyebrow">NEWS</span><h2>きょうの話題</h2></div><button class="small-btn" data-action="search">さがす</button></div><p class="fine">※5件の表示例です。最新情報ではなく、自動更新もしません。</p><article class="feed-card"><span class="tag">話題</span><div class="card-main"><h2>食料品の消費税、<br>いまどうなってる？</h2><img class="shopping" src="images/shopping.svg" alt="" aria-hidden="true"></div><button class="card-link" data-action="topic">国会の動きを見る　›</button></article><div class="sample-news-list">${sampleItems.map(item=>`<article class="sample-news"><span class="sample-icon" aria-hidden="true">${item.icon}</span><div><span class="tag">${item.type}・表示例</span><h3>${item.title}</h3><small>内容は準備中</small></div></article>`).join('')}</div></div>${bottom()}`;
}
function renderFollow() {
  currentPage='follow';
  const primary=followed ? `<li><button class="follow-item" data-action="topic"><span class="follow-thumb"><img src="images/shopping.svg" alt=""></span><span class="follow-copy"><span class="tag">話題</span><strong>食料品の消費税</strong><small>国会での動きを見る</small></span><span aria-hidden="true">›</span></button></li>` : '';
  const placeholders=sampleItems.map(item=>`<li><div class="follow-item follow-placeholder"><span class="follow-thumb sample-icon" aria-hidden="true">${item.icon}</span><span class="follow-copy"><span class="tag">${item.type}・表示例</span><strong>${item.title}</strong><small>内容は準備中</small></span></div></li>`).join('');
  const contents=`<ul class="follow-list">${primary}${placeholders}</ul><p class="fine">「表示例」は一覧を確認するためのサンプルです。詳細は未作成です。</p>`;
  app.innerHTML=`<div class="shell">${header()}<div class="page-heading"><div><span class="eyebrow">FOLLOWING</span><h2>フォロー中</h2></div><button class="small-btn" data-action="search">さがす</button></div>${contents}</div>${bottom('フォロー')}`; window.scrollTo(0,0);
}
function renderSearch() {
  currentPage='search';
  const hasMatch=!searchTerm || '食料品 消費税 物価 税'.includes(searchTerm);
  const contents=hasMatch ? `<div class="search-card"><span class="tag">話題</span><strong>食料品の消費税</strong><div class="action-row"><button class="small-btn" data-action="topic">内容を見る</button><button class="small-btn" data-action="toggle-follow">${followed ? 'フォロー解除' : 'フォローする'}</button></div></div>` : '<div class="empty">このキーワードのサンプルはありません。</div>';
  app.innerHTML=`<div class="shell">${header()}<h2 class="section-title">さがす</h2><label class="fine" for="search">話題を探す（サンプル）</label><input id="search" class="search" type="search" placeholder="キーワードを入力" value="${escapeHtml(searchTerm)}"><p class="fine">この試作で探せるのは「食料品の消費税」のみです。人・政党・公約の検索は未実装です。</p>${contents}</div>${bottom()}`;
}
function escapeHtml(x) { return x.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function baseDetail(body, back='home') { const backLabel=back==='topic'?'話題へ戻る':back==='follow'?'フォローへ戻る':back==='search'?'さがすへ戻る':'ホームへ戻る';app.innerHTML=`<div class="shell detail"><button class="back" data-action="${back}">‹　${backLabel}</button>${body}</div>${bottom(back==='follow'?'フォロー':'ホーム')}`; window.scrollTo(0,0); }
function renderTopic() {
  if(['home','follow','search'].includes(currentPage))topicOrigin=currentPage;
  currentPage='topic';
  const label=topicOrigin==='follow'?'フォローへ戻る':topicOrigin==='search'?'さがすへ戻る':'ホームへ戻る';
  app.innerHTML=`<div class="topic-shell detail"><div class="topic-top"><button class="back" data-action="${topicOrigin}">‹　${label}</button><button class="small-btn topic-follow" data-action="toggle-follow" aria-pressed="${followed}">${followed?'フォロー中 ✓':'フォローする'}</button></div><div class="topic-heading topic-fixed-title"><div><span class="tag">話題・サンプル</span><h1>食料品の消費税、<br>いまどうなってる？</h1></div><img class="shopping small-shopping" src="images/shopping.svg" alt="" aria-hidden="true"></div><p class="fine topic-date">2026年11月26日確認時点の固定サンプル</p><section class="topic-scroll" aria-label="これまでの動き" tabindex="0"><h2>これまでの動き</h2><ol class="timeline"><li><small>2026年10月9日</small>法案を衆議院で受理</li><li><small>2026年11月6日</small>衆議院で可決</li><li><small>2026年11月11日</small>参議院の委員会に付託</li></ol><p class="fine">衆議院の審議経過ページに記載された出来事です。公約の達成を判定するものではありません。</p><a class="source" href="${SOURCES.diet}" target="_blank" rel="noopener noreferrer">出典：衆議院・議案審議経過 ↗</a></section><div class="topic-tools"><div class="professor"><img class="avatar" src="images/professor.svg" alt="博士"><button class="bubble" data-action="ask" data-id="what">これって何？</button><button class="bubble" data-action="ask" data-id="status">もう決まった？</button></div><div class="chat-preview" role="note" aria-label="博士への自由質問の入力欄イメージ。未実装です"><span>博士に自由に質問する</span><span class="chat-preview-label">イメージ・未実装</span></div>${tipBanner()}</div></div>${bottom(topicOrigin==='follow'?'フォロー':'ホーム')}`;
  window.scrollTo(0,0);
}
function renderAsk(id) { currentPage='ask'; const status=id==='status'; baseDetail(`<span class="tag">博士のひとこと</span><h1>${status?'もう決まった？':'これって何？'}</h1><div class="professor-answer"><img class="answer-avatar" src="images/professor.svg" alt="博士"><div class="ask-result"><p>${status?'衆議院の資料には、2026年11月6日に衆議院で可決され、11月11日に参議院の委員会に付託されたことが記録されています。':'食料品の消費税率の引き下げと、就業者向けの負担軽減支援金について定めた法案です。'}</p><p class="fine">確認日：2026年11月26日。法案の成立・実施を断定するものではありません。</p></div></div><a class="source" href="${SOURCES.diet}" target="_blank" rel="noopener noreferrer">出典：衆議院・議案審議経過 ↗</a><h2>もっと詳しく</h2><button class="related" data-action="topic">この話題の経緯を見る　›</button>`,'topic'); }
function renderTip(id) { const tip=tips.find(t=>t.id===id); if(!tip)return;currentPage='tip';baseDetail(`<span class="tag">Tips・参考情報</span><h1>${tip.title}</h1><p>${tip.desc}</p><p class="fine">${tip.note}</p><a class="source" href="${tip.source}" target="_blank" rel="noopener noreferrer">${tip.sourceName} ↗</a><p class="fine">2026年11月26日確認。収録内容は自動更新されません。</p><h2>ほかの関連するTips</h2>${tips.filter(t=>t.id!==id).map(t=>`<button class="related" data-action="tip" data-id="${t.id}">${t.title}　›</button>`).join('')}<button class="related" data-action="topic">元の話題へ戻る　›</button>`,'topic'); }
function renderAbout() { currentPage='about'; baseDetail('<h1>このお試し画面について</h1><p>国会の話題を追い、博士の説明や関連するTipsを見る体験を試すモックです。</p><p>内容は固定サンプルで、自動更新や通知はありません。フォローは画面上のデモで、このタブを閉じると保持されません。</p>'); }
function updateBanner() { const area=document.querySelector('#tips-area');if(!area)return;const temp=document.createElement('div');temp.innerHTML=tipBanner();area.replaceWith(temp.querySelector('#tips-area')); }
app.addEventListener('click', e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.action;if(a==='home'){renderHome();window.scrollTo(0,0)}else if(a==='follow')renderFollow();else if(a==='search')renderSearch();else if(a==='about')renderAbout();else if(a==='topic')renderTopic();else if(a==='ask')renderAsk(b.dataset.id);else if(a==='tip')renderTip(b.dataset.id);else if(a==='toggle-follow'){followed=!followed;if(currentPage==='topic'){b.textContent=followed?'フォロー中 ✓':'フォローする';b.setAttribute('aria-pressed',String(followed))}else renderSearch()}else if(a==='dot'){currentTip=Number(b.dataset.index);updateBanner()}});
app.addEventListener('input', e=>{if(e.target.id==='search'){searchTerm=e.target.value;const focus=e.target.selectionStart;renderSearch();const input=document.querySelector('#search');input.focus();input.setSelectionRange(focus,focus)}});
app.addEventListener('pointerdown', e=>{if(e.target.closest('#tips-area'))tipPointerHeld=true});
window.addEventListener('pointerup', ()=>{tipPointerHeld=false});
window.addEventListener('pointercancel', ()=>{tipPointerHeld=false});
setInterval(()=>{if(currentPage==='topic' && !tipPaused && !tipPointerHeld && !document.hidden && !document.querySelector('#tips-area')?.contains(document.activeElement)){currentTip=(currentTip+1)%tips.length;updateBanner()}},6000);
renderHome();
