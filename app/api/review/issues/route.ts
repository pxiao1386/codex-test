import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const records = await prisma.practiceRecord.findMany({ select: { issueType: true } });
  const summary = records.reduce<Record<string, number>>((acc, item) => {
    const key = item.issueType || '未分类';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({ summary });
}
