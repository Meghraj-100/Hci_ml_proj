import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_full_pipeline_end_to_end():
    # 1. Health check
    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"

    # 2. Get server catalog
    cat_res = client.get("/api/catalog")
    assert cat_res.status_code == 200
    catalog = cat_res.json()
    assert len(catalog) >= 14

    # 3. Submit Frontend Workload Request
    workload_payload = {
        "jobs_per_minute": 5000,
        "jobs_per_5_minutes": 24000,
        "jobs_per_15_minutes": 58000,
        "avg_receive_kbps": 120,
        "avg_transmit_kbps": 80,
        "provider": "all",
        "region": "ap-south-1 (India)",
        "max_price": 20000,
        "priority": "balanced",
        "min_ram_gb": None
    }

    rec_res = client.post("/api/recommend", json=workload_payload)
    assert rec_res.status_code == 200
    data = rec_res.json()

    assert data["success"] is True
    assert len(data["recommendations"]) == 3
    assert data["totalCandidatesEvaluated"] == len(catalog)

    # Check top recommendations fields
    for item in data["recommendations"]:
        assert item["category"] in ["balanced", "cheapest", "performance"]
        assert 0 <= item["suitabilityScore"] <= 100
        assert "cpuUtilization" in item["predictedPerformance"]
        assert "memoryUtilization" in item["predictedPerformance"]
        assert "responseTime" in item["predictedPerformance"]
        assert len(item["rationale"]) > 0
        assert len(item["advantages"]) > 0
        assert len(item["tradeoffs"]) > 0
