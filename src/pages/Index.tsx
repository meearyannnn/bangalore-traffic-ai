import { useState, useMemo } from 'react';
import { AlertTriangle, TrendingUp, Car, Activity } from 'lucide-react';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { FilterBar } from '@/components/FilterBar';
import { MapView } from '@/components/MapView';
import { HotspotList } from '@/components/HotspotList';
import { mockHotspots, mockStats } from '@/data/mockTrafficData';
import { TrafficStatus } from '@/types/traffic';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<TrafficStatus[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  const handleFilterChange = (status: TrafficStatus) => {
    setActiveFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const filteredHotspots = useMemo(() => {
    return mockHotspots.filter((hotspot) => {
      const matchesSearch =
        hotspot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotspot.area.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilters.length === 0 || activeFilters.includes(hotspot.status);

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilters]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <Header />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Hotspots"
          value={mockStats.totalHotspots}
          icon={Activity}
          className="animate-delay-100"
        />
        <StatsCard
          title="Severe Congestion"
          value={mockStats.severeCount}
          icon={AlertTriangle}
          variant="severe"
          trend={{ value: 12, isPositive: false }}
          className="animate-delay-200"
        />
        <StatsCard
          title="Avg. Congestion"
          value={`${mockStats.avgCongestion}%`}
          icon={TrendingUp}
          variant="heavy"
          className="animate-delay-300"
        />
        <StatsCard
          title="Total Vehicles"
          value="23.2K"
          icon={Car}
          variant="moderate"
          trend={{ value: 5, isPositive: true }}
          className="animate-delay-300"
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map */}
        <div className="xl:col-span-2 h-[500px]">
          <MapView
            hotspots={filteredHotspots}
            selectedHotspot={selectedHotspot}
            onHotspotSelect={setSelectedHotspot}
          />
        </div>

        {/* Hotspot List */}
        <div className="xl:col-span-1 max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Active Hotspots
              <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
                {filteredHotspots.length}
              </span>
            </h2>
          </div>
          <HotspotList
            hotspots={filteredHotspots}
            selectedHotspot={selectedHotspot}
            onHotspotSelect={setSelectedHotspot}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
