from utils.railway_api import trains_between_stations

# Bangalore major stations
BANGALORE_STATIONS = ["SBC", "YPR", "BNC"]

def search_trains_from_bangalore(to_code: str):
    all_trains = []

    for src in BANGALORE_STATIONS:
        data = trains_between_stations(src, to_code)

        if data.get("status") and data.get("data"):
            all_trains.extend(data["data"])

    return all_trains
