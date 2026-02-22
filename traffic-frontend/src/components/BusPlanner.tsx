import { useState } from "react";
import { Bus, MapPin, Search, Loader, ArrowRight, Navigation, Route } from "lucide-react";

type Hop = {
  from: string;
  to: string;
  bus_numbers: string[];
};

type BusRouteResult = {
  route_plans: Hop[][];
};

export default function BusPlanner() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [result, setResult] = useState<BusRouteResult | null>(null);
  const [loading, setLoading] = useState(false);

  const findBus = async () => {
    if (!from || !to) return;

    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch("http://localhost:8000/bmtc-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: from, destination: to }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error fetching bus route:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") findBus();
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="mb-6 border-l-2 border-amber-500 pl-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
              <Bus className="w-3.5 h-3.5" />
              PUBLIC TRANSIT
            </p>
            <h4 className="text-white font-bold text-2xl mb-1">BMTC Bus Planner</h4>
            <p className="text-slate-400 text-sm">Find optimal bus routes across the city</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl border border-amber-400/30">
            <Route className="w-6 h-6 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-4 mb-6">
        {/* FROM STATION */}
        <div>
          <label className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide mb-2 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            From Location
          </label>
          <div className="relative">
            <input
              placeholder="Enter starting point (area or stop)"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center -my-2">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2">
            <ArrowRight className="w-4 h-4 text-amber-500 rotate-90" />
          </div>
        </div>

        {/* TO STATION */}
        <div>
          <label className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide mb-2 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            To Location
          </label>
          <div className="relative">
            <input
              placeholder="Enter destination (area or stop)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Find Bus Button */}
      <button
        onClick={findBus}
        disabled={loading || !from || !to}
        className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-slate-900 disabled:text-slate-500 font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:shadow-none"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Searching Routes...</span>
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            <span>FIND BUS ROUTES</span>
          </>
        )}
      </button>

      {/* Results */}
      {result && !loading && (
        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
          {result.route_plans.length === 0 ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">❌</span>
              </div>
              <p className="text-red-300 font-semibold text-lg mb-1">No Routes Found</p>
              <p className="text-red-400/70 text-sm">Try different locations or check spelling</p>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-amber-500" />
                    <span className="text-slate-400 text-sm font-semibold uppercase tracking-wide">
                      Available Routes
                    </span>
                  </div>
                  <span className="bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-lg">
                    {result.route_plans.length} {result.route_plans.length === 1 ? 'Option' : 'Options'}
                  </span>
                </div>
              </div>

              {/* Route Plans */}
              {result.route_plans.map((plan, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-5 hover:border-slate-600/50 transition-all duration-200"
                >
                  {/* Route Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/50">
                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-500/20 border border-amber-400/40 rounded-lg flex items-center justify-center">
                        <span className="text-amber-400 font-bold text-sm">#{idx + 1}</span>
                      </div>
                      Route Plan
                    </h4>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Bus className="w-4 h-4 text-amber-500" />
                      <span>{plan.length} {plan.length === 1 ? 'Leg' : 'Legs'}</span>
                    </div>
                  </div>

                  {/* Route Segments */}
                  <div className="space-y-3">
                    {plan.map((hop, hopIdx) => (
                      <div 
                        key={hopIdx} 
                        className="bg-slate-900/40 border border-slate-700/30 rounded-lg p-4 relative"
                      >
                        {/* Segment Number */}
                        <div className="absolute -left-2 -top-2 w-6 h-6 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center border-2 border-slate-800">
                          <span className="text-slate-900 font-bold text-xs">{hopIdx + 1}</span>
                        </div>

                        {/* From/To */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2 text-sm mb-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="text-slate-300 font-medium">{hop.from}</span>
                          </div>
                          <div className="flex items-center gap-2 ml-5">
                            <div className="w-px h-4 bg-slate-600"></div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                            <span className="text-slate-300 font-medium">{hop.to}</span>
                          </div>
                        </div>

                        {/* Bus Numbers */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/40">
                          <div className="flex items-center gap-2 mb-2">
                            <Bus className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-slate-400 text-xs uppercase tracking-wide font-semibold">
                              Available Buses
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {hop.bus_numbers.map((bus, busIdx) => (
                              <span
                                key={busIdx}
                                className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-400/40 text-amber-300 font-bold text-sm px-3 py-1.5 rounded-lg"
                              >
                                {bus}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Footer */}
              <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Routes calculated</span>
                </div>
                <button className="text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors flex items-center gap-1">
                  View Map
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}