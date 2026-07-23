# 사운드맵 MVP — 프로젝트 스펙

지하철 탑승자를 위한 청력 보호 소음 지도 웹앱. 노선 스트립 위에 열차 오브젝트가 움직이고, 열차를 탭하면 해당 열차의 현재 소음(dB)과 앞 구간의 예측 dB을 확인할 수 있다. 오늘 15:00 데모 마감. 실데이터 없이 시드 데이터 + 시뮬레이션으로 구현한다.

**타깃 환경: 안드로이드 Chrome 모바일 브라우저.** iOS Safari 대응은 이번 범위에서 제외한다 (WebKit 특수 처리 불필요). 개발 중 검증은 Chrome DevTools 기기 에뮬레이션(375px) + Sensors 패널 기준으로 한다.

## 기술 스택 (변경 금지)

- Vite + React (JavaScript, TypeScript 생략 가능)
- Tailwind CSS — 모바일 우선, 기준 뷰포트 375px
- 지도 라이브러리 없음 (Leaflet 사용 금지) — 노선 스트립은 CSS 절대 배치 또는 SVG
- 백엔드/DB/로그인 없음 — 상태는 전부 클라이언트 메모리
- Web Audio API(마이크 dB 근사), Geolocation API(가까운 역 판별)
- 배포: Vercel (HTTPS 필수 — 마이크·위치 API가 HTTPS에서만 동작)

## 화면 구성 (2개)

### 화면 1: 노선 뷰 (메인, `/`)

- 상단: 노선명 + 방면 표시 ("2호선 · 잠실 방면"), 현재 시각
- 노선 스트립: 역을 점으로, 역 사이 구간을 dB 색상 막대로 표시
  - 색상 규칙: 75dB 미만 초록(#97C459), 75~80 노랑(#FAC775), 80 이상 빨강(#E24B4A)
  - 구간 색상 범례를 스트립 아래 표시
- 열차 오브젝트: 스트립 위에 원형 아이콘으로 표시, 구간을 따라 부드럽게 이동
  - 시뮬레이션으로 움직임 (아래 로직 참조), 2~3대 동시 표시
  - 탭/클릭 시 선택 상태 (테두리 강조)
- 하단 시트 (열차 선택 시):
  - 현재 구간과 dB 크게 표시 (예: "역삼 → 선릉 · 84dB") + 상태 배지(조용함/보통/시끄러움)
  - 예측 메시지: 다음 구간 dB과 현재 dB 비교해 자동 생성
    - 예: "선릉부터 소음 감소 구간 · 약 8dB 하락 예상"
    - 차이가 ±3dB 미만이면 "다음 구간도 비슷한 소음 수준"
  - 권장 볼륨: dB 기반 계산 (아래 규칙)
  - "내 측정값으로 보정하기" 버튼 → 화면 2로 이동
- Geolocation 사용: 사용자 위치에서 가장 가까운 역을 스트립에 "내 위치" 마커로 표시
  - 권한 거부/실패 시 폴백: 강남역 기준으로 표시하고 작은 안내 문구

### 화면 2: 측정 (`/measure`)

- "측정 시작" 버튼 필수 (Chrome의 오디오 자동재생 정책상 AudioContext는 사용자 제스처 후 시작하는 것이 안전하고, 권한 요청 시점을 사용자가 예측할 수 있어 UX상으로도 맞다)
- 측정 중: 현재 dB 근사치를 큰 숫자 + 색상 게이지로 표시, 초당 2회 갱신
- dB 값 아래 작은 글씨로 "기기 마이크 기반 근사치입니다" 표기
- 권장 볼륨 한 줄 표시 (노선 뷰와 동일 규칙)
- "이 값을 열차에 기여" 버튼: 실제 저장 없이 토스트("측정값이 반영되었어요 (데모)")만 표시
- 마이크 권한 거부 시: 안내 메시지 + 노선 뷰로 돌아가기 버튼

## 시드 데이터

`src/data/line2.js`로 분리. 2호선 강남~잠실 구간 6개 역.

```js
export const STATIONS = [
  { id: "gangnam", name: "강남", lat: 37.4979, lng: 127.0276 },
  { id: "yeoksam", name: "역삼", lat: 37.5006, lng: 127.0364 },
  { id: "seolleung", name: "선릉", lat: 37.5045, lng: 127.0490 },
  { id: "samseong", name: "삼성", lat: 37.5088, lng: 127.0631 },
  { id: "sports", name: "종합운동장", lat: 37.5110, lng: 127.0737 },
  { id: "jamsil", name: "잠실", lat: 37.5133, lng: 127.1002 },
];

// 구간 dB: index i = STATIONS[i] → STATIONS[i+1]
export const SEGMENT_DB = [78, 84, 79, 74, 73];
```

- 지하 급곡선 구간(역삼→선릉)을 가장 시끄럽게, 동쪽으로 갈수록 조용해지는 패턴 유지
- 값에 ±1dB 정도 미세 노이즈를 주기적으로 섞어 "살아있는 데이터" 느낌을 내도 좋음 (선택)

## 열차 시뮬레이션 로직

```js
// 열차 상태: { id, segmentIndex, progress(0~1), direction(+1|-1) }
// requestAnimationFrame 또는 250ms setInterval로 progress 증가
// 구간 하나 통과에 약 20초 (progress += dt / 20000)
// progress >= 1 이면 다음 구간으로, 종점 도달 시 direction 반전
// 열차의 현재 dB = SEGMENT_DB[segmentIndex]
// 열차의 예측 dB = SEGMENT_DB[segmentIndex + direction] (범위 체크)
```

- 초기 열차 2~3대를 서로 다른 구간에 배치
- 스트립 상 x좌표: 역 간 간격을 균등 분할하고 `(segmentIndex + progress) / (역수-1) * 100%`

## dB 근사 계산 (Web Audio)

```js
// getUserMedia({ audio: true }) → AnalyserNode
// getFloatTimeDomainData로 RMS 계산
// dB 근사 = 20 * log10(rms) + 94 (보정 상수, 기기별 오차 있음 — 근사치 표기 필수)
// 값 범위를 30~100으로 클램프, 지수이동평균으로 스무딩
```

## 권장 볼륨 규칙

- 75dB 미만: "볼륨 70% 이하 권장"
- 75~80dB: "볼륨 60% 이하 권장"
- 80dB 이상: "볼륨 55% 이하 · 가능하면 노이즈캔슬링 사용"

## 파일 구조

```
src/
  data/line2.js          # 시드 데이터
  hooks/useTrains.js     # 열차 시뮬레이션
  hooks/useMicDb.js      # 마이크 dB 근사
  hooks/useNearestStation.js  # Geolocation → 최근접 역
  components/LineStrip.jsx    # 노선 스트립 + 열차
  components/TrainSheet.jsx   # 하단 시트
  pages/LineView.jsx
  pages/Measure.jsx
  App.jsx                # 라우팅 (react-router-dom 또는 상태 기반 전환)
```

## 스타일 가이드

- 첨부된 목업 스크린샷의 레이아웃과 색상을 따른다
- 배경 흰색/연회색, 카드형 하단 시트, 둥근 모서리 12~16px
- dB 숫자는 크게(24px+), 상태 배지는 dB 색상 계열의 연한 배경 + 진한 텍스트
- 아이콘: 이모지 대신 SVG 또는 lucide-react

## 완료 기준 (이 순서로 구현)

1. 노선 스트립 + 구간 색상 렌더링
2. 열차 2~3대 이동 시뮬레이션
3. 열차 탭 → 하단 시트 (현재 dB, 예측 메시지, 권장 볼륨)
4. Geolocation 최근접 역 마커 + 폴백
5. 측정 화면 (마이크 dB 게이지)
6. Vercel 배포 후 안드로이드 실기기(Chrome)에서 마이크·위치 동작 확인

3·4·5가 밀리면 5(측정 화면)를 먼저 줄인다. 1~3이 데모의 핵심이다.

## 주의사항 (안드로이드 Chrome 기준)

- 마이크·위치는 HTTPS(또는 localhost)에서만 동작 — 같은 와이파이 IP 접속(`--host`)은 마이크가 막히므로 실기기 테스트는 Vercel 배포 URL로 진행
- AudioContext는 자동재생 정책으로 suspended 상태로 생성될 수 있음 — "측정 시작" 버튼 핸들러 안에서 생성하거나 resume() 호출
- 권한을 한 번 거부하면 Chrome이 이후 프롬프트를 자동 차단할 수 있음 — 거부 상태 감지 시 "주소창 자물쇠 아이콘 → 권한에서 허용" 안내 문구 표시
- 모바일 Chrome 주소창이 뷰포트 높이를 잡아먹으므로 전체 높이 레이아웃에는 `100vh` 대신 `100dvh` 사용
- 하단 시트가 안드로이드 제스처 내비게이션 바와 겹치지 않게 `env(safe-area-inset-bottom)` 패딩 고려
- 페이지 이탈·화면 전환 시 마이크 스트림 정리 (track.stop()) — 정리하지 않으면 상단 녹음 표시가 계속 남음
- 위치·마이크 권한 요청 전에 왜 필요한지 한 줄 안내 문구 표시
- 삼성 인터넷 등 타 브라우저 대응은 범위 외 — 데모는 Chrome으로만 시연
