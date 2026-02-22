export interface TrafficRequest {
  hour: number;
  weekday: number;
  Traffic_Volume: number;
  Average_Speed: number;
}

export interface TrafficResponse {
  predicted_congestion_level: number;
}

export interface Hotspot {
  lat: number;
  lon: number;
  Area_Name: string;
  Road_Name: string;
  Congestion_Level: number;
}
export type Location = {
  lat: string;
  lng: string;
};
export interface TrafficImageResponse {
  vehicle_count: number;
  vehicle_score: number;
  anomaly_status: "ANOMALY" | "NORMAL";
  final_congestion_score: number;
  marker_color: "green" | "orange" | "red";
}
export interface LiveTrafficResponse {
  vehicle_count: number;
  final_congestion_score: number;
}
