import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents, Marker, Pane } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L, { Layer } from "leaflet";
import "leaflet.heat";
import { getHotspots } from "../api/trafficApi";
import type { Hotspot } from "../types/traffic";
import { AlertTriangle, Activity, Map } from "lucide-react";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* ------------- CONSTANTS ------------- */

const MAP_CENTER: [number, number] = [12.9716, 77.5946];
const MAP_ZOOM = 12;
const MAP_HEIGHT = "h-[520px]";

const CONGESTION_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 70,
};

const CONGESTION_COLORS = {
  LOW: "#22c55e",
  MEDIUM: "#facc15",
  HIGH: "#ef4444",
};

const HEATMAP_GRADIENT = {
  0.2: CONGESTION_COLORS.LOW,
  0.4: CONGESTION_COLORS.MEDIUM,
  0.7: "#f97316",
  1.0: CONGESTION_COLORS.HIGH,
};

const HEATMAP_CONFIG = {
  radius: 32,
  blur: 26,
  maxZoom: 13,
  minOpacity: 0.35,
};

const LEGEND_DATA = [
  { label: "Low", color: CONGESTION_COLORS.LOW },
  { label: "Medium", color: CONGESTION_COLORS.MEDIUM },
  { label: "High", color: CONGESTION_COLORS.HIGH },
];

/* ------------- TYPES ------------- */

type CongestionColor = {
  bg: string;
  ring: string;
};

type CongestionLevel = "Low" | "Medium" | "High";

type HotspotsMapProps = {
  location?: { lat: string; lng: string };
  prediction: {
    lat: number;
    lng: number;
    level: number;
  } | null;
  anomaly?: {
    lat: number;
    lng: number;
    severity: number;
  } | null;
  setLocation: (loc: { lat: string; lng: string }) => void;
};

/* ------------- COLOR & CONGESTION UTILITIES ------------- */

const getCongestionColor = (level: number): CongestionColor => {
  if (level < CONGESTION_THRESHOLDS.LOW) {
    return { bg: CONGESTION_COLORS.LOW, ring: "ring-green-500" };
  }
  if (level < CONGESTION_THRESHOLDS.MEDIUM) {
    return { bg: CONGESTION_COLORS.MEDIUM, ring: "ring-yellow-500" };
  }
  return { bg: CONGESTION_COLORS.HIGH, ring: "ring-red-500" };
};

const getCongestionLabel = (level: number): CongestionLevel => {
  if (level < CONGESTION_THRESHOLDS.LOW) return "Low";
  if (level < CONGESTION_THRESHOLDS.MEDIUM) return "Medium";
  return "High";
};

/* ------------- SUB-COMPONENTS ------------- */

function HeatmapLayer({ data }: { data: Hotspot[] }) {
  const map = useMap();
  const heatLayerRef = useRef<Layer | null>(null);

  useEffect(() => {
    if (!data.length) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    const points: [number, number, number][] = data.map((h) => [
      h.lat,
      h.lon,
      Math.min(h.Congestion_Level / 100, 1),
    ]);

    const heatLayerFactory = (
      L as unknown as {
        heatLayer: (
          pts: [number, number, number][],
          options: Record<string, unknown>
        ) => Layer;
      }
    ).heatLayer;

    const heatLayer = heatLayerFactory(points, {
      ...HEATMAP_CONFIG,
      gradient: HEATMAP_GRADIENT,
    });

    heatLayer.addTo(map);
    heatLayerRef.current = heatLayer;

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [data, map]);

  return null;
}

function HotspotPopup({ hotspot }: { hotspot: Hotspot }) {
  const { bg } = getCongestionColor(hotspot.Congestion_Level);
  const label = getCongestionLabel(hotspot.Congestion_Level);

  return (
    <Popup>
      <div className="w-56 space-y-2">
        <div>
          <p className="font-semibold text-slate-900">{hotspot.Area_Name}</p>
          <p className="text-xs text-slate-600">{hotspot.Road_Name}</p>
        </div>
        <div className="pt-2 border-t border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Congestion Level</span>
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: bg }}
              ></div>
              <span className="font-semibold text-slate-900">
                {hotspot.Congestion_Level}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Status</span>
            <span
              className="text-xs font-semibold px-2 py-1 rounded"
              style={{ backgroundColor: `${bg}20`, color: bg }}
            >
              {label}
            </span>
          </div>
        </div>
      </div>
    </Popup>
  );
}

function MapMarkers({ hotspots }: { hotspots: Hotspot[] }) {
  return (
    <>
      {hotspots.map((hotspot, index) => {
        const { bg } = getCongestionColor(hotspot.Congestion_Level);

        return (
          <CircleMarker
            key={index}
            center={[hotspot.lat, hotspot.lon]}
            radius={9}
            pathOptions={{
              color: bg,
              fillColor: bg,
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <HotspotPopup hotspot={hotspot} />
          </CircleMarker>
        );
      })}
    </>
  );
}

function MapClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapHeader({ criticalCount }: { criticalCount: number }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Map className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-slate-100">
              Traffic Hotspots Map
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Real-time congestion visualization with heatmap and point clusters
          </p>
        </div>
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 whitespace-nowrap">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-semibold text-red-400">
              {criticalCount} Critical
            </span>
          </div>
        )}
      </div>

      <MapLegend />
    </div>
  );
}

function MapLegend() {
  return (
    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-700/50">
      {LEGEND_DATA.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          ></div>
          <span className="text-xs text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
        <p className="text-sm text-slate-300">Loading traffic data...</p>
      </div>
    </div>
  );
}

function FlyToPrediction({
  prediction,
}: {
  prediction: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (prediction) {
      map.flyTo(
        [prediction.lat, prediction.lng],
        14,
        { duration: 1.2 }
      );
    }
  }, [prediction, map]);
  return null;
}

function MarkerOnTop({ position }: { position: [number, number] }) {
  return (
    <Marker
      position={position}
      pane="markerPane"
      zIndexOffset={1000}
    >
      <Popup>
        <strong>Selected Location</strong>
      </Popup>
    </Marker>
  );
}

/* ------------- MAIN COMPONENT ------------- */

const HotspotMap: React.FC<HotspotsMapProps> = ({
  setLocation,
  prediction,
  anomaly,
  location,
}) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHotspots()
      .then(setHotspots)
      .finally(() => setLoading(false));
  }, []);

  const highCongestionCount = hotspots.filter(
    (h) => h.Congestion_Level >= CONGESTION_THRESHOLDS.MEDIUM
  ).length;

  return (
    <div className="space-y-4">
      <MapHeader criticalCount={highCongestionCount} />

      <div className={`relative bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-colors`}>
        {loading && <LoadingOverlay />}

        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          className={`${MAP_HEIGHT} w-full`}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          <Pane name="predictionPane" style={{ zIndex: 450 }} />

          <MapClickHandler
            onSelect={(lat, lng) => {
              setLocation({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
            }}
          />

          <FlyToPrediction prediction={prediction} />

          <HeatmapLayer data={hotspots} />
          <MapMarkers hotspots={hotspots} />

          {location?.lat && location?.lng && (
            <MarkerOnTop
              position={[Number(location.lat), Number(location.lng)]}
            />
          )}

          {prediction && (
            <CircleMarker
              center={[prediction.lat, prediction.lng]}
              pane="predictionPane"
              radius={14}
              pathOptions={{
                color:
                  prediction.level < 35
                    ? "#22c55e"
                    : prediction.level < 70
                    ? "#facc15"
                    : "#ef4444",
                fillColor:
                  prediction.level < 35
                    ? "#22c55e"
                    : prediction.level < 70
                    ? "#facc15"
                    : "#ef4444",
                fillOpacity: 0.9,
                weight: 4,
              }}
            >
              <Popup>
                <strong>Predicted Congestion</strong>
                <br />
                {prediction.level < 35 && "🟢 Low"}
                {prediction.level >= 35 && prediction.level < 70 && "🟡 Medium"}
                {prediction.level >= 70 && "🔴 High"}
              </Popup>
            </CircleMarker>
          )}

          {anomaly && (
            <CircleMarker
              center={[anomaly.lat, anomaly.lng]}
              radius={18}
              pathOptions={{
                color: anomaly.severity > 0.5 ? "#9333ea" : "#ef4444",
                fillColor: anomaly.severity > 0.5 ? "#9333ea" : "#ef4444",
                fillOpacity: 0.9,
                weight: 4,
              }}
              className="animate-pulse"
            >
              <Popup>
                <strong>⚠️ Unusual Traffic Detected</strong>
                <br />
                Severity: {anomaly.severity}
              </Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default HotspotMap;