import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_pipeline.common import BASE_DIR

def evaluate_all():
    models_dir = os.path.join(BASE_DIR, 'backend', 'app', 'models')
    targets = ['cpu', 'memory', 'response']

    evaluation_report = {}

    for target in targets:
        meta_file = os.path.join(models_dir, target, 'metadata.json')
        if not os.path.exists(meta_file):
            raise FileNotFoundError(f"Metadata file for {target} not found at {meta_file}. Please train models first.")
        with open(meta_file, 'r') as f:
            evaluation_report[target] = json.load(f)

    # Save JSON report
    reports_dir = os.path.join(BASE_DIR, 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    json_path = os.path.join(reports_dir, 'model_evaluation.json')

    with open(json_path, 'w') as f:
        json.dump(evaluation_report, f, indent=2)

    # Generate Markdown report
    md_path = os.path.join(reports_dir, 'model_evaluation.md')
    md_content = ["# Cloud Server Recommendation System - Model Evaluation Report\n"]

    for target, meta in evaluation_report.items():
        md_content.append(f"## Target: {target.upper()} Utilization / Response\n")
        md_content.append(f"- **Selected Algorithm**: `{meta['selected_model']}`")
        md_content.append(f"- **Training Samples**: {meta['training_samples']}")
        md_content.append(f"- **Test Samples**: {meta['test_samples']}")
        md_content.append(f"- **Classes**: `{meta['classes']}`\n")

        md_content.append("### Candidate Algorithm Comparison\n")
        md_content.append("| Algorithm | Accuracy | Precision (Macro) | Recall (Macro) | Macro F1 | Weighted F1 |")
        md_content.append("| :--- | :---: | :---: | :---: | :---: | :---: |")

        for algo, metrics in meta['all_candidate_metrics'].items():
            is_best = " **(Selected)**" if algo == meta['selected_model'] else ""
            md_content.append(
                f"| `{algo}`{is_best} | {metrics['accuracy']:.4f} | {metrics['precision_macro']:.4f} | "
                f"{metrics['recall_macro']:.4f} | {metrics['f1_macro']:.4f} | {metrics['f1_weighted']:.4f} |"
            )

        md_content.append(f"\n### Confusion Matrix for Best Model (`{meta['selected_model']}`)\n")
        cm = meta['metrics']['confusion_matrix']
        classes = meta['classes']
        md_content.append("| Predicted -> | " + " | ".join(classes) + " |")
        md_content.append("| :--- | " + " | ".join([":---:"] * len(classes)) + " |")

        for i, row in enumerate(cm):
            md_content.append(f"| **Actual {classes[i]}** | " + " | ".join(str(val) for val in row) + " |")

        md_content.append("\n---\n")

    with open(md_path, 'w') as f:
        f.write("\n".join(md_content))

    print(f"Model evaluation report saved to:\n  - {json_path}\n  - {md_path}")
    return evaluation_report

if __name__ == '__main__':
    evaluate_all()
