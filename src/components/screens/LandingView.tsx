import React from 'react';
import { ArrowRight } from 'lucide-react';
import './LandingView.css';

interface LandingViewProps {
  onStart: () => void;
  onSelectPreset: (presetKey: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart, onSelectPreset }) => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-kicker">
          <span>Cloud infrastructure sizing system</span>
        </div>

        <h1 className="hero-headline">
          Find the right cloud server for your workload
        </h1>

        <p className="hero-supporting">
          Specify your application&apos;s expected request rate and network throughput. The recommendation
          engine evaluates compatible candidate instances across compute, memory, and latency models.
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
      </section>

      {/* Sizing Trade-offs (Engineering Context) */}
      <section className="problem-panel panel">
        <div className="problem-grid">
          <div className="problem-column">
            <h3 className="problem-head-under">Risks of under-provisioning</h3>
            <p className="problem-intro">Selecting an undersized instance leads to operational failures:</p>
            <ul className="problem-list">
              <li>High CPU saturation and thread starvation during bursts</li>
              <li>Out-of-memory (OOM) killer terminating critical processes</li>
              <li>Severe request queueing and degraded response latency</li>
            </ul>
          </div>

          <div className="problem-divider" aria-hidden="true" />

          <div className="problem-column">
            <h3 className="problem-head-over">Costs of over-provisioning</h3>
            <p className="problem-intro">Selecting an unnecessarily large instance wastes cloud capital:</p>
            <ul className="problem-list">
              <li>Unjustified monthly infrastructure expenditure</li>
              <li>Idle vCPU cycles and unutilized memory allocation</li>
              <li>Compounded cost inefficiencies across multi-region deployments</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Three-Step Workflow */}
      <section id="how-it-works" className="steps-section">
        <div className="section-header">
          <h2>Three-step evaluation workflow</h2>
          <p>A structured decision process designed to remove intuition and guesswork from server selection.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card panel">
            <div className="step-card-num">01</div>
            <h3>Describe workload</h3>
            <p>
              Input anticipated request volume over 1, 5, and 15-minute intervals, along with average network
              bandwidth. Standardized units prevent input errors.
            </p>
          </div>

          <div className="step-card panel">
            <div className="step-card-num">02</div>
            <h3>Evaluate candidates</h3>
            <p>
              Candidate AWS and Azure instances are benchmarked against your workload using independent
              CPU utilization, memory headroom, and latency models.
            </p>
          </div>

          <div className="step-card panel">
            <div className="step-card-num">03</div>
            <h3>Compare recommendations</h3>
            <p>
              Inspect the Top 3 options: Best balanced, Cheapest suitable, and Best performance. Detailed
              rationales explain the architectural trade-offs of each choice.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start Presets */}
      <section className="presets-banner panel">
        <div className="presets-banner-inner">
          <div>
            <h3>Sample workload presets</h3>
            <p>Select a representative workload scenario to immediately test the recommendation flow:</p>
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
