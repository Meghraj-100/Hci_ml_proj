import React from 'react';
import type { RecommendationItem } from '../../types';
import { X, Check } from 'lucide-react';
import './ServerDetailsModal.css';

interface ServerDetailsModalProps {
  item: RecommendationItem;
  onClose: () => void;
  onSelect: (item: RecommendationItem) => void;
  isSelected?: boolean;
}

export const ServerDetailsModal: React.FC<ServerDetailsModalProps> = ({
  item,
  onClose,
  onSelect,
  isSelected = false,
}) => {
  const { server, suitabilityScore, predictedPerformance, rationale, advantages, tradeoffs, category } = item;

  const categoryLabel = category === 'balanced' ? 'Best balanced' : category === 'cheapest' ? 'Budget option' : 'Best performance';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card details-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-server-name"
      >
        <div className="modal-header">
          <div className="details-header-text">
            <div className="details-meta-line">
              <span className="details-cat-label">{categoryLabel}</span>
              <span className="details-fit-label tnum">· {suitabilityScore}/100 match</span>
            </div>
            <h3 id="modal-server-name" className="details-title">
              {server.provider} {server.instanceName}
            </h3>
            <span className="details-region">{server.region}</span>
          </div>

          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body details-body">
          {/* Hardware specifications */}
          <section className="details-section">
            <h4>Hardware specifications</h4>
            <div className="hardware-table-container">
              <table className="spec-table">
                <tbody>
                  <tr>
                    <td>Compute cores</td>
                    <td className="tnum"><strong>{server.vcpu} vCPU</strong></td>
                    <td>Memory capacity</td>
                    <td className="tnum"><strong>{server.memoryGB} GB RAM</strong></td>
                  </tr>
                  <tr>
                    <td>Storage</td>
                    <td className="tnum">{server.storageGB} GB SSD</td>
                    <td>Clock speed</td>
                    <td>{server.cpuSpeed}</td>
                  </tr>
                  <tr>
                    <td>Network bandwidth</td>
                    <td>{server.networkTier}</td>
                    <td>Platform</td>
                    <td>{server.provider}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Predicted operational performance */}
          <section className="details-section">
            <h4>Predicted operational performance</h4>
            <div className="prediction-detail-rows">
              <div className="pred-row">
                <div className="pred-row-head">
                  <span className="pred-name">CPU utilization:</span>
                  <span className="pred-val">{predictedPerformance.cpuUtilization.class}</span>
                </div>
                <p className="pred-desc">{predictedPerformance.cpuUtilization.description}</p>
              </div>

              <div className="pred-row">
                <div className="pred-row-head">
                  <span className="pred-name">Memory utilization:</span>
                  <span className="pred-val">{predictedPerformance.memoryUtilization.class}</span>
                </div>
                <p className="pred-desc">{predictedPerformance.memoryUtilization.description}</p>
              </div>

              <div className="pred-row">
                <div className="pred-row-head">
                  <span className="pred-name">Response time:</span>
                  <span className="pred-val">{predictedPerformance.responseTime.class}</span>
                </div>
                <p className="pred-desc">{predictedPerformance.responseTime.description}</p>
              </div>
            </div>
          </section>

          {/* Estimated pricing */}
          <section className="details-section">
            <h4>Estimated financial commitment</h4>
            <div className="cost-detail-box">
              <div className="cost-detail-amount tnum">
                ₹{server.estimatedPricePerMonth.toLocaleString('en-IN')}
                <span className="cost-detail-period"> / month</span>
              </div>
              <p className="cost-detail-sub">
                Baseline on-demand compute estimate for {server.region}. Actual billings reflect regional egress and reservation discounts.
              </p>
            </div>
          </section>

          {/* Recommendation rationale */}
          <section className="details-section">
            <h4>Recommendation rationale</h4>
            <p className="details-rationale-quote">
              &ldquo;{rationale}&rdquo;
            </p>
          </section>

          {/* Architectural trade-offs */}
          <section className="details-section">
            <h4>Architectural trade-offs</h4>
            <div className="tradeoffs-grid">
              <div className="tradeoffs-col">
                <span className="tradeoff-head pros">Advantages</span>
                <ul className="tradeoff-list">
                  {advantages.map((adv, i) => (
                    <li key={i} className="pro-item">✓ {adv}</li>
                  ))}
                </ul>
              </div>

              <div className="tradeoffs-col">
                <span className="tradeoff-head cons">Trade-offs</span>
                <ul className="tradeoff-list">
                  {tradeoffs.map((tro, i) => (
                    <li key={i} className="con-item">• {tro}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="modal-footer details-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>

          <button
            type="button"
            className={`btn ${isSelected ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => {
              onSelect(item);
              onClose();
            }}
          >
            {isSelected ? (
              <>
                <Check size={14} />
                <span>Selected</span>
              </>
            ) : (
              <span>Select this server</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
