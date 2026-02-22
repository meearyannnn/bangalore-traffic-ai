import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapPin, Route, Leaf, Clock, X } from "lucide-react";

interface MapClickHandlerProps {
  onMapClick: (coords: [number, number]) => void;
}

const MapClickHandler = ({ onMapClick }: MapClickHandlerProps) => {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
};

interface RouteData {
  fastest?: Array<[number, number]>;
  least_congested?: Array<[number, number]>;
  eco?: Array<[number, number]>;
}

const RouteMap = () => {
  const [source, setSource] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [routes, setRoutes] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMapClick = (coords: [number, number]) => {
    if (!source) {
      setSource(coords);
    } else if (!destination) {
      setDestination(coords);
    }
  };

  const fetchRoutes = async () => {
    if (!source || !destination) return;
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/predict-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: source,
          destination: destination
        })
      });
      const data = await res.json();
      setRoutes(data);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetMap = () => {
    setSource(null);
    setDestination(null);
    setRoutes(null);
  };

  return (
    <div className="w-full space-y-4">
      {/* Info and Controls */}
      <div className="space-y-3">
        {/* Location Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-slate-400 text-xs">Source</p>
              {source ? (
                <p className="text-slate-100 font-medium">
                  {source[0].toFixed(4)}, {source[1].toFixed(4)}
                </p>
              ) : (
                <p className="text-slate-500 italic">Click map to select</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-slate-400 text-xs">Destination</p>
              {destination ? (
                <p className="text-slate-100 font-medium">
                  {destination[0].toFixed(4)}, {destination[1].toFixed(4)}
                </p>
              ) : (
                <p className="text-slate-500 italic">Click map to select</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={fetchRoutes}
            disabled={!source || !destination || loading}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Route className="w-4 h-4" />
            {loading ? "Predicting..." : "Predict Routes"}
          </button>

          {(source || destination) && (
            <button
              onClick={resetMap}
              className="px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-100 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-slate-600/50 shadow-lg">
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={12}
          style={{ height: "400px", width: "100%" }}
          className="rounded-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {source && <Marker position={source} />}
          {destination && <Marker position={destination} />}
          {routes?.fastest && (
            <Polyline positions={routes.fastest} color="#3b82f6" weight={4} opacity={0.8} />
          )}
          {routes?.least_congested && (
            <Polyline positions={routes.least_congested} color="#ef4444" weight={4} opacity={0.8} />
          )}
          {routes?.eco && (
            <Polyline positions={routes.eco} color="#10b981" weight={4} opacity={0.8} />
          )}
        </MapContainer>
      </div>

      {/* Route Results */}
      {routes && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {routes.fastest && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-blue-100">Fastest Route</h3>
              </div>
              <p className="text-xs text-blue-300/80">Optimized for time</p>
            </div>
          )}

          {routes.least_congested && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Route className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-semibold text-red-100">Least Congested</h3>
              </div>
              <p className="text-xs text-red-300/80">Avoid traffic hotspots</p>
            </div>
          )}

          {routes.eco && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-semibold text-green-100">Eco Route</h3>
              </div>
              <p className="text-xs text-green-300/80">Balanced efficiency</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!routes && source && destination && !loading && (
        <div className="p-4 bg-slate-700/20 border border-slate-600/30 rounded-lg text-center">
          <p className="text-sm text-slate-400">Click "Predict Routes" to analyze traffic patterns</p>
        </div>
      )}
    </div>
  );
};

export default RouteMap;