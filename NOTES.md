# 사운드맵 — 기술 스택 · 미구현 요소 · 적용 로직

`SPEC.md`의 MVP 완료 기준(1~5) 구현 이후 정리한 문서.

## 기술 스택

- **Vite + React (JS)** — SPA, `react-router-dom`으로 `/`(노선 뷰) · `/measure`(측정) 라우팅
- **Tailwind CSS v4** — 다크 테마, 375px 모바일 우선
- **Web Audio API** — `getUserMedia` → `AnalyserNode` → RMS → dB 근사 (측정 화면)
- **Geolocation API** — 최근접 역 계산(haversine), 실패/거부 시 폴백
- **CSS `@keyframes` 애니메이션** — 열차 이동은 JS(60fps state 갱신)가 아니라 GPU 컴포지터가 담당. React는 250ms 간격으로 구간(dB)·생존 상태만 갱신해 클릭·리렌더가 몰려도 이동이 끊기지 않도록 함
- **lucide-react** — 아이콘
- **Vercel** — 정적 배포, HTTPS(마이크·위치 API 동작 조건)
- **백엔드/DB 없음** — 상태는 전부 클라이언트 메모리 (스펙 요구사항)

## 미구현 요소

| 항목 | 현재 상태 | 완성하려면 필요한 것 |
|---|---|---|
| **DB 데이터 축적** | "이 값을 열차에 기여" 버튼은 토스트만 띄우고 실제 저장은 하지 않음. `SEGMENT_DB`는 하드코딩된 시드값 | 저장소(Supabase/Firebase 등), 익명 집계 API, 이상치 필터링, 시간대·요일별 가중 평균으로 `SEGMENT_DB`를 실측 기반으로 대체 |
| **실제 캘리브레이션 반영** | `20·log10(rms)+94`라는 범용 보정 상수 사용 — 기기·이어폰 마이크 감도 차이 미반영, UI에 "근사치" 문구로만 고지 | 알려진 기준음(예: 1kHz 94dB 캘리버레이터) 대비 기기 모델별 보정 계수 테이블, 또는 최초 사용 시 사용자가 아는 기준(예: 조용한 방 ≈ 40dB)으로 셀프 캘리브레이션하는 단계 |

## 적용 로직: dB 등급 · 권장 볼륨 기준

`SEGMENT_DB`(78, 84…) 자체는 SPEC.md 데모용 시드값이지만, 그 값을 **몇 dB부터 "시끄러움"으로 분류하고 이어폰 볼륨을 몇 %까지 권장할지**의 경계값은 처음에 근거 없는 임의 수치(75/80dB, 70·60·55%)로 시작했다. 아래 공식 자료를 근거로 재조정해 코드(`src/data/line2.js`)에 반영했다.

### 근거 자료

- **WHO-ITU H.870**(안전 청취 표준): 성인 안전 청취 총량 = **80dB(A) × 주 40시간**, 민감군(어린이 등)은 **75dB(A) × 주 40시간**. 3dB 증가마다 안전 노출시간이 절반(exchange rate).
- **NIOSH REL**(미국 산업안전보건연구원): **85dB(A) = 8시간 기준** 권고 노출한계, 3dB마다 절반(88dB→4h, 91dB→2h, 94dB→1h, 100dB→15분). 청력 손상 위험이 본격적으로 시작되는 지점으로 가장 널리 인용되는 값.
- **60/60 법칙**(WHO 유럽사무소 권고): 이어폰은 **최대 볼륨의 60% 이하로, 연속 60분 이하**로 사용.
- **국내 지하철 실측 보도**: 일부 구형 차량·급곡선 구간에서 90~107dB까지 관측된 사례. 환경부 권고 기준(주행 중 객차 내 80dB)은 원래 객차 밖(선로 주변) 관리 목적이라 실내 소음과는 괴리가 있다는 지적 존재.

### 색상/상태 경계 — `dbColor`, `dbStatus`

| 구간 | 값 | 근거 |
|---|---|---|
| 조용함 (녹색) | < 75dB | WHO 민감군(어린이 등) 안전 기준 75dB(A)와 일치 |
| 보통 (노랑) | 75~85dB | — |
| 시끄러움 (빨강) | ≥ 85dB | NIOSH REL — 청력 손상 위험이 본격 시작되는 지점 |

> 기존 80dB 경계를 85dB로 상향. 80dB는 "즉각 위험"이 아니라 WHO의 *주간 누적* 허용 총량 기준점이라 성격이 다르며, 실제 손상 위험 임계값으로는 NIOSH의 85dB가 더 적합하다고 판단.

### 권장 볼륨 — `recommendedVolume`

| dB 구간 | 권장 볼륨 |
|---|---|
| < 75dB | 60% 이하 |
| 75~85dB | 45% 이하 |
| ≥ 85dB | 35% 이하 · 연속 착용 60분 이하 권장 · 가능하면 노이즈캔슬링 사용 |

가장 조용한 구간에서도 상한을 **60%로 고정**(기존 70%에서 하향)해, 어떤 상황에서도 60/60 법칙의 안전 상한을 넘지 않도록 설계. 소음이 커질수록 NIOSH의 exchange rate(레벨이 오를수록 안전 노출 시간이 급감) 취지를 반영해 볼륨 상한을 낮추고, 가장 시끄러운 구간에는 볼륨뿐 아니라 **청취 시간 제한 문구**도 추가했다.

> **단서**: 볼륨 %와 실제 귀 도달 dB(SPL)의 관계는 기기·이어폰 밀폐도마다 달라 절대적 보장은 아니다. 위 수치는 EU 규제 기기들이 통상 최대 볼륨을 100~105dB(A) 부근으로 제한한다는 전제하의 실무적 가이드라인이며, 정확도를 높이려면 "미구현 요소"의 실제 캘리브레이션 작업이 함께 필요하다.

### 참고 자료

- [Safe listening devices and systems: a WHO-ITU standard](https://www.who.int/publications/i/item/9789241515276)
- [H.870 — Wikipedia](https://en.wikipedia.org/wiki/H.870)
- [NIOSH/Criteria for a Recommended Standard--Occupational Noise Exposure](https://www.nonoise.org/hearing/criteria/criteria.htm)
- [NIOSH vs OSHA Noise Exposure Limits](https://www.soundtrace.com/blog/niosh-vs-osha-exposure-limits)
- [지하철 소음 107데시벨 '난청 유발'에도 서울교통공사 나몰라라 | 비즈한국](https://www.bizhankook.com/bk/article/15985)
- [문 열고 달리나?…지하철, 안팎 동일한 '소음 기준' - SBS 뉴스](https://news.sbs.co.kr/news/endPage.do?news_id=N1007777952)
- [귀 건강 지키고 싶다면 이어폰 쓸때 '60·60 법칙' 지켜보세요](https://v.daum.net/v/BODHt6waNo?f=p)
- [이어폰의 음량을 줄이세요 - 대한민국 정책브리핑](https://www.korea.kr/news/examPassView.do?newsId=148768821)
