from ultralytics import YOLO
from pathlib import Path

# Load YOLO model once
model = YOLO("yolov8n.pt")

# COCO vehicle class IDs
VEHICLE_CLASSES = {2, 3, 5, 7}  
# 2=car, 3=motorcycle, 5=bus, 7=truck

def detect_vehicles(image_path: str) -> int:
    results = model(image_path, conf=0.3, verbose=False)
    boxes = results[0].boxes

    VEHICLE_CLASSES = {2, 3, 5, 7}
    count = sum(int(cls) in VEHICLE_CLASSES for cls in boxes.cls)

    return count

