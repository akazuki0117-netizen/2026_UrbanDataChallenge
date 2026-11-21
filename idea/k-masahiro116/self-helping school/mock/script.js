// ===== 架空データ =====
const ROLES = {
  student: { id: "TKY-2026-10234", label: "一般学生", initial: "学" },
  candidate: { id: "TKY-2026-10871", label: "立候補者", initial: "候" },
  officer: { id: "TKY-2026-10002", label: "生徒会役員（選挙管理委員）", initial: "役" },
  teacher: { id: "TCH-0042", label: "校内教員・教育委員会", initial: "教" },
};

const state = {
  role: "student",
  view: "home",
  boxFilter: "all",
  boxSort: "likes",
  nextPostId: 7,
  posts: [
    { id: 1, category: "SNSトラブル", text: "BeRealの通知が来ると授業中でも撮影が始まってしまい、写り込みたくない人も撮られている。", likes: 48, liked: false, status: "public", tempId: "匿名#A3F", author: "TKY-2026-10511", date: "2026-11-10" },
    { id: 2, category: "AI活用", text: "AIで作った先生の偽画像がグループLINEで回ってきた。本物か見分けられない人が多い。", likes: 41, liked: false, status: "public", tempId: "匿名#7KD", author: "TKY-2026-10322", date: "2026-11-12" },
    { id: 3, category: "校則", text: "スマホ禁止の校則があるのに誰も守っていない。守れるルールに作り直したい。", likes: 36, liked: false, status: "public", tempId: "匿名#Q2M", author: "TKY-2026-10688", date: "2026-11-08" },
    { id: 4, category: "学習環境", text: "調べ学習で生成AIを使っていいのか、先生によって言うことが違う。", likes: 29, liked: false, status: "public", tempId: "匿名#P9X", author: "TKY-2026-10145", date: "2026-11-14" },
    { id: 5, category: "SNSトラブル", text: "TikTokに学校の制服や校舎が映った動画が上がっていて、場所が特定されそうで怖い。", likes: 22, liked: false, status: "public", tempId: "匿名#L5B", author: "TKY-2026-10903", date: "2026-11-15" },
    { id: 6, category: "校則", text: "体育祭の写真をSNSに載せていいかのルールがない。", likes: 0, liked: false, status: "pending", tempId: "匿名#Z8R", author: "TKY-2026-10777", date: "2026-11-20" },
  ],
  candidates: [
    {
      name: "青木 ひなた",
      manifesto: [
        { issueId: 1, text: "BeRealなどの撮影は「写る人の同意を取る」ことを校内ルールにし、授業中は通知オフを全員で決めます。", questions: ["同意は口頭でいいの？"] },
        { issueId: 3, text: "スマホ禁止をやめ、休み時間は使ってよい代わりに授業中のルールを生徒総会で決め直します。", questions: [] },
      ],
    },
    {
      name: "佐藤 れん",
      manifesto: [
        { issueId: 2, text: "生徒会にテック担当を置き、AIの偽画像の見分け方を毎月アラートで配信します。", questions: [] },
        { issueId: 4, text: "生成AIの使い方ガイドラインを先生と一緒に作り、デジタル憲章に載せます。", questions: [] },
      ],
    },
  ],
  election: { open: true, period: "投票期間：2026-11-18 〜 2026-11-27", ballots: [], voters: [], totalStudents: 480, presetBallots: { 0: 182, 1: 156, blank: 12 } },
  tracker: [
    { title: "授業中の通知オフルールをつくる", owner: "前期生徒会", status: 3 },
    { title: "SNSに学校の写真を載せる時のガイドライン", owner: "前期生徒会", status: 2 },
    { title: "生成AIの調べ学習での使い方を決める", owner: "前期生徒会", status: 1 },
    { title: "スマホ利用時間の見直し", owner: "前期生徒会", status: 0 },
  ],
  rules: [
    "他の人が写る写真・動画を投稿するときは、写っている人全員の同意を取る。",
    "授業中はSNSの通知をオフにする。BeRealの撮影は休み時間に行う。",
    "制服・校舎・名札など、学校や個人が特定できるものは投稿しない。",
    "AIで作った画像や文章を共有するときは「AI生成」と明記する。",
    "本物か分からない画像や情報は、拡散する前に生徒会のテック担当か先生に相談する。",
  ],
  history: [
    { date: "2026-10-30", text: "第4条「AI生成」の明記ルールを追加（生徒総会で可決）" },
    { date: "2026-07-12", text: "第2条 授業中の通知オフを追加（前期生徒会の公約）" },
    { date: "2026-04-20", text: "校内デジタル憲章を制定" },
  ],
  alerts: [
    { date: "2026-11-18", title: "声をまねるAIによる「なりすまし電話」に注意", body: "数秒の音声から本人そっくりの声を作れるAIが出回っています。動画に声を載せるときは注意し、家族から急なお金の連絡が来たら一度切ってかけ直しましょう。" },
    { date: "2026-11-04", title: "位置情報の共有機能をもつ新しいSNSが流行中", body: "友達と現在地を常に共有できるアプリが増えています。自宅や塾の場所が分かってしまうため、共有範囲を確認しましょう。" },
  ],
  audit: [
    { date: "2026-10-02 15:10", text: "TCH-0017 が投稿 #12 の投稿者IDを照会（理由：脅迫の疑い／承認：校長・教育委員会）" },
  ],
};

const STATUS_LABELS = ["未着手", "検討中", "教員と協議中", "ルール改定完了"];
const NG_WORDS = ["死ね", "消えろ", "きもい", "うざい", "ブス", "バカ"];

// ===== ユーティリティ =====
const $ = (sel) => document.querySelector(sel);

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowStamp() {
  const d = new Date();
  return `${today()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function randomTempId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 3; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return `匿名#${id}`;
}

function currentId() {
  return ROLES[state.role].id;
}

function findPost(id) {
  return state.posts.find((p) => p.id === id);
}

let toastTimer;
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 2400);
}

// 個人名・電話番号・誹謗中傷を検知する簡易フィルタ
function checkContent(text) {
  if (/0\d{1,4}-\d{1,4}-\d{3,4}|0\d{9,10}/.test(text)) return "電話番号のような文字列が含まれています。";
  const named = text.replace(/皆さん|皆様/g, "");
  if (/[一-龠ァ-ヶ]{1,4}(さん|くん|君|ちゃん)|[一-龠]{2,3}先生/.test(named)) return "個人名と思われる表現（〜さん・〜くん・〜先生など）が含まれています。";
  if (/[0-9０-９]+年[0-9０-９]+組/.test(text)) return "クラスなど特定のグループを示す表現が含まれています。";
  const ng = NG_WORDS.find((w) => text.includes(w));
  if (ng) return `誹謗中傷にあたる言葉（「${ng}」）が含まれています。`;
  return null;
}

// ===== 画面遷移 =====
function switchView(view) {
  const section = $(`#view-${view}`);
  if (!section || section.hidden) view = "home";
  state.view = view;

  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${view}`));
  const target = $(`#view-${view}`);
  const parent = target.dataset.parent;
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === (parent || view)));

  $("#app-title").textContent = target.dataset.title;
  $("#back-btn").hidden = !parent;
  $("#screen").scrollTop = 0;
}

function applyRole() {
  const role = ROLES[state.role];
  $("#session-id").textContent = role.id;
  $("#menu-role").textContent = role.label;
  $("#menu-avatar").textContent = role.initial;
  $("#avatar-btn").textContent = role.initial;
  document.querySelectorAll("[data-role]").forEach((el) => {
    el.hidden = el.dataset.role !== state.role;
  });
  if ($(`#view-${state.view}`).hidden) switchView("home");
  renderAll();
}

// ===== ボトムシート =====
function openSheet() {
  $("#sheet-backdrop").hidden = false;
  $("#post-sheet").classList.add("open");
  $("#post-sheet").setAttribute("aria-hidden", "false");
}

function closeSheet() {
  $("#sheet-backdrop").hidden = true;
  $("#post-sheet").classList.remove("open");
  $("#post-sheet").setAttribute("aria-hidden", "true");
  $("#filter-msg").hidden = true;
}

// ===== ホーム =====
function renderHome() {
  const publicPosts = state.posts.filter((p) => p.status === "public");
  $("#stat-posts").textContent = publicPosts.length;
  $("#stat-likes").textContent = publicPosts.reduce((s, p) => s + p.likes, 0);
  $("#stat-election").textContent = state.election.open ? "投票受付中" : "開票済み";
  const done = state.tracker.filter((t) => t.status === 3).length;
  $("#stat-done").textContent = `${done}/${state.tracker.length}`;

  const top = [...publicPosts].sort((a, b) => b.likes - a.likes).slice(0, 3);
  $("#home-top").innerHTML = top
    .map(
      (p) => `
    <li class="item" data-go="box">
      <div class="item-meta"><span class="tag">${escapeHtml(p.category)}</span>共感 ${p.likes}</div>
      <p>${escapeHtml(p.text)}</p>
    </li>`
    )
    .join("");

  const latest = state.alerts[0];
  $("#home-alert").innerHTML = latest
    ? `<div class="alert"><div class="alert-date">${latest.date}</div><b>${escapeHtml(latest.title)}</b><p>${escapeHtml(latest.body)}</p></div>`
    : "";
}

// ===== 目安箱 =====
function updatePostButton() {
  const allChecked = [...document.querySelectorAll(".consent-check")].every((c) => c.checked);
  const hasText = $("#post-text").value.trim().length > 0;
  $("#post-submit").disabled = !(allChecked && hasText);
}

function renderPosts() {
  document.querySelectorAll("#box-chips .chip").forEach((c) => c.classList.toggle("active", c.dataset.cat === state.boxFilter));
  document.querySelectorAll("#box-sort .seg").forEach((s) => s.classList.toggle("active", s.dataset.sort === state.boxSort));

  let list = state.posts.filter((p) => p.status === "public");
  if (state.boxFilter !== "all") list = list.filter((p) => p.category === state.boxFilter);
  list.sort((a, b) => (state.boxSort === "likes" ? b.likes - a.likes : b.date.localeCompare(a.date) || b.id - a.id));

  const mine = state.posts.filter((p) => p.status === "pending" && p.author === currentId());
  const pendingNote = mine.length ? `<li class="item"><div class="item-meta">あなたの投稿 ${mine.length} 件が教員の承認待ちです。</div></li>` : "";

  $("#post-list").innerHTML =
    pendingNote +
    (list
      .map(
        (p) => `
      <li class="item">
        <div class="item-meta"><span class="tag">${escapeHtml(p.category)}</span>${p.tempId}・${p.date}</div>
        <p>${escapeHtml(p.text)}</p>
        <div class="item-foot">
          <button class="like-btn ${p.liked ? "liked" : ""}" data-like="${p.id}">${p.liked ? "♥" : "♡"} 共感 ${p.likes}</button>
        </div>
      </li>`
      )
      .join("") || `<li class="item"><p class="hint">該当する投稿はありません。</p></li>`);
}

function submitPost(e) {
  e.preventDefault();
  const text = $("#post-text").value.trim();
  const msg = $("#filter-msg");
  const problem = checkContent(text);
  if (problem) {
    msg.textContent = `投稿できません：${problem} 内容を見直してください。`;
    msg.hidden = false;
    return;
  }
  state.posts.push({
    id: state.nextPostId++,
    category: $("#post-category").value,
    text,
    likes: 0,
    liked: false,
    status: "pending",
    tempId: randomTempId(),
    author: currentId(),
    date: today(),
  });
  $("#post-form").reset();
  updatePostButton();
  closeSheet();
  renderAll();
  toast("投稿を受け付けました。教員の承認後に公開されます。");
}

// ===== 選挙 =====
function issueText(id) {
  const p = findPost(id);
  return p ? p.text : "（削除された課題）";
}

function renderElection() {
  const el = state.election;
  const badge = $("#election-period");
  badge.textContent = el.open ? el.period : "投票は締め切られました";
  badge.classList.toggle("closed", !el.open);

  $("#candidate-list").innerHTML = state.candidates
    .map(
      (c, ci) => `
    <div class="card">
      <div class="candidate-name">${escapeHtml(c.name)}</div>
      <ul class="manifesto">
        ${c.manifesto
          .map(
            (m, mi) => `
          <li>
            <div class="issue">課題：${escapeHtml(issueText(m.issueId))}</div>
            <div><b>私はこのように解決します：</b>${escapeHtml(m.text)}</div>
            ${m.questions.length ? `<ul class="questions">${m.questions.map((q) => `<li>匿名の質問：${escapeHtml(q)}</li>`).join("")}</ul>` : ""}
            <form class="question-form" data-c="${ci}" data-m="${mi}">
              <input type="text" placeholder="匿名で質問する">
              <button type="submit" class="small-btn">送信</button>
            </form>
          </li>`
          )
          .join("")}
      </ul>
    </div>`
    )
    .join("");

  const issues = state.posts.filter((p) => p.status === "public").sort((a, b) => b.likes - a.likes);
  $("#manifesto-issue").innerHTML = issues
    .map((p) => `<option value="${p.id}">［共感 ${p.likes}］${escapeHtml(p.text.slice(0, 24))}…</option>`)
    .join("");

  $("#vote-options").innerHTML =
    state.candidates.map((c, i) => `<label><input type="radio" name="vote" value="${i}"> ${escapeHtml(c.name)}</label>`).join("") +
    `<label><input type="radio" name="vote" value="blank"> 白票（該当者なし）</label>`;

  const voted = el.voters.includes(currentId());
  const done = $("#vote-done");
  $("#vote-form").hidden = voted || !el.open;
  done.hidden = !voted && el.open;
  done.textContent = voted ? "投票済みです。ご協力ありがとうございました。" : "投票期間は終了しました。";

  $("#close-election").disabled = !el.open;
  renderResult();
}

function submitVote(e) {
  e.preventDefault();
  const choice = document.querySelector('input[name="vote"]:checked');
  if (!choice) {
    toast("投票先を選んでください。");
    return;
  }
  const voter = currentId();
  if (state.election.voters.includes(voter)) return;
  // 投票権の使用履歴（voters）と投票内容（ballots）は紐づけずに別々に保存する
  state.election.voters.push(voter);
  state.election.ballots.push(choice.value);
  renderAll();
  toast("投票しました。");
}

function renderResult() {
  const el = state.election;
  if (el.open) {
    $("#result").innerHTML = `<p class="hint">投票期間の終了後に公開されます。落選者の得票数・全候補者の得票数は公開しません。</p>`;
    return;
  }
  const counts = { ...el.presetBallots };
  el.ballots.forEach((b) => (counts[b] = (counts[b] || 0) + 1));
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const valid = total - (counts.blank || 0);
  let winner = 0;
  state.candidates.forEach((_, i) => {
    if ((counts[i] || 0) > (counts[winner] || 0)) winner = i;
  });
  const turnout = ((total / el.totalStudents) * 100).toFixed(1);
  const share = valid ? (((counts[winner] || 0) / valid) * 100).toFixed(1) : "0.0";

  $("#result").innerHTML = `
    <p>当選：<b>${escapeHtml(state.candidates[winner].name)}</b></p>
    <div class="result-box">
      <div class="result-item"><strong>${turnout}%</strong>投票率<br>（全校生徒のうち）</div>
      <div class="result-item"><strong>${share}%</strong>当選者の得票率<br>（有効投票のうち）</div>
    </div>
    <p class="hint">落選者の得票数と、全候補者の具体的な得票数は公開しません。投票率と得票率のどちらを公開するかは選挙規定で確定させる予定のため、モックでは両方を表示しています。</p>`;
}

// ===== 公約トラッカー =====
function renderTracker() {
  const canEdit = state.role === "officer";
  $("#tracker-list").innerHTML = state.tracker
    .map(
      (t, i) => `
    <li class="item">
      <div><b>${escapeHtml(t.title)}</b></div>
      <div class="item-meta"><span class="status s${t.status}">${STATUS_LABELS[t.status]}</span> 担当：${escapeHtml(t.owner)}</div>
      <div class="progress"><span style="width:${(t.status / 3) * 100}%"></span></div>
      ${
        canEdit
          ? `<select data-track="${i}">${STATUS_LABELS.map((l, s) => `<option value="${s}" ${s === t.status ? "selected" : ""}>${l}</option>`).join("")}</select>`
          : ""
      }
    </li>`
    )
    .join("");
}

// ===== デジタル憲章 =====
function renderRules() {
  $("#rule-list").innerHTML = state.rules.map((r) => `<li>${escapeHtml(r)}</li>`).join("");
  $("#rule-history").innerHTML = state.history.map((h) => `<li>${h.date}<br>${escapeHtml(h.text)}</li>`).join("");
}

// ===== テックアラート =====
function renderAlerts() {
  $("#alert-list").innerHTML = state.alerts
    .map((a) => `<li class="alert"><div class="alert-date">${a.date}</div><b>${escapeHtml(a.title)}</b><p>${escapeHtml(a.body)}</p></li>`)
    .join("");
}

// ===== モデレーション =====
function renderAdmin() {
  const pending = state.posts.filter((p) => p.status === "pending");
  $("#pending-list").innerHTML =
    pending
      .map(
        (p) => `
      <li class="item">
        <div class="item-meta"><span class="tag">${escapeHtml(p.category)}</span>${p.tempId}・${p.date}</div>
        <p>${escapeHtml(p.text)}</p>
        <div class="item-foot">
          <button class="small-btn" data-reject="${p.id}">非公開にする</button>
          <button class="small-btn ok" data-approve="${p.id}">公開する</button>
        </div>
      </li>`
      )
      .join("") || `<li class="item"><p class="hint">承認待ちの投稿はありません。</p></li>`;

  $("#lookup-post").innerHTML = state.posts
    .filter((p) => p.status !== "rejected")
    .map((p) => `<option value="${p.id}">#${p.id} ${p.tempId}：${escapeHtml(p.text.slice(0, 18))}…</option>`)
    .join("");

  $("#audit-log").innerHTML = state.audit.map((a) => `<li>${a.date}<br>${escapeHtml(a.text)}</li>`).join("");
}

function submitLookup(e) {
  e.preventDefault();
  const result = $("#lookup-result");
  const reason = $("#lookup-reason").value.trim();
  const principal = $("#approve-principal").checked;
  const board = $("#approve-board").checked;
  const post = findPost(Number($("#lookup-post").value));
  if (!post) return;

  if (!reason || !principal || !board) {
    result.textContent = "照会できません：照会理由の入力と、校長・教育委員会の両方の承認が必要です。";
    result.hidden = false;
    state.audit.unshift({ date: nowStamp(), text: `${currentId()} が投稿 #${post.id} の照会を試みたが、承認不足で拒否` });
    renderAdmin();
    return;
  }

  result.textContent = `投稿 #${post.id}（${post.tempId}）の投稿者ID：${post.author}`;
  result.hidden = false;
  state.audit.unshift({ date: nowStamp(), text: `${currentId()} が投稿 #${post.id} の投稿者IDを照会（理由：${reason}／承認：校長・教育委員会）` });
  $("#lookup-form").reset();
  renderAdmin();
}

// ===== 全体描画 =====
function renderAll() {
  renderHome();
  renderPosts();
  renderElection();
  renderTracker();
  renderRules();
  renderAlerts();
  renderAdmin();
}

// ===== イベント =====
$("#tab-bar").addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (tab) switchView(tab.dataset.view);
});

document.addEventListener("click", (e) => {
  const go = e.target.closest("[data-go]");
  if (go) switchView(go.dataset.go);
});

$("#back-btn").addEventListener("click", () => switchView($(`#view-${state.view}`).dataset.parent || "home"));
$("#avatar-btn").addEventListener("click", () => switchView("menu"));

$("#role-select").addEventListener("change", (e) => {
  state.role = e.target.value;
  applyRole();
  toast(`${ROLES[state.role].label}としてログインしました`);
});

$("#box-chips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  state.boxFilter = chip.dataset.cat;
  renderPosts();
});

$("#box-sort").addEventListener("click", (e) => {
  const seg = e.target.closest(".seg");
  if (!seg) return;
  state.boxSort = seg.dataset.sort;
  renderPosts();
});

$("#open-post").addEventListener("click", openSheet);
$("#close-post").addEventListener("click", closeSheet);
$("#sheet-backdrop").addEventListener("click", closeSheet);

$("#post-form").addEventListener("input", updatePostButton);
$("#post-form").addEventListener("submit", submitPost);

$("#post-list").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-like]");
  if (!btn) return;
  const p = findPost(Number(btn.dataset.like));
  p.liked = !p.liked;
  p.likes += p.liked ? 1 : -1;
  renderAll();
});

$("#candidate-list").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target.closest(".question-form");
  const input = form.querySelector("input");
  const text = input.value.trim();
  if (!text) return;
  const problem = checkContent(text);
  if (problem) {
    toast(`送信できません：${problem}`);
    return;
  }
  state.candidates[form.dataset.c].manifesto[form.dataset.m].questions.push(text);
  renderElection();
  toast("質問を送信しました。");
});

$("#manifesto-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $("#manifesto-text").value.trim();
  const issueId = Number($("#manifesto-issue").value);
  if (!text || !issueId) return;
  // モックでは、立候補者ロールを候補者一覧の1人目として扱う
  state.candidates[0].manifesto.push({ issueId, text, questions: [] });
  $("#manifesto-form").reset();
  renderElection();
  toast("マニフェストに追加しました。");
});

$("#vote-form").addEventListener("submit", submitVote);

$("#close-election").addEventListener("click", () => {
  state.election.open = false;
  renderAll();
  toast("投票を締め切り、結果を公開しました。");
});

$("#tracker-list").addEventListener("change", (e) => {
  const sel = e.target.closest("[data-track]");
  if (!sel) return;
  const item = state.tracker[sel.dataset.track];
  item.status = Number(sel.value);
  if (item.status === 3) state.history.unshift({ date: today(), text: `「${item.title}」のルール改定が完了` });
  renderAll();
  toast("進捗を更新しました。");
});

$("#alert-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = $("#alert-title").value.trim();
  const body = $("#alert-body").value.trim();
  if (!title || !body) return;
  state.alerts.unshift({ date: today(), title, body });
  $("#alert-form").reset();
  renderAll();
  toast("アラートを配信しました。");
});

$("#pending-list").addEventListener("click", (e) => {
  const approve = e.target.closest("[data-approve]");
  const reject = e.target.closest("[data-reject]");
  if (approve) findPost(Number(approve.dataset.approve)).status = "public";
  if (reject) findPost(Number(reject.dataset.reject)).status = "rejected";
  if (approve || reject) {
    renderAll();
    toast(approve ? "投稿を公開しました。" : "投稿を非公開にしました。");
  }
});

$("#lookup-form").addEventListener("submit", submitLookup);

applyRole();
