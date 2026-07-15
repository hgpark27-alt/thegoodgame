// ================================================================
//  어디 갈까? — 룰렛 (대한민국 시도)
// ================================================================
const DB_PATH = 'roulette';

const COLORS = [
  '#FF6B6B','#FF9F43','#FECA57','#48DBFB','#FF9FF3',
  '#54A0FF','#5F27CD','#01CBC6','#10AC84','#EE5A24',
  '#0652DD','#9980FA','#C4E538','#FDA7DF','#D980FA',
  '#12CBC4','#F9CA24','#6AB04C',
];

const SEED_PLACES = [
  '서울','부산','대구','인천','광주','대전','울산','세종',
  '경기','강원','충북','충남','전북','전남','경북','경남','제주',
];

let db;
let places  = {};   // { id: { name, order, color } }
let canvas, ctx;
let wheelAngle = 0;
let spinning   = false;

// ── Init ─────────────────────────────────────────────────────────
function init() {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();

  canvas = document.getElementById('wheel');
  ctx    = canvas.getContext('2d');
  const size = Math.min(window.innerWidth - 32, 340);
  canvas.width = canvas.height = size;

  db.ref(`${DB_PATH}/places`).on('value', snap => {
    const val = snap.val();
    if (!val) { seedPlaces(); return; }
    places = val;
    renderPlaceList();
    drawWheel();
    updateSpinBtn();
  });

  document.getElementById('place-input')
    .addEventListener('keydown', e => { if (e.key === 'Enter') addPlace(); });
}

function seedPlaces() {
  const batch = {};
  SEED_PLACES.forEach((name, i) => {
    batch[`p_${String(i).padStart(2,'0')}`] = { name, order: i, color: COLORS[i % COLORS.length] };
  });
  db.ref(`${DB_PATH}/places`).set(batch);
}

// ── Draw ─────────────────────────────────────────────────────────
function drawWheel() {
  const W = canvas.width;
  const cx = W / 2, cy = W / 2, r = cx - 4;
  ctx.clearRect(0, 0, W, W);

  const arr = sortedPlaces();
  const n   = arr.length;

  if (n === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = '#F1EDEC';
    ctx.fill();
    ctx.fillStyle = '#AAA';
    ctx.font = `bold ${Math.round(r * 0.12)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('장소를 추가하세요', cx, cy);
    return;
  }

  const seg = (2 * Math.PI) / n;

  arr.forEach((p, i) => {
    const a0 = wheelAngle + i * seg - Math.PI / 2;
    const a1 = a0 + seg;

    // Segment
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a0, a1);
    ctx.closePath();
    ctx.fillStyle = p.color || COLORS[i % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a0 + seg / 2);

    const maxW  = r * 0.52;
    const fSize = Math.min(15, Math.max(8, Math.floor(seg * r * 0.38)));
    ctx.font = `bold ${fSize}px -apple-system, sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,.3)';
    ctx.shadowBlur  = 3;

    let label = p.name;
    while (ctx.measureText(label).width > maxW && label.length > 1) {
      label = label.slice(0, -1);
    }
    if (label !== p.name) label += '…';

    ctx.fillText(label, r - 12, 0);
    ctx.restore();
  });

  // Center cap
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(10, r * 0.08), 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#DDD';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// ── Spin ─────────────────────────────────────────────────────────
function spin() {
  const arr = sortedPlaces();
  if (spinning || arr.length < 2) return;
  spinning = true;
  document.getElementById('spin-btn').disabled = true;

  const n      = arr.length;
  const seg    = (2 * Math.PI) / n;
  const wIdx   = Math.floor(Math.random() * n);
  const winner = arr[wIdx];

  // Target: center of winning segment ends up at top (–π/2)
  // After spinning, topAngle = -(wheelAngle % 2π) normalised → must equal wIdx*seg + seg/2
  const jitter  = (Math.random() - 0.5) * seg * 0.55;
  const target  = (2 * Math.PI - (wIdx * seg + seg / 2 + jitter));
  const curNorm = ((wheelAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  let   delta   = ((target - curNorm) + 2 * Math.PI) % (2 * Math.PI);
  const extra   = (7 + Math.floor(Math.random() * 5)) * 2 * Math.PI;
  const total   = extra + delta;

  const t0  = performance.now();
  const dur = 4200 + Math.random() * 1000;
  const a0  = wheelAngle;

  function ease(t) { return 1 - Math.pow(1 - t, 5); }

  (function frame(now) {
    const p = Math.min((now - t0) / dur, 1);
    wheelAngle = a0 + total * ease(p);
    drawWheel();
    if (p < 1) { requestAnimationFrame(frame); return; }
    wheelAngle = a0 + total;
    spinning   = false;
    drawWheel();
    document.getElementById('spin-btn').disabled = false;
    showResult(winner.name);
    try { navigator.vibrate && navigator.vibrate([80, 40, 160]); } catch(_) {}
  })(performance.now());
}

// ── Result ───────────────────────────────────────────────────────
function showResult(name) {
  document.getElementById('result-place').textContent = name;
  document.getElementById('result-overlay').classList.remove('hidden');
}
function closeResult() {
  document.getElementById('result-overlay').classList.add('hidden');
}

// ── CRUD ─────────────────────────────────────────────────────────
function addPlace() {
  const inp  = document.getElementById('place-input');
  const name = inp.value.trim();
  if (!name) { inp.focus(); return; }

  const order = Object.keys(places).length;
  const color = COLORS[order % COLORS.length];
  const id    = 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  db.ref(`${DB_PATH}/places/${id}`).set({ name, order, color });
  inp.value = '';
  inp.focus();
}

function deletePlace(id) {
  const name = places[id]?.name;
  if (!confirm(`"${name}" 을 삭제할까요?`)) return;
  db.ref(`${DB_PATH}/places/${id}`).remove();
}

function updateSpinBtn() {
  const n = Object.keys(places).length;
  document.getElementById('spin-btn').disabled = n < 2;
  const hint = document.getElementById('spin-hint');
  if (hint) hint.classList.toggle('hidden', n >= 2);
}

function sortedPlaces() {
  return Object.entries(places)
    .sort(([,a],[,b]) => (a.order||0) - (b.order||0))
    .map(([,p]) => p);
}

function esc(s) {
  return String(s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function renderPlaceList() {
  const list = document.getElementById('place-list');
  const arr  = Object.entries(places).sort(([,a],[,b]) => (a.order||0) - (b.order||0));

  if (!arr.length) {
    list.innerHTML = '<div class="empty-msg">아직 장소가 없어요.<br>추가해보세요!</div>';
    return;
  }
  list.innerHTML = arr.map(([id, p]) => `
    <div class="place-item">
      <div class="place-dot" style="background:${p.color||'#ccc'}"></div>
      <div class="place-name">${esc(p.name)}</div>
      <button class="place-del" onclick="deletePlace('${id}')">×</button>
    </div>`).join('');
}

init();
