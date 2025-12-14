import { notFound } from 'next/navigation';
import { ApiDetails, Review, PerformanceTestHistory } from '@/types/api';
import Link from 'next/link';

// Helper component for star rating
const RatingDisplay = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;

    return (
        <span className="text-yellow-400">
            {'★'.repeat(fullStars)}
            <span className="text-gray-600">{'★'.repeat(emptyStars)}</span>
        </span>
    );
};

// Performance Chart - Dark themed
const PerformanceChartMock = ({ history }: { history: PerformanceTestHistory[] }) => (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-white">Latency (ms) - Last 24h</h3>
        {history.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">No performance tests recorded yet.</p>
            </div>
        ) : (
            <div className="space-y-3">
                {/* Chart placeholder - In production, use a charting library like recharts */}
                <div className="h-64 bg-gray-900 rounded-lg p-4 flex items-end justify-between gap-2">
                    {history.slice(-20).map((test, index) => {
                        const maxLatency = Math.max(...history.map(t => t.latencyMs));
                        const height = (test.latencyMs / maxLatency) * 100;
                        return (
                            <div 
                                key={index} 
                                className="flex-1 bg-teal-500 rounded-t transition-all hover:bg-teal-400"
                                style={{ height: `${height}%`, minHeight: '8px' }}
                                title={`${test.latencyMs.toFixed(0)}ms - ${new Date(test.timestamp).toLocaleTimeString()}`}
                            />
                        );
                    })}
                </div>
                
                {/* Recent tests list */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {history.slice(-5).reverse().map((test, index) => (
                        <div key={index} className="flex justify-between items-center text-sm border-b border-gray-700 pb-2">
                            <span className="text-gray-400">{new Date(test.timestamp).toLocaleString()}</span>
                            <span className={`font-mono font-medium ${test.statusCode >= 400 ? 'text-red-400' : 'text-green-400'}`}>
                                {test.latencyMs.toFixed(0)} ms ({test.statusCode})
                            </span>
                        </div>
                    ))}
                </div>
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
    
    // Calculate overall health score
    const healthyTests = apiDetails.performanceHistory.filter(t => t.statusCode >= 200 && t.statusCode < 400).length;
    const totalTests = apiDetails.performanceHistory.length;
    const healthPercentage = totalTests > 0 ? (healthyTests / totalTests) * 100 : 0;

    return (
        <div className="container mx-auto py-10 px-4">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-white">{apiDetails.name}</h1>
                <p className="text-teal-400 text-lg mb-1">{apiDetails.url}</p>
                <p className="text-gray-400 text-sm">
                    {apiDetails.description || "No description provided."}
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Chart and Stats */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Rating Card */}
                    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-teal-500 rounded-full p-3">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">
                                    {apiDetails.avgRating.toFixed(1)}/5 
                                    <span className="text-yellow-400 ml-2">★</span>
                                </div>
                                <RatingDisplay rating={apiDetails.avgRating} />
                                <p className="text-sm text-gray-400 mt-1">{apiDetails.totalReviews} reviews</p>
                            </div>
                        </div>
                    </div>

                    {/* Performance Chart */}
                    <PerformanceChartMock history={apiDetails.performanceHistory} />
                </div>
                
                {/* Right Column - Reviews */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-white">REVIEWS</h2>
                        
                        <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6">
                            {apiDetails.reviews.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Be the first to leave a review!</p>
                            ) : (
                                apiDetails.reviews.map((review, index) => (
                                    <div key={index} className="p-4 bg-gray-750 rounded-lg border border-gray-700">
                                        <div className="mb-2">
                                            <RatingDisplay rating={review.rating} />
                                        </div>
                                        <p className="text-sm text-gray-300 mb-2">{review.textContent}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(review.dateCreated).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {/* Write a Review Button */}
                        <Link 
                            href={`/review/${apiDetails.id}`} 
                            className="w-full block text-center py-3 px-4 rounded-lg text-white font-semibold bg-teal-500 hover:bg-teal-600 transition-all shadow-lg"
                        >
                            Write a Review
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}