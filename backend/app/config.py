from pydantic import BaseSettings, Field
from pathlib import Path

class Settings(BaseSettings):
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    JWT_SECRET_KEY: str = Field(..., env="JWT_SECRET_KEY")

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'  # Optional: Set the encoding of the .env file
        case_sensitive = True  

# Instantiate settings to be used across the app
settings = Settings()

# Optional: Check if the .env file exists at startup
env_path = Path(".env")
if not env_path.is_file():
    raise FileNotFoundError(f"Environment file (.env) not found at: {env_path}")
