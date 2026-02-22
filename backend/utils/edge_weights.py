def assign_edge_weights(G, mode="fastest"):
    for u, v, k, data in G.edges(keys=True, data=True):
        length = data.get("length", 100)  # meters
        speed = data.get("maxspeed", 40)

        # fallback
        speed = float(speed) if isinstance(speed, (int, float)) else 40

        travel_time = length / (speed * 1000 / 3600)

        # fake congestion score for now (we'll replace later)
        congestion = data.get("congestion_score", 1.0)
        anomaly = data.get("anomaly", 0)

        if mode == "fastest":
            weight = travel_time

        elif mode == "least_congested":
            weight = travel_time * congestion

        elif mode == "eco":
            weight = travel_time + 2 * congestion + 3 * anomaly

        data["weight"] = weight

    return G
