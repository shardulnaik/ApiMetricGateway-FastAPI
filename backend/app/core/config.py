import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ADMIN_REGISTER_KEY = os.getenv("ADMIN_REGISTER_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment or .env file")

if not SECRET_KEY:
    raise ValueError("SECRET_KEY is not set in environment or .env file")

if not ADMIN_REGISTER_KEY:
    raise ValueError("ADMIN_REGISTER_KEY is not set in environment or .env file")
