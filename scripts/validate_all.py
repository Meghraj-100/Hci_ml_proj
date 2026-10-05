import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_pipeline.validate_dataset import validate_all_datasets

if __name__ == '__main__':
    passed, reports = validate_all_datasets()
    if not passed:
        print("Dataset validation FAILED.")
        sys.exit(1)
    else:
        print("Dataset validation PASSED successfully.")
