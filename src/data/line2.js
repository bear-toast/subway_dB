export const LINE_NAME = "신분당선";
export const DIRECTION_LABEL = "강남 방면";

export const STATIONS = [
  { id: "dongcheon", name: "동천", lat: 37.3419, lng: 127.1102 },
  { id: "migeum", name: "미금", lat: 37.3396, lng: 127.1104 },
  { id: "jeongja", name: "정자", lat: 37.3667, lng: 127.1086 },
  { id: "pangyo", name: "판교", lat: 37.3947, lng: 127.1112 },
  { id: "cheonggyesan", name: "청계산입구", lat: 37.4271, lng: 127.0553 },
  { id: "yangjaecitizen", name: "양재시민의숲", lat: 37.4457, lng: 127.0377 },
  { id: "yangjae", name: "양재", lat: 37.4843, lng: 127.0344 },
  { id: "gangnam", name: "강남", lat: 37.4979, lng: 127.0276 },
];

// 구간 dB: index i = STATIONS[i] → STATIONS[i+1]
export const SEGMENT_DB = [76, 81, 79, 85, 74, 73, 78];

// 75dB: WHO-ITU H.870 민감군(어린이 등) 안전 청취 기준(75dB(A)×주 40시간)과 일치.
// 85dB: NIOSH REL(85dB(A) 8시간 기준, 청력 손상 위험이 본격 시작되는 지점)에 맞춤.
// 기존 75/80 경계는 근거 없는 데모값이었던 것을 공식 기준으로 교체.
export function dbColor(db) {
  if (db < 75) return "#97C459";
  if (db < 85) return "#FAC775";
  return "#E24B4A";
}

export function dbStatus(db) {
  if (db < 75) return "조용함";
  if (db < 85) return "보통";
  return "시끄러움";
}

// "권장"이 아니라 상한이다: 소음이 심할수록 명료도를 위해 볼륨을 올리고
// 싶어지지만, 그 순간이 바로 (주변 소음 + 이어폰 출력)이 겹쳐 청력 손상
// 위험이 가장 커지는 순간이기도 하다. 그래서 값은 "이만큼 올리면 잘
// 들려요"가 아니라 "이 이상은 넘기지 마세요"라는 안전 상한이며, 문구도
// 그렇게 읽히도록 "권장 볼륨" 대신 "안전 상한"이라고 명시한다.
//
// 상한 자체는 60/60 법칙(WHO 유럽사무소 권고: 최대 볼륨 60% 이하 · 연속
// 60분 이하)에 맞춰, 가장 조용한 상황에서도 60%를 넘지 않도록 설계했고,
// 소음이 커질수록 NIOSH의 exchange rate(레벨이 오를수록 안전 노출 시간이
// 급감) 취지를 반영해 상한을 더 낮추고 청취 시간 제한 안내를 추가했다.
export function recommendedVolume(db) {
  if (db < 75) return "지금 구간 청력 보호 안전 상한 60% 이하";
  if (db < 85) return "지금 구간 청력 보호 안전 상한 45% 이하";
  return "지금 구간 청력 보호 안전 상한 35% 이하 · 연속 착용 60분 이하 권장 · 가능하면 노이즈캔슬링 사용";
}
