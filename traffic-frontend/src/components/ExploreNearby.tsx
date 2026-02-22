import { useState } from "react";
import { MapPin, Search, Star, Navigation as NavigationIcon } from "lucide-react";

interface Place {
  name: string;
  rating?: number;
  distance?: number;
  address?: string;
}

interface ExploreNearbyProps {
  defaultLat?: number;
  defaultLng?: number;
}

export default function ExploreNearby({
  defaultLat = 12.9716,
  defaultLng = 77.5946,
}: ExploreNearbyProps) {
  const [lat, setLat]             = useState(defaultLat);
  const [lng, setLng]             = useState(defaultLng);
  const [placeName, setPlaceName] = useState("");
  const [category, setCategory]   = useState("restaurant");
  const [places, setPlaces]       = useState<Place[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const categories = [
    { value: "restaurant", label: "🍽️ Restaurants", icon: "🍽️" },
    { value: "hospital",   label: "🏥 Hospitals",    icon: "🏥" },
    { value: "parking",    label: "🅿️ Parking",      icon: "🅿️" },
    { value: "fuel",       label: "⛽ Fuel Stations", icon: "⛽" },
    { value: "atm",        label: "🏧 ATM",           icon: "🏧" },
    { value: "cafe",       label: "☕ Cafes",          icon: "☕" },
  ];

  const selectedCategory = categories.find((c) => c.value === category);

  const pluralLabel: Record<string, string> = {
    restaurant: "restaurants",
    hospital:   "hospitals",
    parking:    "parking spots",
    fuel:       "fuel stations",
    atm:        "ATMs",
    cafe:       "cafes",
  };

  // Handles backends that return [] directly, { results: [] }, or { places: [] }
  const normalizePlaces = (data: unknown): Place[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      if (Array.isArray(d.results)) return d.results as Place[];
      if (Array.isArray(d.places))  return d.places  as Place[];
    }
    return [];
  };

  // ── Search by manual lat/lng ────────────────────────────────────────────────
  const fetchNearby = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/explore-nearby?lat=${lat}&lng=${lng}&category=${category}`
      );

      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Explore response:", data);

      setPlaces(normalizePlaces(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch places");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Search by place name (geocode → nearby) ─────────────────────────────────
  const searchByPlaceName = async () => {
    if (!placeName.trim()) {
      setError("Please enter a place name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Convert name → coordinates
      const geoRes = await fetch(
        `http://127.0.0.1:8000/geocode?query=${encodeURIComponent(placeName.trim())}`
      );

      if (!geoRes.ok) {
        throw new Error(`Geocoding failed: ${geoRes.status} ${geoRes.statusText}`);
      }

      const geoData = await geoRes.json();

      if (!geoData.lat) {
        setError("Place not found. Try a different name.");
        return;
      }

      // Sync the lat/lng inputs to reflect the resolved location
      setLat(geoData.lat);
      setLng(geoData.lng);

      // Step 2: Fetch nearby places using resolved coordinates
      const placesRes = await fetch(
        `http://127.0.0.1:8000/explore-nearby?lat=${geoData.lat}&lng=${geoData.lng}&category=${category}`
      );

      if (!placesRes.ok) {
        throw new Error(`Places fetch failed: ${placesRes.status} ${placesRes.statusText}`);
      }

      const placesData = await placesRes.json();
      console.log("Nearby response:", placesData);

      setPlaces(normalizePlaces(placesData));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ── Category Pills ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              category === cat.value
                ? "bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500/50"
                : "bg-slate-800/60 text-slate-400 border-2 border-slate-700/30 hover:border-slate-600"
            }`}
          >
            <span className="mr-1.5">{cat.icon}</span>
            {cat.label.replace(/^..\s/, "")}
          </button>
        ))}
      </div>

      {/* ── Place Name Search ── */}
      <div className="mb-4">
        <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
          Search by Place Name
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter place name (e.g., SRM University)"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchByPlaceName()}
            className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600"
          />
          <button
            onClick={searchByPlaceName}
            disabled={loading}
            className="px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-50 text-cyan-300 border border-cyan-500/40 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5" />
            Find
          </button>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-slate-700/40" />
        <span className="text-slate-600 text-xs uppercase tracking-widest">or use coordinates</span>
        <div className="flex-1 h-px bg-slate-700/40" />
      </div>

      {/* ── Lat / Lng Inputs ── */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
            Latitude
          </label>
          <input
            type="number"
            step="0.0001"
            value={lat}
            onChange={(e) => setLat(Number(e.target.value))}
            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="12.9716"
          />
        </div>
        <div>
          <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
            Longitude
          </label>
          <input
            type="number"
            step="0.0001"
            value={lng}
            onChange={(e) => setLng(Number(e.target.value))}
            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="77.5946"
          />
        </div>
      </div>

      {/* ── Search by Coordinates Button ── */}
      <button
        onClick={fetchNearby}
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-700 disabled:to-slate-800 text-white disabled:text-slate-500 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 mb-6"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Searching...</span>
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            <span>Search {selectedCategory?.label.replace(/^..\s/, "")}</span>
          </>
        )}
      </button>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
          <p className="text-red-300 text-sm font-medium">⚠️ {error}</p>
        </div>
      )}

      {/* ── Results Count ── */}
      {!loading && places.length > 0 && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/30">
          <p className="text-slate-400 text-sm">
            Found{" "}
            <span className="text-cyan-400 font-semibold">{places.length}</span>{" "}
            {pluralLabel[category] ?? category} nearby
          </p>
        </div>
      )}

      {/* ── Results List ── */}
      <div className="space-y-3">
        {places.map((place, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/30 rounded-xl p-4 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-white font-semibold text-base flex-1">{place.name}</h3>
              {place.distance !== undefined && (
                <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/30">
                  <NavigationIcon className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-300 text-xs font-semibold">
                    {place.distance.toFixed(1)} km
                  </span>
                </div>
              )}
            </div>

            {place.address && (
              <p className="text-slate-400 text-sm mb-3 flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                {place.address}
              </p>
            )}

            <div className="flex items-center gap-4">
              {place.rating !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-amber-300 font-semibold text-sm">
                    {place.rating.toFixed(1)}
                  </span>
                </div>
              )}
              <button className="ml-auto text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-1">
                <NavigationIcon className="w-3 h-3" />
                Get Directions
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Empty State ── */}
      {!loading && places.length === 0 && !error && (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <div className="mb-3 text-4xl opacity-40">🔍</div>
          <p className="text-slate-400 font-medium mb-1">No places found</p>
          <p className="text-slate-500 text-sm">
            Try searching by name or adjust the coordinates
          </p>
        </div>
      )}
    </div>
  );
}