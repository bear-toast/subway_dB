import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { STATIONS, dbColor, dbStatus, recommendedVolume } from "../data/line2.js";

const BADGE_TEXT_COLOR = {
  "#97C459": "#2F5A1E",
  "#FAC775": "#7A4A00",
  "#E24B4A": "#7A1414",
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

  const fromStation = STATIONS[train.direction === 1 ? train.segmentIndex : train.segmentIndex + 1];
  const toStation = STATIONS[train.direction === 1 ? train.segmentIndex + 1 : train.segmentIndex];
  const color = dbColor(train.currentDb);
  const roundedDb = Math.round(train.currentDb);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-20 rounded-t-2xl bg-white px-5 pt-4 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
      style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {fromStation.name} → {toStation.name}
          </p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{roundedDb}dB</span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: `${color}33`, color: BADGE_TEXT_COLOR[color] }}
            >
              {dbStatus(train.currentDb)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
        {predictionMessage(toStation.name, train.currentDb, train.predictedDb)}
      </p>

      <p className="mt-3 text-sm font-medium text-gray-700">{recommendedVolume(train.currentDb)}</p>

      <button
        type="button"
        onClick={() => navigate("/measure")}
        className="mt-4 mb-1 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white active:bg-gray-800"
      >
        내 측정값으로 보정하기
      </button>
    </div>
  );
}
