import pandas as pd

routes = pd.read_csv("data/routes.csv")
trips = pd.read_csv("data/trips.csv")
stop_times = pd.read_csv("data/stop_times.csv")
stops = pd.read_csv("data/stops.csv")

stops["stop_name"] = stops["stop_name"].astype(str)

final_routes = []

# pick ONE trip per route
for route_id in routes["route_id"].unique():
    trip = trips[trips["route_id"] == route_id].head(1)
    if trip.empty:
        continue

    trip_id = trip.iloc[0]["trip_id"]

    stop_ids = stop_times[stop_times["trip_id"] == trip_id] \
        .sort_values("stop_sequence")["stop_id"]

    stop_names = stops[stops["stop_id"].isin(stop_ids)]["stop_name"].tolist()

    if len(stop_names) < 2:
        continue

    final_routes.append({
        "bus_no": routes[routes["route_id"] == route_id]["route_short_name"].iloc[0],
        "route_text": " → ".join(stop_names)
    })

pd.DataFrame(final_routes).to_csv("data/simple_routes.csv", index=False)

print("✅ simple_routes.csv generated")
