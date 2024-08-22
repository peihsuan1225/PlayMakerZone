from fastapi import APIRouter, Request, Depends
from fastapi.responses import FileResponse, JSONResponse
from model.model import TacticRequest, TacticContentRequest
from controller.controller_tactic import create_tactic_info, get_tactic, save_tactic_content
from utils import get_current_user
from datetime import datetime
import json

router = APIRouter()

def datetime_to_string(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError("Type not serializable")

@router.get("/createTactic", response_class=FileResponse)
async def get_homepage(request: Request):
    return FileResponse("./static/html/tactic_create.html", media_type="text/html")

@router.post("/api/tactic")
async def create_tactic(tactic_input: TacticRequest):
    response_data, status_code = await create_tactic_info(tactic_input)
    return JSONResponse(content=response_data, status_code=status_code)

@router.get("/createTactic/content", response_class=FileResponse)
async def get_page(request: Request):
    return FileResponse("./static/html/tactic_content_edit.html", media_type="text/html")

@router.get("/api/tactic/latest")
async def get_tactic_user(user: dict = Depends(get_current_user)):
    response_data, status_code = await get_tactic(user=user)
    response_data = json.loads(json.dumps(response_data, default=datetime_to_string))
    return JSONResponse(content=response_data, status_code=status_code)

@router.get("/api/tactic/info")
async def get_tactic_tacticID(tactic_id: int):
    response_data, status_code = await get_tactic(tactic_id=tactic_id)
    response_data = json.loads(json.dumps(response_data, default=datetime_to_string))
    return JSONResponse(content=response_data, status_code=status_code)

@router.post("/api/tactic/content")
async def create_tactic(tacticContent_input: TacticContentRequest):
    response_data, status_code = await save_tactic_content(tacticContent_input)
    return JSONResponse(content=response_data, status_code=status_code)

# @router.get("/tactic/{id}", include_in_schema=False)
# async def attraction(request: Request, id: int):
# 	return FileResponse("./static/tactic.html", media_type="text/html")
