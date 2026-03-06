import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.phraseCategory.findMany({ include: { phrases: true }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ categories });
}
