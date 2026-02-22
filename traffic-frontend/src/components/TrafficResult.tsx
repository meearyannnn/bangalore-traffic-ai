import type { TrafficImageResponse } from "../types/traffic";
import { AlertCircle, TrendingUp, CheckCircle, AlertTriangle, Navigation } from "lucide-react";

interface Props {
  data: TrafficImageResponse | null;
  currentHour?: number;
}

export default function TrafficResult({ data, currentHour = 12 }: Props) {
  if (!data) return null;

  const getStatusIcon = (status: string) => {
    return status === "ANOMALY" ? (
      <AlertTriangle className="w-5 h-5 text-amber-400" />
    ) : (
      <CheckCircle className="w-5 h-5 text-emerald-400" />
    );
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case "green":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "orange":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "red":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    }
  };

  const getCongestionText = (score: number) => {
    if (score < 30) return "Low";
    if (score < 60) return "Moderate";
    return "High";
  };

  const getBestTravelSuggestion = (congestionScore: number, hour: number) => {
    if (congestionScore < 30) {
      return {
        suggestion: "Now is a great time to travel",
        detail: "Low traffic conditions detected",
        urgency: "green",
      };
    }

    if (congestionScore < 60) {
      const nextGoodHour = hour >= 22 ? 6 : 23;
      const timeLabel = nextGoodHour === 6 ? "Early Morning (6:00 AM)" : "Late Evening (11:00 PM)";
      return {
        suggestion: `Consider traveling after ${timeLabel}`,
        detail: "Traffic is expected to decrease significantly",
        urgency: "amber",
      };
    }

    return {
      suggestion: "Avoid traveling now if possible",
      detail: "Consider waiting until late night (11 PM - 6 AM) for better conditions",
      urgency: "red",
    };
  };

  const suggestion = getBestTravelSuggestion(data.final_congestion_score, currentHour);
  const colorClass = getColorClass(data.marker_color);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-100">Traffic Analysis Results</h3>
      </div>

      {/* Travel Suggestion Card */}
      <div
        className={`border rounded-lg p-4 transition-all ${
          suggestion.urgency === "green"
            ? "bg-emerald-500/10 border-emerald-500/30"
            : suggestion.urgency === "amber"
              ? "bg-amber-500/10 border-amber-500/30"
              : "bg-red-500/10 border-red-500/30"
        }`}
      >
        <div className="flex items-start gap-3">
          <Navigation
            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              suggestion.urgency === "green"
                ? "text-emerald-400"
                : suggestion.urgency === "amber"
                  ? "text-amber-400"
                  : "text-red-400"
            }`}
          />
          <div>
            <p className="font-semibold text-slate-100 mb-1">
              {suggestion.suggestion}
            </p>
            <p
              className={`text-sm ${
                suggestion.urgency === "green"
                  ? "text-emerald-300"
                  : suggestion.urgency === "amber"
                    ? "text-amber-300"
                    : "text-red-300"
              }`}
            >
              {suggestion.detail}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Vehicle Count */}
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
            Vehicle Count
          </p>
          <p className="text-2xl font-bold text-cyan-400">{data.vehicle_count}</p>
        </div>

        {/* Vehicle Score */}
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
            Vehicle Score
          </p>
          <p className="text-2xl font-bold text-blue-400">{data.vehicle_score}</p>
        </div>

        {/* Congestion Score */}
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
            Congestion Level
          </p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-orange-400">
              {data.final_congestion_score}
            </p>
            <p className="text-sm text-slate-400">/100</p>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {getCongestionText(data.final_congestion_score)}
          </p>
        </div>

        {/* Anomaly Status */}
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
            Status
          </p>
          <div className="flex items-center gap-2">
            {getStatusIcon(data.anomaly_status)}
            <p className="font-medium text-slate-100">{data.anomaly_status}</p>
          </div>
        </div>
      </div>

      {/* Color Indicator */}
      <div className={`border rounded-lg p-4 ${colorClass}`}>
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: data.marker_color }}
          ></div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Traffic Status
            </p>
            <p className="font-semibold capitalize">
              {data.marker_color === "green"
                ? "Light Traffic"
                : data.marker_color === "orange"
                  ? "Moderate Traffic"
                  : "Heavy Traffic"}
            </p>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-300">
          Analysis completed successfully. Use this data for route planning and traffic
          management decisions.
        </p>
      </div>
    </div>
  );
}