/**
 * 기획안 양식 검토용 샘플 문서 생성기.
 *
 *   node tools/sample-plandoc.mjs
 *
 * 어드민을 띄우지 않고도 완성된 기획안을 눈으로 확인하고 인쇄까지 해볼 수 있게,
 * 샘플 입력 한 벌을 넣어 docs/기획안-샘플.html 로 뽑습니다.
 * 화면 스타일은 style.css 를 그대로 끼워 넣어 단독 파일로 열립니다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { planDocHtml } from '../assets/js/plandoc.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 실제 운영 건(수요 1+1 무비 쿠폰)에 가깝게 채운 입력 */
const sample = {
  typeKey: 'coupon',
  subType: '선착순쿠폰',
  docVersion: '수정 기획안(261028)',

  eventName: '수요 1+1 무비 쿠폰',
  eventId: 'NA0000000000',
  eventStartTime: '2026-11-04T00:00:00',
  eventEndTime: '2026-11-25T23:59:59',
  logPageId: '/event/coupon',
  bgColor: '#2f2e2b',
  channels: ['인앱', '웹'],
  owner: '김기획',
  team: '마케팅',

  policyNum: 'A1PR0000000000000000',
  ifGubun: 'SKBIFC001',
  maxParticipationCount: 1,
  btnId: 'coupon20',
  btnLabel: '20% 할인 쿠폰 다운로드',

  popupSuccess: '쿠폰이 발급되었습니다.',
  popupExhaust: '준비된 쿠폰이 모두 소진되었습니다. 다음 이벤트를 기대해주세요.',
  popupAlready: '이미 쿠폰을 받으셨습니다. 다시 확인해주세요.',
  popupFail: '일시적 오류로 쿠폰이 발급되지 않았습니다.<br> 다시 시도해주세요.',
  popupFailEventTime: '이벤트 시간을 확인해 주세요.',

  workItems: ['빅배너', '이벤트배너', '상세', '팝업', '1단 메뉴카드'],
  deepLink: 'btvplus://my',

  copyMain: '수요일엔 영화 한 편 값으로 두 편',
  copySub: [
    '모바일 B tv에서 매주 수요일 쿠폰이 쏟아집니다',
    '놓치면 다음 주까지 기다려야 해요!'
  ].join('\n'),
  copyBody: [
    '2026년 11월 모바일 B tv 이벤트',
    '수요 1+1 무비 쿠폰',
    '2026.11.4 (수) ~ 11.25 (수)',
    '',
    '매주 수요일, 모바일 B tv에서 영화 할인 쿠폰을 드립니다.',
    '한 편 값으로 두 편을 즐기세요.',
    '',
    '쿠폰은 발급 후 14일간 사용할 수 있으며,',
    '선착순 소진 시 조기 종료될 수 있습니다.'
  ].join('\n'),
  joinSteps: [
    '모바일 B tv 앱을 실행합니다',
    '이벤트 페이지에서 쿠폰 받기 버튼을 누릅니다',
    'MY > 쿠폰함에서 발급된 쿠폰을 확인합니다'
  ].join('\n'),
  copyNote: [
    '*쿠폰은 1인 1회, 이벤트 기간 중 매주 수요일에만 발급됩니다.',
    '*모바일 B tv 미설치 고객은 다운로드 페이지로 연결됩니다.'
  ].join('\n'),

  prizes: [
    '20% 할인 쿠폰 | 1000',
    'OK캐쉬백 1만P | 50',
    'SSG 상품권 1만원 | 50'
  ].join('\n'),
  winnerAnnounceDate: '2026-12-02'
};

const css = fs.readFileSync(path.join(root, 'assets/css/style.css'), 'utf8');
const body = planDocHtml(sample);

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${sample.eventName} 기획안 (샘플)</title>
<style>
${css}

/* 단독 파일로 열었을 때의 여백 */
body { background: #f4f5f7; }
#planDoc {
  max-width: 900px;
  margin: 24px auto;
  max-height: none;
}
</style>
</head>
<body>
<div id="planDoc" class="plandoc-wrap">${body}</div>
</body>
</html>
`;

const out = path.join(root, 'docs/기획안-샘플.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`wrote ${out} (${html.length} chars)`);
