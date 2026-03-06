import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const phrase = await prisma.phrase.findFirst({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ phrase });
}
