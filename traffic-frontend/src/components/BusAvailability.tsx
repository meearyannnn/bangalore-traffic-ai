import { MapPin, AlertCircle } from "lucide-react";

type Props = {
  distanceKm: number;
};

export default function BusAvailability({ distanceKm }: Props) {
  const available = distanceKm < 0.6;

  return (
    <div className="mt-2 animate-fadeIn">
      {available ? (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-900 to-emerald-950 border border-emerald-700 rounded-lg shadow-lg hover:shadow-emerald-900/20 transition">
          <div className="flex items-center gap-2 flex-1">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-emerald-300 font-semibold text-sm">
                🚍 BMTC Bus Available Nearby
              </p>
              <p className="text-emerald-200 text-xs mt-0.5">
                {distanceKm.toFixed(2)} km away
              </p>
            </div>
          </div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-900 to-red-950 border border-red-700 rounded-lg shadow-lg hover:shadow-red-900/20 transition">
          <div className="flex items-center gap-2 flex-1">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-300 font-semibold text-sm">
                🚍 No nearby bus stop
              </p>
              <p className="text-red-200 text-xs mt-0.5">
                {distanceKm.toFixed(2)} km away
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}