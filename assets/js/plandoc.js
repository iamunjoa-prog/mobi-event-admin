/**
 * 기획안 문서 생성기 — 구글 시트 "작업 요청서" 양식을 그대로 옮긴 인쇄용 HTML.
 *
 * 입력 한 벌에서 문서 전체를 만들고, 반복되는 법무 문구는
 * 여기 상수에서 이벤트명만 치환해 자동으로 채웁니다.
 * 나중에 xlsx·pptx 생성기도 buildPlanDoc 의 섹션 구조를 그대로 받아 씁니다.
 */
import { EVENT_TYPES, fieldsFor, needsPrivacyGuide, usesReward } from './schema.js';
import { toEventTime, buildBannerChecklist, buildPackageList } from './output.js';

const DAY = ['일', '월', '화', '수', '목', '금', '토'];

const IF_GUBUN_LABEL = {
  SKBIFC001: '쿠폰',
  SKBIFC002: 'B캐쉬',
  SKBIFC003: 'B포인트',
  SKBIFC004: '추천발급'
};

/** 이벤트마다 거의 바뀌지 않는 문구 — 이벤트명만 끼워 넣습니다. */
export const DEFAULT_CAUTIONS = [
  '본 이벤트는 내부 사정에 의해 별도 고지 없이 이벤트 기간이 조정되거나 이벤트가 종료될 수 있습니다.',
  '경품 수령을 위해 T 아이디 로그인 부탁 드립니다.',
  '실물 경품의 경우 제세공과금은 당사 부담이며, 경품 배송 및 제세공과금 처리를 위해 개인 정보를 수집합니다.',
  '포인트 경품은 제세공과금 제외 후 수령됩니다.',
  '경품 지급 시점까지 B tv 회원이셔야 하며, 이벤트 기간 종료 시 기준으로 탈퇴 시 경품 지급이 불가합니다.'
];

const PRIVACY_FOOTNOTES = {
  collect: [
    '본 동의는 이벤트 응모를 위한 개인 정보 수집/이용에 대한 동의로서, 동의를 거부할 권리가 있으나, 동의하지 않을 경우 이벤트에 응모하실 수 없습니다.',
    '법령에 따른 개인정보의 수집/이용, 계약의 이행·편의증진을 위한 개인정보 처리위탁 및 개인정보와 관련된 일반 사항은 서비스의 개인정보처리방침에 따릅니다.'
  ],
  trustee: [
    '본 동의는 이벤트 응모를 위한 개인정보 처리위탁에 대한 동의로서 동의를 거부할 권리가 있으나, 동의하지 않으실 경우 이벤트에 응모하실 수 없습니다.'
  ],
  thirdParty: [
    '이벤트 경품 제공을 위해 개인 정보가 제3자에게 제공됩니다. 개인 정보 제공을 거부하실 권리가 있으며, 거부 시 이벤트 참여가 제한됩니다.'
  ]
};

/* ---------- 작은 도구들 ---------- */

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 여러 줄 입력을 줄 배열로 */
export function lines(value) {
  return String(value ?? '').split('\n').map(s => s.trim()).filter(Boolean);
}

/** 'A | B' 형식의 여러 줄을 [[A, B], …] 로 */
export function pairs(value) {
  return lines(value).map(line => {
    const [left, ...rest] = line.split('|');
    return [left.trim(), rest.join('|').trim()];
  });
}

/** '2026-10-28T00:00' → '10.28(수)' */
export function shortDate(value) {
  if (!value) return '';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getMonth() + 1}.${date.getDate()}(${DAY[date.getDay()]})`;
}

export function dateRange(data) {
  const from = shortDate(data.eventStartTime);
  const to = shortDate(data.eventEndTime);
  if (!from && !to) return '';
  return `${from} ~ ${to}`;
}

/** '2026년 10월 이벤트 프로모션' */
function promoLabel(data) {
  const raw = data.eventStartTime;
  if (!raw) return '이벤트 프로모션';
  const date = new Date(String(raw).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '이벤트 프로모션';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 이벤트 프로모션`;
}

/* ---------- 섹션 조립 ---------- */

function metaRows(data) {
  const type = EVENT_TYPES[data.typeKey];
  const rows = [
    ['이벤트 유형', [type?.label, data.subType].filter(Boolean).join(' · ')],
    ['이벤트 ID', data.eventId],
    ['기간', [toEventTime(data.eventStartTime), toEventTime(data.eventEndTime)].filter(Boolean).join(' ~ ')],
    ['노출 채널', (data.channels || []).join(', ')],
    ['기획 담당', [data.owner, data.team].filter(Boolean).join(' / ')]
  ];
  if (usesReward(data.typeKey, data)) {
    rows.push(['정책번호', data.policyNum]);
    rows.push(['지급 수단', data.ifGubun ? `${IF_GUBUN_LABEL[data.ifGubun] || ''} (${data.ifGubun})` : '']);
    rows.push(['참여 가능 횟수', data.maxParticipationCount === 0 ? '제한 없음' : data.maxParticipationCount]);
  }
  if (data.minAppVersion) rows.push(['최소 앱 버전', data.minAppVersion]);
  return rows.filter(([, v]) => v !== '' && v !== undefined && v !== null);
}

function workItemsTable(data) {
  const field = fieldsFor(data.typeKey, data).find(f => f.key === 'workItems');
  const all = field ? field.options : [];
  const picked = Array.isArray(data.workItems) ? data.workItems : [];
  if (!all.length) return '';
  return `<table class="pd-grid">
    <tr>${all.map(i => `<th>${esc(i)}</th>`).join('')}</tr>
    <tr>${all.map(i => `<td class="pd-mark">${picked.includes(i) ? 'o' : '-'}</td>`).join('')}</tr>
  </table>`;
}

function linkRows(data) {
  const rows = [];
  if (data.applinkUploadNo) {
    rows.push(['applink', `http://mobilebtv.com:8080/view/v3.0/applink?type=event_url&id=${data.applinkUploadNo}`]);
  }
  if (data.deepLink) rows.push(['딥링크', data.deepLink]);
  if (data.logPageId) rows.push(['로그 페이지 ID', data.logPageId]);
  return rows;
}

function copyBlocks(data) {
  const blocks = [];
  if (data.copyMain) blocks.push({ label: '메인 카피', html: `<p class="pd-lead">${esc(data.copyMain)}</p>` });
  if (data.copySub) {
    blocks.push({
      label: '서브 카피',
      html: lines(data.copySub).map(l => `<p>${esc(l)}</p>`).join('')
    });
  }
  if (data.copyBody) {
    const paras = String(data.copyBody).split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    blocks.push({
      label: '상세 본문',
      html: paras.map(p => `<p>${lines(p).map(esc).join('<br>')}</p>`).join('')
    });
  }
  const steps = lines(data.joinSteps);
  if (steps.length) {
    blocks.push({
      label: '참여 방법',
      html: `<ol>${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`
    });
  }
  if (data.btnLabel) {
    blocks.push({
      label: '버튼',
      html: `<p><span class="pd-btn">${esc(data.btnLabel)}</span>${data.btnId ? ` <code>${esc(data.btnId)}</code>` : ''}</p>`
    });
  }
  const notes = lines(data.copyNote);
  if (notes.length) {
    blocks.push({ label: '주석', html: notes.map(n => `<p class="pd-note">${esc(n)}</p>`).join('') });
  }
  return blocks;
}

function prizeTable(data) {
  const rows = pairs(data.prizes);
  if (!rows.length) return '';
  const total = rows.reduce((sum, [, n]) => sum + (Number(n) || 0), 0);
  return `<table class="pd-table">
    <thead><tr><th>경품</th><th class="pd-num">당첨자수(명)</th></tr></thead>
    <tbody>${rows.map(([name, count]) =>
      `<tr><td>${esc(name)}</td><td class="pd-num">${esc(count)}</td></tr>`).join('')}</tbody>
    <tfoot><tr><th>합계</th><th class="pd-num">${total}</th></tr></tfoot>
  </table>`;
}

function attendTable(data) {
  const rows = pairs(data.attendPopups);
  if (!rows.length) return '';
  return `<table class="pd-table">
    <thead><tr><th class="pd-num">회차</th><th>팝업 문구</th></tr></thead>
    <tbody>${rows.map(([n, text]) =>
      `<tr><td class="pd-num">${esc(n)}</td><td>${esc(text)}</td></tr>`).join('')}</tbody>
  </table>`;
}

function consentBlock(title, bodyHtml, footnotes) {
  return `<div class="pd-consent">
    <h4>${esc(title)}</h4>
    ${bodyHtml}
    <p class="pd-agree">ㅁ 동의</p>
    ${footnotes.map(f => `<p class="pd-note">※ ${esc(f)}</p>`).join('')}
  </div>`;
}

function privacySection(data) {
  const name = data.eventName || '이벤트명';
  const items = data.privacyItems || '이름, 주소, 휴대 전화번호';
  const retention = data.privacyRetention || '이벤트 경품 제공 후 1개월 보관 후 파기';
  const trustee = data.privacyTrustee || 'SK 엠앤서비스';
  const third = data.privacyThirdParty || 'SK엠앤서비스(주), (주)SK플래닛';

  const collect = consentBlock(
    `<${name}> 개인정보 수집·이용 동의서`,
    `<p>&lt;${esc(name)}&gt; 와 관련하여, 본인의 개인정보를 SK브로드밴드가 수집 및 이용하는 것에 대해 동의합니다.</p>
     <table class="pd-table">
       <thead><tr><th>수집/이용 목적</th><th>수집 항목</th><th>보유기간</th></tr></thead>
       <tbody><tr>
         <td>본인 확인 및 응모 대상 검증, 이벤트 운영 및 당첨 경품 배송/지급 안내</td>
         <td>${esc(items)}</td><td>${esc(retention)}</td>
       </tr></tbody>
     </table>`,
    PRIVACY_FOOTNOTES.collect
  );

  const trusteeBlock = consentBlock(
    `<${name}> 개인정보 처리위탁 동의서`,
    `<p>&lt;${esc(name)}&gt; 와 관련하여, 본인의 개인정보처리 업무를 위탁합니다.</p>
     <table class="pd-table">
       <thead><tr><th>수탁사</th></tr></thead>
       <tbody><tr><td>${esc(trustee)}</td></tr></tbody>
     </table>`,
    PRIVACY_FOOTNOTES.trustee
  );

  const thirdBlock = consentBlock(
    `<${name}> 개인정보 제3자 제공 동의서`,
    `<p>&lt;${esc(name)}&gt; 와 관련하여, 본인의 개인정보를 SK브로드밴드가 다음과 같이 제3자에게 제공하는 것에 동의합니다.</p>
     <table class="pd-table">
       <thead><tr><th>제공받는 자</th><th>제공 목적</th><th>보유 기간</th></tr></thead>
       <tbody><tr><td>${esc(third)}</td><td>이벤트 진행 및 경품 배송</td><td>${esc(retention)}</td></tr></tbody>
     </table>`,
    PRIVACY_FOOTNOTES.thirdParty
  );

  return collect + trusteeBlock + thirdBlock;
}

function popupTable(data) {
  if (!usesReward(data.typeKey, data)) return '';
  const rows = [
    ['발급 성공', data.popupSuccess],
    ['수량 소진', data.popupExhaust],
    ['중복 참여', data.popupAlready],
    ['발급 실패', data.popupFail],
    ['기간 오류', data.popupFailEventTime],
    ['대상 아님', data.popupNotTarget]
  ].filter(([, v]) => v);
  if (!rows.length) return '';
  return `<table class="pd-table">
    <thead><tr><th>상황</th><th>문구</th></tr></thead>
    <tbody>${rows.map(([k, v]) =>
      `<tr><td>${esc(k)}</td><td>${esc(String(v).replace(/<br\s*\/?>/gi, ' '))}</td></tr>`).join('')}</tbody>
  </table>`;
}

function assetSection(data) {
  const banners = buildBannerChecklist(data);
  const packages = buildPackageList(data);
  if (!banners.length && !packages.length) return '';
  return `
    ${banners.length ? `<table class="pd-table">
      <thead><tr><th>파일명</th><th>용도</th></tr></thead>
      <tbody>${banners.map(b =>
        `<tr><td><code>${esc(b.filename)}</code></td><td>${esc(b.note)} · ${esc(b.channels)}</td></tr>`).join('')}</tbody>
    </table>` : ''}
    ${packages.length ? `<p class="pd-sublabel">퍼블 산출물 zip</p>
      <ul class="pd-list">${packages.map(p => `<li><code>${esc(p)}</code></li>`).join('')}</ul>` : ''}`;
}

/* ---------- 문서 전체 ---------- */

/**
 * 기획안 문서를 섹션 배열로. 인쇄 HTML 과 이후 xlsx·pptx 가 같은 구조를 씁니다.
 */
export function buildPlanDoc(data) {
  const sections = [];
  const push = (id, heading, html) => {
    if (html && String(html).trim()) sections.push({ id, heading, html });
  };

  push('meta', '기본 정보', `<table class="pd-table pd-meta">
    <tbody>${metaRows(data).map(([k, v]) =>
      `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody>
  </table>`);

  push('work', '작업 항목', workItemsTable(data));

  const links = linkRows(data);
  push('links', '링크', links.length ? `<table class="pd-table pd-meta">
    <tbody>${links.map(([k, v]) =>
      `<tr><th>${esc(k)}</th><td><code>${esc(v)}</code></td></tr>`).join('')}</tbody>
  </table>` : '');

  const blocks = copyBlocks(data);
  push('copy', '작업 요청서 — 노출 문구', blocks.length
    ? blocks.map(b => `<div class="pd-block">
        <p class="pd-sublabel">${esc(b.label)}</p>${b.html}
      </div>`).join('')
    : '<p class="pd-empty">기획안 카피를 입력하면 여기에 들어갑니다.</p>');

  const prizes = prizeTable(data);
  push('prize', '경품', prizes
    ? prizes + (data.winnerAnnounceDate
      ? `<p class="pd-sublabel">당첨자 발표일: ${esc(data.winnerAnnounceDate)}</p>` : '')
    : '');

  push('attend', '출석 회차별 팝업 문구', attendTable(data));
  push('popup', '팝업 문구', popupTable(data));

  const privacyNeeded = needsPrivacyGuide(data.typeKey, data.subType) ||
    data.privacyAgreement || pairs(data.prizes).length > 0;
  push('privacy', '개인정보 취합 사항', privacyNeeded ? privacySection(data) : '');

  const cautions = lines(data.cautions).length ? lines(data.cautions) : DEFAULT_CAUTIONS;
  push('caution', '유의사항',
    `<ul class="pd-list">${cautions.map(c => `<li>${esc(c)}</li>`).join('')}</ul>`);

  push('asset', '배너 에셋 · 퍼블 산출물', assetSection(data));

  return {
    title: data.eventName || '이벤트명 미입력',
    promo: promoLabel(data),
    subtitle: [dateRange(data), data.docVersion || '기획안'].filter(Boolean).join(' · '),
    sections
  };
}

/** 미리보기·인쇄에 그대로 넣는 HTML 한 덩어리 */
export function planDocHtml(data) {
  const doc = buildPlanDoc(data);
  return `<article class="plandoc">
    <header class="pd-head">
      <p class="pd-promo">${esc(doc.promo)}</p>
      <h1>${esc(doc.title)}</h1>
      <p class="pd-sub">${esc(doc.subtitle)}</p>
    </header>
    ${doc.sections.map(s => `<section class="pd-section" id="pd-${s.id}">
      <h2>${esc(s.heading)}</h2>
      ${s.html}
    </section>`).join('')}
  </article>`;
}
