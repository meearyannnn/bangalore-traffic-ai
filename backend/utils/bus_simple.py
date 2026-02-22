import pandas as pd

# load once
routes = pd.read_csv("data/routes.csv")

def find_bus_numbers(source: str, destination: str):
    source = source.lower()
    destination = destination.lower()

    matched = routes[
        routes["route_long_name"].str.lower().str.contains(source, na=False) &
        routes["route_long_name"].str.lower().str.contains(destination, na=False)
    ]

    return matched["route_short_name"].drop_duplicates().tolist()
