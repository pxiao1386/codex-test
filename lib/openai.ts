import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('缺少 OPENAI_API_KEY 环境变量');
  }

  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return client;
}

export const LIVE_SELLER_SYSTEM_PROMPT = `你是“直播英语训练助手”的AI教练。
输出要求：
1. 主解释用中文，英语内容使用美式口语。
2. 口语短句适合TikTok直播，语气友好、轻松。
3. 避免书面化表达，句子短，便于口播。
4. 如果用户英文错误，给出修正版本、自然版本、直播短句版本，并解释原因。`;
