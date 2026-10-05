import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_pipeline.evaluate import evaluate_all

if __name__ == '__main__':
    evaluate_all()
