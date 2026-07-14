import jwt
from datetime import datetime, timedelta, timezone
import os

def generate_jwt(payload: dict) -> str:
    expiration_time = datetime.now(timezone.utc) + timedelta(minutes=60)
    payload['exp'] = expiration_time
    token =jwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")
    return token
