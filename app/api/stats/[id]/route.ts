import { NextRequest, NextResponse } from 'next/server';
import { getApiDetails } from '@/lib/api-details';
import { isTimeRange } from '@/lib/performance-metrics';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: Params) {
  const { id: apiId } = await context.params;
  const requestedRange = request.nextUrl.searchParams.get('range');

  if (requestedRange !== null && !isTimeRange(requestedRange)) {
    return NextResponse.json({ message: 'Unsupported performance range.' }, { status: 400 });
  }

  try {
    const range = isTimeRange(requestedRange) ? requestedRange : '24h';
    const api = await getApiDetails(apiId, range);
    if (!api) {
      return NextResponse.json({ message: 'API not found' }, { status: 404 });
    }

    return NextResponse.json(api);
  } catch (error) {
    console.error(`API stats retrieval error for ID ${apiId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
