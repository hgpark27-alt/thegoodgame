// ================================================================
//  Credit Generator Battle  —  Economy v2
// ================================================================

const SUFFIXES = ['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc','Ud','Dd','Td'];

// ── Helpers ────────────────────────────────────────────────────────
function formatNum(n) {
  if (!isFinite(n) || isNaN(n)) return '0';
  if (n < 1000) return Math.floor(n).toString();
  let v = n, i = 0;
  while (v >= 1000 && i < SUFFIXES.length - 1) { v /= 1000; i++; }
  if (v >= 100) return v.toFixed(0) + SUFFIXES[i];
  if (v >= 10)  return v.toFixed(1) + SUFFIXES[i];
  return v.toFixed(2) + SUFFIXES[i];
}

function calcBase(genLv, amLv) {
  return Math.pow(2, (genLv || 1) - 1) * (1 + (amLv || 0) * 0.25);
}
function calcFinal(genLv, amLv, odActive) {
  return calcBase(genLv, amLv) * (odActive ? 10 : 1);
}
function genCost(bp)  { return Math.max(1, Math.floor(bp * 600));  }
function amCost(bp)   { return Math.max(1, Math.floor(bp * 300));  }
function odCost(bp)   { return Math.max(1, Math.floor(bp * 1200)); }

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g,
    c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]);
}

function makeDefault() {
  return {
    active: false, playerId: '', playerName: '',
    credit: 0, genLevel: 1, autoMinerLevel: 0,
    overDriveUnlocked: false,
    overDriveState: 'inactive',
    overDriveExpiresAt: 0,
    baseProduction: 1,
  };
}

// ── Save / Load Codec ──────────────────────────────────────────────
function encodeState(genLv, amLv, odUnlocked, credit) {
  const raw = [genLv, amLv, odUnlocked ? 1 : 0, Math.floor(credit)].join(',');
  return btoa(raw);
}

function decodeState(code) {
  try {
    const raw   = atob(code.trim());
    const parts = raw.split(',');
    if (parts.length !== 4) return null;
    const genLv     = parseInt(parts[0]);
    const amLv      = parseInt(parts[1]);
    const odUnlocked = parts[2] === '1';
    const credit    = parseFloat(parts[3]);
    if ([genLv, amLv, credit].some(isNaN)) return null;
    if (genLv < 1 || amLv < 0 || credit < 0) return null;
    return { genLv, amLv, odUnlocked, credit };
  } catch { return null; }
}

// ── State ──────────────────────────────────────────────────────────
let db;

const myId = (() => {
  let id = sessionStorage.getItem('cgb_pid');
  if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem('cgb_pid', id); }
  return id;
})();

let mySlot        = null;
let localCredit   = 0;
let localGenLv    = 1;
let localAMLv     = 0;
let localODUnlock = false;
let localODState  = 'inactive';
let localODExp    = 0;
let prevODState   = 'inactive';

let localGenCost  = 600;
let localAMCost   = 300;
let localODCost   = 1200;
let costsReady    = false;

let slotCache    = [makeDefault(), makeDefault()];
let pendingSlot  = null;
let loadPendingSlot = null;
let tickId       = null;
let syncId       = null;

// ── Firebase ───────────────────────────────────────────────────────
function initFirebase() {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();

  db.ref('game/slots').on('value', snap => {
    const raw = snap.val() || {};
    for (let i = 0; i < 2; i++) {
      slotCache[i] = Object.assign(makeDefault(), raw[i] || {});
    }
    renderPanel(0);
    renderPanel(1);
  });
}

async function joinSlot(si, nickname, savedState = null) {
  try {
    const snap = await db.ref(`game/slots/${si}`).once('value');
    if (snap.val()?.active) { alert('이 슬롯은 방금 참여됐습니다.'); renderPanel(0); renderPanel(1); return; }

    const allSnap = await db.ref('game/slots').once('value');
    const allRaw  = allSnap.val() || {};
    if (!allRaw[0]?.active && !allRaw[1]?.active) {
      await db.ref('game').set({ slots: { 0: makeDefault(), 1: makeDefault() } });
    }

    // 로컬 상태를 Firebase write 전에 먼저 세팅 (리스너 발화 타이밍 문제 방지)
    mySlot = si;
    localCredit   = savedState ? savedState.credit  : 0;
    localGenLv    = savedState ? savedState.genLv   : 1;
    localAMLv     = savedState ? savedState.amLv    : 0;
    localODUnlock = savedState ? savedState.odUnlocked : false;
    localODState  = 'inactive'; localODExp = 0;
    prevODState   = 'inactive'; costsReady = false;

    const initial = Object.assign(makeDefault(), {
      active: true, playerId: myId, playerName: nickname.slice(0, 12),
      credit:           localCredit,
      genLevel:         localGenLv,
      autoMinerLevel:   localAMLv,
      overDriveUnlocked: localODUnlock,
      baseProduction:   calcBase(localGenLv, localAMLv),
    });

    const slotRef = db.ref(`game/slots/${si}`);
    await slotRef.set(initial);
    slotRef.onDisconnect().set(makeDefault());

    startTick(); startSync();

    setTimeout(() => {
      const bp = calcBase(localGenLv, localAMLv);
      localGenCost = genCost(bp); localAMCost = amCost(bp); localODCost = odCost(bp);
      costsReady = true;
      refreshMyPanel();
    }, 2000);
  } catch (e) {
    mySlot = null;
    alert('참여 실패: ' + e.message + '\n\nFirebase Database 규칙을 확인하세요.');
  }
}

function leaveSlot() {
  if (mySlot === null) return;
  const si = mySlot;
  db.ref(`game/slots/${si}`).onDisconnect().cancel();
  db.ref(`game/slots/${si}`).set(makeDefault());
  stopTick(); stopSync();
  mySlot = null; localCredit = 0; localGenLv = 1; localAMLv = 0;
  localODUnlock = false; localODState = 'inactive'; localODExp = 0;
  costsReady = false;
}

function syncToFirebase() {
  if (mySlot === null) return;
  db.ref(`game/slots/${mySlot}`).update({
    credit: Math.floor(localCredit), genLevel: localGenLv, autoMinerLevel: localAMLv,
    overDriveUnlocked: localODUnlock, overDriveState: localODState,
    overDriveExpiresAt: localODExp, baseProduction: calcBase(localGenLv, localAMLv),
  });
}

// ── Tick ───────────────────────────────────────────────────────────
function startTick() { stopTick(); tickId = setInterval(tick, 100); }
function stopTick()  { clearInterval(tickId); tickId = null; }
function startSync() { stopSync(); syncId = setInterval(syncToFirebase, 1000); }
function stopSync()  { clearInterval(syncId); syncId = null; }

function tick() {
  if (mySlot === null) return;
  const now = Date.now();
  if (localODState === 'active' && now >= localODExp) {
    localODState = 'cooldown'; localODExp = now + 180000; syncToFirebase();
  } else if (localODState === 'cooldown' && now >= localODExp) {
    localODState = 'inactive'; localODExp = 0; syncToFirebase();
  }
  localCredit += calcFinal(localGenLv, localAMLv, localODState === 'active') / 10;
  updateMyStats();
  updateODBtn();
}

// ── Actions ────────────────────────────────────────────────────────
function upgradeGenerator() {
  if (!costsReady || localCredit < localGenCost) return;
  localCredit -= localGenCost; localGenLv++;
  recalcCosts(); syncToFirebase(); refreshMyPanel();
}
function upgradeAutoMiner() {
  if (!costsReady || localCredit < localAMCost) return;
  localCredit -= localAMCost; localAMLv++;
  recalcCosts(); syncToFirebase(); refreshMyPanel();
}
function unlockOverDrive() {
  if (!costsReady || localODUnlock || localCredit < localODCost) return;
  localCredit -= localODCost; localODUnlock = true;
  recalcCosts(); syncToFirebase(); refreshMyPanel();
}
function activateOverDrive() {
  if (!localODUnlock || localODState !== 'inactive') return;
  localODState = 'active'; localODExp = Date.now() + 15000;
  prevODState = 'active'; syncToFirebase(); refreshMyPanel();
}
function recalcCosts() {
  const bp = calcBase(localGenLv, localAMLv);
  localGenCost = genCost(bp); localAMCost = amCost(bp); localODCost = odCost(bp);
}

// ── Save / Load ────────────────────────────────────────────────────
function saveGame() {
  if (mySlot === null) return;
  const code = encodeState(localGenLv, localAMLv, localODUnlock, localCredit);
  document.getElementById('save-code-text').textContent = code;
  document.getElementById('copy-confirm').classList.add('hidden');
  document.getElementById('save-modal').classList.remove('hidden');
}

function copySaveCode() {
  const code = document.getElementById('save-code-text').textContent;
  navigator.clipboard.writeText(code).then(() => {
    document.getElementById('copy-confirm').classList.remove('hidden');
  }).catch(() => {
    // fallback: select text
    const el = document.getElementById('save-code-text');
    const range = document.createRange();
    range.selectNodeContents(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  });
}

function closeSaveModal() {
  document.getElementById('save-modal').classList.add('hidden');
}

function onLoadClick(si) {
  if (mySlot !== null || slotCache[si]?.active) return;
  loadPendingSlot = si;
  document.getElementById('load-slot-num').textContent = si + 1;
  document.getElementById('load-nickname').value = '';
  document.getElementById('load-code-input').value = '';
  document.getElementById('load-error').classList.add('hidden');
  document.getElementById('load-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('load-nickname').focus(), 50);
}

function closeLoadModal() {
  document.getElementById('load-modal').classList.add('hidden');
  loadPendingSlot = null;
}

function confirmLoad() {
  const nick = document.getElementById('load-nickname').value.trim();
  const code = document.getElementById('load-code-input').value.trim();

  if (!nick) { document.getElementById('load-nickname').focus(); return; }

  const state = decodeState(code);
  if (!state) {
    document.getElementById('load-error').classList.remove('hidden');
    document.getElementById('load-code-input').focus();
    return;
  }

  const si = loadPendingSlot;
  closeLoadModal();
  joinSlot(si, nick, state);
}

// ── Render ─────────────────────────────────────────────────────────
function renderPanel(si) {
  const panel = document.getElementById(`panel-${si}`);
  if (!panel) return;
  const data = slotCache[si];
  const isMe = mySlot === si && data.playerId === myId;

  if (!data.active) {
    const newState = `empty-${mySlot}`;
    if (panel.dataset.state !== newState) {
      panel.dataset.state = newState;
      renderEmpty(panel, si);
    }
    return;
  }
  if (panel.dataset.state === `active-${data.playerId}`) {
    if (isMe) updateMyStats(); else updateOppStats(si, data);
    return;
  }
  panel.dataset.state = `active-${data.playerId}`;
  renderActive(panel, si, data, isMe);
}

function renderEmpty(panel, si) {
  panel.innerHTML = `
    <div class="slot-empty">
      <div class="slot-label">SLOT ${si + 1}</div>
      <div class="empty-text">Empty</div>
      ${mySlot === null ? `
      <div class="join-row">
        <button class="btn-join" onclick="onJoinClick(${si})">참여하기</button>
        <button class="btn-load-slot" onclick="onLoadClick(${si})">불러오기</button>
      </div>` : ''}
    </div>`;
}

function renderActive(panel, si, data, isMe) {
  const credit = isMe ? localCredit : data.credit;
  const bp     = isMe ? calcBase(localGenLv, localAMLv) : (data.baseProduction || 1);
  const genLv  = isMe ? localGenLv  : (data.genLevel || 1);
  const amLv   = isMe ? localAMLv   : (data.autoMinerLevel || 0);
  const odUnlk = isMe ? localODUnlock : !!data.overDriveUnlocked;
  const odSt   = isMe ? localODState  : (data.overDriveState || 'inactive');

  panel.innerHTML = `
    <div class="slot-active${isMe ? ' is-me' : ''}">
      <div class="slot-header">
        <span class="player-name">${esc(data.playerName)}</span>
      </div>
      <div class="credit-block">
        <div class="credit-val" id="credit-${si}">Credit: ${formatNum(credit)}</div>
        <div class="cps-val" id="cps-${si}">Production: ${formatNum(bp)}/sec</div>
      </div>
      <div class="installed-wrap">
        <div class="section-label">Installed Items</div>
        <div id="installed-${si}">${buildInstalledHTML(genLv, amLv, odUnlk, odSt, bp)}</div>
      </div>
      ${isMe ? `
      <div class="shop-wrap">
        <div class="section-label">Shop</div>
        <div id="shop-${si}">${buildShopHTML()}</div>
        <div class="bottom-row">
          <button class="btn-save-game" onclick="saveGame()">저장</button>
          <button class="btn-leave-full" onclick="leaveSlot()">나가기</button>
        </div>
      </div>` : ''}
    </div>`;
}

// ── HTML Builders ──────────────────────────────────────────────────
function buildInstalledHTML(genLv, amLv, odUnlk, odState, bp) {
  let odLine = '';
  if (odUnlk) {
    if (odState === 'active')        odLine = `<div class="inst-item">Over Drive: ACTIVE ⚡</div>`;
    else if (odState === 'cooldown') odLine = `<div class="inst-dim">Over Drive: Cooldown</div>`;
    else                             odLine = `<div class="inst-dim">Over Drive: Ready</div>`;
  }
  return `
    <div class="inst-item">Generator Lv${genLv}</div>
    ${amLv > 0 ? `<div class="inst-item">Auto Miner Lv${amLv}</div>` : ''}
    ${odLine}
    <div class="inst-prod">Current Production: <span>${formatNum(bp)}/sec</span></div>`;
}

function buildShopHTML() {
  // Over Drive (1st)
  let odItem;
  if (!localODUnlock) {
    const can  = costsReady && localCredit >= localODCost;
    const cStr = costsReady ? formatNum(localODCost) : '...';
    odItem = `<button class="shop-btn${can ? '' : ' cant-afford'}" data-shop="od"
      onclick="unlockOverDrive()" ${can ? '' : 'disabled'}>
      <span class="sn">Over Drive</span><span class="sl">Unlock</span>
      <span class="sd">× 10 production · 15s · CD 3min</span>
      <span class="sc">Cost: ${cStr}</span>
    </button>`;
  } else if (localODState === 'active') {
    const rem = Math.max(0, Math.ceil((localODExp - Date.now()) / 1000));
    odItem = `<div class="shop-btn od-active-row">
      <span class="sn">Over Drive</span><span class="sl tag-active">ACTIVE ⚡</span>
      <span class="sd">× 10 Production</span>
      <span class="sc" id="od-shop-timer">${rem}s</span>
    </div>`;
  } else if (localODState === 'cooldown') {
    const rem = Math.max(0, Math.ceil((localODExp - Date.now()) / 1000));
    odItem = `<div class="shop-btn od-cd-row">
      <span class="sn">Over Drive</span><span class="sl tag-cd">COOLDOWN</span>
      <span class="sd">× 10 Production · 15s</span>
      <span class="sc" id="od-shop-timer">${rem}s</span>
    </div>`;
  } else {
    odItem = `<button class="shop-btn od-ready-row" onclick="activateOverDrive()">
      <span class="sn">Over Drive</span><span class="sl tag-ready">READY</span>
      <span class="sd">× 10 Production for 15s</span>
      <span class="sc">▶ Activate</span>
    </button>`;
  }

  // Auto Miner (2nd)
  const aCan  = costsReady && localCredit >= localAMCost;
  const aStr  = costsReady ? formatNum(localAMCost) : '...';
  const cur   = (1 + localAMLv * 0.25).toFixed(2);
  const nxt   = (1 + (localAMLv + 1) * 0.25).toFixed(2);
  const amItem = `<button class="shop-btn${aCan ? '' : ' cant-afford'}" data-shop="am"
    onclick="upgradeAutoMiner()" ${aCan ? '' : 'disabled'}>
    <span class="sn">Auto Miner</span><span class="sl">Lv${localAMLv} → ${localAMLv + 1}</span>
    <span class="sd">×${cur} → ×${nxt}</span>
    <span class="sc">Cost: ${aStr}</span>
  </button>`;

  // Generator (3rd)
  const gCan   = costsReady && localCredit >= localGenCost;
  const gStr   = costsReady ? formatNum(localGenCost) : '...';
  const nextBp = formatNum(calcBase(localGenLv + 1, localAMLv));
  const genItem = `<button class="shop-btn${gCan ? '' : ' cant-afford'}" data-shop="gen"
    onclick="upgradeGenerator()" ${gCan ? '' : 'disabled'}>
    <span class="sn">Generator</span><span class="sl">Lv${localGenLv} → ${localGenLv + 1}</span>
    <span class="sd">→ ${nextBp}/sec base</span>
    <span class="sc">Cost: ${gStr}</span>
  </button>`;

  return odItem + amItem + genItem;
}

// ── Live Updates ───────────────────────────────────────────────────
function updateMyStats() {
  if (mySlot === null) return;
  const si = mySlot;
  const odActive = localODState === 'active';
  const bp = calcBase(localGenLv, localAMLv);
  const cEl = document.getElementById(`credit-${si}`);
  const pEl = document.getElementById(`cps-${si}`);
  if (cEl) cEl.textContent = `Credit: ${formatNum(localCredit)}`;
  if (pEl) pEl.textContent = `Production: ${formatNum(odActive ? calcFinal(localGenLv, localAMLv, true) : bp)}/sec${odActive ? ' ⚡' : ''}`;
  refreshAfford();
}

function updateOppStats(si, data) {
  const bp = data.baseProduction || calcBase(data.genLevel || 1, data.autoMinerLevel || 0);
  const odActive = data.overDriveState === 'active';
  const cEl = document.getElementById(`credit-${si}`);
  const pEl = document.getElementById(`cps-${si}`);
  if (cEl) cEl.textContent = `Credit: ${formatNum(data.credit)}`;
  if (pEl) pEl.textContent = `Production: ${formatNum(bp)}/sec${odActive ? ' ⚡' : ''}`;
  const instEl = document.getElementById(`installed-${si}`);
  if (instEl) instEl.innerHTML = buildInstalledHTML(
    data.genLevel || 1, data.autoMinerLevel || 0,
    !!data.overDriveUnlocked, data.overDriveState || 'inactive', bp);
}

function updateODBtn() {
  if (mySlot === null) return;
  if (localODState !== prevODState) {
    prevODState = localODState;
    const shopEl = document.getElementById(`shop-${mySlot}`);
    if (shopEl) shopEl.innerHTML = buildShopHTML();
    return;
  }
  if (localODState === 'active' || localODState === 'cooldown') {
    const timerEl = document.getElementById('od-shop-timer');
    if (timerEl) timerEl.textContent = Math.max(0, Math.ceil((localODExp - Date.now()) / 1000)) + 's';
  }
}

function refreshMyPanel() {
  if (mySlot === null) return;
  const si = mySlot;
  const bp = calcBase(localGenLv, localAMLv);
  const instEl = document.getElementById(`installed-${si}`);
  const shopEl = document.getElementById(`shop-${si}`);
  if (instEl) instEl.innerHTML = buildInstalledHTML(localGenLv, localAMLv, localODUnlock, localODState, bp);
  if (shopEl) shopEl.innerHTML = buildShopHTML();
  prevODState = localODState;
  updateMyStats();
}

function refreshAfford() {
  if (!costsReady || mySlot === null) return;
  const shopEl = document.getElementById(`shop-${mySlot}`);
  if (!shopEl) return;
  const upd = (key, can) => {
    const btn = shopEl.querySelector(`[data-shop="${key}"]`);
    if (!btn) return;
    btn.disabled = !can;
    btn.classList.toggle('cant-afford', !can);
  };
  upd('gen', localCredit >= localGenCost);
  upd('am',  localCredit >= localAMCost);
  upd('od',  !localODUnlock && localCredit >= localODCost);
}

// ── Join Modal ─────────────────────────────────────────────────────
function onJoinClick(si) {
  if (mySlot !== null || slotCache[si]?.active) return;
  pendingSlot = si;
  document.getElementById('modal-slot-num').textContent = si + 1;
  document.getElementById('nickname-input').value = '';
  document.getElementById('modal-overlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('nickname-input').focus(), 50);
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  pendingSlot = null;
}
function confirmJoin() {
  const nick = document.getElementById('nickname-input').value.trim();
  if (!nick || pendingSlot === null) { document.getElementById('nickname-input').focus(); return; }
  const si = pendingSlot;
  closeModal();
  joinSlot(si, nick);
}

// ── Events ─────────────────────────────────────────────────────────
document.getElementById('btn-modal-confirm').addEventListener('click', confirmJoin);
document.getElementById('btn-modal-cancel').addEventListener('click', closeModal);
document.getElementById('nickname-input').addEventListener('keydown', e => {
  if (e.key === 'Enter')  confirmJoin();
  if (e.key === 'Escape') closeModal();
});
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target.id === 'modal-overlay') closeModal();
});

document.getElementById('btn-confirm-load').addEventListener('click', confirmLoad);
document.getElementById('btn-cancel-load').addEventListener('click', closeLoadModal);
document.getElementById('load-modal').addEventListener('click', e => {
  if (e.target.id === 'load-modal') closeLoadModal();
});
document.getElementById('load-code-input').addEventListener('keydown', e => {
  if (e.key === 'Enter')  confirmLoad();
  if (e.key === 'Escape') closeLoadModal();
});

document.getElementById('btn-copy-code').addEventListener('click', copySaveCode);
document.getElementById('btn-close-save').addEventListener('click', closeSaveModal);
document.getElementById('save-modal').addEventListener('click', e => {
  if (e.target.id === 'save-modal') closeSaveModal();
});

// ── Boot ───────────────────────────────────────────────────────────
initFirebase();
