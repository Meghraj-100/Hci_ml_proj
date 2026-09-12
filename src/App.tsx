import React, { useState } from 'react';
import type { WorkloadInput, RecommendResponse } from './types';
import { recommendationApi } from './services/recommendationApi';
import { AppHeader } from './components/layout/AppHeader';
import { StepIndicator } from './components/layout/StepIndicator';
import type { FlowStep } from './components/layout/StepIndicator';
import { LandingView } from './components/screens/LandingView';
import { WorkloadForm } from './components/screens/WorkloadForm';
import { ProcessingView } from './components/screens/ProcessingView';
import { RecommendationsView } from './components/screens/RecommendationsView';
import { EmptyStateView } from './components/screens/EmptyStateView';
import './App.css';

const DEFAULT_WORKLOAD: WorkloadInput = {
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
};

type ViewState = 'landing' | 'input' | 'processing' | 'results' | 'empty';

export const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [currentStep, setCurrentStep] = useState<FlowStep>(1);
  const [workload, setWorkload] = useState<WorkloadInput>(DEFAULT_WORKLOAD);
  const [recommendResponse, setRecommendResponse] = useState<RecommendResponse | null>(null);

  // Processing state progress
  const [evalProgress, setEvalProgress] = useState({
    stageIndex: 0,
    count: 0,
    total: 14,
  });

  const handleStart = () => {
    setView('input');
    setCurrentStep(1);
  };

  const handleSelectPreset = (presetKey: string) => {
    if (presetKey === 'standard') {
      setWorkload({
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
    } else if (presetKey === 'high-traffic') {
      setWorkload({
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
    } else if (presetKey === 'batch') {
      setWorkload({
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
    }
    setView('input');
    setCurrentStep(1);
  };

  const handleFormSubmit = async (values: WorkloadInput) => {
    setWorkload(values);
    setView('processing');
    setCurrentStep(2);

    try {
      const result = await recommendationApi.getRecommendations(values, (prog) => {
        setEvalProgress(prog);
      });

      setRecommendResponse(result);

      if (result.success && result.recommendations.length > 0) {
        setView('results');
        setCurrentStep(3);
      } else {
        setView('empty');
        setCurrentStep(2);
      }
    } catch (err) {
      console.error('Recommendation API error:', err);
      // Fallback empty/error state
      setRecommendResponse({
        success: false,
        recommendations: [],
        totalCandidatesEvaluated: 0,
        filteredOutCount: 0,
        emptyStateReason: 'Unable to communicate with the recommendation engine. Please check parameters.',
      });
      setView('empty');
    }
  };

  const handleAdjustBudget = (suggestedPrice?: number) => {
    if (suggestedPrice) {
      setWorkload((prev) => ({
        ...prev,
        maxPrice: suggestedPrice,
      }));
    }
    setView('input');
    setCurrentStep(1);
  };

  const handleEditInputs = () => {
    setView('input');
    setCurrentStep(1);
  };

  const handleReset = () => {
    setWorkload(DEFAULT_WORKLOAD);
    setRecommendResponse(null);
    setView('input');
    setCurrentStep(1);
  };

  const handleNavigateHome = () => {
    setView('landing');
    setCurrentStep(1);
  };

  return (
    <div className="app-shell">
      <AppHeader onReset={handleReset} onNavigateHome={handleNavigateHome} />

      {/* Step Indicator visible when actively in the recommendation workflow */}
      {view !== 'landing' && (
        <StepIndicator
          currentStep={currentStep}
          onStepClick={(s) => {
            if (s === 1) handleEditInputs();
            if (s === 3 && recommendResponse?.success) {
              setView('results');
              setCurrentStep(3);
            }
          }}
        />
      )}

      <main className="app-main">
        <div className="app-container">
          {view === 'landing' && (
            <LandingView onStart={handleStart} onSelectPreset={handleSelectPreset} />
          )}

          {view === 'input' && (
            <WorkloadForm
              initialValues={workload}
              onSubmit={handleFormSubmit}
              onReset={() => setWorkload(DEFAULT_WORKLOAD)}
            />
          )}

          {view === 'processing' && (
            <ProcessingView
              currentStageIndex={evalProgress.stageIndex}
              evaluatedCount={evalProgress.count}
              totalServers={evalProgress.total}
            />
          )}

          {view === 'results' && recommendResponse && (
            <RecommendationsView
              recommendations={recommendResponse.recommendations}
              workload={workload}
              compromiseNote={recommendResponse.compromiseExplanation}
              onEditInputs={handleEditInputs}
              onReset={handleReset}
            />
          )}

          {view === 'empty' && (
            <EmptyStateView
              reason={recommendResponse?.emptyStateReason}
              cheapestSuitablePrice={recommendResponse?.cheapestSuitablePrice}
              onAdjustBudget={handleAdjustBudget}
              onEditRequirements={handleEditInputs}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="app-container footer-inner">
          <div className="footer-left">
            <span className="footer-title">Cloud Server Recommendation System</span>
            <span className="footer-desc">
              Human-Computer Interaction (HCI) + Machine Learning Academic Project
            </span>
          </div>
          <div className="footer-right">
            <span className="footer-meta">
              Pure Frontend Architecture · Decoupled REST Contract (<code>POST /recommend</code>)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
