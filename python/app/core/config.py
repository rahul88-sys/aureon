from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    jwt_secret: str = "dev-only-change-me"
    blob_read_write_token: str = ""
    blob_store_id: str = ""
    engine_default: str = "auto"
    ocr_engine: str = "tesseract"
    enable_heavy_ocr: bool = False
    cors_origins: str = "http://localhost:3000,http://localhost:4000"
    max_download_bytes: int = 40 * 1024 * 1024

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
