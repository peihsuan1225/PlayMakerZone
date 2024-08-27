from fastapi import APIRouter, Depends, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse, FileResponse
from model.model import SignupRequest, SigninRequest
from controller.controller_user import sign_up_user, sign_in_user, get_member_info, update_user_profile
from utils import get_current_user
from typing import Optional

router = APIRouter()

@router.post("/api/user")
async def sign_up(signup_input: SignupRequest):
    response_data, status_code = await sign_up_user(signup_input)
    return JSONResponse(content=response_data, status_code=status_code)

@router.put("/api/user/auth")
async def sign_in(signin_input: SigninRequest):
    response_data, status_code = await sign_in_user(signin_input)
    return JSONResponse(content=response_data, status_code=status_code)

@router.get("/api/user/auth")
async def get_member_info_route(user: dict = Depends(get_current_user)):
    response_data = await get_member_info(user)
    return response_data

@router.get("/profile", response_class=FileResponse)
async def get_profile(request: Request):
    return FileResponse("./static/html/profile.html", media_type="text/html")

@router.patch("/api/user/profile")
async def update_profile(
    username: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    current_password: Optional[str] = Form(None),
    new_password: Optional[str] = Form(None),
    default_avatar: Optional[str] = Form(None),
    avatar_url: Optional[UploadFile] = File(None),
    about_me: Optional[str] = Form(None),
    fullname: Optional[str] = Form(None),
    user: dict = Depends(get_current_user)
):
    
    user_update = {
    "username": username,
    "email": email,
    "current_password": current_password,
    "new_password": new_password,
    "default_avatar": default_avatar,
    "about_me": about_me,
    "fullname": fullname,
    "avatar_url": avatar_url
    }
    
    response_data, status_code = await update_user_profile(user_update, user)
    return JSONResponse(content=response_data, status_code=status_code)
    
