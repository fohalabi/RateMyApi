import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { apiId, rating, textContent } = await req.json();

    // 1. Basic Validation
    if (!apiId || !rating || typeof rating !== 'number') {
      return NextResponse.json({ message: 'Missing API ID or invalid rating.' }, { status: 400 });
    }
    
    // Ensure rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    // 2. Database Insertion
    const newReview = await prisma.review.create({
      data: {
        // Link the review to the API
        apiId: apiId, 
        rating: Math.floor(rating), // Store as an integer
        textContent: textContent || '', // Allow empty text, but prevent null
      },
    });

    // 3. Success Response
    return NextResponse.json(newReview, { status: 201 });

  } catch (error) {
    console.error('Review submission error:', error);
    
    // Check if the API ID actually exists
    if (error instanceof Error && 'code' in error && error.code === 'P2003') {
        return NextResponse.json({ message: 'The API ID provided does not exist.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}