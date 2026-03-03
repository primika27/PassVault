from fastapi import FastAPI, HTTPException
from fastapi.concurrency import asynccontextmanager
from passlib.context import CryptContext
from app.db.db import database, metadata, engine
from app.schemas.schemas import UserRegister, UserLogin
from app.api import health
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Secure Vault API")
metadata.create_all(engine)
app.include_router(health.router)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@asynccontextmanager
async def startup():
    await database.connect()

@app.get("/register")
async def register(user: UserRegister):
    query = users.select().where(users.c.username == user.username)
    existing_user = await database.fetch_one(query)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_password = pwd_context.hash(user.password)
    query = users.insert().values(username=user.username, email=user.email, hashed_password=hashed_password)
    await database.execute(query)
    return {"message": "User registered successfully"}

@app.get("/login")
async def login(user : UserLogin):
    query = users.select().where(users.c.username == user.username)
    existing_user = await database.fetch_one(query)
    if not existing_user or not pwd_context.verify(user.password, existing_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    return {"message": "Login successful"}
    
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