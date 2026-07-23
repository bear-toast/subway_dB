import { useEffect, useState } from "react";
import { STATIONS } from "../data/line2.js";

const FALLBACK_STATION_ID = "gangnam";

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function findNearestStation(lat, lng) {
  let nearest = STATIONS[0];
  let minDist = Infinity;
  for (const station of STATIONS) {
    const dist = haversineDistance(lat, lng, station.lat, station.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = station;
    }
  }
  return nearest.id;
}

export function useNearestStation() {
  const [nearestStationId, setNearestStationId] = useState(FALLBACK_STATION_ID);
  const [source, setSource] = useState("pending"); // pending | geo | fallback

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setSource("fallback");
      return;
    }

    let cancelled = false;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (cancelled) return;
        setNearestStationId(findNearestStation(pos.coords.latitude, pos.coords.longitude));
        setSource("geo");
      },
      () => {
        if (cancelled) return;
        setNearestStationId(FALLBACK_STATION_ID);
        setSource("fallback");
      },
      { enableHighAccuracy: false, maximumAge: 15000, timeout: 8000 }
    );

    return () => {
      cancelled = true;
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { nearestStationId, source };
}
