import { useRef } from "react";
import { MapPin, Train as TrainIcon } from "lucide-react";
import { STATIONS, SEGMENT_DB, dbColor } from "../data/line2.js";

const NUM_STATIONS = STATIONS.length;

// manual line breaks for station names that would otherwise wrap at an
// awkward mid-syllable point inside their narrow slot
const LABEL_LINES = {
  cheonggyesan: ["청계산", "입구"],
  yangjaecitizen: ["양재", "시민의숲"],
};

function stationPercent(index) {
  return (index / (NUM_STATIONS - 1)) * 100;
}

// A train's CSS animation-delay must be computed once per "run" (from 첫 역
// to 종점) and then left untouched, otherwise re-deriving it from
// performance.now() on every 250ms state tick would fight the browser's own
// animation clock. Caching by startTime (stable for a whole run, fresh after
// each respawn) keeps the motion driven entirely by the compositor.
function useAnimationDelays() {
  const cache = useRef(new Map());
  return (train) => {
    const cached = cache.current.get(train.id);
    if (cached && cached.startTime === train.startTime) return cached.delayMs;
    const delayMs = -(performance.now() - train.startTime);
    cache.current.set(train.id, { startTime: train.startTime, delayMs });
    return delayMs;
  };
}

export function LineStrip({ trains, selectedTrainId, onSelectTrain, nearestStationId, showNearestPin }) {
  const getAnimationDelay = useAnimationDelays();

  return (
    <div className="rounded-2xl bg-[#232228] p-4">
      <div className="relative h-16 mt-11">
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

        {/* station dots. The "내 위치" pin only anchors here while no train
            is selected — once a train is picked it rides along with that
            train instead (see below). */}
        {STATIONS.map((station, i) => (
          <div
            key={station.id}
            className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${stationPercent(i)}%` }}
          >
            <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-400 bg-[#232228]" />
            {!selectedTrainId && showNearestPin && nearestStationId === station.id && (
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
              className="absolute -translate-x-1/2"
              style={{
                bottom: "calc(50% + 4px)",
                animationName: "train-move",
                animationDuration: `${train.durationMs}ms`,
                animationTimingFunction: "linear",
                animationFillMode: "forwards",
                animationDelay: `${getAnimationDelay(train)}ms`,
              }}
            >
              <div className="relative flex flex-col items-center">
                {isSelected && (
                  <MapPin
                    size={16}
                    className="absolute -top-6 text-sky-400"
                    strokeWidth={2.5}
                    fill="#232228"
                  />
                )}
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

      {/* station labels: each label's box exactly matches its station's
          slot width so long names (e.g. 양재시민의숲) wrap instead of
          bleeding into a neighboring label */}
      <div className="relative mt-1 h-9">
        {STATIONS.map((station, i) => (
          <div
            key={station.id}
            className="absolute top-0 -translate-x-1/2 text-center text-[10px] leading-tight text-gray-400"
            style={{ left: `${stationPercent(i)}%`, width: `${100 / (NUM_STATIONS - 1)}%` }}
          >
            {LABEL_LINES[station.id] ? (
              LABEL_LINES[station.id].map((line) => <div key={line}>{line}</div>)
            ) : (
              station.name
            )}
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
