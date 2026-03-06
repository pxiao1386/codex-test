'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/page-title';

type LiveStartResponse = {
  sessionId: string;
  turnId: string;
  viewerLine: string;
  chineseHint: string;
};

export default function LivePage() {
  const [turn, setTurn] = useState<LiveStartResponse | null>(null);
  const [reply, setReply] = useState('');
  const [result, setResult] = useState<Record<string, string | number> | null>(null);

  async function start() {
    const res = await fetch('/api/live/start', { method: 'POST' });
    const data = (await res.json()) as LiveStartResponse;
    setTurn(data);
    setResult(null);
  }

  async function submit() {
    if (!turn || !reply.trim()) return;
    const res = await fetch('/api/live/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turnId: turn.turnId, userReply: reply })
    });
    setResult(await res.json());
  }

  return (
    <div className="space-y-4">
      <PageTitle title="模拟直播观众提问" subtitle="AI 模拟美国观众提问，练你的即时回答" />
      <button onClick={start} className="w-full rounded-2xl bg-rose px-4 py-3 font-semibold text-coffee">
        模拟观众提问
      </button>

      {turn ? (
        <section className="card space-y-2 text-sm">
          <p><span className="font-semibold">观众提问：</span>{turn.viewerLine}</p>
          <p><span className="font-semibold">中文提示：</span>{turn.chineseHint}</p>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="请输入你的英文回答，或粘贴语音转文字结果"
            className="h-24 w-full rounded-xl border border-rose/40 p-2"
          />
          <button onClick={submit} className="w-full rounded-xl bg-coffee px-4 py-2 text-white">提交回答</button>
        </section>
      ) : null}

      {result ? (
        <section className="card space-y-2 text-sm">
          <p><span className="font-semibold">你的回答：</span>{String(result.userReply)}</p>
          <p><span className="font-semibold">更好的表达：</span>{String(result.corrected)}</p>
          <p><span className="font-semibold">更自然表达：</span>{String(result.naturalVersion)}</p>
          <p><span className="font-semibold">直播短句版本：</span>{String(result.shortVersion)}</p>
          <p><span className="font-semibold">中文解释：</span>{String(result.chineseExplanation)}</p>
          <p><span className="font-semibold">评分：</span>{String(result.score)} / 100</p>
        </section>
      ) : null}
    </div>
  );
}
