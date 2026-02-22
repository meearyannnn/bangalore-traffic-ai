import joblib
import numpy as np
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "model" / "anomaly_model.pkl"
SCALER_PATH = BASE_DIR / "model" / "anomaly_scaler.pkl"

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

FEATURES = ["hour", "weekday", "Traffic Volume", "Average Speed"]

def detect_anomaly(input_data: dict):
    now = datetime.now()

    hour = int(input_data.get("hour", now.hour))
    weekday = int(input_data.get("weekday", now.weekday()))

    volume = input_data.get("Traffic Volume") or input_data.get("volume")
    speed = input_data.get("Average Speed") or input_data.get("speed")

    if volume is None or speed is None:
        return {
            "error": "Missing required fields",
            "expected": FEATURES,
            "received": input_data
        }

    volume = float(volume)
    speed = float(speed)

    X = np.array([[hour, weekday, volume, speed]])
    X_scaled = scaler.transform(X)

    pred = model.predict(X_scaled)[0]
    score = model.decision_function(X_scaled)[0]

    return {
        "status": "ANOMALY" if pred == -1 else "NORMAL",
        "severity": round(abs(float(score)), 3)
    }
