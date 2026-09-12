import React from 'react';
import type { RecommendationItem } from '../../types';
import { X, Check } from 'lucide-react';
import './ComparisonModal.css';

interface ComparisonModalProps {
  items: RecommendationItem[];
  onClose: () => void;
  onSelect: (item: RecommendationItem) => void;
  selectedServerId?: string;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  items,
  onClose,
  onSelect,
  selectedServerId,
}) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card comparison-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="comparison-title"
      >
        <div className="modal-header">
          <div>
            <h3 id="comparison-title">Candidate server comparison</h3>
            <p className="modal-subtitle">
              Side-by-side evaluation across hardware specifications, predicted performance, and cost.
            </p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 0 }}>
          <div className="comparison-table-wrap">
            <table className="spec-table comparison-table">
              <thead>
                <tr>
                  <th className="spec-col-label">Attribute</th>
                  {items.map((it) => (
                    <th key={it.category} className="candidate-col-head">
                      <span className="candidate-cat-sub">
                        {it.category === 'balanced'
                          ? 'Recommended choice'
                          : it.category === 'cheapest'
                          ? 'Budget option'
                          : 'High capacity'}
                      </span>
                      <div className="table-inst-name">{it.server.instanceName}</div>
                      <div className="table-inst-prov">{it.server.provider} ({it.server.region})</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="spec-row-name">Platform</td>
                  {items.map((it) => (
                    <td key={it.category}>{it.server.provider}</td>
                  ))}
                </tr>
                <tr>
                  <td className="spec-row-name">Compute cores</td>
                  {items.map((it) => (
                    <td key={it.category} className="tnum"><strong>{it.server.vcpu} vCPU</strong></td>
                  ))}
                </tr>
                <tr>
                  <td className="spec-row-name">Memory capacity</td>
                  {items.map((it) => (
                    <td key={it.category} className="tnum"><strong>{it.server.memoryGB} GB RAM</strong></td>
                  ))}
                </tr>
                <tr>
                  <td className="spec-row-name">Storage</td>
                  {items.map((it) => (
                    <td key={it.category} className="tnum">{it.server.storageGB} GB SSD</td>
                  ))}
                </tr>
                <tr>
                  <td className="spec-row-name">Network bandwidth</td>
                  {items.map((it) => (
                    <td key={it.category}>{it.server.networkTier}</td>
                  ))}
                </tr>
                <tr>
                  <td className="spec-row-name">Suitability match</td>
                  {items.map((it) => (
                    <td key={it.category} className="tnum">
                      <strong>{it.suitabilityScore}</strong> / 100
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="spec-row-name">Predicted CPU load</td>
                  {items.map((it) => (
                    <td key={it.category}>
                      <div><strong>{it.predictedPerformance.cpuUtilization.class}</strong></div>
                      <p className="table-desc">{it.predictedPerformance.cpuUtilization.description}</p>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="spec-row-name">Predicted memory load</td>
                  {items.map((it) => (
                    <td key={it.category}>
                      <div><strong>{it.predictedPerformance.memoryUtilization.class}</strong></div>
                      <p className="table-desc">{it.predictedPerformance.memoryUtilization.description}</p>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="spec-row-name">Predicted response latency</td>
                  {items.map((it) => (
                    <td key={it.category}>
                      <div><strong>{it.predictedPerformance.responseTime.class}</strong></div>
                      <p className="table-desc">{it.predictedPerformance.responseTime.description}</p>
                    </td>
                  ))}
                </tr>
                <tr className="price-compare-row">
                  <td className="spec-row-name">Estimated monthly price</td>
                  {items.map((it) => (
                    <td key={it.category}>
                      <div className="table-price tnum">
                        ₹{it.server.estimatedPricePerMonth.toLocaleString('en-IN')}
                        <span className="table-price-sub"> / mo</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="spec-row-name">Action</td>
                  {items.map((it) => {
                    const isSelected = selectedServerId === it.server.id;
                    return (
                      <td key={it.category}>
                        <button
                          type="button"
                          className={`btn ${isSelected ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                          onClick={() => {
                            onSelect(it);
                            onClose();
                          }}
                          style={{ width: '100%' }}
                        >
                          {isSelected ? (
                            <>
                              <Check size={13} />
                              <span>Selected</span>
                            </>
                          ) : (
                            <span>Select this</span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close comparison
          </button>
        </div>
      </div>
    </div>
  );
};
