import pandas as pd
from math import sqrt

# Load only required columns explicitly
stops = pd.read_csv(
    "data/stops.csv",
    usecols=["stop_id", "stop_name", "stop_lat", "stop_lon"]
)

# Force numeric conversion safely
stops["stop_lat"] = pd.to_numeric(stops["stop_lat"], errors="coerce")
stops["stop_lon"] = pd.to_numeric(stops["stop_lon"], errors="coerce")

# Drop only rows where BOTH are missing
stops = stops.dropna(subset=["stop_lat", "stop_lon"], how="any")

print("✅ Bus stops loaded:", len(stops))

def find_nearest_bus_stop(lat: float, lng: float):
    min_dist = float("inf")
    nearest = None

    for _, row in stops.iterrows():
        dist = sqrt(
            (lat - row["stop_lat"]) ** 2 +
            (lng - row["stop_lon"]) ** 2
        )

        if dist < min_dist:
            min_dist = dist
            nearest = row

    if nearest is None:
        return {
            "error": "No nearby bus stop found"
        }

    return {
        "stop_id": str(nearest["stop_id"]),
        "stop_name": str(nearest["stop_name"]),
        "distance_km": round(min_dist * 111, 2),
    }
