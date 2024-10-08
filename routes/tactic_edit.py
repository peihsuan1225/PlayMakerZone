from fastapi import APIRouter, Request, Depends, File, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
from model.model import TacticRequest, TacticContentRequest
from controller.controller_tactic import create_tactic_info, get_tactic, save_tactic_content, delete_tactic, update_thumbnail, check_tacticOwner, reset_tactic_content
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

@router.delete("/api/tactic")
async def delete_tactic_tacticID(tactic_id: int, user: dict = Depends(get_current_user)):
    response_data, status_code = await delete_tactic(tactic_id, user)
    return JSONResponse(content=response_data, status_code=status_code)

@router.post("/api/tactic/thumbnail")
async def update_tactic_thumbnail(tactic_id: int = Form(...), step: int = Form(...), file: UploadFile = File(...)):
    response_data, status_code = await update_thumbnail(tactic_id, step, file)
    return JSONResponse(content=response_data, status_code=status_code)

@router.get("/api/tactic/verificate")
async def check_tacticOwner_verificate(tactic_id: int, user: dict = Depends(get_current_user)):
    response_data, status_code = await check_tacticOwner(tactic_id, user)
    return JSONResponse(content=response_data, status_code=status_code)

@router.delete("/api/tactic/content")
async def delete_tactic_content(tactic_id: int):
    response_data, status_code = await reset_tactic_content(tactic_id)
    return JSONResponse(content=response_data, status_code=status_code)