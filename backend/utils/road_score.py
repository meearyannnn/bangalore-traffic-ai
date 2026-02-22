IMPORTANT_ROADS = [
    "Outer Ring Road",
    "Silk Board",
    "Electronic City",
    "Whitefield",
    "MG Road",
    "Hebbal"
]

def road_importance_score(road: str | None):
    if not road:
        return 30

    for key in IMPORTANT_ROADS:
        if key.lower() in road.lower():
            return 80

    return 50
