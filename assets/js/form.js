/**
 * 폼 렌더러 — schema.js 의 필드 정의를 받아 입력 UI 를 그립니다.
 *
 * 필드 구성은 유형뿐 아니라 세부 유형에도 달려 있어,
 * 세부 유형이 바뀌면 app.js 가 renderForm 을 다시 호출합니다.
 * 같은 세부 유형 안에서 갈라지는 항목(showIf)은 다시 그리지 않고 숨김 처리합니다.
 */
import { GROUPS, fieldsFor, EVENT_TYPES, isVisible,
         parseQuestionPlan, QUESTION_LIMITS } from './schema.js';

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (v !== undefined && v !== null && v !== false) node.setAttribute(k, v);
  }
  for (const child of [].concat(children)) {
    if (child) node.appendChild(child);
  }
  return node;
}

function control(field, value) {
  const id = `f_${field.key}`;
  const common = { id, name: field.key, class: 'control' };

  switch (field.type) {
    case 'radio': {
      const wrap = el('div', { class: 'radios' });
      for (const opt of field.options || []) {
        const value_ = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const desc = typeof opt === 'string' ? '' : opt.desc;
        const input = el('input', { type: 'radio', name: field.key, value: value_, 'data-key': field.key });
        input.checked = value === value_;
        const body = el('span', { class: 'radio-body' }, [
          el('strong', { text: label }),
          desc ? el('small', { text: desc }) : null
        ]);
        wrap.appendChild(el('label', { class: 'radio' + (input.checked ? ' on' : '') }, [input, body]));
      }
      return wrap;
    }
    case 'textarea': {
      const node = el('textarea', { ...common, rows: 3, placeholder: field.placeholder || '' });
      node.value = value ?? field.default ?? '';
      return node;
    }
    case 'select': {
      const node = el('select', common);
      node.appendChild(el('option', { value: '', text: '선택' }));
      for (const opt of field.options || []) {
        const value_ = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        node.appendChild(el('option', { value: value_, text: label }));
      }
      node.value = value ?? field.default ?? '';
      return node;
    }
    case 'multiselect': {
      const wrap = el('div', { class: 'checks' });
      const selected = Array.isArray(value) ? value : [];
      for (const opt of field.options || []) {
        const box = el('input', { type: 'checkbox', value: opt, 'data-key': field.key });
        box.checked = selected.includes(opt);
        wrap.appendChild(el('label', { class: 'check' }, [box, el('span', { text: opt })]));
      }
      return wrap;
    }
    case 'checkbox': {
      const box = el('input', { ...common, type: 'checkbox' });
      box.checked = value ?? field.default ?? false;
      return el('label', { class: 'check' }, [box, el('span', { text: '예' })]);
    }
    case 'datetime': {
      const node = el('input', { ...common, type: 'datetime-local', step: 1 });
      node.value = value ?? '';
      return node;
    }
    case 'number': {
      const node = el('input', { ...common, type: 'number', min: 0 });
      node.value = value ?? field.default ?? '';
      return node;
    }
    case 'color': {
      const node = el('input', { ...common, type: 'color' });
      node.value = value || field.default || '#000000';
      return node;
    }
    default: {
      const node = el('input', {
        ...common, type: 'text',
        placeholder: field.placeholder || '',
        pattern: field.pattern || undefined
      });
      node.value = value ?? field.default ?? '';
      return node;
    }
  }
}

export function renderForm(container, typeKey, data) {
  container.innerHTML = '';
  const fields = fieldsFor(typeKey, data);
  if (!fields.length) return;

  const byGroup = new Map();
  for (const field of fields) {
    if (!byGroup.has(field.group)) byGroup.set(field.group, []);
    byGroup.get(field.group).push(field);
  }

  const ordered = [...GROUPS.filter(g => byGroup.has(g)), ...[...byGroup.keys()].filter(g => !GROUPS.includes(g))];

  for (const group of ordered) {
    const section = el('section', { class: 'group' });
    section.appendChild(el('h3', { text: group }));
    const grid = el('div', { class: 'grid' });

    for (const field of byGroup.get(group)) {
      const wide = field.type === 'textarea' || field.type === 'radio';
      const row = el('div', { class: 'field' + (wide ? ' wide' : '') + (field.showIf ? ' branch' : '') });
      row.dataset.key = field.key;

      const label = el('label', { for: `f_${field.key}` }, [
        el('span', { text: field.label }),
        field.required ? el('em', { class: 'req', text: '필수' }) : null
      ]);
      row.appendChild(label);
      row.appendChild(control(field, data[field.key]));
      if (field.help) row.appendChild(el('p', { class: 'help', text: field.help }));
      row.appendChild(el('p', { class: 'err' }));
      grid.appendChild(row);
    }

    section.appendChild(grid);
    container.appendChild(section);
  }

  applyConditionalFields(container, typeKey, data);
}

/** 화면에서 값을 모아 객체로 */
export function collectForm(container, typeKey, data = {}) {
  const out = { typeKey };
  for (const field of fieldsFor(typeKey, data)) {
    if (field.key in out) continue;
    if (field.type === 'multiselect') {
      out[field.key] = [...container.querySelectorAll(`input[data-key="${field.key}"]:checked`)]
        .map(i => i.value);
      continue;
    }
    if (field.type === 'radio') {
      const picked = container.querySelector(`input[data-key="${field.key}"]:checked`);
      out[field.key] = picked ? picked.value : '';
      continue;
    }
    const node = container.querySelector(`#f_${CSS.escape(field.key)}`);
    if (!node) continue;
    if (field.type === 'checkbox') out[field.key] = node.checked;
    else if (field.type === 'number') out[field.key] = node.value === '' ? '' : Number(node.value);
    else out[field.key] = node.value;
  }
  return out;
}

/**
 * 필수값·형식 검사.
 * 숨어 있는(showIf 조건이 맞지 않는) 필드는 검사하지 않습니다.
 */
export function validate(container, typeKey, data) {
  const errors = [];

  for (const field of fieldsFor(typeKey, data)) {
    const row = container.querySelector(`.field[data-key="${CSS.escape(field.key)}"]`);
    if (row) row.classList.remove('invalid');
    const errNode = row ? row.querySelector('.err') : null;
    if (errNode) errNode.textContent = '';

    if (!isVisible(field, data)) continue;

    const value = data[field.key];
    const empty = value === '' || value === undefined || value === null ||
      (Array.isArray(value) && value.length === 0);

    if (field.required && empty) {
      errors.push(`${field.label} 을(를) 입력하세요.`);
      if (row) row.classList.add('invalid');
      if (errNode) errNode.textContent = '필수 항목입니다.';
      continue;
    }

    if (!empty && field.pattern && !new RegExp(field.pattern).test(String(value))) {
      errors.push(`${field.label} 형식이 올바르지 않습니다.`);
      if (row) row.classList.add('invalid');
      if (errNode) errNode.textContent = field.help || '형식을 확인하세요.';
    }
  }

  if (data.eventStartTime && data.eventEndTime && data.eventStartTime >= data.eventEndTime) {
    errors.push('종료 일시가 시작 일시보다 빠릅니다.');
    const row = container.querySelector('.field[data-key="eventEndTime"]');
    if (row) {
      row.classList.add('invalid');
      row.querySelector('.err').textContent = '시작 일시 이후로 설정하세요.';
    }
  }

  if (data.questionPlan) {
    const rows = parseQuestionPlan(data.questionPlan);
    const bad = rows.find(r => r.error);
    let message = '';
    if (rows.length > QUESTION_LIMITS.maxQuestions) {
      message = `문항은 최대 ${QUESTION_LIMITS.maxQuestions}개입니다. 지금 ${rows.length}개.`;
    } else if (bad) {
      message = `${bad.line}번째 줄: ${bad.error}`;
    }
    if (message) {
      errors.push(message);
      const row = container.querySelector('.field[data-key="questionPlan"]');
      if (row) {
        row.classList.add('invalid');
        row.querySelector('.err').textContent = message;
      }
    }
  }

  if (typeKey === 'quiz' && data.correctAnswer) {
    const options = (data.answerOptions || '').split('\n').map(s => s.trim()).filter(Boolean);
    if (options.length && !options.includes(data.correctAnswer.trim())) {
      errors.push('정답이 보기 중에 없습니다.');
      const row = container.querySelector('.field[data-key="correctAnswer"]');
      if (row) {
        row.classList.add('invalid');
        row.querySelector('.err').textContent = '보기와 정확히 일치해야 합니다.';
      }
    }
  }

  return errors;
}

/** showIf 조건에 따라 같은 화면 안에서 항목을 숨기고 보입니다 */
export function applyConditionalFields(container, typeKey, data) {
  for (const field of fieldsFor(typeKey, data)) {
    const row = container.querySelector(`.field[data-key="${CSS.escape(field.key)}"]`);
    if (!row) continue;
    row.hidden = !isVisible(field, data);
  }
  // 세부 유형 칩의 선택 표시
  for (const label of container.querySelectorAll('.radio')) {
    label.classList.toggle('on', label.querySelector('input').checked);
  }
  // 항목이 전부 숨겨진 그룹은 제목까지 감춥니다.
  for (const section of container.querySelectorAll('.group')) {
    const rows = [...section.querySelectorAll('.field')];
    section.hidden = rows.length > 0 && rows.every(r => r.hidden);
  }
}

export function typeOptions() {
  return Object.entries(EVENT_TYPES).map(([key, t]) => ({ key, label: t.label, desc: t.desc }));
}
