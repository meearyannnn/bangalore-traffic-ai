import { useState } from 'react';
import { TrafficHotspot, TrafficStatus } from '@/types/traffic';
import { cn } from '@/lib/utils';
import { Navigation, ZoomIn, ZoomOut, Layers } from 'lucide-react';

interface MapViewProps {
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

export const MapView = ({ hotspots, selectedHotspot, onHotspotSelect }: MapViewProps) => {
  const [zoom, setZoom] = useState(1);

  // Normalize coordinates to fit in the map view
  const normalizeCoords = (lat: number, lng: number) => {
    const minLat = 12.8;
    const maxLat = 13.1;
    const minLng = 77.5;
    const maxLng = 77.8;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="font-semibold text-foreground">Traffic Map</h2>
          <p className="text-xs text-muted-foreground">Click on markers to view details</p>
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

      <div className="flex-1 relative bg-secondary/30 overflow-hidden">
        {/* Map Grid Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
          }}
        />

        {/* Road Network Simulation */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          {/* Outer Ring Road */}
          <ellipse
            cx="50%"
            cy="50%"
            rx="35%"
            ry="35%"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="3"
            strokeDasharray="8 4"
          />
          {/* Inner connections */}
          <line x1="20%" y1="30%" x2="80%" y2="70%" stroke="hsl(var(--border))" strokeWidth="2" />
          <line x1="80%" y1="30%" x2="20%" y2="70%" stroke="hsl(var(--border))" strokeWidth="2" />
          <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="hsl(var(--border))" strokeWidth="2" />
          <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="hsl(var(--border))" strokeWidth="2" />
        </svg>

        {/* Hotspot Markers */}
        <div
          className="absolute inset-0"
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
                  'absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300',
                  isSelected && 'z-10'
                )}
                style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
              >
                {/* Pulse Animation */}
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
                    {hotspot.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Compass */}
        <div className="absolute top-4 right-4 p-2 rounded-lg bg-card/80 backdrop-blur border border-border">
          <Navigation className="w-5 h-5 text-primary" />
        </div>

        {/* Scale */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur border border-border">
          <div className="w-12 h-0.5 bg-muted-foreground" />
          <span className="text-xs text-muted-foreground">5 km</span>
        </div>

        {/* Integration Note */}
        <div className="absolute bottom-4 right-4 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs text-primary font-medium">
            Ready for ML dataset integration
          </p>
        </div>
      </div>
    </div>
  );
};
