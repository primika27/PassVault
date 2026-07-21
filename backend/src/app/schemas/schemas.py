import array

import argon2
from pydantic import BaseModel, EmailStr, field_validator


class UserRegister(BaseModel):
    userId: str | None = None
    email: EmailStr
    name: str
    password: str
    verification : bool | None = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserAuthenticate(BaseModel):
    otp: str
class UserVerify(BaseModel):
    email: EmailStr

