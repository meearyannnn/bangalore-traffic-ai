import { useState, useEffect, useRef } from 'react';
import { TrafficHotspot, TrafficStatus } from '@/types/traffic';
import { cn } from '@/lib/utils';
import { Navigation, ZoomIn, ZoomOut, Layers, MapPin } from 'lucide-react';

interface RealMapProps {
  hotspots: TrafficHotspot[];
  selectedHotspot: string | null;
  onHotspotSelect: (id: string) => void;
}

const statusColors: Record<TrafficStatus, string> = {
  clear: 'bg-traffic-clear',
  moderate: 'bg-traffic-moderate',
  heavy: 'bg-traffic-heavy',
  severe: 'bg-traffic-severe',
};

export const RealMap = ({ hotspots, selectedHotspot, onHotspotSelect }: RealMapProps) => {
  const [zoom, setZoom] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);

  // Normalize coordinates to fit in the map view (Bangalore bounds)
  const normalizeCoords = (lat: number, lng: number) => {
    const minLat = 12.8;
    const maxLat = 13.15;
    const minLng = 77.45;
    const maxLng = 77.85;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="font-semibold text-foreground">Live Traffic Map</h2>
          <p className="text-xs text-muted-foreground">Bangalore real-time congestion view</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors">
            <Layers className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden" ref={mapRef}>
        {/* Embedded OpenStreetMap */}
        <div className="absolute inset-0">
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=77.4500%2C12.8000%2C77.8500%2C13.1500&layer=mapnik&marker=12.9716%2C77.5946"
            className="w-full h-full border-0 opacity-30"
            style={{ filter: 'grayscale(100%) invert(90%) hue-rotate(180deg)' }}
            title="Bangalore Map"
          />
        </div>

        {/* Hotspot Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          {hotspots.map((hotspot) => {
            const coords = normalizeCoords(hotspot.coordinates.lat, hotspot.coordinates.lng);
            const isSelected = selectedHotspot === hotspot.id;

            return (
              <button
                key={hotspot.id}
                onClick={() => onHotspotSelect(hotspot.id)}
                className={cn(
                  'absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-auto',
                  isSelected && 'z-10'
                )}
                style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
              >
                {/* Pulse Animation for severe */}
                {hotspot.status === 'severe' && (
                  <span
                    className={cn(
                      'absolute inset-0 rounded-full animate-ping',
                      statusColors[hotspot.status],
                      'opacity-40'
                    )}
                    style={{ animationDuration: '1.5s' }}
                  />
                )}

                {/* Marker */}
                <span
                  className={cn(
                    'relative block rounded-full border-2 border-background shadow-lg transition-transform',
                    statusColors[hotspot.status],
                    isSelected ? 'w-6 h-6 scale-125' : 'w-4 h-4 hover:scale-110'
                  )}
                />

                {/* Label */}
                {isSelected && (
                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 rounded bg-card text-xs font-medium text-foreground whitespace-nowrap shadow-lg border border-border">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {hotspot.name}
                    </div>
                    <div className="text-muted-foreground text-[10px]">{hotspot.area}</div>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Compass */}
        <div className="absolute top-4 right-4 p-2 rounded-lg bg-card/80 backdrop-blur border border-border z-10">
          <Navigation className="w-5 h-5 text-primary" />
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass-card p-3 z-10">
          <p className="text-xs font-medium text-foreground mb-2">Traffic Status</p>
          <div className="space-y-1.5">
            {(['severe', 'heavy', 'moderate', 'clear'] as TrafficStatus[]).map((status) => (
              <div key={status} className="flex items-center gap-2">
                <span className={cn('w-3 h-3 rounded-full', statusColors[status])} />
                <span className="text-xs text-muted-foreground capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live indicator */}
        <div className="absolute top-4 left-4 glass-card px-3 py-1.5 z-10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-traffic-clear animate-pulse" />
          <span className="text-xs font-medium text-foreground">Live</span>
        </div>

        {/* Scale */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur border border-border z-10">
          <div className="w-12 h-0.5 bg-muted-foreground" />
          <span className="text-xs text-muted-foreground">5 km</span>
        </div>
      </div>
    </div>
  );
};
