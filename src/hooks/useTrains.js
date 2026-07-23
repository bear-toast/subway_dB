import { useEffect, useRef, useState } from "react";
import { STATIONS, SEGMENT_DB } from "../data/line2.js";

const NUM_SEGMENTS = STATIONS.length - 1;
const SEGMENT_DURATION_MS = 20000;

// direction is always +1: trains only ever travel left (강남) to right (잠실),
// looping back to the start once they reach the terminus.
const INITIAL_TRAINS = [
  { id: "t1", position: 0.15 },
  { id: "t2", position: 2.6 },
  { id: "t3", position: 4.2 },
];

function deriveTrain(train) {
  const segmentIndex = Math.min(Math.floor(train.position), NUM_SEGMENTS - 1);
  const progress = train.position - segmentIndex;
  // at the last segment there is no further segment to predict, so the
  // train's own current segment stands in as the prediction
  const nextSegmentIndex = Math.min(segmentIndex + 1, NUM_SEGMENTS - 1);
  return {
    id: train.id,
    segmentIndex,
    progress,
    currentDb: SEGMENT_DB[segmentIndex],
    predictedDb: SEGMENT_DB[nextSegmentIndex],
    percent: (train.position / NUM_SEGMENTS) * 100,
  };
}

export function useTrains() {
  const rawTrainsRef = useRef(INITIAL_TRAINS.map((t) => ({ ...t })));
  const [trains, setTrains] = useState(() => rawTrainsRef.current.map(deriveTrain));
  const lastTsRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    function tick(ts) {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;

      rawTrainsRef.current = rawTrainsRef.current.map((train) => {
        const position = (train.position + dt / SEGMENT_DURATION_MS) % NUM_SEGMENTS;
        return { ...train, position };
      });

      setTrains(rawTrainsRef.current.map(deriveTrain));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, []);

  return trains;
}
