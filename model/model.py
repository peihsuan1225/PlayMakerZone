from fastapi import UploadFile
from pydantic import BaseModel
from typing import List, Dict, Optional

class SignupRequest(BaseModel):
    username: str
    email: str
    password: str

class SigninRequest(BaseModel):
    email: str
    password: str

class TacticRequest(BaseModel):
    name: str
    player: int
    member_id: int
    tags: List[str]
    level: str
    status: str

class TacticContentRequest(BaseModel):
    tactic_id: int
    step: int
    player_A: List[Dict]
    player_B: List[Dict]
    ball: List[Dict]
    description: Optional[str] = None

class UserUpdate(BaseModel):
    username: Optional[str]
    email: Optional[str]
    password: Optional[str]
    avatar: Optional[UploadFile]
    about_me: Optional[str]
    fullname: Optional[str]


