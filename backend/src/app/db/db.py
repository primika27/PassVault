from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import create_engine, MetaData, select
from .models import metadata_obj, users, secrets, sessions

DB_FILE = Path(__file__).resolve().parents[2] / "users.db"
DATABASE_URL = f"sqlite:///{DB_FILE.as_posix()}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def create_db_and_tables():
    with engine.connect() as conn:
        legacy_user_id = conn.exec_driver_sql(
            """
            SELECT 1
            FROM pragma_table_info('users')
            WHERE name = 'user_id' AND upper(type) = 'INTEGER'
            """
        ).first()
        if legacy_user_id:
            metadata_obj.drop_all(bind=engine)
    metadata_obj.create_all(bind=engine)

class Database:
    def __init__(self, engine):
        self.engine = engine

    def add_user(self, user, name, email, auth_salt, pass_hash, verification_status):
        with self.engine.begin() as conn:
            result = conn.execute(users.insert().values(
                user_id=user,
                username=name,
                email=email,
                auth_salt=auth_salt,
                pass_hash=pass_hash,
                verification_status=verification_status,
            ))
            return result.inserted_primary_key[0]  # returns the new user_id

    def delete_user(self, user_id):
        with self.engine.begin() as conn:
            conn.execute(users.delete().where(users.c.user_id == user_id))
            conn.execute(secrets.delete().where(secrets.c.user_id == user_id))
            conn.execute(sessions.delete().where(sessions.c.user_id == user_id))

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

    def get_user_verification_status(self, user_id):
        with self.engine.connect() as conn:
            result = conn.execute(
                users.select().where(users.c.user_id == user_id)
            ).first()
            return result.verification_status if result else None

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

    def get_token_by_challenge(self, user_id, purpose):
        with self.engine.connect() as conn:
            return conn.execute(
                secrets.select().where(secrets.c.user_id == user_id, secrets.c.purpose == purpose)
            ).first()

    def increment_secret_attempts(self, secret_id):
        with self.engine.begin() as conn:
            conn.execute(
                secrets.update().where(secrets.c.id == secret_id).values(
                    attempts=secrets.c.attempts + 1
                )
            )

    def get_salt_by_email(self, email: str):
        with self.engine.connect() as conn:
            stmt = select(users.c.auth_salt).where(users.c.email == email)
            result = conn.execute(stmt).first()
            return result.auth_salt if result else None

    def vault_items_by_user(self, user_id):
        with self.engine.connect() as conn:
            return conn.execute(
                vault_items.select().where(vault_items.c.user_id == user_id)
            ).fetchall()

    def expire_session(self, session_id):
        with self.engine.begin() as conn:
            conn.execute(sessions.update().where(sessions.c.session_id == session_id).values(
                expires_at=datetime.now(timezone.utc)
            ))
  
database = Database(engine)