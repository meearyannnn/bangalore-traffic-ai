def fuse_scores(vehicle_score, gps_score, anomaly_score):
    return int(
        0.5 * vehicle_score +
        0.3 * gps_score +
        0.2 * anomaly_score
    )
