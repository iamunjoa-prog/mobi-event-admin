/**
 * 산출물 생성기
 *  1. 기획안 표 (그대로 복사해서 문서에 붙여넣기)
 *  2. 배너 에셋 체크리스트
 *  3. 개발 전달용 JSON
 */
import { BANNER_ASSETS, EVENT_TYPES, fieldsFor, needsPrivacyGuide, usesReward,
         subTypeOf, isVisible, parseQuestionPlan } from './schema.js';

/** 'a | b | c' 로 적은 줄들을 칸 수만큼 잘라 배열로 */
function parseRows(text, size) {
  return String(text || '').split('\n').map(s => s.trim()).filter(Boolean)
    .map(line => {
      const cells = line.split('|').map(s => s.trim());
      return Array.from({ length: size }, (_, i) => cells[i] || '');
    });
}

/** 지급 설정 블록에서 따로 내보내는 키 — 세부 유형 상세에서는 중복으로 담지 않습니다 */
const REWARD_KEYS = new Set([
  'policyNum', 'ifGubun', 'maxParticipationCount', 'btnId', 'btnLabel',
  'popupSuccess', 'popupExhaust', 'popupAlready', 'popupFail', 'popupFailEventTime', 'popupNotTarget'
]);

const IF_GUBUN_LABEL = {
  SKBIFC001: '쿠폰',
  SKBIFC002: 'B캐쉬',
  SKBIFC003: 'B포인트',
  SKBIFC004: '추천발급'
};

/** 'yyyy-mm-ddThh:mm' 을 'yyyy-mm-dd hh:mm:ss' 로 */
export function toEventTime(value) {
  if (!value) return '';
  const [date, time = '00:00'] = value.split('T');
  const parts = time.split(':');
  const hh = parts[0] || '00';
  const mm = parts[1] || '00';
  const ss = parts[2] || '00';
  return `${date} ${hh}:${mm}:${ss}`;
}

function displayValue(field, raw, data) {
  if (raw === undefined || raw === null || raw === '') return '';
  switch (field.type) {
    case 'datetime':
      return toEventTime(raw);
    case 'multiselect':
      return Array.isArray(raw) ? raw.join(', ') : String(raw);
    case 'checkbox':
      return raw ? '포함' : '미포함';
    case 'select':
      if (field.key === 'ifGubun') return `${IF_GUBUN_LABEL[raw] || raw} (${raw})`;
      return String(raw);
    default:
      return String(raw);
  }
}

/** 기획안 표 — 그룹별 섹션을 가진 2열 표 */
export function buildPlanTable(data) {
  const type = EVENT_TYPES[data.typeKey];
  const fields = fieldsFor(data.typeKey, data);
  const rows = [];

  rows.push(['이벤트 유형', type ? type.label : data.typeKey]);

  const seen = new Set(['typeKey']);
  const byGroup = new Map();
  for (const field of fields) {
    if (seen.has(field.key)) continue;
    seen.add(field.key);
    if (field.planDoc) continue; // 문서 본문에서 따로 렌더링합니다
    if (!isVisible(field, data)) continue; // 지금 분기에서 쓰지 않는 항목
    const value = displayValue(field, data[field.key], data);
    if (!value) continue;
    if (!byGroup.has(field.group)) byGroup.set(field.group, []);
    byGroup.get(field.group).push([field.label, value]);
  }

  const sections = [];
  for (const [group, items] of byGroup) sections.push({ group, items });

  // 유형별로 자동 계산되는 값
  const derived = [];
  if (usesReward(data.typeKey, data)) {
    derived.push(['event_type', type?.defaults?.eventTypeCode || 'reward']);
  }
  if (data.typeKey === 'launch' && data.applinkUploadNo) {
    derived.push(['applink 대상', `업로드 번호 ${data.applinkUploadNo}`]);
  }
  if (needsPrivacyGuide(data.typeKey, data.subType)) {
    derived.push(['개인정보보호 가이드', '적용 필요']);
  }
  if (derived.length) sections.push({ group: '자동 반영', items: derived });

  return { head: rows, sections };
}

/** 기획안 표를 탭 구분 텍스트로 (엑셀·문서에 붙여넣기 좋음) */
export function planToText(data) {
  const { head, sections } = buildPlanTable(data);
  const lines = [];
  lines.push(`[${data.eventName || '이벤트명 미입력'}] 기획안`);
  lines.push('');
  for (const [k, v] of head) lines.push(`${k}\t${v}`);
  for (const section of sections) {
    lines.push('');
    lines.push(`■ ${section.group}`);
    for (const [k, v] of section.items) lines.push(`${k}\t${v}`);
  }
  const checklist = buildBannerChecklist(data);
  if (checklist.length) {
    lines.push('');
    lines.push('■ 필요 배너 에셋');
    for (const item of checklist) lines.push(`${item.filename}\t${item.note}`);
  }
  return lines.join('\n');
}

/** 선택한 채널에 맞는 배너 목록 + 파일명까지 생성 */
export function buildBannerChecklist(data) {
  const channels = Array.isArray(data.channels) ? data.channels : [];
  if (!channels.length) return [];
  const name = data.eventName || '이벤트명';
  return BANNER_ASSETS
    .filter(asset => asset.channels.some(c => channels.includes(c)))
    .map(asset => ({
      filename: `${asset.name}_${name}.png`,
      note: asset.note,
      channels: asset.channels.filter(c => channels.includes(c)).join(', ')
    }));
}

/** 퍼블 zip 이 몇 개 필요한지 */
export function buildPackageList(data) {
  const channels = Array.isArray(data.channels) ? data.channels : [];
  const stamp = (data.eventStartTime || '').slice(2, 10).replace(/-/g, '');
  const name = data.eventName || '이벤트명';
  return channels.map(c => `${name}(${c})_${stamp || 'YYMMDD'}.zip`);
}

/** 개발 전달용 JSON — 퍼블 파일 변수명 그대로 */
export function buildDevJson(data) {
  const type = EVENT_TYPES[data.typeKey];
  const out = {
    eventid: data.eventId || '',
    eventnm: data.eventName || '',
    logPageId: data.logPageId || '',
    eventstarttime: toEventTime(data.eventStartTime),
    eventendtime: toEventTime(data.eventEndTime),
    backgroundColor: data.bgColor || '',
    channels: data.channels || []
  };

  if (data.minAppVersion) out.minAppVersion = data.minAppVersion;

  // 세부 유형과 그 분기에서 실제로 쓰는 값
  const sub = subTypeOf(data.typeKey, data);
  if (sub) {
    out.subType = data.subType;
    const detail = {};
    for (const field of sub.fields || []) {
      if (REWARD_KEYS.has(field.key)) continue;
      if (!isVisible(field, data)) continue;
      const value = data[field.key];
      if (value === '' || value === undefined || value === null) continue;
      if (Array.isArray(value) && !value.length) continue;
      detail[field.key] = value;
    }
    if (Object.keys(detail).length) out.subTypeOptions = detail;
  }

  // instant 유형은 정책을 policies 배열로 따로 내보내 지급 블록을 쓰지 않습니다.
  if (usesReward(data.typeKey, data) && data.typeKey !== 'instant') {
    out.event_type = type?.defaults?.eventTypeCode || 'reward';
    out.policyNum = data.policyNum || '';
    out.IF_GUBUN = data.ifGubun || '';
    out.maxParticipationCount = Number(data.maxParticipationCount ?? 1);
    out.button = { id: data.btnId || '', label: data.btnLabel || '' };
    out.popupMessages = {
      success: data.popupSuccess || '',
      exhaust: data.popupExhaust || '',
      already: data.popupAlready || '',
      fail: data.popupFail || '',
      failEventTime: data.popupFailEventTime || ''
    };
    if (data.popupNotTarget) out.popupMessages.notTarget = data.popupNotTarget;
  }

  if (data.typeKey === 'launch') {
    out.applink = {
      type: 'event_url',
      uploadNo: data.applinkUploadNo || '',
      buttonId: data.btnId || '',
      buttonLabel: data.btnLabel || ''
    };
    out.privacyAgreement = Boolean(data.privacyAgreement);
    out.rewardGuide = data.rewardGuide || '';
  }

  if (data.typeKey === 'attend') {
    out.event_type = 'reward';
    // 미지급형은 지급 블록을 쓰지 않아도 policyNum(nopoint) 이 퍼블 파일에 들어갑니다.
    out.policyNum = data.policyNum || '';
    out.attend = {
      badgeCount: Number(data.attendBadgeCount || 0),
      excludeDays: data.attendExcludeDays || [],
      pointAmount: data.attendPointAmount ? Number(data.attendPointAmount) : 0
    };
  }

  if (data.typeKey === 'instant') {
    out.event_type = 'reward';
    out.policytype = subTypeOf('instant', data)?.defaults?.policyType || '';
    const single = data.productScope === '상품 1개';
    if (data.pid) out.pid = data.pid;
    if (data.productTitle && (single || !data.productScope)) out.title = data.productTitle;
    if (data.ptype && single) out.ptype = data.ptype;
    if (data.epsdid && single) out.epsdid = data.epsdid;
    if (data.srisid && single && data.ptype === '41') out.srisid = data.srisid;
    out.popupMessages = {
      success: data.popupSuccess || '',
      exhaust: data.popupExhaust || '',
      already: data.popupAlready || '',
      fail: data.popupFail || '',
      failEventTime: data.popupFailEventTime || ''
    };
    if (data.popupNotTarget) out.popupMessages.notTarget = data.popupNotTarget;

    const policies = [];
    const addRows = (text, target) => {
      for (const row of parseRows(text, 3)) {
        policies.push({ target, reward: row[0], eventtype: row[1], policynum: row[2] });
      }
    };
    if (isVisible({ showIf: { key: 'memberHandling', in: ['기가입자 대상 지급'] } }, data) ||
        !data.memberHandling) {
      addRows(data.rewardMember, '기가입자용');
    }
    if (isVisible({ showIf: { key: 'nonMemberHandling', in: ['미가입자 대상 지급'] } }, data) ||
        !data.nonMemberHandling) {
      addRows(data.rewardNonMember, '미가입자용');
    }
    addRows(data.rewardSingle, '기준 상품');
    for (const row of parseRows(data.productRows, 7)) {
      policies.push({
        target: '기준 상품', epsdid: row[0], srisid: row[1] === '-' ? '' : row[1],
        ptype: row[2], title: row[3], reward: row[4], eventtype: row[5], policynum: row[6]
      });
    }
    if (policies.length) out.policies = policies;
  }

  if (data.typeKey === 'survey' && data.questionPlan) {
    out.eventType = 'survey';
    out.participantCountShown = Boolean(data.participantCountShown);
    out.cautionArea = data.cautionArea || '';
    out.questions = parseQuestionPlan(data.questionPlan).map(q => ({
      no: q.no, type: q.type, question: q.question, answers: q.answers
    }));
  } else if (data.typeKey === 'survey') {
    out.eventType = 'survey';
    out.questions = {
      choice: Number(data.choiceCount || 0),
      choiceNames: (data.choiceNames || '').split('\n').map(s => s.trim()).filter(Boolean),
      subjective: Number(data.subjectiveCount || 0),
      subjectiveLengths: (data.subjectiveLengths || '')
        .split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n))
    };
    if (data.redirectHigh || data.redirectLow) {
      out.redirectUrls = { high: data.redirectHigh || '', low: data.redirectLow || '' };
    }
  }

  if (data.typeKey === 'quiz') {
    out.eventType = 'quiz';
    out.quiz = {
      question: data.questionText || '',
      options: (data.answerOptions || '').split('\n').map(s => s.trim()).filter(Boolean),
      correct: data.correctAnswer || '',
      popupCorrect: data.popupCorrect || '',
      popupWrong: data.popupWrong || ''
    };
  }

  out.banners = buildBannerChecklist(data).map(b => b.filename);
  out.packages = buildPackageList(data);
  if (needsPrivacyGuide(data.typeKey, data.subType)) out.privacyGuideRequired = true;

  return out;
}
