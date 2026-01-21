import { TrafficHotspot } from '@/types/traffic';
import { HotspotCard } from './HotspotCard';

interface HotspotListProps {
  hotspots: TrafficHotspot[];
  selectedHotspot: string | null;
  onHotspotSelect: (id: string) => void;
}

export const HotspotList = ({ hotspots, selectedHotspot, onHotspotSelect }: HotspotListProps) => {
  if (hotspots.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">No hotspots match your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {hotspots.map((hotspot, index) => (
        <div
          key={hotspot.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <HotspotCard
            hotspot={hotspot}
            isSelected={selectedHotspot === hotspot.id}
            onClick={() => onHotspotSelect(hotspot.id)}
          />
        </div>
      ))}
    </div>
  );
};
