import React, { useState } from 'react';
import type { WorkloadInput, CloudProvider, CloudRegion, PerformancePriority } from '../../types';
import { NumberInput } from '../common/NumberInput';
import { ChevronDown, ChevronRight, ArrowRight, RotateCcw } from 'lucide-react';
import './WorkloadForm.css';

interface WorkloadFormProps {
  initialValues: WorkloadInput;
  onSubmit: (values: WorkloadInput) => void;
  onReset: () => void;
}

export const WorkloadForm: React.FC<WorkloadFormProps> = ({
  initialValues,
  onSubmit,
  onReset,
}) => {
  const [formValues, setFormValues] = useState<WorkloadInput>(initialValues);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: keyof WorkloadInput, val: unknown): string => {
    if (field === 'jobsPerMinute') {
      if (val === '' || val === null || val === undefined) return 'Jobs per minute is required.';
      if (Number(val) <= 0) return 'Must be greater than 0.';
      if (Number(val) > 2000000) return 'Exceeds maximum allowable jobs range.';
    }
    if (field === 'jobsPer5Minutes') {
      if (val === '' || val === null || val === undefined) return 'Jobs per 5 minutes is required.';
      if (Number(val) <= 0) return 'Must be greater than 0.';
    }
    if (field === 'jobsPer15Minutes') {
      if (val === '' || val === null || val === undefined) return 'Jobs per 15 minutes is required.';
      if (Number(val) <= 0) return 'Must be greater than 0.';
    }
    if (field === 'avgReceiveKbps') {
      if (val === '' || val === null || val === undefined) return 'Receive bandwidth is required.';
      if (Number(val) < 0) return 'Cannot be negative.';
    }
    if (field === 'avgTransmitKbps') {
      if (val === '' || val === null || val === undefined) return 'Transmit bandwidth is required.';
      if (Number(val) < 0) return 'Cannot be negative.';
    }
    if (field === 'maxPrice' && val !== '') {
      if (Number(val) < 0) return 'Budget cannot be negative.';
    }
    return '';
  };

  const handleNumberChange = (field: keyof WorkloadInput) => (value: number | '') => {
    setFormValues((prev) => {
      const next = { ...prev, [field]: value };
      
      // Auto-heuristic assistance: if 5-min or 15-min are empty, fill reasonable multiples
      if (field === 'jobsPerMinute' && typeof value === 'number' && value > 0) {
        if (prev.jobsPer5Minutes === '') next.jobsPer5Minutes = value * 5;
        if (prev.jobsPer15Minutes === '') next.jobsPer15Minutes = value * 14;
      }
      return next;
    });

    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const loadPreset = (preset: 'standard' | 'api' | 'batch' | 'lowBudget' | 'conflict') => {
    if (preset === 'standard') {
      setFormValues({
        jobsPerMinute: 5000,
        jobsPer5Minutes: 24000,
        jobsPer15Minutes: 68000,
        avgReceiveKbps: 120,
        avgTransmitKbps: 80,
        provider: 'all',
        region: 'ap-south-1 (India)',
        maxPrice: '',
        priority: 'balanced',
        minRamGB: '',
      });
    } else if (preset === 'api') {
      setFormValues({
        jobsPerMinute: 18000,
        jobsPer5Minutes: 85000,
        jobsPer15Minutes: 240000,
        avgReceiveKbps: 850,
        avgTransmitKbps: 620,
        provider: 'all',
        region: 'ap-south-1 (India)',
        maxPrice: '',
        priority: 'performance',
        minRamGB: '',
      });
    } else if (preset === 'batch') {
      setFormValues({
        jobsPerMinute: 35000,
        jobsPer5Minutes: 160000,
        jobsPer15Minutes: 450000,
        avgReceiveKbps: 340,
        avgTransmitKbps: 210,
        provider: 'AWS',
        region: 'ap-south-1 (India)',
        maxPrice: 20000,
        priority: 'balanced',
        minRamGB: '',
      });
    } else if (preset === 'lowBudget') {
      // Scenario 4: Very low budget to test empty state recovery
      setFormValues({
        jobsPerMinute: 6000,
        jobsPer5Minutes: 28000,
        jobsPer15Minutes: 80000,
        avgReceiveKbps: 150,
        avgTransmitKbps: 90,
        provider: 'all',
        region: 'ap-south-1 (India)',
        maxPrice: 800, // catalog starts at ₹1250
        priority: 'cheapest',
        minRamGB: '',
      });
      setShowAdvanced(true);
    } else if (preset === 'conflict') {
      // Scenario 5: Conflicting preferences (Cheapest priority + 64GB RAM)
      setFormValues({
        jobsPerMinute: 8000,
        jobsPer5Minutes: 38000,
        jobsPer15Minutes: 110000,
        avgReceiveKbps: 200,
        avgTransmitKbps: 150,
        provider: 'all',
        region: 'ap-south-1 (India)',
        maxPrice: '',
        priority: 'cheapest',
        minRamGB: 64,
      });
      setShowAdvanced(true);
    }
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required inputs
    const newErrors: Record<string, string> = {
      jobsPerMinute: validateField('jobsPerMinute', formValues.jobsPerMinute),
      jobsPer5Minutes: validateField('jobsPer5Minutes', formValues.jobsPer5Minutes),
      jobsPer15Minutes: validateField('jobsPer15Minutes', formValues.jobsPer15Minutes),
      avgReceiveKbps: validateField('avgReceiveKbps', formValues.avgReceiveKbps),
      avgTransmitKbps: validateField('avgTransmitKbps', formValues.avgTransmitKbps),
      maxPrice: validateField('maxPrice', formValues.maxPrice),
    };

    const hasErrors = Object.values(newErrors).some((err) => Boolean(err));
    setErrors(newErrors);

    if (!hasErrors) {
      onSubmit(formValues);
    }
  };

  return (
    <form className="workload-form-container" onSubmit={handleSubmit} noValidate>
      {/* Page Title & Context */}
      <div className="form-header">
        <div className="form-header-text">
          <h2>Application workload specifications</h2>
          <p>
            Provide your application&apos;s expected request rate and network throughput. Candidate servers
            will be benchmarked against these operational requirements.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="preset-bar">
          <span className="preset-bar-title">Presets:</span>
          <button
            type="button"
            className="preset-btn"
            onClick={() => loadPreset('standard')}
          >
            Standard web app
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => loadPreset('api')}
          >
            High-traffic API
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => loadPreset('batch')}
          >
            Batch worker
          </button>
          <button
            type="button"
            className="preset-btn preset-btn-test"
            onClick={() => loadPreset('lowBudget')}
            title="Scenario 4: Budget lower than minimal server"
          >
            Low budget test
          </button>
          <button
            type="button"
            className="preset-btn preset-btn-test"
            onClick={() => loadPreset('conflict')}
            title="Scenario 5: Cheapest priority with 64GB RAM"
          >
            Conflict test
          </button>
        </div>
      </div>

      {/* SECTION 1: APPLICATION WORKLOAD */}
      <section className="form-section panel" aria-labelledby="sec-workload-title">
        <div className="section-head">
          <h3 id="sec-workload-title">Application workload</h3>
          <p className="section-sub">
            Request arrival rate across multiple sliding windows to capture burst and sustained behavior.
          </p>
        </div>

        <div className="input-grid-3">
          <NumberInput
            id="jobsPerMinute"
            label="Jobs per minute"
            unit="jobs/min"
            value={formValues.jobsPerMinute}
            onChange={handleNumberChange('jobsPerMinute')}
            tooltipText="Approximate number of jobs or requests processed by your application in one minute."
            placeholder="e.g. 5000"
            required
            error={errors.jobsPerMinute}
          />

          <NumberInput
            id="jobsPer5Minutes"
            label="Jobs per 5 minutes"
            unit="jobs/5min"
            value={formValues.jobsPer5Minutes}
            onChange={handleNumberChange('jobsPer5Minutes')}
            tooltipText="Average cumulative workload over a 5-minute sliding window."
            placeholder="e.g. 24000"
            required
            error={errors.jobsPer5Minutes}
          />

          <NumberInput
            id="jobsPer15Minutes"
            label="Jobs per 15 minutes"
            unit="jobs/15min"
            value={formValues.jobsPer15Minutes}
            onChange={handleNumberChange('jobsPer15Minutes')}
            tooltipText="Average workload over a 15-minute window. Captures sustained steady-state demand."
            placeholder="e.g. 68000"
            required
            error={errors.jobsPer15Minutes}
          />
        </div>
      </section>

      {/* SECTION 2: NETWORK ACTIVITY */}
      <section className="form-section panel" aria-labelledby="sec-network-title">
        <div className="section-head">
          <h3 id="sec-network-title">Network activity</h3>
          <p className="section-sub">
            Average incoming and outgoing network transfer rate.
          </p>
        </div>

        <div className="input-grid-2">
          <NumberInput
            id="avgReceiveKbps"
            label="Average receive bandwidth"
            unit="Kbps"
            value={formValues.avgReceiveKbps}
            onChange={handleNumberChange('avgReceiveKbps')}
            tooltipText="Average incoming network traffic received by the application."
            placeholder="e.g. 120"
            required
            error={errors.avgReceiveKbps}
          />

          <NumberInput
            id="avgTransmitKbps"
            label="Average transmit bandwidth"
            unit="Kbps"
            value={formValues.avgTransmitKbps}
            onChange={handleNumberChange('avgTransmitKbps')}
            tooltipText="Average outgoing network traffic transmitted by the application."
            placeholder="e.g. 80"
            required
            error={errors.avgTransmitKbps}
          />
        </div>
      </section>

      {/* SECTION 3: PREFERENCES & FILTERS (Progressive Disclosure) */}
      <section className="form-section panel advanced-section" aria-labelledby="sec-filters-title">
        <button
          type="button"
          className="advanced-toggle-row"
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-expanded={showAdvanced}
          aria-controls="advanced-filters-body"
        >
          <div className="advanced-toggle-left">
            <h3 id="sec-filters-title">Advanced filters &amp; preferences</h3>
            <span className="advanced-optional-label">(Optional)</span>
          </div>

          <div className="advanced-toggle-right">
            <span>{showAdvanced ? 'Hide advanced filters' : 'Show advanced filters'}</span>
            {showAdvanced ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </button>

        {showAdvanced && (
          <div id="advanced-filters-body" className="advanced-body">
            <div className="input-grid-2">
              <div className="form-group">
                <label htmlFor="provider-select" className="form-label">
                  Cloud provider preference
                </label>
                <select
                  id="provider-select"
                  className="form-select"
                  value={formValues.provider}
                  onChange={(e) =>
                    setFormValues((p) => ({ ...p, provider: e.target.value as CloudProvider }))
                  }
                >
                  <option value="all">All providers (AWS &amp; Azure)</option>
                  <option value="AWS">Amazon Web Services (AWS)</option>
                  <option value="Azure">Microsoft Azure</option>
                </select>
                <span className="form-help">Filter candidate catalog to a specific cloud platform.</span>
              </div>

              <div className="form-group">
                <label htmlFor="region-select" className="form-label">
                  Target region
                </label>
                <select
                  id="region-select"
                  className="form-select"
                  value={formValues.region}
                  onChange={(e) =>
                    setFormValues((p) => ({ ...p, region: e.target.value as CloudRegion }))
                  }
                >
                  <option value="all">All regions</option>
                  <option value="ap-south-1 (India)">ap-south-1 (India)</option>
                  <option value="us-east-1 (US)">us-east-1 (US East)</option>
                  <option value="eu-central-1 (EU)">eu-central-1 (Europe)</option>
                </select>
                <span className="form-help">Target datacenter region for network proximity.</span>
              </div>
            </div>

            <div className="input-grid-2" style={{ marginTop: 'var(--space-5)' }}>
              <NumberInput
                id="maxPrice"
                label="Maximum monthly budget"
                unit="₹ / mo"
                value={formValues.maxPrice}
                onChange={handleNumberChange('maxPrice')}
                tooltipText="Upper boundary for monthly estimated server cost. Leave blank for unconstrained."
                placeholder="e.g. 10000"
                error={errors.maxPrice}
                helperText="Leave empty for unconstrained sizing."
              />

              <div className="form-group">
                <label className="form-label">
                  Performance priority
                </label>
                <div className="priority-control" role="radiogroup" aria-label="Performance priority">
                  {(['balanced', 'cheapest', 'performance'] as PerformancePriority[]).map((p) => (
                    <label
                      key={p}
                      className={`priority-item ${formValues.priority === p ? 'is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={formValues.priority === p}
                        onChange={() => setFormValues((prev) => ({ ...prev, priority: p }))}
                        className="sr-only"
                      />
                      <span>
                        {p === 'balanced'
                          ? 'Balanced'
                          : p === 'cheapest'
                          ? 'Cheapest'
                          : 'Best performance'}
                      </span>
                    </label>
                  ))}
                </div>
                <span className="form-help">
                  Weights ranking toward lowest financial expenditure vs. maximum compute overhead.
                </span>
              </div>
            </div>

            {/* Optional constraint test */}
            <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-default)' }}>
              <div style={{ maxWidth: '320px' }}>
                <NumberInput
                  id="minRamGB"
                  label="Minimum RAM constraint (optional)"
                  unit="GB RAM"
                  value={formValues.minRamGB || ''}
                  onChange={handleNumberChange('minRamGB')}
                  tooltipText="Enforces a minimum RAM floor to evaluate trade-offs when conflicting with priority."
                  placeholder="e.g. 64"
                  helperText="Use to evaluate trade-off detection (e.g. 64 GB with Cheapest priority)."
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Form Submission Actions */}
      <div className="form-submit-row">
        <button type="button" className="btn btn-secondary" onClick={onReset}>
          <RotateCcw size={14} />
          <span>Reset inputs</span>
        </button>

        <button type="submit" className="btn btn-primary btn-lg">
          <span>Generate recommendations</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
};
