from datetime import datetime

def time_traffic_score():
    hour = datetime.now().hour

    if 8 <= hour <= 11:
        return 80
    if 17 <= hour <= 21:
        return 90

    return 40
