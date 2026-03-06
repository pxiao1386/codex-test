import { PageTitle } from '@/components/page-title';
import { issueTypes } from '@/lib/mock';
import { prisma } from '@/lib/prisma';

export default async function ReviewPage() {
  const records = await prisma.practiceRecord.findMany({ orderBy: { createdAt: 'desc' }, take: 30 });

  return (
    <div className="space-y-4">
      <PageTitle title="复习错误" subtitle="按问题类型集中改掉常见错误" />
      {issueTypes.map((issue) => {
        const grouped = records.filter((item) => item.issueType === issue);
        return (
          <section key={issue} className="card space-y-2">
            <h2 className="text-lg font-semibold">{issue}</h2>
            {grouped.length === 0 ? (
              <p className="text-sm text-coffee/70">暂无记录</p>
            ) : (
              grouped.map((item) => (
                <article key={item.id} className="rounded-xl bg-cream p-2 text-sm">
                  <p>原句：{item.userInput}</p>
                  <p>建议：{item.shortVersion}</p>
                </article>
              ))
            )}
          </section>
        );
      })}
    </div>
  );
}
