/**
 * 이벤트 유형 정의
 *
 * 새 유형을 추가하려면 EVENT_TYPES 에 항목을 하나 더 넣으면 됩니다.
 * 필드 한 개의 형태:
 *   { key, label, type, required, group, help, placeholder, options, default, pattern }
 *   type: text | textarea | select | multiselect | datetime | number | color | checkbox
 */

export const GROUPS = ['기본 정보', '운영 정보', '지급 설정', '문항 설정', '노출 문구', '기획안 카피', '경품', '개인정보', '유의사항', '담당'];

/** 모든 유형에 공통으로 들어가는 필드 */
export const COMMON_FIELDS = [
  {
    key: 'eventName', label: '이벤트명', type: 'text', required: true, group: '기본 정보',
    placeholder: '수요 1+1 무비 쿠폰',
    help: '퍼블 파일의 title 과 eventnm 에 그대로 들어갑니다.'
  },
  {
    key: 'eventId', label: '이벤트 ID', type: 'text', required: true, group: '기본 정보',
    pattern: '^NA\\d{10}$', placeholder: 'NA0000000000',
    help: 'NA + 숫자 10자리. 퍼블 파일의 eventid.'
  },
  {
    key: 'eventStartTime', label: '이벤트 시작', type: 'datetime', required: true, group: '기본 정보',
    help: 'yyyy-mm-dd hh:mm:ss 로 변환되어 eventstarttime 에 들어갑니다.'
  },
  {
    key: 'eventEndTime', label: '이벤트 종료', type: 'datetime', required: true, group: '기본 정보',
    help: '보통 종료일 23:59:59 로 둡니다.'
  },
  {
    key: 'logPageId', label: '로그 페이지 ID', type: 'text', required: true, group: '운영 정보',
    placeholder: '/event/coupon', help: 'logPageId. 유형을 고르면 기본값이 채워집니다.'
  },
  {
    key: 'bgColor', label: '페이지 배경색', type: 'color', required: false, group: '운영 정보',
    default: '#000000', help: 'body 의 background-color.'
  },
  {
    key: 'minAppVersion', label: '최소 앱 버전', type: 'text', required: false, group: '운영 정보',
    placeholder: '4.7.0', help: '비워두면 버전 분기 없음.'
  },
  {
    key: 'channels', label: '노출 채널', type: 'multiselect', required: true, group: '운영 정보',
    options: ['인앱', '웹', '메인', 'Q&A'],
    help: '선택한 채널 수만큼 퍼블 zip 이 나옵니다.'
  },
  {
    key: 'owner', label: '기획 담당자', type: 'text', required: true, group: '담당'
  },
  {
    key: 'team', label: '담당 팀', type: 'select', required: false, group: '담당',
    options: ['마케팅', '콘텐츠', '플랫폼', '제휴']
  },
  {
    key: 'memo', label: '비고', type: 'textarea', required: false, group: '담당'
  }
];

/** 지급형(쿠폰/B캐시) 공통 필드 */
const REWARD_FIELDS = [
  {
    key: 'policyNum', label: '정책번호', type: 'text', required: true, group: '지급 설정',
    placeholder: 'A1PR0000000000000000',
    help: '이벤트마다 반드시 새로 발급받아야 합니다. 재사용 금지.'
  },
  {
    key: 'ifGubun', label: '지급 수단', type: 'select', required: true, group: '지급 설정',
    options: [
      { value: 'SKBIFC001', label: '쿠폰 (SKBIFC001)' },
      { value: 'SKBIFC002', label: 'B캐쉬 (SKBIFC002)' },
      { value: 'SKBIFC003', label: 'B포인트 (SKBIFC003)' },
      { value: 'SKBIFC004', label: '추천발급 (SKBIFC004)' }
    ],
    help: '퍼블 파일의 IF_GUBUN.'
  },
  {
    key: 'maxParticipationCount', label: '최대 참여 횟수', type: 'number', required: true,
    group: '지급 설정', default: 1, help: '0 이면 제한 없음.'
  },
  {
    key: 'btnId', label: '버튼 ID', type: 'text', required: true, group: '지급 설정',
    placeholder: 'coupon20', help: 'a 태그의 id. submit() 인자와 같아야 합니다.'
  },
  {
    key: 'btnLabel', label: '버튼 문구', type: 'text', required: true, group: '지급 설정',
    placeholder: '20% 할인 쿠폰 다운로드',
    help: 'data-value 와 로그 config 값으로 함께 쓰입니다.'
  }
];

/** 지급형 팝업 문구 — 기본값이 있어 그대로 써도 됩니다 */
const REWARD_POPUP_FIELDS = [
  {
    key: 'popupSuccess', label: '발급 성공', type: 'text', required: true, group: '노출 문구',
    default: '쿠폰이 발급되었습니다.'
  },
  {
    key: 'popupExhaust', label: '수량 소진', type: 'text', required: true, group: '노출 문구',
    default: '준비된 쿠폰이 모두 소진되었습니다. 다음 이벤트를 기대해주세요.'
  },
  {
    key: 'popupAlready', label: '중복 참여', type: 'text', required: true, group: '노출 문구',
    default: '이미 쿠폰을 받으셨습니다. 다시 확인해주세요.'
  },
  {
    key: 'popupFail', label: '발급 실패', type: 'text', required: true, group: '노출 문구',
    default: '일시적 오류로 쿠폰이 발급되지 않았습니다.<br> 다시 시도해주세요.'
  },
  {
    key: 'popupFailEventTime', label: '기간 오류', type: 'text', required: true, group: '노출 문구',
    default: '이벤트 시간을 확인해 주세요.'
  },
  {
    key: 'popupNotTarget', label: '대상 아님 (선택)', type: 'text', required: false, group: '노출 문구',
    placeholder: 'B tv+ 가입 후 참여해주세요.',
    help: '대상 한정 이벤트일 때만 채웁니다.'
  }
];

/**
 * 기획안 문서용 필드.
 * 퍼블 변수가 아니라 작업 요청서·시안 덱의 본문을 채우는 값이라,
 * planDoc: true 로 표시해 "기획안 표" 요약에서는 빼고 문서에서만 씁니다.
 */
export const PLAN_FIELDS = [
  {
    key: 'docVersion', label: '문서 버전', type: 'text', required: false, group: '기본 정보',
    planDoc: true, placeholder: '수정 기획안(251028)',
    help: '표지에 들어갑니다. 비우면 "기획안" 으로 표기됩니다.'
  },
  {
    key: 'workItems', label: '작업 항목', type: 'multiselect', required: false, group: '운영 정보',
    planDoc: true,
    options: ['빅배너', '이벤트배너', '띠배너', '상세', '팝업', 'MMS', '1단 메뉴카드', '2단 메뉴카드'],
    help: '작업 요청서 상단 체크표. 고른 항목만 o 로 표시됩니다.'
  },
  {
    key: 'deepLink', label: '딥링크', type: 'text', required: false, group: '운영 정보',
    planDoc: true, placeholder: 'btvplus://fast_ch',
    help: '본문 버튼이 앱 내부 화면으로 보낼 때.'
  },

  {
    key: 'copyMain', label: '메인 카피', type: 'text', required: false, group: '기획안 카피',
    planDoc: true, placeholder: '매일매일 혜택이 터져써머',
    help: '배너·팝업에 공통으로 들어가는 한 줄.'
  },
  {
    key: 'copySub', label: '서브 카피', type: 'textarea', required: false, group: '기획안 카피',
    planDoc: true, placeholder: '모바일 B tv에서 여름 혜택이 쏟아집니다',
    help: '한 줄에 하나씩. 배너 하단 문구로 쓰입니다.'
  },
  {
    key: 'copyBody', label: '상세 본문', type: 'textarea', required: false, group: '기획안 카피',
    planDoc: true,
    help: '이벤트 페이지 상세 영역 전문. 빈 줄로 문단을 나눕니다.'
  },
  {
    key: 'joinSteps', label: '참여 방법', type: 'textarea', required: false, group: '기획안 카피',
    planDoc: true, placeholder: '모바일 B tv 홈에서 내 프로필 아이콘을 누릅니다',
    help: '한 줄에 한 단계. 번호는 자동으로 붙습니다.'
  },
  {
    key: 'copyNote', label: '주석 · 강조 문구', type: 'textarea', required: false, group: '기획안 카피',
    planDoc: true, placeholder: '*모바일 B tv 미설치 고객은 다운로드 페이지로 연결됩니다.',
    help: '한 줄에 하나씩.'
  },
  {
    key: 'attendPopups', label: '출석 회차별 팝업 문구', type: 'textarea', required: false,
    group: '기획안 카피', planDoc: true,
    placeholder: '1 | 1회 출첵 완료! B캐시가 적립되었어요!',
    help: '출석체크형일 때만. 회차 | 문구 형식으로 한 줄에 하나씩.'
  },

  {
    key: 'prizes', label: '경품 목록', type: 'textarea', required: false, group: '경품',
    planDoc: true, placeholder: 'OK캐쉬백 500만P | 1',
    help: '경품명 | 당첨자수 형식으로 한 줄에 하나씩.'
  },
  {
    key: 'winnerAnnounceDate', label: '당첨자 발표일', type: 'text', required: false, group: '경품',
    planDoc: true, placeholder: '2025-10-23'
  },

  {
    key: 'privacyItems', label: '수집 항목', type: 'text', required: false, group: '개인정보',
    planDoc: true, default: '이름, 주소, 휴대 전화번호'
  },
  {
    key: 'privacyRetention', label: '보유 기간', type: 'text', required: false, group: '개인정보',
    planDoc: true, default: '이벤트 경품 제공 후 1개월 보관 후 파기'
  },
  {
    key: 'privacyTrustee', label: '처리위탁 수탁사', type: 'text', required: false, group: '개인정보',
    planDoc: true, default: 'SK 엠앤서비스'
  },
  {
    key: 'privacyThirdParty', label: '제3자 제공받는 자', type: 'text', required: false,
    group: '개인정보', planDoc: true, default: 'SK엠앤서비스(주), (주)SK플래닛'
  },

  {
    key: 'cautions', label: '유의사항', type: 'textarea', required: false, group: '유의사항',
    planDoc: true,
    help: '한 줄에 하나씩. 비우면 기본 문구가 들어갑니다.'
  }
];

/**
 * 이벤트 유형 트리
 *
 *   유형(EVENT_TYPES) → 세부 유형(subTypes) → 세부 유형 전용 필드
 *   세부 유형 안에서 또 갈라지는 항목은 필드의 showIf 로 처리합니다.
 *     showIf: { key: 'fcfsReopen', in: [true] }   // 그 값일 때만 보임
 *
 * 세부 유형 한 개의 형태:
 *   { desc, reward, privacy, defaults, fields }
 *     reward  : 지급 설정(정책번호·IF_GUBUN·버튼)을 필수로 쓰는지
 *     privacy : 개인정보보호 가이드 적용 대상인지
 */

const yesNo = (key, label, group, help, dflt = false) => ({
  key, label, type: 'checkbox', required: false, group, help, default: dflt
});

/** 월정액 가입 여부로 판단하는 유형(A1·A2) 공통 항목 */
const MONTHLY_FIELDS = [
  {
    key: 'pid', label: '월정액 PID', type: 'text', required: true, group: '지급 설정',
    placeholder: '1000000', help: '가입 여부를 판단할 월정액 상품의 PID.'
  },
  {
    key: 'productTitle', label: '상품 제목 (title)', type: 'text', required: true,
    group: '지급 설정', placeholder: 'OCEAN', help: '월정액 상품명.'
  }
];

/**
 * 쿠폰·포인트 정책 줄.
 * 한 이벤트에 여러 정책을 걸 수 있어 한 줄에 하나씩 적습니다.
 */
const REWARD_ROWS = {
  nonMember: {
    key: 'rewardNonMember', label: '미가입자용 리워드', type: 'textarea', required: true,
    group: '지급 설정',
    placeholder: 'OCEAN 1개월 3,300원 할인쿠폰 | 1 | A1PR0000000000000003',
    help: '리워드명 | 구분(1 쿠폰, 2 B포인트) | 정책번호 형식으로 한 줄에 하나씩.'
  },
  member: {
    key: 'rewardMember', label: '기가입자용 리워드', type: 'textarea', required: true,
    group: '지급 설정',
    placeholder: 'B포인트 3,000P | 2 | NBPR0000000000000000',
    help: '리워드명 | 구분(1 쿠폰, 2 B포인트) | 정책번호 형식으로 한 줄에 하나씩.'
  }
};

export const EVENT_TYPES = {
  coupon: {
    label: '쿠폰 / 리워드',
    desc: '쿠폰·B캐시·B포인트를 지급하는 이벤트. 퍼블 파일에서 지급 API를 직접 호출합니다.',
    defaults: { logPageId: '/event/coupon', eventTypeCode: 'reward' },
    subTypeHelp: '지급 방식에 따라 아래 입력 항목이 달라집니다.',
    /** 세 세부 유형이 공통으로 쓰는 항목 */
    fields: [...REWARD_FIELDS, ...REWARD_POPUP_FIELDS],
    subTypes: {
      '일반쿠폰': {
        desc: '기간 내 누구나 1회 받는 기본형',
        reward: true, privacy: false,
        fields: [
          yesNo('useWeekdayFile', '요일별 퍼블 파일 사용', '지급 설정',
            '요일마다 다른 쿠폰을 줄 때 켭니다.'),
          {
            key: 'weekdayPlan', label: '요일별 쿠폰 구성', type: 'textarea', required: true,
            group: '지급 설정', showIf: { key: 'useWeekdayFile', truthy: true },
            placeholder: '월 | 20% 할인 쿠폰 | A1PR...',
            help: '요일 | 쿠폰명 | 정책번호 형식으로 한 줄에 하나씩. 요일마다 정책번호가 다릅니다.'
          }
        ]
      },
      '선착순쿠폰': {
        desc: '수량 한정. 소진되면 마감',
        reward: true, privacy: true,
        fields: [
          {
            key: 'fcfsTotal', label: '선착순 수량', type: 'number', required: true,
            group: '지급 설정', help: '전체 지급 가능 수량.'
          },
          {
            key: 'fcfsOpenTime', label: '오픈 시각', type: 'text', required: false,
            group: '지급 설정', placeholder: '10:00:00',
            help: '매일 정해진 시각에 여는 경우에만. 비우면 이벤트 시작과 동시에 오픈.'
          },
          yesNo('fcfsReopen', '일 단위 재오픈', '지급 설정',
            '매일 수량을 새로 푸는 방식이면 켭니다.'),
          {
            key: 'fcfsPerDay', label: '일별 오픈 수량', type: 'number', required: true,
            group: '지급 설정', showIf: { key: 'fcfsReopen', truthy: true },
            help: '하루에 풀리는 수량.'
          },
          {
            key: 'fcfsCounterShown', label: '잔여 수량 노출', type: 'checkbox', required: false,
            group: '노출 문구', help: '페이지에 남은 수량을 표시할지.'
          }
        ]
      },
      '랜덤쿠폰': {
        desc: '여러 경품 중 하나를 확률로 지급',
        reward: true, privacy: true,
        fields: [
          {
            key: 'randomPool', label: '랜덤 경품 구성', type: 'textarea', required: true,
            group: '지급 설정', placeholder: '20% 할인 쿠폰 | 30 | A1PR...',
            help: '경품명 | 비중(%) | 정책번호 형식으로 한 줄에 하나씩. 비중 합이 100 이어야 합니다.'
          },
          {
            key: 'randomDrawCount', label: '1인당 추첨 횟수', type: 'number', required: true,
            group: '지급 설정', default: 1
          },
          {
            key: 'randomResultUi', label: '결과 연출', type: 'select', required: true,
            group: '노출 문구', options: ['팝업만', '룰렛', '박스 열기'],
            help: '룰렛·박스는 퍼블 작업량이 늘어납니다.'
          },
          {
            key: 'rouletteSlices', label: '룰렛 칸 수', type: 'number', required: true,
            group: '노출 문구', showIf: { key: 'randomResultUi', in: ['룰렛'] },
            help: '경품 수와 맞추거나 꽝 칸을 더합니다.'
          }
        ]
      }
    }
  },

  attend: {
    label: '출석체크',
    desc: '기간 동안 매일 눌러 뱃지를 모으는 유형. 포인트 지급 여부로 세팅이 갈립니다. (프로모션 유형 다양화 1차)',
    defaults: { logPageId: '/event/attend', eventTypeCode: 'reward', ifGubun: 'SKBIFC003' },
    subTypeHelp: '포인트 지급 여부에 따라 정책번호 세팅이 달라집니다.',
    fields: [
      {
        key: 'attendBadgeCount', label: '출석 뱃지 개수', type: 'number', required: true,
        group: '지급 설정', default: 7, help: '페이지에 찍히는 출석 칸 수.'
      },
      {
        key: 'attendExcludeDays', label: '출석 제외 요일', type: 'multiselect', required: false,
        group: '지급 설정', options: ['월', '화', '수', '목', '금', '토', '일'],
        help: '비우면 매일 출석.'
      },
      ...REWARD_FIELDS,
      ...REWARD_POPUP_FIELDS
    ],
    subTypes: {
      '포인트 지급형': {
        desc: '출첵 시 B포인트 적립',
        reward: true, privacy: false,
        fields: [
          {
            key: 'attendPointAmount', label: '1회 적립 포인트', type: 'number', required: true,
            group: '지급 설정', default: 100, help: '정책번호에 설정된 값과 맞춰 적습니다.'
          }
        ]
      },
      '포인트 미지급형': {
        desc: '적립 없이 출석 기록만',
        reward: false, privacy: false,
        fields: [
          // 유형 공통 policyNum 을 덮어씁니다 — 이 유형은 고정값 nopoint 를 넣습니다.
          {
            key: 'policyNum', label: '포인트 정책번호', type: 'text', required: true,
            group: '지급 설정', default: 'nopoint', pattern: '^nopoint$',
            help: '미지급형은 반드시 nopoint 로 넣습니다. 이 값이면 출석해도 포인트가 적립되지 않습니다.'
          }
        ]
      }
    }
  },

  quiz: {
    label: '퀴즈',
    desc: '정답 확인형. 설문조사와 구조가 거의 같고 정답 판정이 추가됩니다.',
    defaults: { logPageId: '/event/quiz', eventTypeCode: 'quiz' },
    subTypeHelp: '리워드 지급 여부에 따라 지급 설정이 필수로 바뀝니다.',
    fields: [
      {
        key: 'questionText', label: '문제', type: 'textarea', required: true, group: '문항 설정'
      },
      {
        key: 'answerOptions', label: '보기', type: 'textarea', required: true, group: '문항 설정',
        placeholder: 'O\nX', help: '한 줄에 하나씩.'
      },
      {
        key: 'correctAnswer', label: '정답', type: 'text', required: true, group: '문항 설정',
        help: '보기 중 하나와 정확히 일치해야 합니다.'
      },
      {
        key: 'popupCorrect', label: '정답 팝업 문구', type: 'text', required: true,
        group: '노출 문구', default: '정답입니다!'
      },
      {
        key: 'popupWrong', label: '오답 팝업 문구', type: 'text', required: true,
        group: '노출 문구', default: '아쉽게도 오답입니다.'
      }
    ],
    subTypes: {
      '정답 확인형': {
        desc: '정답만 확인하고 끝. 지급 없음',
        reward: false, privacy: true,
        fields: [
          {
            key: 'retryAllowed', label: '오답 시 재시도 허용', type: 'checkbox', required: false,
            group: '문항 설정', default: true
          }
        ]
      },
      '정답 리워드': {
        desc: '정답자에게 쿠폰·포인트 지급',
        reward: true, privacy: true,
        fields: [
          {
            key: 'rewardOnWrong', label: '오답자도 지급', type: 'checkbox', required: false,
            group: '지급 설정', help: '참여 리워드 성격이면 켭니다.'
          },
          ...REWARD_FIELDS,
          ...REWARD_POPUP_FIELDS
        ]
      }
    }
  },

  survey: {
    label: '투표 / 설문',
    desc: '문항을 만들어 응답을 받는 유형. 페어링 고객만 참여할 수 있고 디바이스 기준 1회만 참여됩니다.',
    defaults: { logPageId: '/event/survey', eventTypeCode: 'survey' },
    subTypeHelp: '문항을 어떤 형태로 세팅하는지에 따라 입력 항목이 달라집니다.',
    fields: [
      {
        key: 'noticeImage', label: '이벤트 안내 영역 이미지', type: 'text', required: false,
        group: '운영 정보', placeholder: 'notice_투표이벤트.png',
        help: '문항 위에 들어가는 안내 이미지 파일명.'
      },
      {
        key: 'redirectHigh', label: '앱 버전 이상일 때 이동 URL', type: 'text', required: false,
        group: '운영 정보', help: 'index.html 의 redirectUrls.high.'
      },
      {
        key: 'redirectLow', label: '앱 버전 미만일 때 이동 URL', type: 'text', required: false,
        group: '운영 정보', help: 'index.html 의 redirectUrls.low.'
      }
    ],
    subTypes: {
      '투표 / 설문 (문항형)': {
        desc: '문항 유형 5종으로 세팅. 1차 스펙 (결과보기 제외)',
        reward: false, privacy: true,
        fields: [
          {
            key: 'questionPlan', label: '문항 구성', type: 'textarea', required: true,
            group: '문항 설정',
            placeholder: '1 | 객관식 이미지형(세로) | 가장 기대되는 작품은? | 작품A;작품B;작품C\n2 | 주관식 단답형 | 한 줄 응원',
            help: '번호 | 문항 유형 | 질문 | 보기(세미콜론 구분) 형식으로 한 줄에 하나씩. ' +
              '문항 유형: 객관식 이미지형(세로) / 객관식 이미지형(가로) / 객관식 텍스트형 / 주관식 단답형 / 주관식 서술형. ' +
              '최대 20문항, 문항당 보기 최대 6개. 주관식은 보기를 비웁니다.'
          },
          {
            key: 'answerImages', label: '보기 이미지 파일명', type: 'textarea', required: true,
            group: '문항 설정', showIf: { key: 'questionPlan', match: '이미지형' },
            placeholder: '1-1 | vote_01_a.png',
            help: '문항번호-보기번호 | 파일명 형식. 이미지형 문항이 있을 때만 필요합니다.'
          },
          {
            key: 'participantCountShown', label: '참여자 수 노출', type: 'checkbox', required: false,
            group: '노출 문구', default: true,
            help: '디바이스 ID 기준. 안내 이미지와 문항 사이에 표시됩니다.'
          },
          {
            key: 'cautionArea', label: '하단 유의사항 (caution-area)', type: 'textarea',
            required: true, group: '노출 문구',
            default: '투표 참여를 위해서는 B tv와 모바일 B tv 연결이 필요합니다.',
            help: '페이지 하단에 들어가는 안내 문구.'
          }
        ]
      },
      '참여 리워드': {
        desc: '응답 완료 시 쿠폰·포인트 지급',
        reward: true, privacy: false,
        fields: [
          {
            key: 'choiceCount', label: '객관식 문항 수', type: 'number', required: true,
            group: '문항 설정', default: 1, help: '샘플은 최대 3개까지 지원합니다.'
          },
          {
            key: 'choiceNames', label: '객관식 문항 class name', type: 'textarea', required: false,
            group: '문항 설정', placeholder: 'ticketChoice\nbest-cut\nbest-movie-text',
            help: '한 줄에 하나씩. HTML 마크업과 반드시 동기화되어야 합니다.'
          },
          {
            key: 'subjectiveCount', label: '주관식 문항 수', type: 'number', required: true,
            group: '문항 설정', default: 0, help: '샘플은 최대 2개까지 지원합니다.'
          },
          {
            key: 'subjectiveLengths', label: '주관식 글자수 제한', type: 'text', required: false,
            group: '문항 설정', placeholder: '20, 50', help: '문항 순서대로 쉼표로 구분.'
          },
          {
            key: 'rewardCondition', label: '지급 조건', type: 'select', required: true,
            group: '지급 설정', options: ['전 문항 응답', '객관식만 응답', '1문항 이상 응답'],
            default: '전 문항 응답'
          },
          ...REWARD_FIELDS,
          ...REWARD_POPUP_FIELDS
        ]
      }
    }
  },

  instant: {
    label: '월정액 / 상품 구매 지급',
    desc: '월정액 가입이나 상품 구매 여부를 확인해 쿠폰·B포인트를 즉시 지급하는 유형. ' +
      '디바이스 기준으로 사용자를 보고 지급은 STB ID 기준입니다. (policytype A1·A2·B1)',
    defaults: { logPageId: '/event/coupon', eventTypeCode: 'reward' },
    subTypeHelp: '판단 기준(월정액·상품)과 지급 대상에 따라 policytype 과 입력 항목이 달라집니다.',
    fields: [
      {
        key: 'noticeImage', label: '이벤트 안내 영역 이미지', type: 'text', required: false,
        group: '운영 정보', placeholder: 'notice_OCEAN가입이벤트.png'
      },
      {
        key: 'joinBtnLabel', label: '이벤트 참여 버튼 문구', type: 'text', required: true,
        group: '운영 정보', default: '혜택 받기'
      },
      {
        key: 'dupLimitSet', label: 'CBS 정책에 중복 발급 제한 설정 완료', type: 'checkbox',
        required: false, group: '지급 설정',
        help: 'STB ID 한 대에 복수 혜택이 나가지 않게 하려면 정책 쪽에서 막아야 합니다.'
      },
      ...REWARD_POPUP_FIELDS
    ],
    subTypes: {
      'A1-1 월정액 미가입자 지급': {
        desc: '미가입자에게만 지급. 가입 유도용',
        reward: true, privacy: false,
        defaults: { policyType: 'A1-1' },
        fields: [...MONTHLY_FIELDS, REWARD_ROWS.nonMember]
      },
      'A1-2 미가입자 + 가입자': {
        desc: '미가입자 우선. 가입자는 안내 또는 지급',
        reward: true, privacy: false,
        defaults: { policyType: 'A1-2' },
        fields: [
          ...MONTHLY_FIELDS,
          REWARD_ROWS.nonMember,
          {
            key: 'memberHandling', label: '기가입자 처리', type: 'select', required: true,
            group: '지급 설정', options: ['기가입 안내 메시지 노출', '기가입자 대상 지급'],
            default: '기가입자 대상 지급'
          },
          {
            ...REWARD_ROWS.member,
            showIf: { key: 'memberHandling', in: ['기가입자 대상 지급'] }
          },
          {
            key: 'memberMessage', label: '기가입 안내 메시지', type: 'text', required: true,
            group: '노출 문구', showIf: { key: 'memberHandling', in: ['기가입 안내 메시지 노출'] },
            default: '이미 가입하신 고객입니다.'
          }
        ]
      },
      'A2-1 월정액 가입자 지급': {
        desc: '가입 기준을 만족한 고객에게만 지급',
        reward: true, privacy: false,
        defaults: { policyType: 'A2-1' },
        fields: [...MONTHLY_FIELDS, REWARD_ROWS.member]
      },
      'A2-2 가입자 + 미가입자': {
        desc: '가입자 우선. 미가입자는 제외 또는 지급',
        reward: true, privacy: false,
        defaults: { policyType: 'A2-2' },
        fields: [
          ...MONTHLY_FIELDS,
          REWARD_ROWS.member,
          {
            key: 'nonMemberHandling', label: '미가입자 처리', type: 'select', required: true,
            group: '지급 설정', options: ['대상 제외 메시지 노출', '미가입자 대상 지급'],
            default: '미가입자 대상 지급'
          },
          {
            ...REWARD_ROWS.nonMember,
            showIf: { key: 'nonMemberHandling', in: ['미가입자 대상 지급'] }
          },
          {
            key: 'nonMemberMessage', label: '대상 제외 메시지', type: 'text', required: true,
            group: '노출 문구', showIf: { key: 'nonMemberHandling', in: ['대상 제외 메시지 노출'] },
            default: '이벤트 대상 고객이 아닙니다.'
          }
        ]
      },
      'B1 상품 미구매자 지급': {
        desc: 'PPV·PPS·PPP 미구매 고객에게 지급',
        reward: true, privacy: false,
        defaults: { policyType: 'B1' },
        fields: [
          {
            key: 'productScope', label: '기준 상품 수', type: 'select', required: true,
            group: '지급 설정', options: ['상품 1개', '상품 여러개'], default: '상품 1개',
            help: '여러개면 상품마다 다른 쿠폰을 겁니다.'
          },
          {
            key: 'ptype', label: '상품타입 (ptype)', type: 'select', required: true,
            group: '지급 설정', showIf: { key: 'productScope', in: ['상품 1개'] },
            options: [
              { value: '10', label: 'PPV (10)' },
              { value: '20', label: 'PPS (20)' },
              { value: '41', label: 'PPP (41)' }
            ]
          },
          {
            key: 'epsdid', label: '에피소드 ID (epsdid)', type: 'text', required: true,
            group: '지급 설정', showIf: { key: 'productScope', in: ['상품 1개'] },
            placeholder: 'CE0000000001',
            help: 'PPV·PPS 는 에피소드 ID 로 구매 여부를 봅니다. PPP 는 묶인 에피소드를 쉼표로 나열합니다.'
          },
          {
            key: 'srisid', label: '시리즈 ID (srisid)', type: 'text', required: true,
            group: '지급 설정', showIf: { key: 'ptype', in: ['41'] },
            placeholder: 'CS00000001', help: 'PPP 일 때만 필요합니다.'
          },
          {
            key: 'productTitle', label: '상품 제목 (title)', type: 'text', required: true,
            group: '지급 설정', showIf: { key: 'productScope', in: ['상품 1개'] },
            placeholder: '코코[한글자막]'
          },
          {
            key: 'rewardSingle', label: '기준 상품 리워드', type: 'textarea', required: true,
            group: '지급 설정', showIf: { key: 'productScope', in: ['상품 1개'] },
            placeholder: '20% 할인 쿠폰 | 1 | A1PR0000000000000001',
            help: '리워드명 | 구분(1 쿠폰, 2 B포인트) | 정책번호.'
          },
          {
            key: 'productRows', label: '기준 상품 목록', type: 'textarea', required: true,
            group: '지급 설정', showIf: { key: 'productScope', in: ['상품 여러개'] },
            placeholder: 'CE0000000002 | - | 10 | 초속 5센티미터[한글자막] | 20% 할인 쿠폰 | 1 | A1PR0000000000000002',
            help: '에피소드ID | 시리즈ID | ptype | 상품명 | 리워드명 | 구분(1·2) | 정책번호 형식으로 한 줄에 하나씩. ' +
              'PPP(41) 는 에피소드 ID 를 쉼표로 묶고 시리즈 ID 를 함께 적습니다.'
          }
        ]
      }
    }
  },

  launch: {
    label: '영화 신작 런칭',
    desc: '경품·리워드 안내만 하고 응모는 applink 로 모바일 B tv 페이지에 넘기는 유형. 지급 로직이 없습니다.',
    defaults: { logPageId: '/event/launch' },
    subTypeHelp: '응모를 어디서 받는지에 따라 입력 항목이 달라집니다.',
    fields: [
      {
        key: 'contentTitle', label: '대상 콘텐츠명', type: 'text', required: true, group: '기본 정보',
        placeholder: '도그 스타: 마지막 희망'
      },
      {
        key: 'btnId', label: '버튼 ID', type: 'text', required: true, group: '운영 정보',
        placeholder: 'coupon10000'
      },
      {
        key: 'btnLabel', label: '버튼 문구', type: 'text', required: true, group: '운영 정보',
        default: '모바일 B tv에서 응모하기'
      },
      {
        key: 'rewardGuide', label: '경품 / 리워드 안내 문구', type: 'textarea', required: true,
        group: '노출 문구', help: '페이지에 노출할 경품 구성과 당첨자 발표 안내.'
      }
    ],
    subTypes: {
      '응모 이관형': {
        desc: '웹에서 안내하고 응모는 인앱 페이지로',
        reward: false, privacy: false,
        fields: [
          {
            key: 'applinkUploadNo', label: '응모 페이지 업로드 번호', type: 'text', required: true,
            group: '운영 정보', placeholder: '27589',
            help: '퍼블 업로드 후 받는 번호. applink 의 id 파라미터에 들어갑니다.'
          }
        ]
      },
      '자체 응모형': {
        desc: '이 페이지에서 바로 응모 접수',
        reward: false, privacy: true,
        fields: [
          {
            key: 'privacyAgreement', label: '개인정보 동의 아코디언 포함', type: 'checkbox',
            required: false, group: '운영 정보', default: true,
            help: '필수 항목 전체 동의 시 응모 버튼이 활성화됩니다.'
          },
          {
            key: 'entryFields', label: '응모 입력 항목', type: 'multiselect', required: true,
            group: '개인정보', options: ['이름', '휴대폰 번호', '주소', '이메일'],
            help: '받는 항목이 늘수록 개인정보 고지 문구도 같이 늘어납니다.'
          },
          {
            key: 'drawDate', label: '추첨일', type: 'text', required: true, group: '경품',
            placeholder: '2026-11-05'
          }
        ]
      },
      '딥링크 안내형': {
        desc: '응모 없이 콘텐츠 상세로만 보냄',
        reward: false, privacy: false,
        fields: [
          {
            key: 'contentDeepLink', label: '콘텐츠 딥링크', type: 'text', required: true,
            group: '운영 정보', placeholder: 'btvplus://content?id=...'
          }
        ]
      }
    }
  }
};

/** 채널별로 필요한 배너 에셋 */
export const BANNER_ASSETS = [
  { name: 'Home_BIg Banner', channels: ['인앱', '메인'], note: '홈 빅배너' },
  { name: '태블릿_bigbanner', channels: ['인앱', '메인'], note: '태블릿 빅배너' },
  { name: 'Title Box', channels: ['인앱', '메인', '웹'], note: '타이틀 박스' },
  { name: '1.5단블록배너', channels: ['인앱', '메인'], note: '블록배너. 1단으로 대체 가능' },
  { name: 'event_banner', channels: ['인앱', '웹'], note: '이벤트 배너' },
  { name: 'Btv+_Contents_banner', channels: ['인앱'], note: 'B tv+ 전용. 해당 시에만' },
  { name: 'Btv+_Contents_banner_태블릿', channels: ['인앱'], note: 'B tv+ 전용 태블릿' },
  { name: 'banner_popup', channels: ['인앱'], note: '팝업 배너. 필요 시' }
];

/* ---------- 유형 트리 조회 ---------- */

/** 선택된 세부 유형 정의 */
export function subTypeOf(typeKey, data = {}) {
  return EVENT_TYPES[typeKey]?.subTypes?.[data.subType] || null;
}

/** 세부 유형 선택 필드 — 유형 정의에서 자동으로 만듭니다 */
export function subTypeField(typeKey) {
  const type = EVENT_TYPES[typeKey];
  if (!type?.subTypes) return null;
  return {
    key: 'subType', label: '세부 유형', type: 'radio', required: true, group: '기본 정보',
    help: type.subTypeHelp,
    options: Object.entries(type.subTypes).map(([value, sub]) => ({
      value, label: value, desc: sub.desc
    }))
  };
}

/** showIf 조건을 만족해 화면에 보여야 하는 필드인지 */
export function isVisible(field, data = {}) {
  const cond = field.showIf;
  if (!cond) return true;
  const value = data[cond.key];
  if ('in' in cond) return cond.in.includes(value);
  if ('truthy' in cond) return Boolean(value) === cond.truthy;
  if ('match' in cond) return new RegExp(cond.match).test(String(value ?? ''));
  return true;
}

/** 투표/설문 문항 유형 (프로모션 유형 다양화 1차) */
export const QUESTION_TYPES = [
  '객관식 이미지형(세로)',
  '객관식 이미지형(가로)',
  '객관식 텍스트형',
  '주관식 단답형',
  '주관식 서술형'
];

export const QUESTION_LIMITS = {
  maxQuestions: 20,
  maxAnswers: 6,
  shortTextLength: 20,   // 주관식 단답형
  longTextLength: 50     // 주관식 서술형
};

/**
 * '번호 | 유형 | 질문 | 보기;보기' 로 적은 문항 구성을 파싱합니다.
 * 잘못 적은 줄은 error 에 사유가 담겨 돌아옵니다.
 */
export function parseQuestionPlan(text) {
  return String(text || '').split('\n').map(s => s.trim()).filter(Boolean).map((line, i) => {
    const [no, qType, question, answers = ''] = line.split('|').map(s => s.trim());
    const answerList = answers ? answers.split(';').map(s => s.trim()).filter(Boolean) : [];
    const row = { line: i + 1, no, type: qType, question, answers: answerList };
    const isChoice = (qType || '').startsWith('객관식');

    if (!qType || !QUESTION_TYPES.includes(qType)) row.error = `문항 유형이 올바르지 않습니다 (${qType || '비어 있음'})`;
    else if (!question) row.error = '질문 텍스트가 없습니다';
    else if (isChoice && answerList.length < 2) row.error = '객관식은 보기가 2개 이상이어야 합니다';
    else if (isChoice && answerList.length > QUESTION_LIMITS.maxAnswers) {
      row.error = `보기는 최대 ${QUESTION_LIMITS.maxAnswers}개입니다`;
    }
    return row;
  });
}

/** 세부 유형이 개인정보보호 가이드 적용 대상인지 */
export function needsPrivacyGuide(typeKey, subType) {
  return Boolean(EVENT_TYPES[typeKey]?.subTypes?.[subType]?.privacy);
}

/** 해당 유형에서 지급 설정이 실제로 필요한지 */
export function usesReward(typeKey, data = {}) {
  const sub = subTypeOf(typeKey, data);
  if (sub) return Boolean(sub.reward);
  return Boolean(data.policyNum);
}

/**
 * 유형 + 세부 유형 + 공통 필드를 합쳐 반환.
 * 세부 유형을 아직 고르지 않았으면 공통 필드와 유형 공통 필드만 나옵니다.
 */
export function fieldsFor(typeKey, data = {}) {
  const type = EVENT_TYPES[typeKey];
  if (!type) return [];
  const sub = subTypeOf(typeKey, data);
  const out = [];
  const seen = new Set();
  const push = (field) => {
    if (!field || seen.has(field.key)) return;
    seen.add(field.key);
    out.push(field);
  };
  push(subTypeField(typeKey));
  // 세부 유형 전용 필드가 유형 공통 필드보다 우선합니다(같은 key 면 덮어씀).
  for (const f of sub?.fields || []) push(f);
  for (const f of COMMON_FIELDS) push(f);
  for (const f of type.fields || []) push(f);
  for (const f of PLAN_FIELDS) push(f);
  return out;
}
