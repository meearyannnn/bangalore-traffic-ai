from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from utils.preprocess import preprocess_input
from fastapi.middleware.cors import CORSMiddleware
# Initialize app
app = FastAPI(title="Bangalore Traffic AI API")

# Load trained ML model
model = joblib.load("model/traffic_model.pkl")

# Request schema
class TrafficRequest(BaseModel):
    hour: int
    weekday: int
    Traffic_Volume: float
    Average_Speed: float

@app.get("/")
def root():
    return {"status": "Bangalore Traffic AI Backend Running"}

@app.post("/predict")
def predict_traffic(data: TrafficRequest):
    input_data = {
        "hour": data.hour,
        "weekday": data.weekday,
        "Traffic Volume": data.Traffic_Volume,
        "Average Speed": data.Average_Speed
    }

    X = preprocess_input(input_data)
    prediction = model.predict(X)[0]

    return {
        "predicted_congestion_level": round(float(prediction), 2)
    }
@app.get("/hotspots")
def get_hotspots():
    df = pd.read_csv("data/hotspots.csv")
    return df.to_dict(orient="records")
@app.get("/zones")
def get_zones():
    df = pd.read_csv("data/zones.csv")
    return df.to_dict(orient="records")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
