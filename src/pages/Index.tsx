import { useState, useMemo } from 'react';
import { AlertTriangle, TrendingUp, Car, Activity } from 'lucide-react';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { FilterBar } from '@/components/FilterBar';
import { MapView } from '@/components/MapView';
import { HotspotList } from '@/components/HotspotList';
import { DataUploader } from '@/components/DataUploader';
import { mockHotspots, mockStats } from '@/data/mockTrafficData';
import { calculateStats } from '@/utils/dataParser';
import { TrafficStatus, TrafficHotspot, DatasetInfo } from '@/types/traffic';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<TrafficStatus[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  
  // Dataset state
  const [uploadedHotspots, setUploadedHotspots] = useState<TrafficHotspot[] | null>(null);
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo | null>(null);

  // Use uploaded data if available, otherwise use mock data
  const hotspots = uploadedHotspots || mockHotspots;
  const stats = useMemo(() => 
    uploadedHotspots ? calculateStats(uploadedHotspots) : mockStats,
    [uploadedHotspots]
  );

  const handleDataLoaded = (newHotspots: TrafficHotspot[], info: DatasetInfo) => {
    setUploadedHotspots(newHotspots);
    setDatasetInfo(info);
    setSelectedHotspot(null);
    setActiveFilters([]);
    setSearchQuery('');
  };

  const handleClearData = () => {
    setUploadedHotspots(null);
    setDatasetInfo(null);
  };

  const handleFilterChange = (status: TrafficStatus) => {
    setActiveFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const filteredHotspots = useMemo(() => {
    return hotspots.filter((hotspot) => {
      const matchesSearch =
        hotspot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotspot.area.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilters.length === 0 || activeFilters.includes(hotspot.status);

      return matchesSearch && matchesFilter;
    });
  }, [hotspots, searchQuery, activeFilters]);

  const totalVehicles = useMemo(() => {
    const total = hotspots.reduce((sum, h) => sum + h.vehicleCount, 0);
    if (total >= 1000000) return `${(total / 1000000).toFixed(1)}M`;
    if (total >= 1000) return `${(total / 1000).toFixed(1)}K`;
    return total.toString();
  }, [hotspots]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <Header />

      {/* Data Uploader */}
      <DataUploader 
        onDataLoaded={handleDataLoaded}
        datasetInfo={datasetInfo}
        onClearData={handleClearData}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Hotspots"
          value={stats.totalHotspots}
          icon={Activity}
          className="animate-delay-100"
        />
        <StatsCard
          title="Severe Congestion"
          value={stats.severeCount}
          icon={AlertTriangle}
          variant="severe"
          trend={uploadedHotspots ? undefined : { value: 12, isPositive: false }}
          className="animate-delay-200"
        />
        <StatsCard
          title="Avg. Congestion"
          value={`${stats.avgCongestion}%`}
          icon={TrendingUp}
          variant="heavy"
          className="animate-delay-300"
        />
        <StatsCard
          title="Total Vehicles"
          value={totalVehicles}
          icon={Car}
          variant="moderate"
          trend={uploadedHotspots ? undefined : { value: 5, isPositive: true }}
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
              {uploadedHotspots ? 'Dataset Hotspots' : 'Active Hotspots'}
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
