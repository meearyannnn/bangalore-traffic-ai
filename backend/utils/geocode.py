import requests

def reverse_geocode(lat: float, lng: float):
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": lat,
        "lon": lng,
        "format": "json"
    }
    headers = {"User-Agent": "traffic-ai-demo"}

    res = requests.get(url, params=params, headers=headers, timeout=5)
    data = res.json()

    address = data.get("address", {})
    return {
        "road": address.get("road") or address.get("neighbourhood"),
        "suburb": address.get("suburb") or address.get("city_district"),
        "city": address.get("city") or address.get("town")
    }
