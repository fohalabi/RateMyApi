import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { probeEndpoint } from '@/lib/probe-endpoint';

const CONCURRENCY = 5;

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const apis = await prisma.api.findMany();
  let checked = 0;
  let failed = 0;

  async function worker() {
    while (true) {
      const api = apis.shift();
      if (!api) return;

      try {
        const result = await probeEndpoint(api.url);
        await prisma.performanceTest.create({ data: { apiId: api.id, ...result } });
        checked += 1;
      } catch (error) {
        console.error(`Probe failed for API ${api.id}:`, error instanceof Error ? error.message : error);
        await prisma.performanceTest.create({
          data: { apiId: api.id, latencyMs: 10_000, statusCode: 0 },
        });
        checked += 1;
        failed += 1;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, apis.length) }, () => worker()));

  return NextResponse.json({ success: true, checked, failed });
}
