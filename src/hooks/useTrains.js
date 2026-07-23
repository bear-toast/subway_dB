import { useEffect, useRef, useState } from "react";
import { STATIONS, SEGMENT_DB } from "../data/line2.js";

const NUM_SEGMENTS = STATIONS.length - 1;
const SEGMENT_DURATION_MS = 20000;

const INITIAL_TRAINS = [
  { id: "t1", position: 0.15, direction: 1 },
  { id: "t2", position: 2.6, direction: -1 },
  { id: "t3", position: 4.2, direction: 1 },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function deriveTrain(train) {
  const segmentIndex = Math.min(Math.floor(train.position), NUM_SEGMENTS - 1);
  const progress = train.position - segmentIndex;
  const nextSegmentIndex = clamp(segmentIndex + train.direction, 0, NUM_SEGMENTS - 1);
  return {
    id: train.id,
    segmentIndex,
    progress,
    direction: train.direction,
    currentDb: SEGMENT_DB[segmentIndex],
    predictedDb: SEGMENT_DB[nextSegmentIndex],
    percent: (train.position / NUM_SEGMENTS) * 100,
  };
}

export function useTrains() {
  const rawTrainsRef = useRef(
    INITIAL_TRAINS.map((t) => ({ ...t }))
  );
  const [trains, setTrains] = useState(() => rawTrainsRef.current.map(deriveTrain));
  const lastTsRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    function tick(ts) {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;

      rawTrainsRef.current = rawTrainsRef.current.map((train) => {
        let position = train.position + (train.direction * dt) / SEGMENT_DURATION_MS;
        let direction = train.direction;

        if (position >= NUM_SEGMENTS) {
          position = NUM_SEGMENTS - (position - NUM_SEGMENTS);
          direction = -1;
        } else if (position <= 0) {
          position = -position;
          direction = 1;
        }

        return { ...train, position, direction };
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
