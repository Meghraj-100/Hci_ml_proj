import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_pipeline.common import DATASET_PATHS, BASE_DIR
from ml_pipeline.train_model import train_and_evaluate_target

def train_cpu_model():
    train_path = DATASET_PATHS['cpu']['train']
    test_path = DATASET_PATHS['cpu']['test']
    save_dir = os.path.join(BASE_DIR, 'backend', 'app', 'models', 'cpu')
    return train_and_evaluate_target('cpu', train_path, test_path, save_dir)

if __name__ == '__main__':
    train_cpu_model()
