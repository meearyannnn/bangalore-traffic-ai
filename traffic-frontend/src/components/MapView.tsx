import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { TrafficImageResponse } from "../types/traffic";

interface Props {
  data: TrafficImageResponse | null;
}

export default function MapView({ data }: Props) {
  const bangalore: [number, number] = [12.9716, 77.5946];

  if (!data) return null;

  return (
    <MapContainer
      center={bangalore}
      zoom={13}
      style={{ height: "400px", marginTop: 20 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <CircleMarker
        center={bangalore}
        radius={15}
        pathOptions={{
          color: data.marker_color,
          fillColor: data.marker_color,
          fillOpacity: 0.8
        }}
      >
        <Popup>
          <div>
            <p><b>Vehicles:</b> {data.vehicle_count}</p>
            <p><b>Vehicle Score:</b> {data.vehicle_score}</p>
            <p><b>Congestion:</b> {data.final_congestion_score}/100</p>
            <p><b>Status:</b> {data.anomaly_status}</p>
          </div>
        </Popup>
      </CircleMarker>
    </MapContainer>
  );
}