import { useEffect, useState } from "react";
import { LineStrip } from "../components/LineStrip.jsx";
import { TrainSheet } from "../components/TrainSheet.jsx";
import { useTrains } from "../hooks/useTrains.js";
import { useNearestStation } from "../hooks/useNearestStation.js";
import { LINE_NAME, DIRECTION_LABEL } from "../data/line2.js";

function formatTime(date) {
  return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export function LineView() {
  const trains = useTrains();
  const { nearestStationId, source } = useNearestStation();
  const [selectedTrainId, setSelectedTrainId] = useState(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const selectedTrain = trains.find((t) => t.id === selectedTrainId) ?? null;

  function handleSelectTrain(id) {
    setSelectedTrainId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50 pb-8">
      <header className="bg-white px-5 pt-6 pb-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">
            {LINE_NAME} · {DIRECTION_LABEL}
          </h1>
          <span className="text-sm text-gray-500">{formatTime(now)}</span>
        </div>
        {source === "fallback" && (
          <p className="mt-1 text-xs text-gray-400">
            위치 정보를 사용할 수 없어 강남역 기준으로 표시합니다
          </p>
        )}
      </header>

      <main className="flex-1">
        <div className="bg-white pb-2">
          <LineStrip
            trains={trains}
            selectedTrainId={selectedTrainId}
            onSelectTrain={handleSelectTrain}
            nearestStationId={nearestStationId}
          />
        </div>

        {!selectedTrain && (
          <p className="px-5 pt-6 text-center text-sm text-gray-400">
            열차를 탭하면 현재 소음과 예측 정보를 볼 수 있어요
          </p>
        )}
      </main>

      <TrainSheet train={selectedTrain} onClose={() => setSelectedTrainId(null)} />
    </div>
  );
}
