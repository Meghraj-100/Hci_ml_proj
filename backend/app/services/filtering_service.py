from typing import List, Dict, Any, Tuple
from backend.app.schemas.workload import WorkloadInputRequest
from backend.app.core.logging import logger

class FilteringService:
    @staticmethod
    def filter_candidates(
        catalog: List[Dict[str, Any]],
        workload: WorkloadInputRequest
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Filters the server catalog based on user workload preferences:
        - provider
        - region
        - max_price
        - min_ram_gb

        Returns: (eligible_servers, filtering_metadata)
        """
        total = len(catalog)
        candidates = catalog.copy()

        # Provider filter
        if workload.provider and workload.provider != "all":
            candidates = [s for s in candidates if s["provider"] == workload.provider]

        # Region filter (match exact or default)
        if workload.region and workload.region != "all":
            reg_cand = [s for s in candidates if s["region"] == workload.region or "ap-south-1" in s["region"]]
            if reg_cand:
                candidates = reg_cand

        # Min RAM filter
        if workload.min_ram_gb and workload.min_ram_gb > 0:
            candidates = [s for s in candidates if s["memory_gb"] >= workload.min_ram_gb]

        # Budget filter
        if workload.max_price and workload.max_price > 0:
            candidates = [s for s in candidates if s["monthly_price_inr"] <= workload.max_price]

        filtered_out = total - len(candidates)
        logger.info(f"Filtering complete: {len(candidates)} / {total} candidates eligible ({filtered_out} filtered out).")

        meta = {
            "total_candidates": total,
            "eligible_count": len(candidates),
            "filtered_out_count": filtered_out
        }

        return candidates, meta

filtering_service = FilteringService()
