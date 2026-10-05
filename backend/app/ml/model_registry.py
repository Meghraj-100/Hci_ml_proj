import os
import json
import joblib
from typing import Dict, Any, Optional
from backend.app.core.config import settings
from backend.app.core.logging import logger

class ModelRegistry:
    def __init__(self, models_dir: Optional[str] = None):
        self.models_dir = models_dir or settings.MODELS_DIR
        self.models: Dict[str, Any] = {}
        self.metadata: Dict[str, Any] = {}
        self.is_loaded = False
        self.load_all_models()

    def load_all_models(self):
        targets = ["cpu", "memory", "response"]
        all_ok = True

        for target in targets:
            target_dir = os.path.join(self.models_dir, target)
            model_path = os.path.join(target_dir, "model.joblib")
            metadata_path = os.path.join(target_dir, "metadata.json")

            if os.path.exists(model_path) and os.path.exists(metadata_path):
                try:
                    self.models[target] = joblib.load(model_path)
                    with open(metadata_path, "r") as f:
                        self.metadata[target] = json.load(f)
                    logger.info(f"Loaded {target.upper()} ML model ({self.metadata[target]['selected_model']})")
                except Exception as e:
                    logger.error(f"Failed loading {target} model: {e}")
                    all_ok = False
            else:
                logger.warning(f"Model or metadata missing for target: {target}")
                all_ok = False

        self.is_loaded = all_ok

    def get_model(self, target: str):
        return self.models.get(target)

    def get_metadata(self, target: str) -> Optional[Dict[str, Any]]:
        return self.metadata.get(target)

    def get_status(self) -> Dict[str, Any]:
        targets = ["cpu", "memory", "response"]
        status = {}
        for target in targets:
            meta = self.metadata.get(target, {})
            status[target] = {
                "loaded": target in self.models,
                "model": meta.get("selected_model", "Unknown"),
                "target": target,
                "training_samples": meta.get("training_samples"),
                "test_samples": meta.get("test_samples"),
                "accuracy": meta.get("metrics", {}).get("accuracy"),
                "macro_f1": meta.get("metrics", {}).get("f1_macro"),
            }
        return status

    def get_metrics(self) -> Dict[str, Any]:
        return {
            "cpu": self.metadata.get("cpu", {}),
            "memory": self.metadata.get("memory", {}),
            "response": self.metadata.get("response", {}),
        }

model_registry = ModelRegistry()
