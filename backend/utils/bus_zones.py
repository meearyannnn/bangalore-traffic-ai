import pandas as pd

zones = pd.read_csv("data/zones.csv")

def get_bus_zone_info(area: str):
    zone = zones[zones["area"].str.contains(area, case=False, na=False)]

    if zone.empty:
        return None

    row = zone.iloc[0]
    return {
        "zone": row["zone"],
        "bus_coverage": row["bus_coverage"],
    }
