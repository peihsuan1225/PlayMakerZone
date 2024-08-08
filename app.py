from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes import home
from routes import user
from routes import tactic

load_dotenv()

app = FastAPI()

# app.add_middleware(
# 	CORSMiddleware,
# 	allow_origins=["*"],
# 	allow_credentials=True,
# 	allow_methods=["*"],
# 	allow_headers=["*"],
# )

app.include_router(home.router)
app.include_router(user.router)
app.include_router(tactic.router)

app.mount("/static", StaticFiles(directory="static"), name="static")

