from pydantic_settings import BaseSettings
from functools import lru_cache # For caching settings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./logipilot.db"
    SECRET_KEY: str = "your-secret-key-please-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    ADMIN_EMAIL: str = "admin@logipilot.com"
    ADMIN_PASSWORD: str = "admin123"

    # Optional: Add other settings as needed
    # API_V1_STR: str = "/api/v1"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
