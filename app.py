from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes import index, user, tactic_edit, tactic_view
from routes import user
from routes import tactic_edit

load_dotenv()

app = FastAPI()

# app.add_middleware(
# 	CORSMiddleware,
# 	allow_origins=["*"],
# 	allow_credentials=True,
# 	allow_methods=["*"],
# 	allow_headers=["*"],
# )

app.include_router(index.router)
app.include_router(user.router)
app.include_router(tactic_edit.router)
app.include_router(tactic_view.router)

app.mount("/static", StaticFiles(directory="static"), name="static")

