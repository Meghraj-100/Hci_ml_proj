import pandas as pd
from typing import Dict, List, Any
from backend.app.ml.model_registry import model_registry
from backend.app.core.logging import logger

class BatchInferenceEngine:
    @staticmethod
    def predict_batch(feature_matrix: pd.DataFrame) -> Dict[str, List[str]]:
        """
        Executes batch predictions across all N candidates in a single vector operation.
        
        Returns:
        {
          "cpu": ["Medium", "Low", ...],
          "memory": ["Low", "Very Low", ...],
          "response": ["Low", "Medium", ...]
        }
        """
        if feature_matrix.empty:
            return {"cpu": [], "memory": [], "response": []}

        cpu_model = model_registry.get_model("cpu")
        memory_model = model_registry.get_model("memory")
        response_model = model_registry.get_model("response")

        if not (cpu_model and memory_model and response_model):
            raise RuntimeError("ML models are not fully loaded in ModelRegistry.")

        logger.info(f"Running batch ML inference for {len(feature_matrix)} candidate servers.")

        cpu_preds = cpu_model.predict(feature_matrix).tolist()
        memory_preds = memory_model.predict(feature_matrix).tolist()
        response_preds = response_model.predict(feature_matrix).tolist()

        return {
            "cpu": cpu_preds,
            "memory": memory_preds,
            "response": response_preds,
        }

batch_inference_engine = BatchInferenceEngine()
