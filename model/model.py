from pydantic import BaseModel
from typing import List

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
    player_A: List[str]
    player_B: List[str]
    ball: List[str]
    description: str
