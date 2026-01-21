import { MapPin, Car, Gauge, Clock } from 'lucide-react';
import { TrafficHotspot, TrafficStatus } from '@/types/traffic';
import { cn } from '@/lib/utils';

interface HotspotCardProps {
  hotspot: TrafficHotspot;
  isSelected?: boolean;
  onClick?: () => void;
}

const statusConfig: Record<TrafficStatus, { label: string; className: string; bgClass: string }> = {
  clear: {
    label: 'Clear',
    className: 'text-traffic-clear border-traffic-clear/30 bg-traffic-clear/10',
    bgClass: 'traffic-clear',
  },
  moderate: {
    label: 'Moderate',
    className: 'text-traffic-moderate border-traffic-moderate/30 bg-traffic-moderate/10',
    bgClass: 'traffic-moderate',
  },
  heavy: {
    label: 'Heavy',
    className: 'text-traffic-heavy border-traffic-heavy/30 bg-traffic-heavy/10',
    bgClass: 'traffic-heavy',
  },
  severe: {
    label: 'Severe',
    className: 'text-traffic-severe border-traffic-severe/30 bg-traffic-severe/10',
    bgClass: 'traffic-severe',
  },
};

export const HotspotCard = ({ hotspot, isSelected, onClick }: HotspotCardProps) => {
  const config = statusConfig[hotspot.status];

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02]',
        isSelected && 'ring-2 ring-primary'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground truncate">{hotspot.name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="w-3 h-3" />
            <span>{hotspot.area}</span>
          </div>
        </div>
        <span
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium border',
            config.className
          )}
        >
          {config.label}
        </span>
      </div>

      {/* Congestion Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Congestion</span>
          <span className="font-mono font-medium text-foreground">{hotspot.congestionLevel}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', config.bgClass)}
            style={{ width: `${hotspot.congestionLevel}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 rounded-lg bg-secondary/50">
          <Car className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-sm font-semibold text-foreground">{hotspot.vehicleCount.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Vehicles</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/50">
          <Gauge className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-sm font-semibold text-foreground">{hotspot.avgSpeed}</p>
          <p className="text-[10px] text-muted-foreground">km/h</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/50">
          <Clock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-sm font-semibold text-foreground">{hotspot.lastUpdated}</p>
          <p className="text-[10px] text-muted-foreground">Updated</p>
        </div>
      </div>
    </div>
  );
};
