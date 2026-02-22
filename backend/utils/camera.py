import cv2
import tempfile

cap = cv2.VideoCapture(0)

def capture_frame():
    ret, frame = cap.read()
    if not ret:
        return None

    temp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
    cv2.imwrite(temp.name, frame)
    return temp.name
