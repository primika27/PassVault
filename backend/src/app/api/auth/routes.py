from app.services import UserService
from fastapi import APIRouter, HTTPException, Response, status

from app.schemas.schemas import UserLogin, UserRegister, UserVerify
from app.services.UserService import register, login, verify_email, mfauthenticate

router = APIRouter()

MFA_COOKIE = "mfa_challenge"
SESSION_COOKIE = "session_id"

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister):
    try:
        return UserService.register(
            userId=payload.userId or "",
            name=payload.name,
            email=payload.email,
            password=payload.password,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/login")
def login(payload: UserLogin, response: Response):
    try:
        challenge_id = UserService.login(email=payload.email, password=payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    response.set_cookie(
        key=MFA_COOKIE, value=challenge_id,
        httponly=True, secure=True, samesite="strict", max_age=300,  # 5 min
    )
    return {"mfa_required": True}

@router.post("/mfa")
def mfauthenticate(payload: UserAuth):
    try:
        return UserService.mfauthenticate(email=payload.email, verificationCode=payload.verificationCode)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    
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

