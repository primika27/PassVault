from app.services import UserService
from fastapi import APIRouter, HTTPException, Response, status

from app.schemas.schemas import UserLogin, UserRegister, UserVerify, UserAuthenticate
from app.services.UserService import register, login, verify_email, mfa

router = APIRouter()

MFA_COOKIE = "mfa_challenge"
SESSION_COOKIE = "session_id"

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister):
    try:
        return UserService.register(
            user_id=payload.user_id or "",
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
    return {"mfaRequired": True, "next": "/mfa"}

@router.post("/mfa")
def mfauthenticate(payload: UserAuthenticate, response: Response, mfa_challenge: str | None = None):
    if not mfa_challenge:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="MFA challenge cookie missing or expired. Please log in again."
        )
    try:
        # Pass the challenge_id from cookie AND the otp from body
        session_id = UserService.mfa(
            challenge_id=mfa_challenge, 
            otp=payload.otp
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    # Set the permanent session cookie and clear the temp mfa_challenge cookie
    response.set_cookie(
        key="session_id", value=session_id, httponly=True, secure=True, samesite="strict", max_age=604800
    )
    response.delete_cookie("mfa_challenge")

    return {"message": "Authenticated successfully"}

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

