'use strict';

const ideas = [
  ['返事の地図','意見を届けたあと、計画はどうなった？','若者の意見を行政がどう扱ったか見えにくい。','C 一次資料の照合 ＋ B 対応関係のデータ公開'],
  ['校則の変更履歴','校則の一文から、次の提案を作る。','校則を誰とどう見直すか、過去の経緯が分かりにくい。','D 条文修正と試行案づくりへの参加'],
  ['まちの予算ドラフト','限られた予算で、まちの事業を選ぶ。','地域の事業に優先順位をつける機会が少ない。','D 予算ゲーム ＋ A 追加に必要な額と入れ替え候補の計算'],
  ['同じ発言、逆の印象','短い引用から、元の質疑へ。','切り抜きで省かれた条件や前後の文脈に気づきにくい。','D 引用を比べ、自分で選び直す体験'],
  ['初投票の逆算カレンダー','選挙日から、準備を始める目安を逆算する。','転居後、確認先や書類の手順が分からず投票を諦めてしまう。','C 自治体をまたぐ案内の統合 ＋ A 手続き開始までの余裕日数'],
  ['公報の余白','気になる争点から、候補者の公報を読む。','地方選挙の争点を候補者ごとに探す負担が大きい。','C 各候補の公報を同じ基準で照合'],
  ['15分の議会授業','地元議会の質疑を、短い授業で読む。','教員が質疑と関連資料を集めて教材にする負担が大きい。','C 会議録と事業資料を結んだ教材'],
  ['まだ決めてない会議','賛否を決める前に、疑問を持ち寄る。','考えが固まっていないと政治の話に参加しづらい。','D 問いを出すことから始める参加'],
  ['誰に入れたか聞かないカード','身近な題材を、3分だけ話す。','投票先を尋ねづらく、家庭で政治の会話が止まりやすい。','D 問いとパスで会話を始める仕掛け'],
  ['選挙のない日の参加ナビ','困りごとから、まちへの関わり方を探す。','制度名を知らないと、投票以外の参加手段を探しにくい。','C 公式案内の統合 ＋ B 参加方法のデータ公開']
];

const nav = document.querySelector("#nav");
const field = id => document.getElementById(id);
nav.innerHTML = ideas.map((idea,index) => '<a href="#idea-' + (index + 1) + '">' + (index + 1) + '. ' + idea[0] + '</a>').join('');
function render(moveFocus = false) {
  const number = Number(location.hash.match(/^#idea-(\d+)$/)?.[1]);
  const index = number >= 1 && number <= ideas.length ? number - 1 : 0;
  const [title,lead,problem,pattern] = ideas[index];
  field('title').textContent = title;
  field('lead').textContent = lead;
  field('problem').textContent = problem;
  field('pattern').textContent = pattern;
  document.title = title + '｜Politica';
  [...nav.children].forEach((link,position) => {
    if (position === index) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  if (moveFocus) field('title').focus();
}
window.addEventListener('hashchange', () => render(true));
render();
