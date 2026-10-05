import os

class Settings:
    PROJECT_NAME: str = "Cloud Server Recommendation System API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, "app", "data")
    CATALOG_PATH: str = os.path.join(DATA_DIR, "server_catalog.json")
    MODELS_DIR: str = os.path.join(BASE_DIR, "app", "models")
    
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
