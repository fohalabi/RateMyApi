import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import axios from 'axios';

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Run pinger logic here
  const apis = await prisma.api.findMany();
  
  for (const api of apis) {
    try {
      const startTime = Date.now();
      const response = await axios.get(api.url, { timeout: 10000, validateStatus: () => true });
      const latencyMs = Date.now() - startTime;
      
      await prisma.performanceTest.create({
        data: {
          apiId: api.id,
          latencyMs,
          statusCode: response.status,
        },
      });
    } catch (error) {
      await prisma.performanceTest.create({
        data: {
          apiId: api.id,
          latencyMs: 99999,
          statusCode: 0,
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}