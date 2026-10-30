"""Initialize dashboard tables for the configured database.

Run from the repository root:
    backend\\.venv\\Scripts\\python backend\\init_db.py

Set DATABASE_URL before running to target PostgreSQL. This script creates
missing tables only; it does not delete records or seed sample data.
"""
from app import dashboard_main  # Registers dashboard table definitions.
from app.database import Base, engine


def main() -> None:
    Base.metadata.create_all(bind=engine)
    print(f"Database schema ready ({engine.dialect.name}). No sample data inserted.")


if __name__ == "__main__":
    main()
