from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth.routes import router as auth_router   
from app.db.db import create_db_and_tables, engine
import app.db.models

@asynccontextmanager
async def lifespan(app: FastAPI):
   
   create_db_and_tables()
   yield


app = FastAPI(title="PassVault backend", lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "PassVault backend is running"}