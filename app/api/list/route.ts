import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch all APIs, including their Reviews and Performance Tests
    const apis = await prisma.api.findMany({
      include: {
        reviews: {
          select: { rating: true },
        },
        performanceTests: {
          // Select only the most recent test result for quick display
          orderBy: { timestamp: 'desc' },
          take: 1,
          select: { latencyMs: true },
        },
      },
      orderBy: { dateSubmitted: 'desc' }, // Default sort by newest
    });

    // 2. Map and Calculate Metrics
    const formattedApis = apis.map(api => {
      // Calculate Average Rating
      const totalRatings = api.reviews.length;
      const averageRating = totalRatings > 0
        ? api.reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings
        : 0;

      // Get Latest Latency
      const latestLatency = api.performanceTests[0]?.latencyMs ?? null;

      return {
        id: api.id,
        name: api.name,
        url: api.url,
        avgRating: parseFloat(averageRating.toFixed(1)), 
        latestLatency: latestLatency,
        totalReviews: totalRatings,
      };
    });

    return NextResponse.json(formattedApis, { status: 200 });

  } catch (error) {
    console.error('API list retrieval error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}