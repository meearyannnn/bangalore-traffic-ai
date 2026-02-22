import os
import joblib
import numpy as np


# ---------------------------------------------------------
# Load Smart Mode ML Model (only once at startup)
# ---------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  
# backend/

MODEL_PATH = os.path.join(BASE_DIR, "model", "smart_mode_model.pkl")

try:
    smart_model = joblib.load(MODEL_PATH)
    print("✅ Smart Mode model loaded successfully.")
except Exception as e:
    print("❌ Error loading Smart Mode model:", e)
    smart_model = None


# ---------------------------------------------------------
# Smart Mode Prediction Function
# ---------------------------------------------------------

def predict_best_mode(
    distance,
    congestion,
    car_time,
    metro_time,
    bus_time,
    car_cost,
    metro_cost,
    bus_cost,
    is_peak,
    metro_available,
    bus_transfers
):
    """
    Predict the best transport mode using trained ML model.
    Returns:
        {
            "recommended_mode": str,
            "confidence": float
        }
    """

    if smart_model is None:
        return {
            "recommended_mode": "Model Not Loaded",
            "confidence": 0.0
        }

    try:
        # Create feature array in SAME ORDER as training
        features = np.array([[
            float(distance),
            float(congestion),
            float(car_time),
            float(metro_time),
            float(bus_time),
            float(car_cost),
            float(metro_cost),
            float(bus_cost),
            int(is_peak),
            int(metro_available),
            int(bus_transfers)
        ]])

        prediction = smart_model.predict(features)[0]
        probabilities = smart_model.predict_proba(features)[0]

        confidence = float(np.max(probabilities))

        return {
            "recommended_mode": prediction,
            "confidence": round(confidence, 4)
        }

    except Exception as e:
        return {
            "recommended_mode": "Prediction Error",
            "confidence": 0.0,
            "error": str(e)
        }
