import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import './ProcessingView.css';

interface ProcessingViewProps {
  currentStageIndex: number;
  evaluatedCount: number;
  totalServers: number;
}

const STAGES = [
  { id: 'req', label: 'Checking workload requirements and bounds' },
  { id: 'filter', label: 'Filtering cloud server catalog by provider and region' },
  { id: 'ml', label: 'Running performance predictions (CPU, memory, latency)' },
  { id: 'rank', label: 'Ranking candidate instances and compiling rationales' },
];

export const ProcessingView: React.FC<ProcessingViewProps> = ({
  currentStageIndex,
  evaluatedCount,
  totalServers,
}) => {
  const percent = totalServers > 0 ? Math.min(100, Math.round((evaluatedCount / totalServers) * 100)) : 0;

  return (
    <div className="processing-container panel" role="status" aria-live="polite">
      <div className="processing-header">
        <h2>Evaluating your workload</h2>
        <p className="processing-subtext">
          Benchmarking candidate instances against your workload requirements across compute, memory, and latency models.
        </p>
      </div>

      {/* Progress Bar & Counter */}
      <div className="progress-section">
        <div className="progress-metrics-row">
          <span className="progress-status-label">Evaluating candidate servers</span>
          <span className="progress-count tnum">
            {evaluatedCount} / {totalServers} evaluated
          </span>
        </div>

        <div className="progress-bar-track" aria-hidden="true">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.max(6, percent)}%` }}
          />
        </div>
      </div>

      {/* Meaningful Stage Progression */}
      <div className="stages-list">
        {STAGES.map((stage, idx) => {
          const isCompleted = currentStageIndex > idx;
          const isActive = currentStageIndex === idx;

          return (
            <div
              key={stage.id}
              className={`stage-item ${isCompleted ? 'is-completed' : ''} ${
                isActive ? 'is-active' : ''
              }`}
            >
              <div className="stage-icon-wrap">
                {isCompleted ? (
                  <Check size={14} className="stage-icon-done" strokeWidth={2.5} />
                ) : isActive ? (
                  <Loader2 size={14} className="stage-icon-spinner" />
                ) : (
                  <span className="stage-dot-pending" />
                )}
              </div>
              <span className="stage-label">{stage.label}</span>
            </div>
          );
        })}
      </div>

      <div className="processing-footer">
        <span className="processing-meta">
          HCI state visibility: transparent execution eliminates uncertainty during model evaluation.
        </span>
      </div>
    </div>
  );
};
