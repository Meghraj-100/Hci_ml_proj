export type CloudProvider = 'all' | 'AWS' | 'Azure';
export type CloudRegion = 'all' | 'ap-south-1 (India)' | 'us-east-1 (US)' | 'eu-central-1 (EU)';
export type PerformancePriority = 'balanced' | 'cheapest' | 'performance';

export type PerformanceClass = 'Very Low' | 'Low' | 'Medium' | 'High';

export interface WorkloadInput {
  // Application Workload (Jobs)
  jobsPerMinute: number | '';
  jobsPer5Minutes: number | '';
  jobsPer15Minutes: number | '';

  // Network Activity (Kbps)
  avgReceiveKbps: number | '';
  avgTransmitKbps: number | '';

  // Preferences & Filters (Progressive Disclosure)
  provider: CloudProvider;
  region: CloudRegion;
  maxPrice: number | ''; // in ₹ / month
  priority: PerformancePriority;
  minRamGB?: number | ''; // for testing conflicting constraints
}

export interface ServerSpecification {
  id: string;
  provider: 'AWS' | 'Azure';
  instanceName: string;
  vcpu: number;
  memoryGB: number;
  storageGB: number;
  cpuSpeed: string;
  networkTier: string;
  estimatedPricePerMonth: number;
  region: string;
}

export interface PerformanceMetric {
  class: PerformanceClass;
  description: string;
}

export interface PredictedPerformance {
  cpuUtilization: PerformanceMetric;
  memoryUtilization: PerformanceMetric;
  responseTime: PerformanceMetric;
}

export interface RecommendationItem {
  category: PerformancePriority;
  categoryLabel: string;
  categoryBadge: 'scale' | 'tag' | 'zap';
  server: ServerSpecification;
  suitabilityScore: number; // 0 to 100
  predictedPerformance: PredictedPerformance;
  rationale: string;
  advantages: string[];
  tradeoffs: string[];
}

export interface RecommendResponse {
  success: boolean;
  recommendations: RecommendationItem[];
  totalCandidatesEvaluated: number;
  filteredOutCount: number;
  compromiseExplanation?: string;
  cheapestSuitablePrice?: number;
  emptyStateReason?: string;
}

export interface ProgressStage {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}
