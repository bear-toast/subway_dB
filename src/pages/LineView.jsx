import { useEffect, useState } from "react";
import { LineStrip } from "../components/LineStrip.jsx";
import { TrainSheet } from "../components/TrainSheet.jsx";
import { useTrains } from "../hooks/useTrains.js";
import { useNearestStation } from "../hooks/useNearestStation.js";
import { LINE_NAME, DIRECTION_LABEL } from "../data/line2.js";

function formatTime(date) {
  return `${date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 기준`;
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

  // if the selected train reaches the terminus and disappears for its
  // respawn gap, drop the selection (and its "내 위치" pin) with it instead
  // of leaving a stale id that would silently reattach to whatever train
  // takes that slot next
  useEffect(() => {
    if (selectedTrainId && !selectedTrain) setSelectedTrainId(null);
  }, [selectedTrainId, selectedTrain]);

  function handleSelectTrain(id) {
    setSelectedTrainId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="min-h-dvh bg-[#0e0e11] px-4 pb-10 pt-6">
      <header className="mb-4 px-1">
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-bold text-white">
            {LINE_NAME} · {DIRECTION_LABEL}
          </h1>
          <span className="text-xs text-gray-400">{formatTime(now)}</span>
        </div>
        <p className="mt-1 text-sm text-gray-400">열차를 탭하면 소음 정보를 볼 수 있어요</p>
        {source === "fallback" && (
          <p className="mt-1 text-xs text-gray-500">위치 정보를 사용할 수 없어요</p>
        )}
      </header>

      <LineStrip
        trains={trains}
        selectedTrainId={selectedTrainId}
        onSelectTrain={handleSelectTrain}
        nearestStationId={nearestStationId}
        showNearestPin={source === "geo"}
      />

      <TrainSheet train={selectedTrain} onClose={() => setSelectedTrainId(null)} />
    </div>
  );
}
