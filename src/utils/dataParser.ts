import { TrafficHotspot, TrafficStatus, TrafficStats } from '@/types/traffic';

interface CSVRow {
  Date: string;
  'Area Name': string;
  'Road/Intersection Name': string;
  'Traffic Volume': string;
  'Average Speed': string;
  'Travel Time Index': string;
  'Congestion Level': string;
  'Road Capacity Utilization': string;
  'Incident Reports': string;
  'Environmental Impact': string;
  'Public Transport Usage': string;
  'Traffic Signal Compliance': string;
  'Parking Usage': string;
  'Pedestrian and Cyclist Count': string;
  'Weather Conditions': string;
  'Roadwork and Construction Activity': string;
}

// Bangalore area coordinates (approximate)
const areaCoordinates: Record<string, { lat: number; lng: number }> = {
  'Indiranagar': { lat: 12.9716, lng: 77.6412 },
  'Whitefield': { lat: 12.9698, lng: 77.7500 },
  'Koramangala': { lat: 12.9352, lng: 77.6245 },
  'M.G. Road': { lat: 12.9756, lng: 77.6062 },
  'Jayanagar': { lat: 12.9279, lng: 77.5937 },
  'Hebbal': { lat: 13.0358, lng: 77.5970 },
  'Yeshwanthpur': { lat: 13.0285, lng: 77.5510 },
  'BTM Layout': { lat: 12.9166, lng: 77.6101 },
  'Electronic City': { lat: 12.8399, lng: 77.6770 },
  'Marathahalli': { lat: 12.9591, lng: 77.6974 },
  'KR Puram': { lat: 13.0012, lng: 77.6966 },
  'Banashankari': { lat: 12.9255, lng: 77.5468 },
  'Malleshwaram': { lat: 13.0035, lng: 77.5710 },
  'Rajajinagar': { lat: 12.9913, lng: 77.5525 },
  'JP Nagar': { lat: 12.9063, lng: 77.5857 },
  'HSR Layout': { lat: 12.9116, lng: 77.6389 },
  'Sarjapur': { lat: 12.8587, lng: 77.7870 },
  'Yelahanka': { lat: 13.1007, lng: 77.5963 },
};

// Road-specific coordinate offsets for unique positioning
const roadOffsets: Record<string, { lat: number; lng: number }> = {
  '100 Feet Road': { lat: 0.002, lng: 0.003 },
  'CMH Road': { lat: -0.003, lng: 0.002 },
  'Marathahalli Bridge': { lat: 0.001, lng: -0.002 },
  'Sony World Junction': { lat: 0.003, lng: 0.001 },
  'Sarjapur Road': { lat: -0.002, lng: 0.004 },
  'Trinity Circle': { lat: 0.002, lng: -0.001 },
  'Anil Kumble Circle': { lat: -0.001, lng: 0.003 },
  'Jayanagar 4th Block': { lat: 0.001, lng: 0.001 },
  'South End Circle': { lat: -0.002, lng: -0.001 },
  'Hebbal Flyover': { lat: 0.003, lng: 0.002 },
  'Ballari Road': { lat: -0.001, lng: -0.002 },
  'Yeshwanthpur Circle': { lat: 0.002, lng: -0.003 },
};

function getCongestionStatus(level: number): TrafficStatus {
  if (level >= 85) return 'severe';
  if (level >= 65) return 'heavy';
  if (level >= 40) return 'moderate';
  return 'clear';
}

function getCoordinates(area: string, road: string): { lat: number; lng: number } {
  const baseCoords = areaCoordinates[area] || { lat: 12.9716, lng: 77.5946 };
  const offset = roadOffsets[road] || { lat: Math.random() * 0.01 - 0.005, lng: Math.random() * 0.01 - 0.005 };
  
  return {
    lat: baseCoords.lat + offset.lat,
    lng: baseCoords.lng + offset.lng,
  };
}

export function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    
    return row as unknown as CSVRow;
  });
}

export function parseJSON(content: string): CSVRow[] {
  const data = JSON.parse(content);
  return Array.isArray(data) ? data : [data];
}

export function aggregateLatestData(rows: CSVRow[]): Map<string, CSVRow> {
  const latestData = new Map<string, CSVRow>();
  
  // Sort by date descending and keep only the latest entry for each location
  const sortedRows = [...rows].sort((a, b) => 
    new Date(b.Date).getTime() - new Date(a.Date).getTime()
  );
  
  sortedRows.forEach(row => {
    const key = `${row['Area Name']}-${row['Road/Intersection Name']}`;
    if (!latestData.has(key)) {
      latestData.set(key, row);
    }
  });
  
  return latestData;
}

export function convertToHotspots(rows: CSVRow[], limit = 20): TrafficHotspot[] {
  const latestData = aggregateLatestData(rows);
  
  const hotspots: TrafficHotspot[] = Array.from(latestData.values())
    .slice(0, limit)
    .map((row, index) => {
      const congestionLevel = parseFloat(row['Congestion Level']) || 0;
      const avgSpeed = parseFloat(row['Average Speed']) || 0;
      const trafficVolume = parseInt(row['Traffic Volume']) || 0;
      
      return {
        id: `uploaded-${index + 1}`,
        name: row['Road/Intersection Name'],
        area: row['Area Name'],
        status: getCongestionStatus(congestionLevel),
        congestionLevel: Math.min(100, Math.round(congestionLevel)),
        vehicleCount: trafficVolume,
        avgSpeed: Math.round(avgSpeed),
        coordinates: getCoordinates(row['Area Name'], row['Road/Intersection Name']),
        lastUpdated: row.Date || 'Just now',
        weather: row['Weather Conditions'],
        incidentReports: parseInt(row['Incident Reports']) || 0,
      };
    });

  // Sort by congestion level (highest first)
  return hotspots.sort((a, b) => b.congestionLevel - a.congestionLevel);
}

export function calculateStats(hotspots: TrafficHotspot[]): TrafficStats {
  const severeCount = hotspots.filter(h => h.status === 'severe').length;
  const heavyCount = hotspots.filter(h => h.status === 'heavy').length;
  const moderateCount = hotspots.filter(h => h.status === 'moderate').length;
  const clearCount = hotspots.filter(h => h.status === 'clear').length;
  
  const avgCongestion = hotspots.length > 0
    ? Math.round(hotspots.reduce((sum, h) => sum + h.congestionLevel, 0) / hotspots.length)
    : 0;

  return {
    totalHotspots: hotspots.length,
    severeCount,
    heavyCount,
    moderateCount,
    clearCount,
    avgCongestion,
  };
}

export function parseDataFile(content: string, filename: string): TrafficHotspot[] {
  const isJSON = filename.toLowerCase().endsWith('.json');
  
  try {
    const rows = isJSON ? parseJSON(content) : parseCSV(content);
    return convertToHotspots(rows);
  } catch (error) {
    console.error('Error parsing file:', error);
    throw new Error(`Failed to parse ${isJSON ? 'JSON' : 'CSV'} file. Please check the format.`);
  }
}
