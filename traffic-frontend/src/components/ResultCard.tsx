/* ------------- CONSTANTS ------------- */

const CONGESTION_THRESHOLDS = {
  LOW: 30,
  MODERATE: 70,
};

const CONGESTION_CONFIG = {
  low: {
    label: "Low",
    style: "text-success",
  },
  moderate: {
    label: "Moderate",
    style: "text-warning",
  },
  high: {
    label: "High",
    style: "text-danger",
  },
};

/* ------------- TYPES ------------- */

type CongestionLevel = "low" | "moderate" | "high";

/* ------------- UTILITY FUNCTIONS ------------- */

const getCongestionLevel = (value: number): CongestionLevel => {
  if (value < CONGESTION_THRESHOLDS.LOW) return "low";
  if (value < CONGESTION_THRESHOLDS.MODERATE) return "moderate";
  return "high";
};

const getCongestionConfig = (value: number) => {
  const level = getCongestionLevel(value);
  return CONGESTION_CONFIG[level];
};

/* ------------- SUB-COMPONENTS ------------- */

function CongestionLabel({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-2xl font-bold">
      {label} ({value})
    </div>
  );
}

function CongestionHeader() {
  return <div className="text-sm text-gray-400">Predicted Congestion</div>;
}

/* ------------- MAIN COMPONENT ------------- */

export default function ResultCard({ value }: { value: number }) {
  const { label, style } = getCongestionConfig(value);

  return (
    <div className="mt-4 bg-panelSoft rounded-lg p-4 border border-white/5">
      <CongestionHeader />
      <div className={style}>
        <CongestionLabel label={label} value={value} />
      </div>
    </div>
  );
}