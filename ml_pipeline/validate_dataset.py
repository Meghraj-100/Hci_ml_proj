import sys
import os
import json
import pandas as pd
import numpy as np

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_pipeline.common import DATASET_PATHS, RAW_FEATURE_COLUMNS, TARGET_COLUMN, FEATURE_NAMES, VALID_CLASSES, clean_label


class DatasetValidator:
    def __init__(self, model_name: str, train_path: str, test_path: str):
        self.model_name = model_name
        self.train_path = train_path
        self.test_path = test_path
        self.report = {}
        self.errors = []
        self.warnings = []

    def validate(self) -> dict:
        print(f"==================================================")
        print(f"VALIDATING DATASETS FOR {self.model_name.upper()}")
        print(f"Train: {self.train_path}")
        print(f"Test:  {self.test_path}")
        print(f"==================================================")

        train_raw = pd.read_excel(self.train_path)
        test_raw = pd.read_excel(self.test_path)

        train_report = self._inspect_file(train_raw, "train")
        test_report = self._inspect_file(test_raw, "test")

        # Compatibility check
        compatibility = self._check_compatibility(train_raw, test_raw)

        passed = len(self.errors) == 0

        self.report = {
            "model_name": self.model_name,
            "status": "PASS" if passed else "FAIL",
            "train_report": train_report,
            "test_report": test_report,
            "compatibility": compatibility,
            "errors": self.errors,
            "warnings": self.warnings
        }

        self.print_summary()
        return self.report

    def _inspect_file(self, df: pd.DataFrame, file_type: str) -> dict:
        info = {}
        info["rows"] = len(df)
        info["cols"] = len(df.columns)

        # 1 & 2: Required columns
        missing_feats = [col for col in RAW_FEATURE_COLUMNS if col not in df.columns]
        if missing_feats:
            self.errors.append(f"{file_type}: Missing feature columns: {missing_feats}")

        if TARGET_COLUMN not in df.columns:
            self.errors.append(f"{file_type}: Missing target column '{TARGET_COLUMN}'")

        # 3: Feature order
        actual_first_9 = list(df.columns[:9])
        if actual_first_9 != RAW_FEATURE_COLUMNS:
            self.warnings.append(f"{file_type}: First 9 columns do not exactly match expected order.")

        # 4: Numeric check
        non_numeric = []
        for col in RAW_FEATURE_COLUMNS:
            if col in df.columns:
                if not pd.api.types.is_numeric_dtype(df[col]):
                    non_numeric.append(col)
        if non_numeric:
            self.errors.append(f"{file_type}: Non-numeric feature columns: {non_numeric}")

        # 5: Missing values
        missing_count = int(df.isnull().sum().sum())
        info["missing_values"] = missing_count
        if missing_count > 0:
            self.errors.append(f"{file_type}: Dataset contains {missing_count} missing values.")

        # 6: Infinite values
        numeric_df = df.select_dtypes(include=[np.number])
        inf_count = int(np.isinf(numeric_df).sum().sum())
        info["infinite_values"] = inf_count
        if inf_count > 0:
            self.errors.append(f"{file_type}: Dataset contains {inf_count} infinite values.")

        # 7: Duplicate rows
        duplicates = int(df.duplicated().sum())
        info["duplicate_rows"] = duplicates

        # 8, 9, 12: Target check and class distribution
        if TARGET_COLUMN in df.columns:
            cleaned_target = df[TARGET_COLUMN].apply(clean_label)
            class_dist = cleaned_target.value_counts().to_dict()
            info["class_distribution"] = class_dist

            unexpected = set(class_dist.keys()) - set(VALID_CLASSES)
            if unexpected:
                self.errors.append(f"{file_type}: Unexpected target classes found: {unexpected}")

        # 13: Target leakage (check if target is identical to any feature)
        for col in RAW_FEATURE_COLUMNS:
            if col in df.columns and TARGET_COLUMN in df.columns:
                if (df[col].astype(str) == df[TARGET_COLUMN].astype(str)).all():
                    self.errors.append(f"{file_type}: Target leakage detected in column {col}")

        return info

    def _check_compatibility(self, train_df: pd.DataFrame, test_df: pd.DataFrame) -> dict:
        comp = {}
        # Feature columns match
        train_cols = [c for c in train_df.columns if c in RAW_FEATURE_COLUMNS]
        test_cols = [c for c in test_df.columns if c in RAW_FEATURE_COLUMNS]

        comp["features_match"] = train_cols == test_cols
        if not comp["features_match"]:
            self.errors.append("Train and test feature columns do not match in order or names.")

        # Target classes match
        train_target = set(train_df[TARGET_COLUMN].apply(clean_label).unique())
        test_target = set(test_df[TARGET_COLUMN].apply(clean_label).unique())

        comp["train_classes"] = list(train_target)
        comp["test_classes"] = list(test_target)
        comp["classes_subset"] = test_target.issubset(train_target)

        if not comp["classes_subset"]:
            self.errors.append(f"Test classes {test_target} are not a subset of train classes {train_target}")

        return comp

    def print_summary(self):
        print(f"Status: {self.report['status']}")
        print(f"Train samples: {self.report['train_report']['rows']}, Test samples: {self.report['test_report']['rows']}")
        print("Train Class Distribution:", self.report['train_report'].get('class_distribution'))
        print("Test Class Distribution:", self.report['test_report'].get('class_distribution'))
        if self.errors:
            print("ERRORS:", self.errors)
        if self.warnings:
            print("WARNINGS:", self.warnings)
        print("\n")


def validate_all_datasets() -> bool:
    all_reports = {}
    all_passed = True

    for model_name, paths in DATASET_PATHS.items():
        validator = DatasetValidator(model_name, paths['train'], paths['test'])
        report = validator.validate()
        all_reports[model_name] = report
        if report['status'] != 'PASS':
            all_passed = False

    return all_passed, all_reports


if __name__ == '__main__':
    passed, reports = validate_all_datasets()
    if not passed:
        print("Validation FAILED. See errors above.")
        sys.exit(1)
    else:
        print("All dataset validations PASSED successfully!")
