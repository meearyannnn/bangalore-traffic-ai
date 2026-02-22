import TimeSlider from "./TimeSlider";
import ZonePanel from "./ZonePanel";

export default function Sidebar({
  hour,
  setHour,
}: {
  hour: number;
  setHour: (h: number) => void;
}) {
  return (
    <div className="bg-panel backdrop-blur-glass rounded-2xl p-5 shadow-soft border border-white/5 space-y-6">
      <h2 className="text-xl font-semibold text-white">
        Traffic Controls
      </h2>

      <TimeSlider hour={hour} setHour={setHour} />

      <ZonePanel />
    </div>
  );
}
