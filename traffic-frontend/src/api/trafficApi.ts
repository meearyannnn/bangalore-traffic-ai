import axios from "axios";
import type { TrafficRequest, TrafficResponse } from "../types/traffic";


const API_URL = "http://127.0.0.1:8000";

export const predictTraffic = async (
  data: TrafficRequest
): Promise<TrafficResponse> => {
  const res = await axios.post<TrafficResponse>(
    `${API_URL}/predict`,
    data
  );
  return res.data;
};

export const getHotspots = async () => {
  const res = await axios.get(`${API_URL}/hotspots`);
  return res.data;
};

export const getZones = async () => {
  const res = await axios.get(`${API_URL}/zones`);
  return res.data;
};
export async function fetchGpsTraffic(lat: number, lng: number) {
  const res = await fetch("http://localhost:8000/location-traffic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng }),
  });

  return res.json();
}
