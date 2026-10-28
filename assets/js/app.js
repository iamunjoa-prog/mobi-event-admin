/**
 * 화면 조립 — 유형 선택 → 입력 → 산출물.
 */
import { EVENT_TYPES, needsPrivacyGuide, subTypeOf } from './schema.js';
import { renderForm, collectForm, validate, applyConditionalFields, typeOptions } from './form.js';
import { planToText, buildBannerChecklist, buildPackageList, buildDevJson } from './output.js';
import { planDocHtml } from './plandoc.js';
import { listEvents, saveEvent, deleteEvent, unwrap, storageLabel, isRemote,
         saveDraft, loadDraft, clearDraft } from './store.js';

const $ = (sel) => document.querySelector(sel);

const state = {
  typeKey: '',
  data: {},
  editingId: null
};

/* ---------- 유형 선택 ---------- */

function renderTypePicker() {
  const wrap = $('#typePicker');
  wrap.innerHTML = '';
  for (const { key, label, desc } of typeOptions()) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'type-card' + (state.typeKey === key ? ' active' : '');
    card.innerHTML = `<strong></strong><span></span>`;
    card.querySelector('strong').textContent = label;
    card.querySelector('span').textContent = desc;
    card.addEventListener('click', () => selectType(key));
    wrap.appendChild(card);
  }
}

function selectType(key) {
  if (state.typeKey !== key) {
    const defaults = EVENT_TYPES[key]?.defaults || {};
    state.data = { ...state.data, ...defaults, typeKey: key };
    state.typeKey = key;
  }
  renderTypePicker();
  $('#editor').hidden = false;
  renderForm($('#formArea'), key, state.data);
  state.data = { ...state.data, ...collectForm($('#formArea'), key, state.data) };
  applyConditionalFields($('#formArea'), key, state.data);
  bindFormEvents();
  refreshOutputs();
}

/* ---------- 입력 ---------- */

/**
 * 세부 유형의 고정값(defaults)과 전용 필드의 기본값을 채웁니다.
 * 앞선 유형에서 빈 값으로 남아 있던 항목도 기본값으로 덮습니다
 * (예: 출석체크 포인트 미지급형의 policyNum = nopoint).
 */
function applySubTypeDefaults(typeKey, data) {
  const sub = subTypeOf(typeKey, data);
  if (!sub) return data;
  const next = { ...data, ...(sub.defaults || {}) };
  for (const field of sub.fields || []) {
    if (field.default === undefined) continue;
    const value = next[field.key];
    if (value === '' || value === undefined || value === null) next[field.key] = field.default;
  }
  return next;
}

function bindFormEvents() {
  const area = $('#formArea');
  area.oninput = area.onchange = () => {
    const before = state.data.subType;
    state.data = { ...state.data, ...collectForm(area, state.typeKey, state.data) };

    if (state.data.subType !== before) {
      // 세부 유형이 바뀌면 입력 항목 자체가 달라져 폼을 다시 그립니다.
      state.data = applySubTypeDefaults(state.typeKey, state.data);
      renderForm(area, state.typeKey, state.data);
      // 새로 그린 항목의 기본값(체크박스 등)을 state 에 반영한 뒤 분기를 다시 적용합니다.
      state.data = { ...state.data, ...collectForm(area, state.typeKey, state.data) };
      applyConditionalFields(area, state.typeKey, state.data);
    } else {
      applyConditionalFields(area, state.typeKey, state.data);
    }

    saveDraft({ typeKey: state.typeKey, data: state.data, editingId: state.editingId });
    refreshOutputs();
  };
}

/* ---------- 산출물 ---------- */

function refreshOutputs() {
  const data = { ...state.data, typeKey: state.typeKey };

  // 1. 기획안 문서
  $('#planDoc').innerHTML = planDocHtml(data);

  // 2. 배너 체크리스트
  const banners = buildBannerChecklist(data);
  const list = $('#bannerList');
  list.innerHTML = '';
  if (!banners.length) {
    list.innerHTML = '<li class="muted">노출 채널을 선택하면 필요한 배너가 나옵니다.</li>';
  } else {
    for (const b of banners) {
      const li = document.createElement('li');
      li.innerHTML = `<code></code><small></small>`;
      li.querySelector('code').textContent = b.filename;
      li.querySelector('small').textContent = `${b.note} · ${b.channels}`;
      list.appendChild(li);
    }
  }

  const packages = buildPackageList(data);
  const pkg = $('#packageList');
  pkg.innerHTML = '';
  for (const p of packages) {
    const li = document.createElement('li');
    li.textContent = p;
    pkg.appendChild(li);
  }

  // 3. 개발 전달용 JSON
  $('#devJson').textContent = JSON.stringify(buildDevJson(data), null, 2);

  // 경고
  const warn = $('#warnings');
  warn.innerHTML = '';
  if (EVENT_TYPES[state.typeKey]?.subTypes && !data.subType) {
    warn.innerHTML = '<p class="warn">세부 유형을 먼저 고르면 그에 맞는 입력 항목이 나옵니다.</p>';
  } else if (needsPrivacyGuide(state.typeKey, data.subType)) {
    warn.innerHTML = `<p class="warn">${data.subType} 은(는) 개인정보보호 가이드 적용이 필요합니다.</p>`;
  }
}

/* ---------- 저장 / 불러오기 ---------- */

async function onSave() {
  const area = $('#formArea');
  state.data = { ...state.data, ...collectForm(area, state.typeKey, state.data) };
  const errors = validate(area, state.typeKey, state.data);
  const box = $('#saveMsg');

  if (errors.length) {
    box.className = 'msg error';
    box.textContent = `${errors.length}개 항목을 확인하세요: ${errors[0]}`;
    area.querySelector('.field.invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const record = {
    ...state.data,
    typeKey: state.typeKey,
    id: state.editingId || crypto.randomUUID()
  };

  try {
    box.className = 'msg';
    box.textContent = '저장 중…';
    await saveEvent(record);
    state.editingId = record.id;
    clearDraft();
    box.className = 'msg ok';
    box.textContent = `저장했습니다 (${storageLabel()}).`;
    await refreshHistory();
  } catch (e) {
    box.className = 'msg error';
    box.textContent = `저장 실패: ${e.message}`;
  }
}

async function refreshHistory() {
  const tbody = $('#historyBody');
  tbody.innerHTML = '<tr><td colspan="5" class="muted">불러오는 중…</td></tr>';
  try {
    const rows = (await listEvents()).map(unwrap);
    tbody.innerHTML = '';
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="muted">저장된 이벤트가 없습니다.</td></tr>';
      return;
    }
    for (const r of rows) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td></td><td></td><td></td><td></td>
        <td class="actions">
          <button type="button" data-act="load">불러오기</button>
          <button type="button" data-act="copy">복제</button>
          <button type="button" data-act="del" class="danger">삭제</button>
        </td>`;
      const cells = tr.querySelectorAll('td');
      cells[0].textContent = r.eventName || '';
      cells[1].textContent = [EVENT_TYPES[r.typeKey]?.label || r.typeKey, r.subType]
        .filter(Boolean).join(' · ');
      cells[2].textContent = r.eventId || '';
      cells[3].textContent = (r.eventStartTime || '').slice(0, 10);
      tr.querySelector('[data-act="load"]').onclick = () => loadRecord(r, r.id);
      tr.querySelector('[data-act="copy"]').onclick = () => loadRecord(r, null);
      tr.querySelector('[data-act="del"]').onclick = () => removeRecord(r);
      tbody.appendChild(tr);
    }
  } catch (e) {
    tbody.innerHTML = '';
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.className = 'muted';
    td.textContent = `목록을 불러오지 못했습니다: ${e.message}`;
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
}

function loadRecord(record, keepId) {
  state.data = { ...record };
  state.typeKey = record.typeKey;
  state.editingId = keepId;
  if (!keepId) {
    state.data.eventId = '';
    state.data.eventName = `${record.eventName || ''} (복제)`;
  }
  selectType(record.typeKey);
  $('#saveMsg').className = 'msg';
  $('#saveMsg').textContent = keepId ? '불러왔습니다.' : '복제했습니다. 이벤트 ID 와 기간을 새로 입력하세요.';
  $('#editor').scrollIntoView({ behavior: 'smooth' });
}

async function removeRecord(record) {
  if (!confirm(`"${record.eventName}" 을(를) 삭제할까요?`)) return;
  await deleteEvent(record.id);
  if (state.editingId === record.id) state.editingId = null;
  await refreshHistory();
}

/* ---------- 복사 ---------- */

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const old = button.textContent;
    button.textContent = '복사됨';
    setTimeout(() => { button.textContent = old; }, 1500);
  } catch {
    alert('복사에 실패했습니다. 직접 선택해 복사해 주세요.');
  }
}

/* ---------- 시작 ---------- */

function init() {
  $('#storageLabel').textContent = storageLabel();
  if (!isRemote) $('#storageLabel').classList.add('local');

  renderTypePicker();

  $('#btnSave').onclick = onSave;
  $('#btnNew').onclick = () => {
    state.data = {};
    state.editingId = null;
    clearDraft();
    if (state.typeKey) selectType(state.typeKey);
    $('#saveMsg').textContent = '';
  };

  $('#copyPlan').onclick = (e) =>
    copyText(planToText({ ...state.data, typeKey: state.typeKey }), e.target);
  $('#copyBanners').onclick = (e) =>
    copyText(buildBannerChecklist({ ...state.data, typeKey: state.typeKey })
      .map(b => b.filename).join('\n'), e.target);
  $('#copyJson').onclick = (e) => copyText($('#devJson').textContent, e.target);

  // 인쇄는 기획안 탭이 보이는 상태에서만 의미가 있습니다.
  $('#printPlan').onclick = () => {
    document.querySelector('.tab[data-panel="panelPlan"]').click();
    window.print();
  };

  for (const tab of document.querySelectorAll('.tab')) {
    tab.onclick = () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.panel').forEach(p => {
        p.hidden = p.id !== tab.dataset.panel;
      });
    };
  }

  const draft = loadDraft();
  if (draft && draft.typeKey) {
    state.data = draft.data || {};
    state.editingId = draft.editingId || null;
    selectType(draft.typeKey);
    $('#saveMsg').className = 'msg';
    $('#saveMsg').textContent = '작성 중이던 내용을 복원했습니다.';
  }

  refreshHistory();
}

init();
