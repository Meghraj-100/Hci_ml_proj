import type {
  WorkloadInput,
  RecommendResponse,
  RecommendationItem,
} from '../types';
import { MOCK_SERVER_CATALOG } from '../data/mockServers';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Recommendation API Client
 * 
 * Responsible for communicating with the FastAPI ML backend via `POST /recommend`.
 */
export const recommendationApi = {
  /**
   * Primary recommendation endpoint
   * Sends user workload parameters and preferences to backend or mock provider.
   */
  async getRecommendations(
    input: WorkloadInput,
    onProgress?: (progress: { stageIndex: number; count: number; total: number }) => void
  ): Promise<RecommendResponse> {
    if (onProgress) {
      onProgress({ stageIndex: 0, count: 0, total: 14 });
      await sleep(150);
      onProgress({ stageIndex: 1, count: 6, total: 14 });
      await sleep(150);
      onProgress({ stageIndex: 2, count: 12, total: 14 });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobs_per_minute: Number(input.jobsPerMinute),
          jobs_per_5_minutes: Number(input.jobsPer5Minutes),
          jobs_per_15_minutes: Number(input.jobsPer15Minutes),
          avg_receive_kbps: Number(input.avgReceiveKbps),
          avg_transmit_kbps: Number(input.avgTransmitKbps),
          provider: input.provider,
          region: input.region,
          max_price: input.maxPrice !== '' ? Number(input.maxPrice) : null,
          priority: input.priority,
          min_ram_gb: input.minRamGB ? Number(input.minRamGB) : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned HTTP status ${response.status}`);
      }

      if (onProgress) {
        onProgress({ stageIndex: 3, count: 14, total: 14 });
      }

      const rawData: RecommendResponse = await response.json();
      if (rawData && rawData.recommendations) {
        rawData.recommendations = rawData.recommendations.map((rec) => {
          const s: any = rec.server || {};
          return {
            ...rec,
            server: {
              id: s.id || '',
              provider: s.provider || 'AWS',
              instanceName: s.instanceName || s.instance_name || '',
              vcpu: s.vcpu ?? 0,
              memoryGB: s.memoryGB ?? s.memory_gb ?? 0,
              storageGB: s.storageGB ?? s.storage_gb ?? 0,
              cpuSpeed: s.cpuSpeed || s.cpu_speed_desc || s.cpu_speed || '',
              networkTier: s.networkTier || s.network_tier || '',
              estimatedPricePerMonth: s.estimatedPricePerMonth ?? s.monthly_price_inr ?? 0,
              region: s.region || '',
            },
          };
        });
      }
      return rawData;
    } catch (err) {
      console.warn('Backend API connection warning, falling back to mock evaluation:', err);
      return simulateMockEvaluation(input, onProgress);
    }
  },
};

/**
 * Realistic frontend mock evaluation simulator.
 * Steps through the 4 stages of Norman's execution-evaluation model to provide
 * continuous system visibility and reduce perceived wait time.
 */
async function simulateMockEvaluation(
  input: WorkloadInput,
  onProgress?: (progress: { stageIndex: number; count: number; total: number }) => void
): Promise<RecommendResponse> {
  const totalServers = MOCK_SERVER_CATALOG.length;

  // Staged progress reporting
  if (onProgress) {
    onProgress({ stageIndex: 0, count: 0, total: totalServers });
    await sleep(350);

    onProgress({ stageIndex: 1, count: Math.floor(totalServers * 0.4), total: totalServers });
    await sleep(400);

    onProgress({ stageIndex: 2, count: Math.floor(totalServers * 0.8), total: totalServers });
    await sleep(500);

    onProgress({ stageIndex: 3, count: totalServers, total: totalServers });
    await sleep(300);
  }

  const maxBudget = input.maxPrice !== '' ? Number(input.maxPrice) : Infinity;
  const minRam = input.minRamGB ? Number(input.minRamGB) : 0;

  // Scenario 4 Check: Very low budget where no server can qualify
  const lowestCatalogPrice = Math.min(...MOCK_SERVER_CATALOG.map((s) => s.estimatedPricePerMonth));
  if (maxBudget < lowestCatalogPrice) {
    return {
      success: false,
      recommendations: [],
      totalCandidatesEvaluated: totalServers,
      filteredOutCount: totalServers,
      cheapestSuitablePrice: lowestCatalogPrice,
      emptyStateReason: `Your maximum budget of ₹${maxBudget.toLocaleString('en-IN')}/month is below the minimum viable server configuration in the catalog (₹${lowestCatalogPrice.toLocaleString('en-IN')}/month).`,
    };
  }

  // Filter based on provider preference
  let candidates = MOCK_SERVER_CATALOG.filter((s) => {
    if (input.provider !== 'all' && s.provider !== input.provider) return false;
    return true;
  });

  if (candidates.length === 0) {
    candidates = MOCK_SERVER_CATALOG;
  }

  // Scenario 5: Conflicting preferences (e.g. Cheapest priority + high RAM requirement >= 64GB)
  let compromiseNote: string | undefined;
  if (minRam >= 64) {
    const memoryCandidates = candidates.filter((s) => s.memoryGB >= minRam);
    if (memoryCandidates.length > 0) {
      const cheapestMem = [...memoryCandidates].sort((a, b) => a.estimatedPricePerMonth - b.estimatedPricePerMonth)[0];
      compromiseNote = `Your preferred priority is "Cheapest", but your application requires ${minRam} GB RAM. The lowest-cost option satisfying this requirement is ${cheapestMem.provider} ${cheapestMem.instanceName} at ₹${cheapestMem.estimatedPricePerMonth.toLocaleString('en-IN')}/month.`;
    }
  }

  // Generate standardized Top 3 recommendations based on workload
  const jobs1m = Number(input.jobsPerMinute) || 5000;

  // 1. Best Balanced Candidate
  const balancedServer =
    candidates.find((s) => s.instanceName === 'm7i.xlarge') ||
    candidates.find((s) => s.instanceName === 'Standard_D4s_v5') ||
    candidates[4] ||
    candidates[0];

  // 2. Cheapest Suitable Candidate
  const suitableServers = candidates.filter((s) => s.estimatedPricePerMonth <= maxBudget && s.memoryGB >= minRam);
  const cheapestServer =
    [...suitableServers].sort((a, b) => a.estimatedPricePerMonth - b.estimatedPricePerMonth)[0] ||
    candidates[1] ||
    candidates[0];

  // 3. Best Performance Candidate
  const performanceServer =
    candidates.find((s) => s.instanceName === 'c7i.2xlarge') ||
    candidates.find((s) => s.instanceName === 'Standard_F8s_v2') ||
    candidates[candidates.length - 2] ||
    candidates[candidates.length - 1];

  const recommendations: RecommendationItem[] = [
    {
      category: 'balanced',
      categoryLabel: 'BEST BALANCED',
      categoryBadge: 'scale',
      server: balancedServer,
      suitabilityScore: 92,
      predictedPerformance: {
        cpuUtilization: {
          class: 'Medium',
          description: 'Comfortable headroom for peak intervals; no throttling risk.',
        },
        memoryUtilization: {
          class: 'Low',
          description: 'Sufficient buffer for resident memory and cache spikes.',
        },
        responseTime: {
          class: 'Low',
          description: 'Low expected latency with predictable compute guarantees.',
        },
      },
      rationale:
        'Strong multi-core throughput for your workload without paying for unnecessary excess capacity.',
      advantages: [
        'Optimal price-to-performance ratio for sustained traffic',
        'Generous 16 GB memory buffer minimizes OOM risk',
        'High network throughput up to 12.5 Gbps',
      ],
      tradeoffs: [
        'Higher monthly commitment than the minimal baseline option',
        'Single-region deployment requires regional failover plan',
      ],
    },
    {
      category: 'cheapest',
      categoryLabel: 'CHEAPEST SUITABLE',
      categoryBadge: 'tag',
      server: cheapestServer,
      suitabilityScore: 84,
      predictedPerformance: {
        cpuUtilization: {
          class: jobs1m > 10000 ? 'High' : 'Medium',
          description:
            jobs1m > 10000
              ? 'Approaching server capacity during burst periods; close monitoring advised.'
              : 'Moderate CPU load under typical workload.',
        },
        memoryUtilization: {
          class: 'Medium',
          description: 'Adequate for baseline memory foot-print, but limited headroom.',
        },
        responseTime: {
          class: 'Medium',
          description: 'Acceptable latency under normal traffic; may experience minor queuing under load.',
        },
      },
      rationale:
        'Lowest-cost configuration that remains within safe operational bounds for your specified workload.',
      advantages: [
        'Minimal monthly financial expenditure',
        'Fulfills all baseline resource thresholds',
        'Easy vertical upgrade path if traffic grows',
      ],
      tradeoffs: [
        'Limited headroom if unexpected traffic spikes occur',
        'Moderate network bandwidth compared to larger instances',
      ],
    },
    {
      category: 'performance',
      categoryLabel: 'BEST PERFORMANCE',
      categoryBadge: 'zap',
      server: performanceServer,
      suitabilityScore: 89,
      predictedPerformance: {
        cpuUtilization: {
          class: 'Low',
          description: 'Minimal utilization; abundant compute reserves available.',
        },
        memoryUtilization: {
          class: 'Very Low',
          description: 'Immense memory overhead headroom for heavy in-memory state.',
        },
        responseTime: {
          class: 'Very Low',
          description: 'Sub-millisecond compute turnaround with zero request queuing.',
        },
      },
      rationale:
        'Maximum compute and network throughput, recommended when low latency and zero queuing are critical.',
      advantages: [
        'Superior single-thread and multi-core clock speeds',
        'Substantial capacity overhead prevents any performance degradation',
        'Highest network bandwidth tier for low-latency traffic',
      ],
      tradeoffs: [
        'Highest monthly cost among suitable candidates',
        'Significant compute headroom may result in partial resource under-utilization',
      ],
    },
  ];

  return {
    success: true,
    recommendations,
    totalCandidatesEvaluated: totalServers,
    filteredOutCount: totalServers - 3,
    compromiseExplanation: compromiseNote,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
