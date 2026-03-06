import { PageTitle } from '@/components/page-title';
import { prisma } from '@/lib/prisma';

export default async function PracticePage() {
  const categories = await prisma.phraseCategory.findMany({
    include: { phrases: { take: 4, orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="space-y-4">
      <PageTitle title="直播英语句子练习" subtitle="按场景快速记住能直接开口的句子" />
      {categories.map((category) => (
        <section key={category.id} className="card space-y-3">
          <h2 className="text-lg font-semibold">{category.name}</h2>
          {category.phrases.map((phrase) => (
            <article key={phrase.id} className="rounded-xl bg-cream p-3 text-sm">
              <p><span className="font-semibold">English：</span>{phrase.english}</p>
              <p><span className="font-semibold">中文：</span>{phrase.chinese}</p>
              <p><span className="font-semibold">什么时候说：</span>{phrase.useWhen}</p>
              <p><span className="font-semibold">更自然说法：</span>{phrase.naturalVersion}</p>
              <p><span className="font-semibold">更短直播说法：</span>{phrase.shortVersion}</p>
              <p><span className="font-semibold">中文解释：</span>{phrase.explanation}</p>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
