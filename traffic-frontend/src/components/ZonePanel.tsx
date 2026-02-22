import { useEffect, useState } from "react";
import { getZones } from "../api/trafficApi";

interface Zone {
  Zone: number;
  Avg_Congestion?: number; // optional
}

export default function ZonePanel() {
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    getZones().then(setZones);
  }, []);

  return (
    <div className="bg-panel rounded-2xl p-5 shadow-soft border border-white/5">
      <h2 className="text-lg font-semibold text-white mb-4">
        Zone Clustering (K-Means)
      </h2>

      <div className="space-y-3">
        {zones.map((z, i) => {
          const value =
            typeof z.Avg_Congestion === "number"
              ? z.Avg_Congestion.toFixed(1)
              : "N/A";

          return (
            <div
              key={i}
              className="flex justify-between items-center bg-panelSoft p-3 rounded-lg"
            >
              <span className="text-gray-300">Zone {z.Zone}</span>
              <span className="text-neon font-semibold">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
