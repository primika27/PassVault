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