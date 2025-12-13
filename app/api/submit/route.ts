import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

// Simple function to check if a string looks like a valid URL
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export async function POST(req: NextRequest) {
  try {
    const { name, url, description } = await req.json();

    // 1. Basic Validation (Crucial for the portfolio)
    if (!name || !url) {
      return NextResponse.json({ message: 'Missing name or URL' }, { status: 400 });
    }
    
    if (!isValidUrl(url)) {
      return NextResponse.json({ message: 'Invalid URL format' }, { status: 400 });
    }

    // 2. Database Insertion
    const newApi = await prisma.api.create({
      data: {
        name,
        url,
        description,
      },
    });

    // 3. Success Response
    return NextResponse.json(newApi, { status: 201 });

  } catch (error) {
    console.error('API submission error:', error);
    
    // Check for specific Prisma errors (e.g., unique constraint violation on 'url')
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ message: 'This API URL has already been submitted.' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}