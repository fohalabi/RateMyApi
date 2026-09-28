import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import { assertPublicEndpoint, normalizeEndpointUrl, UnsafeEndpointError } from '@/lib/endpoint-security';

export async function POST(req: NextRequest) {
  try {
    const { name, url, description } = await req.json();

    // 1. Basic Validation (Crucial for the portfolio)
    if (typeof name !== 'string' || !name.trim() || !url) {
      return NextResponse.json({ message: 'Missing name or URL' }, { status: 400 });
    }

    if (name.trim().length > 100 || (typeof description === 'string' && description.length > 1_000)) {
      return NextResponse.json({ message: 'Name or description is too long.' }, { status: 400 });
    }

    const endpointUrl = normalizeEndpointUrl(url);
    await assertPublicEndpoint(endpointUrl);

    // 2. Database Insertion
    const newApi = await prisma.api.create({
      data: {
        name: name.trim(),
        url: endpointUrl.toString(),
        description: typeof description === 'string' ? description.trim() || null : null,
      },
    });

    // 3. Success Response
    return NextResponse.json(newApi, { status: 201 });

  } catch (error) {
    console.error('API submission error:', error);

    if (error instanceof UnsafeEndpointError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    
    // Check for specific Prisma errors (e.g., unique constraint violation on 'url')
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ message: 'This API URL has already been submitted.' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
