import os
import sys
import json
import datetime
import joblib
import pandas as pd
import numpy as np

import sklearn
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, ExtraTreesClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_pipeline.common import load_dataset, FEATURE_NAMES, DATASET_PATHS, BASE_DIR


def train_and_evaluate_target(target_name: str, train_path: str, test_path: str, save_dir: str):
    print(f"\n==================================================")
    print(f"TRAINING AND EVALUATING MODELS FOR: {target_name.upper()}")
    print(f"Train path: {train_path}")
    print(f"Test path:  {test_path}")
    print(f"==================================================")

    # 1. Load data
    X_train, y_train = load_dataset(train_path)
    X_test, y_test = load_dataset(test_path)

    classes = sorted(list(np.unique(np.concatenate([y_train.unique(), y_test.unique()]))))

    # Candidate algorithms
    candidates = {
        "RandomForest": Pipeline([("scaler", StandardScaler()), ("clf", RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1))]),
        "ExtraTrees": Pipeline([("scaler", StandardScaler()), ("clf", ExtraTreesClassifier(n_estimators=100, random_state=42, n_jobs=-1))]),
        "GradientBoosting": Pipeline([("scaler", StandardScaler()), ("clf", GradientBoostingClassifier(n_estimators=100, random_state=42))]),
        "DecisionTree": Pipeline([("scaler", StandardScaler()), ("clf", DecisionTreeClassifier(random_state=42))]),
        "KNN": Pipeline([("scaler", StandardScaler()), ("clf", KNeighborsClassifier(n_neighbors=5))]),
        "LogisticRegression": Pipeline([("scaler", StandardScaler()), ("clf", LogisticRegression(max_iter=1000, random_state=42))]),
        "NaiveBayes": Pipeline([("scaler", StandardScaler()), ("clf", GaussianNB())]),
    }

    results = {}
    best_model_name = None
    best_macro_f1 = -1.0
    best_pipeline = None

    for name, pipeline in candidates.items():
        print(f"Training candidate model: {name}...")
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec_macro = precision_score(y_test, y_pred, average='macro', zero_division=0)
        rec_macro = recall_score(y_test, y_pred, average='macro', zero_division=0)
        f1_macro = f1_score(y_test, y_pred, average='macro', zero_division=0)
        f1_weighted = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        cm = confusion_matrix(y_test, y_pred, labels=classes).tolist()

        metrics = {
            "algorithm": name,
            "accuracy": float(acc),
            "precision_macro": float(prec_macro),
            "recall_macro": float(rec_macro),
            "f1_macro": float(f1_macro),
            "f1_weighted": float(f1_weighted),
            "confusion_matrix": cm,
            "classes": classes
        }

        results[name] = metrics
        print(f"  {name} -> Accuracy: {acc:.4f} | Macro F1: {f1_macro:.4f} | Weighted F1: {f1_weighted:.4f}")

        # Selection criteria: highest Macro F1 (handles imbalanced classes better)
        if f1_macro > best_macro_f1:
            best_macro_f1 = f1_macro
            best_model_name = name
            best_pipeline = pipeline

    print(f"\n>>> Selected Best Model for {target_name.upper()}: {best_model_name} (Macro F1 = {best_macro_f1:.4f})")

    # 2. Save best model artifact
    os.makedirs(save_dir, exist_ok=True)
    model_path = os.path.join(save_dir, "model.joblib")
    metadata_path = os.path.join(save_dir, "metadata.json")

    joblib.dump(best_pipeline, model_path)

    metadata = {
        "target": target_name,
        "selected_model": best_model_name,
        "feature_names": FEATURE_NAMES,
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "classes": classes,
        "metrics": results[best_model_name],
        "all_candidate_metrics": results,
        "training_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "sklearn_version": sklearn.__version__
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Saved best model artifact to: {model_path}")
    print(f"Saved metadata to: {metadata_path}")

    return metadata
