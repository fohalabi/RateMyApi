import type { PerformanceMetrics, PerformanceTestHistory, TimeRange } from '@/types/api';

export const TIME_RANGES: Record<TimeRange, { label: string; durationMs: number }> = {
  '24h': { label: '24 hours', durationMs: 24 * 60 * 60 * 1_000 },
  '7d': { label: '7 days', durationMs: 7 * 24 * 60 * 60 * 1_000 },
  '30d': { label: '30 days', durationMs: 30 * 24 * 60 * 60 * 1_000 },
};

export function isTimeRange(value: string | null): value is TimeRange {
  return value !== null && value in TIME_RANGES;
}

function percentile(values: number[], percentileValue: number) {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil(percentileValue * sorted.length) - 1);
  return sorted[index];
}

export function calculatePerformanceMetrics(history: PerformanceTestHistory[]): PerformanceMetrics {
  if (history.length === 0) {
    return {
      uptimePercentage: null,
      p50LatencyMs: null,
      p95LatencyMs: null,
      latestLatencyMs: null,
      latestStatusCode: null,
      lastCheckedAt: null,
      successfulChecks: 0,
      totalChecks: 0,
    };
  }

  const successfulTests = history.filter(({ statusCode }) => statusCode >= 200 && statusCode < 400);
  const successfulLatencies = successfulTests.map(({ latencyMs }) => latencyMs);
  const latest = history[history.length - 1];

  return {
    uptimePercentage: Number(((successfulTests.length / history.length) * 100).toFixed(2)),
    p50LatencyMs: percentile(successfulLatencies, 0.5),
    p95LatencyMs: percentile(successfulLatencies, 0.95),
    latestLatencyMs: latest.statusCode === 0 ? null : latest.latencyMs,
    latestStatusCode: latest.statusCode,
    lastCheckedAt: latest.timestamp,
    successfulChecks: successfulTests.length,
    totalChecks: history.length,
  };
}
