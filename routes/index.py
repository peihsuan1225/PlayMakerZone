from fastapi import APIRouter, Request
from fastapi.responses import FileResponse

router = APIRouter()

@router.get("/", response_class=FileResponse)
async def get_homepage(request: Request):
    return FileResponse("./static/html/index.html", media_type="text/html")