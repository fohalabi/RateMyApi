import Link from 'next/link';
import { ApiListing } from '@/types/api';

// This is a Server Component, fetching data directly on the server
async function getApis(): Promise<ApiListing[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/list`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error('Failed to fetch APIs:', response.statusText);
    return [];
  }

  return response.json();
}

// Helper component for star rating
const RatingDisplay = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;

    return (
        <span className="text-yellow-400">
            {'★'.repeat(fullStars)}
            <span className="text-gray-600">{'★'.repeat(emptyStars)}</span>
            <span className="text-sm text-gray-400 ml-1">({rating.toFixed(1)})</span>
        </span>
    );
};

export default async function HomePage() {
  const apis = await getApis();
  
  // Get top 3 APIs by rating
  const top3 = [...apis]
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 3);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-extrabold mb-8 text-white">API Performance & Rating Hub</h1>
      
      {apis.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-12 max-w-2xl shadow-lg">
            <div className="mb-6">
              <svg 
                className="w-24 h-24 mx-auto text-teal-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              No APIs Yet!
            </h2>
            
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Be the first to submit an API and help developers discover 
              and rate the best APIs out there. Share your work or review 
              APIs you've used!
            </p>
            
            <Link 
              href="/submit"
              className="inline-block bg-teal-500 text-white font-semibold px-8 py-4 rounded-lg hover:bg-teal-600 transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Submit Your First API
            </Link>
            
            <p className="text-sm text-gray-500 mt-6">
              It only takes a minute to get started
            </p>
          </div>
        </div>
      ) : (
        // Main Layout with Sidebar
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Top 3 This Week */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">
                Top 3 This Week
              </h2>
              <div className="space-y-4">
                {top3.map((api, index) => (
                  <Link 
                    key={api.id}
                    href={`/api/${api.id}`}
                    className="block bg-gray-750 hover:bg-gray-700 border border-gray-600 rounded-lg p-4 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-teal-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm mb-1 truncate">
                          {api.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <RatingDisplay rating={api.avgRating} />
                          <span className="text-xs text-gray-400">
                            {api.latestLatency !== null ? `${api.latestLatency.toFixed(0)}ms` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - All APIs Table */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                  All APIs
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">API</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {apis.map((api) => (
                      <tr key={api.id} className="hover:bg-gray-750 transition">
                        <td className="px-6 py-4">
                          <Link href={`/api/${api.id}`} className="block">
                            <div className="text-sm font-medium text-teal-400 hover:text-teal-300 mb-1">
                              {api.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-md">
                              {api.url}
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <RatingDisplay rating={api.avgRating} />
                            <span className="text-gray-500 text-xs">
                              ({api.totalReviews})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {api.latestLatency !== null ? (
                            <span className="text-sm font-semibold text-gray-300">
                              {api.latestLatency.toFixed(0)}ms
                            </span>
                          ) : (
                            <span className="text-sm text-red-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}