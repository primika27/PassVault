from pydantic import BaseModel

class UserRegister(BaseModel):
    email: str
    name: str   
    authHash: str
    kdfSalt: str
    verification_status: str = 'unverified'


class UserLogin(BaseModel):
    email: str
    authHash: str
