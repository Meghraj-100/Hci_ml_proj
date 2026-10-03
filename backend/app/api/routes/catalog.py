from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.schemas.server import ServerSpecificationSchema
from backend.app.services.catalog_service import catalog_service

router = APIRouter()

@router.get("/catalog", response_model=List[ServerSpecificationSchema])
def get_catalog():
    servers = catalog_service.get_all_servers()
    return servers

@router.get("/catalog/{server_id}", response_model=ServerSpecificationSchema)
def get_server_by_id(server_id: str):
    server = catalog_service.get_server_by_id(server_id)
    if not server:
        raise HTTPException(status_code=404, detail=f"Server with id '{server_id}' not found.")
    return server
