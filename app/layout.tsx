import type { Metadata } from 'next';
import './globals.css';
import { BottomNav } from '@/components/bottom-nav';

export const metadata: Metadata = {
  title: '直播英语训练助手',
  description: '帮助跨境直播卖家快速练习自然美式英语'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="mx-auto min-h-screen max-w-md bg-gradient-to-b from-cream to-lavender/40 pb-20">
        <main className="px-4 py-4">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
