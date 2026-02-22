import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { Brain, CheckCircle, Loader2, Zap, TrendingUp, Clock, Car, Bus, Train, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons in React-Leaflet
interface LeafletIconDefault {
  _getIconUrl?: unknown;
}

delete (L.Icon.Default.prototype as LeafletIconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const sourceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// ✅ Backend response type
type SmartResult = {
  recommended_mode: string;
  confidence: number;
  comparison: {
    car: { time: number; cost: number };
    metro: { time: number; cost: number };
    bus: { time: number; cost: number };
  };
  reasoning: string[];
};

// ✅ Input payload type
type SmartModeInputs = {
  source: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  predicted_congestion: number;
  hour: number;
  distance?: number;
  car_time?: number;
  metro_time?: number;
  bus_time?: number;
  car_cost?: number;
  metro_cost?: number;
  bus_cost?: number;
  is_peak?: number;
  metro_available?: number;
  bus_transfers?: number;
};

interface SmartModeCardProps {
  smartInputs?: SmartModeInputs;
  apiUrl?: string;
}

// Component to handle map clicks
function MapClickHandler({ 
  onMapClick, 
  nextPointToSet 
}: { 
  onMapClick: (lat: number, lng: number) => void;
  nextPointToSet: 'source' | 'destination' | 'done';
}) {
  useMapEvents({
    click: (e) => {
      if (nextPointToSet !== 'done') {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function SmartModeCard({ 
  smartInputs,
  apiUrl = "http://127.0.0.1:8000"
}: SmartModeCardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartResult | null>(null);
  const [error, setError] = useState("");
  
  // Track which point to set next: 'source' -> 'destination' -> 'done'
  const [nextPointToSet, setNextPointToSet] = useState<'source' | 'destination' | 'done'>('source');

  // ✅ NOW USING STATE - User can modify via map clicks!
  const [payload, setPayload] = useState<SmartModeInputs>(
    smartInputs || {
      source: { lat: 12.9716, lng: 77.5946 },
      destination: { lat: 13.0827, lng: 77.5877 },
      predicted_congestion: 72,
      hour: 9,
    }
  );

  const runSmartMode = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${apiUrl}/smart-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Smart Mode failed");
      }

      const data = await res.json();
      
      if (!data.recommended_mode || data.confidence === undefined) {
        throw new Error("Invalid response from server");
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get Smart Mode recommendation");
      console.error("Smart Mode Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle map clicks - automatically set source first, then destination
  const handleMapClick = (lat: number, lng: number) => {
    if (nextPointToSet === 'source') {
      setPayload({ ...payload, source: { lat, lng } });
      setNextPointToSet('destination');
    } else if (nextPointToSet === 'destination') {
      setPayload({ ...payload, destination: { lat, lng } });
      setNextPointToSet('done');
    }
    // If 'done', map clicks are disabled
  };

  // Reset to allow setting new route
  const handleReset = () => {
    setNextPointToSet('source');
    setResult(null);
    setError("");
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return "text-emerald-400";
    if (confidence > 0.6) return "text-amber-400";
    return "text-orange-400";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence > 0.8) return "High Confidence";
    if (confidence > 0.6) return "Medium Confidence";
    return "Low Confidence";
  };

  const getModeIcon = (mode: string) => {
    const modeStr = mode.toLowerCase();
    if (modeStr.includes("metro")) return "🚇";
    if (modeStr.includes("car")) return "🚗";
    if (modeStr.includes("bus")) return "🚌";
    if (modeStr.includes("bike")) return "🚴";
    return "🚗";
  };

  const getModeIconComponent = (mode: string) => {
    const modeStr = mode.toLowerCase();
    if (modeStr.includes("metro")) return <Train className="w-6 h-6" />;
    if (modeStr.includes("bus")) return <Bus className="w-6 h-6" />;
    return <Car className="w-6 h-6" />;
  };

  const isPeak = payload.hour >= 8 && payload.hour <= 10 || payload.hour >= 17 && payload.hour <= 19;
  const congestionLevel = payload.predicted_congestion > 70 ? 'High' : 
                          payload.predicted_congestion > 40 ? 'Medium' : 'Low';

  return (
    <div className="space-y-6">
      {/* Smart Mode Card */}
      <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent rounded-2xl pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-6 border-l-2 border-amber-500 pl-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5" />
                  INTELLIGENT ROUTING
                </p>
                <h3 className="text-white font-bold text-3xl mb-1">Smart Mode</h3>
                <p className="text-slate-400 text-sm">AI-powered travel optimization engine</p>
              </div>
              <div className="flex items-center gap-3">
                {nextPointToSet === 'done' && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-sm font-semibold rounded-lg border border-slate-600 transition-all flex items-center gap-2"
                  >
                    🔄 Reset Route
                  </button>
                )}
                <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl border border-amber-400/30">
                  <Zap className="w-8 h-8 text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Instruction Banner */}
          {nextPointToSet !== 'done' && (
            <div className="mb-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-4">
              <p className="text-cyan-300 text-sm font-semibold flex items-center gap-2">
                {nextPointToSet === 'source' && (
                  <>
                    <span className="text-xl">🟢</span>
                    <span>Step 1: Click on the map below to set your SOURCE location</span>
                  </>
                )}
                {nextPointToSet === 'destination' && (
                  <>
                    <span className="text-xl">🔴</span>
                    <span>Step 2: Click on the map below to set your DESTINATION location</span>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Source Location - Display only */}
          <div className="mb-4">
            <div className={`bg-slate-800/60 border rounded-xl p-4 transition-all ${
              nextPointToSet === 'source' 
                ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' 
                : nextPointToSet === 'done' || nextPointToSet === 'destination'
                ? 'border-emerald-500/50'
                : 'border-slate-700/30'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <p className="text-slate-400 text-xs uppercase tracking-wide">SOURCE LOCATION</p>
                {nextPointToSet === 'source' && (
                  <span className="ml-auto text-emerald-400 text-xs font-semibold animate-pulse">
                    👆 Waiting for map click...
                  </span>
                )}
                {(nextPointToSet === 'destination' || nextPointToSet === 'done') && (
                  <span className="ml-auto text-emerald-400 text-xs font-semibold">
                    ✓ Set
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Latitude</label>
                  <div className="bg-slate-900/70 border border-slate-600 rounded-lg px-3 py-2">
                    <p className="text-white text-sm font-mono">{payload.source.lat.toFixed(4)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Longitude</label>
                  <div className="bg-slate-900/70 border border-slate-600 rounded-lg px-3 py-2">
                    <p className="text-white text-sm font-mono">{payload.source.lng.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Destination Location - Display only */}
          <div className="mb-6">
            <div className={`bg-slate-800/60 border rounded-xl p-4 transition-all ${
              nextPointToSet === 'destination' 
                ? 'border-rose-500 shadow-lg shadow-rose-500/20' 
                : nextPointToSet === 'done'
                ? 'border-rose-500/50'
                : 'border-slate-700/30'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-rose-500" />
                <p className="text-slate-400 text-xs uppercase tracking-wide">DESTINATION LOCATION</p>
                {nextPointToSet === 'destination' && (
                  <span className="ml-auto text-rose-400 text-xs font-semibold animate-pulse">
                    👆 Waiting for map click...
                  </span>
                )}
                {nextPointToSet === 'done' && (
                  <span className="ml-auto text-rose-400 text-xs font-semibold">
                    ✓ Set
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Latitude</label>
                  <div className="bg-slate-900/70 border border-slate-600 rounded-lg px-3 py-2">
                    <p className="text-white text-sm font-mono">{payload.destination.lat.toFixed(4)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Longitude</label>
                  <div className="bg-slate-900/70 border border-slate-600 rounded-lg px-3 py-2">
                    <p className="text-white text-sm font-mono">{payload.destination.lng.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time & Congestion Controls */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Time Period */}
            <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-500" />
                <p className="text-slate-400 text-xs uppercase tracking-wide">TIME PERIOD</p>
              </div>
              <input
                type="range"
                min="0"
                max="23"
                value={payload.hour}
                onChange={(e) => setPayload({ ...payload, hour: Number(e.target.value) })}
                className="w-full mb-2 accent-rose-500"
              />
              <p className={`text-xl font-semibold ${isPeak ? 'text-rose-400' : 'text-emerald-400'}`}>
                {payload.hour}:00 {isPeak ? '(Peak)' : '(Off-Peak)'}
              </p>
            </div>

            {/* Congestion */}
            <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <p className="text-slate-400 text-xs uppercase tracking-wide">CONGESTION</p>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={payload.predicted_congestion}
                onChange={(e) => setPayload({ ...payload, predicted_congestion: Number(e.target.value) })}
                className="w-full mb-2 accent-rose-500"
              />
              <div className="flex items-center gap-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    payload.predicted_congestion > 70 ? 'bg-red-500' : 
                    payload.predicted_congestion > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                  } animate-pulse`}
                ></div>
                <p className={`text-xl font-semibold ${
                  payload.predicted_congestion > 70 ? 'text-red-400' : 
                  payload.predicted_congestion > 40 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {congestionLevel} ({payload.predicted_congestion}%)
                </p>
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={runSmartMode}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 disabled:from-slate-700 disabled:to-slate-800 text-slate-900 disabled:text-slate-500 font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 mb-6 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-lg">Analyzing optimal route...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span className="text-lg">ANALYZE ROUTE</span>
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 animate-in fade-in slide-in-from-top duration-300">
              <p className="text-red-300 text-sm font-medium flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Recommended Mode Card */}
              <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      RECOMMENDED MODE
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{getModeIcon(result.recommended_mode)}</span>
                      <p className="text-4xl font-bold text-white capitalize">
                        {result.recommended_mode}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Confidence Meter */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Confidence Level</span>
                    <span className={`text-lg font-bold ${getConfidenceColor(result.confidence)}`}>
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative">
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          result.confidence > 0.8 ? 'bg-emerald-500' :
                          result.confidence > 0.6 ? 'bg-amber-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-slate-600 text-xs">0%</span>
                      <span className="text-slate-600 text-xs">100%</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs mt-2 text-center">
                    {getConfidenceLabel(result.confidence)}
                  </p>
                </div>
              </div>

              {/* Mode Comparison Table */}
              {result.comparison && (
                <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                      MODE COMPARISON
                    </p>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(result.comparison).map(([mode, data], i) => (
                      <div 
                        key={mode}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all animate-in fade-in slide-in-from-left duration-500 ${
                          result.recommended_mode.toLowerCase() === mode 
                            ? 'bg-amber-500/10 border-amber-400/50' 
                            : 'bg-slate-900/40 border-slate-700/30'
                        }`}
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            result.recommended_mode.toLowerCase() === mode
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {getModeIconComponent(mode)}
                          </div>
                          <span className="text-white font-semibold capitalize">{mode}</span>
                          {result.recommended_mode.toLowerCase() === mode && (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">{data.time} min</p>
                          <p className="text-slate-400 text-sm">₹{data.cost}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Reasoning */}
              {result.reasoning && result.reasoning.length > 0 && (
                <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-amber-500" />
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                      AI ANALYSIS INSIGHTS
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {result.reasoning.map((r, i) => (
                      <li 
                        key={i} 
                        className="flex items-start gap-3 text-slate-200 bg-slate-900/40 rounded-lg p-3 border border-slate-700/30 animate-in fade-in slide-in-from-left duration-500"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed text-sm">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Footer */}
              <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Analysis complete</span>
                </div>
                <button className="text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors">
                  Start Navigation →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Map Below */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-white font-bold text-xl mb-2">📍 Interactive Route Map</h3>
          <p className="text-slate-400 text-sm">
            {nextPointToSet === 'source' && 'Click anywhere on the map to set your source location'}
            {nextPointToSet === 'destination' && 'Click anywhere on the map to set your destination location'}
            {nextPointToSet === 'done' && 'Route is set! Adjust parameters and click Analyze Route'}
          </p>
        </div>

        {nextPointToSet !== 'done' && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
            <p className="text-amber-300 text-sm font-medium flex items-center gap-2">
              <span>🖱️</span>
              {nextPointToSet === 'source' 
                ? 'Click on the map to set SOURCE (green marker)' 
                : 'Click on the map to set DESTINATION (red marker)'}
            </p>
          </div>
        )}

        <div className="rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl">
          <MapContainer
            center={[12.9716, 77.5946]}
            zoom={12}
            style={{ height: "500px" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            
            <MapClickHandler 
              onMapClick={handleMapClick}
              nextPointToSet={nextPointToSet}
            />

            {/* Source Marker */}
            <Marker 
              position={[payload.source.lat, payload.source.lng]}
              icon={sourceIcon}
            >
              <Popup>
                <div>
                  <p className="font-bold text-emerald-600">🟢 Source</p>
                  <p className="text-xs">{payload.source.lat.toFixed(4)}, {payload.source.lng.toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>

            {/* Destination Marker - only show after source is set */}
            {(nextPointToSet === 'destination' || nextPointToSet === 'done') && (
              <Marker 
                position={[payload.destination.lat, payload.destination.lng]}
                icon={destinationIcon}
              >
                <Popup>
                  <div>
                    <p className="font-bold text-red-600">🔴 Destination</p>
                    <p className="text-xs">{payload.destination.lat.toFixed(4)}, {payload.destination.lng.toFixed(4)}</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}