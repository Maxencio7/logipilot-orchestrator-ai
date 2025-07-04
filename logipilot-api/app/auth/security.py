from passlib.context import CryptContext
from pydantic import BaseModel, Field
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Settings for JWT, could also be loaded from .env via Pydantic's BaseSettings
# For simplicity here, but ideally use a config management solution.
# These will be used by jwt.py
class JWTSettings(BaseModel):
    SECRET_KEY: str = "your-secret-key"  # Replace with actual secret from config
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

# Example of how to load from .env if you have pydantic-settings
# from pydantic_settings import BaseSettings
# class Settings(BaseSettings):
#     SECRET_KEY: str
#     ALGORITHM: str = "HS256"
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
#
#     class Config:
#         env_file = ".env"
#
# settings = Settings()
# jwt_settings = JWTSettings(SECRET_KEY=settings.SECRET_KEY, ALGORITHM=settings.ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

# For now, use default values or ensure they are passed correctly when jwt.py uses this.
# We will create a core config.py later to manage this properly.
# jwt_settings = JWTSettings() # Uses default values for now.

# Updated to use the global settings from core.config
from ..core.config import settings

jwt_settings = JWTSettings(
    SECRET_KEY=settings.SECRET_KEY,
    ALGORITHM=settings.ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES=settings.ACCESS_TOKEN_EXPIRE_MINUTES
)
