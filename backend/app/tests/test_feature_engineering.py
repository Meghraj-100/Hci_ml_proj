import pytest
from backend.app.schemas.workload import WorkloadInputRequest
from backend.app.services.feature_service import feature_service

def test_feature_vector_construction():
    workload = WorkloadInputRequest(
        jobs_per_minute=5000,
        jobs_per_5_minutes=24000,
        jobs_per_15_minutes=58000,
        avg_receive_kbps=120,
        avg_transmit_kbps=80,
        provider="AWS",
        region="ap-south-1 (India)",
        priority="balanced"
    )

    candidate = {
        "id": "test-server",
        "provider": "AWS",
        "instance_name": "m7i.xlarge",
        "vcpu": 4,
        "memory_gb": 16,
        "storage_gb": 200,
        "cpu_speed_ghz": 3.2,
        "network_tier": "Up to 12.5 Gbps",
        "monthly_price_inr": 7850,
        "region": "ap-south-1 (India)"
    }

    df = feature_service.construct_feature_matrix(workload, [candidate])

    assert len(df) == 1
    row = df.iloc[0].tolist()

    # Exact expected feature ordering: [F1, F2, F3, F4, F5, F6, F7, F8, F9]
    expected = [5000.0, 24000.0, 58000.0, 16.0, 200.0, 4.0, 3.2, 120.0, 80.0]
    assert row == expected
