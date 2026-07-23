import { MapPin, Train as TrainIcon } from "lucide-react";
import { STATIONS, SEGMENT_DB, dbColor } from "../data/line2.js";

const NUM_STATIONS = STATIONS.length;

function stationPercent(index) {
  return (index / (NUM_STATIONS - 1)) * 100;
}

export function LineStrip({ trains, selectedTrainId, onSelectTrain, nearestStationId }) {
  return (
    <div className="rounded-2xl bg-[#232228] p-4">
      <div className="relative h-16 mt-8">
        {/* base track */}
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/10" />

        {/* segment color bars */}
        {SEGMENT_DB.map((db, i) => {
          const left = stationPercent(i);
          const width = stationPercent(i + 1) - left;
          return (
            <div
              key={i}
              className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full"
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
            <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-400 bg-[#232228]" />
            {nearestStationId === station.id && (
              <MapPin
                size={16}
                className="absolute -top-6 text-sky-400"
                strokeWidth={2.5}
                fill="#232228"
              />
            )}
          </div>
        ))}

        {/* trains: badge floats above the track, connected by a short stem */}
        {trains.map((train) => {
          const isSelected = train.id === selectedTrainId;
          const color = dbColor(train.currentDb);
          return (
            <button
              key={train.id}
              type="button"
              onClick={() => onSelectTrain(train.id)}
              aria-label={`열차 ${train.id}, ${train.currentDb}dB`}
              className="absolute -translate-x-1/2 transition-[left] duration-100 ease-linear"
              style={{ left: `${train.percent}%`, bottom: "calc(50% + 4px)" }}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full shadow-lg ring-4 ${
                    isSelected ? "ring-sky-500" : "ring-[#232228]"
                  }`}
                  style={{ backgroundColor: color }}
                >
                  <TrainIcon size={17} strokeWidth={2.5} className="text-white" />
                </div>
                <span className="h-3 w-px bg-gray-500/70" />
              </div>
            </button>
          );
        })}
      </div>

      {/* station labels */}
      <div className="relative mt-1 h-8">
        {STATIONS.map((station, i) => (
          <div
            key={station.id}
            className="absolute top-0 w-14 -translate-x-1/2 text-center text-[11px] leading-tight text-gray-400"
            style={{ left: `${stationPercent(i)}%` }}
          >
            {station.name}
          </div>
        ))}
      </div>

      {/* legend */}
      <div className="mt-5 flex items-center gap-4 text-[11px] text-gray-400">
        <LegendItem color="#97C459" label="-75dB" />
        <LegendItem color="#FAC775" label="75-80" />
        <LegendItem color="#E24B4A" label="80dB+" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}
