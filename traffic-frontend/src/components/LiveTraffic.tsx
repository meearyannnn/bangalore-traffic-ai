import { useEffect, useState } from "react";
import type { LiveTrafficResponse } from "../types/traffic";

const LiveTraffic = () => {
  const [data, setData] = useState<LiveTrafficResponse | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:8000/detect-live")
        .then(res => res.json())
        .then((result: LiveTrafficResponse) => setData(result))
        .catch(console.error);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const congestionLevel = data.final_congestion_score;
  const getTrafficStatus = () => {
    if (congestionLevel < 30) return { label: "LOW TRAFFIC", color: "bg-emerald-500", border: "border-emerald-500/30", text: "text-emerald-400" };
    if (congestionLevel < 60) return { label: "MODERATE TRAFFIC", color: "bg-amber-500", border: "border-amber-500/30", text: "text-amber-400" };
    return { label: "HIGH TRAFFIC", color: "bg-red-500", border: "border-red-500/30", text: "text-red-400" };
  };

  const status = getTrafficStatus();

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="mb-6 border-l-2 border-amber-500 pl-3">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">LIVE MONITORING</p>
        <h3 className="text-white font-semibold text-2xl">Live Traffic</h3>
        <p className="text-slate-400 text-sm">Real-time monitoring & AI predictions</p>
      </div>

      {/* Road and Location Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-amber-500">🗺️</span>
            <p className="text-slate-500 text-xs uppercase tracking-wide">Road</p>
          </div>
          <p className="text-white font-medium">Grand Sou...</p>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-amber-500">📍</span>
            <p className="text-slate-500 text-xs uppercase tracking-wide">Location</p>
          </div>
          <p className="text-white font-medium">Unknown</p>
        </div>
      </div>

      {/* Congestion Level */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-500">⏱️</span>
          <span className="text-slate-400 text-sm">Congestion Level</span>
          <span className={`ml-auto text-3xl font-bold ${status.text}`}>{congestionLevel}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${status.color} transition-all duration-500 ease-out`}
              style={{ width: `${congestionLevel}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-slate-600 text-xs">0</span>
            <span className="text-slate-600 text-xs">100</span>
          </div>
        </div>
      </div>

      {/* Vehicle Count */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-500">🚗</span>
          <span className="text-slate-400 text-sm">Traffic Volume</span>
          <span className="ml-auto text-2xl font-semibold text-amber-500">{data.vehicle_count}</span>
        </div>
        
        {/* Progress Bar for vehicle count (out of 100k max) */}
        <div className="relative">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-500 ease-out"
              style={{ width: `${Math.min((data.vehicle_count / 100000) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-slate-600 text-xs">0</span>
            <span className="text-slate-600 text-xs">100000</span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`bg-slate-800/60 ${status.border} border rounded-xl px-4 py-3 mb-6`}>
        <div className="flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status.color} animate-pulse`} />
          <span className={`font-semibold ${status.text}`}>{status.label}</span>
        </div>
      </div>

      {/* Get Prediction Button */}
      <button className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-slate-900 font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40">
        <span className="flex items-center justify-center gap-2">
          <span className="text-lg">⚡</span>
          <span>PREDICT CONGESTION</span>
        </span>
      </button>

      {/* Footer */}
      <div className="flex items-center justify-center mt-4 pt-4 border-t border-slate-700/50">
        <span className="text-slate-500 text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Real-time monitoring active
        </span>
      </div>
    </div>
  );
};

export default LiveTraffic;