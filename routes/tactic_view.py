from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from controller.controller_tactic import get_searched_tactics
from typing import List, Optional



router = APIRouter()

@router.get("/api/tactics")
async def get_tactics(
    page: int = Query(0, ge=0),
    keyword: Optional[str] = Query(None),
    tags: List[str] = Query([])
):
    response_data, status_code = await get_searched_tactics(page, keyword, tags)
    return JSONResponse(content=response_data, status_code=status_code)