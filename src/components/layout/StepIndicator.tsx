import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import './StepIndicator.css';

export type FlowStep = 1 | 2 | 3 | 4;

interface StepIndicatorProps {
  currentStep: FlowStep;
  onStepClick?: (step: FlowStep) => void;
}

const STEPS = [
  { step: 1, label: 'Workload parameters' },
  { step: 2, label: 'ML evaluation' },
  { step: 3, label: 'Recommendations' },
  { step: 4, label: 'Server comparison' },
] as const;

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  return (
    <nav className="step-pipeline-nav" aria-label="Recommendation pipeline steps">
      <div className="app-container">
        <ol className="step-pipeline-list">
          {STEPS.map((s, idx) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            const isClickable = onStepClick && isCompleted;

            return (
              <li
                key={s.step}
                className={`step-pipeline-item ${isCurrent ? 'is-active' : ''} ${
                  isCompleted ? 'is-completed' : ''
                }`}
              >
                <button
                  type="button"
                  className="step-pipeline-btn"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(s.step as FlowStep)}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className="step-num-prefix">
                    {isCompleted ? (
                      <Check size={13} className="step-check-icon" strokeWidth={2.5} />
                    ) : (
                      `${s.step}.`
                    )}
                  </span>
                  <span className="step-pipeline-label">{s.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <ChevronRight size={14} className="step-pipeline-divider" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
