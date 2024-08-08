from fastapi import APIRouter, Request
from fastapi.responses import FileResponse, JSONResponse
from model.model import TacticRequest
from controller.controller_tactic import create_tactic_info

router = APIRouter()

@router.get("/createTactic", response_class=FileResponse)
async def get_homepage(request: Request):
    return FileResponse("./static/html/tactic.html", media_type="text/html")

@router.post("/api/tactic")
async def create_tactic(tactic_input: TacticRequest):
    response_data, status_code = await create_tactic_info(tactic_input)
    return JSONResponse(content=response_data, status_code=status_code)

@router.get("/tactic/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
	return FileResponse("./static/tactic.html", media_type="text/html")
