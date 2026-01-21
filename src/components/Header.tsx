import { Activity, MapPin, Bell } from 'lucide-react';

export const Header = () => {
  return (
    <header className="glass-card px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Bangalore Traffic <span className="gradient-text">Hotspots</span>
            </h1>
            <p className="text-xs text-muted-foreground">Real-time congestion monitoring</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-traffic-clear/20 border border-traffic-clear/30">
          <span className="w-2 h-2 rounded-full bg-traffic-clear status-pulse" />
          <span className="text-xs font-medium text-traffic-clear">Live</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Bengaluru, Karnataka</span>
        </div>

        <button className="relative p-2 rounded-lg bg-secondary hover:bg-accent transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-traffic-severe" />
        </button>
      </div>
    </header>
  );
};
