import { useEffect, useState } from "react";
import { Navigation2, Zap, AlertCircle, Clock, TrendingUp, BarChart3, AlertTriangle } from "lucide-react";
import { useUserLocation } from "../hooks/useUserLocation";
import { fetchGpsTraffic } from "../api/trafficApi";

type TrafficData = {
  location: { road?: string; city?: string };
  gps_score: number;
  marker_color: string;
};

type PredictionData = {
  nextHour: number;
  nextTwoHours: number;
  trend: "increasing" | "decreasing" | "stable";
  recommendation: string;
  peakTime: string;
  confidence: number;
};

export default function LocationTraffic() {
  const { location, error } = useUserLocation();
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);

  useEffect(() => {
    if (!location) return;

    const fetchTraffic = async () => {
      setLoading(true);
      try {
        const data = await fetchGpsTraffic(location.lat, location.lng);
        setTraffic(data);
        setPrediction(null);
      } catch (err) {
        console.error("Traffic fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTraffic();
  }, [location]);

  const handlePrediction = async () => {
    if (!traffic) return;
    
    setPredicting(true);
    try {
      // Simulate API call for prediction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockPrediction: PredictionData = {
        nextHour: traffic.gps_score + Math.floor(Math.random() * 20 - 10),
        nextTwoHours: traffic.gps_score + Math.floor(Math.random() * 30 - 15),
        trend: traffic.gps_score > 50 ? "decreasing" : "increasing",
        recommendation: traffic.gps_score > 60 ? "Avoid peak hours. Consider alternate routes." : "Good time to travel. Light to moderate traffic.",
        peakTime: traffic.gps_score > 50 ? "5:30 PM - 7:00 PM" : "Already in optimal window",
        confidence: 85 + Math.floor(Math.random() * 10)
      };
      
      setPrediction(mockPrediction);
    } catch (err) {
      console.error("Prediction failed", err);
    } finally {
      setPredicting(false);
    }
  };

  const getTrafficStatus = (score: number) => {
    if (score >= 70) return { label: "Heavy", color: "from-red-600 to-red-700", badge: "🔴", bgLight: "bg-red-500/10", textColor: "text-red-400" };
    if (score >= 40) return { label: "Moderate", color: "from-orange-600 to-orange-700", badge: "🟠", bgLight: "bg-orange-500/10", textColor: "text-orange-400" };
    return { label: "Light", color: "from-green-600 to-green-700", badge: "🟢", bgLight: "bg-green-500/10", textColor: "text-green-400" };
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "increasing") return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (trend === "decreasing") return <TrendingUp className="w-4 h-4 text-green-400 rotate-180" />;
    return <BarChart3 className="w-4 h-4 text-blue-400" />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700/50 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="animate-spin">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <p className="text-slate-200 font-semibold text-lg">Analyzing traffic...</p>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-3 bg-slate-700/50 rounded-full animate-pulse" style={{ width: `${85 - i * 15}%` }} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-96 bg-gradient-to-br from-red-950 to-slate-900 rounded-3xl p-6 border border-red-900/50 backdrop-blur-xl">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <p className="text-red-300 font-bold text-lg">Location Error</p>
            <p className="text-red-300/70 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!traffic) {
    return (
      <div className="w-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700/50 backdrop-blur-xl">
        <div className="text-center text-slate-400">
          <Navigation2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">Waiting for location data...</p>
        </div>
      </div>
    );
  }

  const status = getTrafficStatus(traffic.gps_score);

  return (
    <div className="w-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-cyan-500/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/50 to-transparent p-6 border-b border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/30 to-cyan-500/10 rounded-xl backdrop-blur">
            <Navigation2 className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Live Traffic</h3>
            <p className="text-slate-400 text-xs mt-0.5">Real-time monitoring & AI predictions</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Location Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 transition-colors">
            <span className="text-2xl mt-1">🛣️</span>
            <div className="min-w-0">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Road</p>
              <p className="text-white font-bold text-sm truncate">{traffic.location.road || "Unknown"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 transition-colors">
            <span className="text-2xl mt-1">🏙️</span>
            <div className="min-w-0">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Location</p>
              <p className="text-white font-bold text-sm truncate">{traffic.location.city || "Unknown"}</p>
            </div>
          </div>
        </div>

        {/* Congestion Score */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-slate-300 text-sm font-semibold">Congestion Level</label>
            <span className={`text-2xl font-black ${status.textColor}`}>{traffic.gps_score}%</span>
          </div>
          <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/30">
            <div className={`h-full bg-gradient-to-r ${status.color} transition-all duration-700 shadow-lg shadow-current/50`} style={{ width: `${traffic.gps_score}%` }} />
          </div>
        </div>

        {/* Status Badge */}
        <div className={`bg-gradient-to-r ${status.color} rounded-2xl p-5 text-center text-white font-bold uppercase tracking-widest shadow-lg shadow-current/40 transition-transform hover:scale-105 cursor-pointer`}>
          {status.badge} {status.label} Traffic
        </div>

        {/* Prediction Button & Analysis */}
        <div className="space-y-4">
          <button
            onClick={handlePrediction}
            disabled={predicting}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30"
          >
            {predicting ? (
              <>
                <Zap className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                Get Traffic Prediction
              </>
            )}
          </button>

          {prediction && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm font-semibold">Next 1 Hour</span>
                  <span className="text-white font-bold text-lg">{prediction.nextHour}%</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${Math.min(prediction.nextHour, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm font-semibold">Next 2 Hours</span>
                  <span className="text-white font-bold text-lg">{prediction.nextTwoHours}%</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${Math.min(prediction.nextTwoHours, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {getTrendIcon(prediction.trend)}
                  <span className="text-slate-400 text-sm font-semibold capitalize">Trend: {prediction.trend}</span>
                </div>
                <p className="text-slate-300 text-xs">Traffic is expected to be <span className="font-bold text-white">{prediction.trend}</span></p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-cyan-300 text-sm font-semibold">Smart Recommendation</p>
                    <p className="text-cyan-200/80 text-xs mt-1">{prediction.recommendation}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                  <p className="text-slate-500 text-xs font-semibold mb-1">Peak Time</p>
                  <p className="text-white font-bold text-sm">{prediction.peakTime}</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                  <p className="text-slate-500 text-xs font-semibold mb-1">Confidence</p>
                  <p className="text-emerald-400 font-bold text-sm">{prediction.confidence}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700/30 px-6 py-4 bg-slate-900/50 flex items-center justify-between">
        <p className="text-slate-400 text-xs font-medium">Real-time monitoring</p>
        <Clock className="w-4 h-4 text-slate-500" />
      </div>
    </div>
  );
}