from typing import Dict, Any, Optional
from pydantic import BaseModel

class HealthStatusSchema(BaseModel):
    status: str
    models_loaded: bool
    catalog_loaded: bool
    version: str

class ModelInfoSchema(BaseModel):
    loaded: bool
    model_name: Optional[str] = None
    target: Optional[str] = None
    training_samples: Optional[int] = None
    test_samples: Optional[int] = None
    accuracy: Optional[float] = None
    macro_f1: Optional[float] = None

class ModelsStatusResponseSchema(BaseModel):
    cpu: ModelInfoSchema
    memory: ModelInfoSchema
    response: ModelInfoSchema

class ModelsMetricsResponseSchema(BaseModel):
    cpu: Dict[str, Any]
    memory: Dict[str, Any]
    response: Dict[str, Any]
