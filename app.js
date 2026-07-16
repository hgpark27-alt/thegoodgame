// ================================================================
//  ⚽ 스코어 예측 — 승부예측 상금풀 앱
// ================================================================
const DB_PATH   = 'soccerPool';
const ENTRY_FEE = 5000;

let db;
let match = { teamA: 'A팀', teamB: 'B팀', status: 'open', finalScoreA: null, finalScoreB: null };
let entries = {};   // { id: { name, scoreA, scoreB, createdAt } }

let pickA = 0, pickB = 0;       // 참가 폼 선택값
let settleA = 0, settleB = 0;   // 결과입력 폼 선택값
let editingTeam = null;         // 'A' | 'B' | null — 팀명 편집 중 원격 갱신 방지

// ── Init ─────────────────────────────────────────────────────────
function init() {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();

  db.ref(`${DB_PATH}/match`).on('value', snap => {
    const val = snap.val();
    if (!val) { db.ref(`${DB_PATH}/match`).set(match); return; }
    match = val;
    renderAll();
  });

  db.ref(`${DB_PATH}/entries`).on('value', snap => {
    entries = snap.val() || {};
    renderAll();
  });

  setupTeamNameEditing();

  document.getElementById('name-input')
    .addEventListener('keydown', e => { if (e.key === 'Enter') joinPool(); });

  updatePickerDisplay();
  updateSettleDisplay();
}

function setupTeamNameEditing() {
  ['A', 'B'].forEach(team => {
    const el = document.getElementById(`team-${team.toLowerCase()}-name`);
    el.addEventListener('focus', () => { editingTeam = team; });
    el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); el.blur(); } });
    el.addEventListener('blur', () => {
      editingTeam = null;
      const val = el.textContent.trim().slice(0, 10) || (team === 'A' ? 'A팀' : 'B팀');
      el.textContent = val;
      db.ref(`${DB_PATH}/match/team${team}`).set(val);
    });
  });
}

// ── Render ───────────────────────────────────────────────────────
function renderAll() {
  renderStatusBanner();
  renderScoreboardNames();
  renderPickerLabels();
  renderPoolInfo();
  updateOddsHint();
  renderOddsList();
  renderEntryList();
  updateJoinFormState();
}

function renderStatusBanner() {
  const el = document.getElementById('status-banner');
  if (match.status === 'settled') {
    el.className = 'status-banner settled';
    el.textContent = `🏁 경기 종료 — 최종 스코어 ${match.teamA} ${match.finalScoreA} : ${match.finalScoreB} ${match.teamB}`;
  } else {
    el.className = 'status-banner';
    el.textContent = '⚽ 예측 접수중';
  }
}

function renderScoreboardNames() {
  if (editingTeam !== 'A') document.getElementById('team-a-name').textContent = match.teamA;
  if (editingTeam !== 'B') document.getElementById('team-b-name').textContent = match.teamB;
}

function renderPickerLabels() {
  document.getElementById('pick-a-label').textContent = match.teamA;
  document.getElementById('pick-b-label').textContent = match.teamB;
  document.getElementById('settle-a-label').textContent = match.teamA;
  document.getElementById('settle-b-label').textContent = match.teamB;
}

function renderPoolInfo() {
  const list = Object.values(entries);
  document.getElementById('pool-count').textContent = `${list.length}명`;
  document.getElementById('pool-total').textContent = `₩${(list.length * ENTRY_FEE).toLocaleString()}`;
}

// ── Score picker (join form) ────────────────────────────────────
function step(team, delta) {
  if (team === 'A') pickA = Math.min(20, Math.max(0, pickA + delta));
  else pickB = Math.min(20, Math.max(0, pickB + delta));
  updatePickerDisplay();
  updateOddsHint();
}
function updatePickerDisplay() {
  document.getElementById('pick-a-val').textContent = pickA;
  document.getElementById('pick-b-val').textContent = pickB;
}

function updateOddsHint() {
  const hint = document.getElementById('odds-hint');
  const list = Object.values(entries);
  const sameCount = list.filter(e => e.scoreA === pickA && e.scoreB === pickB).length;
  const projectedPool = (list.length + 1) * ENTRY_FEE;
  const projectedWinners = sameCount + 1;
  const payout = Math.floor(projectedPool / projectedWinners);
  hint.textContent = `이 스코어를 고른 사람 ${sameCount}명 → 지금 참가 시 예상 배당 약 ₩${payout.toLocaleString()}`;
}

function updateJoinFormState() {
  const btn = document.getElementById('join-btn');
  const closed = match.status !== 'open';
  btn.disabled = closed;
  btn.textContent = closed ? '이미 종료된 경기입니다' : `참가하기 (₩${ENTRY_FEE.toLocaleString()})`;
}

// ── Join ─────────────────────────────────────────────────────────
function joinPool() {
  if (match.status !== 'open') { alert('이미 종료된 경기입니다.'); return; }
  const inp  = document.getElementById('name-input');
  const name = inp.value.trim();
  if (!name) { inp.focus(); return; }

  const id = 'e_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  db.ref(`${DB_PATH}/entries/${id}`).set({
    name, scoreA: pickA, scoreB: pickB, createdAt: Date.now()
  });
  inp.value = '';
}

// ── Odds list ────────────────────────────────────────────────────
function renderOddsList() {
  const el = document.getElementById('odds-list');
  const list = Object.values(entries);

  if (!list.length) {
    el.innerHTML = '<div class="empty-msg">아직 참가자가 없어요.</div>';
    return;
  }

  const pool = list.length * ENTRY_FEE;
  const groups = {};
  list.forEach(e => {
    const key = `${e.scoreA}:${e.scoreB}`;
    groups[key] = (groups[key] || 0) + 1;
  });

  const rows = Object.entries(groups).sort((a, b) => b[1] - a[1]);

  el.innerHTML = rows.map(([score, count]) => {
    const [sa, sb] = score.split(':');
    const payout = Math.floor(pool / count);
    return `
      <div class="odds-item">
        <div class="odds-score">${esc(match.teamA)} ${sa} : ${sb} ${esc(match.teamB)}</div>
        <div class="odds-meta">
          <div class="odds-count">${count}명 선택</div>
          <div class="odds-payout">1인당 ₩${payout.toLocaleString()}</div>
        </div>
      </div>`;
  }).join('');
}

// ── Entry list ───────────────────────────────────────────────────
function renderEntryList() {
  const el = document.getElementById('entry-list');
  const list = Object.entries(entries).sort(([,a],[,b]) => (a.createdAt||0) - (b.createdAt||0));

  if (!list.length) {
    el.innerHTML = '<div class="empty-msg">아직 참가자가 없어요.<br>스코어를 예측하고 참가해보세요!</div>';
    return;
  }

  const settled = match.status === 'settled';
  const pool = list.length * ENTRY_FEE;
  const winnerIds = settled
    ? list.filter(([,e]) => e.scoreA === match.finalScoreA && e.scoreB === match.finalScoreB).map(([id]) => id)
    : [];
  const payout = winnerIds.length ? Math.floor(pool / winnerIds.length) : 0;

  el.innerHTML = list.map(([id, e]) => {
    let cls = 'entry-item';
    let payoutHtml = '';
    if (settled) {
      if (winnerIds.includes(id)) {
        cls += ' winner';
        payoutHtml = `<div class="entry-payout">🏆 ₩${payout.toLocaleString()}</div>`;
      } else {
        cls += ' loser';
      }
    }
    return `
      <div class="${cls}">
        <div class="entry-score">${esc(match.teamA)} ${e.scoreA} : ${e.scoreB} ${esc(match.teamB)}</div>
        <div class="entry-main">
          <div class="entry-name">${esc(e.name)}</div>
          ${payoutHtml}
        </div>
      </div>`;
  }).join('');

  if (settled && !winnerIds.length && list.length) {
    el.innerHTML += '<div class="empty-msg">😢 적중자가 없습니다. 상금은 이월하거나 재정산이 필요해요.</div>';
  }
}

// ── Settle (경기결과 입력) ────────────────────────────────────────
function toggleSettlePanel() {
  const panel = document.getElementById('settle-panel');
  panel.classList.toggle('hidden');
}

function stepSettle(team, delta) {
  if (team === 'A') settleA = Math.min(20, Math.max(0, settleA + delta));
  else settleB = Math.min(20, Math.max(0, settleB + delta));
  updateSettleDisplay();
}
function updateSettleDisplay() {
  document.getElementById('settle-a-val').textContent = settleA;
  document.getElementById('settle-b-val').textContent = settleB;
}

function settleMatch() {
  if (!confirm(`최종 스코어를 ${settleA} : ${settleB} 로 확정할까요?`)) return;
  db.ref(`${DB_PATH}/match`).update({
    status: 'settled', finalScoreA: settleA, finalScoreB: settleB
  });
  document.getElementById('settle-panel').classList.add('hidden');
}

// ── Utils ────────────────────────────────────────────────────────
function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

init();
