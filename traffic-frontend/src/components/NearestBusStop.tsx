import { useEffect, useState } from "react";
import { useUserLocation } from "../hooks/useUserLocation";
import BusAvailability from "./BusAvailability";
import { MapPin, Navigation, Loader } from "lucide-react";

type NearestStop =
  | {
      stop_id: string;
      stop_name: string;
      distance_km: number;
    }
  | {
      error: string;
    };

export default function NearestBusStop() {
  const { location, error } = useUserLocation();
  const [stop, setStop] = useState<NearestStop | null>(null);

  useEffect(() => {
    if (!location) return;

    let isMounted = true;

    const fetchNearestStop = async () => {
      try {
        const res = await fetch("http://localhost:8000/nearest-bus-stop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(location),
        });
        const data = await res.json();
        if (isMounted) setStop(data);
      } catch (error) {
        console.error(error);
        if (isMounted) setStop({ error: "Failed to fetch nearest stop" });
      }
    };

    fetchNearestStop();

    return () => {
      isMounted = false;
    };
  }, [location]);

  if (error)
    return (
      <div className="mt-4 p-4 bg-gradient-to-r from-red-900 to-red-950 border border-red-700 rounded-lg text-red-200 flex items-center gap-3">
        <span className="text-xl">❌</span>
        <div>
          <p className="font-semibold">Location Error</p>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      </div>
    );

  if (!location)
    return (
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-900 to-blue-950 border border-blue-700 rounded-lg">
        <div className="flex items-center gap-3 text-blue-200">
          <Loader className="w-5 h-5 animate-spin text-blue-400" />
          <p className="font-semibold">📍 Getting your location…</p>
        </div>
      </div>
    );

  if (!stop)
    return (
      <div className="mt-4 p-4 bg-gradient-to-r from-amber-900 to-amber-950 border border-amber-700 rounded-lg">
        <div className="flex items-center gap-3 text-amber-200">
          <Loader className="w-5 h-5 animate-spin text-amber-400" />
          <p className="font-semibold">🚍 Searching nearby bus stops…</p>
        </div>
      </div>
    );

  if ("error" in stop)
    return (
      <div className="mt-4 p-4 bg-gradient-to-r from-red-900 to-red-950 border border-red-700 rounded-lg text-red-200 flex items-center gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="font-semibold">Bus Stop Error</p>
          <p className="text-sm text-red-300">{stop.error}</p>
        </div>
      </div>
    );

  return (
    <div className="mt-4 p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-lg shadow-2xl border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <Navigation className="w-6 h-6 text-blue-400" />
        <h4 className="text-xl font-bold">Nearest BMTC Bus Stop</h4>
      </div>

      <div className="space-y-3 bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <p className="text-slate-400 text-sm font-semibold">Stop Name</p>
            <p className="text-white font-semibold text-lg mt-1">
              {stop.stop_name}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-600 pt-3 flex items-center gap-3">
          <span className="text-xl">🚶</span>
          <div>
            <p className="text-slate-400 text-sm font-semibold">Distance</p>
            <p className="text-white font-semibold text-lg mt-1">
              {stop.distance_km.toFixed(2)} km away
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <BusAvailability distanceKm={stop.distance_km} />
      </div>
    </div>
  );
}