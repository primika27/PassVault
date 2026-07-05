from pydantic import BaseModel


class UserRegister(BaseModel):
    userId: str | None = None
    email: str
    name: str
    authHash: str


class UserLogin(BaseModel):
    email: str
    authHash: str

class UserAuthenticate(BaseModel):
    userId: str
    authHash: str
class UserVerify(BaseModel):
    userId: str

