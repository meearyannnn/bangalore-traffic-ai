from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from utils.preprocess import preprocess_input
from fastapi.middleware.cors import CORSMiddleware
from utils.anomaly import detect_anomaly
from fastapi import UploadFile, File
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from datetime import datetime
from utils.camera import capture_frame
from utils.yolo_detector import detect_vehicles
from utils.anomaly import detect_anomaly
from utils.road_graph import load_road_graph
from utils.edge_weights import assign_edge_weights
from utils.geocode import reverse_geocode
from utils.road_score import road_importance_score
from utils.time_score import time_traffic_score
from utils.congestion import congestion_color
from utils.bus_simple import find_bus_numbers
from utils.bmtc_scraper import fetch_bmtc_routes
from utils.metro_route import find_route, find_route as get_metro_route
from utils.bus_stops import find_nearest_bus_stop
from utils.bus_search import find_matching_stops
from utils.bus_zones import get_bus_zone_info
from utils.railway_service import search_trains_from_bangalore
from utils.smart_mode import predict_best_mode
from fastapi import Body
from fastapi import Query
import requests

from pydantic import BaseModel
from utils.bus_stops import find_nearest_bus_stop

from utils.routing import get_route
from utils.congestion import (
    vehicle_count_to_score,
    fuse_congestion,
    congestion_color
)

import shutil
import osmnx as ox

G_BASE = load_road_graph()
from utils.yolo_detector import detect_vehicles



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

class LocationRequest(BaseModel):
    lat: float
    lng: float
class MetroRequest(BaseModel):
    source: str
    destination: str
class BMTCRequest(BaseModel):
    source: str
    destination: str
class BusQuery(BaseModel):
    source: str
    destination: str


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
@app.post("/detect-anomaly")
def anomaly_detection(payload: dict):
    """
    Expected JSON:
    {
      "hour": 9,
      "weekday": 2,
      "Traffic Volume": 12000,
      "Average Speed": 5
    }
    """
    return detect_anomaly(payload)
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/detect-traffic-image")
async def detect_traffic_image(file: UploadFile = File(...)):
    # 1️⃣ Save uploaded image
    image_path = UPLOAD_DIR / file.filename
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2️⃣ YOLO → vehicle count
    
    vehicle_count = detect_vehicles(str(image_path))


    # 3️⃣ Vehicle count → congestion score
    vehicle_score = vehicle_count_to_score(vehicle_count)

    # 4️⃣ Prepare anomaly input (proxy data)
    anomaly_payload = {
        "Traffic Volume": vehicle_count * 300,
        "Average Speed": max(5, 60 - vehicle_count),
        "hour": datetime.now().hour,
        "weekday": datetime.now().weekday()
    }

    anomaly_result = detect_anomaly(anomaly_payload)

    # 5️⃣ Fuse YOLO + anomaly
    final_score = fuse_congestion(
        vehicle_score,
        anomaly_result["status"]
    )

    # 6️⃣ Map marker color
    marker_color = congestion_color(final_score)

    return {
        "vehicle_count": vehicle_count,
        "vehicle_score": vehicle_score,
        "anomaly_status": anomaly_result["status"],
        "final_congestion_score": final_score,
        "marker_color": marker_color
    }
@app.get("/detect-live")
def detect_live():
    image_path = capture_frame()
    if not image_path:
        return {"error": "Camera not available"}

    vehicle_count = detect_vehicles(image_path)

    score = min(100, vehicle_count * 4)

    return {
        "vehicle_count": vehicle_count,
        "final_congestion_score": score
    }
@app.post("/predict-route")
def predict_route(payload: dict):
    source = payload["source"]
    destination = payload["destination"]

    results = {}

    for mode in ["fastest", "least_congested", "eco"]:
        G = G_BASE.copy()
        G = assign_edge_weights(G, mode)

        route_nodes = get_route(G, source, destination)

        route_coords = [
            (G.nodes[n]["y"], G.nodes[n]["x"])
            for n in route_nodes
        ]

        results[mode] = route_coords

    return results
@app.post("/location-traffic")
def location_traffic(data: LocationRequest):
    geo = reverse_geocode(data.lat, data.lng)

    road_score = road_importance_score(geo["road"])
    time_score = time_traffic_score()

    gps_score = int(0.6 * road_score + 0.4 * time_score)

    return {
        "location": geo,
        "gps_score": gps_score,
        "marker_color": congestion_color(gps_score)
    }
@app.post("/metro-route")
def metro_route(data: MetroRequest):
    route = find_route(data.source, data.destination)

    if not route:
        return {"error": "Route not found"}

    station_count = len(route["stations"])
    time = station_count * 2.5  # avg 2.5 min/station
    fare = max(10, station_count * 5)

    return {
        "lines": route["lines"],
        "stations": route["stations"],
        "interchange": route["interchange"],
        "estimated_time_min": int(time),
        "fare": fare
    }
@app.post("/nearest-bus-stop")
def nearest_bus_stop(data: LocationRequest):
    return find_nearest_bus_stop(data.lat, data.lng)
@app.post("/bmtc-route")
def bmtc_route(req: BMTCRequest):
    routes = fetch_bmtc_routes(req.source, req.destination)

    return {
        "available": len(routes) > 0,
        "route_plans": routes
    }
@app.get("/bus-zone")
def bus_zone(area: str):
    return get_bus_zone_info(area)
@app.post("/bus-stops")
def bus_stops(data: BusQuery):
    src = find_matching_stops(data.source)
    dst = find_matching_stops(data.destination)

    if src.empty or dst.empty:
        return {
            "available": False,
            "message": "No matching stops found"
        }

    return {
        "available": True,
        "source_matches": src["stop_name"].head(5).tolist(),
        "destination_matches": dst["stop_name"].head(5).tolist()
    }
@app.get("/railway/search")
def railway_search(to_station_code: str):
    trains = search_trains_from_bangalore(to_station_code)

    return {
        "mode": "railway",
        "from": "Bangalore",
        "to": to_station_code,
        "count": len(trains),
        "trains": trains
    }
@app.post("/smart-mode")
def smart_mode(data: dict = Body(...)):
    """
    Smart Mode: AI-powered transportation mode recommendation
    
    Handles get_route() returning a list of nodes instead of dict
    """
    
    # Extract coordinates
    source = (data["source"]["lat"], data["source"]["lng"])
    destination = (data["destination"]["lat"], data["destination"]["lng"])

    # ----------------------------
    # 1️⃣ Get Car Route & Calculate Time/Cost
    # ----------------------------
    try:
        # Get route nodes (returns list, not dict)
        route_nodes = get_route(G_BASE, source, destination)
        
        if not route_nodes or len(route_nodes) < 2:
            return {"error": "Could not find car route between these locations"}
        
        # Calculate total distance by summing edge lengths
        total_distance = 0
        for i in range(len(route_nodes) - 1):
            u = route_nodes[i]
            v = route_nodes[i + 1]
            # Get first edge data (MultiDiGraph can have multiple edges)
            edge_data = G_BASE[u][v][0]
            # Length is in meters
            total_distance += edge_data.get('length', 0)
        
        # Convert to kilometers
        distance = round(total_distance / 1000, 2)
        
        # Calculate time based on congestion level
        congestion = data["predicted_congestion"]
        
        # Adjust average speed based on congestion
        if congestion > 70:
            avg_speed = 15  # km/h (heavy traffic)
        elif congestion > 40:
            avg_speed = 25  # km/h (moderate traffic)
        else:
            avg_speed = 40  # km/h (light traffic)
        
        # Calculate time in minutes
        car_time = int((distance / avg_speed) * 60)
        
        # Calculate cost (₹9 per km)
        car_cost = int(distance * 9)
        
    except Exception as e:
        print(f"Car route error: {e}")
        return {"error": f"Route calculation failed: {str(e)}"}

    # ----------------------------
    # 2️⃣ Get Metro Route
    # ----------------------------
    try:
        metro_route = get_metro_route(
            f"{source[0]},{source[1]}", 
            f"{destination[0]},{destination[1]}"
        )
        
        if metro_route and isinstance(metro_route, dict):
            metro_time = metro_route.get("estimated_time_min", 999)
            metro_cost = metro_route.get("fare", 999)
            metro_available = 1
        else:
            metro_time = 999
            metro_cost = 999
            metro_available = 0
            
    except Exception as e:
        print(f"Metro route error: {e}")
        metro_time = 999
        metro_cost = 999
        metro_available = 0

    # ----------------------------
    # 3️⃣ Get Bus Route
    # ----------------------------
    try:
        bus_route = find_bus_numbers(source, destination)
        
        if bus_route and isinstance(bus_route, dict):
            bus_time = bus_route.get("duration", 999)
            bus_cost = bus_route.get("fare", 999)
            bus_transfers = bus_route.get("transfers", 2)
        else:
            bus_time = 999
            bus_cost = 999
            bus_transfers = 2
            
    except Exception as e:
        print(f"Bus route error: {e}")
        bus_time = 999
        bus_cost = 999
        bus_transfers = 2

    # ----------------------------
    # 4️⃣ Peak Hour Detection
    # ----------------------------
    hour = data["hour"]
    is_peak = 1 if hour in [8, 9, 10, 17, 18, 19] else 0

    # ----------------------------
    # 5️⃣ ML Prediction
    # ----------------------------
    try:
        result = predict_best_mode(
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
        )
    except Exception as e:
        print(f"ML prediction error: {e}")
        # Fallback to simple rule-based decision
        if metro_available and metro_time < car_time:
            result = {"recommended_mode": "metro", "confidence": 0.65}
        elif bus_cost < car_cost * 0.3:
            result = {"recommended_mode": "bus", "confidence": 0.60}
        else:
            result = {"recommended_mode": "car", "confidence": 0.70}

    # ----------------------------
    # 6️⃣ Generate AI Reasoning
    # ----------------------------
    reason = []
    
    if congestion > 70:
        reason.append("High road congestion detected")
    
    if metro_available:
        if metro_time < car_time:
            reason.append("Metro faster than car")
        if metro_cost < car_cost:
            reason.append("Metro more cost-efficient")
    
    if bus_cost < car_cost and bus_cost < metro_cost:
        reason.append("Bus most economical option")
    
    if is_peak:
        reason.append("Peak hour traffic conditions")
    
    if distance < 5 and congestion < 40:
        reason.append("Short distance with low congestion favors driving")
    
    if distance > 15:
        reason.append("Long distance journey")
    
    # Add mode-specific insights
    recommended_mode = result["recommended_mode"].lower()
    if recommended_mode == "metro":
        reason.append("Metro recommended for reliability and speed")
    elif recommended_mode == "bus":
        reason.append("Bus recommended for cost savings")
    elif recommended_mode == "car":
        reason.append("Car recommended for convenience and flexibility")

    # ----------------------------
    # 7️⃣ Return Structured Response
    # ----------------------------
    return {
        "recommended_mode": result["recommended_mode"],
        "confidence": result["confidence"],
        "comparison": {
            "car": {
                "time": car_time,
                "cost": car_cost,
                "available": True
            },
            "metro": {
                "time": metro_time if metro_available else None,
                "cost": metro_cost if metro_available else None,
                "available": bool(metro_available)
            },
            "bus": {
                "time": bus_time if bus_time < 999 else None,
                "cost": bus_cost if bus_cost < 999 else None,
                "available": bus_time < 999
            }
        },
        "reasoning": reason,
        "route_info": {
            "distance_km": distance,
            "is_peak_hour": bool(is_peak),
            "congestion_level": congestion
        }
    }
@app.get("/explore-nearby")
def explore_nearby(
    lat: float = Query(...),
    lng: float = Query(...),
    category: str = Query("restaurant")
):
    """
    Explore nearby places using OpenStreetMap Overpass API
    """

    radius = 3000  # 3km

    overpass_query = f"""
    [out:json];
    (
      node["amenity"="{category}"](around:{radius},{lat},{lng});
      way["amenity"="{category}"](around:{radius},{lat},{lng});
      relation["amenity"="{category}"](around:{radius},{lat},{lng});
    );
    out center 20;
    """

    url = "https://overpass-api.de/api/interpreter"
    response = requests.post(url, data=overpass_query)

    if response.status_code != 200:
        return {"places": []}

    data = response.json()
    results = []

    for element in data.get("elements", []):
        name = element.get("tags", {}).get("name", "Unnamed Place")

        if "lat" in element:
            place_lat = element["lat"]
            place_lng = element["lon"]
        else:
            place_lat = element["center"]["lat"]
            place_lng = element["center"]["lon"]

        results.append({
            "name": name,
            "lat": place_lat,
            "lng": place_lng,
        })

    return {"places": results[:20]}

@app.get("/geocode")
def geocode_place(query: str):
    """
    Convert place name to latitude & longitude using OpenStreetMap
    """

    url = "https://nominatim.openstreetmap.org/search"

    params = {
        "q": query,
        "format": "json",
        "limit": 1
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        return {"error": "Geocoding failed"}

    data = response.json()

    if not data:
        return {"error": "Place not found"}

    return {
        "lat": float(data[0]["lat"]),
        "lng": float(data[0]["lon"]),
        "display_name": data[0]["display_name"]
    }
