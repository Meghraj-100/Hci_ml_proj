from typing import List, Dict, Any, Tuple, Optional
import math
from backend.app.schemas.workload import WorkloadInputRequest, PerformancePriority
from backend.app.schemas.recommendation import RecommendationItemSchema, ServerSpecificationSchema
from backend.app.core.logging import logger

CPU_SCORES = {'Very Low': 90, 'Low': 95, 'Medium': 85, 'High': 40}
MEM_SCORES = {'Very Low': 90, 'Low': 95, 'Medium': 80, 'High': 35}
RESP_SCORES = {'Very Low': 98, 'Low': 92, 'Medium': 75, 'High': 30}

CPU_DESCRIPTIONS = {
    'Very Low': 'Minimal CPU utilization; abundant compute reserves available.',
    'Low': 'Low CPU utilization with predictable compute guarantees.',
    'Medium': 'Comfortable headroom for peak intervals; no throttling risk.',
    'High': 'Approaching server CPU capacity during burst periods; close monitoring advised.'
}

MEM_DESCRIPTIONS = {
    'Very Low': 'Immense memory overhead headroom for heavy in-memory state.',
    'Low': 'Sufficient buffer for resident memory and cache spikes.',
    'Medium': 'Adequate for baseline memory footprint, but limited headroom.',
    'High': 'High memory utilization; risk of out-of-memory under traffic spikes.'
}

RESP_DESCRIPTIONS = {
    'Very Low': 'Sub-millisecond compute turnaround with zero request queuing.',
    'Low': 'Low expected latency with predictable compute guarantees.',
    'Medium': 'Acceptable latency under normal traffic; may experience minor queuing under load.',
    'High': 'Elevated response time expected due to request queuing under peak load.'
}

class RankingService:
    @staticmethod
    def calculate_suitability_score(
        cpu_class: str,
        mem_class: str,
        resp_class: str,
        server_price: float,
        max_budget: float,
        priority: PerformancePriority,
        min_catalog_price: float
    ) -> int:
        """
        Calculates a deterministic suitability score between 0 and 100.
        
        Formula:
        Base Performance = 0.35 * CPU_Score + 0.35 * Mem_Score + 0.30 * Resp_Score
        Price Factor = Budget & cost suitability score
        Priority Weights:
          - balanced: 0.60 * Perf + 0.40 * Price - Overprovisioning_Penalty
          - cheapest: 0.25 * Perf + 0.75 * Price
          - performance: 0.85 * Perf + 0.15 * Price
        """
        perf_score = (
            0.35 * CPU_SCORES.get(cpu_class, 50) +
            0.35 * MEM_SCORES.get(mem_class, 50) +
            0.30 * RESP_SCORES.get(resp_class, 50)
        )

        effective_budget = max_budget if (max_budget and max_budget > 0) else 50000.0
        
        if server_price <= effective_budget:
            # Reward cost-efficiency within budget
            price_score = 100.0 - (server_price / effective_budget) * 35.0
        else:
            # Over-budget penalty
            over_ratio = (server_price - effective_budget) / effective_budget
            price_score = max(0.0, 60.0 - over_ratio * 100.0)

        # Over-provisioning penalty: If all classes are Very Low and price is > 3x min price
        overprovision_penalty = 0.0
        if cpu_class == 'Very Low' and mem_class == 'Very Low' and resp_class == 'Very Low':
            if server_price > min_catalog_price * 3.0:
                overprovision_penalty = 12.0

        if priority == 'cheapest':
            raw_score = 0.25 * perf_score + 0.75 * price_score
        elif priority == 'performance':
            raw_score = 0.85 * perf_score + 0.15 * price_score
        else: # balanced
            raw_score = 0.60 * perf_score + 0.40 * price_score - overprovision_penalty

        score = max(0, min(100, round(raw_score)))
        return int(score)

    @classmethod
    def rank_and_select_top3(
        cls,
        candidate_servers: List[Dict[str, Any]],
        predictions: Dict[str, List[str]],
        workload: WorkloadInputRequest
    ) -> Tuple[List[RecommendationItemSchema], Optional[str]]:
        """
        Ranks all evaluated servers and selects the Top 3 distinct recommendations:
        1. Best Balanced
        2. Cheapest Suitable
        3. Best Performance
        """
        if not candidate_servers:
            return [], None

        min_catalog_price = min(s["monthly_price_inr"] for s in candidate_servers)
        max_budget = workload.max_price if workload.max_price and workload.max_price > 0 else float('inf')

        evaluated_list = []

        for i, server in enumerate(candidate_servers):
            cpu_cls = predictions["cpu"][i]
            mem_cls = predictions["memory"][i]
            resp_cls = predictions["response"][i]

            score = cls.calculate_suitability_score(
                cpu_cls, mem_cls, resp_cls,
                server["monthly_price_inr"],
                max_budget if max_budget != float('inf') else 50000.0,
                workload.priority,
                min_catalog_price
            )

            # Check if server is suitable (not severely overloaded)
            is_suitable = (cpu_cls != 'High' and mem_cls != 'High')

            evaluated_list.append({
                "server": server,
                "cpu_cls": cpu_cls,
                "mem_cls": mem_cls,
                "resp_cls": resp_cls,
                "score": score,
                "is_suitable": is_suitable,
                "price": server["monthly_price_inr"],
                "vcpu": server["vcpu"],
                "memory_gb": server["memory_gb"],
            })

        # 1. Best Balanced Selection
        balanced_candidates = sorted(evaluated_list, key=lambda x: x["score"], reverse=True)
        best_balanced_item = balanced_candidates[0]

        # 2. Cheapest Suitable Selection
        suitable_items = [x for x in evaluated_list if x["is_suitable"]]
        if not suitable_items:
            suitable_items = evaluated_list # fallback if none strictly suitable
        cheapest_items = sorted(suitable_items, key=lambda x: x["price"])
        
        # Ensure distinct server if possible
        best_cheapest_item = cheapest_items[0]
        if best_cheapest_item["server"]["id"] == best_balanced_item["server"]["id"] and len(cheapest_items) > 1:
            best_cheapest_item = cheapest_items[1]

        # 3. Best Performance Selection
        perf_sorted = sorted(evaluated_list, key=lambda x: (
            -CPU_SCORES.get(x["cpu_cls"], 0),
            -MEM_SCORES.get(x["mem_cls"], 0),
            -RESP_SCORES.get(x["resp_cls"], 0),
            -x["vcpu"],
            -x["memory_gb"]
        ))
        best_perf_item = perf_sorted[0]
        if best_perf_item["server"]["id"] in [best_balanced_item["server"]["id"], best_cheapest_item["server"]["id"]] and len(perf_sorted) > 1:
            for item in perf_sorted:
                if item["server"]["id"] not in [best_balanced_item["server"]["id"], best_cheapest_item["server"]["id"]]:
                    best_perf_item = item
                    break

        # Construct Compromise Explanation if applicable
        compromise_explanation = None
        if workload.min_ram_gb and workload.min_ram_gb >= 32 and workload.priority == 'cheapest':
            cheapest_ram_option = best_cheapest_item["server"]
            compromise_explanation = (
                f"Your preferred priority is 'Cheapest', but your workload specifies a {workload.min_ram_gb} GB RAM requirement. "
                f"The lowest-cost server meeting this constraint is {cheapest_ram_option['provider']} {cheapest_ram_option['instance_name']} "
                f"at ₹{cheapest_ram_option['monthly_price_inr']:,}/month."
            )

        recommendations = [
            cls._build_recommendation_item(best_balanced_item, "balanced", "BEST BALANCED", "scale"),
            cls._build_recommendation_item(best_cheapest_item, "cheapest", "CHEAPEST SUITABLE", "tag"),
            cls._build_recommendation_item(best_perf_item, "performance", "BEST PERFORMANCE", "zap"),
        ]

        return recommendations, compromise_explanation

    @staticmethod
    def _build_recommendation_item(
        item: Dict[str, Any],
        category: str,
        label: str,
        badge: str
    ) -> RecommendationItemSchema:
        s = item["server"]
        cpu_c = item["cpu_cls"]
        mem_c = item["mem_cls"]
        resp_c = item["resp_cls"]

        server_spec = ServerSpecificationSchema(
            id=s["id"],
            provider=s["provider"],
            instanceName=s["instance_name"],
            vcpu=s["vcpu"],
            memoryGB=s["memory_gb"],
            storageGB=s["storage_gb"],
            cpuSpeed=s["cpu_speed_desc"],
            networkTier=s["network_tier"],
            estimatedPricePerMonth=s["monthly_price_inr"],
            region=s["region"]
        )

        pred_perf = {
            "cpuUtilization": {
                "class": cpu_c,
                "description": CPU_DESCRIPTIONS.get(cpu_c, "Normal CPU load.")
            },
            "memoryUtilization": {
                "class": mem_c,
                "description": MEM_DESCRIPTIONS.get(mem_c, "Normal memory load.")
            },
            "responseTime": {
                "class": resp_c,
                "description": RESP_DESCRIPTIONS.get(resp_c, "Normal response time.")
            }
        }

        # Deterministic rationales and advantages
        if category == "balanced":
            rationale = f"Optimal balance of multi-core compute ({s['vcpu']} vCPU) and {s['memory_gb']} GB RAM for your workload without paying for excess unused capacity."
            advantages = [
                "Strong price-to-performance ratio for sustained application workload",
                f"Generous {s['memory_gb']} GB memory buffer minimizes out-of-memory risk",
                f"High network capacity ({s['network_tier']})"
            ]
            tradeoffs = [
                "Higher monthly cost commitment than baseline minimum option",
                "Single instance deployment requires regional failover plan"
            ]
        elif category == "cheapest":
            rationale = f"Lowest monthly expenditure (₹{s['monthly_price_inr']:,}/month) that maintains safe operational performance bounds."
            advantages = [
                "Minimal monthly financial commitment",
                f"Satisfies baseline resource constraints with {s['vcpu']} vCPU cores",
                "Straightforward vertical upgrade path as traffic expands"
            ]
            tradeoffs = [
                "Tighter compute headroom during unexpected peak traffic spikes",
                "Moderate network bandwidth tier"
            ]
        else: # performance
            rationale = f"Maximum compute clock speed ({s['cpu_speed_desc']}) and network bandwidth for demanding, low-latency workloads."
            advantages = [
                "Superior clock frequency and multi-thread compute reserves",
                f"Extensive resource overhead ({s['memory_gb']} GB RAM) prevents queueing",
                f"Highest network throughput tier ({s['network_tier']})"
            ]
            tradeoffs = [
                "Higher monthly commitment relative to lower-tier options",
                "Compute reserves may remain partially underutilized under off-peak traffic"
            ]

        return RecommendationItemSchema(
            category=category,
            categoryLabel=label,
            categoryBadge=badge,
            server=server_spec,
            suitabilityScore=item["score"],
            predictedPerformance=pred_perf,
            rationale=rationale,
            advantages=advantages,
            tradeoffs=tradeoffs
        )

ranking_service = RankingService()
