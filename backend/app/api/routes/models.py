from fastapi import APIRouter
from backend.app.schemas.metrics import ModelsStatusResponseSchema, ModelsMetricsResponseSchema
from backend.app.ml.model_registry import model_registry

router = APIRouter()

@router.get("/models/status", response_model=ModelsStatusResponseSchema)
def get_models_status():
    status_dict = model_registry.get_status()
    return ModelsStatusResponseSchema(**status_dict)

@router.get("/models/metrics", response_model=ModelsMetricsResponseSchema)
def get_models_metrics():
    metrics_dict = model_registry.get_metrics()
    return ModelsMetricsResponseSchema(**metrics_dict)
