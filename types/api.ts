export interface ApiListing {
  id: string;
  name: string;
  url: string;
  avgRating: number;      
  latestLatency: number | null;
  totalReviews: number;
}

export interface Review {
    id: string;
    rating: number;
    textContent: string;
    dateCreated: string;
}

export interface PerformanceTestHistory {
    timestamp: string;
    latencyMs: number;
    statusCode: number;
}

export type TimeRange = '24h' | '7d' | '30d';

export interface PerformanceMetrics {
    uptimePercentage: number | null;
    p50LatencyMs: number | null;
    p95LatencyMs: number | null;
    latestLatencyMs: number | null;
    latestStatusCode: number | null;
    lastCheckedAt: string | null;
    successfulChecks: number;
    totalChecks: number;
}

// Full data structure for the detail page
export interface ApiDetails {
    id: string;
    name: string;
    url: string;
    description: string | null;
    avgRating: number;
    totalReviews: number;
    selectedRange: TimeRange;
    metrics: PerformanceMetrics;
    reviews: Review[];
    performanceHistory: PerformanceTestHistory[];
}
