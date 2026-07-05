import enum
from sqlite3 import Time

from sqlalchemy import Table, Column, Integer, String, MetaData
from sqlalchemy.ext.declarative import declarative_base

users = Table('users', MetaData(),
    Column('id', Integer, primary_key=True),
    Column('username', String, unique=True, nullable=False, index=True),
    Column('email', String, unique=True, nullable=False),
    Column('authHash', String, nullable=False),
    Column('kdfSalt', String, nullable=False),
    Column('verification_status', String, nullable=False, default='unverified')
)

class purpose(enum.Enum): 
    TOKEN = "token" 
    SECRET = "mfa_code"

secrets = Table('secrets', MetaData(),
    Column('id', Integer, primary_key=True),
    Column('secretHash', String, nullable=False),
    Column('purpose', purpose, nullable=False),
    Column('expiration', Time, nullable=False),
    Column('attempts', Integer, nullable=False)
)