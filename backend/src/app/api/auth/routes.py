from app.services import UserService
from fastapi import APIRouter, Cookie, HTTPException, Response, status
from fastapi import WebSocket, WebSocketDisconnect

from app.schemas.schemas import UserLogin, UserRegister, UserVerify, UserAuthenticate
from app.services.UserService import register, login, verify_email, mfa

router = APIRouter()

MFA_COOKIE = "mfa_challenge"
SESSION_COOKIE = "session_id"
COOKIE_SECURE = False

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister):
    try:
        return UserService.register(
            user_id=payload.user_id or "",
            name=payload.name,
            email=payload.email,
            auth_salt=payload.auth_salt,
            auth_hash=payload.auth_hash,
        )
        
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@router.post("/logout")
def logout(response: Response, session_id: str | None = Cookie(default=None, alias=SESSION_COOKIE)):
    if session_id:
        UserService.logout(session_id=session_id)
        response.delete_cookie(SESSION_COOKIE)
    return {"message": "Logged out successfully"}

@router.post("/login")
def login(payload: UserLogin, response: Response):
    try:
        challenge_id = UserService.login(email=payload.email, auth_hash=payload.auth_hash)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    response.set_cookie(
        key=MFA_COOKIE, value=challenge_id,
        httponly=True, secure=COOKIE_SECURE, samesite="lax", max_age=300,  # 5 min
    )
    return {"mfaRequired": True, "next": "/mfa"}

@router.post("/mfa")
def mfauthenticate(
    payload: UserAuthenticate,
    response: Response,
    mfa_challenge: str | None = Cookie(default=None, alias=MFA_COOKIE),
):
    if not mfa_challenge:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="MFA challenge cookie missing or expired. Please log in again."
        )
    try:
        session_id = UserService.mfa(
            challenge_id=mfa_challenge, 
            otp=payload.otp
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    # Set the permanent session cookie and clear the temp mfa_challenge cookie
    response.set_cookie(
        key=SESSION_COOKIE, value=session_id, httponly=True, secure=COOKIE_SECURE, samesite="lax", max_age=604800
    )
    response.delete_cookie("mfa_challenge")

    return {"message": "Authenticated successfully"}

@router.post("/verify")
def verify(payload: UserVerify):
    try:
        user_id = UserService.verify(token=payload.token)
        return {"verified": True, "user_id": user_id}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/verify/status/{user_id}")
def verify_status(user_id: str):
    try:
        status = UserService.get_status(user_id)
        # normalize boolean-ish responses
        is_verified = bool(status) and str(status).lower() in ("true", "verified", "1")
        return {"verified": is_verified}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.websocket("/ws/verify/{user_id}")
async def websocket_verify(websocket: WebSocket, user_id: str):
    # WebSocket endpoint that notifies the client when the user's email is verified.
    # Client should connect and wait for a JSON message { verified: true, user_id }
    from app.services.NotificationService import get_manager

    manager = get_manager()
    await manager.connect(user_id, websocket)
    try:
        # keep the connection open until client disconnects or we notify and close
        while True:
            # optionally accept pings from client to keep alive
            await websocket.receive_text()
    except WebSocketDisconnect:
            await manager.disconnect(user_id, websocket)
    except Exception:
        await manager.disconnect(user_id, websocket)
    
@router.get("/salt")
def get_salt(email: str):
    try:
        return UserService.get_salt(email=email)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/vault")
def get_vault(user_id: str, session_id: str | None = Cookie(default=None, alias=SESSION_COOKIE)):
    if not session_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session cookie missing or expired. Please log in again.")
    try:
        vault_items = UserService.get_vault(user_id=user_id, session_id=session_id)
        return {"vault": vault_items}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc