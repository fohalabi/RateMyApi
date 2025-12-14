'use client';

import { PerformanceTestHistory } from '@/types/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function PerformanceChart({ history }: { history: PerformanceTestHistory[] }) {
    if (history.length === 0) {
        return (
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-white">Latency (ms) - Last 24h</h3>
                <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No performance tests recorded yet.</p>
                </div>
            </div>
        );
    }

    const chartData = history.slice(-20).map((test) => ({
        name: new Date(test.timestamp).toLocaleTimeString(),
        latency: test.latencyMs,
        status: test.statusCode,
    }));

    return (
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-white">Latency (ms) - Last 24h</h3>
            
            <div className="h-64 mb-4">
                <LineChart width={700} height={250} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                        dataKey="name" 
                        stroke="#9CA3AF" 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <YAxis 
                        stroke="#9CA3AF" 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="latency" 
                        stroke="#14B8A6" 
                        strokeWidth={2}
                        dot={{ fill: '#14B8A6', r: 4 }}
                    />
                </LineChart>
            </div>
        </div>
    );
}