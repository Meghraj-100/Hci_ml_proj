import os
import re
import pandas as pd
import numpy as np

# Path configurations relative to project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

DATASET_PATHS = {
    'cpu': {
        'train': os.path.join(DATA_DIR, 'train', 'mmc5.xlsx'),
        'test': os.path.join(DATA_DIR, 'test', 'mmc2.xlsx'),
    },
    'memory': {
        'train': os.path.join(DATA_DIR, 'train', 'mmc6.xlsx'),
        'test': os.path.join(DATA_DIR, 'test', 'mmc3.xlsx'),
    },
    'response': {
        'train': os.path.join(DATA_DIR, 'train', 'mmc7.xlsx'),
        'test': os.path.join(DATA_DIR, 'test', 'mmc4.xlsx'),
    },
}

# Raw column names found in the Excel files
RAW_FEATURE_COLUMNS = [
    'Jobs_per_ 1Minute',
    'Jobs_per_ 5 Minutes',
    'Jobs_per_ 15Minutes',
    'Mem capacity',
    'Disk_capacity_GB',
    'Num_of_CPU_Cores',
    'CPU_speed_per_Core',
    'Avg_Recieve_Kbps',
    'Avg_Transmit_Kbps',
]

TARGET_COLUMN = 'Class_Name'

# Clean feature names for F1 through F9
FEATURE_NAMES = [
    'F1_Jobs_1Min',
    'F2_Jobs_5Min',
    'F3_Jobs_15Min',
    'F4_Mem_GB',
    'F5_Disk_GB',
    'F6_Num_CPU',
    'F7_CPU_Speed',
    'F8_Avg_Receive_Kbps',
    'F9_Avg_Transmit_Kbps',
]

# Explicit Label Standardization Configuration
LABEL_MAPPING = {
    # Response Time 'Very High' represents high response time / latency
    'Very High': 'High',
    'VERY HIGH': 'High',
    'Very Low': 'Very Low',
    'VERY LOW': 'Very Low',
    'Low': 'Low',
    'LOW': 'Low',
    'Medium': 'Medium',
    'MEDIUM': 'Medium',
    'High': 'High',
    'HIGH': 'High',
}

VALID_CLASSES = ['Very Low', 'Low', 'Medium', 'High']


def clean_label(val: str) -> str:
    """Clean string label by stripping quotes and whitespace."""
    if not isinstance(val, str):
        val = str(val)
    val = val.strip().strip("'").strip('"').strip()
    return LABEL_MAPPING.get(val, val)


def load_dataset(file_path: str):
    """
    Load an Excel dataset, rename raw feature columns to clean names F1-F9,
    and sanitize the target label column.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file not found at: {file_path}")

    df = pd.read_excel(file_path)

    # Check required columns
    for col in RAW_FEATURE_COLUMNS:
        if col not in df.columns:
            raise KeyError(f"Missing required feature column '{col}' in {file_path}")
    if TARGET_COLUMN not in df.columns:
        raise KeyError(f"Missing target column '{TARGET_COLUMN}' in {file_path}")

    # Select and rename features
    feature_df = df[RAW_FEATURE_COLUMNS].copy()
    feature_df.columns = FEATURE_NAMES

    # Ensure numeric types
    for col in FEATURE_NAMES:
        feature_df[col] = pd.to_numeric(feature_df[col], errors='coerce')

    # Clean target
    target_series = df[TARGET_COLUMN].apply(clean_label)

    return feature_df, target_series
