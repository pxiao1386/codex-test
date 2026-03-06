import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { LIVE_SELLER_SYSTEM_PROMPT, getOpenAIClient } from '@/lib/openai';

const schema = z.object({
  turnId: z.string().min(1),
  userReply: z.string().min(1)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: '参数错误' }, { status: 400 });
  }

  const { turnId, userReply } = parsed.data;
  const turn = await prisma.liveTurn.findUnique({ where: { id: turnId }, include: { scenario: true, session: true } });
  if (!turn) return NextResponse.json({ error: '回合不存在' }, { status: 404 });

  let payload;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: LIVE_SELLER_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `观众问题: ${turn.viewerLine}\n我的回答: ${userReply}\n请输出 JSON: corrected,naturalVersion,shortVersion,chineseExplanation,score,issueType`
        }
      ]
    });
    payload = JSON.parse(completion.choices[0]?.message?.content || '{}');
  } catch {
    payload = {
      corrected: 'Yes! We have pink, and it looks really cute.',
      naturalVersion: 'Yep, we do have pink. It is super cute in person.',
      shortVersion: 'Yes, pink is available.',
      chineseExplanation: '先直接回答有无，再补充卖点，会更像直播沟通。',
      score: 80,
      issueType: '用词不自然'
    };
  }

  await prisma.liveTurn.update({ where: { id: turnId }, data: { userReply, feedback: JSON.stringify(payload), score: payload.score ?? 80 } });

  await prisma.practiceRecord.create({
    data: {
      userId: turn.session.userId,
      scenarioId: turn.scenarioId,
      userInput: userReply,
      corrected: payload.corrected,
      naturalVersion: payload.naturalVersion,
      shortVersion: payload.shortVersion,
      chineseExplanation: payload.chineseExplanation,
      score: payload.score ?? 80,
      issueType: payload.issueType ?? '用词不自然'
    }
  });

  return NextResponse.json({ userReply, ...payload });
}
