import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_pipeline.common import DATASET_PATHS, BASE_DIR
from ml_pipeline.train_model import train_and_evaluate_target

def train_memory_model():
    train_path = DATASET_PATHS['memory']['train']
    test_path = DATASET_PATHS['memory']['test']
    save_dir = os.path.join(BASE_DIR, 'backend', 'app', 'models', 'memory')
    return train_and_evaluate_target('memory', train_path, test_path, save_dir)

if __name__ == '__main__':
    train_memory_model()
