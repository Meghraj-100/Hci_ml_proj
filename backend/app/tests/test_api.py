import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["models_loaded"] is True
    assert data["catalog_loaded"] is True

def test_catalog_endpoints():
    res = client.get("/api/catalog")
    assert res.status_code == 200
    servers = res.json()
    assert isinstance(servers, list)
    assert len(servers) > 0

    first_id = servers[0]["id"]
    res_single = client.get(f"/api/catalog/{first_id}")
    assert res_single.status_code == 200
    assert res_single.json()["id"] == first_id

def test_models_status_and_metrics():
    res_status = client.get("/api/models/status")
    assert res_status.status_code == 200
    assert res_status.json()["cpu"]["loaded"] is True

    res_metrics = client.get("/api/models/metrics")
    assert res_metrics.status_code == 200
    assert "cpu" in res_metrics.json()

def test_recommend_endpoint_valid():
    payload = {
        "jobs_per_minute": 5000,
        "jobs_per_5_minutes": 24000,
        "jobs_per_15_minutes": 58000,
        "avg_receive_kbps": 120,
        "avg_transmit_kbps": 80,
        "provider": "AWS",
        "region": "ap-south-1 (India)",
        "max_price": 10000,
        "priority": "balanced"
    }
    res = client.post("/api/recommend", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["recommendations"]) == 3
    assert data["totalCandidatesEvaluated"] > 0

def test_recommend_endpoint_invalid_negative_values():
    payload = {
        "jobs_per_minute": -5000,
        "jobs_per_5_minutes": 24000,
        "jobs_per_15_minutes": 58000,
        "avg_receive_kbps": 120,
        "avg_transmit_kbps": 80
    }
    res = client.post("/api/recommend", json=payload)
    assert res.status_code == 422

def test_recommend_endpoint_budget_underflow():
    payload = {
        "jobs_per_minute": 5000,
        "jobs_per_5_minutes": 24000,
        "jobs_per_15_minutes": 58000,
        "avg_receive_kbps": 120,
        "avg_transmit_kbps": 80,
        "max_price": 100 # Budget ₹100 is below lowest catalog price ₹1250
    }
    res = client.post("/api/recommend", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is False
    assert len(data["recommendations"]) == 0
    assert "below the minimum viable server configuration" in data["emptyStateReason"]
