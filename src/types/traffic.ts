export type TrafficStatus = 'clear' | 'moderate' | 'heavy' | 'severe';

export interface TrafficHotspot {
  id: string;
  name: string;
  area: string;
  status: TrafficStatus;
  congestionLevel: number; // 0-100
  vehicleCount: number;
  avgSpeed: number; // km/h
  coordinates: {
    lat: number;
    lng: number;
  };
  lastUpdated: string;
  weather?: string;
  incidentReports?: number;
}

export interface TrafficStats {
  totalHotspots: number;
  severeCount: number;
  heavyCount: number;
  moderateCount: number;
  clearCount: number;
  avgCongestion: number;
}

export interface DatasetInfo {
  filename: string;
  rowCount: number;
  dateRange: string;
  uploadedAt: Date;
}
