import os
import sys
import time
import json
import pandas as pd
from typing import List, Dict, Any

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.schemas.workload import WorkloadInputRequest
from backend.app.services.catalog_service import catalog_service
from backend.app.services.feature_service import feature_service
from backend.app.ml.model_registry import model_registry
from backend.app.ml.inference import batch_inference_engine
from backend.app.services.ranking_service import ranking_service

def run_performance_benchmark():
    print("==================================================")
    print("RUNNING BATCH RECOMMENDATION PERFORMANCE BENCHMARK")
    print("==================================================")

    model_registry.load_all_models()
    base_servers = catalog_service.get_all_servers()

    if not base_servers:
        print("Error: Catalog empty!")
        return

    workload = WorkloadInputRequest(
        jobs_per_minute=5000,
        jobs_per_5_minutes=24000,
        jobs_per_15_minutes=58000,
        avg_receive_kbps=120,
        avg_transmit_kbps=80,
        provider="all",
        priority="balanced"
    )

    sizes = [10, 100, 500, 1000]
    results = []

    for size in sizes:
        # Replicate candidate servers to reach target candidate count
        candidates = []
        for i in range(size):
            s = base_servers[i % len(base_servers)].copy()
            s["id"] = f"server-{i}"
            candidates.append(s)

        # 1. Feature Engineering
        t0 = time.perf_counter()
        feature_matrix = feature_service.construct_feature_matrix(workload, candidates)
        t1 = time.perf_counter()
        feat_time = (t1 - t0) * 1000.0

        # 2. Batch ML Inference
        t2 = time.perf_counter()
        predictions = batch_inference_engine.predict_batch(feature_matrix)
        t3 = time.perf_counter()
        pred_time = (t3 - t2) * 1000.0

        # 3. Ranking & Recommendation
        t4 = time.perf_counter()
        recs, _ = ranking_service.rank_and_select_top3(candidates, predictions, workload)
        t5 = time.perf_counter()
        rank_time = (t5 - t4) * 1000.0

        total_time = feat_time + pred_time + rank_time

        res = {
            "candidate_count": size,
            "feature_construction_ms": round(feat_time, 2),
            "batch_prediction_ms": round(pred_time, 2),
            "ranking_ms": round(rank_time, 2),
            "total_recommendation_ms": round(total_time, 2),
        }
        results.append(res)

        print(f"Candidates: {size:4d} | Feat: {feat_time:6.2f}ms | Predict: {pred_time:6.2f}ms | Rank: {rank_time:6.2f}ms | Total: {total_time:6.2f}ms")

    reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
    os.makedirs(reports_dir, exist_ok=True)
    benchmark_path = os.path.join(reports_dir, "performance_benchmark.json")

    with open(benchmark_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nPerformance benchmark saved to: {benchmark_path}")
    return results

if __name__ == '__main__':
    run_performance_benchmark()
