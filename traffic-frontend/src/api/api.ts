// src/api/api.ts

const BASE_URL = "http://127.0.0.1:8000";

/* =======================
   RAILWAY API
   ======================= */

export async function getRailwayTrains(toStationCode: string) {
  const res = await fetch(
    `${BASE_URL}/railway/search?to_station_code=${toStationCode}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch railway trains");
  }

  return res.json();
}
export async function getSmartModeRecommendation(payload: {
  distance_km: number;
  congestion: "low" | "medium" | "high";
  metro_nearby: boolean;
  suburban_nearby: boolean;
  peak_hour: boolean;
}) {
  const res = await fetch("http://127.0.0.1:8000/smart-mode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Smart Mode failed");

  return res.json();
}
