from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from backend.app.schemas.server import ServerSpecificationSchema

PerformanceClass = Literal['Very Low', 'Low', 'Medium', 'High']
CategoryBadge = Literal['scale', 'tag', 'zap']

class PerformanceMetricSchema(BaseModel):
    class_name: PerformanceClass = Field(..., alias="class")
    description: str

    model_config = {"populate_by_name": True}

class PredictedPerformanceSchema(BaseModel):
    cpuUtilization: PerformanceMetricSchema
    memoryUtilization: PerformanceMetricSchema
    responseTime: PerformanceMetricSchema

    model_config = {"populate_by_name": True}

class RecommendationItemSchema(BaseModel):
    category: str
    categoryLabel: str
    categoryBadge: CategoryBadge
    server: ServerSpecificationSchema
    suitabilityScore: int = Field(..., description="Deterministically calculated suitability score 0-100")
    predictedPerformance: PredictedPerformanceSchema
    rationale: str
    advantages: List[str]
    tradeoffs: List[str]

    model_config = {"populate_by_name": True}

class RecommendResponseSchema(BaseModel):
    success: bool
    recommendations: List[RecommendationItemSchema] = []
    totalCandidatesEvaluated: int
    filteredOutCount: int
    compromiseExplanation: Optional[str] = None
    cheapestSuitablePrice: Optional[float] = None
    emptyStateReason: Optional[str] = None

    model_config = {"populate_by_name": True}
