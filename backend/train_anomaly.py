import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from pathlib import Path

print("🚦 Training Traffic Anomaly Detection Model...")

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "Banglore_traffic_Dataset.csv"
MODEL_DIR = BASE_DIR / "model"
MODEL_DIR.mkdir(exist_ok=True)

df = pd.read_csv(DATA_PATH)

# 🔑 Create time features
df["Date"] = pd.to_datetime(df["Date"])
df["hour"] = df["Date"].dt.hour
df["weekday"] = df["Date"].dt.weekday

FEATURES = ["hour", "weekday", "Traffic Volume", "Average Speed"]
X = df[FEATURES]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = IsolationForest(
    n_estimators=300,
    contamination=0.05,
    random_state=42
)

model.fit(X_scaled)

joblib.dump(model, MODEL_DIR / "anomaly_model.pkl")
joblib.dump(scaler, MODEL_DIR / "anomaly_scaler.pkl")

print("✅ Anomaly model trained & saved")
