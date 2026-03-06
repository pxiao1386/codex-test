'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/page-title';

export default function RewritePage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Record<string, string> | null>(null);

  async function handleRewrite() {
    if (!input.trim()) return;
    const res = await fetch('/api/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    });
    setResult(await res.json());
  }

  return (
    <div className="space-y-4">
      <PageTitle title="帮我改句子" subtitle="输入中文或英文，马上得到直播可用版本" />
      <section className="card space-y-3">
        <textarea
          className="h-32 w-full rounded-xl border border-rose/40 p-3"
          placeholder="例如：这个化妆包很软，旅行很好带"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleRewrite} className="w-full rounded-xl bg-rose px-4 py-3 font-semibold">
          帮我改句子
        </button>
      </section>

      {result ? (
        <section className="card space-y-2 text-sm">
          <p><span className="font-semibold">修正版本：</span>{result.corrected}</p>
          <p><span className="font-semibold">更自然的美式表达：</span>{result.naturalVersion}</p>
          <p><span className="font-semibold">直播短句表达：</span>{result.shortVersion}</p>
          <p><span className="font-semibold">中文解释：</span>{result.chineseExplanation}</p>
        </section>
      ) : null}
    </div>
  );
}
