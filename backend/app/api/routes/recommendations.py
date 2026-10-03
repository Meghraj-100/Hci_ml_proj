from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.workload import WorkloadInputRequest
from backend.app.schemas.recommendation import RecommendResponseSchema
from backend.app.services.recommendation_service import recommendation_service

router = APIRouter()

@router.post("/recommend", response_model=RecommendResponseSchema)
def get_recommendations(workload: WorkloadInputRequest):
    try:
        return recommendation_service.process_recommendation_request(workload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal error occurred during recommendation processing: {str(e)}"
        )
