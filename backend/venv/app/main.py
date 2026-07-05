from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from app.db.db import database, metadata, engine
from app.api import health
from app.api.auth.routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Secure Vault API")
metadata.create_all(engine)
app.include_router(health.router)
app.include_router(auth_router)


@asynccontextmanager
async def startup():
    await database.connect()


@app.get("/")
async def root():
    return {"message": "Hello World"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)