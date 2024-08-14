from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from controller.controller_tactic import get_searched_tactics
from typing import List, Optional



router = APIRouter()

@router.get("/api/tactics")
async def get_tactics(
    page: int = Query(0, ge=0),
    search: Optional[str] = Query(None),
    playerCounts: Optional[str] = Query([]),
    dateStart: Optional[str] = Query(None),
    dateEnd: Optional[str] = Query(None),
    modes: Optional[List[str]] = Query([]),
    difficulties: Optional[List[str]] = Query([])
):
    response_data, status_code = await get_searched_tactics(
        page=page,
        keyword=search,
        playerCounts=playerCounts,
        dateStart=dateStart,
        dateEnd=dateEnd,
        modes=modes,
        difficulties=difficulties
    )
    return JSONResponse(content=response_data, status_code=status_code)