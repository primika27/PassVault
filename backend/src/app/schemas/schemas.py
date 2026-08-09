import array

import argon2
from pydantic import BaseModel, EmailStr, field_validator


class UserRegister(BaseModel):
    user_id: str | None = None
    email: EmailStr
    name: str
    auth_salt: str
    auth_hash: str

    @field_validator("auth_hash")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v
    
class UserLogin(BaseModel):
    email: EmailStr
    auth_hash: str

class UserAuthenticate(BaseModel):
    otp: str
    

class UserVerify(BaseModel):
    token: str

