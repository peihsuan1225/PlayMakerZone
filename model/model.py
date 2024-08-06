from fastapi import UploadFile, File
from pydantic import BaseModel

class SignupRequest(BaseModel):
    username: str
    email: str
    password: str
    avatar: UploadFile = File(...)

class SigninRequest(BaseModel):
    email: str
    password: str
