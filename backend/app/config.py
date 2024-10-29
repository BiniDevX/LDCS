from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    JWT_SECRET_KEY: str = Field(..., env="JWT_SECRET_KEY")
    ALLOWED_ORIGINS: str = Field(..., env="ALLOWED_ORIGINS")

    class Config:
        case_sensitive = True

# Instantiate settings to be used across the app
settings = Settings()
