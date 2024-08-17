from fastapi import APIRouter, Query, Depends, Request
from fastapi.responses import JSONResponse, FileResponse
from controller.controller_tactic import get_searched_tactics, get_member_tactics
from typing import List, Optional
from utils import get_current_user



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

@router.get("/api/personal/tactics")
async def get_peronal_tactics(page: int = Query(0, ge=0), userName: str = Query(None), userID: int = Query(None)):
    response_data, status_code = await get_member_tactics(page=page, userName=userName, userID=userID)
    return JSONResponse(content=response_data, status_code=status_code)


@router.get("/myTactics", response_class=FileResponse)
async def get_homepage(request: Request):
    return FileResponse("./static/html/tactic_personal.html", media_type="text/html")