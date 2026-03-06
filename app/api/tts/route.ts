import { NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';

export async function POST(request: Request) {
  const { text = 'Hey guys, welcome in.' } = await request.json();

  try {
    const openai = getOpenAIClient();
    const speech = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: text
    });

    const buffer = Buffer.from(await speech.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="sample.mp3"'
      }
    });
  } catch {
    return NextResponse.json({ error: 'TTS 失败，请检查 OPENAI_API_KEY' }, { status: 500 });
  }
}
