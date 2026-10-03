from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator

CloudProvider = Literal['all', 'AWS', 'Azure']
PerformancePriority = Literal['balanced', 'cheapest', 'performance']

class WorkloadInputRequest(BaseModel):
    # Jobs
    jobs_per_minute: float = Field(..., alias="jobs_per_minute", description="F1: Jobs in 1 minute")
    jobs_per_5_minutes: float = Field(..., alias="jobs_per_5_minutes", description="F2: Jobs in 5 minutes")
    jobs_per_15_minutes: float = Field(..., alias="jobs_per_15_minutes", description="F3: Jobs in 15 minutes")

    # Network
    avg_receive_kbps: float = Field(..., alias="avg_receive_kbps", description="F8: Average receive network activity in Kbps")
    avg_transmit_kbps: float = Field(..., alias="avg_transmit_kbps", description="F9: Average transmit network activity in Kbps")

    # Filtering & Preferences
    provider: CloudProvider = Field(default="all", description="Preferred cloud provider")
    region: str = Field(default="ap-south-1 (India)", description="Preferred region")
    max_price: Optional[float] = Field(default=None, description="Maximum monthly budget in INR")
    priority: PerformancePriority = Field(default="balanced", description="Optimization priority")
    min_ram_gb: Optional[float] = Field(default=None, description="Minimum RAM capacity required in GB")

    @field_validator("jobs_per_minute", "jobs_per_5_minutes", "jobs_per_15_minutes", "avg_receive_kbps", "avg_transmit_kbps")
    @classmethod
    def validate_non_negative(cls, v: float, info) -> float:
        if v < 0:
            raise ValueError(f"{info.field_name} must be >= 0")
        return v

    @field_validator("max_price", "min_ram_gb")
    @classmethod
    def validate_optional_non_negative(cls, v: Optional[float], info) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError(f"{info.field_name} must be >= 0 if provided")
        return v

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "jobs_per_minute": 5000,
                "jobs_per_5_minutes": 24000,
                "jobs_per_15_minutes": 58000,
                "avg_receive_kbps": 120,
                "avg_transmit_kbps": 80,
                "provider": "AWS",
                "region": "ap-south-1 (India)",
                "max_price": 10000,
                "priority": "balanced",
                "min_ram_gb": 8
            }
        }
    }
