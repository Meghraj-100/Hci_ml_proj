import pytest
import numpy as np
import pandas as pd
from backend.app.ml.model_registry import model_registry
from backend.app.ml.inference import batch_inference_engine
from ml_pipeline.common import FEATURE_NAMES

def test_models_are_loaded():
    model_registry.load_all_models()
    assert model_registry.is_loaded
    assert model_registry.get_model("cpu") is not None
    assert model_registry.get_model("memory") is not None
    assert model_registry.get_model("response") is not None

def test_batch_prediction_output():
    model_registry.load_all_models()
    
    # Create sample 2x9 feature matrix
    data = [
        [5000, 24000, 58000, 16, 200, 4, 3.2, 120, 80],
        [1000, 4000, 12000, 4, 50, 2, 2.5, 50, 30]
    ]
    df = pd.DataFrame(data, columns=FEATURE_NAMES)
    
    preds = batch_inference_engine.predict_batch(df)
    
    assert "cpu" in preds
    assert "memory" in preds
    assert "response" in preds
    
    assert len(preds["cpu"]) == 2
    assert len(preds["memory"]) == 2
    assert len(preds["response"]) == 2
    
    valid_classes = {"Very Low", "Low", "Medium", "High"}
    for p in preds["cpu"] + preds["memory"] + preds["response"]:
        assert p in valid_classes
