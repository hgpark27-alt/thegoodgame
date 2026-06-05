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
    active: false, playerId: null, playerName: null,
    credit: 0, genLevel: 1, autoMinerLevel: 0,
    overDriveUnlocked: false,
    overDriveState: 'inactive',
    overDriveExpiresAt: 0,
    baseProduction: 1,
  };
}

// ── State ──────────────────────────────────────────────────────────
let db;

const myId = (() => {
  let id = sessionStorage.getItem('cgb_pid');
  if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem('cgb_pid', id); }
  return id;
})();

let mySlot         = null;
let localCredit    = 0;
let localGenLv     = 1;
let localAMLv      = 0;
let localODUnlock  = false;
let localODState   = 'inactive'; // 'inactive' | 'active' | 'cooldown'
let localODExp     = 0;          // timestamp when current OD state expires
let prevODState    = 'inactive';

let localGenCost   = 600;
let localAMCost    = 300;
let localODCost    = 1200;
let costsReady     = false;

let slotCache  = [makeDefault(), makeDefault()];
let pendingSlot = null;
let tickId      = null;
let syncId      = null;

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

async function joinSlot(si, nickname) {
  const snap = await db.ref(`game/slots/${si}`).once('value');
  if (snap.val()?.active) { alert('이 슬롯은 방금 참여됐습니다.'); renderPanel(0); renderPanel(1); return; }

  const allSnap = await db.ref('game/slots').once('value');
  const allRaw  = allSnap.val() || {};
  if (!allRaw[0]?.active && !allRaw[1]?.active) {
    await db.ref('game').set({ slots: { 0: makeDefault(), 1: makeDefault() } });
  }

  const initial = Object.assign(makeDefault(), { active: true, playerId: myId, playerName: nickname.slice(0, 12) });
  const slotRef = db.ref(`game/slots/${si}`);
  await slotRef.set(initial);
  slotRef.onDisconnect().set(makeDefault());

  mySlot = si; localCredit = 0; localGenLv = 1; localAMLv = 0;
  localODUnlock = false; localODState = 'inactive'; localODExp = 0;
  prevODState = 'inactive'; costsReady = false;

  startTick(); startSync();

  setTimeout(() => {
    const bp  = calcBase(localGenLv, localAMLv);
    localGenCost = genCost(bp); localAMCost = amCost(bp); localODCost = odCost(bp);
    costsReady = true;
    refreshMyPanel();
  }, 2000);
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
  prevODState = 'active'; syncToFirebase(); updateODBtn();
}

function recalcCosts() {
  const bp = calcBase(localGenLv, localAMLv);
  localGenCost = genCost(bp); localAMCost = amCost(bp); localODCost = odCost(bp);
}

// ── Render ─────────────────────────────────────────────────────────
function renderPanel(si) {
  const panel = document.getElementById(`panel-${si}`);
  if (!panel) return;
  const data = slotCache[si];
  const isMe = mySlot === si && data.playerId === myId;

  if (!data.active) {
    if (panel.dataset.state !== 'empty') { panel.dataset.state = 'empty'; renderEmpty(panel, si); }
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
      ${mySlot === null ? `<button class="btn-join" onclick="onJoinClick(${si})">참여하기</button>` : ''}
    </div>`;
}

function renderActive(panel, si, data, isMe) {
  const credit = isMe ? localCredit : data.credit;
  const bp     = isMe ? calcBase(localGenLv, localAMLv) : (data.baseProduction || 1);
  const genLv  = isMe ? localGenLv  : (data.genLevel || 1);
  const amLv   = isMe ? localAMLv   : (data.autoMinerLevel || 0);
  const odUnlk = isMe ? localODUnlock : !!data.overDriveUnlocked;
  const odSt   = isMe ? localODState  : (data.overDriveState || 'inactive');
  const odExp  = isMe ? localODExp    : (data.overDriveExpiresAt || 0);

  panel.innerHTML = `
    <div class="slot-active${isMe ? ' is-me' : ''}">
      <div class="slot-header">
        <span class="player-name">${esc(data.playerName)}</span>
        ${isMe ? `<button class="btn-leave" onclick="leaveSlot()">LEAVE</button>` : ''}
      </div>
      <div class="credit-block">
        <div class="credit-val" id="credit-${si}">Credit: ${formatNum(credit)}</div>
        <div class="cps-val" id="cps-${si}">Production: ${formatNum(bp)}/sec</div>
      </div>
      <div class="od-wrap" id="od-wrap-${si}">
        ${buildODBox(si, isMe, odUnlk, odSt, odExp)}
      </div>
      <div class="installed-wrap">
        <div class="section-label">Installed Items</div>
        <div id="installed-${si}">${buildInstalledHTML(genLv, amLv, odUnlk, bp)}</div>
      </div>
      ${isMe ? `
      <div class="shop-wrap">
        <div class="section-label">Shop</div>
        <div id="shop-${si}">${buildShopHTML()}</div>
      </div>` : ''}
    </div>`;
}

// ── OD Box ─────────────────────────────────────────────────────────
function buildODBox(si, isMe, unlocked, state, expiresAt) {
  if (!unlocked) {
    return `<div class="od-box od-locked">
      <div class="od-name">OVER DRIVE</div>
      <div class="od-desc">× 10 Production · 15s · Cooldown 3min</div>
      <div class="od-hint">Purchase in Shop to unlock</div>
    </div>`;
  }
  if (state === 'active') {
    const rem = isMe ? Math.max(0, Math.ceil((localODExp - Date.now()) / 1000)) : '—';
    return `<div class="od-box od-active">
      <div class="od-name">⚡ OVER DRIVE ACTIVE</div>
      ${isMe ? `<div class="od-timer" id="od-timer-${si}">${rem}s</div>` : ''}
    </div>`;
  }
  if (state === 'cooldown') {
    const rem = isMe ? Math.max(0, Math.ceil((localODExp - Date.now()) / 1000)) : '—';
    return `<div class="od-box od-cooldown">
      <div class="od-name">OVER DRIVE COOLDOWN</div>
      ${isMe ? `<div class="od-timer" id="od-timer-${si}">${rem}s</div>` : ''}
    </div>`;
  }
  return `<button class="od-box od-ready" ${isMe ? 'onclick="activateOverDrive()"' : 'disabled'}>
    <div class="od-name">▶ OVER DRIVE</div>
    <div class="od-desc">× 10 Production for 15 seconds</div>
  </button>`;
}

// ── Installed & Shop HTML ──────────────────────────────────────────
function buildInstalledHTML(genLv, amLv, odUnlk, bp) {
  return `
    <div class="inst-item">Generator Lv${genLv}</div>
    ${amLv > 0 ? `<div class="inst-item">Auto Miner Lv${amLv}</div>` : ''}
    ${odUnlk ? `<div class="inst-item">Over Drive Unlocked</div>` : ''}
    <div class="inst-prod">Current Production: <span>${formatNum(bp)}/sec</span></div>`;
}

function buildShopHTML() {
  const bp  = calcBase(localGenLv, localAMLv);
  const gCan = costsReady && localCredit >= localGenCost;
  const aCan = costsReady && localCredit >= localAMCost;
  const oCan = costsReady && !localODUnlock && localCredit >= localODCost;
  const gStr = costsReady ? formatNum(localGenCost) : '...';
  const aStr = costsReady ? formatNum(localAMCost)  : '...';
  const oStr = costsReady ? formatNum(localODCost)  : '...';
  const nextBase = formatNum(calcBase(localGenLv + 1, localAMLv));
  const curMult  = (1 + localAMLv * 0.25).toFixed(2);
  const nxtMult  = (1 + (localAMLv + 1) * 0.25).toFixed(2);

  return `
    <button class="shop-btn${gCan ? '' : ' cant-afford'}" data-shop="gen"
      onclick="upgradeGenerator()" ${gCan ? '' : 'disabled'}>
      <span class="sn">Generator</span>
      <span class="sl">Lv${localGenLv} → ${localGenLv + 1}</span>
      <span class="sd">Base output → ${nextBase}/sec</span>
      <span class="sc">Cost: ${gStr}</span>
    </button>
    <button class="shop-btn${aCan ? '' : ' cant-afford'}" data-shop="am"
      onclick="upgradeAutoMiner()" ${aCan ? '' : 'disabled'}>
      <span class="sn">Auto Miner</span>
      <span class="sl">Lv${localAMLv} → ${localAMLv + 1}</span>
      <span class="sd">Multiplier ×${curMult} → ×${nxtMult}</span>
      <span class="sc">Cost: ${aStr}</span>
    </button>
    ${!localODUnlock ? `
    <button class="shop-btn${oCan ? '' : ' cant-afford'}" data-shop="od"
      onclick="unlockOverDrive()" ${oCan ? '' : 'disabled'}>
      <span class="sn">Over Drive</span>
      <span class="sl">Unlock</span>
      <span class="sd">× 10 production · 15s · CD 3min</span>
      <span class="sc">Cost: ${oStr}</span>
    </button>` : ''}`;
}

// ── Live Updates ───────────────────────────────────────────────────
function updateMyStats() {
  if (mySlot === null) return;
  const si = mySlot;
  const odActive = localODState === 'active';
  const bp = calcBase(localGenLv, localAMLv);
  const fp = calcFinal(localGenLv, localAMLv, odActive);

  const cEl = document.getElementById(`credit-${si}`);
  const pEl = document.getElementById(`cps-${si}`);
  if (cEl) cEl.textContent = `Credit: ${formatNum(localCredit)}`;
  if (pEl) pEl.textContent = `Production: ${formatNum(odActive ? fp : bp)}/sec${odActive ? ' ⚡' : ''}`;

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
    data.genLevel || 1, data.autoMinerLevel || 0, !!data.overDriveUnlocked, bp);

  const odWrap = document.getElementById(`od-wrap-${si}`);
  if (odWrap) odWrap.innerHTML = buildODBox(si, false,
    !!data.overDriveUnlocked, data.overDriveState || 'inactive', data.overDriveExpiresAt || 0);
}

function updateODBtn() {
  if (mySlot === null) return;
  const si = mySlot;
  const odWrap = document.getElementById(`od-wrap-${si}`);
  if (!odWrap) return;

  if (localODState !== prevODState) {
    prevODState = localODState;
    odWrap.innerHTML = buildODBox(si, true, localODUnlock, localODState, localODExp);
    return;
  }

  if (localODState === 'active' || localODState === 'cooldown') {
    const timerEl = document.getElementById(`od-timer-${si}`);
    if (timerEl) {
      const rem = Math.max(0, Math.ceil((localODExp - Date.now()) / 1000));
      timerEl.textContent = rem + 's';
    }
  }
}

function refreshMyPanel() {
  if (mySlot === null) return;
  const si = mySlot;
  const bp = calcBase(localGenLv, localAMLv);
  const instEl = document.getElementById(`installed-${si}`);
  const shopEl = document.getElementById(`shop-${si}`);
  const odWrap = document.getElementById(`od-wrap-${si}`);
  if (instEl) instEl.innerHTML = buildInstalledHTML(localGenLv, localAMLv, localODUnlock, bp);
  if (shopEl) shopEl.innerHTML = buildShopHTML();
  if (odWrap) odWrap.innerHTML = buildODBox(si, true, localODUnlock, localODState, localODExp);
  updateMyStats();
}

function refreshAfford() {
  if (!costsReady || mySlot === null) return;
  const shopEl = document.getElementById(`shop-${mySlot}`);
  if (!shopEl) return;
  const upd = (sel, can) => {
    const btn = shopEl.querySelector(`[data-shop="${sel}"]`);
    if (!btn) return;
    btn.disabled = !can;
    btn.classList.toggle('cant-afford', !can);
  };
  upd('gen', localCredit >= localGenCost);
  upd('am',  localCredit >= localAMCost);
  upd('od',  !localODUnlock && localCredit >= localODCost);
}

// ── Modal ──────────────────────────────────────────────────────────
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

document.getElementById('btn-modal-confirm').addEventListener('click', confirmJoin);
document.getElementById('btn-modal-cancel').addEventListener('click', closeModal);
document.getElementById('nickname-input').addEventListener('keydown', e => {
  if (e.key === 'Enter')  confirmJoin();
  if (e.key === 'Escape') closeModal();
});
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target.id === 'modal-overlay') closeModal();
});

// ── Boot ───────────────────────────────────────────────────────────
initFirebase();
