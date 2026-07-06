import array

import argon2
from pydantic import BaseModel


class UserRegister(BaseModel):
    userId: str | None = None
    email: str
    name: str
    authHash: argon2.Argon2BrowserHashResult
    kdfSalt: array[bytes]


class UserLogin(BaseModel):
    email: str
    authHash: str

class UserAuthenticate(BaseModel):
    userId: str
    authHash: str
class UserVerify(BaseModel):
    userId: str

