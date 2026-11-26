const app = document.querySelector('#app');
const state = { screen: 'join', avatar: 0, name: '', code: '', value: 50, choice: null, comment: '', compare: false, reaction: '', error: '' };
const avatars = [
  '<svg viewBox="0 0 64 64" width="40" aria-hidden="true"><ellipse cx="32" cy="37" rx="21" ry="19" fill="#f7c95c"/><path d="M32 18c0-7 6-10 12-8-1 7-6 10-12 8" fill="#75b99b"/><circle cx="25" cy="37" r="2" fill="#536677"/><circle cx="39" cy="37" r="2" fill="#536677"/><path d="M29 43q3 3 6 0" fill="none" stroke="#536677" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 64 64" width="40" aria-hidden="true"><circle cx="32" cy="36" r="21" fill="#f9aaa8"/><path d="M30 16q5-10 13-6-2 8-13 6" fill="#79baa2"/><circle cx="25" cy="35" r="2" fill="#536677"/><circle cx="39" cy="35" r="2" fill="#536677"/><path d="M29 42q3 3 6 0" fill="none" stroke="#536677" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 64 64" width="40" aria-hidden="true"><ellipse cx="32" cy="36" rx="22" ry="19" fill="#9dcced"/><path d="M17 22q-3-8 6-8l5 6" fill="#9dcced"/><circle cx="26" cy="34" r="2" fill="#536677"/><circle cx="39" cy="34" r="2" fill="#536677"/><path d="M30 40l3 3 3-3z" fill="#efb861"/></svg>',
  '<svg viewBox="0 0 64 64" width="40" aria-hidden="true"><g fill="#d7c4eb"><circle cx="32" cy="16" r="10"/><circle cx="47" cy="27" r="10"/><circle cx="41" cy="44" r="10"/><circle cx="23" cy="44" r="10"/><circle cx="17" cy="27" r="10"/></g><circle cx="32" cy="30" r="13" fill="#ffe294"/><circle cx="27" cy="29" r="1.7" fill="#536677"/><circle cx="37" cy="29" r="1.7" fill="#536677"/><path d="M29 35q3 2 6 0" fill="none" stroke="#536677" stroke-linecap="round"/></svg>'
];
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const top = label => `<div class="top"><span class="brand">グラデーションの広場</span><span class="tag">${label}</span></div>`;
const topic = '<small>今日のお題</small>食料品の消費税率を、<br>どうしたい？';
function join() {
 return `<section class="screen">${top('参加する')}<p class="eyebrow">WELCOME</p><h1 class="title">一緒に、考えてみよう。</h1><p class="lead">ちがう考えも、まだ迷っている気持ちも。</p><div class="panel"><p class="label">アバターを選ぶ</p><div class="avatar-row">${avatars.map((a,i)=>`<button class="avatar ${state.avatar===i?'selected':''}" data-action="avatar" data-value="${i}" aria-label="アバター ${i+1}" aria-pressed="${state.avatar===i}">${a}</button>`).join('')}</div><label class="input-label" for="name">ニックネーム</label><input class="field" id="name" maxlength="15" placeholder="ゲスト" value="${esc(state.name)}"><label class="input-label" for="code">招待コード</label><input class="field" id="code" maxlength="20" placeholder="コードを入力" value="${esc(state.code)}"><div class="actions"><button class="btn" data-action="start">コードで参加する</button><button class="btn secondary" data-action="start">グループを作る</button></div></div><div class="actions"><button class="btn outline" data-action="strangers">ほかの人と参加する</button></div><p class="footnote">画面イメージのデモです。コードや名前は通信されません。</p><p class="error" role="status">${esc(state.error)}</p></section>`;
}
function answer() {
 const description = state.choice === 'unknown' ? 'まだ分からない' : state.choice === 'value' ? 'この位置を選択中' : 'スライダーを動かして選んでね';
 return `<section class="screen">${top('お題に回答')}<p class="eyebrow">QUESTION</p><h1 class="topic">${topic}</h1><p class="lead">今の気持ちに近いところを選んでね。</p><div class="panel"><span class="pill">あなたの考え</span><input class="range" id="range" type="range" min="0" max="100" value="${state.value}" aria-label="引き上げるから0％にするまでの考え"><div class="ends"><span>引き上げる</span><span>0％にする</span></div><div class="center">現在のまま</div><p class="choice-state" id="choice-state">${description}</p><div class="small-buttons"><button data-action="middle" class="${state.choice==='value'&&state.value===50?'active':''}">現在のまま</button><button data-action="unknown" class="${state.choice==='unknown'?'active':''}">まだ分からない</button></div></div><label class="input-label" for="comment">ひとこと <span class="muted">（任意・50文字まで）</span></label><textarea class="field comment" id="comment" maxlength="50" placeholder="そう思った理由など">${esc(state.comment)}</textarea><p class="counter"><span id="counter">${state.comment.length}</span> / 50</p><p class="error" role="status">${esc(state.error)}</p><div class="spacer"></div><button class="btn" data-action="submit">回答する</button><p class="footnote">みんなの回答がそろうまで、結果は見えません。</p></section>`;
}
function waiting() {
 return `<section class="screen waiting">${top('回答済み')}<div class="spacer"></div><div class="waiting-art">${avatars[state.avatar]}</div><h1 class="title">回答中…</h1><p class="lead">みんなの回答がそろうまで、<br>もう少しお待ちください。</p><div class="dots" aria-hidden="true"><i></i><i></i><i></i></div><div class="spacer"></div><button class="btn secondary" data-action="reveal">デモの回答をそろえる</button><p class="footnote">ほかの人の回答は架空のデータです。</p></section>`;
}
function curve(values) {
 const samples = Array.from({length:61},(_,i)=>{const x=i/60*100;return values.reduce((sum,v)=>sum+Math.exp(-((x-v)**2)/(2*15**2)),0)/values.length});
 return samples.map((v,i)=>`${i?'L':'M'}${(20+i/60*280).toFixed(1)},${(128-v*145).toFixed(1)}`).join(' ');
}
function results() {
 const group = [23,46,78]; if(state.choice==='value')group.push(state.value);
 const whole = [14,26,35,41,48,56,62,69,75,84];
 const bubbles = ['暮らしへの影響が気になる','ほかの財源も考えたい','どう変わるか知りたい'];
 if(state.comment.trim())bubbles.push(state.comment.trim());
 return `<section class="screen reveal">${top('結果')}<p class="eyebrow">RESULT</p><h1 class="title">みんなの考えが<br>集まりました。</h1><p class="lead">正解はひとつじゃない。どんな違いがあるかな？</p><div class="panel result-panel"><p class="result-topic">食料品の消費税率を、どうしたい？</p><div class="bubbles">${bubbles.slice(0,2).map(x=>`<span class="bubble">${esc(x)}</span>`).join('')}</div><svg class="graph" viewBox="0 0 320 145" role="img" aria-label="グループの回答の広がりを示す曲線${state.compare?'と架空の全体の曲線':''}"><path d="M20 128H300" fill="none" stroke="#dce9ec" stroke-width="2"/>${state.compare?`<path d="${curve(whole)}" fill="none" stroke="#779ec9" stroke-width="3" stroke-dasharray="6 5"/>`:''}<path d="${curve(group)} L300,128 L20,128 Z" fill="#bce8df" opacity=".45"/><path d="${curve(group)}" fill="none" stroke="#58b6aa" stroke-width="3"/>${group.map(v=>`<circle cx="${20+v*2.8}" cy="128" r="4" fill="#58b6aa"/>`).join('')}</svg><div class="graph-labels"><span>引き上げる</span><span>現在のまま</span><span>0％にする</span></div><div class="legend"><span>このグループ</span>${state.compare?'<span class="all">全体（架空）</span>':''}</div><div class="bubbles">${bubbles.slice(2).map(x=>`<span class="bubble">${esc(x)}</span>`).join('')}</div><p class="muted">曲線は回答の位置を滑らかに示したもの。コメントと位置は対応していません。${state.choice==='unknown'?'「まだ分からない」は曲線に含みません。':''}</p></div><div class="actions"><button class="btn outline" data-action="compare">${state.compare?'全体との比較を閉じる':'全体の結果と比べる'}</button><button class="btn" data-action="talk">この結果について話す</button></div><p class="footnote">グループのほかの回答と全体の結果は、どちらも架空のデモです。</p></section>`;
}
function talk() {
 const options=['なるほど','もう少し聞きたい','別の見方もある'];
 return `<section class="screen">${top('話し合い')}<button class="back" data-action="results">‹ 結果に戻る</button><p class="eyebrow" style="margin-top:24px">LET’S TALK</p><h1 class="talk-title">結果を見て、どう思った？</h1><p class="lead">気になったことをきっかけに、話してみよう。</p><div class="panel"><p class="label">ひとことを選ぶ</p><div class="chips">${options.map(x=>`<button class="chip ${state.reaction===x?'selected':''}" data-action="reaction" data-value="${x}" aria-pressed="${state.reaction===x}">${x}</button>`).join('')}</div><div class="chat">${state.reaction?`<span class="bubble">${esc(state.reaction)}</span>`:'<span class="muted">選んだひとことがここに表示されます。</span>'}</div></div><div class="notice">デモでは選んだ言葉をこの端末に表示します。ほかの人への送信や音声通話はありません。</div><div class="spacer"></div><button class="btn secondary" data-action="results">結果をもう一度見る</button></section>`;
}
function render() { app.innerHTML = ({join,answer,waiting,results,talk})[state.screen](); }
app.addEventListener('input', event => {
 const el=event.target;
 if(el.id==='name')state.name=el.value;
 if(el.id==='code')state.code=el.value;
 if(el.id==='comment'){state.comment=el.value;const count=document.querySelector('#counter');if(count)count.textContent=el.value.length;}
 if(el.id==='range'){state.value=Number(el.value);state.choice='value';const description=document.querySelector('#choice-state');if(description)description.textContent='この位置を選択中';app.querySelectorAll('.small-buttons button').forEach(b=>b.classList.remove('active'));}
});
app.addEventListener('click', event => {
 const button=event.target.closest('[data-action]');if(!button)return;
 const action=button.dataset.action;
 if(action==='avatar')state.avatar=Number(button.dataset.value);
 if(action==='strangers')state.error='知らない人との参加は今後の検討です。';
 if(action==='start'){state.screen='answer';state.error='';}
 if(action==='middle'){state.value=50;state.choice='value';state.error='';}
 if(action==='unknown'){state.choice='unknown';state.error='';}
 if(action==='submit'){if(!state.choice)state.error='スライダーを動かすか、ボタンを選んでください。';else{state.screen='waiting';state.error='';}}
 if(action==='reveal')state.screen='results';
 if(action==='compare')state.compare=!state.compare;
 if(action==='talk')state.screen='talk';
 if(action==='results')state.screen='results';
 if(action==='reaction')state.reaction=button.dataset.value;
 render();
});
render();
