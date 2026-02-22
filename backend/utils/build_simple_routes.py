import pandas as pd

routes = pd.read_csv("data/routes.csv")
trips = pd.read_csv("data/trips.csv")
stop_times = pd.read_csv("data/stop_times.csv")
stops = pd.read_csv("data/stops.csv")

stops["stop_name"] = stops["stop_name"].astype(str)

final_rows = []

for route_id in routes["route_id"].unique():
    trip_row = trips[trips["route_id"] == route_id].head(1)
    if trip_row.empty:
        continue

    trip_id = trip_row.iloc[0]["trip_id"]

    ordered = (
        stop_times[stop_times["trip_id"] == trip_id]
        .sort_values("stop_sequence")["stop_id"]
        .tolist()
    )

    stop_names = (
        stops.set_index("stop_id")
        .loc[ordered]["stop_name"]
        .drop_duplicates()
        .tolist()
    )

    if len(stop_names) < 2:
        continue

    bus_no = routes[routes["route_id"] == route_id]["route_short_name"].iloc[0]

    final_rows.append({
        "bus_no": bus_no,
        "route_text": " → ".join(stop_names)
    })

pd.DataFrame(final_rows).to_csv(
    "data/simple_routes.csv",
    index=False
)

print(f"✅ Generated {len(final_rows)} simple routes")
