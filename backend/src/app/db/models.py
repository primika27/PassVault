import enum
from sqlite3 import Time

from sqlalchemy import DateTime, Enum, ForeignKey, Table, Column, Integer, String, MetaData
from sqlalchemy.ext.declarative import declarative_base

users = Table('users', MetaData(),
    Column('user_id', Integer, primary_key=True),
    Column('username', String, unique=True, nullable=False, index=True),
    Column('email', String, unique=True, nullable=False),
    Column('authHash', String, nullable=False),
    # Column('kdfSalt', String, nullable=False),
    Column('verification_status', String, nullable=False, default='unverified')
)

class purpose(enum.Enum): 
    TOKEN = "token" 
    SECRET = "mfa_code"
    EMAIL_VERIFY = "email_verify"

secrets = Table('secrets', MetaData(),
    Column('id', Integer, primary_key=True),
    Column('user_id', Integer, ForeignKey('users.user_id'), nullable=False),
    Column('challenge_id', String, unique=True, nullable=False, index=True),
    Column('secretHash', String, nullable=False),
    Column('purpose', Enum(purpose), nullable=False),
    Column('expiration', DateTime, nullable=False),
    Column('attempts', Integer, nullable=False, default=0),
)

sessions = Table('sessions', MetaData(),
    Column('id', Integer, primary_key=True),
    Column('session_id', String, unique=True, nullable=False, index=True),
    Column('user_id', Integer, ForeignKey('users.user_id'), nullable=False),
    Column('created_at', DateTime, nullable=False),
    Column('expires_at', DateTime, nullable=False),
)