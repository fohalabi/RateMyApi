import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: Params) {
  // Await params in Next.js 15
  const { id: apiId } = await context.params;
  console.log('Looking for api with ID:', apiId);

  try {
    // 1. Fetch the specific API with all related data
    const api = await prisma.api.findUnique({
      where: { id: apiId },
      include: {
        reviews: {
          orderBy: { dateCreated: 'desc' },
        },
        performanceTests: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!api) {
      return NextResponse.json({ message: 'API not found' }, { status: 404 });
    }

    // 2. Calculate Aggregate Metrics
    const totalRatings = api.reviews.length;
    const averageRating = totalRatings > 0
      ? api.reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings
      : 0;

    // 3. Format the final response object
    const responseData = {
      id: api.id,
      name: api.name,
      url: api.url,
      description: api.description,
      avgRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: totalRatings,
      
      // Data for the Chart (Full history of latency)
      performanceHistory: api.performanceTests.map(test => ({
        timestamp: test.timestamp,
        latencyMs: test.latencyMs,
        statusCode: test.statusCode,
      })),

      // Reviews list
      reviews: api.reviews.map(review => ({
        rating: review.rating,
        textContent: review.textContent,
        dateCreated: review.dateCreated,
      })),
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error(`API stats retrieval error for ID ${apiId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}