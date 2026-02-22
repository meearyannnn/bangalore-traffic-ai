def vehicle_count_to_score(vehicle_count: int) -> int:
    """
    Converts vehicle count → congestion score (0–100)
    """
    MAX_VEHICLES = 50
    score = min(int((vehicle_count / MAX_VEHICLES) * 100), 100)
    return score


def fuse_congestion(vehicle_score: int, anomaly_status: str) -> int:
    """
    Fuse YOLO score + anomaly result
    """
    final_score = vehicle_score

    if anomaly_status == "ANOMALY":
        final_score = min(vehicle_score + 20, 100)

    return final_score


def congestion_color(score: int) -> str:
    """
    Map score → map marker color
    """
    if score < 30:
        return "green"
    elif score < 60:
        return "yellow"
    elif score < 80:
        return "orange"
    else:
        return "red"
