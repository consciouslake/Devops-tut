import logging

from pydantic_settings import BaseSettings

logger = logging.getLogger("uvicorn.error")


class Settings(BaseSettings):
    gemini_api_key: str = ""

    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_collection: str = "azureops_docs"

    jwt_secret: str = "dev-only-change-me"

    otel_exporter_otlp_endpoint: str = "http://tempo:4317"
    otel_enabled: bool = True

    # When set, secrets are fetched from Azure Key Vault via Managed Identity
    # instead of .env -- see Module 11. Left unset for local docker-compose dev.
    azure_key_vault_name: str = ""

    class Config:
        env_file = ".env"


def _load_from_key_vault(vault_name: str, s: Settings) -> None:
    from azure.identity import DefaultAzureCredential
    from azure.keyvault.secrets import SecretClient

    client = SecretClient(
        vault_url=f"https://{vault_name}.vault.azure.net/", credential=DefaultAzureCredential()
    )
    s.gemini_api_key = client.get_secret("gemini-api-key").value
    s.jwt_secret = client.get_secret("jwt-secret").value
    logger.info("Loaded secrets from Key Vault %s (Managed Identity)", vault_name)


settings = Settings()
if settings.azure_key_vault_name:
    _load_from_key_vault(settings.azure_key_vault_name, settings)
