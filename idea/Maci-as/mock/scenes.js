'use strict';
const scenes = [
  [
    "返事の経路をたどる",
    "放課後の居場所について意見を出した中学2年生",
    "自分の意見と最終計画がどうつながるか、一段ずつ確かめよう。"
  ],
  [
    "校則の改定案をつくる",
    "制服の見直しを提案する生徒会役員",
    "職員会議に持っていく変更案と、試行後の確かめ方を組み立てよう。"
  ],
  [
    "100万円を配分する",
    "地域予算を考える中学3年生",
    "限られた予算でどの事業を残すか、選びながら理由を考えよう。"
  ],
  [
    "発言を前後に広げる",
    "SNSで短い政治動画を見た高校1年生",
    "引用の前後を開いて、最初に受け取った印象を確かめよう。"
  ],
  [
    "準備日を逆算する",
    "進学で地元を離れた大学1年生",
    "投票予定日から準備の目安を逆算し、最初に連絡する窓口を確認しよう。"
  ],
  [
    "争点ごとに公報を照合する",
    "地元で初めて投票する18歳",
    "気になる争点について、各候補の記述と未確認の情報を見比べよう。"
  ],
  [
    "15分の授業を組む",
    "地域の議題を扱いたい高校公民科の教員",
    "授業の段階を選び、生徒にどの資料と問いを渡すか確認しよう。"
  ],
  [
    "次に調べる問いを決める",
    "駅前整備についてまだ賛否を決めていない高校2年生",
    "教室の問いから一つ選び、調査の第一歩を決めよう。"
  ],
  [
    "会話カードをひく",
    "地域の話を始めたい小学生と保護者",
    "交互に答え、話しにくいときは次のカードをひこう。"
  ],
  [
    "参加先を見つける",
    "駅前の駐輪場を改善したい19歳",
    "今したいことを選び、参加窓口と次の一歩を確かめよう。"
  ]
];
function showScene(index) {
  const area = document.querySelector('#scene');
  const [heading,persona,goal] = scenes[index];
  area.innerHTML = '<p class="persona"></p><h2></h2><p class="goal"></p><div class="workbench"></div>';
  area.querySelector('.persona').textContent = persona;
  area.querySelector('h2').textContent = heading;
  area.querySelector('.goal').textContent = goal;
  const bench = area.querySelector('.workbench');
  function choices(labels, select) {
    const bar = document.createElement('div');
    bar.className = 'scene-options';
    const result = document.createElement('div');
    result.className = 'scene-result';
    result.setAttribute('aria-live','polite');
    bench.append(bar,result);
    function update(i) {
      [...bar.children].forEach((button,j)=>button.setAttribute('aria-pressed',String(j===i)));
      result.innerHTML = select(i);
    }
    labels.forEach((label,i)=>{
      const button = document.createElement('button');
      button.textContent = label;
      button.onclick = ()=>update(i);
      bar.append(button);
    });
    update(0);
  }
  if (index === 0) {
    choices(['① 素案','② 生徒の意見','③ 市の回答','④ 最終計画'],i=>['<h3>もとの計画</h3>既存施設を活用する。','<h3>届いた意見</h3>夕方にも過ごせる場所がほしい。','<h3>行政の対応</h3>夕方の利用ニーズを調べると回答。','<h3>計画の変更箇所</h3>既存施設を活用し、<ins>夕方の利用ニーズを把握する。</ins><p>調査を行う方針です。開設時期は引き続き確認が必要です。</p>'][i]);
  } else if (index === 1) {
    choices(['夏服の着用時期','靴下の指定色'],i=>'<div class="split"><div><h3>現行の条文</h3><del>'+['夏服は6月から着用する。','靴下は白とする。'][i]+'</del></div><div><h3>変更案</h3><ins>'+['気温・体調に応じて夏服を選べる。','白・黒・紺から選べる。'][i]+'</ins></div></div><p><strong>試行後に聞くこと</strong>　'+['暑い日の授業で、服装を調節しやすくなった？','家にある靴下を使えた？ 購入時の負担は変わった？'][i]+'</p>');
  } else if (index === 2) {
    const projects=[['照明',40],['自習席',55],['公園の休憩所',65]];
    bench.innerHTML='<fieldset><legend>採用する事業（見本費用）</legend>'+projects.map(([n,c])=>'<label><input type="checkbox" value="'+c+'"> '+n+' ・ '+c+'万円</label>').join('')+'</fieldset><progress max="100" value="0"></progress><p role="status"></p>';
    function total(){const cost=[...bench.querySelectorAll(':checked')].reduce((s,b)=>s+Number(b.value),0);bench.querySelector('progress').value=cost;bench.querySelector('[role=status]').textContent='合計 '+cost+'万円　'+(cost>100?'予算超過 '+(cost-100)+'万円。外す事業を検討してください。':'残り '+(100-cost)+'万円');}
    bench.onchange=total;total();
  } else if (index === 3) {
    choices(['切り抜きを読む','質問も読む','答弁の最後まで読む'],i=>'<blockquote>「毎日は難しいです」</blockquote>'+(i>0?'<p><b>質問</b>　放課後の学習室は延長できますか？</p>':'')+(i>1?'<p><b>答弁全文</b>　夜まで使える場所が必要です。ただ、毎日は難しいです。<mark>まず金曜日に試行します。</mark></p>':''));
  } else if (index === 4) {
    bench.innerHTML='<label>投票予定日（試算）<input type="date" value="2026-12-20"></label><label>書類の準備・郵送に見込む日数<input type="number" min="0" max="90" value="7"></label><p class="scene-result" role="status"></p>';
    function date(){const [day,days]=bench.querySelectorAll('input');const valid=day.value && days.value && days.validity.valid;bench.querySelector('[role=status]').textContent=valid?'準備開始の目安　'+new Date(day.valueAsNumber-days.valueAsNumber*86400000).toISOString().slice(0,10)+'　旧住所地の選管に名簿登録と手続き方法を確認。公式期限は対象選挙の案内をご確認ください。':'日付と0〜90の整数を入力してください。';}
    bench.oninput=date;date();
  } else if (index === 5) {
    choices(['通学路','子どもの居場所'],i=>'<table><tr><th>見本公報</th><th>記述の確認結果</th></tr>'+['候補A','候補B','候補C'].map((n,j)=>'<tr><th>'+n+'</th><td>'+(j===2?'資料未取得':j===i?['照明を整備する（p.1）','公共施設に居場所を設ける（p.2）'][i]:'確認した公報に該当記述なし')+'</td></tr>').join('')+'</table>');
  } else if (index === 6) {
    choices(['導入 3分','資料を読む 7分','振り返り 5分'],i=>['<h3>黒板に書く問い</h3>通学路の照明を1か所だけ増やすなら、何を基準に選びますか？','<h3>生徒に渡す資料</h3>答弁「点検結果を踏まえて決めます」<p>通学路点検表から、見通しと利用人数のどちらが分かるか探す。</p>','<h3>退出時の一問</h3>照明を優先する場所を一つ挙げ、判断に足りないデータを一つ書いてください。'][i]);
  } else if (index === 7) {
    choices(['夜に広場を使うのは誰？','案内表示で迷うのはどこ？'],i=>'<h3>班で選んだ調査テーマ</h3>'+['時間帯別の広場利用','初めて来た人の移動'][i]+'<h4>次に集めるデータ</h4>'+['夕方と夜の利用人数を同じ曜日で比較する。','入口ごとに迷った位置を案内図へ記録する。'][i]);
  } else if (index === 8) {
    const cards=['公園に一つ設備を足すなら、何がいい？','図書館を遅くまで開けるなら、何曜日？','駅前にベンチを置くなら、どの場所？'];
    const follow=['暑い日に休みたい人はどう思うかな？','平日に来られない人ならどう選ぶ？','ベビーカーを押す人にも使いやすいかな？'];
    bench.innerHTML='<article class="talk-card" aria-live="polite"></article><button class="turn">相手に聞き返す</button><button class="next">パス・次のカード</button>';
    let current=0;const card=bench.querySelector('article');card.textContent=cards[0];
    bench.querySelector('.turn').onclick=()=>{card.textContent=follow[current];};
    bench.querySelector('.next').onclick=()=>{current=(current+1)%cards.length;card.textContent=cards[current];};
  } else {
    choices(['計画に意見を送る','議論を聞く','要望を届ける'],i=>'<h3>'+['意見公募','委員会の傍聴','市議会への陳情'][i]+'</h3><p>'+['対象地域と受付期限を確認し、計画案の該当箇所を指定して意見を書く。','交通を扱う会議の議題と開催日時を確認する。','提出方法を確認し、困っている場所と改善を望む点をまとめる。'][i]+'</p><a target="_blank" rel="noopener" href="'+analysisCases[9][5+i].split('|')[1]+'">川崎市の公式案内を開く</a>');
  }
}
function renderScene(){showScene(ideas.findIndex(idea=>idea[0]===document.querySelector('#title').textContent));}
window.addEventListener('hashchange',renderScene);
renderScene();