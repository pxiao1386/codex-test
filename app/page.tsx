import Link from 'next/link';
import { PageTitle } from '@/components/page-title';
import { homeActions } from '@/lib/mock';

export default function HomePage() {
  return (
    <div className="space-y-4">
      <PageTitle title="首页" subtitle="直播英语训练助手" />

      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">今日练习</h2>
        <p className="text-sm text-coffee/80">建议流程：先练句子，再模拟提问，最后复习错误。</p>
      </section>

      <section className="grid gap-3">
        {homeActions.map((action) => (
          <Link key={action.title} href={action.href} className="card block bg-white hover:bg-blush/50">
            <p className="font-semibold">{action.title}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
