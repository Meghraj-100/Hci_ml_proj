import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_pipeline.common import DATASET_PATHS, BASE_DIR
from ml_pipeline.train_model import train_and_evaluate_target

def train_response_model():
    train_path = DATASET_PATHS['response']['train']
    test_path = DATASET_PATHS['response']['test']
    save_dir = os.path.join(BASE_DIR, 'backend', 'app', 'models', 'response')
    return train_and_evaluate_target('response', train_path, test_path, save_dir)

if __name__ == '__main__':
    train_response_model()
