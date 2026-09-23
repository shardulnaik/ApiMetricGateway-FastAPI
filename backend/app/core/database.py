import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import DATABASE_URL

database_url = str(DATABASE_URL)
if database_url.startswith("postgres://"):
    database_url = "postgresql://" + database_url[len("postgres://"):]

parsed_database_url = make_url(database_url)
database_host = parsed_database_url.host or ""
ssl_mode = os.getenv("DATABASE_SSL", "auto").lower()
use_ssl = ssl_mode == "true" or (
    ssl_mode == "auto" and database_host not in {"localhost", "127.0.0.1", "::1"}
)

connect_args = {}
if parsed_database_url.get_backend_name() == "mysql" and use_ssl:
    connect_args["ssl"] = {}

engine = create_engine(
    database_url,
    pool_pre_ping=True,
    connect_args=connect_args,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
