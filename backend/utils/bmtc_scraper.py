import requests
from bs4 import BeautifulSoup

FIND_URL = "https://narasimhadatta.info/cgi-bin/find.cgi"

def fetch_bmtc_routes(source: str, destination: str):
    params = {
        "from": source,
        "to": destination,
        "how": "Minimum Number of Hops"
    }

    res = requests.get(FIND_URL, params=params, timeout=15)
    res.raise_for_status()

    soup = BeautifulSoup(res.text, "lxml")

    routes = []

    # Each route plan is separated by a heading
    for table in soup.find_all("table"):
        rows = table.find_all("tr")[1:]  # skip header
        hops = []

        for row in rows:
            cols = [td.get_text(strip=True) for td in row.find_all("td")]
            if len(cols) < 4:
                continue

            hops.append({
                "from": cols[1],
                "to": cols[2],
                "bus_numbers": [b.strip() for b in cols[3].split(",")]
            })

        if hops:
            routes.append(hops)

    return routes
