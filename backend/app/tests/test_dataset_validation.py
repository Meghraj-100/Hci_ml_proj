import os
import pytest
from ml_pipeline.common import DATASET_PATHS, RAW_FEATURE_COLUMNS, TARGET_COLUMN, load_dataset

def test_dataset_files_exist():
    for target, paths in DATASET_PATHS.items():
        assert os.path.exists(paths['train']), f"Train dataset missing for {target}"
        assert os.path.exists(paths['test']), f"Test dataset missing for {target}"

def test_dataset_loading_and_features():
    for target, paths in DATASET_PATHS.items():
        X_train, y_train = load_dataset(paths['train'])
        X_test, y_test = load_dataset(paths['test'])

        assert len(X_train) > 0
        assert len(X_test) > 0
        assert len(X_train.columns) == 9
        assert len(X_test.columns) == 9

        # No NaNs
        assert X_train.isna().sum().sum() == 0
        assert X_test.isna().sum().sum() == 0

        # Target non-empty
        assert len(y_train) == len(X_train)
        assert len(y_test) == len(X_test)
