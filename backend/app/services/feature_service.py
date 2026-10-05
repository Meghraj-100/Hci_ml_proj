from typing import List, Dict, Any
import numpy as np
import pandas as pd
from backend.app.schemas.workload import WorkloadInputRequest
from ml_pipeline.common import FEATURE_NAMES

class FeatureService:
    @staticmethod
    def construct_feature_matrix(
        workload: WorkloadInputRequest,
        candidate_servers: List[Dict[str, Any]]
    ) -> pd.DataFrame:
        """
        Constructs an N x 9 Pandas DataFrame for batch ML inference.
        
        Feature Order:
        F1 = jobs_per_minute
        F2 = jobs_per_5_minutes
        F3 = jobs_per_15_minutes
        F4 = memory_gb
        F5 = storage_gb
        F6 = vcpu
        F7 = cpu_speed_ghz
        F8 = avg_receive_kbps
        F9 = avg_transmit_kbps
        """
        rows = []
        for server in candidate_servers:
            row = {
                'F1_Jobs_1Min': float(workload.jobs_per_minute),
                'F2_Jobs_5Min': float(workload.jobs_per_5_minutes),
                'F3_Jobs_15Min': float(workload.jobs_per_15_minutes),
                'F4_Mem_GB': float(server.get('memory_gb', server.get('memoryGB', 4))),
                'F5_Disk_GB': float(server.get('storage_gb', server.get('storageGB', 100))),
                'F6_Num_CPU': float(server.get('vcpu', 2)),
                'F7_CPU_Speed': float(server.get('cpu_speed_ghz', 2.5)),
                'F8_Avg_Receive_Kbps': float(workload.avg_receive_kbps),
                'F9_Avg_Transmit_Kbps': float(workload.avg_transmit_kbps),
            }
            rows.append(row)

        df = pd.DataFrame(rows, columns=FEATURE_NAMES)
        return df

feature_service = FeatureService()
