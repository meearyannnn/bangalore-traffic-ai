import pandas as pd

routes = pd.read_csv("data/routes.csv")
trips = pd.read_csv("data/trips.csv")
stop_times = pd.read_csv("data/stop_times.csv")
stops = pd.read_csv("data/stops.csv")

# normalize
stops["stop_name"] = stops["stop_name"].astype(str).str.lower()

def find_bus_route(source: str, destination: str):
    source = source.lower()
    destination = destination.lower()

    # 1️⃣ match stops loosely
    src_stops = stops[stops["stop_name"].str.contains(source, na=False)]
    dst_stops = stops[stops["stop_name"].str.contains(destination, na=False)]

    if src_stops.empty or dst_stops.empty:
        return []

    src_ids = set(src_stops["stop_id"])
    dst_ids = set(dst_stops["stop_id"])

    # 2️⃣ trips touching source & destination
    trips_from_src = set(
        stop_times[stop_times["stop_id"].isin(src_ids)]["trip_id"]
    )

    trips_from_dst = set(
        stop_times[stop_times["stop_id"].isin(dst_ids)]["trip_id"]
    )

    common_trips = trips_from_src & trips_from_dst

    if not common_trips:
        return []

    # 3️⃣ resolve bus numbers
    route_ids = trips[trips["trip_id"].isin(common_trips)]["route_id"].unique()

    buses = routes[routes["route_id"].isin(route_ids)][
        ["route_short_name", "route_long_name"]
    ].drop_duplicates()

    return buses.to_dict(orient="records")
