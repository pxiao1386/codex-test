import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEMO_USER_EMAIL = 'demo@coach.cn';

export async function POST() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    create: { email: DEMO_USER_EMAIL, name: '演示卖家' },
    update: {}
  });

  const scenarioCount = await prisma.scenario.count();
  const randomSkip = Math.floor(Math.random() * Math.max(scenarioCount, 1));
  const scenario = await prisma.scenario.findFirst({ skip: randomSkip });

  if (!scenario) {
    return NextResponse.json({ error: '暂无场景数据' }, { status: 400 });
  }

  const session = await prisma.liveSession.create({ data: { userId: user.id } });
  const turn = await prisma.liveTurn.create({
    data: {
      sessionId: session.id,
      scenarioId: scenario.id,
      viewerLine: scenario.prompt,
      chineseHint: scenario.chineseHint
    }
  });

  return NextResponse.json({
    sessionId: session.id,
    turnId: turn.id,
    viewerLine: turn.viewerLine,
    chineseHint: turn.chineseHint
  });
}
