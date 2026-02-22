import { useState } from "react";
import { getRailwayTrains } from "../api/api";
import { ChevronRight, Clock, Train, AlertCircle, Loader2, MapPin, DollarSign } from "lucide-react";

type Train = {
  train_name?: string;
  from_station_name?: string;
  to_station_name?: string;
  departure_time?: string;
  arrival_time?: string;
  train_type?: string;
  duration?: string;
  seats_available?: number;
  price?: number;
};

export default function RailwayPlanner() {
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState<"departure" | "duration" | "price">("departure");
  const [filterByType, setFilterByType] = useState<string>("");

  const searchTrains = async () => {
    if (!fromStation.trim()) {
      setError("Please enter a departure station code");
      return;
    }
    if (!toStation.trim()) {
      setError("Please enter a destination station code");
      return;
    }
    if (fromStation === toStation) {
      setError("Departure and destination stations cannot be the same");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const data = await getRailwayTrains(toStation);
      if (!data.trains || data.trains.length === 0) {
        setError("No trains found for this route. Try different stations.");
        setTrains([]);
      } else {
        setTrains(data.trains);
      }
    } catch {
      setError("Failed to fetch railway data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchTrains();
    }
  };

  const getFilteredAndSortedTrains = () => {
    let result = trains;

    if (filterByType) {
      result = result.filter((train) =>
        train.train_type?.toLowerCase().includes(filterByType.toLowerCase())
      );
    }

    return result.sort((a, b) => {
      if (sortBy === "departure") {
        return (a.departure_time || "").localeCompare(b.departure_time || "");
      }
      if (sortBy === "duration" && a.duration && b.duration) {
        return a.duration.localeCompare(b.duration);
      }
      if (sortBy === "price" && a.price && b.price) {
        return a.price - b.price;
      }
      return 0;
    });
  };

  const sortedTrains = getFilteredAndSortedTrains();
  const trainTypes = [...new Set(trains.map((t) => t.train_type).filter(Boolean))];

  return (
    <div>
      {/* Search Card */}
      <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-6 mb-6 border border-slate-600/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* From Station */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              From Station
            </label>
            <input
              type="text"
              placeholder="e.g., SBC, YPR, BNL"
              value={fromStation}
              onChange={(e) => setFromStation(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
            />
          </div>

          {/* To Station */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              To Station
            </label>
            <input
              type="text"
              placeholder="e.g., NDLS, MAS, CSMT"
              value={toStation}
              onChange={(e) => setToStation(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={searchTrains}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Searching trains...</span>
            </>
          ) : (
            <>
              <Train className="w-5 h-5" />
              <span>Find Trains</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 backdrop-blur border border-red-400/50 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {searched && (
        <div>
          {trains.length > 0 && (
            <div>
              {/* Filter and Sort Controls */}
              <div className="bg-slate-700/50 rounded-lg border border-slate-600/50 p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "departure" | "duration" | "price")}
                      className="w-full px-4 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      <option value="departure" className="bg-slate-800">Departure Time</option>
                      <option value="duration" className="bg-slate-800">Duration</option>
                      <option value="price" className="bg-slate-800">Price</option>
                    </select>
                  </div>

                  {/* Filter by Type */}
                  {trainTypes.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        Train Type
                      </label>
                      <select
                        value={filterByType}
                        onChange={(e) => setFilterByType(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      >
                        <option value="" className="bg-slate-800">All Types</option>
                        {trainTypes.map((type) => (
                          <option key={type} value={type} className="bg-slate-800">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-300">
                  Showing <span className="font-semibold text-cyan-300">{sortedTrains.length}</span> of{" "}
                  <span className="font-semibold text-slate-200">{trains.length}</span> trains
                </p>
              </div>

              {/* Train Cards */}
              {sortedTrains.length > 0 ? (
                <div className="space-y-4">
                  {sortedTrains.map((train, index) => (
                    <div
                      key={index}
                      className="bg-slate-700/30 rounded-lg p-5 border border-slate-600/50 hover:border-cyan-400/50 hover:shadow-lg transition group"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                        {/* Train Name */}
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                            Train
                          </p>
                          <p className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition">
                            {train.train_name || "Train"}
                          </p>
                        </div>

                        {/* Route */}
                        <div className="sm:col-span-2 lg:col-span-1">
                          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                            Route
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-cyan-300">
                              {train.from_station_name || "—"}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-semibold text-cyan-300">
                              {train.to_station_name || "—"}
                            </span>
                          </div>
                        </div>

                        {/* Time */}
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                            Departure
                          </p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            <div className="text-sm">
                              <p className="font-bold text-slate-100">
                                {train.departure_time || "—"}
                              </p>
                              {train.arrival_time && (
                                <p className="text-xs text-slate-400">
                                  → {train.arrival_time}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Type & Details */}
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                            Details
                          </p>
                          <p className="text-sm font-bold text-cyan-300 mb-1">
                            {train.train_type || "Express"}
                          </p>
                          {train.duration && (
                            <p className="text-xs text-slate-400">Duration: {train.duration}</p>
                          )}
                          {train.seats_available !== undefined && (
                            <p className="text-xs text-slate-400">
                              {train.seats_available > 0
                                ? `${train.seats_available} available`
                                : "Fully booked"}
                            </p>
                          )}
                        </div>

                        {/* Price & CTA */}
                        <div className="flex flex-col items-end gap-3">
                          {train.price && (
                            <div className="text-right">
                              <p className="text-xs text-slate-400">from</p>
                              <p className="text-2xl font-bold text-cyan-300 flex items-center gap-1">
                                <DollarSign className="w-5 h-5" />
                                {train.price}
                              </p>
                            </div>
                          )}
                          <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition transform hover:scale-105 whitespace-nowrap shadow-lg">
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">
                    No trains match your filters. Try adjusting your search criteria.
                  </p>
                </div>
              )}
            </div>
          )}

          {trains.length === 0 && !loading && (
            <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">
                No trains found for this route. Try different station codes.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!searched && (
        <div className="text-center py-8">
          <p className="text-slate-400 text-lg">Enter your departure and destination stations to get started</p>
        </div>
      )}
    </div>
  );
}
