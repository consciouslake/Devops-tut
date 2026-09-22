from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str = ""

    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_collection: str = "azureops_docs"

    redis_url: str = "redis://localhost:6379/0"

    jwt_secret: str = "dev-only-change-me"

    otel_exporter_otlp_endpoint: str = "http://tempo:4317"
    otel_enabled: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
