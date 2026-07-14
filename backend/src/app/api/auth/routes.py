from app.services import UserService
from fastapi import APIRouter, HTTPException, status

from app.schemas.schemas import UserLogin, UserRegister, UserVerify
from app.services.UserService import register, login, verify_email, mfauthenticate

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister):
    try:
        return UserService.register(
            userId=payload.userId or "",
            name=payload.name,
            email=payload.email,
            authHash=payload.authHash,
            kdfSalt=payload.kdfSalt,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/login")
def login(payload: UserLogin):
    try:
        return UserService.login(email=payload.email, authHash=payload.authHash)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.post("/verify")
def verify(payload: UserVerify):
    try:
        return UserService.verify_email(email=payload.email)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    
@router.get("/salt/{userId}")
def get_salt(userId: str):
    try:
        return UserService.get_salt(userId=userId)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    