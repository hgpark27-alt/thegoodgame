// ================================================================
//  Credit Generator Battle  –  script.js
// ================================================================

const ITEM_DEFS = {
  overDrive:     { name: 'Over Drive',     baseCost: 100,    desc: '+1 Credit/click' },
  autoMiner:     { name: 'Auto Miner',     baseCost: 3000,   desc: '+5 Credit/sec'   },
  turboCore:     { name: 'Turbo Core',     baseCost: 50000,  desc: '+20% all CPS'    },
  quantumEngine: { name: 'Quantum Engine', baseCost: 500000, desc: '+100 Credit/sec' },
};
const ITEM_KEYS = Object.keys(ITEM_DEFS);

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

function calcCPS(items) {
  const base = (items.autoMiner || 0) * 5 + (items.quantumEngine || 0) * 100;
  return base * (1 + (items.turboCore || 0) * 0.2);
}

function calcClick(items) {
  return 1 + (items.overDrive || 0);
}

function nextCost(cost) {
  return Math.floor(cost * 1.15);
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);
}

function makeDefault() {
  return {
    active:     false,
    playerId:   null,
    playerName: null,
    credit:     0,
    cps:        0,
    clickGain:  1,
    items: { overDrive:0, autoMiner:0, turboCore:0, quantumEngine:0 },
    costs: { overDrive:100, autoMiner:3000, turboCore:50000, quantumEngine:500000 },
  };
}

// ── State ──────────────────────────────────────────────────────────
let db;

const myId = (() => {
  let id = sessionStorage.getItem('cgb_pid');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('cgb_pid', id);
  }
  return id;
})();

let mySlot      = null;
let localCredit = 0;
let localItems  = { overDrive:0, autoMiner:0, turboCore:0, quantumEngine:0 };
let localCosts  = { overDrive:100, autoMiner:3000, turboCore:50000, quantumEngine:500000 };

let slotCache   = [makeDefault(), makeDefault()];
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
      const r = raw[i] || {};
      slotCache[i] = Object.assign(makeDefault(), r);
      slotCache[i].items = Object.assign(
        { overDrive:0, autoMiner:0, turboCore:0, quantumEngine:0 },
        r.items || {}
      );
      slotCache[i].costs = Object.assign(
        { overDrive:100, autoMiner:3000, turboCore:50000, quantumEngine:500000 },
        r.costs || {}
      );
    }

    renderPanel(0);
    renderPanel(1);
  });
}

async function joinSlot(si, nickname) {
  // Confirm slot is still empty
  const snap = await db.ref(`game/slots/${si}`).once('value');
  if (snap.val()?.active) {
    alert('이 슬롯은 방금 참여됐습니다.');
    renderPanel(0); renderPanel(1);
    return;
  }

  // Reset game if both slots are vacant
  const allSnap = await db.ref('game/slots').once('value');
  const allRaw  = allSnap.val() || {};
  if (!allRaw[0]?.active && !allRaw[1]?.active) {
    await db.ref('game').set({ slots: { 0: makeDefault(), 1: makeDefault() } });
  }

  const initial = Object.assign(makeDefault(), {
    active:     true,
    playerId:   myId,
    playerName: nickname.slice(0, 12),
  });

  const slotRef = db.ref(`game/slots/${si}`);
  await slotRef.set(initial);
  slotRef.onDisconnect().set(makeDefault());

  mySlot      = si;
  localCredit = 0;
  localItems  = { ...initial.items };
  localCosts  = { ...initial.costs };

  startTick();
  startSync();
}

function leaveSlot() {
  if (mySlot === null) return;
  const si = mySlot;

  db.ref(`game/slots/${si}`).onDisconnect().cancel();
  db.ref(`game/slots/${si}`).set(makeDefault());

  stopTick();
  stopSync();

  mySlot      = null;
  localCredit = 0;
  localItems  = { overDrive:0, autoMiner:0, turboCore:0, quantumEngine:0 };
  localCosts  = { overDrive:100, autoMiner:3000, turboCore:50000, quantumEngine:500000 };
}

function syncToFirebase() {
  if (mySlot === null) return;
  db.ref(`game/slots/${mySlot}`).update({
    credit:    Math.floor(localCredit),
    cps:       calcCPS(localItems),
    clickGain: calcClick(localItems),
    items:     { ...localItems },
    costs:     { ...localCosts },
  });
}

// ── Tick ───────────────────────────────────────────────────────────
function startTick() {
  stopTick();
  tickId = setInterval(() => {
    if (mySlot === null) return;
    localCredit += calcCPS(localItems) / 10;
    updateMyStats();
  }, 100);
}
function stopTick()  { clearInterval(tickId);  tickId  = null; }
function startSync() { stopSync(); syncId = setInterval(syncToFirebase, 1000); }
function stopSync()  { clearInterval(syncId); syncId = null; }

// ── Game Actions ───────────────────────────────────────────────────
function handleGeneratorClick(si) {
  if (si !== mySlot) return;
  const gain = calcClick(localItems);
  localCredit += gain;
  updateMyStats();
  spawnFloat(si, gain);
}

function buyItem(key) {
  if (mySlot === null) return;
  const cost = localCosts[key];
  if (localCredit < cost) return;

  localCredit    -= cost;
  localItems[key]++;
  localCosts[key] = nextCost(cost);

  syncToFirebase();
  refreshMyPanel();
}

// ── Render ─────────────────────────────────────────────────────────
function renderPanel(si) {
  const panel = document.getElementById(`panel-${si}`);
  if (!panel) return;
  const data = slotCache[si];
  const isMe = mySlot === si && data.playerId === myId;

  if (!data.active) {
    if (panel.dataset.state !== 'empty') {
      panel.dataset.state = 'empty';
      renderEmpty(panel, si);
    }
    return;
  }

  if (panel.dataset.state === `active-${data.playerId}`) {
    if (isMe) updateMyStats();
    else      updateOppStats(si, data);
    return;
  }

  panel.dataset.state = `active-${data.playerId}`;
  renderActive(panel, si, data, isMe);
}

function renderEmpty(panel, si) {
  const canJoin = mySlot === null;
  panel.innerHTML = `
    <div class="slot-empty">
      <div class="slot-label">SLOT ${si + 1}</div>
      <div class="empty-text">Empty</div>
      ${canJoin
        ? `<button class="btn-join" onclick="onJoinClick(${si})">참여하기</button>`
        : ''}
    </div>`;
}

function renderActive(panel, si, data, isMe) {
  const credit = isMe ? localCredit  : data.credit;
  const cps    = isMe ? calcCPS(localItems) : data.cps;
  const items  = isMe ? localItems   : data.items;
  const costs  = isMe ? localCosts   : data.costs;

  panel.innerHTML = `
    <div class="slot-active${isMe ? ' is-me' : ''}">
      <div class="slot-header">
        <span class="player-name">${esc(data.playerName)}</span>
        ${isMe ? `<button class="btn-leave" onclick="leaveSlot()">LEAVE</button>` : ''}
      </div>
      <div class="credit-block">
        <div class="credit-val" id="credit-${si}">Credit: ${formatNum(credit)}</div>
        <div class="cps-val"    id="cps-${si}">CPS: ${formatNum(cps)}/sec</div>
      </div>
      <div class="gen-wrap">
        <button class="gen-btn${isMe ? '' : ' disabled'}" id="gen-${si}"
          ${isMe ? `onclick="handleGeneratorClick(${si})"` : ''}>
          Generator
        </button>
        <div class="float-layer" id="floats-${si}"></div>
      </div>
      <div class="installed-wrap">
        <div class="section-label">Installed Items</div>
        <div id="installed-${si}">${buildInstalledHTML(items)}</div>
      </div>
      ${isMe ? `
      <div class="shop-wrap">
        <div class="section-label">Shop</div>
        <div id="shop-${si}">${buildShopHTML(items, costs, credit)}</div>
      </div>` : ''}
    </div>`;
}

function updateMyStats() {
  if (mySlot === null) return;
  const si   = mySlot;
  const cEl  = document.getElementById(`credit-${si}`);
  const pEl  = document.getElementById(`cps-${si}`);
  if (cEl) cEl.textContent = `Credit: ${formatNum(localCredit)}`;
  if (pEl) pEl.textContent = `CPS: ${formatNum(calcCPS(localItems))}/sec`;
  refreshAfford(si);
}

function updateOppStats(si, data) {
  const cEl = document.getElementById(`credit-${si}`);
  const pEl = document.getElementById(`cps-${si}`);
  if (cEl) cEl.textContent = `Credit: ${formatNum(data.credit)}`;
  if (pEl) pEl.textContent = `CPS: ${formatNum(data.cps)}/sec`;

  const instEl = document.getElementById(`installed-${si}`);
  if (instEl) instEl.innerHTML = buildInstalledHTML(data.items);
}

function refreshMyPanel() {
  if (mySlot === null) return;
  const si     = mySlot;
  const instEl = document.getElementById(`installed-${si}`);
  const shopEl = document.getElementById(`shop-${si}`);
  if (instEl) instEl.innerHTML = buildInstalledHTML(localItems);
  if (shopEl) shopEl.innerHTML = buildShopHTML(localItems, localCosts, localCredit);
  updateMyStats();
}

function refreshAfford(si) {
  const shopEl = document.getElementById(`shop-${si}`);
  if (!shopEl) return;
  shopEl.querySelectorAll('.shop-btn').forEach(btn => {
    const cost   = localCosts[btn.dataset.key];
    const afford = localCredit >= cost;
    btn.disabled = !afford;
    btn.classList.toggle('cant-afford', !afford);
  });
}

// ── HTML Builders ──────────────────────────────────────────────────
function buildInstalledHTML(items) {
  const lines = ITEM_KEYS
    .filter(k => (items[k] || 0) > 0)
    .map(k => `<div class="inst-item">${ITEM_DEFS[k].name} Lv${items[k]}</div>`);
  return lines.length ? lines.join('') : '<div class="no-items">None</div>';
}

function buildShopHTML(items, costs, credit) {
  return ITEM_KEYS.map(k => {
    const def    = ITEM_DEFS[k];
    const cost   = costs[k] || def.baseCost;
    const level  = items[k]  || 0;
    const afford = credit >= cost;
    return `<button class="shop-btn${afford ? '' : ' cant-afford'}"
      data-key="${k}" onclick="buyItem('${k}')" ${afford ? '' : 'disabled'}>
      <span class="sn">${def.name}</span>
      <span class="sl">Lv${level}</span>
      <span class="sd">${def.desc}</span>
      <span class="sc">Cost: ${formatNum(cost)}</span>
    </button>`;
  }).join('');
}

// ── Floating Text ──────────────────────────────────────────────────
function spawnFloat(si, amount) {
  const layer = document.getElementById(`floats-${si}`);
  if (!layer) return;
  const el = document.createElement('div');
  el.className    = 'float-txt';
  el.textContent  = '+' + formatNum(amount);
  el.style.left   = (10 + Math.random() * 70) + '%';
  el.style.bottom = '30%';
  layer.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.style.transform = 'translateY(-75px)';
    el.style.opacity   = '0';
  }));
  setTimeout(() => el.remove(), 1050);
}

// ── Modal ──────────────────────────────────────────────────────────
function onJoinClick(si) {
  if (mySlot !== null)        return;
  if (slotCache[si]?.active)  return;
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
  if (!nick) { document.getElementById('nickname-input').focus(); return; }
  if (pendingSlot === null) return;
  closeModal();
  joinSlot(pendingSlot, nick);
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

// ── Boot ───────────────────────────────────────────────────────────
initFirebase();
