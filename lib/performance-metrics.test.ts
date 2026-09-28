import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePerformanceMetrics, isTimeRange } from './performance-metrics.ts';

test('calculates uptime and latency percentiles from successful checks', () => {
  const metrics = calculatePerformanceMetrics([
    { timestamp: '2026-01-01T00:00:00.000Z', latencyMs: 100, statusCode: 200 },
    { timestamp: '2026-01-01T00:15:00.000Z', latencyMs: 200, statusCode: 204 },
    { timestamp: '2026-01-01T00:30:00.000Z', latencyMs: 10_000, statusCode: 0 },
    { timestamp: '2026-01-01T00:45:00.000Z', latencyMs: 400, statusCode: 302 },
  ]);

  assert.equal(metrics.uptimePercentage, 75);
  assert.equal(metrics.p50LatencyMs, 200);
  assert.equal(metrics.p95LatencyMs, 400);
  assert.equal(metrics.latestLatencyMs, 400);
  assert.equal(metrics.latestStatusCode, 302);
  assert.equal(metrics.successfulChecks, 3);
  assert.equal(metrics.totalChecks, 4);
});

test('returns an empty metric set when no checks exist', () => {
  assert.deepEqual(calculatePerformanceMetrics([]), {
    uptimePercentage: null,
    p50LatencyMs: null,
    p95LatencyMs: null,
    latestLatencyMs: null,
    latestStatusCode: null,
    lastCheckedAt: null,
    successfulChecks: 0,
    totalChecks: 0,
  });
});

test('accepts only supported time ranges', () => {
  assert.equal(isTimeRange('24h'), true);
  assert.equal(isTimeRange('7d'), true);
  assert.equal(isTimeRange('30d'), true);
  assert.equal(isTimeRange('all'), false);
});
