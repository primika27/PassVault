from sqlalchemy import create_engine, MetaData
from .models import users, secrets, sessions
DATABASE_URL = "sqlite:///./users.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
metadata = MetaData()
class Database:
    def __init__(self, engine):
        self.engine = engine

    def add_user(self, user):
        with self.engine.begin() as conn:
            result = conn.execute(users.insert().values(
                username=user.name,
                email=user.email,
                authHash=user.password,
                verification_status="verified" if user.is_verified else "unverified",
            ))
            return result.inserted_primary_key[0]  # returns the new user_id

    def get_user_by_email(self, email):
        with self.engine.connect() as conn:
            return conn.execute(
                users.select().where(users.c.email == email)
            ).first()

    def get_user_by_id(self, user_id):
        with self.engine.connect() as conn:
            return conn.execute(
                users.select().where(users.c.user_id == user_id)
            ).first()

    def set_verification_status(self, user_id, status):
        with self.engine.begin() as conn:
            conn.execute(
                users.update().where(users.c.user_id == user_id).values(verification_status=status)
            )

    def add_secret(self, user_id, challenge_id, secretHash, purpose, expiration, attempts):
        with self.engine.begin() as conn:
            conn.execute(secrets.insert().values(
                user_id=user_id,
                challenge_id=challenge_id,
                secretHash=secretHash,
                purpose=purpose,
                expiration=expiration,
                attempts=attempts,
            ))

    def add_session(self, session_id, user_id, created_at, expires_at):
        with self.engine.begin() as conn:
            conn.execute(sessions.insert().values(
                session_id=session_id,
                user_id=user_id,
                created_at=created_at,
                expires_at=expires_at,
            ))

    def get_secret_by_challenge(self, challenge_id):
        with self.engine.connect() as conn:
            return conn.execute(
                secrets.select().where(secrets.c.challenge_id == challenge_id)
            ).first()

    def delete_secret(self, secret_id):
        with self.engine.begin() as conn:
            conn.execute(secrets.delete().where(secrets.c.id == secret_id))


    def increment_secret_attempts(self, secret_id):
        with self.engine.begin() as conn:
            conn.execute(
                secrets.update().where(secrets.c.id == secret_id).values(
                    attempts=secrets.c.attempts + 1
                )
            )
  
database = Database(engine)