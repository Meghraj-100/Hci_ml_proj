from typing import Dict, Any
from backend.app.schemas.workload import WorkloadInputRequest
from backend.app.schemas.recommendation import RecommendResponseSchema
from backend.app.services.catalog_service import catalog_service
from backend.app.services.filtering_service import filtering_service
from backend.app.services.feature_service import feature_service
from backend.app.ml.inference import batch_inference_engine
from backend.app.services.ranking_service import ranking_service
from backend.app.core.logging import logger

class RecommendationService:
    @staticmethod
    def process_recommendation_request(workload: WorkloadInputRequest) -> RecommendResponseSchema:
        logger.info(f"Received recommendation request for workload: jobs/min={workload.jobs_per_minute}, budget={workload.max_price}")

        # 1. Catalog loading
        all_servers = catalog_service.get_all_servers()
        total_servers = len(all_servers)

        # Check budget underflow scenario (where budget is lower than cheapest server in catalog)
        lowest_catalog_price = min(s["monthly_price_inr"] for s in all_servers) if all_servers else 0
        if workload.max_price and workload.max_price > 0 and workload.max_price < lowest_catalog_price:
            logger.info(f"Requested budget ₹{workload.max_price} is below lowest catalog price ₹{lowest_catalog_price}")
            return RecommendResponseSchema(
                success=False,
                recommendations=[],
                totalCandidatesEvaluated=total_servers,
                filteredOutCount=total_servers,
                cheapestSuitablePrice=lowest_catalog_price,
                emptyStateReason=f"Your maximum budget of ₹{int(workload.max_price):,}/month is below the minimum viable server configuration in the catalog (₹{int(lowest_catalog_price):,}/month)."
            )

        # 2. Candidate Filtering
        eligible_servers, filter_meta = filtering_service.filter_candidates(all_servers, workload)

        if not eligible_servers:
            logger.warning("No candidate servers satisfied the specified constraints.")
            return RecommendResponseSchema(
                success=False,
                recommendations=[],
                totalCandidatesEvaluated=total_servers,
                filteredOutCount=total_servers,
                cheapestSuitablePrice=lowest_catalog_price,
                emptyStateReason="No cloud servers satisfy all of your selected filter constraints (provider, region, minimum RAM, or budget). Please relax constraints."
            )

        # 3. Feature Engineering (F1 - F9 matrix)
        feature_matrix = feature_service.construct_feature_matrix(workload, eligible_servers)

        # 4. Batch ML Inference
        predictions = batch_inference_engine.predict_batch(feature_matrix)

        # 5. Recommendation Engine & Deterministic Ranking
        recommendations, compromise_explanation = ranking_service.rank_and_select_top3(
            eligible_servers, predictions, workload
        )

        return RecommendResponseSchema(
            success=True,
            recommendations=recommendations,
            totalCandidatesEvaluated=total_servers,
            filteredOutCount=filter_meta["filtered_out_count"],
            compromiseExplanation=compromise_explanation
        )

recommendation_service = RecommendationService()
