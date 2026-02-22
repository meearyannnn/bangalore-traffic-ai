from fastapi import APIRouter, Query
from utils.railway_service import search_trains

router = APIRouter()

@router.get("/railway/search")
def railway_search(to: str = Query(..., description="Destination city")):
    trains = search_trains(to)

    return {
        "mode": "railway",
        "source": "Bangalore",
        "count": len(trains),
        "trains": trains
    }
