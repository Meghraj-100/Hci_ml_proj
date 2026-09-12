# Cloud Server Recommendation System

An HCI + Machine Learning academic research frontend that assists users in selecting optimal cloud server configurations for their application workloads without exposing underlying machine learning complexity.

---

## 1. Project Overview

Selecting an appropriate cloud instance is challenging:
- **Under-provisioning**: leads to high CPU/memory utilization, cascading request queuing, and system overload.
- **Over-provisioning**: leads to idle capacity, budget waste, and poor infrastructure cost efficiency.

This system provides an intuitive, human-centered bridge between **complex workload specifications** and **machine learning candidate evaluations** across candidate AWS and Azure server instances.

---

## 2. HCI Design Principles Implemented

- **Norman's Execution-Evaluation Model**:
  - *Gulf of Execution*: Solved through chunked inputs (Workload, Network, Advanced Filters), visible units (`Kbps`, `jobs/min`), contextual tooltips, and sensible presets.
  - *Gulf of Evaluation*: Solved through continuous state visibility during evaluation, suitability scores (0–100), plain-text operational predictions, and structured recommendation rationales.
- **Short-Term Memory & Chunking**: Workload form is partitioned into distinct, digestible sections.
- **Progressive Disclosure**: Advanced filters (provider, region, budget, priority) are collapsed by default. In the recommendation view, cards display core specifications by default and expand into point-by-point details on demand.
- **Single-Card Accordion**: Only one card can expand at a time, preserving clean vertical rhythm and comparison alignment.
- **Error Prevention & Recovery**: Immediate inline numeric validation prevents invalid inputs; dedicated empty states diagnose budget underflow and provide direct one-click budget adjustment pathways.
- **Recognition over Recall**: A collapsible "Your Workload" side panel preserves original inputs for review without taxing memory.

---

## 3. Clean Separation of Concerns

- **React + Vite Frontend**: Manages HCI interaction, inputs, validation, progressive disclosure, and visualization.
- **Python / FastAPI Backend** (Future API): Handles F1–F9 feature vector synthesis, training dataset models (`mmc2`–`mmc7`), multi-model categorical predictions (CPU, Memory, Latency), suitability ranking, and Top-3 selection.
- **API Contract**: Defined in `src/services/recommendationApi.ts` around `POST /recommend`.

---

## 4. Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Production Build
```bash
npm run build
```
