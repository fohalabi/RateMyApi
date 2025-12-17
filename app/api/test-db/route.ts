import { NextResponse } from 'next/server';
   import prisma from '@/lib/prisma';

   export async function GET() {
     try {
       await prisma.$connect();
       return NextResponse.json({ status: 'Connected!' });
     } catch (error) {
       return NextResponse.json({ error: String(error) }, { status: 500 });
     }
   }