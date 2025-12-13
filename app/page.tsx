import Link from 'next/link';
import { ApiListing } from '@/types/api';

// This is a Server Component, fetching data directly on the server
async function getApis(): Promise<ApiListing[]> {
  // Use a relative path because this request happens server-to-server
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/list`, {
    cache: 'no-store', // Always fetch fresh data for the homepage
  });

  if (!response.ok) {
    // In a real app, you'd handle this better (e.g., logging, redirect)
    console.error('Failed to fetch APIs:', response.statusText);
    return [];
  }

  return response.json();
}

// Helper component for star rating (Simple representation)
const RatingDisplay = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;

    return (
        <span className="text-yellow-500">
            {'★'.repeat(fullStars)}
            <span className="text-gray-300">{'★'.repeat(emptyStars)}</span>
            <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
        </span>
    );
};

export default async function HomePage() {
  const apis = await getApis();

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-extrabold mb-8">API Performance & Rating Hub</h1>
      
      {apis.length === 0 ? (
        <p className="text-xl text-gray-500">
          No APIs submitted yet. Be the first to <Link href="/submit" className="text-indigo-600 hover:underline">submit an API</Link>!
        </p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Rating</th>
                <th className="px-6 py-3 text-left text-xs font-font-medium text-gray-500 uppercase tracking-wider">Latency (ms)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apis.map((api) => (
                <tr key={api.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    <Link href={`/api/${api.id}`}>
                      {api.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{api.url}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <RatingDisplay rating={api.avgRating} /> ({api.totalReviews})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    {api.latestLatency !== null 
                        ? `${api.latestLatency.toFixed(0)} ms`
                        : <span className="text-red-500">N/A</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}