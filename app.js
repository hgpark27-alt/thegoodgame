// ================================================================
//  BLACKONYX R&D Dashboard — v2 (dynamic project tree)
// ================================================================
const DB_PATH = 'blackonyx-pm';

const STATUS_LIST = [
  { key: 'Not Started', label: '미시작', cls: 's-not-started' },
  { key: 'In Progress', label: '진행중', cls: 's-in-progress' },
  { key: 'Completed',   label: '완료',   cls: 's-completed'   },
  { key: 'Delayed',     label: '지연',   cls: 's-delayed'     },
  { key: 'On Hold',     label: '보류',   cls: 's-on-hold'     },
];

// ── Seed ─────────────────────────────────────────────────────────
const SEED_PROJECTS = {
  'proj_blackonyx': { name: 'Blackonyx', order: 0 },
  'proj_bilayer':   { name: 'Bi-layer',  order: 1 },
  'proj_pvd':       { name: 'PVD',       order: 2 },
};
const SEED_SUBPROJECTS = {
  'sub_al2o3_yof':    { name: 'Al2O3 + YOF',              projectId: 'proj_bilayer', order: 0 },
  'sub_ano_yof':      { name: 'ANO + YOF',                 projectId: 'proj_bilayer', order: 1 },
  'sub_y2o3':         { name: 'Y2O3',                      projectId: 'proj_bilayer', order: 2 },
  'sub_bilayer_spec': { name: 'Bi-layer Al2O3 신규 Spec',  projectId: 'proj_bilayer', order: 3 },
};
const SEED_TASKS = [
  { projectId:'proj_blackonyx', subProjectId:'', actionItem:'DoE 1-9번까지 Final 세정하여 고객사에 쿠폰 송부', refDetails:'Final 세정 필요\n영업팀 전달', assignees:'박혜근 선임', nbd:'2026-07-08', status:'In Progress', latestUpdate:'2026-07-06', updateLog:'2026.07.06 - 쿠폰 고객 송부 예정 (~7/8)', order:0 },
  { projectId:'proj_blackonyx', subProjectId:'', actionItem:'DoE 9 쿠폰 코팅 진행', refDetails:'Spray distance 110mm, Carrier gas 3.5LPM', assignees:'김준탁 팀장\n박성환 책임\n신주영 선임', nbd:'2026-07-02', status:'Not Started', latestUpdate:'', updateLog:'', order:1 },
  { projectId:'proj_blackonyx', subProjectId:'', actionItem:'XRD/Top-down EDS 분석 및 결과 송부', refDetails:'', assignees:'석혜원 수석\n채정민 책임', nbd:'2026-07-03', status:'Completed', latestUpdate:'2026-07-03', updateLog:'2026.07.03 - 분석 결과 공유 완료', order:2 },
  { projectId:'proj_blackonyx', subProjectId:'', actionItem:'DoE 결정 후 Dummy Cathode 코팅', refDetails:'', assignees:'김준탁 팀장\n사공정 책임\n박성환 책임\n신주영 선임', nbd:'2026-07-07', status:'In Progress', latestUpdate:'2026-07-06', updateLog:'2026.07.06 - DOE 1로 코팅 진행 고객사 컨펌 완료', order:3 },
  { projectId:'proj_blackonyx', subProjectId:'', actionItem:'Dummy Cathode cutting 후 분석 진행', refDetails:'XRD, Top-down EDS, Cross-section', assignees:'석혜원 수석\n채정민 책임', nbd:'2026-07-15', status:'Not Started', latestUpdate:'', updateLog:'', order:4 },
  { projectId:'proj_blackonyx', subProjectId:'', actionItem:'실 제품 코팅 및 F/clean 진행', refDetails:'', assignees:'김준탁 팀장\n사공정 책임\n박성환 책임\n신주영 선임', nbd:'2026-07-27', status:'Not Started', latestUpdate:'', updateLog:'', order:5 },
  { projectId:'proj_blackonyx', subProjectId:'', actionItem:'1 liner set 납품', refDetails:'', assignees:'박혜근 선임', nbd:'2026-07-28', status:'Not Started', latestUpdate:'', updateLog:'', order:6 },
  { projectId:'proj_bilayer', subProjectId:'sub_al2o3_yof', actionItem:'Hardmask 제작 관련 일정', refDetails:'고객사와 Concept 논의 후 제작 시작\nTermination쪽의 coating layer는 자연스럽게 tapering 되도록 설계', assignees:'김준탁 팀장\n박성환 책임\n신주영 선임', nbd:'TBD', status:'In Progress', latestUpdate:'', updateLog:'', order:0 },
  { projectId:'proj_bilayer', subProjectId:'sub_al2o3_yof', actionItem:'Saint-Goban powder, heating jacket 설치 후 Feeding test 진행', refDetails:'- Heating jacket 평가에 앞서 파우더 110℃ 열처리 후 피딩 평가 선진행 예정\n- Al2O3 #195(12~38㎛) 파우더 견적 및 납품 가능 업체 확인 중', assignees:'김준탁 팀장\n구자춘 책임\n박성환 책임', nbd:'TBD', status:'In Progress', latestUpdate:'2026-07-03', updateLog:'2026.07.06 - Heating jacket 견적 및 보유 재고 확인 완료', order:1 },
  { projectId:'proj_bilayer', subProjectId:'sub_al2o3_yof', actionItem:'Sumitomo powder ICP-OES 분석', refDetails:'- 분석 결과에 모든 원소에 대한 측정값 나열 필요', assignees:'채정민 책임', nbd:'TBD', status:'In Progress', latestUpdate:'', updateLog:'', order:2 },
  { projectId:'proj_bilayer', subProjectId:'sub_ano_yof', actionItem:'Sym 3 kit 도면 검토', refDetails:'- Ano 영역 관련 도면 지정 스펙 확인', assignees:'김준탁 팀장\n유종수 책임\n박성환 책임\n신주영 선임', nbd:'2026-07-10', status:'In Progress', latestUpdate:'2026-07-03', updateLog:'2026.07.03 - 전면 Ano Sym3 kit (4 parts) 도면 검토 중', order:0 },
  { projectId:'proj_bilayer', subProjectId:'sub_ano_yof', actionItem:'SLD, Screen racking area 재검토', refDetails:'SLD\n   1)가운데 부분 모서리로부터 3mm racking\n   2)파트 뒷 면 양쪽 Tap 이용\nScreen\n   1) Bare 면으로 유지되는 카운터싱크 적용 가능 Fixture 개발', assignees:'김준탁 팀장\n유종수 책임', nbd:'TBD', status:'Not Started', latestUpdate:'', updateLog:'', order:1 },
  { projectId:'proj_bilayer', subProjectId:'sub_ano_yof', actionItem:'Fixture re-design', refDetails:'SLD, Screen 제품의 Ano 진행을 위한 racking area 검토하여 고객 논의 후 제작 필요', assignees:'김준탁 팀장\n박성환 책임\n신주영 선임', nbd:'TBD', status:'Not Started', latestUpdate:'', updateLog:'', order:2 },
  { projectId:'proj_bilayer', subProjectId:'sub_ano_yof', actionItem:'Dummy cathode termination 구간(2.5mm) Ra 값 측정', refDetails:'- Racking area 및 Fixture concept 확정 후 제작 필요', assignees:'김준탁 팀장\n박성환 책임', nbd:'TBD', status:'Not Started', latestUpdate:'', updateLog:'', order:3 },
  { projectId:'proj_bilayer', subProjectId:'sub_ano_yof', actionItem:'Ano+YOF kit shipping', refDetails:'7월 말 불가능시 고객 논의하여 연장 예정', assignees:'조요한 선임', nbd:'2026-07-31', status:'Not Started', latestUpdate:'', updateLog:'', order:4 },
  { projectId:'proj_bilayer', subProjectId:'sub_ano_yof', actionItem:'쿠폰 코팅 후 ICP-MS 측정', refDetails:'Bead → Ano → ICP-MS → YOF → ICP-MS\nNon-Bead(Bare) → Ano → ICP-MS', assignees:'김준탁 팀장\n배진한 책임', nbd:'TBD', status:'Not Started', latestUpdate:'', updateLog:'', order:5 },
  { projectId:'proj_bilayer', subProjectId:'sub_y2o3', actionItem:'Y2O3 Powder 수급 방안', refDetails:'', assignees:'지영연 부문장\n채정민 책임', nbd:'TBD', status:'Not Started', latestUpdate:'', updateLog:'', order:0 },
  { projectId:'proj_bilayer', subProjectId:'sub_bilayer_spec', actionItem:'Coupon 송부', refDetails:'PS ALO (Al2O3 only) : 10ea\nAl2O3+YOF : 10ea\nAno+YOF : 10ea', assignees:'조요한 선임\n채승헌 선임', nbd:'2026-07-16', status:'Not Started', latestUpdate:'', updateLog:'', order:0 },
  { projectId:'proj_bilayer', subProjectId:'sub_bilayer_spec', actionItem:'Data Sheet 작성', refDetails:'', assignees:'김준탁 팀장\n석혜원 수석\n채정민 책임', nbd:'TBD', status:'Not Started', latestUpdate:'', updateLog:'', order:1 },
  { projectId:'proj_pvd', subProjectId:'', actionItem:'MgF2 코팅 쿠폰 송부', refDetails:'', assignees:'채승헌 선임', nbd:'2026-07-08', status:'Not Started', latestUpdate:'', updateLog:'', order:0 },
  { projectId:'proj_pvd', subProjectId:'', actionItem:'PVD 2호기로 AlN Heater 코팅 진행 예정', refDetails:'고객사 쿠폰 분석 후 진행', assignees:'이주혁 책임', nbd:'TBD', status:'Not Started', latestUpdate:'', updateLog:'', order:1 },
  { projectId:'proj_pvd', subProjectId:'', actionItem:'PVD 3호기로 Lid 제품 코팅 및 세정 후 고객 납품', refDetails:'', assignees:'이주혁 책임\n채승헌 선임', nbd:'2026-07-10', status:'Not Started', latestUpdate:'', updateLog:'', order:2 },
  { projectId:'proj_pvd', subProjectId:'', actionItem:'PVD 3호기 결정질 개발 계획 및 progress 고객 공유', refDetails:'', assignees:'이주혁 책임\n채승헌 선임', nbd:'2026-10-31', status:'Not Started', latestUpdate:'', updateLog:'', order:3 },
];

// ── State ─────────────────────────────────────────────────────────
let db;
let projects    = {};
let subprojects = {};
let tasks       = {};

let _ready   = { p: false, s: false, t: false };
let _seeded  = false;
let _connectTimer;

let collapsed        = new Set();
let currentProjectId    = null;
let currentSubProjectId = null;
let filterStatus  = '';
let searchTerm    = '';
let addModalCtx   = null;
let selectedTaskId = null;
let activeEditCell = null;
let pendingRemoteRender = false;

// ── Helpers ──────────────────────────────────────────────────────
function esc(s) {
  return String(s || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
function statusInfo(key) { return STATUS_LIST.find(s => s.key === key) || STATUS_LIST[0]; }
function projName(pid)   { return projects[pid]?.name    || pid || '—'; }
function subName(sid)    { return subprojects[sid]?.name || sid || '—'; }
function newId(pfx)      { return pfx + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5); }

function deadlineClass(nbd) {
  if (!nbd || nbd === 'TBD') return '';
  const diff = (new Date(nbd) - new Date().setHours(0,0,0,0)) / 86400000;
  if (diff < 0)  return 'deadline-overdue';
  if (diff <= 3) return 'deadline-soon';
  if (diff <= 7) return 'deadline-ok';
  return '';
}
function fmtAssignees(str) {
  return (str || '').split('\n').map(s => s.trim()).filter(Boolean).join(', ') || '—';
}
function matchesFilter(t) {
  if (filterStatus && t.status !== filterStatus) return false;
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    return ['actionItem','assignees','refDetails','updateLog'].some(f => (t[f]||'').toLowerCase().includes(q));
  }
  return true;
}

// ── Init ─────────────────────────────────────────────────────────
function showLoadError(msg) {
  const tbody = document.getElementById('task-tbody');
  if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:48px;color:#ef4444;font-size:13px;line-height:2.2">
    ⚠ ${msg}<br>
    <small style="color:#76777b;font-size:11px">Firebase Console → Realtime Database → Rules →
    <code style="background:#f1edec;padding:1px 6px;border-radius:2px">"read":true,"write":true</code> 로 변경 후 게시</small>
  </td></tr>`;
}

function checkAllReady() {
  if (!_ready.p || !_ready.s || !_ready.t) return;
  clearTimeout(_connectTimer);
  if (!_seeded) {
    _seeded = true;
    if (!Object.keys(projects).length) { seedData(); return; }
  }
  renderSidebar();
  renderTable();
  updateSummary();
}

function onRemoteChange() {
  if (!_ready.p || !_ready.s || !_ready.t) return;
  renderSidebar();
  updateSummary();
  if (activeEditCell) { pendingRemoteRender = true; }
  else renderTable();
  if (selectedTaskId) renderDetailRemote();
}

function init() {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();

  _connectTimer = setTimeout(() =>
    showLoadError('Firebase 연결 시간 초과 — Database Rules를 확인하세요.'), 6000);

  const onErr = err => { clearTimeout(_connectTimer); showLoadError(`Firebase 접근 거부 (${err.code})`); };

  db.ref(`${DB_PATH}/projects`).on('value', snap => {
    projects = snap.val() || {};
    if (!_ready.p) { _ready.p = true; checkAllReady(); } else onRemoteChange();
  }, onErr);

  db.ref(`${DB_PATH}/subprojects`).on('value', snap => {
    subprojects = snap.val() || {};
    if (!_ready.s) { _ready.s = true; checkAllReady(); } else onRemoteChange();
  }, onErr);

  db.ref(`${DB_PATH}/tasks`).on('value', snap => {
    tasks = snap.val() || {};
    if (!_ready.t) { _ready.t = true; checkAllReady(); } else onRemoteChange();
  }, onErr);

  setupEvents();
}

function seedData() {
  db.ref(`${DB_PATH}/projects`).set(SEED_PROJECTS);
  db.ref(`${DB_PATH}/subprojects`).set(SEED_SUBPROJECTS);
  const batch = {};
  SEED_TASKS.forEach((t, i) => {
    batch['task_' + String(i).padStart(3,'0')] = { ...t, createdAt: Date.now(), updatedAt: Date.now() };
  });
  db.ref(`${DB_PATH}/tasks`).set(batch);
}

// ── Sidebar ───────────────────────────────────────────────────────
function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;
  nav.innerHTML = '';

  const sortedProjs = Object.entries(projects).sort(([,a],[,b]) => (a.order||0)-(b.order||0));

  sortedProjs.forEach(([pid, proj]) => {
    const subs = Object.entries(subprojects)
      .filter(([,s]) => s.projectId === pid)
      .sort(([,a],[,b]) => (a.order||0)-(b.order||0));
    const isOpen   = !collapsed.has(`nav:${pid}`);
    const isActive = currentProjectId === pid && !currentSubProjectId;
    const cnt      = Object.values(tasks).filter(t => t.projectId === pid).length;

    const wrap = document.createElement('div');

    // Project row
    const pRow = document.createElement('div');
    pRow.className = `nav-item ${isActive ? 'active' : ''}`;
    pRow.dataset.pid = pid;
    pRow.innerHTML = `
      <button class="nav-toggle" data-act="toggle">
        <span class="material-symbols-outlined" style="font-size:14px">${isOpen && subs.length ? 'expand_more' : 'chevron_right'}</span>
      </button>
      <span class="material-symbols-outlined nav-icon">folder_open</span>
      <span class="nav-label">${esc(proj.name)}</span>
      <span class="nav-cnt">${cnt}</span>
      <span class="nav-row-acts">
        <button class="nav-act-btn" title="서브프로젝트 추가" data-act="add-sub">
          <span class="material-symbols-outlined" style="font-size:13px">create_new_folder</span>
        </button>
        <button class="nav-act-btn danger" title="프로젝트 삭제" data-act="del">
          <span class="material-symbols-outlined" style="font-size:13px">delete</span>
        </button>
      </span>`;

    pRow.querySelector('.nav-label').addEventListener('dblclick', e => {
      e.stopPropagation();
      inlineRename(e.target, proj.name, n => db.ref(`${DB_PATH}/projects/${pid}/name`).set(n));
    });
    pRow.addEventListener('click', e => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'toggle') { toggleNavCollapse(pid); return; }
      if (act === 'add-sub') { addSubProject(pid); return; }
      if (act === 'del') { deleteProject(pid); return; }
      if (e.target.classList.contains('nav-label') && e.target.isContentEditable) return;
      selectNav(pid, null);
    });
    wrap.appendChild(pRow);

    // Sub rows
    if (isOpen && subs.length) {
      const subWrap = document.createElement('div');
      subWrap.className = 'nav-subs';
      subs.forEach(([sid, sub]) => {
        const isSubActive = currentProjectId === pid && currentSubProjectId === sid;
        const sCnt = Object.values(tasks).filter(t => t.subProjectId === sid).length;
        const sRow = document.createElement('div');
        sRow.className = `nav-sub-item ${isSubActive ? 'active' : ''}`;
        sRow.dataset.sid = sid;
        sRow.innerHTML = `
          <span class="material-symbols-outlined" style="font-size:12px;color:#c7c6ca;flex-shrink:0">subdirectory_arrow_right</span>
          <span class="nav-sub-label">${esc(sub.name)}</span>
          <span class="nav-cnt" style="font-size:9px">${sCnt}</span>
          <button class="nav-act-btn danger" data-act="del-sub" title="삭제" style="opacity:0;transition:opacity .1s">
            <span class="material-symbols-outlined" style="font-size:12px">close</span>
          </button>`;
        sRow.addEventListener('mouseenter', () => sRow.querySelector('[data-act="del-sub"]').style.opacity = '1');
        sRow.addEventListener('mouseleave', () => sRow.querySelector('[data-act="del-sub"]').style.opacity = '0');
        sRow.querySelector('.nav-sub-label').addEventListener('dblclick', e => {
          e.stopPropagation();
          inlineRename(e.target, sub.name, n => db.ref(`${DB_PATH}/subprojects/${sid}/name`).set(n));
        });
        sRow.addEventListener('click', e => {
          if (e.target.closest('[data-act="del-sub"]')) { deleteSubProject(sid, pid); return; }
          if (e.target.classList.contains('nav-sub-label') && e.target.isContentEditable) return;
          selectNav(pid, sid);
        });
        subWrap.appendChild(sRow);
      });
      wrap.appendChild(subWrap);
    }
    nav.appendChild(wrap);
  });

  // + 프로젝트 추가
  const addDiv = document.createElement('div');
  addDiv.style.padding = '4px 10px';
  addDiv.innerHTML = `<button class="nav-add-btn" onclick="addProject()">
    <span class="material-symbols-outlined" style="font-size:14px">add</span> 프로젝트 추가
  </button>`;
  nav.appendChild(addDiv);

  // DoE 섹션
  const doeDiv = document.createElement('div');
  doeDiv.innerHTML = `
    <div class="nav-divider"></div>
    <div class="nav-section">DoE 관리</div>
    <div class="nav-item ${currentProjectId==='__doe__'?'active':''}" style="cursor:pointer" onclick="selectNav('__doe__',null)">
      <span class="material-symbols-outlined nav-icon">science</span>
      <span class="nav-label">DoE 시트</span>
    </div>`;
  nav.appendChild(doeDiv);
}

// ── Sidebar actions ───────────────────────────────────────────────
function inlineRename(labelEl, original, onSave) {
  labelEl.contentEditable = 'true';
  labelEl.style.cssText += ';outline:1px solid #000;border-radius:2px;padding:0 3px;background:#fff';
  labelEl.focus();
  const r = document.createRange(); r.selectNodeContents(labelEl);
  window.getSelection().removeAllRanges(); window.getSelection().addRange(r);
  function done() {
    labelEl.contentEditable = 'false';
    labelEl.style.outline = ''; labelEl.style.background = '';
    const n = labelEl.textContent.trim();
    if (n && n !== original) onSave(n); else labelEl.textContent = original;
  }
  labelEl.addEventListener('blur', done, { once: true });
  labelEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); labelEl.blur(); }
    if (e.key === 'Escape') { labelEl.textContent = original; labelEl.blur(); }
  });
}

function toggleNavCollapse(pid) {
  const k = `nav:${pid}`; collapsed.has(k) ? collapsed.delete(k) : collapsed.add(k);
  renderSidebar();
}

function selectNav(pid, sid) {
  currentProjectId = pid; currentSubProjectId = sid;
  const bc = document.getElementById('ws-breadcrumb');
  if (bc) {
    if (!pid)              bc.textContent = 'ALL';
    else if (pid==='__doe__') bc.textContent = 'DoE 시트';
    else if (sid)          bc.textContent = `${projName(pid)} › ${subName(sid)}`;
    else                   bc.textContent = projName(pid);
  }
  renderSidebar(); renderTable();
}

function addProject() {
  const maxOrd = Object.values(projects).reduce((m,p) => Math.max(m, p.order||0), -1);
  const pid = newId('proj');
  db.ref(`${DB_PATH}/projects/${pid}`).set({ name: '새 프로젝트', order: maxOrd + 1 });
  setTimeout(() => {
    const el = document.querySelector(`.nav-item[data-pid="${pid}"] .nav-label`);
    if (el) inlineRename(el, '새 프로젝트', n => db.ref(`${DB_PATH}/projects/${pid}/name`).set(n));
  }, 250);
}

function addSubProject(pid) {
  collapsed.delete(`nav:${pid}`);
  const maxOrd = Object.values(subprojects).filter(s=>s.projectId===pid).reduce((m,s)=>Math.max(m,s.order||0),-1);
  const sid = newId('sub');
  db.ref(`${DB_PATH}/subprojects/${sid}`).set({ name: '새 서브프로젝트', projectId: pid, order: maxOrd+1 });
  setTimeout(() => {
    const el = document.querySelector(`.nav-sub-item[data-sid="${sid}"] .nav-sub-label`);
    if (el) inlineRename(el, '새 서브프로젝트', n => db.ref(`${DB_PATH}/subprojects/${sid}/name`).set(n));
  }, 250);
}

function deleteProject(pid) {
  const cnt = Object.values(tasks).filter(t=>t.projectId===pid).length;
  if (!confirm(`"${projName(pid)}" 프로젝트${cnt?` 및 하위 태스크 ${cnt}개`:''}를 삭제하시겠습니까?`)) return;
  db.ref(`${DB_PATH}/projects/${pid}`).remove();
  Object.entries(subprojects).filter(([,s])=>s.projectId===pid).forEach(([sid])=>db.ref(`${DB_PATH}/subprojects/${sid}`).remove());
  Object.entries(tasks).filter(([,t])=>t.projectId===pid).forEach(([tid])=>db.ref(`${DB_PATH}/tasks/${tid}`).remove());
  if (currentProjectId===pid) selectNav(null,null);
}

function deleteSubProject(sid, pid) {
  const cnt = Object.values(tasks).filter(t=>t.subProjectId===sid).length;
  if (!confirm(`"${subName(sid)}"${cnt?` 및 하위 태스크 ${cnt}개`:''}를 삭제하시겠습니까?`)) return;
  db.ref(`${DB_PATH}/subprojects/${sid}`).remove();
  Object.entries(tasks).filter(([,t])=>t.subProjectId===sid).forEach(([tid])=>db.ref(`${DB_PATH}/tasks/${tid}`).remove());
  if (currentSubProjectId===sid) selectNav(pid,null);
}

// ── Table render ──────────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('task-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (currentProjectId === '__doe__') {
    const doeTasks = Object.entries(tasks).filter(([,t])=>t.type==='doe'&&matchesFilter(t)).sort(([,a],[,b])=>(a.order||0)-(b.order||0));
    if (!doeTasks.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:#868380;font-size:13px">DoE 태스크가 없습니다.</td></tr>`;
    } else doeTasks.forEach(([id,t])=>tbody.appendChild(createTaskRow({id,...t},false)));
    return;
  }

  const sortedProjs = Object.entries(projects)
    .sort(([,a],[,b])=>(a.order||0)-(b.order||0))
    .filter(([pid])=>!currentProjectId || pid===currentProjectId);

  sortedProjs.forEach(([pid, proj]) => {
    const allProjTasks = Object.entries(tasks)
      .filter(([,t])=>t.projectId===pid)
      .map(([id,t])=>({id,...t}))
      .sort((a,b)=>(a.order||0)-(b.order||0));

    const subs = Object.entries(subprojects).filter(([,s])=>s.projectId===pid).sort(([,a],[,b])=>(a.order||0)-(b.order||0));
    const collKey = `p:${pid}`;
    const isColl  = collapsed.has(collKey);

    let visCount = 0;
    if (!currentSubProjectId) visCount += allProjTasks.filter(t=>!t.subProjectId&&matchesFilter(t)).length;
    subs.forEach(([sid]) => {
      if (currentSubProjectId && currentSubProjectId!==sid) return;
      visCount += allProjTasks.filter(t=>t.subProjectId===sid&&matchesFilter(t)).length;
    });

    const pRow = document.createElement('tr');
    pRow.className = 'project-row';
    pRow.innerHTML = `<td colspan="8"><div class="row-inner">
      <button class="toggle-btn" onclick="toggleCollapse('${collKey}')">
        <span class="material-symbols-outlined" style="font-size:16px">${isColl?'chevron_right':'expand_more'}</span>
      </button>
      <span class="material-symbols-outlined" style="font-size:16px;color:#46474a">folder_open</span>
      <span class="row-label">${esc(proj.name)}</span>
      <span class="row-count">${visCount}</span>
      <span style="flex:1"></span>
      <button class="add-row-btn" onclick="openAddModal('${pid}','')">
        <span class="material-symbols-outlined" style="font-size:14px">add</span> 항목 추가
      </button>
    </div></td>`;
    tbody.appendChild(pRow);
    if (isColl) return;

    // ungrouped
    if (!currentSubProjectId) {
      allProjTasks.filter(t=>!t.subProjectId&&matchesFilter(t)).forEach(t=>tbody.appendChild(createTaskRow(t,false)));
    }

    // sub groups
    subs.forEach(([sid, sub]) => {
      if (currentSubProjectId && currentSubProjectId!==sid) return;
      const gTasks = allProjTasks.filter(t=>t.subProjectId===sid&&matchesFilter(t));
      const gKey = `g:${pid}:${sid}`;
      const gColl = collapsed.has(gKey);

      const gRow = document.createElement('tr');
      gRow.className = 'group-row';
      gRow.innerHTML = `<td colspan="8"><div class="row-inner">
        <button class="toggle-btn" onclick="toggleCollapse('${gKey}')">
          <span class="material-symbols-outlined" style="font-size:15px">${gColl?'chevron_right':'expand_more'}</span>
        </button>
        <span class="row-label">${esc(sub.name)}</span>
        <span class="row-count">${gTasks.length}</span>
        <span style="flex:1"></span>
        <button class="add-row-btn" onclick="openAddModal('${pid}','${sid}')">
          <span class="material-symbols-outlined" style="font-size:14px">add</span> 항목 추가
        </button>
      </div></td>`;
      tbody.appendChild(gRow);
      if (!gColl) gTasks.forEach(t=>tbody.appendChild(createTaskRow(t,true)));
    });

    const addRow = document.createElement('tr');
    addRow.className = 'add-row';
    addRow.innerHTML = `<td colspan="8"><button class="add-row-btn" onclick="openAddModal('${pid}','')">
      <span class="material-symbols-outlined" style="font-size:14px">add</span> 그룹 없이 추가
    </button></td>`;
    tbody.appendChild(addRow);
  });
}

// ── createTaskRow ─────────────────────────────────────────────────
function createTaskRow(t, inGroup) {
  const si = statusInfo(t.status);
  const tr = document.createElement('tr');
  tr.className = `task-row ${inGroup?'in-group':'no-group'} ${t.id===selectedTaskId?'selected-task':''}`;
  tr.dataset.taskId = t.id;

  tr.innerHTML = `
    <td class="editable" data-field="actionItem" data-id="${t.id}">
      <div style="display:flex;align-items:flex-start;gap:6px">
        <span class="material-symbols-outlined" style="font-size:14px;color:#c7c6ca;margin-top:2px;flex-shrink:0">drag_indicator</span>
        <span class="cell-truncated" style="flex:1" title="${esc(t.actionItem)}">${esc(t.actionItem)}</span>
      </div>
    </td>
    <td class="ref-cell editable has-tooltip" data-field="refDetails" data-id="${t.id}">
      ${t.refDetails?`<span class="cell-truncated">${esc(t.refDetails.split('\n')[0])}${t.refDetails.includes('\n')?'…':''}</span><span class="tooltip-text">${esc(t.refDetails)}</span>`:'<span style="color:#c7c6ca">—</span>'}
    </td>
    <td class="assignees-cell editable" data-field="assignees" data-id="${t.id}">${esc(fmtAssignees(t.assignees))}</td>
    <td class="nbd-cell editable ${deadlineClass(t.nbd)}" data-field="nbd" data-id="${t.id}">${esc(t.nbd)||'TBD'}</td>
    <td><span class="status-badge ${si.cls}" onclick="openStatusPicker('${t.id}',this)">${si.label}</span></td>
    <td class="update-cell editable" data-field="latestUpdate" data-id="${t.id}">${esc(t.latestUpdate)||'<span style="color:#c7c6ca">—</span>'}</td>
    <td class="log-cell">${t.updateLog?`<span class="cell-truncated" style="font-size:11px;color:#76777b">${esc(t.updateLog.split('\n')[0])}</span>`:'<span style="color:#c7c6ca">—</span>'}</td>
    <td><div class="row-actions">
      <button class="action-btn" title="상세" onclick="openDetail('${t.id}')"><span class="material-symbols-outlined" style="font-size:16px">open_in_new</span></button>
      <button class="action-btn" title="삭제" onclick="deleteTask('${t.id}')"><span class="material-symbols-outlined" style="font-size:16px">delete</span></button>
    </div></td>`;

  tr.querySelectorAll('td.editable').forEach(cell => {
    const field = cell.dataset.field, id = cell.dataset.id;
    cell.addEventListener('click', e => {
      if (cell.querySelector('input,textarea')) return;
      e.stopPropagation();
      const val = tasks[id]?.[field] || '';
      const multi = ['refDetails','assignees','updateLog'].includes(field);

      function done(newVal) {
        activeEditCell = null;
        if (newVal !== val) updateTask(id, field, newVal);
        else { if (pendingRemoteRender) { pendingRemoteRender = false; } renderTable(); }
      }
      activeEditCell = { taskId:id, field };

      if (multi) {
        const ta = document.createElement('textarea');
        ta.className = 'cell-textarea'; ta.value = val;
        cell.innerHTML = ''; cell.appendChild(ta); ta.focus();
        ta.addEventListener('blur', ()=>done(ta.value));
        ta.addEventListener('keydown', e2=>{ if(e2.key==='Escape'){activeEditCell=null;renderTable();} });
      } else {
        const inp = document.createElement('input');
        inp.className = 'cell-input'; inp.value = val;
        cell.innerHTML = ''; cell.appendChild(inp); inp.focus(); inp.select();
        inp.addEventListener('blur', ()=>done(inp.value));
        inp.addEventListener('keydown', e2=>{
          if(e2.key==='Enter') inp.blur();
          if(e2.key==='Escape'){activeEditCell=null;renderTable();}
        });
      }
    });
  });
  return tr;
}

// ── Status picker ─────────────────────────────────────────────────
function openStatusPicker(taskId, badge) {
  document.getElementById('status-picker')?.remove();
  const picker = document.createElement('div');
  picker.id = 'status-picker';
  picker.style.cssText = 'position:fixed;background:#fff;border:1px solid #c7c6ca;border-radius:4px;padding:6px;box-shadow:0 4px 12px rgba(0,0,0,.12);z-index:300;display:flex;flex-direction:column;gap:3px;min-width:110px';
  const r = badge.getBoundingClientRect();
  picker.style.top = (r.bottom+4)+'px'; picker.style.left = r.left+'px';
  STATUS_LIST.forEach(s => {
    const btn = document.createElement('button');
    btn.style.cssText = 'border:none;background:transparent;cursor:pointer;padding:4px 6px;border-radius:2px;font-family:inherit';
    btn.innerHTML = `<span class="status-badge ${s.cls}">${s.label}</span>`;
    btn.onmouseenter = ()=>btn.style.background='#f7f3f2';
    btn.onmouseleave = ()=>btn.style.background='transparent';
    btn.onclick = ()=>{ updateTask(taskId,'status',s.key); picker.remove(); };
    picker.appendChild(btn);
  });
  document.body.appendChild(picker);
  setTimeout(()=>document.addEventListener('click', function h(e){
    if(!picker.contains(e.target)){picker.remove();document.removeEventListener('click',h);}
  }), 0);
}

// ── CRUD ─────────────────────────────────────────────────────────
function updateTask(id, field, value) {
  db.ref(`${DB_PATH}/tasks/${id}`).update({ [field]: value, updatedAt: Date.now() });
}
function deleteTask(id) {
  if (!confirm('이 항목을 삭제하시겠습니까?')) return;
  db.ref(`${DB_PATH}/tasks/${id}`).remove();
  if (selectedTaskId===id) closeDetail();
}
function addTask(data) {
  const siblings = Object.values(tasks).filter(t=>t.projectId===data.projectId&&t.subProjectId===data.subProjectId);
  const maxOrd = siblings.reduce((m,t)=>Math.max(m,t.order||0),-1);
  db.ref(`${DB_PATH}/tasks/${newId('task')}`).set({...data, order:maxOrd+1, createdAt:Date.now(), updatedAt:Date.now()});
}

function toggleCollapse(key) { collapsed.has(key)?collapsed.delete(key):collapsed.add(key); renderTable(); }

// ── Add modal ─────────────────────────────────────────────────────
function openAddModal(projectId, subProjectId) {
  addModalCtx = { projectId, subProjectId };
  const projSel = document.getElementById('add-project');
  projSel.innerHTML = Object.entries(projects)
    .sort(([,a],[,b])=>(a.order||0)-(b.order||0))
    .map(([pid,p])=>`<option value="${pid}"${pid===projectId?' selected':''}>${esc(p.name)}</option>`).join('');
  fillSubSel(projectId, subProjectId);
  projSel.onchange = ()=>fillSubSel(projSel.value,'');
  ['add-action','add-ref','add-assignees','add-nbd','add-update','add-log'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('add-status').value = 'Not Started';
  document.getElementById('modal-overlay').classList.remove('hidden');
  setTimeout(()=>document.getElementById('add-action').focus(), 50);
}
function fillSubSel(pid, selectedSid) {
  const sel = document.getElementById('add-group');
  const subs = Object.entries(subprojects).filter(([,s])=>s.projectId===pid).sort(([,a],[,b])=>(a.order||0)-(b.order||0));
  sel.innerHTML = `<option value="">없음 (그룹 없이)</option>` +
    subs.map(([sid,s])=>`<option value="${sid}"${sid===selectedSid?' selected':''}>${esc(s.name)}</option>`).join('');
}
function closeAddModal() { document.getElementById('modal-overlay').classList.add('hidden'); addModalCtx=null; }
function confirmAdd() {
  const pid = document.getElementById('add-project').value;
  const sid = document.getElementById('add-group').value;
  const action = document.getElementById('add-action').value.trim();
  if (!pid||!action) { document.getElementById('add-action').focus(); return; }
  addTask({ projectId:pid, subProjectId:sid,
    actionItem:   action,
    refDetails:   document.getElementById('add-ref').value.trim(),
    assignees:    document.getElementById('add-assignees').value.trim(),
    nbd:          document.getElementById('add-nbd').value.trim()||'TBD',
    status:       document.getElementById('add-status').value,
    latestUpdate: document.getElementById('add-update').value.trim(),
    updateLog:    document.getElementById('add-log').value.trim(),
  });
  closeAddModal();
}

// ── Detail panel ──────────────────────────────────────────────────
function openDetail(id) { selectedTaskId=id; renderDetail(); document.getElementById('detail-panel').classList.add('open'); renderTable(); }
function closeDetail()  { selectedTaskId=null; document.getElementById('detail-panel').classList.remove('open'); }

function renderDetail() {
  const t = tasks[selectedTaskId]; if (!t) return;
  const si = statusInfo(t.status);
  const panel = document.getElementById('detail-panel');
  const id = selectedTaskId;
  panel.innerHTML = `
    <div class="detail-header">
      <div class="detail-title">${esc(t.actionItem)}</div>
      <button class="detail-close" onclick="closeDetail()"><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="detail-field"><div class="detail-field-label">프로젝트</div>
      <div class="detail-field-value">${esc(projName(t.projectId))}${t.subProjectId?' › '+esc(subName(t.subProjectId)):''}</div></div>
    <div class="detail-field"><div class="detail-field-label">Status</div>
      <div class="detail-field-value"><span class="status-badge ${si.cls}" onclick="openStatusPicker('${id}',this)">${si.label}</span></div></div>
    <div class="detail-field"><div class="detail-field-label">담당자</div>
      <div class="detail-field-value editable" data-field="assignees" data-id="${id}" style="white-space:pre-wrap">${esc(t.assignees)||'—'}</div></div>
    <div class="detail-field"><div class="detail-field-label">NBD</div>
      <div class="detail-field-value editable ${deadlineClass(t.nbd)}" data-field="nbd" data-id="${id}">${esc(t.nbd)||'TBD'}</div></div>
    <div class="detail-field"><div class="detail-field-label">Action Item</div>
      <div class="detail-field-value editable" data-field="actionItem" data-id="${id}">${esc(t.actionItem)||'—'}</div></div>
    <div class="detail-field"><div class="detail-field-label">Reference Details</div>
      <div class="detail-field-value editable" data-field="refDetails" data-id="${id}" style="white-space:pre-wrap">${esc(t.refDetails)||'—'}</div></div>
    <div class="detail-field"><div class="detail-field-label">Latest Update</div>
      <div class="detail-field-value editable" data-field="latestUpdate" data-id="${id}">${esc(t.latestUpdate)||'—'}</div></div>
    <div class="detail-field"><div class="detail-field-label">Update Log</div>
      <div class="detail-field-value editable" data-field="updateLog" data-id="${id}" style="white-space:pre-wrap">${esc(t.updateLog)||'—'}</div></div>
    <div class="detail-field" style="padding-bottom:20px"><div class="detail-field-label" style="margin-bottom:6px">메타데이터</div>
      <div style="font-size:11px;color:#76777b">생성: ${t.createdAt?new Date(t.createdAt).toLocaleDateString('ko-KR'):'—'}</div>
      <div style="font-size:11px;color:#76777b">수정: ${t.updatedAt?new Date(t.updatedAt).toLocaleDateString('ko-KR'):'—'}</div>
    </div>`;

  panel.querySelectorAll('.detail-field-value.editable').forEach(el => {
    const field=el.dataset.field, did=el.dataset.id;
    const multi=['refDetails','assignees','updateLog'].includes(field);
    el.addEventListener('click', ()=>{
      if (el.querySelector('input,textarea')) return;
      const val=tasks[did]?.[field]||'';
      function done(nv){activeEditCell=null;if(nv!==val)updateTask(did,field,nv);else{if(pendingRemoteRender){pendingRemoteRender=false;renderTable();}renderDetail();}}
      activeEditCell={taskId:did,field};
      if(multi){const ta=document.createElement('textarea');ta.className='cell-textarea';ta.value=val;el.innerHTML='';el.appendChild(ta);ta.focus();ta.addEventListener('blur',()=>done(ta.value));ta.addEventListener('keydown',e=>{if(e.key==='Escape'){activeEditCell=null;renderDetail();}});}
      else{const inp=document.createElement('input');inp.className='cell-input';inp.value=val;el.innerHTML='';el.appendChild(inp);inp.focus();inp.select();inp.addEventListener('blur',()=>done(inp.value));inp.addEventListener('keydown',e=>{if(e.key==='Enter')inp.blur();if(e.key==='Escape'){activeEditCell=null;renderDetail();}});}
    });
  });
}

function renderDetailRemote() {
  if (!selectedTaskId) return;
  const t=tasks[selectedTaskId]; if(!t){closeDetail();return;}
  document.getElementById('detail-panel').querySelectorAll('.detail-field-value[data-field]').forEach(el=>{
    if(el.querySelector('input,textarea')||el.dataset.field==='status') return;
    el.textContent=t[el.dataset.field]||'—';
  });
}

// ── Summary ───────────────────────────────────────────────────────
function updateSummary() {
  const all=Object.values(tasks);
  const cnt={'Completed':0,'In Progress':0,'Delayed':0,'On Hold':0,'Not Started':0};
  all.forEach(t=>{cnt[t.status]=(cnt[t.status]||0)+1;});
  const total=all.length||1;
  const pb=document.getElementById('progress-bar-wrap');
  if(pb) pb.innerHTML=`<div class="pb-completed" style="width:${cnt['Completed']/total*100}%"></div><div class="pb-inprogress" style="width:${cnt['In Progress']/total*100}%"></div><div class="pb-delayed" style="width:${cnt['Delayed']/total*100}%"></div><div class="pb-onhold" style="width:${cnt['On Hold']/total*100}%"></div>`;
  const chips=document.getElementById('summary-chips');
  if(chips) chips.innerHTML=`
    <span class="chip" style="background:#d1fae5;color:#065f46">완료 ${cnt['Completed']}</span>
    <span class="chip" style="background:#dbeafe;color:#1d4ed8">진행 ${cnt['In Progress']}</span>
    <span class="chip" style="background:#fee2e2;color:#991b1b">지연 ${cnt['Delayed']}</span>
    <span class="chip" style="background:#f1edec;color:#46474a">미시작 ${cnt['Not Started']}</span>
    <span class="chip" style="background:#fef3c7;color:#92400e">보류 ${cnt['On Hold']}</span>`;
}

// ── Export ────────────────────────────────────────────────────────
function exportExcel() {
  if(typeof XLSX==='undefined'){alert('잠시 후 다시 시도해주세요.');return;}
  const rows=[['프로젝트','서브프로젝트','액션 아이템','Reference Details','담당자','NBD','Status','최근 업데이트','Update Log']];
  Object.entries(projects).sort(([,a],[,b])=>(a.order||0)-(b.order||0)).forEach(([pid,p])=>{
    Object.values(tasks).filter(t=>t.projectId===pid).sort((a,b)=>(a.order||0)-(b.order||0))
      .forEach(t=>rows.push([p.name,t.subProjectId?subName(t.subProjectId):'',t.actionItem,t.refDetails,t.assignees,t.nbd,t.status,t.latestUpdate,t.updateLog]));
  });
  const wb=XLSX.utils.book_new();
  const ws=XLSX.utils.aoa_to_sheet(rows);
  ws['!cols']=[{wch:14},{wch:22},{wch:40},{wch:40},{wch:20},{wch:12},{wch:14},{wch:12},{wch:40}];
  XLSX.utils.book_append_sheet(wb,ws,'Tasks');
  XLSX.writeFile(wb,`BLACKONYX_${new Date().toISOString().slice(0,10)}.xlsx`);
}
function exportPDF(){window.print();}

// ── Events ────────────────────────────────────────────────────────
function setupEvents() {
  document.getElementById('search-input').addEventListener('input',e=>{searchTerm=e.target.value;renderTable();});
  document.getElementById('filter-status').addEventListener('change',e=>{filterStatus=e.target.value;renderTable();});
  document.getElementById('modal-overlay').addEventListener('click',e=>{if(e.target.id==='modal-overlay')closeAddModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeAddModal();closeDetail();}});
  document.getElementById('nav-all').addEventListener('click',()=>{currentProjectId=null;currentSubProjectId=null;document.getElementById('ws-breadcrumb').textContent='ALL';renderSidebar();renderTable();});
  document.getElementById('btn-export-excel').addEventListener('click',exportExcel);
  document.getElementById('btn-export-pdf').addEventListener('click',exportPDF);
  document.getElementById('btn-add-task').addEventListener('click',()=>{
    const pid=currentProjectId&&currentProjectId!=='__doe__'?currentProjectId:(Object.keys(projects)[0]||'');
    openAddModal(pid, currentSubProjectId||'');
  });
  document.getElementById('btn-confirm-add').addEventListener('click',confirmAdd);
  document.getElementById('btn-cancel-add').addEventListener('click',closeAddModal);
  document.getElementById('add-action').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))confirmAdd();});
}

init();
