from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from model.model import SignupRequest, SigninRequest
from controller.controller_user import sign_up_user, sign_in_user, get_member_info
from utils import get_current_user

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
