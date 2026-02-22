import { useState } from "react";
import { predictTraffic } from "../api/trafficApi";
import type { TrafficRequest } from "../types/traffic";
import ResultCard from "./ResultCard";
import { Zap, Clock, Calendar, Gauge, Wind, MapPin, AlertTriangle } from "lucide-react";
import axios from "axios";

type Location = {
  lat: string;
  lng: string;
};

type PredictFormProps = {
  location: Location;
  setLocation: React.Dispatch<React.SetStateAction<Location>>;
  setPrediction: React.Dispatch<React.SetStateAction<{
    lat: number;
    lng: number;
    level: number;
  } | null>>;
  setAnomaly?: React.Dispatch<React.SetStateAction<{
    lat: number;
    lng: number;
    severity: number;
  } | null>>;
};

const PredictForm: React.FC<PredictFormProps> = ({
  location,
  setLocation,
  setPrediction,
  setAnomaly,
}) => {
  const [form, setForm] = useState<TrafficRequest>({
    hour: 12,
    weekday: 3,
    Traffic_Volume: 50000,
    Average_Speed: 53,
  });

  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSliderChange = (name: keyof TrafficRequest, value: number) => {
    setForm({ ...form, [name]: value });
  };

  const handlePredict = async () => {
    if (!location.lat || !location.lng) {
      alert("Please select a location on the map");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        lat: Number(location.lat),
        lng: Number(location.lng),
      };
      const res = await predictTraffic(payload);
      setResult(res.predicted_congestion_level);
      setPrediction({
        lat: Number(location.lat),
        lng: Number(location.lng),
        level: res.predicted_congestion_level,
      });

      const anomalyRes = await axios.post(
        "http://127.0.0.1:8000/detect-anomaly",
        {
          "Traffic Volume": form.Traffic_Volume,
          "Average Speed": form.Average_Speed,
          "Congestion Level": res.predicted_congestion_level,
          "Travel Time Index": 2.2,
          "Road Capacity Utilization": 0.85,
          "Incident Reports": 1,
        }
      );
      if (anomalyRes.data.status === "ANOMALY") {
        setAnomaly?.({
          lat: Number(location.lat),
          lng: Number(location.lng),
          severity: anomalyRes.data.severity,
        });
      }
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Failed to predict congestion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const isPeakHour =
    (form.hour >= 8 && form.hour <= 11) ||
    (form.hour >= 17 && form.hour <= 21);

  const sliders = [
    {
      name: "hour" as const,
      label: "Hour of Day",
      icon: Clock,
      min: 0,
      max: 23,
      value: form.hour,
      format: (v: number) => `${String(v).padStart(2, "0")}:00`,
    },
    {
      name: "weekday" as const,
      label: "Day of Week",
      icon: Calendar,
      min: 0,
      max: 6,
      value: form.weekday,
      format: (v: number) => dayNames[v],
    },
    {
      name: "Traffic_Volume" as const,
      label: "Traffic Volume",
      icon: Gauge,
      min: 0,
      max: 100000,
      step: 1000,
      value: form.Traffic_Volume,
      format: (v: number) => `${(v / 1000).toFixed(0)}k`,
    },
    {
      name: "Average_Speed" as const,
      label: "Avg Speed",
      icon: Wind,
      min: 0,
      max: 100,
      value: form.Average_Speed,
      format: (v: number) => `${v} km/h`,
    },
  ];

  // Convert slider value to 0-100% fill
  const pct = (v: number, min: number, max: number) =>
    Math.round(((v - min) / (max - min)) * 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .pf {
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Title row ── */
        .pf-head {
          margin-bottom: 1.6rem;
          padding-left: 1rem;
          border-left: 2px solid #c9a84c;
        }

        .pf-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .pf-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #ede8df;
          letter-spacing: 0.015em;
          line-height: 1;
        }

        .pf-peak {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          color: #fbbf24;
          background: rgba(251,191,36,0.1);
          border: 1px solid rgba(251,191,36,0.35);
          border-radius: 100px;
          animation: peakPulse 2s ease-in-out infinite;
        }

        @keyframes peakPulse {
          0%,100%{ 
            border-color: rgba(251,191,36,.35);
            box-shadow: 0 0 0 0 rgba(251,191,36,0);
          }
          50% { 
            border-color: rgba(251,191,36,.65); 
            box-shadow: 0 0 0 4px rgba(251,191,36,0.1);
          }
        }

        .pf-peak svg { width: 12px; height: 12px; }

        .pf-sub {
          font-size: 0.75rem;
          color: #8a8794;
          font-weight: 400;
          letter-spacing: 0.02em;
        }

        /* ── Sliders ── */
        .pf-sliders {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .pf-slider-row {}

        .pf-slider-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .pf-slider-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #9ca3af;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .pf-slider-label svg {
          width: 14px;
          height: 14px;
          color: #c9a84c;
          opacity: 0.9;
        }

        .pf-slider-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem;
          font-weight: 600;
          color: #d4af37;
          letter-spacing: 0.02em;
          min-width: 80px;
          text-align: right;
        }

        /* Slider track wrapper */
        .pf-track-wrap {
          position: relative;
          height: 6px;
          border-radius: 3px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.03);
          overflow: visible;
        }

        .pf-track-fill {
          position: absolute;
          left: 0; top: -1px; bottom: -1px;
          border-radius: 3px;
          background: linear-gradient(90deg, #8a6e2f 0%, #c9a84c 50%, #e8c96a 100%);
          pointer-events: none;
          transition: width 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 8px rgba(201,168,76,0.3);
        }

        .pf-range {
          position: absolute;
          inset: -6px 0;
          width: 100%;
          height: 18px;
          opacity: 0;
          cursor: pointer;
          z-index: 2;
          margin: 0;
        }

        .pf-thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fff 0%, #ede8df 100%);
          border: 2px solid #c9a84c;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 0 rgba(201,168,76,0);
          pointer-events: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 3;
        }

        .pf-slider-row:hover .pf-thumb {
          box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 6px rgba(201,168,76,0.18);
          transform: translate(-50%, -50%) scale(1.2);
          border-color: #d4af37;
        }

        .pf-minmax {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
          font-size: 0.65rem;
          color: #4b4e59;
          letter-spacing: 0.02em;
          font-weight: 400;
        }

        /* ── Location ── */
        .pf-loc {
          margin-bottom: 1.5rem;
          padding: 1.2rem;
          background: linear-gradient(135deg, rgba(201,168,76,0.04) 0%, rgba(201,168,76,0.02) 100%);
          border: 1px solid rgba(201,168,76,0.18);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }

        .pf-loc::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent);
        }

        .pf-loc-head {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .pf-loc-head svg {
          width: 14px;
          height: 14px;
          color: #10b981;
        }

        .pf-loc-head span {
          font-size: 0.7rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #9ca3af;
          font-weight: 600;
        }

        .pf-loc-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .pf-input {
          background: rgba(15,18,28,0.8);
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 0.8rem;
          font-family: 'DM Sans', sans-serif;
          color: #d5d0c8;
          width: 100%;
          transition: all 0.2s;
          outline: none;
        }

        .pf-input::placeholder { 
          color: #6b6e7a; 
          font-weight: 300;
        }
        
        .pf-input:focus { 
          border-color: rgba(201,168,76,0.5);
          background: rgba(15,18,28,0.95);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
        }

        /* ── Button ── */
        .pf-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 13px 18px;
          border: 1px solid rgba(201,168,76,0.4);
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.08) 100%);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: #d4af37;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          margin-bottom: 1.3rem;
          box-shadow: 0 4px 12px rgba(201,168,76,0.1);
        }

        .pf-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent);
          transition: left 0.5s ease;
        }

        .pf-btn:hover::before { left: 100%; }

        .pf-btn:hover:not(:disabled) {
          border-color: rgba(201,168,76,0.7);
          background: linear-gradient(135deg, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0.12) 100%);
          box-shadow: 0 6px 24px rgba(201,168,76,0.2), 
                      0 0 40px rgba(201,168,76,0.15),
                      inset 0 1px 0 rgba(201,168,76,0.2);
          transform: translateY(-2px);
        }

        .pf-btn:active:not(:disabled) { 
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(201,168,76,0.15);
        }

        .pf-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          border-color: rgba(255,255,255,0.08);
          color: #6b6e7a;
          background: rgba(255,255,255,0.03);
        }

        .pf-btn svg { width: 16px; height: 16px; }

        .pf-btn-loading svg {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Dots for loading */
        .pf-dots::after {
          content: '';
          animation: dots 1.4s steps(3, end) infinite;
        }

        @keyframes dots {
          0%   { content: ''; }
          33%  { content: '.'; }
          66%  { content: '..'; }
          100% { content: '...'; }
        }

        /* ── Result ── */
        .pf-result {
          animation: resultIn 0.4s cubic-bezier(.2,.8,.4,1) both;
        }

        @keyframes resultIn {
          from { 
            opacity: 0; 
            transform: translateY(12px) scale(0.96); 
          }
          to   { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
      `}</style>

      <div className="pf">

        {/* ── Header ── */}
        <div className="pf-head">
          <div className="pf-title-row">
            <span className="pf-title">Congestion Forecast</span>
            {isPeakHour && (
              <span className="pf-peak">
                <AlertTriangle />
                Peak
              </span>
            )}
          </div>
          <p className="pf-sub">Adjust parameters for real-time analysis</p>
        </div>

        {/* ── Sliders ── */}
        <div className="pf-sliders">
          {sliders.map(({ name, label, icon: Icon, min, max, step, value, format }) => {
            const fill = pct(value, min, max);
            return (
              <div key={name} className="pf-slider-row">
                <div className="pf-slider-meta">
                  <label className="pf-slider-label">
                    <Icon />
                    {label}
                  </label>
                  <span className="pf-slider-val">{format(value)}</span>
                </div>

                <div className="pf-track-wrap">
                  {/* Fill bar */}
                  <div className="pf-track-fill" style={{ width: `${fill}%` }} />
                  {/* Invisible native range for interaction */}
                  <input
                    type="range"
                    className="pf-range"
                    min={min}
                    max={max}
                    step={step || 1}
                    value={value}
                    onChange={e => handleSliderChange(name, Number(e.target.value))}
                  />
                  {/* Custom thumb */}
                  <div className="pf-thumb" style={{ left: `${fill}%` }} />
                </div>

                <div className="pf-minmax">
                  <span>{min}</span>
                  <span>{max}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Location ── */}
        <div className="pf-loc">
          <div className="pf-loc-head">
            <MapPin />
            <span>Coordinates</span>
          </div>
          <div className="pf-loc-inputs">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={location.lat}
              onChange={e => setLocation({ ...location, lat: e.target.value })}
              className="pf-input"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={location.lng}
              onChange={e => setLocation({ ...location, lng: e.target.value })}
              className="pf-input"
            />
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          onClick={handlePredict}
          disabled={loading}
          className={`pf-btn ${loading ? "pf-btn-loading" : ""}`}
        >
          <Zap />
          {loading
            ? <span className="pf-dots">Analysing</span>
            : "Predict Congestion"}
        </button>

        {/* ── Result ── */}
        {result !== null && (
          <div className="pf-result">
            <ResultCard value={result} />
          </div>
        )}

      </div>
    </>
  );
};

export default PredictForm;