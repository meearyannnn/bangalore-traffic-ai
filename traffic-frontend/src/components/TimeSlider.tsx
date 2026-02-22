export default function TimeSlider({
  hour,
  setHour,
}: {
  hour: number;
  setHour: (h: number) => void;
}) {
  return (
    <div className="bg-panelSoft rounded-xl p-4 border border-white/5">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>Hour of Day</span>
        <span className="text-neon">{hour}:00</span>
      </div>

      <input
        type="range"
        min={0}
        max={23}
        value={hour}
        onChange={(e) => setHour(Number(e.target.value))}
        className="w-full accent-cyan-400"
      />

      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>00:00</span>
        <span>23:00</span>
      </div>
    </div>
  );
}
