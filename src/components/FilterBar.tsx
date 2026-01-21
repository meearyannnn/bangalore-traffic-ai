import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { TrafficStatus } from '@/types/traffic';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: TrafficStatus[];
  onFilterChange: (status: TrafficStatus) => void;
}

const statusFilters: { status: TrafficStatus; label: string; className: string }[] = [
  { status: 'severe', label: 'Severe', className: 'bg-traffic-severe/20 text-traffic-severe border-traffic-severe/30 hover:bg-traffic-severe/30' },
  { status: 'heavy', label: 'Heavy', className: 'bg-traffic-heavy/20 text-traffic-heavy border-traffic-heavy/30 hover:bg-traffic-heavy/30' },
  { status: 'moderate', label: 'Moderate', className: 'bg-traffic-moderate/20 text-traffic-moderate border-traffic-moderate/30 hover:bg-traffic-moderate/30' },
  { status: 'clear', label: 'Clear', className: 'bg-traffic-clear/20 text-traffic-clear border-traffic-clear/30 hover:bg-traffic-clear/30' },
];

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  activeFilters,
  onFilterChange,
}: FilterBarProps) => {
  return (
    <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      {/* Search */}
      <div className="relative flex-1 max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search hotspots..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {statusFilters.map(({ status, label, className }) => {
          const isActive = activeFilters.includes(status);
          return (
            <button
              key={status}
              onClick={() => onFilterChange(status)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                isActive
                  ? className
                  : 'bg-secondary text-muted-foreground border-border hover:bg-accent'
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Advanced Filters */}
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-accent border border-border transition-colors">
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Advanced</span>
      </button>
    </div>
  );
};
