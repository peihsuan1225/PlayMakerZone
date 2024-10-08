from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse, FileResponse
from controller.controller_tactic import get_searched_tactics, get_member_tactics, fetch_tactic_content_from_db
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

@router.get("/api/personal/tactics")
async def get_peronal_tactics(page: int = Query(0, ge=0), userName: str = Query(None), userID: int = Query(None)):
    response_data, status_code = await get_member_tactics(page=page, userName=userName, userID=userID)
    return JSONResponse(content=response_data, status_code=status_code)

@router.get("/myTactics", response_class=FileResponse)
async def get_homepage(request: Request):
    return FileResponse("./static/html/tactic_personal.html", media_type="text/html")

@router.get("/personalTactics/{username}", response_class=FileResponse)
async def get_homepage(request: Request, username:str):
    return FileResponse("./static/html/tactic_personal.html", media_type="text/html")

@router.get("/tactic/{tactic_id}", response_class=FileResponse)
async def get_tactic_content(request: Request, tactic_id: int):
    return FileResponse("./static/html/tactic_content_view.html", media_type="text/html")

@router.get("/api/tactic/content")
async def get_tactic_content(tactic_id: int):
    response_data, status_code = await fetch_tactic_content_from_db(tactic_id)
    return JSONResponse(content=response_data, status_code=status_code)