import pandas as pd
from utils.text_match import normalize, fuzzy_match

# load once
stops = pd.read_csv("data/stops.csv")

# ensure string + normalized column
stops["stop_name"] = stops["stop_name"].astype(str)

stops["norm_name"] = stops["stop_name"].apply(normalize)

def find_matching_stops(query: str):
    q = normalize(query)

    # 1️⃣ PARTIAL MATCH (fast, Google-like)
    matches = stops[stops["norm_name"].str.contains(q, na=False)]

    # 2️⃣ FUZZY MATCH (only if nothing found)
    if matches.empty:
        fuzzy = fuzzy_match(q, stops["norm_name"].tolist())
        if fuzzy:
            matches = stops[stops["norm_name"].isin(fuzzy)]

    return matches
