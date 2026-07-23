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

export function dbColor(db) {
  if (db < 75) return "#97C459";
  if (db < 80) return "#FAC775";
  return "#E24B4A";
}

export function dbStatus(db) {
  if (db < 75) return "조용함";
  if (db < 80) return "보통";
  return "시끄러움";
}

export function recommendedVolume(db) {
  if (db < 75) return "지금 구간 권장 볼륨 70% 이하";
  if (db < 80) return "지금 구간 권장 볼륨 60% 이하";
  return "지금 구간 권장 볼륨 55% 이하 · 가능하면 노이즈캔슬링 사용";
}
