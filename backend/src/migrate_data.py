import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, select

# Adjust the import path if your models are located under app.db.models
from app.db.models import users, secrets, sessions, vault_items

load_dotenv()

# 1. Source: Local SQLite
sqlite_path = Path(__file__).resolve().parent / "users.db"
# If users.db is in a parent directory, adjust accordingly:
# sqlite_path = Path(__file__).resolve().parents[1] / "users.db"
sqlite_engine = create_engine(f"sqlite:///{sqlite_path}")

# 2. Destination: Neon PostgreSQL
pg_url = os.getenv("DATABASE_URL")
if pg_url and pg_url.startswith("postgres://"):
    pg_url = pg_url.replace("postgres://", "postgresql://", 1)

if not pg_url or "sqlite" in pg_url:
    raise ValueError("Please provide a valid PostgreSQL DATABASE_URL in your .env file.")

pg_engine = create_engine(pg_url)

# Order matters: parent tables (users) must migrate before child tables
TABLES = [
    ("users", users),
    ("secrets", secrets),
    ("sessions", sessions),
    ("vault_items", vault_items),
]

def migrate():
    print(f"Reading from: {sqlite_path}")
    print("Connecting to Neon PostgreSQL...")

    with sqlite_engine.connect() as sqlite_conn, pg_engine.begin() as pg_conn:
        for name, table in TABLES:
            # Fetch all rows as dictionaries from SQLite
            stmt = select(table)
            rows = sqlite_conn.execute(stmt).mappings().all()

            if not rows:
                print(f"[{name}] 0 rows found in SQLite. Skipping.")
                continue

            # Convert RowMapping objects to standard dicts
            data = [dict(row) for row in rows]

            # Insert rows into Neon PostgreSQL
            pg_conn.execute(table.insert(), data)
            print(f"[{name}] Successfully migrated {len(data)} row(s).")

    print("\nMigration complete! All local records copied to Neon.")

if __name__ == "__main__":
    migrate()