'use strict';
const analysisCases = [
  [
    "意見と回答を照合",
    "放課後に使える居場所",
    "放課後の居場所／夕方に利用できる場所を増やしてほしい／市は夕方の利用状況を調べると回答した／最終計画には利用ニーズの把握を記載",
    "案内の読みやすさ／小学生にも分かる説明がほしい／市は概要版で対応すると回答した／計画本文は同じ",
    "意見・回答・計画を照合し、反映・別資料対応・判断保留の候補を出す。対応関係は原典で確認。",
    "川崎市｜第3期こども・若者の未来応援プランと意見聴取結果（公開資料）|https://www.city.kawasaki.jp/templates/prs/450/0000186127.html"
  ],
  [
    "類似する校則改定を探す",
    "制服 夏服 暑さ",
    "制服の着用時期／暑さに応じて夏服を選べる試行案／確認項目は体調と服装の選びやすさ",
    "靴下の色／指定色を広げる案／確認項目は購入しやすさと費用",
    "学校をまたぐ改定事例から似た論点、試行方法、確認項目を提示。校則全文の収集には各校の掲載条件を確認。",
    "カタリバ｜校則見直し事例（公開事例）|https://rulemaking.jp/interview/3473/",
    "経済産業省｜ルールメイキング実証資料（公開PDF）|https://www.meti.go.jp/shingikai/sankoshin/shomu_ryutsu/kyoiku_innovation/pdf/002_02_02.pdf"
  ],
  [
    "施策の優先条件を探る",
    "通学の安全 照明",
    "通学路の照明／夜間の安全と見通し／模擬費用40万円",
    "図書館の自習席／学習場所を確保／模擬費用55万円",
    "自由記述から優先したい価値を抽出。費用上限・組み合わせの計算は元の予算画面で行い、AIは候補の根拠を説明する。",
    "杉並区｜区民参加型予算の投票結果（公開PDF）|https://www.city.suginami.tokyo.jp/documents/23833/r7_sankagata_touhyou_kekka.pdf",
    "杉並区｜投票事業の選定結果（公開PDF）|https://www.city.suginami.tokyo.jp/documents/22546/r7senteikekka.pdf"
  ],
  [
    "切り抜きの前後を探す",
    "毎日は難しい",
    "学習室の延長／夜まで使える場所が必要です。ただ、毎日は難しいです。まず金曜日に試行します。",
    "通学路の照明／必要性はあります。まず明るさを測り、見通しの悪い箇所から試します。",
    "貼り付けた一文を会議録の発言と照合し、質問・条件・直後の補足を表示する。発言者の評価は行わない。",
    "国立国会図書館｜国会会議録検索用API（JSON・XML）|https://kokkai.ndl.go.jp/api.html",
    "川崎市議会｜会議録検索（公開検索）|https://www.city.kawasaki.jp/980/page/0000033370.html"
  ],
  [
    "転居状況に近い案内を探す",
    "旧住所地 進学 郵送",
    "旧住所地での名簿登録の確認／進学先から旧住所地の選管に手続きを確認／書類の受け取りと返送の時間を見込む",
    "新住所地の登録の確認／転居時期と選挙の種類を伝える／選管の公式案内で手順を確認",
    "相談文から確認すべき窓口と不足情報を抽出。日程はカレンダーで計算し、選挙資格は選管で確認。",
    "川崎市｜転居した場合の投票案内（公開HTML）|https://www.city.kawasaki.jp/shisei/category/58-1-11-10-0-0-0-0-0-0.html",
    "川崎市｜滞在先での不在者投票（公開HTML）|https://www.city.kawasaki.jp/910/page/0000019049.html"
  ],
  [
    "公報から争点を探す",
    "通学路 照明",
    "候補A・見本公報1ページ／通学路の照明を整備する／財源についての記述は見当たらない",
    "候補B・見本公報2ページ／公共施設に放課後の居場所を設ける／対象施設は記載なし",
    "争点の言い換えも含め原文の候補を探す。公報内の記述、OCRで確認できない箇所、資料未取得を区別する。",
    "神奈川県選管｜2026年衆院選 選挙公報の例（公開PDF）|https://www.pref.kanagawa.jp/documents/110780/r8koho1-5.pdf",
    "横浜市｜選挙公報の案内（公開HTML）|https://www.city.yokohama.lg.jp/city-info/senkyo/faq.html"
  ],
  [
    "授業に使える根拠を探す",
    "通学路 点検 安全",
    "通学路の安全／市の答弁は点検結果を踏まえ対策箇所を決める／確認の問いは点検表にどんな項目があるか",
    "放課後の居場所／市の答弁は空き教室の活用を検討する／確認の問いは利用できる曜日はいつか",
    "会議録と関連資料を検索し、学年に合わせた問いを出す。教員は出典付きの案から採用する問いを選ぶ。",
    "川崎市議会｜会議録検索（公開検索）|https://www.city.kawasaki.jp/980/page/0000033370.html",
    "国立国会図書館｜国会会議録検索用API（JSON・XML）|https://kokkai.ndl.go.jp/api.html"
  ],
  [
    "疑問に合う調査資料を探す",
    "夜の駅前 利用者",
    "駅前の夜間利用／夕方と夜間の利用人数を分けて調べる／次の問いは誰がどの時間帯に利用するか",
    "駅前の案内表示／初めて来た人の迷いやすい場所を調べる／次の問いは表示の言語や高さで差があるか",
    "生徒の疑問を論点別にまとめ、根拠になりそうな資料と次の調査項目を出す。",
    "川崎市｜意見公募の案件・結果（公開HTML・添付資料）|https://www.city.kawasaki.jp/shisei/category/286-2-0-0-0-0-0-0-0-0.html"
  ],
  [
    "家族で話せる問いを探す",
    "公園 遊具 休憩",
    "公園の使い方／遊具を増やすか休憩場所を優先するか／問いは誰がどんな時間に使うか",
    "図書館の使い方／開館時間を延ばす曜日を選ぶ／問いは普段はいつ利用しやすいか",
    "地域の事業資料から、異なる立場でも話せる問いを提示。候補者や投票先に関する個人情報は不要。",
    "杉並区｜区民参加型予算の投票事業一覧（公開PDF）|https://www.city.suginami.tokyo.jp/documents/22546/r7senteikekka.pdf"
  ],
  [
    "困りごとに合う参加方法を探す",
    "駐輪場 駅前 意見",
    "交通の計画案に意見を出す／駅前・駐輪場・自転車／受付中なら意見公募のページで期限と提出先を確認",
    "議会の議論を聞く／公園や公共施設の委員会／会議日程と傍聴手順を確認",
    "困りごとの文章からテーマと行動を推定。募集の締切や提出先は自治体ページの最新情報を表示する。",
    "川崎市｜意見公募（公開HTML）|https://www.city.kawasaki.jp/shisei/category/286-2-0-0-0-0-0-0-0-0.html",
    "川崎市議会｜傍聴案内（公開HTML）|https://www.city.kawasaki.jp/980/page/0000019101.html",
    "川崎市議会｜請願・陳情（公開HTML）|https://www.city.kawasaki.jp/shisei/category/40-20-0-0-0-0-0-0-0-0.html"
  ]
];
const guidedChoices = [
  [
    "放課後の居場所",
    "案内の読みやすさ",
    "計画で変わった点",
    "市の回答の根拠",
    "利用ニーズの把握が計画に加わりました。施設の開設が決まったかは、この資料では確認できません。",
    "本文の文言は同じです。市は、小学生向けの説明を概要版で補うと回答しています。"
  ],
  [
    "制服の着用時期",
    "靴下の色",
    "変更案を考える",
    "試行で確かめること",
    "着用時期を柔軟にすると、気温や体調に応じて選びやすくなります。試行では、生徒の体調と服装の選びやすさを確認できます。",
    "指定色を広げる案です。試行では、購入できる店舗や家庭ごとの費用差を確認できます。"
  ],
  [
    "通学路の照明",
    "図書館の自習席",
    "期待できる効果",
    "予算への影響",
    "通学路の見通し改善を狙う案です。見本費用は40万円。対策前後の明るさが効果を確認する材料になります。",
    "学習場所を増やす案です。見本費用は55万円。座席の利用率を調べると増設の効果を確かめられます。"
  ],
  [
    "「夜まで使える場所が必要」",
    "「毎日は難しい」",
    "元の質疑を読む",
    "切り抜きで省かれた情報",
    "延長の必要性に加え、毎日の延長は難しく金曜から試す、という条件が付きます。",
    "難しいのは毎日の延長です。同じ答弁で延長の必要性と、金曜に試す方針も述べています。"
  ],
  [
    "旧住所地に登録されているか確認",
    "転居先で登録されているか確認",
    "最初の相談先",
    "確認する情報",
    "旧住所地の選管に名簿登録と滞在先での不在者投票の手順を確認する例です。書類のやり取りにかかる日数も確認してください。",
    "新住所地の選管に相談する例です。転居時期と対象の選挙を伝え、名簿登録と投票方法を確認してください。"
  ],
  [
    "通学路",
    "子どもの居場所",
    "公報の記載を比べる",
    "追加で確認する項目",
    "見本公報には候補Aの照明整備案があります。整備箇所、財源、時期は追加で確認したい項目です。",
    "見本公報には候補Bの居場所づくり案があります。どの施設で、いつ使えるかを追加で確認できます。"
  ],
  [
    "通学路の安全",
    "放課後の居場所",
    "答弁の要点",
    "生徒に投げかける問い",
    "答弁では点検結果を踏まえ対策箇所を決めるとしています。問いの例は「点検表のどの項目で優先順を決められる？」です。",
    "答弁では空き教室の活用を検討しています。問いの例は「曜日や時間帯によって使いたい人は変わる？」です。"
  ],
  [
    "駅前広場の夜間利用",
    "駅前広場の案内表示",
    "関連資料を見る",
    "次に調べる問い",
    "時間帯別の利用人数が参考になります。「夕方と夜で、誰がどんな目的で使う？」を先に調べられます。",
    "表示の位置や種類を示す案内図が参考になります。「初めて来た人はどこで迷いやすい？」を先に調べられます。"
  ],
  [
    "公園の設備",
    "図書館の開館時間",
    "話し始める一問",
    "別の立場から考える問い",
    "「公園に一つだけ設備を足すなら何にする？」と聞いたあと、「誰が使う場面を想像した？」と聞けます。",
    "「開館を延ばすなら何曜日が便利？」と聞いたあと、「平日と休日で、来られる人はどう違う？」と話を広げられます。"
  ],
  [
    "駅前の駐輪場について意見を届けたい",
    "公園の整備について議論を聞きたい",
    "参加方法を探す",
    "参加前の確認事項",
    "交通関連の意見公募が入口になります。案件の有無、提出期限、提出先を公式ページで確認できます。",
    "関係する市議会委員会の傍聴が入口になります。日時と議題、傍聴受付の方法を公式案内で確認できます。"
  ]
];
const answers = [[["意見と最終計画を比較すると、夕方の利用ニーズの把握が加わっています。","意見への回答は、夕方の利用状況を調べるという記述です。"],["計画本文は据え置かれ、子ども向けの説明は概要版で対応する見本です。","市の回答で根拠になるのは、概要版を用いて対応するという記述です。"]],[["試行案は、指定日から切り替える方式を、気温と体調で選べる方式に変更します。","試行期間中に体調の変化と服装を選びやすかった日を記録します。"],["靴下の指定色を増やし、購入先や価格を選びやすくする試行案です。","家庭に今までと異なる購入費用が発生したかを確認します。"]],[["見通しを改善したい区間を決め、対策前後の明るさを比べます。","見本予算100万円のうち40万円を使い、残りは60万円です。"],["図書館で学習できる席が増えます。実際の効果は時間帯別の利用率で確認できます。","見本予算100万円のうち55万円を使い、残りは45万円です。"]],[["元の質問は学習室を延長できるかです。答弁では金曜からの試行を示しました。","切り抜きの後に、毎日の延長は難しく、金曜から試すという補足があります。"],["「毎日は難しい」の対象は、学習室の開室時間の延長です。","難しさに加え、延長の必要性と金曜に試す方針が答弁に含まれています。"]],[["旧住所地の選挙管理委員会が最初の確認先です。","名簿登録、選挙の種類、書類の送受取にかかる時間を確認します。"],["新住所地の選挙管理委員会が最初の確認先です。","転居時期、選挙の種類、新住所地での名簿登録を確認します。"]],[["見本では候補Aが照明整備を記載し、候補Bにはこの争点の記述がありません。","どこから整備するか、費用をどう確保するかを確認できます。"],["見本では候補Bが居場所づくりを記載し、候補Aにはこの争点の記述がありません。","対象施設、利用できる曜日、開設する時期を確認できます。"]],[["市は点検結果を踏まえて対策箇所を決めると答弁しています。","点検表のどの項目を使えば、対策の優先順を説明できるでしょうか。"],["市は空き教室の活用を検討しています。","放課後に使える曜日や時間を決めるには、どんな調査が必要でしょうか。"]],[["夕方と夜を分けた広場の利用人数調査が根拠になります。","時間帯ごとに利用者の目的はどう変わるか、調べてみましょう。"],["広場の案内図に加え、表示が見えにくい位置を記録した調査が参考になります。","初めて訪れた人が迷う場所は、入口や時間帯で変わるでしょうか。"]],[["公園に設備を一つ足せるなら、何を選びますか？","小さな子どもと高齢者では、ほしい設備がどう違いそうですか？"],["図書館の閉館時間を延ばすなら、何曜日が使いやすいですか？","平日に来られない人は、別の曜日や時間をどう選びそうですか？"]],[["駅前の駐輪場は、交通計画の意見公募を探すところから始められます。","対象区域、受付期間、提出方法を確認します。"],["公園の整備は、関係する市議会委員会の傍聴という方法があります。","議題、開催日時、傍聴の受付方法を事前に確認します。"]]];
const host = document.querySelector('#analysis');

function options(select, labels) {
  select.replaceChildren(new Option('選んでください',''), ...labels.map((label,index)=>new Option(label,String(index))));
}

function displayAnalysis() {
  const index = ideas.findIndex(idea => idea[0] === document.querySelector('#title').textContent);
  const [heading,example,first,second,,...sources] = analysisCases[index];
  const [topicA,topicB,intentA,intentB] = guidedChoices[index];
  host.innerHTML = '<h2></h2><p>選択式と自由記述のどちらからでも、分析結果の見本を確認できます。</p><h3>選択式で調べる</h3><form><label>1. どのテーマを調べますか？<select class="theme" required></select></label><label>2. 何を知りたいですか？<select class="intent" required disabled></select></label><button disabled>分析結果を見る</button></form><div class="result" role="status"></div><hr><h3>自由記述で調べる</h3><p id="free-help">気になることを短い言葉や文章で入力してください。</p><form class="free-form"><label>調べたい内容<textarea required maxlength="200" aria-describedby="free-help"></textarea></label><button type="button" class="example">入力例を入れる</button><button>自由記述で分析する</button></form><div class="result free-result" role="status"></div><details><summary>本実装で使う公開データ・資料</summary><ul></ul></details>';
  host.querySelector('h2').textContent = heading;
  const theme = host.querySelector('.theme');
  const intent = host.querySelector('.intent');
  const button = host.querySelector('button');
  const result = host.querySelector('.result');
  options(theme,[topicA,topicB]);
  options(intent,[intentA,intentB]);
  theme.onchange = () => {
    intent.value = '';
    intent.disabled = theme.value === '';
    button.disabled = true;
    result.replaceChildren();
  };
  intent.onchange = () => {
    button.disabled = intent.value === '';
    result.replaceChildren();
  };
  host.querySelector('form').onsubmit = event => {
    event.preventDefault();
    if (theme.value === '' || intent.value === '') return;
    const topicIndex = Number(theme.value);
    const takeaway = answers[index][topicIndex][Number(intent.value)];
    const evidence = [first,second][index === 3 ? 0 : topicIndex].split('／').join('\n');
    const groups = [['分析の見本',takeaway],['サンプル資料の抜粋',evidence]];
    const priorities = [[1,0],[0,1],[0,1],[1,0],[0,1],[1,0],[0,1],[1,0],[0,1],[0,1]];
    if (Number(intent.value) === priorities[index][0]) groups.reverse();
    const caption = document.createElement('h3');
    caption.textContent = [intentA,intentB][Number(intent.value)];
    result.replaceChildren(caption);
    for (const [label,value] of groups) {
      const title = document.createElement('h4');
      title.textContent = label;
      const paragraph = document.createElement('p');
      paragraph.textContent = value;
      result.append(title,paragraph);
    }
  };
  const freeForm = host.querySelector('.free-form');
  const query = freeForm.querySelector('textarea');
  const freeResult = host.querySelector('.free-result');
  function fragments(text) {
    const words = text.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
    return new Set(words.flatMap(word => {
      const chars = [...word];
      return chars.length < 2 ? chars : chars.slice(1).map((char,i) => chars[i]+char);
    }));
  }
  freeForm.querySelector('.example').onclick = () => {
    query.value = example;
    freeResult.textContent = '';
    query.focus();
  };
  query.oninput = () => { freeResult.textContent = ''; };
  freeForm.onsubmit = event => {
    event.preventDefault();
    const wanted = fragments(query.value);
    const records = [first, index === 3 ? first : second];
    const ranked = [topicA,topicB].map((topic,position) => {
      const evidence = records[position];
      const terms = fragments(topic + ' ' + evidence);
      const matches = [...wanted].filter(term => terms.has(term)).length;
      return {position,topic,evidence,matches};
    }).filter(record => record.matches > 0).sort((a,b) => b.matches-a.matches);
    if (!ranked.length) {
      freeResult.textContent = '関連するサンプル資料が見つかりませんでした。入力例や画面上のテーマを参考に、短い言葉で試してください。';
      return;
    }
    const [best,next] = ranked;
    const intentScore = label => [...fragments(label)].filter(term => wanted.has(term)).length;
    const focusedIntent = intentScore(intentB) > intentScore(intentA) ? 1 : 0;
    freeResult.textContent = [
      '関連テーマ　' + best.topic,
      ...(next && next.matches === best.matches ? ['同程度に一致するテーマ　' + next.topic] : []),
      '分析の見本　' + answers[index][best.position][focusedIntent],
      'サンプル資料の抜粋',
      ...best.evidence.split('／')
    ].join('\n');
  };
  for (const source of sources) {
    const [label,url] = source.split('|');
    const link = document.createElement('a');
    link.textContent = label;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const item = document.createElement('li');
    item.append(link);
    host.querySelector('ul').append(item);
  }
}
window.addEventListener('hashchange', displayAnalysis);
displayAnalysis();
