from fastapi import APIRouter
from backend.app.schemas.metrics import HealthStatusSchema
from backend.app.ml.model_registry import model_registry
from backend.app.services.catalog_service import catalog_service
from backend.app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthStatusSchema)
def health_check():
    models_ok = model_registry.is_loaded
    catalog_ok = len(catalog_service.get_all_servers()) > 0
    status = "healthy" if (models_ok and catalog_ok) else "degraded"
    
    return HealthStatusSchema(
        status=status,
        models_loaded=models_ok,
        catalog_loaded=catalog_ok,
        version=settings.VERSION
    )
