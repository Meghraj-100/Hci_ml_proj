import React, { useState } from 'react';
import type { RecommendationItem, WorkloadInput } from '../../types';
import { RecommendationCard } from './RecommendationCard';
import { ServerDetailsModal } from './ServerDetailsModal';
import { ComparisonModal } from './ComparisonModal';
import { WorkloadSidePanel } from './WorkloadSidePanel';
import { Columns, Check, AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';
import './RecommendationsView.css';

interface RecommendationsViewProps {
  recommendations: RecommendationItem[];
  workload: WorkloadInput;
  compromiseNote?: string;
  onEditInputs: () => void;
  onReset: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  workload,
  compromiseNote,
  onEditInputs,
  onReset,
}) => {
  const [selectedServer, setSelectedServer] = useState<RecommendationItem | null>(null);
  const [activeDetailsItem, setActiveDetailsItem] = useState<RecommendationItem | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [expandedServerId, setExpandedServerId] = useState<string | null>(null);

  const handleToggleExpand = (serverId: string) => {
    setExpandedServerId((prev) => (prev === serverId ? null : serverId));
  };

  return (
    <div className="recommendations-container">
      {/* Results Header Row */}
      <div className="results-header-row">
        <div className="results-header-text">
          <div className="results-kicker">
            <span>Evaluation complete</span>
            <span className="results-kicker-meta">· Benchmarked against candidate AWS and Azure catalog</span>
          </div>
          <h2>Recommended server configurations</h2>
          <p className="results-subtitle">
            Ranked options for your application workload across compute throughput, memory margins, and response latency.
          </p>
        </div>

        <div className="results-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowComparison(true)}
            title="Compare all 3 recommended servers side-by-side"
          >
            <Columns size={15} />
            <span>Compare all 3</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onEditInputs}
            title="Return to workload inputs"
          >
            <ArrowLeft size={15} />
            <span>Edit workload</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onReset}
            title="Start over with a blank workload"
          >
            <RotateCcw size={13} />
            <span>New search</span>
          </button>
        </div>
      </div>

      {/* Conflicting Preferences Alert (Actionable) */}
      {compromiseNote && (
        <div className="compromise-alert-box panel" role="alert">
          <AlertTriangle size={18} className="compromise-icon" />
          <div className="compromise-text">
            <strong>Constraint compromise:</strong> {compromiseNote}
          </div>
        </div>
      )}

      {/* Selected Server Banner */}
      {selectedServer && (
        <div className="selection-status-bar panel" role="status">
          <div className="selection-status-left">
            <Check size={16} className="selection-check-icon" strokeWidth={2.5} />
            <span className="selection-main-text">
              Selected instance: <strong>{selectedServer.server.provider} {selectedServer.server.instanceName}</strong>
            </span>
            <span className="selection-sub-text tnum">
              ({selectedServer.server.vcpu} vCPU, {selectedServer.server.memoryGB} GB RAM, ~₹{selectedServer.server.estimatedPricePerMonth.toLocaleString('en-IN')}/mo)
            </span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveDetailsItem(selectedServer)}
          >
            View full specs
          </button>
        </div>
      )}

      {/* TOP 3 CARDS: 3-column desktop layout with 24px+ gaps */}
      <div className="cards-grid-3">
        {recommendations.map((item) => (
          <RecommendationCard
            key={item.category}
            item={item}
            onViewDetails={(it) => setActiveDetailsItem(it)}
            onSelect={(it) => setSelectedServer(it)}
            isSelected={selectedServer?.server.id === item.server.id}
            isExpanded={expandedServerId === item.server.id}
            onToggleExpand={() => handleToggleExpand(item.server.id)}
          />
        ))}
      </div>

      {/* Collapsible Workload Summary Drawer */}
      <WorkloadSidePanel workload={workload} onEditInputs={onEditInputs} />

      {/* Detailed Spec Modal */}
      {activeDetailsItem && (
        <ServerDetailsModal
          item={activeDetailsItem}
          onClose={() => setActiveDetailsItem(null)}
          onSelect={(it) => setSelectedServer(it)}
          isSelected={selectedServer?.server.id === activeDetailsItem.server.id}
        />
      )}

      {/* Aligned Side-by-Side Comparison Modal */}
      {showComparison && (
        <ComparisonModal
          items={recommendations}
          onClose={() => setShowComparison(false)}
          onSelect={(it) => setSelectedServer(it)}
          selectedServerId={selectedServer?.server.id}
        />
      )}
    </div>
  );
};
