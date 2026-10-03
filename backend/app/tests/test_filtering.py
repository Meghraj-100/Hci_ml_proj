import pytest
from backend.app.schemas.workload import WorkloadInputRequest
from backend.app.services.filtering_service import filtering_service

MOCK_CATALOG = [
    {"id": "aws-1", "provider": "AWS", "region": "ap-south-1 (India)", "memory_gb": 8, "monthly_price_inr": 3000},
    {"id": "aws-2", "provider": "AWS", "region": "ap-south-1 (India)", "memory_gb": 16, "monthly_price_inr": 7000},
    {"id": "azure-1", "provider": "Azure", "region": "ap-south-1 (India)", "memory_gb": 16, "monthly_price_inr": 7500},
    {"id": "azure-2", "provider": "Azure", "region": "us-east-1 (US)", "memory_gb": 32, "monthly_price_inr": 15000},
]

def test_filtering_provider():
    workload = WorkloadInputRequest(
        jobs_per_minute=100, jobs_per_5_minutes=500, jobs_per_15_minutes=1500,
        avg_receive_kbps=10, avg_transmit_kbps=10, provider="AWS"
    )
    res, _ = filtering_service.filter_candidates(MOCK_CATALOG, workload)
    assert all(s["provider"] == "AWS" for s in res)
    assert len(res) == 2

def test_filtering_budget():
    workload = WorkloadInputRequest(
        jobs_per_minute=100, jobs_per_5_minutes=500, jobs_per_15_minutes=1500,
        avg_receive_kbps=10, avg_transmit_kbps=10, max_price=5000
    )
    res, _ = filtering_service.filter_candidates(MOCK_CATALOG, workload)
    assert all(s["monthly_price_inr"] <= 5000 for s in res)
    assert len(res) == 1
    assert res[0]["id"] == "aws-1"

def test_filtering_min_ram():
    workload = WorkloadInputRequest(
        jobs_per_minute=100, jobs_per_5_minutes=500, jobs_per_15_minutes=1500,
        avg_receive_kbps=10, avg_transmit_kbps=10, min_ram_gb=16, region="all"
    )
    res, _ = filtering_service.filter_candidates(MOCK_CATALOG, workload)
    assert all(s["memory_gb"] >= 16 for s in res)
    assert len(res) == 3
