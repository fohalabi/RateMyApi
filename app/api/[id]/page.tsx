// app/api/[id]/page.tsx

import { notFound } from 'next/navigation';
import { ApiDetails, Review, PerformanceTestHistory } from '@/types/api';
import Link from 'next/link';

// Helper component for star rating (Re-use from homepage)
const RatingDisplay = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;

    return (
        <span className="text-yellow-500">
            {'★'.repeat(fullStars)}
            <span className="text-gray-300">{'★'.repeat(emptyStars)}</span>
        </span>
    );
};

// Simple utility to display performance history data as text (for MVP)
// This is where a charting library would be integrated in production.
const PerformanceChartMock = ({ history }: { history: PerformanceTestHistory[] }) => (
    <div className="border p-4 rounded-lg bg-white shadow-sm">
        <h3 className="text-xl font-semibold mb-3">Performance History (Latency)</h3>
        {history.length === 0 ? (
            <p className="text-gray-500">No performance tests recorded yet.</p>
        ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.slice(-10).reverse().map((test, index) => ( // Show last 10 tests
                    <div key={index} className="flex justify-between items-center text-sm border-b pb-1">
                        <span className="text-gray-600">{new Date(test.timestamp).toLocaleString()}</span>
                        <span className={`font-mono font-medium ${test.statusCode >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                            {test.latencyMs.toFixed(0)} ms ({test.statusCode})
                        </span>
                    </div>
                ))}
            </div>
        )}
    </div>
);


async function getApiDetails(id: string): Promise<ApiDetails | null> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stats/${id}`, {
        cache: 'no-store',
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error('Failed to fetch API details');
    }

    return response.json();
}


export default async function ApiDetailPage({ params }: { params: { id: string } }) {
    const apiDetails = await getApiDetails(params.id);

    if (!apiDetails) {
        notFound();
    }
    
    // Calculate overall health score (simple average of latency status)
    const healthyTests = apiDetails.performanceHistory.filter(t => t.statusCode >= 200 && t.statusCode < 400).length;
    const totalTests = apiDetails.performanceHistory.length;
    const healthPercentage = totalTests > 0 ? (healthyTests / totalTests) * 100 : 0;

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-4xl font-bold mb-2">{apiDetails.name}</h1>
            <p className="text-gray-600 text-lg mb-4 truncate">{apiDetails.url}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* 1. Overall Stats Card */}
                <div className="bg-white p-6 rounded-lg shadow-lg col-span-1">
                    <h2 className="text-2xl font-semibold mb-4">Overall Score</h2>
                    <div className="flex items-center space-x-3">
                        <div className="text-5xl font-extrabold text-yellow-600">{apiDetails.avgRating.toFixed(1)}</div>
                        <div>
                            <RatingDisplay rating={apiDetails.avgRating} />
                            <p className="text-sm text-gray-500">{apiDetails.totalReviews} total reviews</p>
                        </div>
                    </div>
                </div>

                {/* 2. Uptime/Health Card */}
                <div className="bg-white p-6 rounded-lg shadow-lg col-span-1">
                    <h2 className="text-2xl font-semibold mb-4">Health/Uptime</h2>
                    <p className="text-4xl font-extrabold text-indigo-600">{healthPercentage.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Successful tests out of {totalTests}</p>
                </div>

                {/* 3. Description */}
                <div className="bg-white p-6 rounded-lg shadow-lg col-span-1">
                    <h2 className="text-2xl font-semibold mb-4">Description</h2>
                    <p className="text-gray-700 text-sm">
                        {apiDetails.description || "No description provided."}
                    </p>
                </div>
            </div>

            {/* Performance Chart & Review Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PerformanceChartMock history={apiDetails.performanceHistory} />
                </div>
                
                <div className="lg:col-span-1">
                    <Link 
                        href={`/review/${apiDetails.id}`} 
                        className="w-full inline-block text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 mb-6"
                    >
                        Submit A Review
                    </Link>
                    
                    <h2 className="text-2xl font-semibold mb-4 border-t pt-4">User Reviews ({apiDetails.totalReviews})</h2>
                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                        {apiDetails.reviews.length === 0 ? (
                            <p className="text-gray-500">Be the first to leave a review!</p>
                        ) : (
                            apiDetails.reviews.map((review, index) => (
                                <div key={index} className="p-4 border rounded-md bg-gray-50">
                                    <div className="mb-1">
                                        <RatingDisplay rating={review.rating} />
                                    </div>
                                    <p className="text-sm text-gray-800 italic mb-2">{review.textContent}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(review.dateCreated).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}