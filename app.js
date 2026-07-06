// ================================================================
//  BLACKONYX R&D Dashboard
// ================================================================

const DB_PATH = 'blackonyx-pm';

const STATUS_LIST = [
  { key: 'Not Started', label: '미시작',   cls: 's-not-started' },
  { key: 'In Progress', label: '진행중',   cls: 's-in-progress'  },
  { key: 'Completed',   label: '완료',     cls: 's-completed'    },
  { key: 'Delayed',     label: '지연',     cls: 's-delayed'      },
  { key: 'On Hold',     label: '보류',     cls: 's-on-hold'      },
];

const PROJECT_ICONS = { 'Blackonyx': 'science', 'Bi-layer': 'layers', 'PVD': 'memory' };
const PROJECT_ORDER = ['Blackonyx', 'Bi-layer', 'PVD'];
const GROUP_ORDER = {
  'Blackonyx': [],
  'Bi-layer': ['Al2O3 + YOF', 'ANO + YOF', 'Y2O3', 'Bi-layer Al2O3 신규 Spec'],
  'PVD': []
};

const SEED_TASKS = [
  { project:'Blackonyx', group:'', actionItem:'DoE 1-9번까지 Final 세정하여 고객사에 쿠폰 송부', refDetails:'Final 세정 필요\n영업팀 전달', assignees:'박혜근 선임', nbd:'2026-07-08', status:'In Progress', latestUpdate:'2026-07-06', updateLog:'2026.07.06 - 쿠폰 고객 송부 예정 (~7/8)', order:0 },
  { project:'Blackonyx', group:'', actionItem:'DoE 9 쿠폰 코팅 진행', refDetails:'Spray distance 110mm, Carrier gas 3.5LPM', assignees:'김준탁 팀장\n박성환 책임\n신주영 선임', nbd:'2026-07-02', status:'Not Started', latestUpdate:'', updateLog:'', order:1 },
  { project:'Blackonyx', group:'', actionItem:'XRD/Top-down EDS 분석 및 결과 송부', refDetails:'', assignees:'석혜원 수석\n채정민 책임', nbd:'2026-07-03', status:'Completed', latestUpdate:'2026-07-03', updateLog:'2026.07.03 - 분석 결과 공유 완료', order:2 },
  { project:'Blackonyx', group:'', actionItem:'DoE 결정 후 Dummy Cathode 코팅', refDetails:'', assignees:'김준탁 팀장\n사공정 책임\n박성환 책임\n신주영 선임', nbd:'2026-07-07', status:'In Progress', latestUpdate:'2026-07-06', updateLog:'2026.07.06 - DOE 1로 코팅 진행 고객사 컨펌 완료', order:3 },
  { project:'Blackonyx', group:'', actionItem:'Dummy Cathode cutting 후 분석 진행', refDetails:'XRD, Top-down EDS, Cross-section', assignees:'석혜원 수석\n채정민 책임', nbd:'2026-07-15', status:'Not Started', latestUpdate:'', updateLog:'', order:4 },
  { project:'Blackonyx', group:'', actionItem:'실 제품 코팅 및 F/clean 진행', refDetails:'', assignees:'김준탁 팀장\n사공정 책임\n박성환 책임\n신주영 선임', nbd:'2026-07-27', status:'Not Started', latestUpdate:'', updateLog:'', order:5 },
  { project:'Blackonyx', group:'', actionItem:'1 liner set 납품', refDetails:'', assignees:'박혜근 선임', nbd:'2026-07-28', status:'Not Started', latestUpdate:'', updateLog:'', order:6 },
  { project:'Bi-layer', group:'Al2O3 + YOF', actionItem:'Hardmask 제작 관련 일정', refDetails:'고객사와 Concept 논의 후 제작 시작\nTermination쪽의 coating layer는 자연스럽게 tapering 되도록 설계', assignees:'김준탁 팀장\n박성환 책임\n신주영 선임', nbd:'TBD', status:'In Progress', latestUpdate:'', updateLog:'', order:0 },
  { project:'Bi-layer', group:'Al2O3 + YOF', actionItem:'Saint-Goban powder, heating jacket 설치 후 Feeding test 진행', refDetails:'- Heating jacket 평가에 앞서 파우더 110℃ 열처리 후 피딩 평가 선진행 예정\n- 고객사 추가 구매 요청 Al2O3 #195(12~38㎛)의 파우더 견적 및 납품 가능 업체 확인 중', assignees:'김준탁 팀장\n구자춘 책임\n박성환 책임', nbd:'TBD', status:'In Progress', latestUpdate:'2026-07-03', updateLog:'2026.07.06 - Heating jacket 견적 및 보유 재고 확인 완료', order:1 },
  { project:'Bi-layer', group:'Al2O3 + YOF', actionItem:'Sumitomo powder ICP-OES 분석', refDetails:'- 분석 결과에 모든 원소에 대한 측정값 나열 필요', assignees:'채정민 책임', nbd:'TBD', status:'In Progress', latestUpdate:'', updateLog:'', order:2 },
  { project:'Bi-layer', group:'ANO + YOF', actionItem:'Sym 3 kit 도면 검토', refDetails:'- Ano 영역 관련 도면 지정 스펙 확인', assignees:'김준탁 팀장\n유종수 책임\n박성환 책임\n신주영 선임', nbd:'2026-07-10', status:'In Progress', latestUpdate:'2026-07-03', updateLog:'2026.07.03 - 전면 Ano Sym3 kit (4 parts) 도면 검토 중', order:0 },
  { project:'Bi-layer', group:'ANO + YOF', actionItem:'SLD, Screen racking area 재검토', refDetails:'SLD\n   1)가운데 부분 모서리로부터 3mm racking\n   2)파트 뒷 면 양쪽 Tap 이용\nScreen\n   1) Bare 면으로 유지되는 카운터싱크 적용 가능 Fixture 개발', assignees:'김준탁 팀장\n유종수 책임', nbd:'TBD', status:'Not Started', latestUpdate:'', updateLog:'', order:1 },
  { project:'Bi-layer', group:'ANO + YOF', actionItem:'Fixture re-design', refDetails:'SLD, Screen 제품의 Ano 진행을 위한 racking area 검토하여 고객 논의 후 제작 필요', assignees:'김준탁 팀장\n박성환 책임\n신주영 선임', nbd:'TBD', status:'Not Started', latestUpdate:'', updateLog:'', order:2 },
  { project:'Bi-layer', group:'ANO + YOF', actionItem:'Dummy cathode에서 termination 구간(2.5mm)에 Ra 값 측정', refDetails:'- Racking area 및 Fixture concept 확정 후 제작 필요', assignees:'김준탁 팀장\n박성환 책임', nbd:'TBD', status:'Not Started', latestUpdate:'', updateLog:'', order:3 },
  { project:'Bi-layer', group:'ANO + YOF', actionItem:'Ano+YOF kit shipping', refDetails:'7월 말 불가능시 고객 논의하여 연장 예정', assignees:'조요한 선임', nbd:'2026-07-31', status:'Not Started', latestUpdate:'', updateLog:'', order:4 },
  { project:'Bi-layer', group:'ANO + YOF', actionItem:'쿠폰 코팅 후 ICP-MS 측정', refDetails:'Bead → Ano → ICP-MS → YOF → ICP-MS\nNon-Bead(Bare) → Ano → ICP-MS', assignees:'김준탁 팀장\n배진한 책임', nbd:'TBD', status:'Not Started', latestUpdate:'', updateLog:'', order:5 },
  { project:'Bi-layer', group:'Y2O3', actionItem:'Y2O3 Powder 수급 방안', refDetails:'', assignees:'지영연 부문장\n채정민 책임', nbd:'TBD', status:'Not Started', latestUpdate:'', updateLog:'', order:0 },
  { project:'Bi-layer', group:'Bi-layer Al2O3 신규 Spec', actionItem:'Coupon 송부', refDetails:'PS ALO (Al2O3 only) : 10ea\nAl2O3+YOF : 10ea\nAno+YOF : 10ea', assignees:'조요한 선임\n채승헌 선임', nbd:'2026-07-16', status:'Not Started', latestUpdate:'', updateLog:'', order:0 },
  { project:'Bi-layer', group:'Bi-layer Al2O3 신규 Spec', actionItem:'Data Sheet 작성', refDetails:'', assignees:'김준탁 팀장\n석혜원 수석\n채정민 책임', nbd:'TBD', status:'Not Started', latestUpdate:'', updateLog:'', order:1 },
  { project:'PVD', group:'', actionItem:'MgF2 코팅 쿠폰 송부', refDetails:'', assignees:'채승헌 선임', nbd:'2026-07-08', status:'Not Started', latestUpdate:'', updateLog:'', order:0 },
  { project:'PVD', group:'', actionItem:'고객사에서 쿠폰 분석 후 PVD 2호기로 AlN Heater에 코팅 진행 예정', refDetails:'', assignees:'이주혁 책임', nbd:'TBD', status:'Not Started', latestUpdate:'', updateLog:'', order:1 },
  { project:'PVD', group:'', actionItem:'PVD 3호기로 Lid 제품 코팅 및 세정 후 고객 납품', refDetails:'', assignees:'이주혁 책임\n채승헌 선임', nbd:'2026-07-10', status:'Not Started', latestUpdate:'', updateLog:'', order:2 },
  { project:'PVD', group:'', actionItem:'PVD 3호기로 결정질 개발 계획 및 progress 주기적인 고객 공유', refDetails:'', assignees:'이주혁 책임\n채승헌 선임', nbd:'2026-10-31', status:'Not Started', latestUpdate:'', updateLog:'', order:3 },
];

// ── State ────────────────────────────────────────────────────────
let db;
let tasks = {};
let collapsed = new Set();
let currentProject = null;  // null = show all
let filterStatus = '';
let searchTerm = '';
let currentView = 'list';   // 'list' | 'tree'
let addModalContext = null; // { project, group }
let selectedTaskId = null;

// 동시편집 보호: 현재 내가 편집 중인 셀 추적
let activeEditCell = null;  // { taskId, field, el }
let pendingRemoteRender = false;

// ── Init ─────────────────────────────────────────────────────────
let _seeded = false;
let _connectTimer;

function showLoadError(msg) {
  const tbody = document.getElementById('task-tbody');
  if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:48px;color:#ef4444;font-size:13px;line-height:2">
    ⚠ ${msg}<br>
    <small style="color:#76777b;font-size:11px">Firebase Console → Realtime Database → Rules →
    <code style="background:#f1edec;padding:1px 5px;border-radius:2px">.read: true, .write: true</code> 로 변경 후 게시</small>
  </td></tr>`;
}

function init() {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();

  // 6초 안에 응답 없으면 타임아웃 에러 표시
  _connectTimer = setTimeout(() => {
    showLoadError('Firebase 연결 시간 초과 — Database Rules를 확인하세요.');
  }, 6000);

  db.ref(`${DB_PATH}/tasks`).on('value', snap => {
    clearTimeout(_connectTimer);
    tasks = snap.val() || {};

    // 최초 1회만: 데이터 없으면 시드 삽입
    if (!_seeded) {
      _seeded = true;
      if (!snap.val()) { seedData(); return; }
    }

    if (activeEditCell) {
      pendingRemoteRender = true;
    } else {
      renderTable();
    }
    updateSummary();
    if (selectedTaskId) renderDetailRemote();

  }, err => {
    // Firebase 규칙 거부 또는 네트워크 에러
    clearTimeout(_connectTimer);
    showLoadError(`Firebase 접근 거부 (${err.code}) — Database Rules를 확인하세요.`);
  });

  setupEvents();
}

function seedData() {
  const batch = {};
  SEED_TASKS.forEach((t, i) => {
    const id = 'task_' + (Date.now() + i).toString(36);
    batch[id] = { ...t, createdAt: Date.now(), updatedAt: Date.now() };
  });
  db.ref(`${DB_PATH}/tasks`).set(batch);
}

// ── Helpers ──────────────────────────────────────────────────────
function esc(s) { return String(s || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function statusInfo(key) { return STATUS_LIST.find(s => s.key === key) || STATUS_LIST[0]; }

function deadlineClass(nbd) {
  if (!nbd || nbd === 'TBD' || nbd === '') return '';
  const d = new Date(nbd), now = new Date();
  now.setHours(0,0,0,0);
  const diff = (d - now) / 86400000;
  if (diff < 0)  return 'deadline-overdue';
  if (diff <= 3) return 'deadline-soon';
  if (diff <= 7) return 'deadline-ok';
  return '';
}

function formatAssignees(str) {
  if (!str) return '—';
  return str.split('\n').map(s => s.trim()).filter(Boolean).join(', ');
}

function getTasksByProject() {
  const result = {};
  Object.entries(tasks).forEach(([id, t]) => {
    if (!result[t.project]) result[t.project] = [];
    result[t.project].push({ id, ...t });
  });
  Object.values(result).forEach(arr => arr.sort((a,b) => (a.order||0)-(b.order||0)));
  return result;
}

function matchesFilter(t) {
  if (filterStatus && t.status !== filterStatus) return false;
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    return (t.actionItem||'').toLowerCase().includes(q)
        || (t.assignees||'').toLowerCase().includes(q)
        || (t.refDetails||'').toLowerCase().includes(q)
        || (t.updateLog||'').toLowerCase().includes(q);
  }
  return true;
}

// ── Render ───────────────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('task-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const byProject = getTasksByProject();
  const projects = currentProject ? [currentProject] : PROJECT_ORDER;

  projects.forEach(proj => {
    const projTasks = byProject[proj] || [];
    const collKey = `p:${proj}`;
    const isCollapsed = collapsed.has(collKey);

    // Count visible tasks
    const visible = projTasks.filter(matchesFilter);

    // Project header
    const pRow = document.createElement('tr');
    pRow.className = 'project-row';
    pRow.innerHTML = `
      <td colspan="8">
        <div class="row-inner">
          <button class="toggle-btn" onclick="toggleCollapse('${collKey}')">
            <span class="material-symbols-outlined" style="font-size:16px">${isCollapsed ? 'chevron_right' : 'expand_more'}</span>
          </button>
          <span class="material-symbols-outlined" style="font-size:16px;color:#46474a">${PROJECT_ICONS[proj]||'folder'}</span>
          <span class="row-label">${esc(proj)}</span>
          <span class="row-count">${visible.length}</span>
          <span style="flex:1"></span>
          <button class="add-row-btn" onclick="openAddModal('${proj}','')">
            <span class="material-symbols-outlined" style="font-size:14px">add</span> 항목 추가
          </button>
        </div>
      </td>`;
    tbody.appendChild(pRow);

    if (isCollapsed) return;

    // Group tasks
    const groups = GROUP_ORDER[proj] || [];
    const byGroup = {};
    const ungrouped = [];
    projTasks.forEach(t => {
      if (t.group) { if(!byGroup[t.group]) byGroup[t.group]=[]; byGroup[t.group].push(t); }
      else ungrouped.push(t);
    });

    // Ungrouped tasks
    ungrouped.filter(matchesFilter).forEach(t => {
      tbody.appendChild(createTaskRow(t, false));
    });

    // Groups
    const allGroups = [...groups, ...Object.keys(byGroup).filter(g => !groups.includes(g))];
    allGroups.forEach(group => {
      const gtasks = (byGroup[group] || []).filter(matchesFilter);
      if (gtasks.length === 0 && !byGroup[group]) return;
      const gKey = `g:${proj}:${group}`;
      const gCol = collapsed.has(gKey);

      const gRow = document.createElement('tr');
      gRow.className = 'group-row';
      gRow.innerHTML = `
        <td colspan="8">
          <div class="row-inner">
            <button class="toggle-btn" onclick="toggleCollapse('${gKey}')">
              <span class="material-symbols-outlined" style="font-size:15px">${gCol ? 'chevron_right' : 'expand_more'}</span>
            </button>
            <span class="row-label">${esc(group)}</span>
            <span class="row-count" style="font-size:10px;color:#868380;margin-left:4px">${gtasks.length}</span>
            <span style="flex:1"></span>
            <button class="add-row-btn" onclick="openAddModal('${proj}','${group}')">
              <span class="material-symbols-outlined" style="font-size:14px">add</span> 항목 추가
            </button>
          </div>
        </td>`;
      tbody.appendChild(gRow);

      if (!gCol) {
        gtasks.forEach(t => tbody.appendChild(createTaskRow(t, true)));
      }
    });

    // Add-group row
    const agRow = document.createElement('tr');
    agRow.className = 'add-row';
    agRow.innerHTML = `<td colspan="8"><button class="add-row-btn" onclick="openAddModal('${proj}','')">
      <span class="material-symbols-outlined" style="font-size:14px">add</span> 그룹 없이 추가
    </button></td>`;
    tbody.appendChild(agRow);
  });
}

function createTaskRow(t, inGroup) {
  const si = statusInfo(t.status);
  const dlCls = deadlineClass(t.nbd);
  const assignDisplay = formatAssignees(t.assignees);
  const isSelected = t.id === selectedTaskId;

  const tr = document.createElement('tr');
  tr.className = `task-row ${inGroup ? 'in-group' : 'no-group'} ${isSelected ? 'selected-task' : ''}`;
  tr.dataset.taskId = t.id;

  tr.innerHTML = `
    <td class="editable" data-field="actionItem" data-id="${t.id}">
      <div style="display:flex;align-items:flex-start;gap:6px">
        <span class="material-symbols-outlined" style="font-size:14px;color:#c7c6ca;margin-top:2px;flex-shrink:0">drag_indicator</span>
        <span class="cell-truncated" style="flex:1" title="${esc(t.actionItem)}">${esc(t.actionItem)}</span>
      </div>
    </td>
    <td class="ref-cell editable cell-truncated has-tooltip" data-field="refDetails" data-id="${t.id}">
      ${t.refDetails ? `<span class="cell-truncated">${esc(t.refDetails.split('\n')[0])}${t.refDetails.includes('\n')?'…':''}</span><span class="tooltip-text">${esc(t.refDetails)}</span>` : '<span style="color:#c7c6ca">—</span>'}
    </td>
    <td class="assignees-cell editable" data-field="assignees" data-id="${t.id}">${esc(assignDisplay)||'<span style="color:#c7c6ca">—</span>'}</td>
    <td class="nbd-cell editable ${dlCls}" data-field="nbd" data-id="${t.id}">${esc(t.nbd)||'TBD'}</td>
    <td data-field="status" data-id="${t.id}">
      <span class="status-badge ${si.cls}" onclick="openStatusPicker('${t.id}', this)">${si.label}</span>
    </td>
    <td class="update-cell editable" data-field="latestUpdate" data-id="${t.id}">${esc(t.latestUpdate)||'<span style="color:#c7c6ca">—</span>'}</td>
    <td class="log-cell" style="max-width:180px">
      ${t.updateLog ? `<span class="cell-truncated" style="font-size:11px;color:#76777b">${esc(t.updateLog.split('\n')[0])}</span>` : '<span style="color:#c7c6ca">—</span>'}
    </td>
    <td>
      <div class="row-actions">
        <button class="action-btn" title="상세 보기" onclick="openDetail('${t.id}')">
          <span class="material-symbols-outlined" style="font-size:16px">open_in_new</span>
        </button>
        <button class="action-btn" title="삭제" onclick="deleteTask('${t.id}')">
          <span class="material-symbols-outlined" style="font-size:16px">delete</span>
        </button>
      </div>
    </td>`;

  // Inline editing for text cells
  tr.querySelectorAll('[data-field]').forEach(cell => {
    const field = cell.dataset.field;
    const id = cell.dataset.id;
    if (!cell.classList.contains('editable')) return;

    cell.addEventListener('click', e => {
      if (cell.querySelector('input,textarea')) return;
      e.stopPropagation();

      const val = tasks[id]?.[field] || '';
      const isMultiline = ['refDetails','assignees','updateLog'].includes(field);

      function finishEdit(newVal, save) {
        activeEditCell = null;
        if (save && newVal !== val) {
          updateTask(id, field, newVal);
        } else {
          // 편집 끝난 후 보류됐던 리모트 변경 반영
          if (pendingRemoteRender) { pendingRemoteRender = false; renderTable(); }
          else renderTable();
        }
      }

      activeEditCell = { taskId: id, field };

      if (isMultiline) {
        const ta = document.createElement('textarea');
        ta.className = 'cell-textarea';
        ta.value = val;
        cell.innerHTML = '';
        cell.appendChild(ta);
        ta.focus();
        ta.addEventListener('blur', () => finishEdit(ta.value, true));
        ta.addEventListener('keydown', e2 => {
          if (e2.key === 'Escape') finishEdit(val, false);
        });
      } else {
        const inp = document.createElement('input');
        inp.className = 'cell-input';
        inp.value = val;
        cell.innerHTML = '';
        cell.appendChild(inp);
        inp.focus(); inp.select();
        inp.addEventListener('blur', () => finishEdit(inp.value, true));
        inp.addEventListener('keydown', e2 => {
          if (e2.key === 'Enter')  finishEdit(inp.value, true);
          if (e2.key === 'Escape') finishEdit(val, false);
        });
      }
    });
  });

  return tr;
}

// ── Status picker (inline) ────────────────────────────────────────
function openStatusPicker(taskId, badge) {
  const existing = document.getElementById('status-picker');
  if (existing) existing.remove();

  const picker = document.createElement('div');
  picker.id = 'status-picker';
  picker.style.cssText = 'position:fixed;background:#fff;border:1px solid #c7c6ca;border-radius:4px;padding:6px;box-shadow:0 4px 12px rgba(0,0,0,.12);z-index:300;display:flex;flex-direction:column;gap:4px;min-width:120px';

  const rect = badge.getBoundingClientRect();
  picker.style.top = (rect.bottom + 4) + 'px';
  picker.style.left = rect.left + 'px';

  STATUS_LIST.forEach(s => {
    const btn = document.createElement('button');
    btn.style.cssText = 'border:none;background:transparent;cursor:pointer;text-align:left;padding:5px 8px;border-radius:2px;font-family:inherit;font-size:12px;font-weight:600;display:flex;align-items:center;gap:7px;';
    btn.innerHTML = `<span class="status-badge ${s.cls}">${s.label}</span>`;
    btn.addEventListener('mouseenter', () => btn.style.background = '#f7f3f2');
    btn.addEventListener('mouseleave', () => btn.style.background = 'transparent');
    btn.addEventListener('click', () => { updateTask(taskId, 'status', s.key); picker.remove(); });
    picker.appendChild(btn);
  });

  document.body.appendChild(picker);
  setTimeout(() => document.addEventListener('click', function handler(e) {
    if (!picker.contains(e.target)) { picker.remove(); document.removeEventListener('click', handler); }
  }), 0);
}

// ── CRUD ─────────────────────────────────────────────────────────
function updateTask(id, field, value) {
  db.ref(`${DB_PATH}/tasks/${id}`).update({ [field]: value, updatedAt: Date.now() });
}

function deleteTask(id) {
  if (!confirm('이 항목을 삭제하시겠습니까?')) return;
  db.ref(`${DB_PATH}/tasks/${id}`).remove();
  if (selectedTaskId === id) closeDetail();
}

function addTask(data) {
  const id = 'task_' + Date.now().toString(36);
  const maxOrder = Object.values(tasks)
    .filter(t => t.project === data.project && t.group === data.group)
    .reduce((m, t) => Math.max(m, t.order || 0), -1);
  db.ref(`${DB_PATH}/tasks/${id}`).set({ ...data, order: maxOrder + 1, createdAt: Date.now(), updatedAt: Date.now() });
}

// ── Collapse ──────────────────────────────────────────────────────
function toggleCollapse(key) {
  collapsed.has(key) ? collapsed.delete(key) : collapsed.add(key);
  renderTable();
}

// ── Add modal ─────────────────────────────────────────────────────
function openAddModal(project, group) {
  addModalContext = { project, group };
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('add-project').value = project;
  document.getElementById('add-group').value = group;
  document.getElementById('add-action').value = '';
  document.getElementById('add-ref').value = '';
  document.getElementById('add-assignees').value = '';
  document.getElementById('add-nbd').value = '';
  document.getElementById('add-status').value = 'Not Started';
  document.getElementById('add-update').value = '';
  document.getElementById('add-log').value = '';
  setTimeout(() => document.getElementById('add-action').focus(), 50);
}

function closeAddModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  addModalContext = null;
}

function confirmAdd() {
  const project = document.getElementById('add-project').value.trim();
  const group   = document.getElementById('add-group').value.trim();
  const action  = document.getElementById('add-action').value.trim();
  if (!project || !action) { document.getElementById('add-action').focus(); return; }
  addTask({
    project, group,
    actionItem:    action,
    refDetails:    document.getElementById('add-ref').value.trim(),
    assignees:     document.getElementById('add-assignees').value.trim(),
    nbd:           document.getElementById('add-nbd').value.trim() || 'TBD',
    status:        document.getElementById('add-status').value,
    latestUpdate:  document.getElementById('add-update').value.trim(),
    updateLog:     document.getElementById('add-log').value.trim(),
  });
  closeAddModal();
}

// ── Detail panel ──────────────────────────────────────────────────
function openDetail(id) {
  selectedTaskId = id;
  renderDetail();
  document.getElementById('detail-panel').classList.add('open');
  renderTable();
}

function closeDetail() {
  selectedTaskId = null;
  document.getElementById('detail-panel').classList.remove('open');
}

function renderDetail() {
  const t = tasks[selectedTaskId];
  if (!t) return;
  const si = statusInfo(t.status);
  const panel = document.getElementById('detail-panel');
  panel.innerHTML = `
    <div class="detail-header">
      <div class="detail-title">${esc(t.actionItem)}</div>
      <button class="detail-close" onclick="closeDetail()"><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="detail-field">
      <div class="detail-field-label">프로젝트</div>
      <div class="detail-field-value">${esc(t.project)}${t.group?' › '+esc(t.group):''}</div>
    </div>
    <div class="detail-field">
      <div class="detail-field-label">Status</div>
      <div class="detail-field-value"><span class="status-badge ${si.cls}" onclick="openStatusPicker('${t.id}', this)">${si.label}</span></div>
    </div>
    <div class="detail-field">
      <div class="detail-field-label">담당자</div>
      <div class="detail-field-value editable" data-field="assignees" data-id="${t.id}">${esc(t.assignees)||'—'}</div>
    </div>
    <div class="detail-field">
      <div class="detail-field-label">NBD</div>
      <div class="detail-field-value editable ${deadlineClass(t.nbd)}" data-field="nbd" data-id="${t.id}">${esc(t.nbd)||'TBD'}</div>
    </div>
    <div class="detail-field">
      <div class="detail-field-label">Action Item</div>
      <div class="detail-field-value editable" data-field="actionItem" data-id="${t.id}">${esc(t.actionItem)||'—'}</div>
    </div>
    <div class="detail-field">
      <div class="detail-field-label">Reference Details</div>
      <div class="detail-field-value editable" data-field="refDetails" data-id="${t.id}" style="white-space:pre-wrap">${esc(t.refDetails)||'—'}</div>
    </div>
    <div class="detail-field">
      <div class="detail-field-label">Latest Update</div>
      <div class="detail-field-value editable" data-field="latestUpdate" data-id="${t.id}">${esc(t.latestUpdate)||'—'}</div>
    </div>
    <div class="detail-field">
      <div class="detail-field-label">Update Log</div>
      <div class="detail-field-value editable" data-field="updateLog" data-id="${t.id}" style="white-space:pre-wrap">${esc(t.updateLog)||'—'}</div>
    </div>
    <div class="detail-field" style="padding-bottom:20px">
      <div class="detail-field-label" style="margin-bottom:8px">생성/수정</div>
      <div style="font-size:11px;color:#76777b">생성: ${t.createdAt ? new Date(t.createdAt).toLocaleDateString('ko-KR') : '—'}</div>
      <div style="font-size:11px;color:#76777b">수정: ${t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('ko-KR') : '—'}</div>
    </div>`;

  // Inline editing in detail panel
  panel.querySelectorAll('.detail-field-value.editable').forEach(el => {
    const field = el.dataset.field;
    const id = el.dataset.id;
    const isMulti = ['refDetails','assignees','updateLog'].includes(field);

    el.addEventListener('click', () => {
      if (el.querySelector('input,textarea')) return;
      const val = tasks[id]?.[field] || '';

      function finishDetailEdit(newVal, save) {
        activeEditCell = null;
        if (save && newVal !== val) updateTask(id, field, newVal);
        else { if (pendingRemoteRender) { pendingRemoteRender = false; renderTable(); } renderDetail(); }
      }

      activeEditCell = { taskId: id, field };

      if (isMulti) {
        const ta = document.createElement('textarea');
        ta.className = 'cell-textarea'; ta.value = val;
        el.innerHTML = ''; el.appendChild(ta); ta.focus();
        ta.addEventListener('blur', () => finishDetailEdit(ta.value, true));
        ta.addEventListener('keydown', e => { if (e.key === 'Escape') finishDetailEdit(val, false); });
      } else {
        const inp = document.createElement('input');
        inp.className = 'cell-input'; inp.value = val;
        el.innerHTML = ''; el.appendChild(inp); inp.focus(); inp.select();
        inp.addEventListener('blur', () => finishDetailEdit(inp.value, true));
        inp.addEventListener('keydown', e => {
          if (e.key === 'Enter') finishDetailEdit(inp.value, true);
          if (e.key === 'Escape') finishDetailEdit(val, false);
        });
      }
    });
  });
}

// 리모트 변경 시 디테일 패널 갱신 — 현재 편집 중인 필드는 건드리지 않음
function renderDetailRemote() {
  if (!selectedTaskId) return;
  const t = tasks[selectedTaskId];
  if (!t) { closeDetail(); return; }
  const panel = document.getElementById('detail-panel');

  // 편집 중인 필드가 있으면 해당 필드 제외하고 나머지만 갱신
  panel.querySelectorAll('.detail-field-value[data-field]').forEach(el => {
    if (el.querySelector('input,textarea')) return; // 편집 중 → 스킵
    const field = el.dataset.field;
    const newVal = t[field] || '';
    if (field === 'status') return; // status는 badge 렌더라 스킵
    el.textContent = newVal || '—';
  });
}

// ── Summary ───────────────────────────────────────────────────────
function updateSummary() {
  const all = Object.values(tasks);
  const counts = { 'Completed':0, 'In Progress':0, 'Delayed':0, 'On Hold':0, 'Not Started':0 };
  all.forEach(t => { counts[t.status] = (counts[t.status]||0) + 1; });
  const total = all.length || 1;

  const pb = document.getElementById('progress-bar-wrap');
  if (pb) pb.innerHTML = `
    <div class="pb-completed" style="width:${counts['Completed']/total*100}%"></div>
    <div class="pb-inprogress" style="width:${counts['In Progress']/total*100}%"></div>
    <div class="pb-delayed" style="width:${counts['Delayed']/total*100}%"></div>
    <div class="pb-onhold" style="width:${counts['On Hold']/total*100}%"></div>`;

  const chips = document.getElementById('summary-chips');
  if (chips) chips.innerHTML = `
    <span class="chip s-completed" style="background:#d1fae5;color:#065f46">완료 ${counts['Completed']}</span>
    <span class="chip s-in-progress" style="background:#dbeafe;color:#1d4ed8">진행 ${counts['In Progress']}</span>
    <span class="chip s-delayed" style="background:#fee2e2;color:#991b1b">지연 ${counts['Delayed']}</span>
    <span class="chip s-not-started" style="background:#f1edec;color:#46474a">미시작 ${counts['Not Started']}</span>
    <span class="chip" style="background:#fef3c7;color:#92400e">보류 ${counts['On Hold']}</span>`;
}

// ── Export ────────────────────────────────────────────────────────
function exportExcel() {
  if (typeof XLSX === 'undefined') { alert('잠시 후 다시 시도해주세요.'); return; }
  const rows = [['프로젝트','그룹','액션 아이템','Reference Details','담당자','NBD','Status','최근 업데이트','Update Log']];
  PROJECT_ORDER.forEach(proj => {
    const byProject = Object.values(tasks).filter(t => t.project === proj).sort((a,b)=>(a.order||0)-(b.order||0));
    byProject.forEach(t => rows.push([t.project, t.group||'', t.actionItem, t.refDetails, t.assignees, t.nbd, t.status, t.latestUpdate, t.updateLog]));
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{wch:12},{wch:20},{wch:40},{wch:40},{wch:20},{wch:12},{wch:14},{wch:12},{wch:40}];
  XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
  XLSX.writeFile(wb, `BLACKONYX_${new Date().toISOString().slice(0,10)}.xlsx`);
}

function exportPDF() {
  window.print();
}

// ── Events ────────────────────────────────────────────────────────
function setupEvents() {
  document.getElementById('search-input').addEventListener('input', e => {
    searchTerm = e.target.value;
    renderTable();
  });

  document.getElementById('filter-status').addEventListener('change', e => {
    filterStatus = e.target.value;
    renderTable();
  });

  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'modal-overlay') closeAddModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeAddModal(); closeDetail(); }
  });

  // Nav items
  document.querySelectorAll('.nav-item[data-project]').forEach(el => {
    el.addEventListener('click', () => {
      currentProject = el.dataset.project || null;
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      el.classList.add('active');
      renderTable();
    });
  });

  document.getElementById('nav-all').addEventListener('click', () => {
    currentProject = null;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('nav-all').classList.add('active');
    renderTable();
  });

  document.getElementById('btn-export-excel').addEventListener('click', exportExcel);
  document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);
  document.getElementById('btn-add-task').addEventListener('click', () => openAddModal(currentProject || 'Blackonyx', ''));
  document.getElementById('btn-confirm-add').addEventListener('click', confirmAdd);
  document.getElementById('btn-cancel-add').addEventListener('click', closeAddModal);

  document.getElementById('add-action').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) confirmAdd();
  });
}

// ── Boot ─────────────────────────────────────────────────────────
init();
