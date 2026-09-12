import React, { useState } from 'react';
import type { WorkloadInput } from '../../types';
import { Edit3, ChevronRight, ChevronLeft, Sliders } from 'lucide-react';
import './WorkloadSidePanel.css';

interface WorkloadSidePanelProps {
  workload: WorkloadInput;
  onEditInputs: () => void;
}

export const WorkloadSidePanel: React.FC<WorkloadSidePanelProps> = ({
  workload,
  onEditInputs,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className={`workload-side-panel panel ${isOpen ? 'is-open' : 'is-collapsed'}`}>
      <button
        type="button"
        className="panel-toggle-tab"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        title={isOpen ? 'Collapse workload panel' : 'Expand your workload summary'}
      >
        <Sliders size={14} />
        <span className="panel-tab-title">Your workload</span>
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {isOpen && (
        <div className="panel-content">
          <div className="panel-head">
            <div>
              <h4 className="panel-title">Original workload</h4>
              <p className="panel-subtitle">Parameters used for this evaluation</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-edit"
              onClick={onEditInputs}
              title="Edit parameters"
            >
              <Edit3 size={12} />
              <span>Edit</span>
            </button>
          </div>

          <div className="workload-summary-grid">
            <div className="summary-chunk">
              <span className="summary-chunk-label">Application throughput</span>
              <div className="summary-row">
                <span className="summary-k">1-min rate:</span>
                <span className="summary-v tnum">{Number(workload.jobsPerMinute).toLocaleString()} jobs/min</span>
              </div>
              <div className="summary-row">
                <span className="summary-k">5-min window:</span>
                <span className="summary-v tnum">{Number(workload.jobsPer5Minutes).toLocaleString()} jobs/5min</span>
              </div>
              <div className="summary-row">
                <span className="summary-k">15-min sustained:</span>
                <span className="summary-v tnum">{Number(workload.jobsPer15Minutes).toLocaleString()} jobs/15min</span>
              </div>
            </div>

            <div className="summary-chunk">
              <span className="summary-chunk-label">Network traffic</span>
              <div className="summary-row">
                <span className="summary-k">Avg receive:</span>
                <span className="summary-v tnum">{Number(workload.avgReceiveKbps).toLocaleString()} Kbps</span>
              </div>
              <div className="summary-row">
                <span className="summary-k">Avg transmit:</span>
                <span className="summary-v tnum">{Number(workload.avgTransmitKbps).toLocaleString()} Kbps</span>
              </div>
            </div>

            <div className="summary-chunk">
              <span className="summary-chunk-label">Selected preferences</span>
              <div className="summary-row">
                <span className="summary-k">Priority:</span>
                <span className="summary-v" style={{ textTransform: 'capitalize' }}>{workload.priority}</span>
              </div>
              <div className="summary-row">
                <span className="summary-k">Provider:</span>
                <span className="summary-v">{workload.provider === 'all' ? 'AWS + Azure' : workload.provider}</span>
              </div>
              <div className="summary-row">
                <span className="summary-k">Region:</span>
                <span className="summary-v">{workload.region}</span>
              </div>
              {workload.maxPrice !== '' && (
                <div className="summary-row">
                  <span className="summary-k">Max budget:</span>
                  <span className="summary-v tnum">₹{Number(workload.maxPrice).toLocaleString('en-IN')}/mo</span>
                </div>
              )}
              {Boolean(workload.minRamGB) && (
                <div className="summary-row">
                  <span className="summary-k">Min RAM:</span>
                  <span className="summary-v tnum">{workload.minRamGB} GB</span>
                </div>
              )}
            </div>
          </div>

          <div className="panel-foot">
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={onEditInputs}
            >
              <Edit3 size={13} />
              <span>Modify workload inputs</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
