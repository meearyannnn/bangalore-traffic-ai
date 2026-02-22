import pandas as pd
import numpy as np

rows = []

for _ in range(20000):

    distance = np.random.uniform(2, 30)
    congestion = np.random.uniform(10, 100)

    car_time = distance * np.random.uniform(1.6, 2.6)
    metro_time = distance * np.random.uniform(1.0, 1.9)
    bus_time = distance * np.random.uniform(1.8, 2.8)

    car_cost = distance * 9
    metro_cost = distance * 3
    bus_cost = distance * 2

    is_peak = np.random.choice([0,1])
    metro_available = np.random.choice([0,1])
    bus_transfers = np.random.randint(0,3)

    # Labeling logic (used ONLY for dataset generation)
    if congestion > 75 and metro_available == 1:
        label = "Metro"
    elif distance < 4:
        label = "Car"
    elif bus_cost < metro_cost and bus_time < metro_time + 10:
        label = "Bus"
    else:
        label = "Metro"

    rows.append([
        distance, congestion,
        car_time, metro_time, bus_time,
        car_cost, metro_cost, bus_cost,
        is_peak, metro_available, bus_transfers,
        label
    ])

df = pd.DataFrame(rows, columns=[
    "distance", "congestion",
    "car_time", "metro_time", "bus_time",
    "car_cost", "metro_cost", "bus_cost",
    "is_peak", "metro_available", "bus_transfers",
    "best_mode"
])

df.to_csv("data/smart_mode_training.csv", index=False)
print("Training data generated")
