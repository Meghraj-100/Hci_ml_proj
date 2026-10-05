from pydantic import BaseModel, Field

class ServerSpecificationSchema(BaseModel):
    id: str
    provider: str
    instanceName: str = Field(..., validation_alias="instance_name")
    vcpu: int
    memoryGB: float = Field(..., validation_alias="memory_gb")
    storageGB: float = Field(..., validation_alias="storage_gb")
    cpuSpeed: str = Field(..., validation_alias="cpu_speed_desc")
    networkTier: str = Field(..., validation_alias="network_tier")
    estimatedPricePerMonth: float = Field(..., validation_alias="monthly_price_inr")
    region: str

    model_config = {
        "populate_by_name": True
    }
