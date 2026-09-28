'use client';

import { useState } from 'react';
import { Activity, Clock3, Gauge, Server } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PerformanceMetrics, PerformanceTestHistory, TimeRange } from '@/types/api';

interface PerformanceDashboardProps {
  apiId: string;
  initialHistory: PerformanceTestHistory[];
  initialMetrics: PerformanceMetrics;
  initialRange: TimeRange;
}

const ranges: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
];

function formatLatency(value: number | null) {
  return value === null ? '—' : `${value.toLocaleString()} ms`;
}

function MetricCard({ label, value, detail, icon }: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <span className="rounded-lg bg-gray-700/70 p-2 text-teal-400">{icon}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
    </div>
  );
}

export function PerformanceDashboard({ apiId, initialHistory, initialMetrics, initialRange }: PerformanceDashboardProps) {
  const [history, setHistory] = useState(initialHistory);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [selectedRange, setSelectedRange] = useState(initialRange);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestHealthy = metrics.latestStatusCode !== null
    && metrics.latestStatusCode >= 200
    && metrics.latestStatusCode < 400;
  const statusLabel = metrics.latestStatusCode === null
    ? 'No data'
    : latestHealthy ? 'Operational' : 'Unavailable';
  const chartData = history.map((test) => ({
    timestamp: test.timestamp,
    latency: test.statusCode === 0 ? null : test.latencyMs,
  }));

  async function selectRange(range: TimeRange) {
    if (range === selectedRange || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/stats/${apiId}?range=${range}`);
      if (!response.ok) throw new Error('Unable to load performance data.');
      const data = await response.json();
      setHistory(data.performanceHistory);
      setMetrics(data.metrics);
      setSelectedRange(range);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load performance data.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section aria-labelledby="performance-heading" className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Current status"
          value={statusLabel}
          detail={metrics.latestStatusCode === null ? 'Waiting for first check' : `HTTP ${metrics.latestStatusCode || 'network error'}`}
          icon={<Activity className={latestHealthy ? 'h-5 w-5 text-emerald-400' : 'h-5 w-5 text-rose-400'} />}
        />
        <MetricCard
          label="Uptime"
          value={metrics.uptimePercentage === null ? '—' : `${metrics.uptimePercentage}%`}
          detail={`${metrics.successfulChecks} of ${metrics.totalChecks} checks succeeded`}
          icon={<Server className="h-5 w-5" />}
        />
        <MetricCard
          label="Median latency"
          value={formatLatency(metrics.p50LatencyMs)}
          detail="50th percentile response time"
          icon={<Clock3 className="h-5 w-5" />}
        />
        <MetricCard
          label="P95 latency"
          value={formatLatency(metrics.p95LatencyMs)}
          detail="95% of successful checks are faster"
          icon={<Gauge className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-xl border border-gray-700 bg-gray-800 p-5 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="performance-heading" className="text-xl font-semibold text-white">Latency history</h2>
            <p className="mt-1 text-sm text-gray-400">
              {metrics.lastCheckedAt
                ? `Last checked ${new Date(metrics.lastCheckedAt).toLocaleString()}`
                : 'No monitoring checks recorded yet'}
            </p>
          </div>
          <div className="flex rounded-lg border border-gray-700 bg-gray-900 p-1" aria-label="Performance time range">
            {ranges.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => selectRange(range.value)}
                disabled={isLoading}
                aria-pressed={selectedRange === range.value}
                className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                  selectedRange === range.value
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                } disabled:cursor-wait disabled:opacity-60`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-950/50 p-3 text-sm text-red-300">{error}</p>}

        {history.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-gray-700 bg-gray-900/40">
            <div className="text-center">
              <Activity className="mx-auto mb-3 h-8 w-8 text-gray-600" />
              <p className="font-medium text-gray-300">No checks in this time range</p>
              <p className="mt-1 text-sm text-gray-500">Monitoring data will appear after the next scheduled check.</p>
            </div>
          </div>
        ) : (
          <div className={`h-72 w-full transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  stroke="#6B7280"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickFormatter={(value: string) => new Date(value).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: selectedRange === '24h' ? 'numeric' : undefined,
                  })}
                  minTickGap={36}
                />
                <YAxis
                  stroke="#6B7280"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickFormatter={(value: number) => `${value}ms`}
                />
                <Tooltip
                  labelFormatter={(value) => new Date(String(value)).toLocaleString()}
                  formatter={(value) => [`${Number(value).toLocaleString()} ms`, 'Latency']}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10 }}
                  labelStyle={{ color: '#D1D5DB' }}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#2DD4BF"
                  strokeWidth={2.5}
                  dot={history.length < 40 ? { fill: '#2DD4BF', r: 3 } : false}
                  activeDot={{ r: 5, fill: '#5EEAD4' }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
