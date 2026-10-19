import React from 'react';
import { AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import './EmptyStateView.css';

interface EmptyStateViewProps {
  reason?: string;
  cheapestSuitablePrice?: number;
  isFallback?: boolean;
  backendMessage?: string;
  onAdjustBudget: (suggestedPrice?: number) => void;
  onEditRequirements: () => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  reason,
  cheapestSuitablePrice,
  isFallback = false,
  backendMessage,
  onAdjustBudget,
  onEditRequirements,
}) => {
  return (
    <div className="empty-state-card panel" role="alert">
      <div className="empty-icon-wrap">
        <AlertTriangle size={24} className="empty-icon" />
      </div>

      <div className="empty-content">
        <div className="empty-title-group">
          <h2>No suitable servers found</h2>
          {isFallback && (
            <div className="empty-offline-notice">
              <span className="demo-badge-small">Demo Mode</span>
              <span>{backendMessage || 'Backend unavailable · Local catalog heuristics'}</span>
            </div>
          )}
        </div>
        <p className="empty-reason-text">
          {reason ||
            'Your current budget or resource requirements exclude all available servers in the catalog.'}
        </p>

        {cheapestSuitablePrice && (
          <div className="cheapest-recovery-box">
            <span className="recovery-header">Lowest cost viable match</span>
            <p className="recovery-text">
              The lowest-priced server configuration meeting baseline compute requirements starts at:
            </p>
            <div className="recovery-amount tnum">
              ₹{cheapestSuitablePrice.toLocaleString('en-IN')}
              <span className="recovery-period"> / month</span>
            </div>
          </div>
        )}

        <div className="empty-actions">
          {cheapestSuitablePrice ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onAdjustBudget(cheapestSuitablePrice)}
            >
              <span>Adjust budget to ₹{cheapestSuitablePrice.toLocaleString('en-IN')}/mo</span>
              <ArrowRight size={15} />
            </button>
          ) : null}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onEditRequirements}
          >
            <RotateCcw size={14} />
            <span>Edit requirements</span>
          </button>
        </div>

        <p className="recovery-hci-tip">
          Diagnostic error recovery: provides clear transparency and direct paths to repair conflicting constraints.
        </p>
      </div>
    </div>
  );
};
