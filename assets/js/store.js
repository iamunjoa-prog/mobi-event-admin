/**
 * 저장 계층
 *
 * config.js 에 Supabase 값이 채워져 있으면 Supabase 를, 비어 있으면 브라우저
 * 로컬 저장을 씁니다. 화면 코드는 어느 쪽인지 알 필요가 없습니다.
 */
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const LOCAL_KEY = 'mobi-event-admin:events';
const DRAFT_KEY = 'mobi-event-admin:draft';

export const isRemote = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function storageLabel() {
  return isRemote ? 'Supabase' : '이 브라우저에만 저장됨';
}

/* ---------- 로컬 ---------- */

function localAll() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function localWrite(rows) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
}

/* ---------- Supabase ---------- */

async function sb(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {})
    }
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

/* ---------- 공개 API ---------- */

export async function listEvents() {
  if (!isRemote) {
    return localAll().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }
  return sb('events?select=*&order=updated_at.desc');
}

export async function saveEvent(event) {
  const now = new Date().toISOString();
  const row = { ...event, updatedAt: now, createdAt: event.createdAt || now };

  if (!isRemote) {
    const rows = localAll();
    const i = rows.findIndex(r => r.id === row.id);
    if (i >= 0) rows[i] = row;
    else rows.push(row);
    localWrite(rows);
    return row;
  }

  const payload = {
    id: row.id,
    event_id: row.eventId,
    event_name: row.eventName,
    type_key: row.typeKey,
    sub_type: row.subType || null,
    owner: row.owner || null,
    team: row.team || null,
    start_at: row.eventStartTime || null,
    end_at: row.eventEndTime || null,
    data: row,
    updated_at: row.updatedAt,
    created_at: row.createdAt
  };
  const saved = await sb('events?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(payload)
  });
  return Array.isArray(saved) ? saved[0] : saved;
}

export async function deleteEvent(id) {
  if (!isRemote) {
    localWrite(localAll().filter(r => r.id !== id));
    return;
  }
  await sb(`events?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/** Supabase 행을 화면이 쓰는 모양으로 되돌립니다 */
export function unwrap(row) {
  if (!row) return row;
  return row.data ? row.data : row;
}

/* ---------- 작성 중인 내용 자동 저장 ---------- */

export function saveDraft(draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* 저장 공간이 없으면 조용히 넘어갑니다 */
  }
}

export function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
  } catch {
    return null;
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
