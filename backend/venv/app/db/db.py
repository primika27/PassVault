from sqlalchemy import create_engine, MetaData
from databse import Database

DATABASE_URL = "sqlite:///./users.db"

database = Database(DATABASE_URL)
engine = create_engine(DATABASE_URL)
metadata = MetaData()
