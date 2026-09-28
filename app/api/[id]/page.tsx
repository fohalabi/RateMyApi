import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Star } from 'lucide-react';
import { getApiDetails } from '@/lib/api-details';
import { PerformanceDashboard } from './PerformanceCharts';

function RatingDisplay({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);

  return (
    <span className="text-yellow-400" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(fullStars)}
      <span className="text-gray-600">{'★'.repeat(5 - fullStars)}</span>
    </span>
  );
}

export default async function ApiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiDetails = await getApiDetails(id, '24h');

  if (!apiDetails) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        All APIs
      </Link>

      <header className="mb-8 flex flex-col gap-5 border-b border-gray-800 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{apiDetails.name}</h1>
            {apiDetails.metrics.latestStatusCode !== null && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                apiDetails.metrics.latestStatusCode >= 200 && apiDetails.metrics.latestStatusCode < 400
                  ? 'bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20'
                  : 'bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/20'
              }`}>
                {apiDetails.metrics.latestStatusCode >= 200 && apiDetails.metrics.latestStatusCode < 400
                  ? 'Operational'
                  : 'Unavailable'}
              </span>
            )}
          </div>
          <p className="max-w-3xl text-gray-400">{apiDetails.description || 'No description provided.'}</p>
          <a
            href={apiDetails.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex max-w-full items-center gap-2 break-all text-sm text-teal-400 hover:text-teal-300"
          >
            {apiDetails.url}
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-xl border border-gray-700 bg-gray-800 px-5 py-4">
          <span className="rounded-lg bg-yellow-400/10 p-2"><Star className="h-5 w-5 fill-yellow-400 text-yellow-400" /></span>
          <div>
            <p className="text-xl font-bold text-white">{apiDetails.avgRating.toFixed(1)}</p>
            <p className="text-xs text-gray-500">{apiDetails.totalReviews} reviews</p>
          </div>
        </div>
      </header>

      <PerformanceDashboard
        apiId={apiDetails.id}
        initialHistory={apiDetails.performanceHistory}
        initialMetrics={apiDetails.metrics}
        initialRange={apiDetails.selectedRange}
      />

      <section className="mt-8 rounded-xl border border-gray-700 bg-gray-800 p-5 sm:p-6" aria-labelledby="reviews-heading">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 id="reviews-heading" className="text-xl font-semibold text-white">Developer reviews</h2>
            <p className="mt-1 text-sm text-gray-400">Feedback from developers who have used this API.</p>
          </div>
          <Link
            href={`/review/${apiDetails.id}`}
            className="shrink-0 rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600"
          >
            Write a review
          </Link>
        </div>

        {apiDetails.reviews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-700 py-10 text-center text-gray-500">
            Be the first to share your experience.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {apiDetails.reviews.map((review) => (
              <article key={review.id} className="rounded-lg border border-gray-700 bg-gray-900/50 p-5">
                <RatingDisplay rating={review.rating} />
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  {review.textContent || 'Rating submitted without a written review.'}
                </p>
                <time className="mt-4 block text-xs text-gray-500" dateTime={review.dateCreated}>
                  {new Date(review.dateCreated).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </time>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
