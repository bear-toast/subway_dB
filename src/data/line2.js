export const LINE_NAME = "2호선";
export const DIRECTION_LABEL = "잠실 방면";

export const STATIONS = [
  { id: "gangnam", name: "강남", lat: 37.4979, lng: 127.0276 },
  { id: "yeoksam", name: "역삼", lat: 37.5006, lng: 127.0364 },
  { id: "seolleung", name: "선릉", lat: 37.5045, lng: 127.049 },
  { id: "samseong", name: "삼성", lat: 37.5088, lng: 127.0631 },
  { id: "sports", name: "종합운동장", lat: 37.511, lng: 127.0737 },
  { id: "jamsil", name: "잠실", lat: 37.5133, lng: 127.1002 },
];

// 구간 dB: index i = STATIONS[i] → STATIONS[i+1]
export const SEGMENT_DB = [78, 84, 79, 74, 73];

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
