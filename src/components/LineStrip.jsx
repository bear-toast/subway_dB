import { MapPin, Train as TrainIcon } from "lucide-react";
import { STATIONS, SEGMENT_DB, dbColor } from "../data/line2.js";

const NUM_STATIONS = STATIONS.length;

function stationPercent(index) {
  return (index / (NUM_STATIONS - 1)) * 100;
}

export function LineStrip({ trains, selectedTrainId, onSelectTrain, nearestStationId }) {
  return (
    <div className="px-4 pt-6 pb-3">
      <div className="relative h-16">
        {/* base track */}
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gray-200" />

        {/* segment color bars */}
        {SEGMENT_DB.map((db, i) => {
          const left = stationPercent(i);
          const width = stationPercent(i + 1) - left;
          return (
            <div
              key={i}
              className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full"
              style={{ left: `${left}%`, width: `${width}%`, backgroundColor: dbColor(db) }}
            />
          );
        })}

        {/* station dots */}
        {STATIONS.map((station, i) => (
          <div
            key={station.id}
            className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${stationPercent(i)}%` }}
          >
            <div className="h-3 w-3 rounded-full border-2 border-white bg-gray-500 shadow" />
            {nearestStationId === station.id && (
              <MapPin
                size={16}
                className="absolute -top-6 text-sky-600"
                strokeWidth={2.5}
                fill="white"
              />
            )}
          </div>
        ))}

        {/* trains */}
        {trains.map((train) => {
          const isSelected = train.id === selectedTrainId;
          return (
            <button
              key={train.id}
              type="button"
              onClick={() => onSelectTrain(train.id)}
              aria-label={`열차 ${train.id}, ${train.currentDb}dB`}
              className={`absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-md transition-[left] duration-100 ease-linear ${
                isSelected ? "ring-4 ring-sky-400" : ""
              }`}
              style={{ left: `${train.percent}%`, backgroundColor: dbColor(train.currentDb) }}
            >
              <TrainIcon size={15} strokeWidth={2.5} />
            </button>
          );
        })}
      </div>

      {/* station labels */}
      <div className="relative mt-1 h-8">
        {STATIONS.map((station, i) => (
          <div
            key={station.id}
            className="absolute top-0 w-14 -translate-x-1/2 text-center text-[10px] leading-tight text-gray-500"
            style={{ left: `${stationPercent(i)}%` }}
          >
            {station.name}
          </div>
        ))}
      </div>

      {/* legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-gray-500">
        <LegendItem color="#97C459" label="75dB 미만" />
        <LegendItem color="#FAC775" label="75~80dB" />
        <LegendItem color="#E24B4A" label="80dB 이상" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}
