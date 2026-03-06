import { NextResponse } from 'next/server';
import { z } from 'zod';
import { LIVE_SELLER_SYSTEM_PROMPT, getOpenAIClient } from '@/lib/openai';

const schema = z.object({ input: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: '请输入内容' }, { status: 400 });
  }

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: LIVE_SELLER_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `请把下面内容改成直播可用英文，可输入中文或英文：${parsed.data.input}\n输出JSON字段：corrected,naturalVersion,shortVersion,chineseExplanation`
        }
      ]
    });

    return NextResponse.json(JSON.parse(completion.choices[0]?.message?.content || '{}'));
  } catch {
    return NextResponse.json({
      corrected: 'This makeup bag is really soft and easy to carry for travel.',
      naturalVersion: 'This makeup bag feels super soft, and it is perfect for travel.',
      shortVersion: 'Soft bag. Great for travel.',
      chineseExplanation: '直播表达要先讲感受，再讲使用场景，短句更好口播。'
    });
  }
}
