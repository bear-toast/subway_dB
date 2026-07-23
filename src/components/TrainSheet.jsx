import { useNavigate } from "react-router-dom";
import { Headphones, Mic, TrendingDown, TrendingUp } from "lucide-react";
import { STATIONS, dbColor, dbStatus, recommendedVolume } from "../data/line2.js";
import { Highlighted } from "./Highlighted.jsx";

const BADGE_STYLE = {
  "#97C459": { background: "#eaf5df", border: "#97C459", text: "#2F5A1E" },
  "#FAC775": { background: "#fdf1de", border: "#FAC775", text: "#7A4A00" },
  "#E24B4A": { background: "#fdeaea", border: "#E24B4A", text: "#7A1414" },
};

function predictionMessage(destName, currentDb, predictedDb) {
  const diff = predictedDb - currentDb;
  if (diff <= -3) return `${destName}부터 소음 감소 구간 · 약 ${Math.abs(Math.round(diff))}dB 하락 예상`;
  if (diff >= 3) return `${destName}부터 소음 증가 구간 · 약 ${Math.round(diff)}dB 상승 예상`;
  return "다음 구간도 비슷한 소음 수준";
}

export function TrainSheet({ train, onClose }) {
  const navigate = useNavigate();
  if (!train) return null;

  const fromStation = STATIONS[train.segmentIndex];
  const toStation = STATIONS[train.segmentIndex + 1];
  const color = dbColor(train.currentDb);
  const badge = BADGE_STYLE[color];
  const roundedDb = Math.round(train.currentDb);
  const diff = train.predictedDb - train.currentDb;
  const TrendIcon = diff <= -3 ? TrendingDown : diff >= 3 ? TrendingUp : TrendingDown;
  const trendColor = diff <= -3 ? "#7ED08B" : diff >= 3 ? "#E88A8A" : "#8b8b93";

  return (
    <div className="mt-4 rounded-2xl bg-[#1c1c20] px-5 pb-5 pt-2">
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="mx-auto mb-3 block h-1 w-10 rounded-full bg-gray-600"
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-400">
            선택한 열차 · {fromStation.name} → {toStation.name}
          </p>
          <p className="mt-1 text-4xl font-bold" style={{ color }}>
            {roundedDb} <span className="text-2xl">dB</span>
          </p>
        </div>
        <span
          className="mt-1 shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: badge.background, borderColor: badge.border, color: badge.text }}
        >
          {dbStatus(train.currentDb)}
        </span>
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 text-sm text-gray-200">
          <TrendIcon size={16} style={{ color: trendColor }} className="shrink-0" />
          <Highlighted text={predictionMessage(toStation.name, train.currentDb, train.predictedDb)} />
        </div>
        <div className="mt-3 flex items-center gap-3 text-sm text-gray-200">
          <Headphones size={16} className="shrink-0 text-gray-400" />
          <Highlighted text={recommendedVolume(train.currentDb)} />
        </div>
        <button
          type="button"
          onClick={() => navigate("/measure")}
          className="mt-3 flex items-center gap-3 text-sm text-gray-200"
        >
          <Mic size={16} className="shrink-0 text-gray-400" />
          <span>내 측정값으로 이 열차 데이터 보정하기</span>
        </button>
      </div>
    </div>
  );
}
