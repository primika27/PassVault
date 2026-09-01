from datetime import date, datetime

from pydantic import BaseModel, EmailStr, field_validator


class UserRegister(BaseModel):
    user_id: str | None = None
    name: str
    email: EmailStr
    auth_salt: str
    auth_hash: str
    key_check: str

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

class VaultItemCreate(BaseModel):
    id: str | None = None
    encrypted_data: str

class VaultItemResponse(BaseModel):
    id: str
    user_id: str
    encrypted_data: str
    created_at: datetime | None
    updated_at: datetime | None

class VaultItemResponseWrapper(BaseModel):
    vault_item: VaultItemResponse