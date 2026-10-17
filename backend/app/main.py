import os
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from backend.app.core.database import engine, Base
from backend.app.middleware.telemetry import TelemetryMiddleware
from backend.app.api.v1.router import api_router

Base.metadata.create_all(bind=engine)


def migrate_usernames():
    """Add usernames to existing deployments and backfill legacy accounts."""
    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns("users")}
    if "username" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR(50)"))
            users = connection.execute(text("SELECT id, email, role FROM users ORDER BY id")).mappings().all()
            for user in users:
                if user["role"] != "user":
                    continue
                stem = re.sub(r"[^a-z0-9_.]", "", user["email"].split("@", 1)[0].lower())[:19] or "user"
                username = stem if len(stem) >= 3 else f"{stem}_{user['id']}"
                if connection.execute(
                    text("SELECT 1 FROM users WHERE username = :username LIMIT 1"),
                    {"username": username},
                ).first():
                    username = f"{stem}_{user['id']}"
                connection.execute(
                    text("UPDATE users SET username = :username WHERE id = :user_id"),
                    {"username": username, "user_id": user["id"]},
                )

    index_names = {index["name"] for index in inspect(engine).get_indexes("users")}
    if "ix_users_username" not in index_names:
        with engine.begin() as connection:
            connection.execute(text("CREATE UNIQUE INDEX ix_users_username ON users (username)"))


migrate_usernames()

app = FastAPI(title="APIMetric API", version="1.0.0")

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(TelemetryMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/", tags=["Health"])
def read_root():
    return {"status": "online", "message": "APIMetric Gateway Active"}
