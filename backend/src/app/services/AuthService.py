import string
from xxlimited import new

from graphene import String

import jwt_handler

def authenticate(payload: dict) -> str:
    token = jwt_handler.generate_jwt(payload)
    return token



