import os
import json
from typing import List, Dict, Any, Optional
from backend.app.core.config import settings
from backend.app.core.logging import logger

class CatalogService:
    def __init__(self, catalog_path: Optional[str] = None):
        self.catalog_path = catalog_path or settings.CATALOG_PATH
        self.servers: List[Dict[str, Any]] = []
        self.load_catalog()

    def load_catalog(self):
        if not os.path.exists(self.catalog_path):
            logger.error(f"Catalog file not found at {self.catalog_path}")
            self.servers = []
            return
        try:
            with open(self.catalog_path, "r") as f:
                self.servers = json.load(f)
            logger.info(f"Loaded {len(self.servers)} candidate servers from catalog.")
        except Exception as e:
            logger.error(f"Error loading server catalog: {e}")
            self.servers = []

    def get_all_servers(self) -> List[Dict[str, Any]]:
        return self.servers

    def get_server_by_id(self, server_id: str) -> Optional[Dict[str, Any]]:
        for server in self.servers:
            if server["id"] == server_id:
                return server
        return None

catalog_service = CatalogService()
