import React from 'react';
import type { RecommendationItem } from '../../types';
import { Check, ArrowRight, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { FieldTooltip } from '../common/FieldTooltip';
import './RecommendationCard.css';

interface RecommendationCardProps {
  item: RecommendationItem;
  onViewDetails: (item: RecommendationItem) => void;
  onSelect: (item: RecommendationItem) => void;
  isSelected?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  onViewDetails,
  onSelect,
  isSelected = false,
  isExpanded = false,
  onToggleExpand,
}) => {
  const { server, category, suitabilityScore, predictedPerformance, rationale, advantages, tradeoffs } = item;

  const isBalanced = category === 'balanced';

  return (
    <article
      className={`recommendation-card panel ${isBalanced ? 'is-primary-card' : ''} ${
        isSelected ? 'is-selected-card' : ''
      }`}
    >
      {/* 1. Header: Primary Instance Name & Metadata */}
      <div className="card-header-block">
        <div className="card-title-group">
          <span className="card-category-sub">
            {isBalanced ? 'Recommended choice' : category === 'cheapest' ? 'Budget option' : 'High capacity'}
          </span>
          <h3 className="card-instance-name">
            {server.provider} {server.instanceName}
          </h3>
          <span className="card-region-caption">{server.region}</span>
        </div>

        {/* Suitability Score as a clean numeric text detail */}
        <div className="card-suitability-block">
          <span className="suitability-score-num tnum">{suitabilityScore}</span>
          <span className="suitability-score-denom">/100 match</span>
          <FieldTooltip
            content="Overall match score between predicted workload demands, resource margins, and cost efficiency."
            id={`suit-${server.id}`}
          />
        </div>
      </div>

      {/* 2. Main Detail: Cost */}
      <div className="card-cost-section">
        <div className="cost-row">
          <span className="cost-figure tnum">₹{server.estimatedPricePerMonth.toLocaleString('en-IN')}</span>
          <span className="cost-cadence">/ month</span>
        </div>
        <span className="cost-caption">Estimated on-demand compute</span>
      </div>

      {/* 3. Main Detail: Core Hardware Specs */}
      <div className="card-specs-table">
        <div className="spec-item">
          <span className="spec-label">Compute</span>
          <span className="spec-value tnum">{server.vcpu} vCPU</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Memory</span>
          <span className="spec-value tnum">{server.memoryGB} GB RAM</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Storage</span>
          <span className="spec-value tnum">{server.storageGB} GB SSD</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Network</span>
          <span className="spec-value">{server.networkTier}</span>
        </div>
      </div>

      {/* 4. Main Detail: High-Level Predicted Metric Summary */}
      <div className="card-summary-metrics-strip">
        <div className="summary-metric-pill">
          <span className="summary-metric-k">CPU:</span>
          <span className={`summary-metric-v ${predictedPerformance.cpuUtilization.class === 'High' ? 'warn' : ''}`}>
            {predictedPerformance.cpuUtilization.class === 'High' && <AlertTriangle size={11} />}
            {predictedPerformance.cpuUtilization.class}
          </span>
        </div>
        <div className="summary-metric-pill">
          <span className="summary-metric-k">Memory:</span>
          <span className="summary-metric-v">{predictedPerformance.memoryUtilization.class}</span>
        </div>
        <div className="summary-metric-pill">
          <span className="summary-metric-k">Latency:</span>
          <span className="summary-metric-v">{predictedPerformance.responseTime.class}</span>
        </div>
      </div>

      {/* 5. Interactive Click-to-Expand Descriptive Details */}
      <button
        type="button"
        className={`card-expand-toggle-btn ${isExpanded ? 'is-expanded' : ''}`}
        onClick={onToggleExpand}
        aria-expanded={isExpanded}
      >
        <span className="toggle-btn-label">
          {isExpanded ? 'Hide descriptive details' : 'Show descriptive details (points)'}
        </span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* 6. Expandable In-Depth Points Block */}
      {isExpanded && (
        <div className="card-expanded-points-panel" role="region" aria-label="Detailed server evaluation">
          {/* Operational Predictions in points */}
          <div className="points-subgroup">
            <span className="points-subgroup-title">Operational performance analysis:</span>
            <ul className="points-bullet-list">
              <li>
                <strong>CPU utilization ({predictedPerformance.cpuUtilization.class}):</strong>{' '}
                {predictedPerformance.cpuUtilization.description}
              </li>
              <li>
                <strong>Memory pressure ({predictedPerformance.memoryUtilization.class}):</strong>{' '}
                {predictedPerformance.memoryUtilization.description}
              </li>
              <li>
                <strong>Response latency ({predictedPerformance.responseTime.class}):</strong>{' '}
                {predictedPerformance.responseTime.description}
              </li>
            </ul>
          </div>

          {/* Recommendation rationale in point */}
          <div className="points-subgroup">
            <span className="points-subgroup-title">Recommendation rationale:</span>
            <p className="points-rationale-item">&ldquo;{rationale}&rdquo;</p>
          </div>

          {/* Architectural trade-offs in points */}
          {advantages && advantages.length > 0 && (
            <div className="points-subgroup">
              <span className="points-subgroup-title">Architectural points:</span>
              <ul className="points-bullet-list">
                {advantages.slice(0, 2).map((adv, idx) => (
                  <li key={`adv-${idx}`} className="pro-point">
                    ✓ {adv}
                  </li>
                ))}
                {tradeoffs &&
                  tradeoffs.slice(0, 1).map((tro, idx) => (
                    <li key={`tro-${idx}`} className="con-point">
                      • {tro}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 7. Action Buttons */}
      <div className="card-actions-row">
        <button
          type="button"
          className="btn btn-secondary card-action-btn"
          onClick={() => onViewDetails(item)}
        >
          <span>View specs</span>
        </button>

        <button
          type="button"
          className={`btn ${isSelected ? 'btn-secondary' : 'btn-primary'} card-action-btn`}
          onClick={() => onSelect(item)}
        >
          {isSelected ? (
            <>
              <Check size={14} />
              <span>Selected</span>
            </>
          ) : (
            <>
              <span>Select server</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </article>
  );
};
