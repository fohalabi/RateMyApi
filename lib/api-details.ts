import prisma from '@/lib/prisma';
import { calculatePerformanceMetrics, TIME_RANGES } from '@/lib/performance-metrics';
import type { ApiDetails, PerformanceTestHistory, TimeRange } from '@/types/api';

const MAX_PERFORMANCE_SAMPLES = 3_000;
const MAX_REVIEWS = 50;

export async function getApiDetails(apiId: string, range: TimeRange = '24h'): Promise<ApiDetails | null> {
  const rangeStart = new Date(Date.now() - TIME_RANGES[range].durationMs);
  const [api, ratingAggregate] = await Promise.all([
    prisma.api.findUnique({
      where: { id: apiId },
      include: {
        reviews: {
          orderBy: { dateCreated: 'desc' },
          take: MAX_REVIEWS,
        },
        performanceTests: {
          where: { timestamp: { gte: rangeStart } },
          orderBy: { timestamp: 'desc' },
          take: MAX_PERFORMANCE_SAMPLES,
        },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.review.aggregate({
      where: { apiId },
      _avg: { rating: true },
    }),
  ]);

  if (!api) return null;

  const performanceHistory: PerformanceTestHistory[] = api.performanceTests
    .reverse()
    .map((test) => ({
      timestamp: test.timestamp.toISOString(),
      latencyMs: test.latencyMs,
      statusCode: test.statusCode,
    }));
  const averageRating = ratingAggregate._avg.rating ?? 0;

  return {
    id: api.id,
    name: api.name,
    url: api.url,
    description: api.description,
    avgRating: Number(averageRating.toFixed(1)),
    totalReviews: api._count.reviews,
    reviews: api.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      textContent: review.textContent,
      dateCreated: review.dateCreated.toISOString(),
    })),
    selectedRange: range,
    metrics: calculatePerformanceMetrics(performanceHistory),
    performanceHistory,
  };
}
