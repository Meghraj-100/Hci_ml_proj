import pytest
from backend.app.schemas.workload import WorkloadInputRequest
from backend.app.services.ranking_service import ranking_service

def test_suitability_score_bounds():
    score = ranking_service.calculate_suitability_score(
        cpu_class='Medium',
        mem_class='Low',
        resp_class='Low',
        server_price=7850,
        max_budget=10000,
        priority='balanced',
        min_catalog_price=1250
    )
    assert 0 <= score <= 100

def test_ranking_categories():
    workload = WorkloadInputRequest(
        jobs_per_minute=5000, jobs_per_5_minutes=24000, jobs_per_15_minutes=58000,
        avg_receive_kbps=120, avg_transmit_kbps=80, priority="balanced"
    )

    candidates = [
        {"id": "s1", "provider": "AWS", "instance_name": "t4g.small", "vcpu": 2, "memory_gb": 2, "storage_gb": 30, "cpu_speed_desc": "2.5 GHz", "network_tier": "Low", "monthly_price_inr": 1250, "region": "ap-south-1"},
        {"id": "s2", "provider": "AWS", "instance_name": "m7i.xlarge", "vcpu": 4, "memory_gb": 16, "storage_gb": 200, "cpu_speed_desc": "3.2 GHz", "network_tier": "High", "monthly_price_inr": 7850, "region": "ap-south-1"},
        {"id": "s3", "provider": "AWS", "instance_name": "c7i.2xlarge", "vcpu": 8, "memory_gb": 16, "storage_gb": 250, "cpu_speed_desc": "3.8 GHz", "network_tier": "High", "monthly_price_inr": 12900, "region": "ap-south-1"},
    ]

    preds = {
        "cpu": ["High", "Medium", "Low"],
        "memory": ["High", "Low", "Very Low"],
        "response": ["Medium", "Low", "Very Low"]
    }

    recs, note = ranking_service.rank_and_select_top3(candidates, preds, workload)

    assert len(recs) == 3
    categories = [r.category for r in recs]
    assert "balanced" in categories
    assert "cheapest" in categories
    assert "performance" in categories
