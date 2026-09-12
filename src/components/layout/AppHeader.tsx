import React, { useState } from 'react';
import { Server, Info, RefreshCw, X } from 'lucide-react';
import './AppHeader.css';

interface AppHeaderProps {
  onReset: () => void;
  onNavigateHome: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onReset, onNavigateHome }) => {
  const [showArchModal, setShowArchModal] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="app-container header-inner">
          <button type="button" className="brand-button" onClick={onNavigateHome}>
            <div className="brand-icon">
              <Server size={18} />
            </div>
            <div className="brand-text">
              <span className="brand-title">Cloud Server Recommendation System</span>
              <span className="brand-subtitle">HCI + Machine Learning Academic Project</span>
            </div>
          </button>

          <div className="header-actions">
            <button
              type="button"
              className="btn btn-ghost header-btn"
              onClick={() => setShowArchModal(true)}
              title="View HCI & ML Architecture notes"
            >
              <Info size={16} />
              <span>HCI Architecture</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary header-btn"
              onClick={onReset}
              title="Reset workload inputs"
            >
              <RefreshCw size={14} />
              <span>New Workload</span>
            </button>
          </div>
        </div>
      </header>

      {/* HCI Architecture Drawer / Modal for Evaluators */}
      {showArchModal && (
        <div className="modal-backdrop" onClick={() => setShowArchModal(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="arch-modal-title"
          >
            <div className="modal-header">
              <div>
                <h3 id="arch-modal-title">HCI + Machine Learning Design Architecture</h3>
                <p className="modal-subtitle">Academic project system separation & Norman's model</p>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowArchModal(false)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="arch-section">
                <h4>HCI Abstraction Layer</h4>
                <p>
                  To eliminate cognitive overload and bridge the <strong>Gulf of Execution</strong>,
                  the frontend hides internal ML complexity (raw F1–F9 feature vectors, training dataset filenames like <code>mmc2–mmc7</code>,
                  and low-level model parameters). The user provides domain-grounded workload values in plain language with visible units (<code>Kbps</code>, <code>jobs/min</code>).
                </p>
              </div>

              <div className="arch-diagram">
                <div className="arch-node">
                  <span className="node-title">User Workload</span>
                  <span className="node-detail">Jobs (1m, 5m, 15m) + Bandwidth</span>
                </div>
                <div className="arch-arrow">+</div>
                <div className="arch-node">
                  <span className="node-title">Candidate Server</span>
                  <span className="node-detail">AWS / Azure Hardware Specs</span>
                </div>
                <div className="arch-arrow">→</div>
                <div className="arch-node highlight">
                  <span className="node-title">Recommendation Engine</span>
                  <span className="node-detail">Backend ML Models (CPU, Mem, RT)</span>
                </div>
                <div className="arch-arrow">→</div>
                <div className="arch-node">
                  <span className="node-title">Human-Readable Cards</span>
                  <span className="node-detail">Top 3 with Suitability & Rationale</span>
                </div>
              </div>

              <div className="arch-section">
                <h4>Bridging the Gulf of Evaluation</h4>
                <p>
                  Raw categorical model predictions (e.g. <code>CPU: High</code>) are translated into contextual human insights
                  (e.g., <em>&ldquo;Approaching server capacity during burst periods; close monitoring advised&rdquo;</em>).
                  Semantic color coding is strictly paired with text and badges to guarantee universal accessibility.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowArchModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
