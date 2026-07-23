import { useCallback, useEffect, useRef, useState } from "react";

const SAMPLE_INTERVAL_MS = 500;
const SMOOTHING_ALPHA = 0.35;
const DB_MIN = 30;
const DB_MAX = 100;

function computeDb(analyser, buffer) {
  analyser.getFloatTimeDomainData(buffer);
  let sumSquares = 0;
  for (let i = 0; i < buffer.length; i++) {
    sumSquares += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sumSquares / buffer.length) || 1e-8;
  const db = 20 * Math.log10(rms) + 94;
  return Math.min(Math.max(db, DB_MIN), DB_MAX);
}

export function useMicDb() {
  const [db, setDb] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | requesting | active | denied | error

  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const intervalRef = useRef(null);
  const smoothedRef = useRef(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    smoothedRef.current = null;
    setDb(null);
    setStatus((prev) => (prev === "denied" || prev === "error" ? prev : "idle"));
  }, []);

  const start = useCallback(async () => {
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextCtor();
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);

      intervalRef.current = setInterval(() => {
        const rawDb = computeDb(analyser, buffer);
        smoothedRef.current =
          smoothedRef.current === null
            ? rawDb
            : smoothedRef.current + SMOOTHING_ALPHA * (rawDb - smoothedRef.current);
        setDb(smoothedRef.current);
      }, SAMPLE_INTERVAL_MS);

      setStatus("active");
    } catch (err) {
      if (err && (err.name === "NotAllowedError" || err.name === "SecurityError")) {
        setStatus("denied");
      } else {
        setStatus("error");
      }
    }
  }, []);

  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { db, status, start, stop };
}
