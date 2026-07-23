import { useEffect, useRef, useState } from "react";
import { STATIONS, SEGMENT_DB } from "../data/line2.js";

export const NUM_SEGMENTS = STATIONS.length - 1;
const SEGMENT_DURATION_MS = 20000;
export const TOTAL_DURATION_MS = SEGMENT_DURATION_MS * NUM_SEGMENTS;

// after a train reaches the terminus it disappears for a random gap
// before the next one enters at the first station
const MIN_RESPAWN_DELAY_MS = 2000;
const MAX_RESPAWN_DELAY_MS = 7000;

// how often we re-check segment/lifecycle state (position itself is animated
// by CSS, not by this timer, so this can run far less often than 60fps)
const SCHEDULER_TICK_MS = 250;

// staggered starting points, in "segments already travelled", so the three
// trains don't all launch from 동천 at once
const INITIAL_OFFSETS = [0.3, 3.1, 5.4];

function randomRespawnDelay() {
  return MIN_RESPAWN_DELAY_MS + Math.random() * (MAX_RESPAWN_DELAY_MS - MIN_RESPAWN_DELAY_MS);
}

function initialTrains(now) {
  return INITIAL_OFFSETS.map((offset, i) => ({
    id: `t${i + 1}`,
    status: "active",
    startTime: now - offset * SEGMENT_DURATION_MS,
    waitUntil: null,
  }));
}

function deriveTrain(train, now) {
  if (train.status === "waiting") return null;
  const elapsed = Math.min(Math.max(now - train.startTime, 0), TOTAL_DURATION_MS);
  const positionInSegments = elapsed / SEGMENT_DURATION_MS;
  const segmentIndex = Math.min(Math.floor(positionInSegments), NUM_SEGMENTS - 1);
  const nextSegmentIndex = Math.min(segmentIndex + 1, NUM_SEGMENTS - 1);
  return {
    id: train.id,
    segmentIndex,
    currentDb: SEGMENT_DB[segmentIndex],
    predictedDb: SEGMENT_DB[nextSegmentIndex],
    startTime: train.startTime,
    durationMs: TOTAL_DURATION_MS,
  };
}

export function useTrains() {
  const rawRef = useRef(initialTrains(performance.now()));
  const [trains, setTrains] = useState(() =>
    rawRef.current.map((t) => deriveTrain(t, performance.now())).filter(Boolean)
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = performance.now();

      rawRef.current = rawRef.current.map((train) => {
        if (train.status === "waiting") {
          if (now >= train.waitUntil) {
            return { ...train, status: "active", startTime: now, waitUntil: null };
          }
          return train;
        }
        const elapsed = now - train.startTime;
        if (elapsed >= TOTAL_DURATION_MS) {
          return { ...train, status: "waiting", waitUntil: now + randomRespawnDelay() };
        }
        return train;
      });

      setTrains(rawRef.current.map((t) => deriveTrain(t, now)).filter(Boolean));
    }, SCHEDULER_TICK_MS);

    return () => clearInterval(intervalId);
  }, []);

  return trains;
}
