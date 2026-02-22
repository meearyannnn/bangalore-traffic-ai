import { useState } from "react";
import axios from "axios";
import { MapPin, Clock, DollarSign, ArrowRight, Loader, Train, Navigation } from "lucide-react";

/* ---------------- TYPES ---------------- */

type MetroRouteResult = {
  lines: string[];
  stations: string[];
  interchange: string | null;
  estimated_time_min: number;
  fare: number;
};

/* ---------------- STATIONS (FULL LIST) ---------------- */

const METRO_STATIONS: string[] = [
  // Purple Line
  "Whitefield (Kadugodi)",
  "Hopefarm Channasandra",
  "Kadugodi Tree Park",
  "KR Puram",
  "Singayyanapalya",
  "Benniganahalli",
  "Baiyappanahalli",
  "Swami Vivekananda Road",
  "Indiranagar",
  "Halasuru",
  "Trinity",
  "MG Road",
  "Cubbon Park",
  "Vidhana Soudha",
  "Sir M Visvesvaraya",
  "Majestic",
  "City Railway Station",
  "Magadi Road",
  "Hosahalli",
  "Vijayanagar",
  "Attiguppe",
  "Deepanjali Nagar",
  "Mysore Road",
  "Nayandahalli",
  "Rajarajeshwari Nagar",
  "Jnanabharathi",
  "Pattanagere",
  "Kengeri Bus Terminal",
  "Kengeri",
  "Challaghatta",

  // Green Line
  "Nagasandra",
  "Dasarahalli",
  "Jalahalli",
  "Peenya Industry",
  "Peenya",
  "Goraguntepalya",
  "Yeshwanthpur",
  "Sandal Soap Factory",
  "Mahalakshmi",
  "Rajajinagar",
  "Kuvempu Road",
  "Srirampura",
  "Mantri Square Sampige Road",
  "Chickpete",
  "KR Market",
  "National College",
  "Lalbagh",
  "South End Circle",
  "Jayanagar",
  "Rashtreeya Vidyalaya Road",
  "Banashankari",
  "Yelachenahalli",
  "Jayaprakash Nagar",
  "Konanakunte Cross",
  "Vajarahalli",
  "Talaghattapura",
  "Silk Institute",
];

/* ---------------- COMPONENT ---------------- */

export default function MetroPlanner() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [result, setResult] = useState<MetroRouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findRoute = async () => {
    if (!from || !to) {
      setError("Please select both stations");
      return;
    }

    if (from === to) {
      setError("From and To stations cannot be same");
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post<MetroRouteResult>(
        "http://localhost:8000/metro-route",
        {
          source: from,
          destination: to,
        }
      );
      setResult(res.data);
    } catch {
      setError("Route not found. Please try another combination.");
    } finally {
      setLoading(false);
    }
  };

  const getLineColor = (line: string) => {
    if (line.toLowerCase().includes("purple")) return "bg-purple-500/20 border-purple-400/40 text-purple-300";
    if (line.toLowerCase().includes("green")) return "bg-emerald-500/20 border-emerald-400/40 text-emerald-300";
    return "bg-amber-500/20 border-amber-400/40 text-amber-300";
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="mb-6 border-l-2 border-amber-500 pl-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
              <Train className="w-3.5 h-3.5" />
              TRANSIT HUB
            </p>
            <h2 className="text-white font-bold text-2xl mb-1">Metro Planner</h2>
            <p className="text-slate-400 text-sm">Point-to-point route analysis</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl border border-amber-400/30">
            <Navigation className="w-6 h-6 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Station Selection */}
      <div className="space-y-4 mb-6">
        {/* From Station */}
        <div className="relative">
          <label className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide mb-2">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            From Station
          </label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer font-medium"
          >
            <option value="" className="bg-slate-800">Select starting station</option>
            {METRO_STATIONS.map((s) => (
              <option key={s} value={s} className="bg-slate-800">
                {s}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-9 pointer-events-none text-amber-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center -my-2">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2">
            <ArrowRight className="w-4 h-4 text-amber-500 rotate-90" />
          </div>
        </div>

        {/* To Station */}
        <div className="relative">
          <label className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide mb-2">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            To Station
          </label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer font-medium"
          >
            <option value="" className="bg-slate-800">Select destination station</option>
            {METRO_STATIONS.map((s) => (
              <option key={s} value={s} className="bg-slate-800">
                {s}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-9 pointer-events-none text-amber-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Find Route Button */}
      <button
        onClick={findRoute}
        disabled={loading}
        className="w-full px-4 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 disabled:from-slate-700 disabled:to-slate-800 text-slate-900 disabled:text-slate-500 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:shadow-none"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Finding Optimal Route...</span>
          </>
        ) : (
          <>
            <Navigation className="w-5 h-5" />
            <span>FIND ROUTE</span>
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide mb-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Duration
              </div>
              <p className="text-2xl font-bold text-white">
                {result.estimated_time_min}
                <span className="text-lg text-slate-400 font-normal ml-1">min</span>
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide mb-2">
                <DollarSign className="w-4 h-4 text-amber-500" />
                Fare
              </div>
              <p className="text-2xl font-bold text-emerald-400">
                ₹{result.fare}
              </p>
            </div>
          </div>

          {/* Lines */}
          <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Train className="w-3.5 h-3.5 text-amber-500" />
              Metro Lines
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {result.lines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`px-4 py-2 border rounded-lg text-sm font-semibold ${getLineColor(line)}`}>
                    {line}
                  </span>
                  {idx < result.lines.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interchange */}
          {result.interchange && (
            <div className="bg-amber-500/10 rounded-xl border border-amber-400/30 p-4 animate-in fade-in duration-300">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                <span>🔄</span>
                Interchange Required
              </p>
              <p className="text-amber-300 font-semibold text-lg">{result.interchange}</p>
            </div>
          )}

          {/* Stations List */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-amber-500" />
                Route Stations
              </p>
              <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                {result.stations.length} stops
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
              {result.stations.map((station, idx) => (
                <div
                  key={station}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
                    idx === 0 
                      ? 'bg-emerald-500/10 border-emerald-400/30' 
                      : idx === result.stations.length - 1 
                      ? 'bg-red-500/10 border-red-400/30'
                      : 'bg-slate-700/20 border-slate-600/20 hover:border-slate-600/40'
                  }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full border flex-shrink-0 ${
                    idx === 0 
                      ? 'bg-emerald-500/20 border-emerald-400/40' 
                      : idx === result.stations.length - 1 
                      ? 'bg-red-500/20 border-red-400/40'
                      : 'bg-amber-500/20 border-amber-400/40'
                  }`}>
                    <span className={`text-xs font-bold ${
                      idx === 0 
                        ? 'text-emerald-400' 
                        : idx === result.stations.length - 1 
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}>
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${
                      idx === 0 || idx === result.stations.length - 1 
                        ? 'text-white' 
                        : 'text-slate-300'
                    }`}>
                      {station}
                    </span>
                    {idx === 0 && (
                      <span className="block text-xs text-emerald-400 mt-0.5">Starting Point</span>
                    )}
                    {idx === result.stations.length - 1 && (
                      <span className="block text-xs text-red-400 mt-0.5">Destination</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-slate-400 text-sm">Route calculated</span>
            </div>
            <button className="text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors flex items-center gap-1">
              Save Route
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}