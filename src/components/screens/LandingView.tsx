import React from 'react';
import { Activity, ArrowRight, Gauge, Network, ScanSearch, ServerCog, ShieldCheck, Sparkles } from 'lucide-react';
import './LandingView.css';

interface LandingViewProps {
  onStart: () => void;
  onSelectPreset: (presetKey: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart, onSelectPreset }) => {
  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-kicker">
          <Sparkles size={14} />
          <span>Model-assisted infrastructure planning</span>
        </div>

        <h1 className="hero-headline">Size cloud capacity with confidence</h1>

        <p className="hero-supporting">
          Bring together demand, network activity, and budget constraints. The recommendation engine turns
          them into a clear shortlist of cloud servers.
        </p>

        <div className="hero-cta-group">
          <button type="button" className="btn btn-primary btn-lg" onClick={onStart}>
            <span>Start recommendation</span>
            <ArrowRight size={16} />
          </button>

          <a href="#how-it-works" className="btn btn-secondary btn-lg">
            <span>How it works</span>
          </a>
        </div>

        <div className="hero-signal-grid" aria-label="Evaluation signals">
          <div className="hero-signal"><Activity size={16} /><span><strong>3</strong> demand windows</span></div>
          <div className="hero-signal"><Network size={16} /><span><strong>2</strong> network signals</span></div>
          <div className="hero-signal"><ServerCog size={16} /><span><strong>14</strong> candidate servers</span></div>
        </div>
      </section>

      <section className="problem-panel panel" aria-label="Sizing decision trade-offs">
        <div className="problem-grid">
          <div className="problem-column">
            <div className="problem-heading"><span className="problem-icon"><Gauge size={18} /></span><h3>Risks of under-provisioning</h3></div>
            <p className="problem-intro">Avoid capacity decisions that leave your application exposed:</p>
            <ul className="problem-list">
              <li>High CPU saturation and thread starvation during bursts</li>
              <li>Out-of-memory (OOM) killer terminating critical processes</li>
              <li>Severe request queueing and degraded response latency</li>
            </ul>
          </div>

          <div className="problem-divider" aria-hidden="true" />

          <div className="problem-column">
            <div className="problem-heading"><span className="problem-icon"><ShieldCheck size={18} /></span><h3>Costs of over-provisioning</h3></div>
            <p className="problem-intro">Keep spend aligned with the workload you actually expect:</p>
            <ul className="problem-list">
              <li>Unjustified monthly infrastructure expenditure</li>
              <li>Idle vCPU cycles and unutilized memory allocation</li>
              <li>Compounded cost inefficiencies across multi-region deployments</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="steps-section">
        <div className="section-header">
          <span className="section-eyebrow">Recommendation flow</span>
          <h2>A clearer way to choose infrastructure</h2>
          <p>Use a compact evaluation flow that turns operational inputs into a defensible sizing decision.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card panel">
            <div className="step-card-top"><span className="step-card-icon"><Activity size={20} /></span><span className="step-card-num">01</span></div>
            <h3>Describe workload</h3>
            <p>
              Input anticipated request volume over 1, 5, and 15-minute intervals, along with average network
              bandwidth. Standardized units prevent input errors.
            </p>
          </div>

          <div className="step-card panel">
            <div className="step-card-top"><span className="step-card-icon"><ScanSearch size={20} /></span><span className="step-card-num">02</span></div>
            <h3>Evaluate candidates</h3>
            <p>
              Candidate AWS and Azure instances are benchmarked against your workload using independent
              CPU utilization, memory headroom, and latency models.
            </p>
          </div>

          <div className="step-card panel">
            <div className="step-card-top"><span className="step-card-icon"><ServerCog size={20} /></span><span className="step-card-num">03</span></div>
            <h3>Compare recommendations</h3>
            <p>
              Inspect the Top 3 options: Best balanced, Cheapest suitable, and Best performance. Detailed
              rationales explain the architectural trade-offs of each choice.
            </p>
          </div>
        </div>
      </section>

      <section className="presets-banner panel">
        <div className="presets-banner-inner">
          <div>
            <span className="section-eyebrow">Quick start</span>
            <h3>Start from a representative workload</h3>
            <p>Choose a scenario, then refine the inputs to match your application</p>
          </div>
          <div className="presets-button-row">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onSelectPreset('standard')}
            >
              Standard web application (5,000 jobs/min)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onSelectPreset('high-traffic')}
            >
              High-throughput API (18,000 jobs/min)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onSelectPreset('batch')}
            >
              Batch compute worker (35,000 jobs/min)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
