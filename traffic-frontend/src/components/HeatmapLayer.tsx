import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L, { Layer } from "leaflet";
import "leaflet.heat";

type HeatmapPoint = {
  latitude: number;
  longitude: number;
  density?: number;
};

type HeatmapLayerProps = {
  data: HeatmapPoint[];
  radius?: number;
  blur?: number;
  maxZoom?: number;
  minOpacity?: number;
};

const HEAT_GRADIENT = {
  0.2: "#22c55e",
  0.4: "#facc15",
  0.7: "#f97316",
  1.0: "#ef4444",
} as const;

const DEFAULT_OPTIONS = {
  radius: 30,
  blur: 25,
  maxZoom: 13,
  minOpacity: 0.4,
} as const;

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({
  data,
  radius = DEFAULT_OPTIONS.radius,
  blur = DEFAULT_OPTIONS.blur,
  maxZoom = DEFAULT_OPTIONS.maxZoom,
  minOpacity = DEFAULT_OPTIONS.minOpacity,
}) => {
  const map = useMap();
  const heatLayerRef = useRef<Layer | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    // Remove previous layer if exists
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    const points: [number, number, number][] = data.map((p) => [
      p.latitude,
      p.longitude,
      p.density ?? 0.8,
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
      radius,
      blur,
      maxZoom,
      minOpacity,
      gradient: HEAT_GRADIENT,
    });

    heatLayer.addTo(map);
    heatLayerRef.current = heatLayer;

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [data, map, radius, blur, maxZoom, minOpacity]);

  return null;
};

export default HeatmapLayer;