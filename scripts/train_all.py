import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_pipeline.train_cpu import train_cpu_model
from ml_pipeline.train_memory import train_memory_model
from ml_pipeline.train_response import train_response_model
from ml_pipeline.evaluate import evaluate_all

if __name__ == '__main__':
    print("Starting training of all 3 ML models...")
    train_cpu_model()
    train_memory_model()
    train_response_model()
    evaluate_all()
    print("All models trained and evaluated successfully!")
