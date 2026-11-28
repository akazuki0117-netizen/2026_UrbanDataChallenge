// SAVAKU プロトタイプ。AIは未接続で、お題ごとに用意した台本で応答する。
// 条文は e-Gov法令検索の現行法令から抜粋した（実装では e-Gov法令API から取得する）。

const LAWS = {
  keiho222: {
    name: "刑法 第222条（脅迫）",
    article: "生命、身体、自由、名誉又は財産に対し害を加える旨を告知して人を脅迫した者は、二年以下の拘禁刑又は三十万円以下の罰金に処する。（第1項）",
    plain: "「痛い目にあわせるぞ」「秘密をばらすぞ」のように、相手やその大切なものに害を加えると伝えて怖がらせると成立する。気まずい、責められた、だけでは足りない。",
    lawId: "140AC0000000045",
  },
  keiho223: {
    name: "刑法 第223条（強要）",
    article: "生命、身体、自由、名誉若しくは財産に対し害を加える旨を告知して脅迫し、又は暴行を用いて、人に義務のないことを行わせ、又は権利の行使を妨害した者は、三年以下の拘禁刑に処する。（第1項）",
    plain: "脅したり暴力をふるったりして、やらなくていいことを無理やりさせると成立する。脅迫か暴行という「手段」があることがポイント。",
    lawId: "140AC0000000045",
  },
  keiho230: {
    name: "刑法 第230条（名誉毀損）",
    article: "公然と事実を摘示し、人の名誉を毀損した者は、その事実の有無にかかわらず、三年以下の拘禁刑又は五十万円以下の罰金に処する。（第1項）",
    plain: "多くの人が知りうる場所で、具体的な事実を示して人の社会的な評価を下げると成立する。示した事実が本当かどうかは、原則として問われない。",
    lawId: "140AC0000000045",
  },
  keiho231: {
    name: "刑法 第231条（侮辱）",
    article: "事実を摘示しなくても、公然と人を侮辱した者は、一年以下の拘禁刑若しくは三十万円以下の罰金又は拘留若しくは科料に処する。",
    plain: "具体的な事実を示さなくても、多くの人の前で「バカ」「最低」などと人をおとしめると成立する。ネットの中傷が問題になり、2022年に罰則が重くなった。",
    lawId: "140AC0000000045",
  },
  minpo709: {
    name: "民法 第709条（不法行為）",
    article: "故意又は過失によって他人の権利又は法律上保護される利益を侵害した者は、これによって生じた損害を賠償する責任を負う。",
    plain: "わざと、または不注意で、他人の権利や守られるべき利益を傷つけたら、その損害をつぐなう責任がある。刑罰ではなく、損害賠償の話。",
    lawId: "129AC0000000089",
  },
  kenpo13: {
    name: "日本国憲法 第13条（個人の尊重）",
    article: "すべて国民は、個人として尊重される。生命、自由及び幸福追求に対する国民の権利については、公共の福祉に反しない限り、立法その他の国政の上で、最大の尊重を必要とする。",
    plain: "一人ひとりが自分らしく生きる権利を大切にする、という憲法の柱。髪型や服装など、自分のことを自分で決める自由の根拠として語られることが多い。",
    lawId: "321CONSTITUTION",
  },
  gakko11: {
    name: "学校教育法 第11条（懲戒）",
    article: "校長及び教員は、教育上必要があると認めるときは、文部科学大臣の定めるところにより、児童、生徒及び学生に懲戒を加えることができる。ただし、体罰を加えることはできない。",
    plain: "先生は、教育のために必要なら生徒を叱ったり罰を与えたりできる。ただし、体罰は禁止。",
    lawId: "322AC0000000026",
  },
  chosaku21: {
    name: "著作権法 第21条（複製権）",
    article: "著作者は、その著作物を複製する権利を専有する。",
    plain: "作品をコピーしてよいかを決められるのは、作った人だけ。他人の動画を無断で切り抜いて投稿すると、この権利の侵害になりうる。",
    lawId: "345AC0000000048",
  },
  rouki32: {
    name: "労働基準法 第32条（労働時間）",
    article: "使用者は、労働者に、休憩時間を除き一週間について四十時間を超えて、労働させてはならない。（第1項）",
    plain: "原則として、休憩を除き週40時間を超えて働かせてはならない。1日についても8時間が上限になる。これを超えるには、労使で結んで届け出た協定（いわゆる36協定）が必要。",
    lawId: "322AC0000000049",
  },
  rouki37: {
    name: "労働基準法 第37条（割増賃金）",
    article: "使用者が、第三十三条又は前条第一項の規定により労働時間を延長し、又は休日に労働させた場合においては、その時間又はその日の労働については、通常の労働時間又は労働日の賃金の計算額の二割五分以上五割以下の範囲内でそれぞれ政令で定める率以上の率で計算した割増賃金を支払わなければならない。（第1項本文）",
    plain: "残業や休日労働をさせた使用者は、決まった割合以上の割増賃金を払わなければならない。時間外は原則として2割5分以上。払わないのは、この条に反する。",
    lawId: "322AC0000000049",
  },
  keihyo5_3: {
    name: "景品表示法 第5条第3号（不当な表示）",
    article: "事業者は、自己の供給する商品又は役務の取引について、次の各号のいずれかに該当する表示をしてはならない。三 前二号に掲げるもののほか、商品又は役務の取引に関する事項について一般消費者に誤認されるおそれがある表示であつて、不当に顧客を誘引し、一般消費者による自主的かつ合理的な選択を阻害するおそれがあると認めて内閣総理大臣が指定するもの。",
    plain: "商品やサービスの取引で、消費者を誤認させ、合理的な選択を妨げる表示は禁止される。広告なのに広告と分からない表示（ステルスマーケティング）は、2023年10月から、この第3号にもとづく指定として規制されている。対象は商品を供給する事業者で、投稿を頼まれた個人そのものではない。",
    lawId: "337AC0000000134",
  },
  keihyo5_1: {
    name: "景品表示法 第5条第1号（優良誤認）",
    article: "商品又は役務の品質、規格その他の内容について、一般消費者に対し、実際のものよりも著しく優良であると示し、又は事実に相違して当該事業者と同種若しくは類似の商品若しくは役務を供給している他の事業者に係るものよりも著しく優良であると示す表示であつて、不当に顧客を誘引し、一般消費者による自主的かつ合理的な選択を阻害するおそれがあると認められるもの。",
    plain: "品質や効果を、実際より著しく良く見せて客を集める表示は禁止される。広告かどうかが分かることと、中身が本当かどうかは、別の問題。",
    lawId: "337AC0000000134",
  },
  tokusho12_6: {
    name: "特定商取引法 第12条の6（最終確認画面の表示）",
    article: "販売業者又は役務提供事業者は、通信販売に係る売買契約又は役務提供契約の申込み（特定申込み）を受ける場合には、当該特定申込みに係る書面又は手続が表示される映像面に、商品の分量、代金、支払の時期と方法、引渡しの時期、申込みの撤回又は解除に関する事項などを表示しなければならない。（第1項の要旨）",
    plain: "ネット通販の申込みの最終画面には、分量、代金、支払い、引き渡し、解約の条件を表示しなければならない。定期購入なら、回数や期間、2回目以降の代金も、ここで示す必要がある。",
    lawId: "351AC0000000057",
  },
  tokusho15_4: {
    name: "特定商取引法 第15条の4（申込みの取消し）",
    article: "特定申込みをした者は、販売業者又は役務提供事業者が当該特定申込みを受けるに際し次の各号に掲げる行為をしたことにより、当該各号に定める誤認をし、それによつて当該特定申込みの意思表示をしたときは、これを取り消すことができる。（第1項柱書）",
    plain: "最終確認画面で、表示すべきことを書かなかったり、事実と違うことを書いたりして、そのせいで誤解して申し込んだ人は、申込みを取り消せる。通信販売には、訪問販売のようなクーリング・オフは原則としてない。",
    lawId: "351AC0000000057",
  },
};

const CASES = [
  {
    id: "kidoku",
    group: "school",
    preset: "既読無視を責めるLINEの暗黙ルール",
    keywords: ["LINE", "ライン", "既読", "返信", "グループ", "スルー"],
    defendant: "既読スルー禁止令",
    charge: "「既読がついたら即返信」という暗黙のルールで、クラスLINEの仲間に返信を強いた罪",
    laws: [
      {
        id: "keiho223", points: 1,
        charge: "被告は、返信しない者をグループから外すとほのめかし、義務のない返信を行わせました。刑法第223条の強要罪にあたります。",
        rebut: "強要罪には、生命・身体・名誉などへの害を告げる脅迫か、暴行が必要です。「早く返してね」という空気だけでは、害の告知とは言えません。",
      },
      {
        id: "keiho222", points: 0,
        charge: "被告は、既読無視をした者を責め、恐怖を与えました。刑法第222条の脅迫罪にあたります。",
        rebut: "脅迫罪は「害を加える」と告げることが要件です。責められて気まずい、というだけでは成立しません。",
      },
      {
        id: "minpo709", points: 2,
        charge: "被告のルールにより、深夜まで返信に追われ、睡眠と生活の平穏が損なわれました。民法第709条の不法行為として責任を問います。",
        rebut: "民法第709条には、権利や守られるべき利益の侵害と、損害とのつながりが必要です。返信は本人の意思でしており、従わない自由もありました。",
      },
    ],
    turns: [
      {
        choices: [
          { points: 2, label: "具体的な被害を示す", say: "証拠を提出します。午前2時に「なんで既読無視？」という通知が10件以上続き、翌日の授業に出られなかった生徒がいます。" },
          { points: 1, label: "みんなが困っていると訴える", say: "クラスの多くが、このルールに疲れています。それ自体が被害です。" },
          { points: 0, label: "ルールを作った人を非難する", say: "こんなルールを作った人は最低です。" },
        ],
        rebut: "深夜の通知は、通知を切れば防げます。ルールそのものが、特定の誰かの権利を侵害しているとまでは言えません。",
      },
      {
        choices: [
          { points: 2, label: "害の告知があったかを示す", say: "「返さないならグループから外す」という書き込みが残っています。仲間外れという害を告げた、と言えます。" },
          { points: 1, label: "ルールの強さを示す", say: "返信しないと、翌日には教室で話題にされます。事実上、逃げられないルールです。" },
          { points: 0, label: "スマホ自体が悪いと訴える", say: "そもそも、スマホがあるから悪いのです。" },
        ],
        rebut: "「外す」という書き込みは一度きりで、実際には誰も外されていません。友人どうしの約束に、法がどこまで立ち入るべきでしょうか。",
      },
      {
        choices: [
          { points: 2, label: "法の限界と、守るべき利益を整理する", say: "仮に犯罪に当たらなくても、生活の平穏と睡眠は守られるべき利益です。少なくとも、繰り返された深夜の要求は許されません。" },
          { points: 1, label: "厳罰を求める", say: "被告に厳しい罰を求めます。二度とこんなルールが生まれないように。" },
          { points: 0, label: "感情で締めくくる", say: "とにかく、もう嫌なんです！" },
        ],
        rebut: "気持ちのすれ違いを、すべて法で裁くことはできません。",
      },
    ],
    verdict: {
      high: {
        result: "無罪",
        sub: "ただし、本法廷は被告の運用に強く警告する",
        reasons: [
          "既読無視を責める暗黙のルールそのものは、強要罪や脅迫罪の要件（害の告知、または暴行）を満たさない。",
          "一方で、検察官が示した「返さないなら外す」という書き込みや、繰り返された深夜の要求は、内容と回数によっては脅迫・強要や不法行為に当たりうる。",
          "このルールは法ではなく、当事者どうしで変えられる。本法廷は、返信の時間帯を決めるなど、運用の見直しを求める。",
        ],
      },
      low: {
        result: "無罪",
        sub: "法で裁く根拠が示されなかった",
        reasons: [
          "既読無視を責める暗黙のルールそのものは、強要罪や脅迫罪の要件を満たさない。",
          "検察官の主張は不満の表明にとどまり、誰のどの権利がどう侵害されたかの立証が足りなかった。",
          "違和感を法で問うには、「誰の、どの利益が、どう害されたか」を具体的に示す必要がある。",
        ],
      },
    },
  },
  {
    id: "kousoku",
    group: "school",
    preset: "ツーブロック禁止などのブラック校則",
    keywords: ["校則", "髪", "ツーブロック", "頭髪", "制服", "スカート", "靴下", "下着", "学校のルール"],
    defendant: "ツーブロック禁止校則",
    charge: "理由の説明がないまま髪型を一律に禁じ、従わない生徒を人前で繰り返し指導した罪",
    laws: [
      {
        id: "kenpo13", points: 2,
        charge: "髪型は自分で決めるものです。理由なく一律に禁じる被告は、日本国憲法第13条が保障する、個人として尊重される権利を侵しています。",
        rebut: "憲法は主に国と個人の関係を定めるもので、校則にそのまま当てはめられるとは限りません。学校には、教育のためのルールを決める裁量があります。",
      },
      {
        id: "gakko11", points: 1,
        charge: "被告にもとづく人前での繰り返しの指導は、学校教育法第11条が認める懲戒の範囲を超えています。",
        rebut: "学校教育法第11条は、教育上必要なら懲戒を認めており、禁じているのは体罰です。口頭の指導は体罰ではありません。",
      },
      {
        id: "minpo709", points: 1,
        charge: "人前で何度も指導され、生徒は精神的な苦痛を受けました。民法第709条の不法行為として責任を問います。",
        rebut: "指導は教育のために行われ、生徒をわざと傷つけたわけではありません。苦痛があったとしても、すぐに違法とは言えません。",
      },
    ],
    turns: [
      {
        choices: [
          { points: 2, label: "校則の目的と手段のずれを突く", say: "被告の目的は「事件や事故に巻き込まれないため」と説明されています。しかし、髪型とその目的の関係は、一度も示されていません。" },
          { points: 1, label: "他校との違いを示す", say: "近くの学校では、ツーブロックは禁止されていません。" },
          { points: 0, label: "校則はすべて不要と訴える", say: "校則なんて、全部なくすべきです。" },
        ],
        rebut: "目的と手段の関係を決めるのは学校です。髪をめぐる実際の裁判でも、校則そのものは違法とされなかった例があります。",
      },
      {
        choices: [
          { points: 2, label: "校則ではなく、指導の方法を問う", say: "問うのは校則の存在ではなく運用です。生徒は人前で繰り返し指導され、授業から外されかけました。指導の方法が行き過ぎています。" },
          { points: 1, label: "生徒の声を示す", say: "全校アンケートで、7割の生徒がこの校則に納得していません。" },
          { points: 0, label: "指導した人を責める", say: "指導した人は、生徒の気持ちを分かっていません。" },
        ],
        rebut: "指導は全員に同じように行っており、特定の生徒を狙ったものではありません。納得できないなら、校則の見直しを求める道もあります。",
      },
      {
        choices: [
          { points: 2, label: "見直しの道がないことを示す", say: "生徒会が見直しを求めても、回答は「決まりだから」だけでした。説明も見直しの道もないまま、生徒に不利益を与えています。" },
          { points: 1, label: "進路への影響を訴える", say: "このままでは、従わない生徒が進路で不利になるおそれがあります。" },
          { points: 0, label: "感情で締めくくる", say: "とにかく、納得できません！" },
        ],
        rebut: "学校には秩序を守る役割もあります。校則をなくすことだけが答えではありません。",
      },
    ],
    verdict: {
      high: {
        result: "一部有罪",
        sub: "校則は存続。ただし、指導の方法は行き過ぎと認める",
        reasons: [
          "学校は教育のためにルールを定める裁量を持ち、髪型の校則そのものが直ちに違法になるわけではない。",
          "しかし、目的との関係を説明せず、人前で繰り返し指導し、見直しの求めにも応じない運用は、生徒を個人として尊重する点で行き過ぎである。髪をめぐる実際の裁判でも、校則自体は違法としなかった一方、学校の対応の一部を違法とした例がある。",
          "本法廷は、校則の目的を説明すること、生徒が見直しを求められる手続きを設けることを求める。",
        ],
      },
      low: {
        result: "無罪",
        sub: "校則の違法性は立証されなかった",
        reasons: [
          "学校は教育のためにルールを定める裁量を持ち、髪型の校則そのものが直ちに違法になるわけではない。",
          "検察官は不満や他校との比較を示したが、どの運用が、生徒のどの利益を害したかを特定できなかった。",
          "校則を変えるには、裁判よりも、生徒会などを通じて目的の説明と見直しを求める道もある。",
        ],
      },
    },
  },
  {
    id: "kirinuki",
    group: "life",
    preset: "SNSの切り抜き動画による誹謗中傷",
    keywords: ["SNS", "動画", "切り抜き", "誹謗", "中傷", "拡散", "炎上", "TikTok", "YouTube", "X", "インスタ"],
    defendant: "悪意の切り抜き動画",
    charge: "配信の一部だけを切り抜いて投稿し、発言の意味をねじ曲げて、配信者への中傷を広げた罪",
    laws: [
      {
        id: "keiho230", points: 2,
        charge: "被告は、発言の前後を切り、「差別発言をした」と見える動画を公開しました。不特定多数に事実を示して名誉を傷つけており、刑法第230条の名誉毀損罪にあたります。",
        rebut: "動画は本人の発言そのものです。編集しただけで、ない事実を作ったわけではありません。",
      },
      {
        id: "keiho231", points: 1,
        charge: "被告は、動画に「最低な人間」という字幕を付け、公然と人を侮辱しました。刑法第231条の侮辱罪にあたります。",
        rebut: "字幕は感想にすぎず、表現の自由の範囲です。批判と侮辱は区別されるべきです。",
      },
      {
        id: "chosaku21", points: 1,
        charge: "被告は、配信者の動画を無断で切り抜いて投稿しました。著作権法第21条の複製権を侵害しています。",
        rebut: "著作権の問題は、権利を持つ配信者本人が判断することです。それに、本件で問われているのは中傷の広がりのはずです。",
      },
    ],
    turns: [
      {
        choices: [
          { points: 2, label: "切り取りで意味が変わったことを示す", say: "元の配信では、この発言の直後に「という意見は間違っている」と続いています。切り抜きは、本人が否定した意見を、本人の意見に見せかけています。" },
          { points: 1, label: "再生数の多さを示す", say: "動画は300万回再生されました。それだけ多くの人に誤解が広がっています。" },
          { points: 0, label: "投稿者の人柄を責める", say: "こんな動画を作る人は、普段からひどい人に違いありません。" },
        ],
        rebut: "再生数が多くても、どう受け取るかは見た人それぞれです。視聴者は元の配信を確かめることもできます。",
      },
      {
        choices: [
          { points: 2, label: "社会的評価が下がった証拠を示す", say: "投稿後、配信者には1日で千件を超える中傷コメントが届き、企業案件が打ち切られました。社会的な評価が下がったことは明らかです。" },
          { points: 1, label: "コメント欄の荒れを示す", say: "コメント欄は、配信者への悪口であふれています。" },
          { points: 0, label: "動画サイトの責任を訴える", say: "こんな動画を消さない動画サイトが一番悪いです。" },
        ],
        rebut: "中傷コメントを書いたのは、視聴者一人ひとりです。投稿者にすべての責任を負わせるのは行き過ぎです。",
      },
      {
        choices: [
          { points: 2, label: "罰せられない例外に当たらないことを示す", say: "名誉毀損でも、公共の利害に関わり、公益のためで、真実と証明されれば罰せられない場合があります。しかし本件は意味をねじ曲げた時点で真実ではなく、目的も再生数稼ぎです。" },
          { points: 1, label: "拡散した人も裁くよう求める", say: "動画を拡散した人たちにも、責任を取らせるべきです。" },
          { points: 0, label: "感情で締めくくる", say: "見ていて、本当に気分が悪いんです！" },
        ],
        rebut: "切り抜きは、ネットで広く行われている表現の一つです。",
      },
    ],
    verdict: {
      high: {
        result: "有罪",
        sub: "名誉毀損にあたると認める",
        reasons: [
          "発言の前後を切り、本人が否定した意見を本人の意見に見せかけた動画は、公然と事実を示して人の名誉を傷つけるもので、名誉毀損にあたる。",
          "公共の利害に関わる事実で、目的が公益のためで、真実と証明された場合は罰せられないことがある（刑法第230条の2）。本件は意味をねじ曲げており、目的も再生数稼ぎで、これに当たらない。",
          "被害を受けた人は、情報流通プラットフォーム対処法にもとづき、投稿の削除や発信者情報の開示を求めることもできる。",
        ],
      },
      low: {
        result: "無罪",
        sub: "名誉が傷ついたことの立証が足りなかった",
        reasons: [
          "切り抜き動画でも、意味をねじ曲げて人の名誉を傷つければ、名誉毀損にあたりうる。",
          "しかし検察官は、元の発言との違いや、配信者の社会的な評価が下がった事実を具体的に示せなかった。",
          "ネットの中傷を問うには、元の投稿や記録を残し、何がどう事実と違うかを示すことが大切である。",
        ],
      },
    },
  },
  {
    id: "zangyo",
    group: "life",
    preset: "残業代の出ないシフト強制",
    keywords: ["残業", "シフト", "割増", "給料", "時給", "職場", "サービス残業", "36協定"],
    defendant: "残業代のないシフト",
    charge: "閉店後の片付けを労働時間に入れず、断ると次のシフトを外すと告げて、割増賃金を払わなかった罪",
    laws: [
      {
        id: "rouki37", points: 2,
        charge: "被告は、閉店後の作業を労働時間と認めず、割増賃金を払っていません。労働基準法第37条に反します。",
        rebut: "片付けは自主的なもので、使用者の指示ではありません。指示がなければ、労働時間にも割増賃金の対象にもなりません。",
      },
      {
        id: "rouki32", points: 1,
        charge: "被告は、週40時間を超えて働かせています。労働基準法第32条に反します。",
        rebut: "時間外労働は、労使協定を結んで届け出れば認められます。時間を超えたことと、賃金を払わないことは別です。",
      },
      {
        id: "minpo709", points: 1,
        charge: "払われるべき賃金が払われず、労働者の財産的な利益が害されました。民法第709条の不法行為として責任を問います。",
        rebut: "賃金の不払いは、まず労働基準法の問題です。不法行為として慰謝料まで認めるには、別の損害を示す必要があります。",
      },
    ],
    turns: [
      {
        choices: [
          { points: 2, label: "指示があった証拠を示す", say: "店のマニュアルに「閉店後30分は全員残って片付け」とあり、タイムカードは閉店時刻で打たされていました。指示のもとで、労働時間から外されています。" },
          { points: 1, label: "みんな残っていると訴える", say: "残らない人はいません。事実上、強制です。" },
          { points: 0, label: "店の経営を非難する", say: "この店は、人を安く使っているだけです。" },
        ],
        rebut: "マニュアルは目安です。実際に誰が何分残ったかは、一人ずつ確認しなければ労働時間とは言えません。",
      },
      {
        choices: [
          { points: 2, label: "断ったときの不利益を示す", say: "残らないと次のシフトを外す、とメッセージが残っています。断る自由はなく、使用者の指揮のもとです。" },
          { points: 1, label: "深夜まで及んだことを示す", say: "片付けは午後10時を超える日もあります。深夜の割増も払われていません。" },
          { points: 0, label: "時給の安さを責める", say: "そもそも時給が低すぎます。" },
        ],
        rebut: "シフトをどう組むかは、店舗の運営の裁量です。一度の発言だけで、賃金不払いのすべてを説明できません。",
      },
      {
        choices: [
          { points: 2, label: "払うべき額の計算を示す", say: "タイムカードと実際の退店時刻の差は、月20時間です。この時間について、2割5分以上の割増が払われていません。" },
          { points: 1, label: "他の店との違いを示す", say: "近隣の店では、閉店後の作業にも賃金が出ています。" },
          { points: 0, label: "感情で締めくくる", say: "働いた分くらい、払ってほしいんです！" },
        ],
        rebut: "計算の前提が、すべて使用者の指示による労働だとは限りません。",
      },
    ],
    verdict: {
      high: {
        result: "違反",
        sub: "割増賃金の不払いは、労働基準法に反すると認める",
        reasons: [
          "使用者の指示で閉店後に残り、断ればシフトを外すと告げられていた作業は、労働時間である。",
          "その時間が法定の労働時間を超え、2割5分以上の割増賃金が払われていなければ、労働基準法第37条に反する。週40時間の上限（第32条）を超えること自体は、届け出た労使協定があれば直ちに違法にはならない。",
          "本法廷は、実労働時間の記録と、未払いの割増賃金の支払いを求める。賃金の請求は、労働基準監督署への相談や、裁判でも争える。",
        ],
      },
      low: {
        result: "立証不足",
        sub: "労働時間だったことの立証が足りなかった",
        reasons: [
          "指示のもとで残り、労働時間から外されていれば、割増賃金の不払いは労働基準法第37条に反しうる。",
          "しかし検察官は、使用者の指示、実際の労働時間、払われなかった額を特定できなかった。",
          "残業代を問うには、シフト、タイムカード、退店時刻、指示の記録を残すことが大切である。",
        ],
      },
    },
  },
  {
    id: "stema",
    group: "life",
    preset: "広告だと分からないステマ投稿",
    keywords: ["ステマ", "広告", "PR", "インフルエンサー", "口コミ", "宣伝", "案件"],
    defendant: "広告だと分からない投稿",
    charge: "事業者から報酬を受けた商品紹介を、個人の感想のように投稿し、広告だと分からないまま客を誘引した罪",
    laws: [
      {
        id: "keihyo5_3", points: 2,
        charge: "被告は、広告なのに広告と分かりません。景品表示法第5条第3号が禁じる、消費者を誤認させる表示にあたります。",
        rebut: "投稿は個人の感想です。景品表示法が規制するのは、商品を供給する事業者の表示であり、投稿した個人そのものではありません。",
      },
      {
        id: "keihyo5_1", points: 1,
        charge: "被告は、効果を実際より著しく良く見せています。景品表示法第5条第1号の優良誤認にあたります。",
        rebut: "よく見える、という感想と、実際より著しく優良だと示す表示は違います。効果の数字や比較が示されていません。",
      },
      {
        id: "minpo709", points: 0,
        charge: "この投稿を信じて買った人は、損害を受けました。民法第709条の不法行為として責任を問います。",
        rebut: "誰が、何を、いくらで買い、どんな損害を受けたかが特定されていません。表示の規制と、損害賠償は別です。",
      },
    ],
    turns: [
      {
        choices: [
          { points: 2, label: "事業者の関与を示す", say: "投稿の前に、事業者から原稿の修正指示と報酬の振り込みがあります。個人の自主的な感想ではなく、事業者の表示です。" },
          { points: 1, label: "商品名が大きく出ていると示す", say: "投稿の半分は、商品の写真と購入リンクです。" },
          { points: 0, label: "投稿者の人柄を責める", say: "お金をもらって感想を書くこと自体が、ずるいです。" },
        ],
        rebut: "報酬があっても、表示の中身を事業者が決めていなければ、事業者の表示とは限りません。",
      },
      {
        choices: [
          { points: 2, label: "広告だと判別できないことを示す", say: "投稿には「PR」「広告」「提供」の表示がありません。個人の使用感として読まれ、消費者は広告だと判別できません。" },
          { points: 1, label: "いいねの数を示す", say: "この投稿は10万件の反応を集め、多くの人の目に触れました。" },
          { points: 0, label: "SNS全体を非難する", say: "SNSの広告は、全部信用できません。" },
        ],
        rebut: "見た人が調べれば、事業者との関係は分かります。表示が一見個人の感想でも、直ちに違法とは言えません。",
      },
      {
        choices: [
          { points: 2, label: "誰が規制されるかを整理する", say: "問うのは投稿者個人の刑罰ではありません。商品を供給する事業者が、広告だと分からない表示で客を誘引したことです。2023年10月から、これは景品表示法の指定表示です。" },
          { points: 1, label: "買った人の失望を訴える", say: "投稿を見て買った人の多くが、効果がないとレビューしています。" },
          { points: 0, label: "感情で締めくくる", say: "だまされた気分なんです！" },
        ],
        rebut: "広告であることが明瞭なら、事業者は宣伝を続けられます。表示の問題と、商品の善し悪しは別です。",
      },
    ],
    verdict: {
      high: {
        result: "違反",
        sub: "景品表示法の不当表示にあたると認める",
        reasons: [
          "事業者が原稿と報酬で表示内容に関与し、「PR」「広告」などの表示がない投稿は、一般消費者が事業者の表示だと判別しにくい。",
          "これは景品表示法第5条第3号にもとづき指定された不当表示（いわゆるステルスマーケティング）にあたりうる。規制の対象は商品を供給する事業者であり、投稿を頼まれた個人そのものではない。刑罰ではなく、措置命令の対象になる。",
          "効果を実際より著しく良く見せたかどうか（第5条第1号）は、本件では別に立証されていない。本法廷は、広告である旨の明瞭な表示を求める。",
        ],
      },
      low: {
        result: "立証不足",
        sub: "事業者の表示だったことの立証が足りなかった",
        reasons: [
          "広告だと分からない商品紹介は、事業者の表示であれば景品表示法の不当表示にあたりうる。",
          "しかし検察官は、事業者が表示内容を決めたこと、広告だと判別できないことを具体的に示せなかった。",
          "ステマを問うには、報酬や指示の有無と、投稿に広告である旨が出ているかを見る必要がある。",
        ],
      },
    },
  },
  {
    id: "teiki",
    group: "life",
    preset: "解約しにくい定期購入",
    keywords: ["定期購入", "定期", "サブスク", "解約", "初回", "通販", "サプリ", "お試し"],
    defendant: "初回だけ安い定期購入",
    charge: "初回のみ安いと見せ、最終確認画面に回数・2回目以降の代金・解約条件を出さないまま、定期購入を申し込ませた罪",
    laws: [
      {
        id: "tokusho12_6", points: 2,
        charge: "被告は、申込みの最終画面に、分量、2回目以降の代金、解約条件を出していません。特定商取引法第12条の6に反します。",
        rebut: "詳しい条件は、別のページに書いてあります。最終画面にすべてを繰り返す義務はありません。",
      },
      {
        id: "tokusho15_4", points: 2,
        charge: "表示すべきことがなく、1回だけの購入だと誤解して申し込みました。特定商取引法第15条の4により、申込みを取り消せます。",
        rebut: "通信販売に、訪問販売のようなクーリング・オフはありません。誤解ではなく、確認を怠っただけです。",
      },
      {
        id: "minpo709", points: 0,
        charge: "予定外の代金を払わされ、損害を受けました。民法第709条の不法行為として責任を問います。",
        rebut: "契約に基づく代金の請求は、直ちに不法行為ではありません。取消しができるかどうかが先です。",
      },
    ],
    turns: [
      {
        choices: [
          { points: 2, label: "最終画面に何がなかったかを示す", say: "申込みボタンの画面には「初回980円」としかなく、全4回、2回目から各6,000円、途中解約不可とは出ていません。" },
          { points: 1, label: "広告の見た目を示す", say: "広告は大きく「お試し980円」と書いてあり、定期だとは小さくしか書いてありません。" },
          { points: 0, label: "業者を非難する", say: "こういう売り方は、詐欺と同じです。" },
        ],
        rebut: "定期であることは、商品ページの下の方に書いてあります。読まなかった側にも落ち度があります。",
      },
      {
        choices: [
          { points: 2, label: "誤解して申し込んだことを示す", say: "購入者は、1回限りの試し買いだと信じてボタンを押しています。表示がなかった事項を、存在しないと誤解したのです。" },
          { points: 1, label: "解約の手続きの難しさを示す", say: "解約は電話のみで、つながらない時間が長く続いています。" },
          { points: 0, label: "値段の高さを責める", say: "6,000円は、高すぎます。" },
        ],
        rebut: "解約窓口が電話だけでも、それだけでは申込みの取消しの理由になりません。",
      },
      {
        choices: [
          { points: 2, label: "取り消せる要件に当てはめる", say: "第12条の6で表示すべき分量と代金、解除の条件が最終画面になく、そのせいで1回だと思って申し込みました。第15条の4の取消しができます。" },
          { points: 1, label: "同じ被害の多さを示す", say: "同じ広告で、同じ誤解をした人が多数います。" },
          { points: 0, label: "感情で締めくくる", say: "返してほしい、それだけです！" },
        ],
        rebut: "取消しには、表示の不備と、そのせいで誤解したこと、両方のつながりが必要です。",
      },
    ],
    verdict: {
      high: {
        result: "取消しを認める",
        sub: "申込みの意思表示は、取り消せると認める",
        reasons: [
          "最終確認画面に、定期の回数、2回目以降の代金、解約条件が出ていなければ、特定商取引法第12条の6の表示義務に反しうる。",
          "その不備のせいで1回限りだと誤解して申し込んだなら、第15条の4により申込みを取り消せる。通信販売には、訪問販売のようなクーリング・オフは原則としてない。",
          "本法廷は、申込みの取消しと、支払済み代金の返還を認める。解約窓口が電話だけであること自体は、取消しの理由にはならない。",
        ],
      },
      low: {
        result: "立証不足",
        sub: "誤解して申し込んだことの立証が足りなかった",
        reasons: [
          "最終画面に分量、代金、解約条件がなければ、特定商取引法第12条の6に反し、誤解して申し込んだ人は第15条の4で取り消せる。",
          "しかし検察官は、最終画面に何がなく、そのせいで何だと誤解したかを特定できなかった。",
          "定期購入を問うには、申込み画面の記録と、自分が何だと理解してボタンを押したかを残すことが大切である。",
        ],
      },
    },
  },
];

const MAX_SCORE = 8;
const WIN_LINE = 5;
const MIN_LEN = 20;
const MAX_LEN = 300;
const STORE_KEY = "savaku_codex";
const AGREE_KEY = "savaku_agreed";

const screen = document.getElementById("screen");
const loading = document.getElementById("loading");
const loadingText = document.getElementById("loading-text");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const toast = document.getElementById("toast");

let state = null;
let busy = false;

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function lawButton(id) {
  return `<button class="law-link" type="button" data-law="${id}">${esc(LAWS[id].name)}</button>`;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function showLoading(messages) {
  busy = true;
  loading.hidden = false;
  for (const message of messages) {
    loadingText.textContent = message;
    await wait(700);
  }
  loading.hidden = true;
  busy = false;
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 2200);
}

function openModal(html) {
  modalBody.innerHTML = html;
  modal.hidden = false;
}

function openLaw(id) {
  const law = LAWS[id];
  openModal(`
    <h3>${esc(law.name)}</h3>
    <div class="article">${esc(law.article)}</div>
    <p class="plain"><b>かみくだくと：</b>${esc(law.plain)}</p>
    <p class="src">出典：<a href="https://laws.e-gov.go.jp/law/${law.lawId}" target="_blank" rel="noopener">e-Gov法令検索</a>（条文は抜粋）</p>
  `);
}

function openDisclaimer() {
  openModal(`
    <h3>はじめに</h3>
    <p class="plain">SAVAKUの判決は、AIによるシミュレーションです。実際の法的助言ではありません。</p>
    <p class="plain">実在する人の名前（同級生、先生、有名人など）は入力できません。事象そのものを被告にしてください。</p>
    <p class="plain">このプロトタイプはAIに接続しておらず、用意したお題ごとに台本で応答します。</p>
  `);
  localStorage.setItem(AGREE_KEY, "1");
}

function checkInput(text) {
  const trimmed = text.trim();
  if (trimmed.length < MIN_LEN) return `あと${MIN_LEN - trimmed.length}文字以上、具体的に書いてください。`;
  if (trimmed.length > MAX_LEN) return `${MAX_LEN}文字以内にしてください。`;
  const allowed = ["皆さん", "みなさん", "お客様", "神様", "お母さん", "お父さん", "店員さん", "駅員さん", "生徒さん"];
  let scrubbed = trimmed;
  allowed.forEach((word) => { scrubbed = scrubbed.split(word).join(""); });
  if (/[一-龥ァ-ヶーA-Za-z]{1,8}(さん|くん|君|ちゃん|先生|氏|様)/.test(scrubbed) || /@[A-Za-z0-9_]+/.test(scrubbed)) {
    return "実在する人の名前やアカウントが含まれているようです。人ではなく「ルール」や「出来事」を被告にしてください。";
  }
  if (/(死ね|しね|殺す|ころす|消えろ)/.test(scrubbed)) {
    return "強い攻撃的な表現が含まれています。言い換えて入力してください。";
  }
  return "";
}

function presetButtons(group) {
  return CASES
    .filter((item) => item.group === group)
    .map((item) => `<button class="chip" type="button" data-preset="${item.id}">${esc(item.preset)}</button>`)
    .join("");
}

function matchCase(text) {
  let best = null;
  let bestHits = 0;
  CASES.forEach((item) => {
    const hits = item.keywords.filter((word) => text.includes(word)).length;
    if (hits > bestHits) { best = item; bestHits = hits; }
  });
  return best;
}

// --- 画面：トップ・起訴入力 ---
function renderHome(prefill = "") {
  state = null;
  screen.innerHTML = `
    <p class="label">日常の違和感を、法律で裁く</p>
    <h1>その違和感を、<em>被告席へ。</em></h1>
    <p class="lead">あなたは検察官。弁護人と裁判長はAIが務めます。</p>

    <div class="section">
      <h2>被告について</h2>
      <p class="lead">裁きたい事象やモヤモヤを書いてください（${MIN_LEN}〜${MAX_LEN}文字）。</p>
      <textarea id="input" class="input-box" maxlength="${MAX_LEN + 50}" placeholder="例：店のシフトが直前に変わり、残業しても割増賃金が出ない。断ると、次のシフトを外される。">${esc(prefill)}</textarea>
      <div id="counter" class="counter">0 / ${MAX_LEN}</div>
      <div id="input-alert"></div>
      <button id="indict" class="primary" type="button" disabled>被告席へ</button>
    </div>

    <div class="section">
      <h2>お題から選ぶ</h2>
      <p class="label">暮らし</p>
      <div class="presets">
        ${presetButtons("life")}
      </div>
      <p class="label group-label">学校</p>
      <div class="presets">
        ${presetButtons("school")}
      </div>
    </div>
  `;

  const input = document.getElementById("input");
  const counter = document.getElementById("counter");
  const alertBox = document.getElementById("input-alert");
  const indict = document.getElementById("indict");

  const update = () => {
    const length = input.value.trim().length;
    counter.textContent = `${length} / ${MAX_LEN}`;
    counter.classList.toggle("bad", length > MAX_LEN);
    const problem = checkInput(input.value);
    const showProblem = problem && length >= MIN_LEN;
    alertBox.innerHTML = showProblem ? `<div class="alert">${esc(problem)}</div>` : "";
    indict.disabled = Boolean(problem);
  };
  input.addEventListener("input", update);
  update();

  indict.addEventListener("click", () => {
    const text = input.value.trim();
    const matched = matchCase(text);
    startTrial(matched || CASES[0], text, !matched);
  });
}

// --- 裁判 ---
async function startTrial(item, inputText, fallback) {
  state = { item, inputText, fallback, lawId: null, score: 0, turn: 0, log: [], picks: [] };
  await showLoading(["起訴状を作成中…", "被告を具現化しています…", "開廷します"]);
  state.log.push({ who: "judge", text: `これより開廷します。被告「${item.defendant}」。罪状は、${item.charge}。検察官、適用する法律を選んでください。` });
  renderTrial();
}

function renderTrial() {
  const { item, log, score } = state;
  const mood = score >= WIN_LINE ? "down" : score >= 3 ? "sweat" : "";
  const fallbackNote = state.fallback
    ? `<div class="info">プロトタイプでは、入力に近いお題「${esc(item.preset)}」の台本で審理します。</div>`
    : "";
  const inputNote = state.inputText
    ? `<div class="charge">起訴内容：${esc(state.inputText)}</div>`
    : "";

  screen.innerHTML = `
    ${fallbackNote}
    <div class="court" style="margin-top:${state.fallback ? 12 : 0}px">
      <div class="bench">裁判長<span class="tag-ai">AI</span></div>
      <div class="seats">
        <div class="seat pros">検察官<span class="tag-me">あなた</span></div>
        <div class="defendant">
          <div class="face ${mood}"><div class="mouth"></div></div>
          <div class="name">${esc(item.defendant)}</div>
        </div>
        <div class="seat def">弁護人<span class="tag-ai">AI</span></div>
      </div>
      <div class="charge">罪状：<b>${esc(item.charge)}</b></div>
      ${inputNote}
      <div class="meter">
        <div class="meter-label"><span>論告の説得力</span><span>${score} / ${MAX_SCORE}</span></div>
        <div class="meter-track"><div class="meter-fill" style="width:${(score / MAX_SCORE) * 100}%"></div></div>
      </div>
    </div>

    <div class="log">
      ${log.map(renderSay).join("")}
    </div>

    <div id="action" class="section"></div>
  `;
  renderAction();
  document.getElementById("action").scrollIntoView({ behavior: "smooth", block: "end" });
}

function renderSay(entry) {
  const names = { judge: "裁判長（AI）", pros: "検察官（あなた）", def: "弁護人（AI）" };
  return `<div class="say ${entry.who}"><div class="who">${names[entry.who]}</div>${entry.html || esc(entry.text)}</div>`;
}

function renderAction() {
  const action = document.getElementById("action");
  const { item, lawId, turn } = state;

  if (!lawId) {
    action.innerHTML = `
      <p class="step-label">STEP 1　適用する法律を選ぶ</p>
      <p class="lead">法律名をタップすると条文を確認できます。</p>
      <div class="choices">
        ${item.laws.map((law, index) => `
          <div class="choice">
            <div class="row-law">
              ${lawButton(law.id)}
              <button class="ghost small" type="button" data-pick-law="${index}">これで起訴</button>
            </div>
          </div>`).join("")}
      </div>
    `;
    return;
  }

  const current = item.turns[turn];
  action.innerHTML = `
    <p class="step-label">STEP 2　論戦 ${turn + 1} / ${item.turns.length}</p>
    <p class="lead">弁護人の反論に、どう切り返しますか。</p>
    <div class="choices">
      ${current.choices.map((choice, index) => `
        <button class="choice" type="button" data-pick="${index}">${esc(choice.label)}<small>${esc(choice.say)}</small></button>`).join("")}
    </div>
  `;
}

function reaction(points) {
  if (points === 2) return "……確かに、その点は認めます。しかし、";
  if (points === 1) return "検察官の主張は分かります。ですが、";
  return "検察官の主張は、感情論にすぎません。";
}

async function pickLaw(index) {
  const law = state.item.laws[index];
  state.lawId = law.id;
  state.score += law.points;
  state.picks.push(LAWS[law.id].name);
  state.log.push({ who: "pros", html: `${lawButton(law.id)}を適用します。${esc(law.charge)}` });
  await showLoading(["弁護人が反論を準備中…"]);
  state.log.push({ who: "def", text: law.rebut });
  renderTrial();
}

async function pickChoice(index) {
  const { item } = state;
  const current = item.turns[state.turn];
  const choice = current.choices[index];
  state.score += choice.points;
  state.picks.push(choice.label);
  state.log.push({ who: "pros", text: choice.say });
  await showLoading(["弁護人が反論を準備中…"]);
  state.log.push({ who: "def", text: reaction(choice.points) + current.rebut });
  state.turn += 1;

  if (state.turn < item.turns.length) {
    renderTrial();
    return;
  }
  await showLoading(["裁判長が評議中…", "判決文を作成中…"]);
  renderVerdict();
}

// --- 判決 ---
function currentVerdict() {
  return state.score >= WIN_LINE ? state.item.verdict.high : state.item.verdict.low;
}

function renderVerdict() {
  const { item, score } = state;
  const verdict = currentVerdict();
  screen.innerHTML = `
    <p class="step-label">STEP 3　判決</p>
    <div class="verdict">
      <div class="main">主文　被告「${esc(item.defendant)}」は</div>
      <div class="result">${esc(verdict.result)}</div>
      <div class="sub">${esc(verdict.sub)}</div>
    </div>
    <p class="score">論告の説得力：${score} / ${MAX_SCORE}</p>

    <div class="reason">
      <p><b>判決理由</b></p>
      ${verdict.reasons.map((reason) => `<p>${esc(reason)}</p>`).join("")}
    </div>
    <div class="info">この判決はAIによるシミュレーションで、実際の法的助言ではありません。</div>

    <button class="primary" type="button" data-action="redpen">STEP 4　法律に赤ペンを入れる</button>
    <div class="row">
      <button class="ghost" type="button" data-action="retry">論戦をやり直す</button>
      <button class="ghost" type="button" data-action="home">別の事件を起訴</button>
    </div>
  `;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- 赤ペン ---
function renderRedPen(selected = null, draft = "") {
  const { item } = state;
  const ids = item.laws.map((law) => law.id);
  const lawId = selected || state.lawId;
  const law = LAWS[lawId];

  screen.innerHTML = `
    <p class="step-label">STEP 4　赤ペン（法改正）</p>
    <h2>この裁判に出てきた法律</h2>
    <p class="lead">現代に合っていない、違和感があると思う法律を選び、改善案を書き込んでください。</p>
    <div class="law-list">
      ${ids.map((id) => `<button class="law-item ${id === lawId ? "on" : ""}" type="button" data-pen-law="${id}">${esc(LAWS[id].name)}</button>`).join("")}
    </div>

    <div class="paper">
      <div class="title">${esc(law.name)}</div>
      <div id="old" class="old ${draft ? "struck" : ""}">${esc(law.article)}</div>
      <div id="new" class="new">${esc(draft)}</div>
    </div>
    <textarea id="pen" class="pen-box" placeholder="例：SNSで、相手に返信や行動を繰り返し強いることも、害の告知に含める。">${esc(draft)}</textarea>
    <button class="law-link" type="button" data-law="${lawId}" style="margin-top:8px;font-size:13px">この条文をかみくだいて読む</button>

    <button id="save" class="primary" type="button" ${draft ? "" : "disabled"}>マイ法典に保存して共有する</button>
    <div class="row">
      <button class="ghost" type="button" data-action="share-only">赤ペンなしで共有</button>
      <button class="ghost" type="button" data-action="home">別の事件を起訴</button>
    </div>
  `;

  const pen = document.getElementById("pen");
  const oldText = document.getElementById("old");
  const newText = document.getElementById("new");
  const save = document.getElementById("save");
  pen.addEventListener("input", () => {
    const value = pen.value.trim();
    newText.textContent = value;
    oldText.classList.toggle("struck", Boolean(value));
    save.disabled = !value;
  });
  save.addEventListener("click", () => {
    saveEntry(lawId, pen.value.trim());
  });
  state.penLaw = lawId;
}

function loadCodex() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveEntry(lawId, revision) {
  const verdict = currentVerdict();
  const entry = {
    date: new Date().toLocaleDateString("ja-JP"),
    defendant: state.item.defendant,
    result: verdict.result,
    sub: verdict.sub,
    law: lawId ? LAWS[lawId].name : "",
    revision,
  };
  if (revision) {
    const codex = loadCodex();
    codex.unshift(entry);
    localStorage.setItem(STORE_KEY, JSON.stringify(codex));
    showToast("マイ法典に保存しました");
  }
  renderShare(entry);
}

// --- 共有 ---
function shareText(entry) {
  const lines = [
    `【SAVAKU 判決】被告「${entry.defendant}」は${entry.result}`,
    entry.sub,
  ];
  if (entry.revision) lines.push(`赤ペン：${entry.law}を「${entry.revision}」に`);
  lines.push("#SAVAKU #その違和感を被告席へ");
  return lines.join("\n");
}

function renderShare(entry) {
  screen.innerHTML = `
    <h2>判決をシェア</h2>
    <p class="lead">実装では、このカードを画像にしてSNSに共有します。</p>
    <div class="share-card">
      <div class="brand-s">SAVAKU 判決</div>
      <div class="def">被告「${esc(entry.defendant)}」</div>
      <div class="res">${esc(entry.result)}</div>
      <div>${esc(entry.sub)}</div>
      ${entry.revision ? `<div class="rev">赤ペン：${esc(entry.law)}<br>${esc(entry.revision)}</div>` : ""}
    </div>
    <button id="copy" class="primary" type="button">共有用テキストをコピー</button>
    <div class="row">
      <button class="ghost" type="button" data-action="codex">マイ法典を見る</button>
      <button class="ghost" type="button" data-action="home">別の事件を起訴</button>
    </div>
  `;
  document.getElementById("copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(shareText(entry));
      showToast("コピーしました");
    } catch {
      showToast("コピーできませんでした");
    }
  });
}

// --- マイ法典 ---
function renderCodex() {
  const codex = loadCodex();
  screen.innerHTML = `
    <h2>マイ法典</h2>
    <p class="lead">過去の判決と、赤ペンで書き換えた法律。プロトタイプではこの端末に保存します（実装ではログインが必要）。</p>
    ${codex.length ? codex.map((entry) => `
      <div class="entry">
        <div class="top"><span>${esc(entry.date)}</span><span class="res">${esc(entry.result)}</span></div>
        <div class="def">被告「${esc(entry.defendant)}」</div>
        <div>${esc(entry.law)}</div>
        <div class="rev">赤ペン：${esc(entry.revision)}</div>
      </div>`).join("") : `<p class="empty">まだ保存された法典はありません。</p>`}
    <button class="primary" type="button" data-action="home">事件を起訴する</button>
    ${codex.length ? `<button class="ghost" type="button" data-action="clear-codex">マイ法典を消去</button>` : ""}
  `;
}

// --- イベント ---
document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target || busy) return;

  if (target.dataset.law) { openLaw(target.dataset.law); return; }
  if (target.dataset.preset) {
    const item = CASES.find((entry) => entry.id === target.dataset.preset);
    startTrial(item, "", false);
    return;
  }
  if (target.dataset.pickLaw) { pickLaw(Number(target.dataset.pickLaw)); return; }
  if (target.dataset.pick) { pickChoice(Number(target.dataset.pick)); return; }
  if (target.dataset.penLaw) { renderRedPen(target.dataset.penLaw); return; }

  switch (target.dataset.action) {
    case "home": renderHome(); break;
    case "codex": renderCodex(); break;
    case "close-modal": modal.hidden = true; break;
    case "redpen": renderRedPen(); break;
    case "share-only": saveEntry(null, ""); break;
    case "retry": {
      const { item, inputText, fallback } = state;
      startTrial(item, inputText, fallback);
      break;
    }
    case "clear-codex":
      localStorage.removeItem(STORE_KEY);
      renderCodex();
      break;
    default: break;
  }
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.hidden = true;
});

renderHome();
if (!localStorage.getItem(AGREE_KEY)) openDisclaimer();
