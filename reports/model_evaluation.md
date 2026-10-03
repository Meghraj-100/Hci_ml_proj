# Cloud Server Recommendation System - Model Evaluation Report

## Target: CPU Utilization / Response

- **Selected Algorithm**: `RandomForest`
- **Training Samples**: 25697
- **Test Samples**: 2450
- **Classes**: `['High', 'Low', 'Medium', 'Very Low']`

### Candidate Algorithm Comparison

| Algorithm | Accuracy | Precision (Macro) | Recall (Macro) | Macro F1 | Weighted F1 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `RandomForest` **(Selected)** | 0.9682 | 0.9399 | 0.7397 | 0.8106 | 0.9666 |
| `ExtraTrees` | 0.9633 | 0.8419 | 0.7368 | 0.7821 | 0.9622 |
| `GradientBoosting` | 0.9645 | 0.8409 | 0.6533 | 0.7167 | 0.9627 |
| `DecisionTree` | 0.9506 | 0.7330 | 0.6112 | 0.6570 | 0.9492 |
| `KNN` | 0.9612 | 0.9187 | 0.6778 | 0.7348 | 0.9596 |
| `LogisticRegression` | 0.9490 | 0.6452 | 0.5709 | 0.6030 | 0.9431 |
| `NaiveBayes` | 0.5604 | 0.2872 | 0.5492 | 0.2427 | 0.6718 |

### Confusion Matrix for Best Model (`RandomForest`)

| Predicted -> | High | Low | Medium | Very Low |
| :--- | :---: | :---: | :---: | :---: |
| **Actual High** | 6 | 1 | 0 | 0 |
| **Actual Low** | 0 | 100 | 0 | 50 |
| **Actual Medium** | 0 | 5 | 4 | 0 |
| **Actual Very Low** | 0 | 22 | 0 | 2262 |

---

## Target: MEMORY Utilization / Response

- **Selected Algorithm**: `ExtraTrees`
- **Training Samples**: 25697
- **Test Samples**: 2450
- **Classes**: `['High', 'Low', 'Medium', 'Very Low']`

### Candidate Algorithm Comparison

| Algorithm | Accuracy | Precision (Macro) | Recall (Macro) | Macro F1 | Weighted F1 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `RandomForest` | 0.9792 | 0.9284 | 0.8802 | 0.9015 | 0.9787 |
| `ExtraTrees` **(Selected)** | 0.9804 | 0.9287 | 0.8838 | 0.9035 | 0.9799 |
| `GradientBoosting` | 0.9824 | 0.9494 | 0.8693 | 0.9015 | 0.9816 |
| `DecisionTree` | 0.9722 | 0.8610 | 0.8763 | 0.8682 | 0.9725 |
| `KNN` | 0.9796 | 0.9389 | 0.8516 | 0.8843 | 0.9785 |
| `LogisticRegression` | 0.9118 | 0.7964 | 0.6340 | 0.6511 | 0.9042 |
| `NaiveBayes` | 0.8771 | 0.5447 | 0.5295 | 0.5078 | 0.8315 |

### Confusion Matrix for Best Model (`ExtraTrees`)

| Predicted -> | High | Low | Medium | Very Low |
| :--- | :---: | :---: | :---: | :---: |
| **Actual High** | 1182 | 0 | 4 | 0 |
| **Actual Low** | 1 | 241 | 1 | 17 |
| **Actual Medium** | 10 | 2 | 20 | 0 |
| **Actual Very Low** | 0 | 13 | 0 | 959 |

---

## Target: RESPONSE Utilization / Response

- **Selected Algorithm**: `RandomForest`
- **Training Samples**: 25697
- **Test Samples**: 2450
- **Classes**: `['High', 'Low', 'Very Low']`

### Candidate Algorithm Comparison

| Algorithm | Accuracy | Precision (Macro) | Recall (Macro) | Macro F1 | Weighted F1 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `RandomForest` **(Selected)** | 0.9665 | 0.8642 | 0.7539 | 0.8019 | 0.9648 |
| `ExtraTrees` | 0.9649 | 0.8337 | 0.7554 | 0.7908 | 0.9636 |
| `GradientBoosting` | 0.9641 | 0.8481 | 0.7240 | 0.7761 | 0.9621 |
| `DecisionTree` | 0.9535 | 0.7957 | 0.7222 | 0.7554 | 0.9518 |
| `KNN` | 0.9629 | 0.8995 | 0.7091 | 0.7757 | 0.9613 |
| `LogisticRegression` | 0.9494 | 0.8616 | 0.6027 | 0.6801 | 0.9446 |
| `NaiveBayes` | 0.5743 | 0.6713 | 0.6802 | 0.5232 | 0.6773 |

### Confusion Matrix for Best Model (`RandomForest`)

| Predicted -> | High | Low | Very Low |
| :--- | :---: | :---: | :---: |
| **Actual High** | 2261 | 21 | 2 |
| **Actual Low** | 53 | 97 | 0 |
| **Actual Very Low** | 0 | 6 | 10 |

---
