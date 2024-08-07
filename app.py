from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes import home
from routes import user

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

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/tactic/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
	return FileResponse("./static/tactic.html", media_type="text/html")