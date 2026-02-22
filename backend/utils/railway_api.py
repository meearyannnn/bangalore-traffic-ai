import requests

RAPID_API_KEY = "a27643b76cmsh5d1d4ad5f129df6p17b608jsn636a163056de"
RAPID_API_HOST = "irctc1.p.rapidapi.com"

BASE_URL = "https://irctc1.p.rapidapi.com/api/v3"

HEADERS = {
    "x-rapidapi-key": RAPID_API_KEY,
    "x-rapidapi-host": RAPID_API_HOST
}

def trains_between_stations(from_code: str, to_code: str):
    url = f"{BASE_URL}/trainBetweenStations"

    params = {
        "fromStationCode": from_code,
        "toStationCode": to_code
    }

    response = requests.get(url, headers=HEADERS, params=params)

    return response.json()
