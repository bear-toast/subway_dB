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

// 상한을 60/60 법칙(WHO 유럽사무소 권고: 최대 볼륨 60% 이하 · 연속 60분 이하)에
// 맞춰, 가장 조용한 상황에서도 60%를 넘지 않도록 재설계. 소음이 커질수록
// NIOSH의 exchange rate(레벨이 오를수록 안전 노출 시간이 급감) 취지를 반영해
// 볼륨 상한과 함께 청취 시간 제한 안내를 추가.
export function recommendedVolume(db) {
  if (db < 75) return "지금 구간 권장 볼륨 60% 이하";
  if (db < 85) return "지금 구간 권장 볼륨 45% 이하";
  return "지금 구간 권장 볼륨 35% 이하 · 연속 착용 60분 이하 권장 · 가능하면 노이즈캔슬링 사용";
}
