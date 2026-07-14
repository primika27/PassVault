
from fastapi.concurrency import asynccontextmanager
#from app.api import health
#from app.api.auth.routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
#from backend.src.app.api.auth.routes import router as auth_router

app = FastAPI(title="PassVault backend")
#metadata.create_all(engine)
#app.include_router(health.router)
#app.include_router(auth_router)

#root to test if the backend is running
@app.get("/")
def read_root() :
    return {"PassVault backend is running"}

@asynccontextmanager
async def startup():
    await database.connect()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#app.include_router(auth_router)
